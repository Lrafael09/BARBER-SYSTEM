# Barber System — Cloudflare migration

This branch is the isolated Cloudflare migration. The original Flask application remains on `main`.

## Current foundation
- D1 schema is in `cloudflare/schema.sql`.
- Worker entrypoint is `cloudflare/worker.js`.
- Authentication and legacy password verification are in `cloudflare/passwords.js`.
- Public customer and booking APIs are in `cloudflare/public.js`.
- Professional agenda, commissions and service completion are in `cloudflare/barber.js`.
- Owner financial settings, daily goals and cashbook APIs are in `cloudflare/admin.js`.
- D1 binding is configured in `wrangler.toml`.
- Static assets will be served from `public/`.

## Authentication migration
- Owner registration and email/password login remain available through `/api/auth/*`.
- Barber PIN login is available at `POST /api/auth/barber/login` with `slug`, `barber_id` and `pin`.
- Barber session checks and logout are available at `GET /api/auth/barber/me` and `POST /api/auth/barber/logout`.
- Werkzeug legacy `scrypt` and `pbkdf2:sha256` / `pbkdf2:sha1` hashes are verified. After a successful login, legacy hashes are upgraded to the current PBKDF2 format.
- PIN attempts are tracked per shop, professional and client IP; five failures trigger a 15-minute lock.
- The session cookie is HttpOnly, Secure and SameSite=Lax.

## Public booking migration
All routes below use the barbershop slug:
- `GET /api/public/shops/:slug/catalog`
- `GET /api/public/shops/:slug/schedule`
- `POST /api/public/shops/:slug/customers`
- `POST /api/public/shops/:slug/customers/lookup`
- `POST /api/public/shops/:slug/customers/confirm`
- `GET /api/public/shops/:slug/availability?service_id=...&barber_id=...&date=YYYY-MM-DD`
- `POST /api/public/shops/:slug/appointments`
- `POST /api/public/shops/:slug/appointments/:id/cancel`

The public booking API checks active services and professionals, shop and individual opening hours, breaks, time blocks and existing appointments. A D1 trigger in `cloudflare/public-booking.sql` prevents overlapping appointments and time-block conflicts even if two booking requests arrive at nearly the same time.

The four last phone digits only locate possible customer records; they do not prove customer identity. Public cancellation checks the complete phone number, matching the behavior of the existing Flask app.

## Professional agenda migration
Authenticated professional endpoints:
- `GET /api/barber/me`
- `GET /api/barber/appointments` with optional `date`, `from`, `to` and `status`
- `POST /api/barber/appointments` for creating an appointment in the logged-in professional's own agenda
- `GET /api/barber/availability`
- `POST /api/barber/appointments/:id/complete` to close a service and register its revenue
- `POST /api/barber/appointments/:id/cancel`
- `PATCH /api/barber/appointments/:id/status`
- `GET /api/barber/customers` and `GET /api/barber/services`
- `GET /api/barber/schedule` and `PUT /api/barber/schedule` for individual lunch breaks
- `GET /api/barber/commissions` with daily, weekly, monthly and yearly periods
- `GET /api/barber/shops/:slug/staff` for the public professional selector before PIN login

Closing a service updates the appointment, calculates the professional's commission in cents and creates the corresponding finance entry in one D1 batch. Reopening or cancelling a completed appointment removes its linked finance entry.

This phase is backend-only. The existing Flask HTML pages still call Flask endpoints and must be connected to the Cloudflare API in the later interface phase.

## Administrator finance migration
Owner-only endpoints:
- `GET /api/admin/finance/config` and `PUT /api/admin/finance/config` for fixed costs and desired profit.
- `GET /api/admin/finance/summary?period=today|week|month|year`.
- `GET /api/admin/finance/entries?from=YYYY-MM-DD&to=YYYY-MM-DD`.
- `POST /api/admin/finance/entries` for manual income or expense entries.
- `DELETE /api/admin/finance/entries/:id` for manual entries only.
- `PUT /api/admin/finance/goals` for explicitly configured daily, weekly and monthly goals.

The summary keeps the existing business rule: monthly revenue target equals fixed costs plus desired profit; the daily target divides that amount by the number of open days in the month; the weekly target adds the daily targets for the open days in that week. Completed appointments are reconciled into the cashbook without duplicating entries.

## Remaining migration
Owner dashboard, staff and service management, shop settings, admin appointment management and the HTML interfaces still need to be migrated and tested before this branch can replace the existing application.

## Local development
1. Install Node.js LTS.
2. Run `npm install`.
3. Apply `cloudflare/schema.sql`, `cloudflare/auth-sessions.sql` and `cloudflare/public-booking.sql` to the D1 database.
4. Run `npx wrangler login`.
5. Run `npm test`.
6. Run `npm run dev`.

Do not add production passwords or secrets to this repository.
