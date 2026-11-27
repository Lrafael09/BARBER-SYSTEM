import test from "node:test";
import assert from "node:assert/strict";
import { normalizePhone, maskCustomerName, parseDate, parseClock, saoPauloDateTime } from "../cloudflare/public.js";

test("normaliza telefone mantendo apenas dígitos", () => {
  assert.equal(normalizePhone("(11) 98765-4321"), "11987654321");
  assert.equal(normalizePhone("+55 11 98765-4321"), "5511987654321");
});

test("mascara nomes para exibição de cadastro existente", () => {
  assert.equal(maskCustomerName("Lucas Rafael"), "Lu*** Ra****");
  assert.equal(maskCustomerName("Jo"), "J*");
});

test("interpreta data com segunda-feira como dia zero e rejeita datas inválidas", () => {
  assert.deepEqual(parseDate("2026-11-23"), { value: "2026-11-23", weekday: 0 });
  assert.equal(parseDate("2026-02-30"), null);
  assert.equal(parseDate("23/11/2026"), null);
});

test("converte horários e rejeita formatos inválidos", () => {
  assert.equal(parseClock("09:30"), 570);
  assert.equal(parseClock("18:00"), 1080);
  assert.equal(parseClock("24:00"), null);
  assert.equal(parseClock("9:30"), null);
});

test("calcula data e horário no fuso de Brasília, não no UTC", () => {
  assert.deepEqual(saoPauloDateTime(new Date("2026-11-27T15:00:00.000Z")), {
    date: "2026-11-27", time: "12:00", minutes: 720
  });
});
