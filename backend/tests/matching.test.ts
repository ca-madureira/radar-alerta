import { test } from "node:test";
import { strict as assert } from "node:assert";
import { matches } from "../src/services/matching.js";
test("ignora acentos e caixa", () =>
  assert.equal(matches("INSCRIÇÕES ABERTAS", ["inscricoes"], [], "ANY"), true));
test("AND exige todos os termos", () =>
  assert.equal(
    matches("Edital publicado", ["edital", "bolsa"], [], "ALL"),
    false,
  ));
test("exclusões prevalecem", () =>
  assert.equal(
    matches("Edital encerrado", ["edital"], ["encerrado"], "ANY"),
    false,
  ));
