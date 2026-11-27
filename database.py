"""
BARBER-SYSTEM
Gerenciamento do banco de dados SQLite.
"""

import sqlite3
from pathlib import Path

from flask import current_app, g


def get_db():
    """Retorna a conexão do banco para o contexto atual."""

    if "db" not in g:
        database_path = current_app.config["DATABASE"]
        Path(database_path).parent.mkdir(parents=True, exist_ok=True)

        g.db = sqlite3.connect(database_path, timeout=10)
        g.db.row_factory = sqlite3.Row
        g.db.execute("PRAGMA foreign_keys = ON")

    return g.db


def close_db(error=None):
    """Fecha a conexão ao final da requisição ou contexto."""

    db = g.pop("db", None)
    if db is not None:
        db.close()


def init_db():
    """Cria as tabelas fundamentais caso ainda não existam."""

    db = get_db()

    db.executescript(
        """
        CREATE TABLE IF NOT EXISTS barbershops (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            slug TEXT NOT NULL UNIQUE,
            whatsapp TEXT,
            logo_data TEXT,
            brand_color TEXT NOT NULL DEFAULT '#a8f05a',
            theme TEXT NOT NULL DEFAULT 'dark' CHECK (theme IN ('dark', 'light')),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            password_hash TEXT,
            pin_hash TEXT,
            role TEXT NOT NULL CHECK (role IN ('owner', 'barber')),
            can_serve INTEGER NOT NULL DEFAULT 0 CHECK (can_serve IN (0, 1)),
            commission_percent REAL NOT NULL DEFAULT 0 CHECK (commission_percent BETWEEN 0 AND 100),
            is_active INTEGER NOT NULL DEFAULT 1
                CHECK (is_active IN (0, 1)),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id)
                REFERENCES barbershops (id) ON DELETE CASCADE,
            UNIQUE (barbershop_id, email)
        );

        CREATE TABLE IF NOT EXISTS customers (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            phone TEXT NOT NULL,
            phone_last4 TEXT NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id)
                REFERENCES barbershops (id) ON DELETE CASCADE,
            UNIQUE (barbershop_id, phone),
            CHECK (length(phone_last4) = 4)
        );

        CREATE TABLE IF NOT EXISTS services (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
            duration_minutes INTEGER NOT NULL
                CHECK (duration_minutes > 0),
            is_active INTEGER NOT NULL DEFAULT 1
                CHECK (is_active IN (0, 1)),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id)
                REFERENCES barbershops (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            customer_id INTEGER NOT NULL,
            service_id INTEGER NOT NULL,
            barber_id INTEGER,
            service_name TEXT NOT NULL,
            price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
            duration_minutes INTEGER NOT NULL
                CHECK (duration_minutes > 0),
            starts_at TEXT NOT NULL,
            ends_at TEXT NOT NULL,
            commission_percent REAL,
            commission_cents INTEGER NOT NULL DEFAULT 0,
            status TEXT NOT NULL DEFAULT 'scheduled'
                CHECK (status IN ('scheduled', 'completed', 'cancelled')),
            cancellation_reason TEXT,
            cancelled_at TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id)
                REFERENCES barbershops (id) ON DELETE CASCADE,
            FOREIGN KEY (customer_id) REFERENCES customers (id),
            FOREIGN KEY (service_id) REFERENCES services (id),
            FOREIGN KEY (barber_id) REFERENCES users (id)
        );

        -- Horários semanais da barbearia. weekday: 0=segunda ... 6=domingo.
        CREATE TABLE IF NOT EXISTS business_hours (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
            is_open INTEGER NOT NULL DEFAULT 0 CHECK (is_open IN (0, 1)),
            open_time TEXT,
            close_time TEXT,
            break_start TEXT,
            break_end TEXT,
            UNIQUE (barbershop_id, weekday),
            FOREIGN KEY (barbershop_id)
                REFERENCES barbershops (id) ON DELETE CASCADE,
            CHECK (
                (is_open = 0) OR
                (
                    open_time IS NOT NULL
                    AND close_time IS NOT NULL
                    AND close_time > open_time
                )
            ),
            CHECK (
                (break_start IS NULL AND break_end IS NULL) OR
                (
                    break_start IS NOT NULL
                    AND break_end IS NOT NULL
                    AND break_end > break_start
                    AND break_start > open_time
                    AND break_end < close_time
                )
            )
        );

        -- Folgas, férias e bloqueios de horário da barbearia ou de um barbeiro.
        -- starts_at e ends_at usam ISO 8601 em horário local da barbearia.
        CREATE TABLE IF NOT EXISTS time_blocks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            barber_id INTEGER,
            starts_at TEXT NOT NULL,
            ends_at TEXT NOT NULL,
            reason TEXT,
            created_by INTEGER NOT NULL,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id)
                REFERENCES barbershops (id) ON DELETE CASCADE,
            FOREIGN KEY (barber_id)
                REFERENCES users (id),
            FOREIGN KEY (created_by)
                REFERENCES users (id),
            CHECK (ends_at > starts_at)
        );

        -- Contador persistente de tentativas de PIN por profissional,
        -- barbearia e endereço IP. Os horários são gravados em UTC.
        CREATE TABLE IF NOT EXISTS login_attempts (
            scope_key TEXT PRIMARY KEY,
            failed_attempts INTEGER NOT NULL DEFAULT 0,
            window_started_at INTEGER NOT NULL,
            locked_until INTEGER
        );

        CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            description TEXT,
            price_cents INTEGER NOT NULL CHECK (price_cents >= 0),
            is_active INTEGER NOT NULL DEFAULT 1 CHECK (is_active IN (0, 1)),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id) REFERENCES barbershops (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS staff_hours (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
            is_open INTEGER NOT NULL DEFAULT 0 CHECK (is_open IN (0, 1)),
            open_time TEXT,
            close_time TEXT,
            break_start TEXT,
            break_end TEXT,
            UNIQUE (barbershop_id, user_id, weekday),
            FOREIGN KEY (barbershop_id) REFERENCES barbershops (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS staff_breaks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            user_id INTEGER NOT NULL,
            weekday INTEGER NOT NULL CHECK (weekday BETWEEN 0 AND 6),
            break_start TEXT NOT NULL,
            break_end TEXT NOT NULL,
            UNIQUE (barbershop_id, user_id, weekday),
            FOREIGN KEY (barbershop_id) REFERENCES barbershops (id) ON DELETE CASCADE,
            FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE,
            CHECK (break_end > break_start)
        );

        CREATE TABLE IF NOT EXISTS finance_entries (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            entry_type TEXT NOT NULL CHECK (entry_type IN ('income', 'expense')),
            description TEXT NOT NULL,
            category TEXT,
            amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
            entry_date TEXT NOT NULL,
            appointment_id INTEGER,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id) REFERENCES barbershops (id) ON DELETE CASCADE,
            FOREIGN KEY (appointment_id) REFERENCES appointments (id) ON DELETE SET NULL
        );


        CREATE TABLE IF NOT EXISTS fixed_costs (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            amount_cents INTEGER NOT NULL CHECK (amount_cents > 0),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id) REFERENCES barbershops (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS financial_settings (
            barbershop_id INTEGER PRIMARY KEY,
            desired_profit_cents INTEGER NOT NULL DEFAULT 0 CHECK (desired_profit_cents >= 0),
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id) REFERENCES barbershops (id) ON DELETE CASCADE
        );

        CREATE TABLE IF NOT EXISTS financial_goals (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            period_type TEXT NOT NULL CHECK (period_type IN ('daily', 'weekly', 'monthly')),
            target_cents INTEGER NOT NULL CHECK (target_cents >= 0),
            updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            UNIQUE (barbershop_id, period_type),
            FOREIGN KEY (barbershop_id) REFERENCES barbershops (id) ON DELETE CASCADE
        );

        CREATE INDEX IF NOT EXISTS idx_finance_entries_date
            ON finance_entries (barbershop_id, entry_date, entry_type);
        CREATE UNIQUE INDEX IF NOT EXISTS idx_finance_appointment_income
            ON finance_entries (appointment_id) WHERE appointment_id IS NOT NULL;

        CREATE INDEX IF NOT EXISTS idx_users_barbershop_role
            ON users (barbershop_id, role);

        CREATE INDEX IF NOT EXISTS idx_customers_barbershop_last4
            ON customers (barbershop_id, phone_last4);

        CREATE INDEX IF NOT EXISTS idx_appointments_schedule
            ON appointments (barbershop_id, starts_at, status);

        CREATE INDEX IF NOT EXISTS idx_appointments_barber_schedule
            ON appointments (barbershop_id, barber_id, starts_at, status);

        CREATE INDEX IF NOT EXISTS idx_time_blocks_schedule
            ON time_blocks (barbershop_id, starts_at, ends_at);

        CREATE INDEX IF NOT EXISTS idx_time_blocks_barber_schedule
            ON time_blocks (barbershop_id, barber_id, starts_at, ends_at);
        """
    )

    # Migração segura para bancos criados antes do recurso de logotipo.
    columns = {row["name"] for row in db.execute("PRAGMA table_info(barbershops)").fetchall()}
    if "logo_data" not in columns:
        db.execute("ALTER TABLE barbershops ADD COLUMN logo_data TEXT")
    if "brand_color" not in columns:
        db.execute("ALTER TABLE barbershops ADD COLUMN brand_color TEXT NOT NULL DEFAULT '#a8f05a'")
    if "theme" not in columns:
        db.execute("ALTER TABLE barbershops ADD COLUMN theme TEXT NOT NULL DEFAULT 'dark'")

    user_columns = {row["name"] for row in db.execute("PRAGMA table_info(users)").fetchall()}
    if "can_serve" not in user_columns:
        db.execute("ALTER TABLE users ADD COLUMN can_serve INTEGER NOT NULL DEFAULT 0")
        db.execute("UPDATE users SET can_serve = 1 WHERE role = 'barber'")
    if "commission_percent" not in user_columns:
        db.execute("ALTER TABLE users ADD COLUMN commission_percent REAL NOT NULL DEFAULT 0")

    appointment_columns = {
        row["name"] for row in db.execute("PRAGMA table_info(appointments)").fetchall()
    }
    if "commission_percent" not in appointment_columns:
        db.execute("ALTER TABLE appointments ADD COLUMN commission_percent REAL")
    if "commission_cents" not in appointment_columns:
        db.execute("ALTER TABLE appointments ADD COLUMN commission_cents INTEGER NOT NULL DEFAULT 0")

    db.commit()


def init_app(app):
    """Conecta o gerenciamento do banco ao ciclo de vida do Flask."""

    app.config.setdefault(
        "DATABASE",
        str(Path(app.instance_path) / "barber.db")
    )
    app.teardown_appcontext(close_db)
