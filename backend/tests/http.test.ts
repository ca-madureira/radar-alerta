import { test } from "node:test";
import { strict as assert } from "node:assert";
import type { APIGatewayProxyEventV2 } from "aws-lambda";
import { z } from "zod";
import { publicHandler, authenticatedHandler } from "../src/middleware/http.js";
import { parseBody, response, bad } from "../src/utils/http.js";
import configuration from "../serverless.js";
import { updateMonitorSchema } from "../src/schemas/monitors/index.js";

function event(body = "{}", method = "POST"): APIGatewayProxyEventV2 {
  return {
    body,
    headers: {},
    isBase64Encoded: false,
    requestContext: { http: { method } },
  } as APIGatewayProxyEventV2;
}
test("parses regular and base64 JSON bodies identically", () => {
  const plain = event('{"name":"edital"}');
  const encoded = {
    ...plain,
    body: Buffer.from(plain.body!).toString("base64"),
    isBase64Encoded: true,
  };
  assert.deepEqual(parseBody(plain), parseBody(encoded));
});
test("returns 400 for malformed JSON and schema violations", async () => {
  const handler = publicHandler(async (e) =>
    response(200, z.object({ name: z.string() }).parse(parseBody(e))),
  );
  assert.equal((await handler(event("{"))).statusCode, 400);
  const invalid = await handler(event("{}"));
  assert.equal(invalid.statusCode, 400);
  assert.equal(JSON.parse(invalid.body!).error, "Dados inválidos");
});
test("does not execute protected operations without a bearer token", async () => {
  let calls = 0;
  const handler = authenticatedHandler(async () => {
    calls++;
    return response(200, {});
  });
  assert.equal((await handler(event())).statusCode, 401);
  assert.equal(calls, 0);
  assert.equal((await handler(event("{}", "OPTIONS"))).statusCode, 204);
  assert.equal(calls, 0);
});
test("keeps explicit application error status", async () => {
  const handler = publicHandler(async () => {
    throw bad("Acesso negado", 403);
  });
  const result = await handler(event());
  assert.equal(result.statusCode, 403);
  assert.equal(JSON.parse(result.body!).error, "Acesso negado");
});
test("partial monitor updates do not reset unspecified preferences", () => {
  assert.deepEqual(updateMonitorSchema.parse({ status: "PAUSED" }), {
    status: "PAUSED",
  });
  assert.deepEqual(
    updateMonitorSchema.parse({ temporal: { notifyUpdates: false } }),
    { temporal: { notifyUpdates: false } },
  );
  assert.equal(
    updateMonitorSchema.safeParse({ keywords: ["  "] }).success,
    false,
  );
});
test("registers every existing HTTP contract exactly once", () => {
  const routes = Object.values(configuration.functions)
    .flatMap<{ httpApi?: { method: string; path: string }; schedule?: string }>(
      (fn) => fn.events,
    )
    .filter(
      (e): e is { httpApi: { method: string; path: string } } => "httpApi" in e,
    )
    .map((e) => `${e.httpApi.method} ${e.httpApi.path}`);
  assert.equal(new Set(routes).size, routes.length);
  for (const route of [
    "GET /health",
    "GET /catalog",
    "GET /monitors",
    "POST /monitors",
    "PATCH /monitors/{id}",
    "DELETE /monitors/{id}",
    "GET /notifications",
    "POST /devices",
    "POST /feedback",
    "GET /me/impact",
    "GET /me/plan",
    "POST /admin/plan",
  ])
    assert.ok(routes.includes(route), route);
  assert.deepEqual(configuration.functions.cron.events, [
    { schedule: "rate(15 minutes)" },
  ]);
  assert.deepEqual(configuration.functions.search.events, [
    { schedule: "rate(1 hour)" },
  ]);
});
test("all configured Lambda handlers resolve to callable exports", async () => {
  for (const fn of Object.values(configuration.functions)) {
    const separator = fn.handler.lastIndexOf(".");
    const file = fn.handler.slice(0, separator);
    const name = fn.handler.slice(separator + 1);
    const module = await import(new URL(`../${file}.ts`, import.meta.url).href);
    assert.equal(typeof module[name], "function", fn.handler);
  }
});
