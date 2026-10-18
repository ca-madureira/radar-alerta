import { createHash } from "node:crypto";
import { db } from "../database/index.js";
import { matches, changedMatchingText } from "./matching.js";
import { scrape } from "./scrape.js";
import { userPlan } from "./plans.js";
import { sendPending } from "./notify.js";
import { evaluateTemporal, defaultTemporal } from "./temporal.js";
export async function runWorker(
  options: {
    now?: Date;
    scrapePage?: typeof scrape;
    deliver?: typeof sendPending;
    monitorIds?: string[];
  } = {},
) {
  const now = options.now ?? new Date();
  const monitors = await db.monitor.findMany({
    where: {
      status: "ACTIVE",
      discovery: null,
      nextCheckAt: { lte: now },
      ...(options.monitorIds ? { id: { in: options.monitorIds } } : {}),
    },
    include: { sources: true, temporal: true },
    orderBy: { nextCheckAt: "asc" },
    take: 50,
  });
  let checked = 0,
    found = 0;
  for (const monitor of monitors) {
    const plan = await userPlan(monitor.userId);
    const claimed = await db.monitor.updateMany({
      where: { id: monitor.id, nextCheckAt: { lte: now } },
      data: {
        nextCheckAt: new Date(now.getTime() + plan.intervalMinutes * 60000),
        lastCheckedAt: now,
      },
    });
    if (!claimed.count) continue;
    for (const source of monitor.sources) {
      try {
        const page = await (options.scrapePage ?? scrape)(source.url);
        const previous = source.lastText || "";
        await db.source.update({
          where: { id: source.id },
          data: {
            lastText: page.text,
            lastHash: page.hash,
            lastError: null,
            checkedAt: new Date(),
          },
        });
        checked++;
        const prefs = monitor.temporal ?? defaultTemporal;
        const initial = !source.lastHash;
        if ((initial && prefs.onlyNew) || source.lastHash === page.hash)
          continue;
        if (!initial && !prefs.notifyUpdates) continue;
        const temporal = evaluateTemporal(page.dates, now, prefs, now);
        if (!temporal.eligible) continue;
        const changed = changedMatchingText(
          page.text,
          previous,
          monitor.keywords,
        );
        if (
          !changed ||
          !matches(
            page.text,
            monitor.keywords,
            monitor.excludeKeywords,
            monitor.matchMode,
          )
        )
          continue;
        const fp = createHash("sha256")
          .update(source.id + ":" + page.hash)
          .digest("hex");
        const last = await db.notification.findFirst({
          where: {
            userId: monitor.userId,
            detection: { monitorId: monitor.id },
          },
          orderBy: { createdAt: "desc" },
        });
        if (
          last &&
          now.getTime() - last.createdAt.getTime() <
            plan.cooldownMinutes * 60000
        )
          continue;
        const detection = await db.detection.upsert({
          where: {
            monitorId_fingerprint: { monitorId: monitor.id, fingerprint: fp },
          },
          create: {
            monitorId: monitor.id,
            sourceId: source.id,
            fingerprint: fp,
            title: page.title,
            snippet: changed.slice(0, 500),
            url: page.url,
            publishedAt: page.dates.publishedAt,
            sourceUpdatedAt: page.dates.sourceUpdatedAt,
            dateConfidence: page.dates.confidence,
            eventType: initial ? "NEW" : "UPDATED",
          },
          update: {},
        });
        await db.notification.upsert({
          where: {
            userId_detectionId: {
              userId: monitor.userId,
              detectionId: detection.id,
            },
          },
          create: { userId: monitor.userId, detectionId: detection.id },
          update: {},
        });
        found++;
      } catch (e) {
        await db.source.update({
          where: { id: source.id },
          data: { lastError: String(e).slice(0, 500), checkedAt: new Date() },
        });
        console.error("Erro ao verificar fonte", source.id, e);
      }
    }
  }
  await (options.deliver ?? sendPending)();
  return { monitors: monitors.length, checked, found };
}
