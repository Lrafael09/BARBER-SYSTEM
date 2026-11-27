import scryptJs from "scrypt-js";

const { scrypt } = scryptJs;

const encoder = new TextEncoder();
const CURRENT_ITERATIONS = 310000;

function toHex(bytes) {
  return Array.from(bytes, value => value.toString(16).padStart(2, "0")).join("");
}

function fromHex(value) {
  if (typeof value !== "string" || value.length % 2 !== 0 || !/^[0-9a-f]+$/i.test(value)) {
    throw new Error("Hash hexadecimal inválido.");
  }
  return new Uint8Array(value.match(/.{2}/g).map(part => parseInt(part, 16)));
}

function safeEqual(left, right) {
  if (left.length !== right.length) return false;
  let difference = 0;
  for (let i = 0; i < left.length; i++) difference |= left[i] ^ right[i];
  return difference === 0;
}

async function pbkdf2(password, salt, iterations, length, hash = "SHA-256") {
  const key = await crypto.subtle.importKey("raw", encoder.encode(password), "PBKDF2", false, ["deriveBits"]);
  const bits = await crypto.subtle.deriveBits({ name: "PBKDF2", hash, salt, iterations }, key, length * 8);
  return new Uint8Array(bits);
}

export async function hashPassword(password) {
  if (typeof password !== "string" || !password) throw new Error("A senha não pode ser vazia.");
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const derived = await pbkdf2(password, salt, CURRENT_ITERATIONS, 32);
  return "pbkdf2_sha256$" + CURRENT_ITERATIONS + "$" + toHex(salt) + "$" + toHex(derived);
}

export async function verifyPassword(stored, password) {
  if (typeof stored !== "string" || typeof password !== "string" || !password) return false;
  try {
    const parts = stored.split("$");
    if (parts[0] === "pbkdf2_sha256" && parts.length === 4) {
      const iterations = Number(parts[1]);
      const salt = fromHex(parts[2]);
      const expected = fromHex(parts[3]);
      if (!Number.isSafeInteger(iterations) || iterations < 1 || iterations > 2000000 || expected.length < 16) return false;
      return safeEqual(await pbkdf2(password, salt, iterations, expected.length), expected);
    }

    // Formatos usados por werkzeug.security.generate_password_hash.
    if (parts.length === 3 && parts[0].startsWith("pbkdf2:")) {
      const [, digest, iterationText] = parts[0].split(":");
      const iterations = Number(iterationText);
      const algorithms = { sha256: "SHA-256", sha1: "SHA-1" };
      const algorithm = algorithms[digest];
      if (!algorithm || !Number.isSafeInteger(iterations) || iterations < 1 || iterations > 2000000) return false;
      const expected = fromHex(parts[2]);
      return safeEqual(await pbkdf2(password, encoder.encode(parts[1]), iterations, expected.length, algorithm), expected);
    }

    if (parts.length === 3 && parts[0].startsWith("scrypt:")) {
      const [, nText, rText, pText] = parts[0].split(":");
      const N = Number(nText), r = Number(rText), p = Number(pText);
      if (!Number.isSafeInteger(N) || N < 2 || (N & (N - 1)) !== 0 ||
          !Number.isSafeInteger(r) || r < 1 || r > 32 ||
          !Number.isSafeInteger(p) || p < 1 || p > 16 ||
          N > 131072) return false;
      const expected = fromHex(parts[2]);
      const derived = await scrypt(encoder.encode(password), encoder.encode(parts[1]), N, r, p, expected.length);
      return safeEqual(derived, expected);
    }
  } catch (_) {
    return false;
  }
  return false;
}

export function needsPasswordRehash(stored) {
  return typeof stored !== "string" || !stored.startsWith("pbkdf2_sha256$" + CURRENT_ITERATIONS + "$");
}
