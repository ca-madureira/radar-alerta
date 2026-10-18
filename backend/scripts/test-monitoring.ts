import "dotenv/config";
import { randomUUID } from "node:crypto";
import { strict as assert } from "node:assert";
import { db } from "../src/database/index.js";
import { runWorker } from "../src/services/worker.js";
import { runSearch } from "../src/services/search.js";
import { parsePage } from "../src/services/scrape.js";

// Integration test against the configured development DB. Only this random
// user's records are processed; notifications never go to the Expo service.
const userId = randomUUID();
const planId = `test-${randomUUID()}`;
const url = "https://example.com/radar-controlled-edital";
const now = new Date();
let time = now;
let text = "Desenvolvimento web: turma anterior encerrada";
let fail = false;
const scrapePage = async () => {
  if (fail) throw new Error("Controlled collection failure");
  return parsePage(
    `<html><head><title>TESTE — edital fictício</title></head><body><main>${text
      .split("\n")
      .map((t) => `<p>${t}</p>`)
      .join("")}</main></body></html>`,
    url,
  );
};
const deliver = async () => {};
const temporal = {
  dateBasis: "DISCOVERED",
  lookbackDays: 0,
  onlyNew: true,
  notifyUpdates: true,
  requireVerifiedDate: true,
};
let monitorId = "";
let discoveryId = "";
async function worker() {
  await db.monitor.update({
    where: { id: monitorId },
    data: { nextCheckAt: time },
  });
  return runWorker({ now: time, monitorIds: [monitorId], scrapePage, deliver });
}
async function search() {
  await db.monitor.update({
    where: { id: discoveryId },
    data: { nextCheckAt: time },
  });
  return runSearch({
    now: time,
    monitorIds: [discoveryId],
    scrapePage,
    deliver,
    search: async () => [
      {
        url: url + (text.includes("2028") ? "-new" : ""),
        title: "Controlled test",
      },
    ],
  });
}
try {
  await db.plan.create({
    data: {
      id: planId,
      name: "Integration test",
      intervalMinutes: 15,
      maxMonitors: 10,
      maxSourcesPerMonitor: 1,
      cooldownMinutes: 60,
    },
  });
  await db.userPlan.create({ data: { userId, planId } });
  const monitor = await db.monitor.create({
    data: {
      userId,
      name: "TESTE — edital fictício",
      keywords: ["desenvolvimento web"],
      sources: { create: { url } },
      temporal: { create: temporal },
    },
  });
  monitorId = monitor.id;
  assert.equal((await worker()).found, 0);
  assert.ok(
    (await db.source.findFirstOrThrow({ where: { monitorId } })).lastHash,
  );
  console.log("PASS: baseline persisted without old alerts");
  text += "\nDesenvolvimento web: inscrições gratuitas EaD abertas para 2027";
  assert.equal((await worker()).found, 1);
  const notice = await db.notification.findFirstOrThrow({
    where: { userId },
    include: { detection: true },
  });
  assert.equal(notice.status, "PENDING");
  assert.match(notice.detection.snippet, /2027/);
  assert.equal((await worker()).found, 0);
  console.log(
    "PASS: repeated keyword creates a detection, notification persisted, unchanged page deduplicated",
  );
  text += "\nDesenvolvimento web: prorrogação das inscrições";
  assert.equal((await worker()).found, 0);
  console.log("PASS: cooldown suppresses repeated alerts");
  time = new Date(now.getTime() + 61 * 60000);
  fail = true;
  await worker();
  assert.match(
    (await db.source.findFirstOrThrow({ where: { monitorId } })).lastError ??
      "",
    /Controlled/,
  );
  fail = false;
  text += "\nDesenvolvimento web: edital complementar 2028";
  assert.equal((await worker()).found, 1);
  assert.equal(
    (await db.source.findFirstOrThrow({ where: { monitorId } })).lastError,
    null,
  );
  console.log(
    "PASS: collection errors recorded and recovery after cooldown works",
  );
  await db.monitor.update({
    where: { id: monitorId },
    data: { status: "PAUSED" },
  });
  assert.equal((await worker()).monitors, 0);
  console.log("PASS: paused monitor not processed");
  const discovery = await db.monitor.create({
    data: {
      userId,
      name: "TESTE — discovery",
      keywords: ["desenvolvimento web"],
      discovery: { create: { query: "test" } },
      temporal: { create: temporal },
    },
  });
  discoveryId = discovery.id;
  text = "Desenvolvimento web: turma anterior";
  assert.equal((await search()).found, 0);
  text = "Desenvolvimento web: edital 2028";
  fail = true;
  assert.equal((await search()).found, 0);
  assert.equal(
    await db.discoveredResult.count({ where: { monitorId: discoveryId } }),
    1,
  );
  fail = false;
  assert.equal((await search()).found, 1);
  assert.equal((await search()).found, 0);
  console.log(
    "PASS: search baseline, retry after fetch failure and deduplication",
  );
  console.log("All controlled integration checks passed. No push sent.");
} finally {
  // Scope cleanup to this test run. Preserve all real user data.
  await db.discoveredResult.deleteMany({
    where: { monitorId: { in: [monitorId, discoveryId].filter(Boolean) } },
  });
  await db.monitor.deleteMany({ where: { userId } });
  await db.userPlan.deleteMany({ where: { userId } });
  await db.plan.deleteMany({ where: { id: planId } });
  await db.$disconnect();
}
