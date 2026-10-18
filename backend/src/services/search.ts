import { createHash } from "node:crypto";
import { db } from "../database/index.js";
import { safeUrl, scrape } from "./scrape.js";
import { matches } from "./matching.js";
import { userPlan } from "./plans.js";
import { sendPending } from "./notify.js";
import { evaluateTemporal, defaultTemporal } from "./temporal.js";
export function queryFor(terms: string[], mode: string, excludes: string[]) {
  const quote = (value: string) => '"' + value.replace(/["\\]/g, " ") + '"';
  const q = terms.map(quote);
  return (
    (mode === "ALL" ? q.join(" ") : "(" + q.join(" OR ") + ")") +
    " " +
    excludes.map((x) => "-" + quote(x)).join(" ")
  )
    .trim()
    .slice(0, 450);
}
export async function searchWeb(q: string) {
  const provider = process.env.SEARCH_PROVIDER || "google";
  let url: URL;
  let headers: Record<string, string> = {};
  if (provider === "google") {
    if (
      !process.env.GOOGLE_SEARCH_API_KEY ||
      !process.env.GOOGLE_SEARCH_ENGINE_ID
    )
      throw Error("Credenciais Google ausentes");
    url = new URL("https://www.googleapis.com/customsearch/v1");
    url.searchParams.set("key", process.env.GOOGLE_SEARCH_API_KEY);
    url.searchParams.set("cx", process.env.GOOGLE_SEARCH_ENGINE_ID);
    url.searchParams.set("q", q);
    url.searchParams.set("num", "10");
  } else if (provider === "brave") {
    if (!process.env.BRAVE_SEARCH_API_KEY)
      throw Error("Credencial Brave ausente");
    url = new URL("https://api.search.brave.com/res/v1/web/search");
    url.searchParams.set("q", q);
    url.searchParams.set("count", "10");
    headers = { "X-Subscription-Token": process.env.BRAVE_SEARCH_API_KEY };
  } else throw Error("Provedor inválido");
  const r = await fetch(url, { headers, signal: AbortSignal.timeout(12000) });
  if (!r.ok) throw Error("Busca HTTP " + r.status);
  const j: any = await r.json();
  return (
    provider === "google"
      ? (j.items || []).map((x: any) => ({ url: x.link, title: x.title }))
      : (j.web?.results || []).map((x: any) => ({ url: x.url, title: x.title }))
  ) as { url: string; title: string }[];
}
export async function runSearch(
  options: {
    now?: Date;
    search?: typeof searchWeb;
    scrapePage?: typeof scrape;
    deliver?: typeof sendPending;
    monitorIds?: string[];
  } = {},
) {
  const now = options.now ?? new Date();
  const entries = await db.discoveryQuery.findMany({
    where: {
      monitor: {
        status: "ACTIVE",
        nextCheckAt: { lte: now },
        ...(options.monitorIds ? { id: { in: options.monitorIds } } : {}),
      },
    },
    include: { monitor: { include: { temporal: true } } },
    take: 20,
  });
  let checked = 0,
    found = 0;
  for (const entry of entries) {
    const m = entry.monitor;
    const plan = await userPlan(m.userId);
    const claim = await db.monitor.updateMany({
      where: { id: m.id, nextCheckAt: { lte: now } },
      data: {
        nextCheckAt: new Date(
          now.getTime() + Math.max(60, plan.intervalMinutes) * 60000,
        ),
      },
    });
    if (!claim.count) continue;
    try {
      const hits = await (options.search ?? searchWeb)(entry.query);
      checked++;
      for (const hit of hits) {
        try {
          await safeUrl(hit.url);
          const hash = createHash("sha256")
            .update(hit.url.split("#")[0])
            .digest("hex");
          const existing = await db.discoveredResult.findUnique({
            where: { monitorId_urlHash: { monitorId: m.id, urlHash: hash } },
          });
          if (existing) continue;
          const remember = () =>
            db.discoveredResult.createMany({
              data: [
                {
                  monitorId: m.id,
                  url: hit.url,
                  urlHash: hash,
                  title: hit.title,
                },
              ],
              skipDuplicates: true,
            });
          const prefs = m.temporal ?? defaultTemporal;
          if (!entry.lastRunAt && prefs.onlyNew) {
            await remember();
            continue;
          }
          const page = await (options.scrapePage ?? scrape)(hit.url);
          if (!matches(page.text, m.keywords, m.excludeKeywords, m.matchMode)) {
            await remember();
            continue;
          }
          const temporal = evaluateTemporal(
            page.dates,
            now,
            m.temporal ?? defaultTemporal,
            now,
          );
          if (!temporal.eligible) {
            await remember();
            continue;
          }
          const recent = await db.notification.findFirst({
            where: { userId: m.userId, detection: { monitorId: m.id } },
            orderBy: { createdAt: "desc" },
          });
          if (
            recent &&
            now.getTime() - recent.createdAt.getTime() <
              plan.cooldownMinutes * 60000
          )
            continue;
          const source = await db.source.upsert({
            where: { monitorId_url: { monitorId: m.id, url: hit.url } },
            create: { monitorId: m.id, url: hit.url },
            update: {},
          });
          const detection = await db.detection.upsert({
            where: {
              monitorId_fingerprint: { monitorId: m.id, fingerprint: hash },
            },
            create: {
              monitorId: m.id,
              sourceId: source.id,
              fingerprint: hash,
              title: page.title,
              snippet: page.text.slice(0, 500),
              url: hit.url,
              publishedAt: page.dates.publishedAt,
              sourceUpdatedAt: page.dates.sourceUpdatedAt,
              dateConfidence: page.dates.confidence,
              eventType: "NEW",
            },
            update: {},
          });
          await db.notification.upsert({
            where: {
              userId_detectionId: {
                userId: m.userId,
                detectionId: detection.id,
              },
            },
            create: { userId: m.userId, detectionId: detection.id },
            update: {},
          });
          await remember();
          found++;
        } catch (e) {
          console.warn("Resultado ignorado", String(e).slice(0, 200));
        }
      }
      await db.discoveryQuery.update({
        where: { id: entry.id },
        data: { lastRunAt: now, lastError: null },
      });
    } catch (e) {
      await db.discoveryQuery.update({
        where: { id: entry.id },
        data: { lastError: String(e).slice(0, 500) },
      });
    }
  }
  await (options.deliver ?? sendPending)();
  return { checked, found };
}
