"""
BARBER-SYSTEM
Rotas administrativas do proprietário.

Nesta etapa:
- Protege a entrada inicial do painel.
- Permite ao proprietário cadastrar colaboradores com PIN de quatro dígitos.
- Armazena somente o hash do PIN, nunca o código original.

O login do colaborador e a proteção contra tentativas repetidas
serão implementados antes de liberar o acesso por PIN.
"""

from flask import Blueprint, jsonify, request, session
from werkzeug.security import generate_password_hash

from database import get_db
from routes.auth import owner_required


admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


def active_owner_required(view):
    """Exige sessão de proprietário e confirma que a conta segue ativa."""

    from functools import wraps

    @wraps(view)
    @owner_required
    def wrapped_view(*args, **kwargs):
        owner = get_db().execute(
            """
            SELECT id
            FROM users
            WHERE id = ?
              AND barbershop_id = ?
              AND role = 'owner'
              AND is_active = 1
            """,
            (session["user_id"], session["barbershop_id"])
        ).fetchone()

        if owner is None:
            session.clear()
            return jsonify({
                "error": "Sessão inválida. Faça login novamente."
            }), 401

        return view(*args, **kwargs)

    return wrapped_view


@admin_bp.route("/", methods=["GET"])
@active_owner_required
def admin_home():
    """Endpoint inicial protegido do painel administrativo."""

    return jsonify({
        "module": "admin",
        "message": "Acesso ao módulo administrativo autorizado."
    }), 200


@admin_bp.route("/barbers", methods=["POST"])
@active_owner_required
def create_barber():
    """
    Cadastra um colaborador na barbearia do proprietário autenticado.

    Espera JSON com: name e pin (exatamente quatro números).
    """

    data = request.get_json(silent=True)

    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados em formato JSON."}), 400

    name = str(data.get("name", "")).strip()
    pin = data.get("pin", "")

    if not name or len(name) > 120:
        return jsonify({
            "error": "Informe o nome do colaborador (até 120 caracteres)."
        }), 400

    if not isinstance(pin, str) or len(pin) != 4 or not pin.isdigit():
        return jsonify({
            "error": "O PIN deve conter exatamente quatro números."
        }), 400

    db = get_db()

    cursor = db.execute(
        """
        INSERT INTO users (
            barbershop_id,
            name,
            pin_hash,
            role,
            is_active
        )
        VALUES (?, ?, ?, 'barber', 1)
        """,
        (
            session["barbershop_id"],
            name,
            generate_password_hash(pin)
        )
    )
    db.commit()

    return jsonify({
        "message": "Colaborador cadastrado com sucesso.",
        "barber": {
            "id": cursor.lastrowid,
            "name": name,
            "role": "barber"
        }
    }), 201
