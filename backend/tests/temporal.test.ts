import { test } from "node:test";
import { strict as assert } from "node:assert";
import {
  extractPageDates,
  evaluateTemporal,
  defaultTemporal,
} from "../src/services/temporal.js";
const now = new Date("2026-10-11T12:00:00Z");
test("rejects impossible calendar dates", () => {
  const dates = extractPageDates(
    '<meta property="article:published_time" content="2026-02-30">',
  );
  assert.equal(dates.publishedAt, null);
});
test("extracts publication and modification dates from metadata", () => {
  const dates = extractPageDates(
    '<meta property="article:published_time" content="2026-10-10T09:00:00Z"><meta property="article:modified_time" content="2026-10-11T09:00:00Z">',
  );
  assert.equal(dates.publishedAt?.toISOString(), "2026-10-10T09:00:00.000Z");
  assert.equal(
    dates.sourceUpdatedAt?.toISOString(),
    "2026-10-11T09:00:00.000Z",
  );
});
test("rejects old publication", () => {
  const d = extractPageDates(
    '<meta property="article:published_time" content="2024-01-01">',
  );
  assert.equal(
    evaluateTemporal(d, now, defaultTemporal, now).reason,
    "FORA_DO_PERIODO",
  );
});
test("rejects unknown date by default", () => {
  const d = extractPageDates("<html><body>Texto sem data</body></html>");
  assert.equal(
    evaluateTemporal(d, now, defaultTemporal, now).reason,
    "DATA_NAO_VERIFICADA",
  );
});
test("discovery date is not mislabelled as publication", () => {
  const d = extractPageDates("<html></html>");
  assert.equal(
    evaluateTemporal(
      d,
      now,
      { ...defaultTemporal, dateBasis: "DISCOVERED" },
      now,
    ).eligible,
    true,
  );
  assert.equal(d.publishedAt, null);
});
test("updated date can qualify even when publication is old", () => {
  const d = extractPageDates(
    '<meta property="article:published_time" content="2020-01-01"><meta property="article:modified_time" content="2026-10-10">',
  );
  assert.equal(
    evaluateTemporal(d, now, { ...defaultTemporal, dateBasis: "UPDATED" }, now)
      .eligible,
    true,
  );
});
