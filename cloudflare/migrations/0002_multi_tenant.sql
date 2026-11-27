-- Multi-tenant owner account constraints: one owner per shop, unique owner email and shop WhatsApp.
CREATE UNIQUE INDEX IF NOT EXISTS idx_users_owner_email_global
    ON users (lower(email)) WHERE role = 'owner' AND email IS NOT NULL;

CREATE UNIQUE INDEX IF NOT EXISTS idx_users_one_owner_per_shop
    ON users (barbershop_id) WHERE role = 'owner';

CREATE UNIQUE INDEX IF NOT EXISTS idx_barbershops_whatsapp_global
    ON barbershops (whatsapp) WHERE whatsapp IS NOT NULL AND whatsapp <> '';
