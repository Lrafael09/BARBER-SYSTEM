-- Controle diário de chegada e saída dos profissionais.
CREATE TABLE IF NOT EXISTS staff_attendance (
  id INTEGER PRIMARY KEY AUTOINCREMENT,
  barbershop_id INTEGER NOT NULL,
  user_id INTEGER NOT NULL,
  attendance_date TEXT NOT NULL,
  arrived_at TEXT,
  departed_at TEXT,
  created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (barbershop_id) REFERENCES barbershops(id) ON DELETE CASCADE,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  UNIQUE (barbershop_id, user_id, attendance_date),
  CHECK (departed_at IS NULL OR arrived_at IS NOT NULL),
  CHECK (departed_at IS NULL OR departed_at >= arrived_at)
);

CREATE INDEX IF NOT EXISTS idx_staff_attendance_day
  ON staff_attendance (barbershop_id, attendance_date, arrived_at, departed_at);
