import test from "node:test";
import assert from "node:assert/strict";
import {
  validDate, parseClock, mondayOf, monthStart, monthEnd, commissionCents
} from "../cloudflare/barber.js";

test("valida datas e horários da agenda", () => {
  assert.equal(validDate("2026-11-27"), true);
  assert.equal(validDate("2026-02-30"), false);
  assert.equal(parseClock("08:45"), 525);
  assert.equal(parseClock("24:00"), null);
});

test("calcula corretamente os períodos de comissão", () => {
  assert.equal(mondayOf("2026-11-27"), "2026-11-23");
  assert.equal(monthStart("2026-11-27"), "2026-11-01");
  assert.equal(monthEnd("2026-11-27"), "2026-11-30");
});

test("calcula comissão em centavos com arredondamento monetário", () => {
  assert.equal(commissionCents(4000, 15), 600);
  assert.equal(commissionCents(1, 50), 1);
  assert.equal(commissionCents(3999, 10), 400);
});
