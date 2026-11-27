import test from "node:test";
import assert from "node:assert/strict";
import { parseMoneyCents, financePeriod } from "../cloudflare/admin.js";

test("converte reais em centavos sem erro de ponto flutuante", () => {
  assert.equal(parseMoneyCents("123,45"), 12345);
  assert.equal(parseMoneyCents("40"), 4000);
  assert.equal(parseMoneyCents("0,09"), 9);
  assert.throws(() => parseMoneyCents("-1"), /valor válido/);
  assert.throws(() => parseMoneyCents("12,345"), /valor válido/);
});

test("calcula períodos financeiros diários, semanais, mensais e anuais", () => {
  assert.deepEqual(financePeriod("today", "2026-11-27"), {
    start: "2026-11-27", end: "2026-11-27"
  });
  assert.deepEqual(financePeriod("week", "2026-11-27"), {
    start: "2026-11-23", end: "2026-11-27"
  });
  assert.deepEqual(financePeriod("month", "2026-11-27"), {
    start: "2026-11-01", end: "2026-11-27"
  });
  assert.deepEqual(financePeriod("year", "2026-11-27"), {
    start: "2026-01-01", end: "2026-11-27"
  });
  assert.throws(() => financePeriod("invalid", "2026-11-27"), /Período inválido/);
});
