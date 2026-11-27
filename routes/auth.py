"""
BARBER-SYSTEM
Autenticação e criação inicial de contas.

Nesta etapa:
- Mantém as funções de hash de senha.
- Permite cadastrar uma nova barbearia e seu proprietário.
- Cria os dois registros em uma única transação.

O login, logout, sessões e cadastro de colaboradores serão
implementados em etapas próprias, com suas respectivas proteções.
"""

import re
import sqlite3
import unicodedata

from flask import Blueprint, jsonify, request
from werkzeug.security import check_password_hash, generate_password_hash

from database import get_db


auth_bp = Blueprint("auth", __name__)


def hash_password(password):
    """Gera um hash seguro para armazenar, nunca a senha original."""

    if not password:
        raise ValueError("A senha não pode ser vazia.")

    return generate_password_hash(password)


def verify_password(password_hash, password):
    """Compara a senha digitada com o hash armazenado."""

    if not password_hash or not password:
        return False

    return check_password_hash(password_hash, password)


def create_slug(name):
    """Transforma o nome da barbearia em um endereço simples."""

    normalized = unicodedata.normalize("NFKD", name)
    without_accents = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", without_accents.lower())
    return slug.strip("-")


@auth_bp.route("/auth/register", methods=["POST"])
def register_owner():
    """
    Cria uma barbearia e a conta do proprietário.

    Espera JSON com: shop_name, owner_name, email e password.
    whatsapp é opcional.
    """

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados em formato JSON."}), 400

    shop_name = str(data.get("shop_name", "")).strip()
    owner_name = str(data.get("owner_name", "")).strip()
    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    whatsapp = re.sub(r"\D", "", str(data.get("whatsapp", "")))

    if not shop_name or not owner_name or not email or not password:
        return jsonify({
            "error": "Preencha o nome da barbearia, seu nome, e-mail e senha."
        }), 400

    if len(shop_name) > 120 or len(owner_name) > 120:
        return jsonify({"error": "Os nomes devem ter até 120 caracteres."}), 400

    if len(email) > 254 or not re.fullmatch(r"[^@\s]+@[^@\s]+\.[^@\s]+", email):
        return jsonify({"error": "Informe um e-mail válido."}), 400

    if not isinstance(password, str) or len(password) < 8:
        return jsonify({
            "error": "A senha deve ter pelo menos 8 caracteres."
        }), 400

    base_slug = create_slug(shop_name)

    if not base_slug:
        return jsonify({
            "error": "Não foi possível criar um endereço com esse nome."
        }), 400

    db = get_db()

    try:
        # Inicia uma transação de escrita para evitar duas criações
        # simultâneas com o mesmo e-mail ou endereço.
        db.execute("BEGIN IMMEDIATE")

        existing_owner = db.execute(
            """
            SELECT id
            FROM users
            WHERE email = ? AND role = 'owner'
            """,
            (email,)
        ).fetchone()

        if existing_owner:
            db.rollback()
            return jsonify({
                "error": "Já existe uma conta de proprietário com esse e-mail."
            }), 409

        slug = base_slug
        suffix = 2

        while db.execute(
            "SELECT id FROM barbershops WHERE slug = ?",
            (slug,)
        ).fetchone():
            slug = f"{base_slug}-{suffix}"
            suffix += 1

        shop_cursor = db.execute(
            """
            INSERT INTO barbershops (name, slug, whatsapp)
            VALUES (?, ?, ?)
            """,
            (shop_name, slug, whatsapp or None)
        )

        barbershop_id = shop_cursor.lastrowid

        db.execute(
            """
            INSERT INTO users (
                barbershop_id, name, email, password_hash, role
            )
            VALUES (?, ?, ?, ?, 'owner')
            """,
            (
                barbershop_id,
                owner_name,
                email,
                hash_password(password)
            )
        )

        db.commit()

        return jsonify({
            "message": "Barbearia e conta do proprietário cadastradas.",
            "barbershop": {
                "id": barbershop_id,
                "name": shop_name,
                "slug": slug
            }
        }), 201

    except sqlite3.IntegrityError:
        db.rollback()
        return jsonify({
            "error": "Não foi possível concluir o cadastro. Verifique os dados."
        }), 409

    except Exception:
        db.rollback()
        raise
