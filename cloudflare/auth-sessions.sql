CREATE TABLE IF NOT EXISTS auth_sessions (
  id TEXT PRIMARY KEY,
  user_id INTEGER NOT NULL,
  barbershop_id INTEGER NOT NULL,
  role TEXT NOT NULL CHECK(role IN ('owner','barber')),
  expires_at TEXT NOT NULL,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY(barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE
);
CREATE INDEX IF NOT EXISTS idx_auth_sessions_expiry ON auth_sessions(expires_at);

CREATE TABLE IF NOT EXISTS login_attempts (
  scope_key TEXT PRIMARY KEY,
  failed_attempts INTEGER NOT NULL DEFAULT 0,
  window_started_at INTEGER NOT NULL,
  locked_until INTEGER
);
