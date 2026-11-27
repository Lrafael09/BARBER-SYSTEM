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
        service = validate_service_data(data, partial=True, existing=dict(existing))
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



def validate_clock_time(value, field_name):
    """Valida horário no formato HH:MM."""

    from datetime import time

    if not isinstance(value, str):
        raise ValueError(f"Informe {field_name} no formato HH:MM.")

    try:
        parsed = time.fromisoformat(value)
    except ValueError:
        raise ValueError(f"Informe {field_name} no formato HH:MM.")

    if parsed.second or parsed.microsecond:
        raise ValueError(f"Informe {field_name} no formato HH:MM.")

    return parsed.strftime("%H:%M")


def validate_local_datetime(value, field_name):
    """Valida data e hora local no formato ISO sem fuso horário."""

    from datetime import datetime

    if not isinstance(value, str):
        raise ValueError(f"Informe {field_name} como data e hora.")

    try:
        parsed = datetime.fromisoformat(value)
    except ValueError:
        raise ValueError(f"{field_name} deve usar o formato AAAA-MM-DDTHH:MM.")

    if parsed.tzinfo is not None:
        raise ValueError(f"{field_name} deve usar o horário local sem fuso.")

    return parsed.strftime("%Y-%m-%dT%H:%M:%S")


@admin_bp.route("/schedule", methods=["GET"])
@active_owner_required
def get_business_schedule():
    """Retorna os horários semanais configurados para a barbearia."""

    rows = get_db().execute(
        """
        SELECT weekday, is_open, open_time, close_time, break_start, break_end
        FROM business_hours
        WHERE barbershop_id = ?
        ORDER BY weekday
        """,
        (session["barbershop_id"],)
    ).fetchall()

    configured = {
        row["weekday"]: {
            "weekday": row["weekday"],
            "is_open": bool(row["is_open"]),
            "open_time": row["open_time"],
            "close_time": row["close_time"],
            "break_start": row["break_start"],
            "break_end": row["break_end"]
        }
        for row in rows
    }

    return jsonify({
        "days": [
            configured.get(day, {
                "weekday": day,
                "is_open": False,
                "open_time": None,
                "close_time": None,
                "break_start": None,
                "break_end": None
            })
            for day in range(7)
        ],
        "weekday_reference": "0=segunda-feira, 6=domingo"
    }), 200


@admin_bp.route("/schedule", methods=["PUT"])
@active_owner_required
def save_business_schedule():
    """
    Salva os horários semanais enviados.

    Espera JSON: {"days": [{"weekday": 0, "is_open": true,
    "open_time": "09:00", "close_time": "18:00",
    "break_start": "12:00", "break_end": "13:00"}]}.
    """

    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("days"), list):
        return jsonify({"error": "Envie uma lista de dias em 'days'."}), 400

    if not data["days"] or len(data["days"]) > 7:
        return jsonify({"error": "Envie entre 1 e 7 dias."}), 400

    normalized_days = []
    seen_weekdays = set()

    try:
        for item in data["days"]:
            if not isinstance(item, dict):
                raise ValueError("Cada dia deve ser um objeto.")

            weekday = item.get("weekday")
            if isinstance(weekday, bool) or not isinstance(weekday, int) or not 0 <= weekday <= 6:
                raise ValueError("weekday deve ser um número de 0 a 6.")

            if weekday in seen_weekdays:
                raise ValueError("Não envie o mesmo dia da semana mais de uma vez.")
            seen_weekdays.add(weekday)

            is_open = item.get("is_open")
            if not isinstance(is_open, bool):
                raise ValueError("is_open deve ser verdadeiro ou falso.")

            if not is_open:
                normalized_days.append({
                    "weekday": weekday,
                    "is_open": 0,
                    "open_time": None,
                    "close_time": None,
                    "break_start": None,
                    "break_end": None
                })
                continue

            open_time = validate_clock_time(item.get("open_time"), "abertura")
            close_time = validate_clock_time(item.get("close_time"), "fechamento")
            if close_time <= open_time:
                raise ValueError("O fechamento deve ser depois da abertura.")

            break_start = item.get("break_start")
            break_end = item.get("break_end")

            if (break_start is None) != (break_end is None):
                raise ValueError("Informe início e fim do intervalo ou deixe ambos vazios.")

            if break_start is not None:
                break_start = validate_clock_time(break_start, "início do intervalo")
                break_end = validate_clock_time(break_end, "fim do intervalo")
                if not open_time < break_start < break_end < close_time:
                    raise ValueError("O intervalo deve ficar dentro do horário de funcionamento.")

            normalized_days.append({
                "weekday": weekday,
                "is_open": 1,
                "open_time": open_time,
                "close_time": close_time,
                "break_start": break_start,
                "break_end": break_end
            })

    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    db = get_db()
    for day in normalized_days:
        db.execute(
            """
            INSERT INTO business_hours (
                barbershop_id, weekday, is_open, open_time,
                close_time, break_start, break_end
            )
            VALUES (?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(barbershop_id, weekday) DO UPDATE SET
                is_open = excluded.is_open,
                open_time = excluded.open_time,
                close_time = excluded.close_time,
                break_start = excluded.break_start,
                break_end = excluded.break_end
            """,
            (
                session["barbershop_id"],
                day["weekday"],
                day["is_open"],
                day["open_time"],
                day["close_time"],
                day["break_start"],
                day["break_end"]
            )
        )

    db.commit()
    return jsonify({"message": "Horários atualizados com sucesso."}), 200


