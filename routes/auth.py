"""
BARBER-SYSTEM
Autenticação e cadastro único do proprietário por instalação.
"""

import re
import sqlite3
import unicodedata
from functools import wraps

from flask import Blueprint, current_app, jsonify, request, session
from werkzeug.security import check_password_hash, generate_password_hash

from database import get_db


auth_bp = Blueprint("auth", __name__)


def hash_password(password):
    """Armazena somente o hash seguro da senha."""
    if not password:
        raise ValueError("A senha não pode ser vazia.")
    return generate_password_hash(password)


def verify_password(password_hash, password):
    if not password_hash or not password:
        return False
    return check_password_hash(password_hash, password)


def create_slug(name):
    normalized = unicodedata.normalize("NFKD", name)
    without_accents = normalized.encode("ascii", "ignore").decode("ascii")
    slug = re.sub(r"[^a-zA-Z0-9]+", "-", without_accents.lower())
    return slug.strip("-")


def owner_required(view):
    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if session.get("user_role") != "owner" or not session.get("user_id"):
            return jsonify({"error": "Acesso não autorizado. Faça login."}), 401
        return view(*args, **kwargs)
    return wrapped_view


def owner_registration_available():
    """Só permite cadastro se a chave estiver ligada e a instalação estiver vazia."""
    if not current_app.config.get("OWNER_REGISTRATION_ENABLED", False):
        return False
    existing_shop = get_db().execute(
        "SELECT id FROM barbershops LIMIT 1"
    ).fetchone()
    return existing_shop is None


@auth_bp.route("/auth/registration-status", methods=["GET"])
def registration_status():
    """Informa à tela se o cadastro inicial ainda pode ser exibido."""
    return jsonify({"available": owner_registration_available()}), 200


@auth_bp.route("/auth/register", methods=["POST"])
def register_owner():
    """Cria a única barbearia e o único proprietário desta instalação."""
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
        return jsonify({"error": "A senha deve ter pelo menos 8 caracteres."}), 400

    base_slug = create_slug(shop_name)
    if not base_slug:
        return jsonify({
            "error": "Não foi possível criar um endereço com esse nome."
        }), 400

    db = get_db()
    try:
        # O bloqueio transacional impede dois cadastros simultâneos na mesma instalação.
        db.execute("BEGIN IMMEDIATE")

        if not current_app.config.get("OWNER_REGISTRATION_ENABLED", False):
            db.rollback()
            return jsonify({"error": "O cadastro inicial está desativado pelo administrador do sistema."}), 403

        existing_shop = db.execute(
            "SELECT id FROM barbershops LIMIT 1"
        ).fetchone()
        if existing_shop:
            db.rollback()
            return jsonify({
                "error": "Esta instalação já possui um proprietário cadastrado. Acesse pelo login."
            }), 409

        slug = base_slug
        suffix = 2
        while db.execute(
            "SELECT id FROM barbershops WHERE slug = ?", (slug,)
        ).fetchone():
            slug = f"{base_slug}-{suffix}"
            suffix += 1

        shop_cursor = db.execute(
            "INSERT INTO barbershops (name, slug, whatsapp) VALUES (?, ?, ?)",
            (shop_name, slug, whatsapp or None)
        )
        barbershop_id = shop_cursor.lastrowid

        db.execute(
            """
            INSERT INTO users (barbershop_id, name, email, password_hash, role)
            VALUES (?, ?, ?, ?, 'owner')
            """,
            (barbershop_id, owner_name, email, hash_password(password))
        )
        db.commit()

        return jsonify({
            "message": "Cadastro concluído. Agora entre com seu e-mail e senha.",
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


@auth_bp.route("/auth/login", methods=["POST"])
def login_owner():
    """Autentica o proprietário e inicia uma sessão."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados em formato JSON."}), 400

    email = str(data.get("email", "")).strip().lower()
    password = data.get("password", "")
    if not email or not isinstance(password, str) or not password:
        return jsonify({"error": "Informe e-mail e senha."}), 400

    user = get_db().execute(
        """
        SELECT users.id, users.barbershop_id, users.name, users.email,
               users.password_hash, users.role, users.is_active,
               barbershops.name AS barbershop_name,
               barbershops.slug AS barbershop_slug
        FROM users
        INNER JOIN barbershops ON barbershops.id = users.barbershop_id
        WHERE users.email = ? AND users.role = 'owner'
        """,
        (email,)
    ).fetchone()

    if user is None or not user["is_active"] or not verify_password(
        user["password_hash"], password
    ):
        return jsonify({"error": "E-mail ou senha incorretos."}), 401

    session.clear()
    session["user_id"] = user["id"]
    session["barbershop_id"] = user["barbershop_id"]
    session["user_role"] = user["role"]

    return jsonify({
        "message": "Login realizado com sucesso.",
        "user": {
            "id": user["id"], "name": user["name"],
            "email": user["email"], "role": user["role"]
        },
        "barbershop": {
            "id": user["barbershop_id"],
            "name": user["barbershop_name"],
            "slug": user["barbershop_slug"]
        }
    }), 200


@auth_bp.route("/auth/me", methods=["GET"])
@owner_required
def current_owner():
    user = get_db().execute(
        """
        SELECT users.id, users.barbershop_id, users.name, users.email,
               users.role, barbershops.slug AS barbershop_slug
        FROM users
        INNER JOIN barbershops ON barbershops.id = users.barbershop_id
        WHERE users.id = ? AND users.barbershop_id = ?
          AND users.role = 'owner' AND users.is_active = 1
        """,
        (session["user_id"], session["barbershop_id"])
    ).fetchone()

    if user is None:
        session.clear()
        return jsonify({"error": "Sessão inválida. Faça login novamente."}), 401

    return jsonify({
        "id": user["id"],
        "barbershop_id": user["barbershop_id"],
        "name": user["name"],
        "email": user["email"],
        "role": user["role"],
        "barbershop_slug": user["barbershop_slug"]
    }), 200


@auth_bp.route("/auth/logout", methods=["POST"])
def logout_owner():
    session.clear()
    return jsonify({"message": "Logout realizado com sucesso."}), 200
