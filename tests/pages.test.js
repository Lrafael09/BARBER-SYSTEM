import test from "node:test";
import assert from "node:assert/strict";
import { ADMIN_PAGE, BARBER_PAGE, BOOKING_PAGE } from "../cloudflare/pages.js";

test("painel administrativo é estático e usa a API do Worker", () => {
  assert.match(ADMIN_PAGE, /fetch\('\/api'\+path/);
  assert.match(ADMIN_PAGE, /\/admin\/finance\/config/);
  assert.match(ADMIN_PAGE, /\/admin\/appointments/);
  assert.match(ADMIN_PAGE, /Adicionar à fila/);
  assert.match(ADMIN_PAGE, /walk_in/);
  assert.match(ADMIN_PAGE, /Presença da equipe/);
  assert.match(ADMIN_PAGE, /attendance-list/);
  assert.doesNotMatch(ADMIN_PAGE, /\{\{|\{%/);
});

test("área do profissional usa login PIN e endpoints Cloudflare", () => {
  assert.match(BARBER_PAGE, /\/auth\/barber\/login/);
  assert.match(BARBER_PAGE, /\/barber\/shops\//);
  assert.match(BARBER_PAGE, /attendance-arrival/);
  assert.match(BARBER_PAGE, /attendance-departure/);
  assert.match(BARBER_PAGE, /Registre sua chegada para aparecer como disponível hoje/);
  assert.match(BARBER_PAGE, /\/api'\+path/);
  assert.doesNotMatch(BARBER_PAGE, /\{\{|\{%/);
});

test("agendamento público resolve a barbearia pela URL e usa a API pública", () => {
  assert.match(BOOKING_PAGE, /\/api\/public\/shops\//);
  assert.match(BOOKING_PAGE, /location\.pathname/);
  assert.match(BOOKING_PAGE, /\/customers\/lookup/);
  assert.match(BOOKING_PAGE, /\/availability\?/);
  assert.match(BOOKING_PAGE, /ordem de chegada/);
  assert.match(BOOKING_PAGE, /isSaturdaySelected/);
  assert.match(BOOKING_PAGE, /attendance_required_for_today/);
  assert.match(BOOKING_PAGE, /Nenhum barbeiro está disponível para hoje ainda/);
  assert.doesNotMatch(BOOKING_PAGE, /\{\{|\{%/);
});
