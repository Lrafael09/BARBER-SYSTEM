import test from "node:test";
import assert from "node:assert/strict";
import { webcrypto } from "node:crypto";
import { scrypt } from "scrypt-js";
import { hashPassword, verifyPassword, needsPasswordRehash } from "../cloudflare/passwords.js";

globalThis.crypto = webcrypto;

const encoder = new TextEncoder();
const hex = bytes => Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");

test("hash atual valida a senha e rejeita senha incorreta", async () => {
  const hash = await hashPassword("senha-segura-123");
  assert.equal(await verifyPassword(hash, "senha-segura-123"), true);
  assert.equal(await verifyPassword(hash, "senha-errada"), false);
  assert.equal(needsPasswordRehash(hash), false);
});

test("aceita hash PBKDF2 legado do Werkzeug", async () => {
  const salt = "salt-legado";
  const key = await crypto.subtle.importKey("raw", encoder.encode("senha-legada"), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash: "SHA-256", salt: encoder.encode(salt), iterations: 260000 }, key, 256);
  const legacy = "pbkdf2:sha256:260000$" + salt + "$" + hex(new Uint8Array(bits));
  assert.equal(await verifyPassword(legacy, "senha-legada"), true);
  assert.equal(needsPasswordRehash(legacy), true);
});

test("aceita hash scrypt legado do Werkzeug", async () => {
  const salt = "werkzeug-salt";
  const derived = await scrypt(encoder.encode("pin-1234"), encoder.encode(salt), 1024, 8, 1, 64);
  const legacy = "scrypt:1024:8:1$" + salt + "$" + hex(derived);
  assert.equal(await verifyPassword(legacy, "pin-1234"), true);
  assert.equal(await verifyPassword(legacy, "pin-0000"), false);
  assert.equal(needsPasswordRehash(legacy), true);
});
