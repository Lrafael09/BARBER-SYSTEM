# Barber System — Cloudflare migration

This branch is the isolated Cloudflare migration. The original Flask application remains on `main`.

## Current foundation
- D1 schema is in `cloudflare/schema.sql`.
- Worker entrypoint is `cloudflare/worker.js`.
- D1 binding is configured in `wrangler.toml`.
- Static assets will be served from `public/`.

## API implemented so far
- `GET /api/health`: checks Worker and D1 connectivity.
- `GET /api/public/shops/:slug/catalog`: reads a shop, active services and active barbers.

Other Flask routes are intentionally not exposed yet. Authentication, booking, availability, staff/admin panels, financial operations and template conversion must be migrated and tested before this branch can replace the existing application.

## Local development
1. Install Node.js LTS.
2. Run `npm install`.
3. Run `npx wrangler login`.
4. Run `npm run dev`.

Do not add production passwords or secrets to this repository.