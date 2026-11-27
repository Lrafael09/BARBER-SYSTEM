"""
BARBER-SYSTEM
Gerenciamento do banco de dados SQLite.

Responsabilidades:
- Abrir e reutilizar a conexão durante uma requisição.
- Fechar a conexão ao final do contexto Flask.
- Criar as tabelas fundamentais do sistema.

O banco é criado automaticamente em instance/barber.db.
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
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
        );

        -- Contas de acesso do proprietário e dos colaboradores.
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            barbershop_id INTEGER NOT NULL,
            name TEXT NOT NULL,
            email TEXT,
            password_hash TEXT,
            pin_hash TEXT,
            role TEXT NOT NULL CHECK (role IN ('owner', 'barber')),
            is_active INTEGER NOT NULL DEFAULT 1
                CHECK (is_active IN (0, 1)),
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id)
                REFERENCES barbershops (id) ON DELETE CASCADE,
            UNIQUE (barbershop_id, email)
        );

        -- Cadastro permanente do cliente dentro de cada barbearia.
        -- phone guarda o telefone completo normalizado; phone_last4
        -- permite localizar candidatos sem buscar pelo telefone inteiro.
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

        -- Catálogo de serviços oferecidos pela barbearia.
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

        -- Agendamentos. Os campos de snapshot preservam o nome,
        -- preço e duração mesmo que o cadastro do serviço mude depois.
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
            status TEXT NOT NULL DEFAULT 'scheduled'
                CHECK (status IN (
                    'scheduled', 'completed', 'cancelled'
                )),
            cancellation_reason TEXT,
            cancelled_at TEXT,
            created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY (barbershop_id)
                REFERENCES barbershops (id) ON DELETE CASCADE,
            FOREIGN KEY (customer_id)
                REFERENCES customers (id),
            FOREIGN KEY (service_id)
                REFERENCES services (id),
            FOREIGN KEY (barber_id)
                REFERENCES users (id)
        );

        -- Índices para acelerar consultas comuns.
        CREATE INDEX IF NOT EXISTS idx_users_barbershop_role
            ON users (barbershop_id, role);

        CREATE INDEX IF NOT EXISTS idx_customers_barbershop_last4
            ON customers (barbershop_id, phone_last4);

        CREATE INDEX IF NOT EXISTS idx_appointments_schedule
            ON appointments (barbershop_id, starts_at, status);

        CREATE INDEX IF NOT EXISTS idx_appointments_barber_schedule
            ON appointments (barbershop_id, barber_id, starts_at, status);
        """
    )

    db.commit()


def init_app(app):
    """Conecta o gerenciamento do banco ao ciclo de vida do Flask."""

    app.config.setdefault(
        "DATABASE",
        str(Path(app.instance_path) / "barber.db")
    )

    app.teardown_appcontext(close_db)
