import { load } from "cheerio";
export type DateBasis = "PUBLISHED" | "UPDATED" | "DISCOVERED";
export type TemporalSettings = {
  dateBasis: DateBasis;
  lookbackDays: number;
  since: Date | null;
  onlyNew: boolean;
  notifyUpdates: boolean;
  requireVerifiedDate: boolean;
};
export type PageDates = {
  publishedAt: Date | null;
  sourceUpdatedAt: Date | null;
  confidence: "STRUCTURED" | "META" | "UNKNOWN";
};
function parseDate(value: unknown): Date | null {
  if (typeof value !== "string" || value.length > 100) return null;
  const v = value.trim();
  // Only ISO-style dates are accepted. Ambiguous local dates are not guessed.
  if (
    !/^\d{4}-\d{2}-\d{2}(?:[Tt ]\d{2}:\d{2}(?::\d{2}(?:\.\d+)?)?(?:Z|[+-]\d{2}:?\d{2})?)?$/.test(
      v,
    )
  )
    return null;
  const d = new Date(v);
  const [year, month, day] = v.slice(0, 10).split("-").map(Number);
  const calendar = new Date(Date.UTC(year, month - 1, day));
  if (
    calendar.getUTCFullYear() !== year ||
    calendar.getUTCMonth() !== month - 1 ||
    calendar.getUTCDate() !== day
  )
    return null;
  return Number.isNaN(d.getTime()) ? null : d;
}
export function extractPageDates(html: string): PageDates {
  const $ = load(html);
  let publishedAt: Date | null = null,
    sourceUpdatedAt: Date | null = null,
    confidence: PageDates["confidence"] = "UNKNOWN";
  const meta = (names: string[]) => {
    for (const n of names) {
      const el = $(
        'meta[property="' +
          n +
          '"],meta[name="' +
          n +
          '"],meta[itemprop="' +
          n +
          '"]',
      );
      const date = parseDate(el.first().attr("content"));
      if (date) return date;
    }
    return null;
  };
  publishedAt = meta([
    "article:published_time",
    "datePublished",
    "pubdate",
    "date",
    "citation_publication_date",
  ]);
  sourceUpdatedAt = meta([
    "article:modified_time",
    "dateModified",
    "last-modified",
  ]);
  if (publishedAt || sourceUpdatedAt) confidence = "META";
  for (const el of $('script[type="application/ld+json"]')
    .toArray()
    .slice(0, 20)) {
    try {
      const json = JSON.parse($(el).html() || "null");
      const stack: unknown[] = [json];
      let steps = 0;
      while (stack.length && steps++ < 100) {
        const node = stack.pop();
        if (Array.isArray(node)) {
          stack.push(...node.slice(0, 30));
          continue;
        }
        if (!node || typeof node !== "object") continue;
        const obj = node as Record<string, unknown>;
        const types = Array.isArray(obj["@type"])
          ? obj["@type"]
          : [obj["@type"]];
        const article = types.some(
          (t) =>
            typeof t === "string" &&
            /(Article|NewsArticle|BlogPosting|WebPage|Report|CreativeWork)/.test(
              t,
            ),
        );
        if (!article) {
          if (obj["@graph"]) stack.push(obj["@graph"]);
          continue;
        }
        if (!publishedAt) {
          const date = parseDate(obj.datePublished);
          if (date) {
            publishedAt = date;
            confidence = "STRUCTURED";
          }
        }
        if (!sourceUpdatedAt) {
          const date = parseDate(obj.dateModified);
          if (date) {
            sourceUpdatedAt = date;
            confidence = "STRUCTURED";
          }
        }
        if (obj["@graph"]) stack.push(obj["@graph"]);
      }
    } catch {
      /* malformed structured data is ignored */
    }
  }
  return { publishedAt, sourceUpdatedAt, confidence };
}
export function evaluateTemporal(
  dates: PageDates,
  firstSeenAt: Date,
  settings: Omit<TemporalSettings, "dateBasis"> & { dateBasis: string },
  now = new Date(),
) {
  if (!["PUBLISHED", "UPDATED", "DISCOVERED"].includes(settings.dateBasis))
    return { eligible: false, reason: "BASE_DE_DATA_INVALIDA", date: null };
  const threshold =
    settings.since ??
    (settings.lookbackDays === 0
      ? null
      : new Date(now.getTime() - settings.lookbackDays * 86400000));
  const value =
    settings.dateBasis === "PUBLISHED"
      ? dates.publishedAt
      : settings.dateBasis === "UPDATED"
        ? dates.sourceUpdatedAt
        : firstSeenAt;
  const verified = settings.dateBasis === "DISCOVERED" || value !== null;
  if (settings.requireVerifiedDate && !verified)
    return { eligible: false, reason: "DATA_NAO_VERIFICADA", date: value };
  if (value && value.getTime() > now.getTime() + 86400000)
    return { eligible: false, reason: "DATA_FUTURA_INVALIDA", date: value };
  if (threshold && value && value < threshold)
    return { eligible: false, reason: "FORA_DO_PERIODO", date: value };
  if (threshold && !value)
    return { eligible: false, reason: "SEM_DATA_PARA_FILTRAR", date: null };
  return { eligible: true, reason: "OK", date: value };
}
export const defaultTemporal: TemporalSettings = {
  dateBasis: "PUBLISHED",
  lookbackDays: 7,
  since: null,
  onlyNew: true,
  notifyUpdates: true,
  requireVerifiedDate: true,
};
