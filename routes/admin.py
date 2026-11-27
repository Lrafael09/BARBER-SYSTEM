"""
BARBER-SYSTEM
Rotas administrativas do proprietário.

Inclui:
- Proteção das rotas administrativas.
- Cadastro de colaboradores com PIN.
- Cadastro, consulta, edição e desativação de serviços.
"""

from decimal import Decimal, InvalidOperation, ROUND_HALF_UP
from functools import wraps

from flask import Blueprint, jsonify, request, session
from werkzeug.security import generate_password_hash

from database import get_db
from routes.auth import owner_required


admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


def active_owner_required(view):
    """Exige sessão válida de proprietário e confirma que a conta está ativa."""

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


def parse_price_cents(value):
    """Converte um preço em reais para centavos sem usar ponto flutuante."""

    try:
        normalized = str(value).strip().replace(",", ".")
        amount = Decimal(normalized)

        if not amount.is_finite() or amount < 0 or amount > Decimal("1000000"):
            raise ValueError

        cents = (amount * 100).quantize(
            Decimal("1"),
            rounding=ROUND_HALF_UP
        )
        return int(cents)

    except (InvalidOperation, ValueError, TypeError):
        raise ValueError("Informe um preço válido em reais.")


def validate_service_data(data, partial=False, existing=None):
    """Valida e normaliza os dados recebidos para um serviço."""

    existing = existing or {}

    name = data.get("name", existing.get("name", ""))
    description = data.get("description", existing.get("description"))
    price = data.get("price", None)
    duration = data.get(
        "duration_minutes",
        existing.get("duration_minutes")
    )

    if not partial or "name" in data:
        name = str(name).strip()
        if not name or len(name) > 120:
            raise ValueError("O nome deve ter entre 1 e 120 caracteres.")

    if not partial or "description" in data:
        if description is not None:
            description = str(description).strip() or None
            if description and len(description) > 500:
                raise ValueError("A descrição deve ter até 500 caracteres.")

    if not partial or "price" in data:
        price_cents = parse_price_cents(price)
    else:
        price_cents = existing["price_cents"]

    if not partial or "duration_minutes" in data:
        if isinstance(duration, bool):
            raise ValueError("A duração deve ser um número inteiro de minutos.")
        try:
            duration = int(duration)
        except (TypeError, ValueError):
            raise ValueError("A duração deve ser um número inteiro de minutos.")

        if duration < 1 or duration > 1440:
            raise ValueError("A duração deve estar entre 1 e 1440 minutos.")

    return {
        "name": name,
        "description": description,
        "price_cents": price_cents,
        "duration_minutes": duration
    }


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
    """Cadastra um colaborador na barbearia do proprietário autenticado."""

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
            barbershop_id, name, pin_hash, role, is_active
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


@admin_bp.route("/services", methods=["GET"])
@active_owner_required
def list_services():
    """Lista os serviços cadastrados na barbearia do proprietário."""

    rows = get_db().execute(
        """
        SELECT id, name, description, price_cents,
               duration_minutes, is_active
        FROM services
        WHERE barbershop_id = ?
        ORDER BY is_active DESC, name COLLATE NOCASE
        """,
        (session["barbershop_id"],)
    ).fetchall()

    return jsonify({
        "services": [
            {
                "id": row["id"],
                "name": row["name"],
                "description": row["description"],
                "price_cents": row["price_cents"],
                "price": f"{row['price_cents'] / 100:.2f}",
                "duration_minutes": row["duration_minutes"],
                "is_active": bool(row["is_active"])
            }
            for row in rows
        ]
    }), 200


@admin_bp.route("/services", methods=["POST"])
@active_owner_required
def create_service():
    """Cadastra um novo serviço para a barbearia autenticada."""

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados em formato JSON."}), 400

    try:
        service = validate_service_data(data)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO services (
            barbershop_id, name, description,
            price_cents, duration_minutes
        )
        VALUES (?, ?, ?, ?, ?)
        """,
        (
            session["barbershop_id"],
            service["name"],
            service["description"],
            service["price_cents"],
            service["duration_minutes"]
        )
    )
    db.commit()

    return jsonify({
        "message": "Serviço cadastrado com sucesso.",
        "service": {
            "id": cursor.lastrowid,
            "name": service["name"],
            "description": service["description"],
            "price_cents": service["price_cents"],
            "duration_minutes": service["duration_minutes"],
            "is_active": True
        }
    }), 201


@admin_bp.route("/services/<int:service_id>", methods=["PATCH"])
@active_owner_required
def update_service(service_id):
    """Atualiza somente um serviço pertencente à barbearia autenticada."""

    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Envie os campos que deseja atualizar."}), 400

    db = get_db()
    existing = db.execute(
        """
        SELECT id, name, description, price_cents,
               duration_minutes, is_active
        FROM services
        WHERE id = ? AND barbershop_id = ?
        """,
        (service_id, session["barbershop_id"])
    ).fetchone()

    if existing is None:
        return jsonify({"error": "Serviço não encontrado."}), 404

    try:
        service = validate_service_data(data, partial=True, existing=existing)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    is_active = existing["is_active"]
    if "is_active" in data:
        if not isinstance(data["is_active"], bool):
            return jsonify({"error": "is_active deve ser verdadeiro ou falso."}), 400
        is_active = int(data["is_active"])

    db.execute(
        """
        UPDATE services
        SET name = ?, description = ?, price_cents = ?,
            duration_minutes = ?, is_active = ?
        WHERE id = ? AND barbershop_id = ?
        """,
        (
            service["name"],
            service["description"],
            service["price_cents"],
            service["duration_minutes"],
            is_active,
            service_id,
            session["barbershop_id"]
        )
    )
    db.commit()

    return jsonify({
        "message": "Serviço atualizado com sucesso.",
        "service": {
            "id": service_id,
            "name": service["name"],
            "description": service["description"],
            "price_cents": service["price_cents"],
            "duration_minutes": service["duration_minutes"],
            "is_active": bool(is_active)
        }
    }), 200


@admin_bp.route("/services/<int:service_id>", methods=["DELETE"])
@active_owner_required
def deactivate_service(service_id):
    """Desativa um serviço sem apagar seu histórico de agendamentos."""

    db = get_db()
    cursor = db.execute(
        """
        UPDATE services
        SET is_active = 0
        WHERE id = ? AND barbershop_id = ?
        """,
        (service_id, session["barbershop_id"])
    )
    db.commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "Serviço não encontrado."}), 404

    return jsonify({
        "message": "Serviço desativado. O histórico foi preservado."
    }), 200
