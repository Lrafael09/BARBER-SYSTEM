# Barber System — Cloudflare migration

This branch is the isolated Cloudflare migration. The original Flask application remains on `main`.

## Current foundation
- D1 schema is in `cloudflare/schema.sql`.
- Worker entrypoint is `cloudflare/worker.js`.
- Password verification is in `cloudflare/passwords.js`.
- D1 binding is configured in `wrangler.toml`.
- Static assets will be served from `public/`.

## Authentication migration — first phase
- Owner registration and email/password login remain available through `/api/auth/*`.
- Barber PIN login is available at `POST /api/auth/barber/login` with `slug`, `barber_id` and `pin`.
- Barber session checks and logout are available at `GET /api/auth/barber/me` and `POST /api/auth/barber/logout`.
- Werkzeug legacy `scrypt` and `pbkdf2:sha256` / `pbkdf2:sha1` hashes are verified. After a successful login, legacy hashes are upgraded to the current PBKDF2 format.
- PIN attempts are tracked per shop, professional and client IP; five failures trigger a 15-minute lock.
- The session cookie is HttpOnly, Secure and SameSite=Lax.

This phase is backend-only. The existing Flask HTML pages still call Flask endpoints and must be connected to the Cloudflare API in the later interface phase.

## Remaining migration
Public booking, availability, cancellations, staff/admin APIs, financial operations and HTML integration must be migrated and tested before this branch can replace the existing application.

## Local development
1. Install Node.js LTS.
2. Run `npm install`.
3. Apply `cloudflare/schema.sql` and `cloudflare/auth-sessions.sql` to the D1 database.
4. Run `npx wrangler login`.
5. Run `npm test`.
6. Run `npm run dev`.

Do not add production passwords or secrets to this repository.
