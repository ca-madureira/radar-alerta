import type { APIGatewayProxyStructuredResultV2 } from "aws-lambda";
export const response = (
  statusCode: number,
  data: unknown,
): APIGatewayProxyStructuredResultV2 => ({
  statusCode,
  headers: {
    "content-type": "application/json; charset=utf-8",
    "access-control-allow-origin": "*",
    "access-control-allow-headers": "authorization,content-type",
    "access-control-allow-methods": "GET,POST,PATCH,DELETE,OPTIONS",
  },
  body: JSON.stringify(data),
});
export function fail(e: unknown) {
  const err = e as { status?: number; message?: string };
  const status =
    err.status && err.status >= 400 && err.status < 500 ? err.status : 500;
  if (status === 500) console.error(e);
  return response(status, {
    error: status === 500 ? "Erro interno" : err.message,
  });
}
export const bad = (message: string, status = 400) =>
  Object.assign(new Error(message), { status });

import type { APIGatewayProxyEventV2 } from "aws-lambda";
export function parseBody(e: APIGatewayProxyEventV2): unknown {
  try {
    const body = e.isBase64Encoded
      ? Buffer.from(e.body || "", "base64").toString("utf8")
      : e.body;
    return JSON.parse(body || "{}");
  } catch {
    throw bad("JSON inválido");
  }
}
