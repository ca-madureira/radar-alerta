import { test } from "node:test";
import { strict as assert } from "node:assert";
import { queryFor } from "../src/services/search.js";

test("combines ANY terms and exclusions", () => {
  assert.equal(
    queryFor(["edital", "bolsa"], "ANY", ["encerrado"]),
    '("edital" OR "bolsa") -"encerrado"',
  );
});

test("combines ALL terms without OR", () => {
  assert.equal(queryFor(["edital", "bolsa"], "ALL", []), '"edital" "bolsa"');
});

test("sanitizes quotes and backslashes in all terms", () => {
  assert.equal(queryFor(['a"b'], "ALL", ["c\\d"]), '"a b" -"c d"');
});
