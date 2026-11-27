"""
BARBER-SYSTEM
Gerenciamento inicial do banco de dados SQLite.

Responsabilidades:
- Abrir uma conexão com o banco de dados.
- Reutilizar a conexão durante uma mesma requisição.
- Fechar a conexão ao final da requisição.
- Criar a primeira tabela da plataforma: barbershops.

O banco será criado automaticamente na pasta "instance"
quando a função de inicialização for executada.
"""

import sqlite3
from pathlib import Path

from flask import current_app, g


def get_db():
    """Retorna a conexão do banco para a requisição atual."""

    # Se esta requisição já abriu uma conexão, reutiliza a mesma.
    if "db" not in g:
        database_path = current_app.config["DATABASE"]

        # Garante que a pasta onde o banco ficará exista.
        Path(database_path).parent.mkdir(parents=True, exist_ok=True)

        g.db = sqlite3.connect(
            database_path,
            timeout=10
        )

        # Permite acessar as colunas pelo nome, por exemplo: row["name"].
        g.db.row_factory = sqlite3.Row

        # Ativa a validação de chaves estrangeiras do SQLite.
        g.db.execute("PRAGMA foreign_keys = ON")

    return g.db


def close_db(error=None):
    """Fecha a conexão ao final da requisição, se ela estiver aberta."""

    db = g.pop("db", None)

    if db is not None:
        db.close()


def init_db():
    """Cria as tabelas iniciais caso ainda não existam."""

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
        """
    )

    db.commit()


def init_app(app):
    """Conecta o gerenciamento do banco ao ciclo de vida do Flask."""

    # O arquivo do banco ficará em instance/barber.db.
    app.config.setdefault(
        "DATABASE",
        str(Path(app.instance_path) / "barber.db")
    )

    # O Flask chamará close_db automaticamente ao encerrar cada requisição.
    app.teardown_appcontext(close_db)