@admin_bp.route("/blocks", methods=["GET"])
@active_owner_required
def list_time_blocks():
    """Lista folgas e bloqueios da barbearia dentro do próprio tenant."""

    rows = get_db().execute(
        """
        SELECT time_blocks.id, time_blocks.barber_id,
               users.name AS barber_name, time_blocks.starts_at,
               time_blocks.ends_at, time_blocks.reason
        FROM time_blocks
        LEFT JOIN users
          ON users.id = time_blocks.barber_id
         AND users.barbershop_id = time_blocks.barbershop_id
        WHERE time_blocks.barbershop_id = ?
        ORDER BY time_blocks.starts_at
        """,
        (session["barbershop_id"],)
    ).fetchall()

    return jsonify({
        "blocks": [
            {
                "id": row["id"],
                "barber_id": row["barber_id"],
                "barber_name": row["barber_name"],
                "starts_at": row["starts_at"],
                "ends_at": row["ends_at"],
                "reason": row["reason"]
            }
            for row in rows
        ]
    }), 200


@admin_bp.route("/blocks", methods=["POST"])
@active_owner_required
def create_time_block():
    """
    Cria uma folga ou bloqueio geral/individual.

    barber_id ausente ou null bloqueia a agenda de toda a barbearia.
    """

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados do bloqueio em JSON."}), 400

    try:
        starts_at = validate_local_datetime(data.get("starts_at"), "starts_at")
        ends_at = validate_local_datetime(data.get("ends_at"), "ends_at")
        if ends_at <= starts_at:
            raise ValueError("O fim do bloqueio deve ser depois do início.")
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    reason = data.get("reason")
    if reason is not None:
        reason = str(reason).strip() or None
        if reason and len(reason) > 250:
            return jsonify({"error": "O motivo deve ter até 250 caracteres."}), 400

    barber_id = data.get("barber_id")
    if barber_id is not None:
        if isinstance(barber_id, bool):
            return jsonify({"error": "Barbeiro inválido."}), 400
        try:
            barber_id = int(barber_id)
        except (TypeError, ValueError):
            return jsonify({"error": "Barbeiro inválido."}), 400

        barber = get_db().execute(
            """
            SELECT id FROM users
            WHERE id = ? AND barbershop_id = ?
              AND role = 'barber' AND is_active = 1
            """,
            (barber_id, session["barbershop_id"])
        ).fetchone()
        if barber is None:
            return jsonify({"error": "Barbeiro não encontrado nesta barbearia."}), 404

    db = get_db()
    cursor = db.execute(
        """
        INSERT INTO time_blocks (
            barbershop_id, barber_id, starts_at, ends_at, reason, created_by
        )
        VALUES (?, ?, ?, ?, ?, ?)
        """,
        (
            session["barbershop_id"],
            barber_id,
            starts_at,
            ends_at,
            reason,
            session["user_id"]
        )
    )
    db.commit()

    return jsonify({
        "message": "Bloqueio cadastrado com sucesso.",
        "block": {
            "id": cursor.lastrowid,
            "barber_id": barber_id,
            "starts_at": starts_at,
            "ends_at": ends_at,
            "reason": reason
        }
    }), 201


@admin_bp.route("/blocks/<int:block_id>", methods=["DELETE"])
@active_owner_required
def delete_time_block(block_id):
    """Remove um bloqueio somente se pertencer à barbearia autenticada."""

    cursor = get_db().execute(
        """
        DELETE FROM time_blocks
        WHERE id = ? AND barbershop_id = ?
        """,
        (block_id, session["barbershop_id"])
    )
    get_db().commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "Bloqueio não encontrado."}), 404

    return jsonify({"message": "Bloqueio removido com sucesso."}), 200
