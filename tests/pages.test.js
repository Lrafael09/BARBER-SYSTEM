import test from "node:test";
import assert from "node:assert/strict";
import { ADMIN_PAGE, BARBER_PAGE, BOOKING_PAGE } from "../cloudflare/pages.js";

test("painel administrativo é estático e usa a API do Worker", () => {
  assert.match(ADMIN_PAGE, /fetch\('\/api'\+path/);
  assert.match(ADMIN_PAGE, /\/admin\/finance\/config/);
  assert.match(ADMIN_PAGE, /\/admin\/appointments/);
  assert.doesNotMatch(ADMIN_PAGE, /\{\{|\{%/);
});

test("área do profissional usa login PIN e endpoints Cloudflare", () => {
  assert.match(BARBER_PAGE, /\/auth\/barber\/login/);
  assert.match(BARBER_PAGE, /\/barber\/shops\//);
  assert.match(BARBER_PAGE, /\/api'\+path/);
  assert.doesNotMatch(BARBER_PAGE, /\{\{|\{%/);
});

test("agendamento público resolve a barbearia pela URL e usa a API pública", () => {
  assert.match(BOOKING_PAGE, /\/api\/public\/shops\//);
  assert.match(BOOKING_PAGE, /location\.pathname/);
  assert.match(BOOKING_PAGE, /\/customers\/lookup/);
  assert.match(BOOKING_PAGE, /\/availability\?/);
  assert.doesNotMatch(BOOKING_PAGE, /\{\{|\{%/);
});
