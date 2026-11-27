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

from flask import Blueprint, jsonify, request, session, render_template, redirect, url_for
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


def parse_commission_percent(value):
    """Valida uma porcentagem de comissão entre zero e cem."""
    try:
        amount = Decimal(str(value).strip().replace(",", "."))
        if not amount.is_finite() or amount < 0 or amount > 100:
            raise ValueError
        return amount.quantize(Decimal("0.01"), rounding=ROUND_HALF_UP)
    except (InvalidOperation, ValueError, TypeError, AttributeError):
        raise ValueError("A comissão deve ser uma porcentagem entre 0 e 100.")


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
    try:
        commission_percent = parse_commission_percent(data.get("commission_percent", 0))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

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
            barbershop_id, name, pin_hash, role, is_active, can_serve, commission_percent
        )
        VALUES (?, ?, ?, 'barber', 1, 1, ?)
        """,
        (
            session["barbershop_id"],
            name,
            generate_password_hash(pin),
            float(commission_percent)
        )
    )
    db.commit()

    return jsonify({
        "message": "Colaborador cadastrado com sucesso.",
        "barber": {
            "id": cursor.lastrowid,
            "name": name,
            "role": "barber",
            "commission_percent": float(commission_percent)
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
              AND role IN ('barber', 'owner') AND is_active = 1
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



@admin_bp.route("/dashboard", methods=["GET"])
@active_owner_required
def admin_dashboard():
    """Resumo operacional da barbearia para a página inicial do proprietário."""

    db = get_db()
    barbershop_id = session["barbershop_id"]

    db.execute(
        """
        INSERT OR IGNORE INTO finance_entries
            (barbershop_id, entry_type, description, category, amount_cents, entry_date, appointment_id)
        SELECT barbershop_id, 'income', 'Atendimento concluído: ' || service_name,
               'Atendimentos', price_cents, date(starts_at), id
        FROM appointments
        WHERE barbershop_id = ? AND status = 'completed'
        """,
        (barbershop_id,)
    )
    db.commit()

    totals = db.execute(
        """
        SELECT
            COUNT(*) AS appointments_today,
            SUM(CASE WHEN status = 'scheduled' THEN 1 ELSE 0 END) AS scheduled_today,
            SUM(CASE WHEN status = 'completed' THEN 1 ELSE 0 END) AS completed_today,
            SUM(CASE WHEN status = 'cancelled' THEN 1 ELSE 0 END) AS cancelled_today,
            COALESCE(SUM(
                CASE WHEN status = 'completed' THEN price_cents ELSE 0 END
            ), 0) AS revenue_today_cents
        FROM appointments
        WHERE barbershop_id = ?
          AND date(starts_at) = date('now', 'localtime')
        """,
        (barbershop_id,)
    ).fetchone()

    monthly = db.execute(
        """
        SELECT
            COUNT(*) AS appointments_month,
            COALESCE(SUM(
                CASE WHEN status = 'completed' THEN price_cents ELSE 0 END
            ), 0) AS revenue_month_cents
        FROM appointments
        WHERE barbershop_id = ?
          AND strftime('%Y-%m', starts_at) = strftime('%Y-%m', 'now', 'localtime')
        """,
        (barbershop_id,)
    ).fetchone()

    revenue_totals = db.execute(
        """
        SELECT
            COALESCE(SUM(CASE WHEN entry_date = date('now', 'localtime') AND entry_type = 'income' THEN amount_cents ELSE 0 END), 0) AS today_income,
            COALESCE(SUM(CASE WHEN strftime('%Y-%m', entry_date) = strftime('%Y-%m', 'now', 'localtime') AND entry_type = 'income' THEN amount_cents ELSE 0 END), 0) AS month_income
        FROM finance_entries
        WHERE barbershop_id = ?
        """,
        (barbershop_id,)
    ).fetchone()

    counts = db.execute(
        """
        SELECT
            (SELECT COUNT(*) FROM customers WHERE barbershop_id = ?) AS customers,
            (SELECT COUNT(*) FROM services WHERE barbershop_id = ? AND is_active = 1) AS active_services,
            (SELECT COUNT(*) FROM users WHERE barbershop_id = ? AND role IN ('barber', 'owner') AND is_active = 1 AND can_serve = 1) AS active_barbers
        """,
        (barbershop_id, barbershop_id, barbershop_id)
    ).fetchone()

    return jsonify({
        "today": {
            "appointments": totals["appointments_today"] or 0,
            "scheduled": totals["scheduled_today"] or 0,
            "completed": totals["completed_today"] or 0,
            "cancelled": totals["cancelled_today"] or 0,
            "revenue_cents": revenue_totals["today_income"] or 0
        },
        "month": {
            "appointments": monthly["appointments_month"] or 0,
            "revenue_cents": revenue_totals["month_income"] or 0
        },
        "base": {
            "customers": counts["customers"],
            "active_services": counts["active_services"],
            "active_barbers": counts["active_barbers"]
        }
    }), 200


@admin_bp.route("/appointments", methods=["GET"])
@active_owner_required
def list_appointments():
    """Lista agendamentos da barbearia com filtros simples por data/status."""

    from datetime import date

    date_filter = request.args.get("date")
    status_filter = request.args.get("status")

    if date_filter:
        try:
            date.fromisoformat(date_filter)
        except ValueError:
            return jsonify({"error": "A data deve estar no formato AAAA-MM-DD."}), 400

    allowed_statuses = {"scheduled", "completed", "cancelled"}
    if status_filter and status_filter not in allowed_statuses:
        return jsonify({"error": "Status de agendamento inválido."}), 400

    conditions = ["appointments.barbershop_id = ?"]
    params = [session["barbershop_id"]]

    if date_filter:
        conditions.append("date(appointments.starts_at) = ?")
        params.append(date_filter)

    date_from = request.args.get("from")
    date_to = request.args.get("to")
    if date_from:
        try:
            date.fromisoformat(date_from)
        except ValueError:
            return jsonify({"error": "A data inicial deve usar AAAA-MM-DD."}), 400
        conditions.append("date(appointments.starts_at) >= ?")
        params.append(date_from)
    if date_to:
        try:
            date.fromisoformat(date_to)
        except ValueError:
            return jsonify({"error": "A data final deve usar AAAA-MM-DD."}), 400
        conditions.append("date(appointments.starts_at) <= ?")
        params.append(date_to)

    if status_filter:
        conditions.append("appointments.status = ?")
        params.append(status_filter)

    rows = get_db().execute(
        f"""
        SELECT appointments.id, appointments.barber_id, appointments.service_name,
               appointments.price_cents, appointments.duration_minutes,
               appointments.starts_at, appointments.ends_at,
               appointments.status, appointments.cancellation_reason,
               customers.name AS customer_name,
               users.name AS barber_name
        FROM appointments
        INNER JOIN customers
          ON customers.id = appointments.customer_id
         AND customers.barbershop_id = appointments.barbershop_id
        LEFT JOIN users
          ON users.id = appointments.barber_id
         AND users.barbershop_id = appointments.barbershop_id
        WHERE {" AND ".join(conditions)}
        ORDER BY appointments.starts_at
        LIMIT 500
        """,
        params
    ).fetchall()

    return jsonify({
        "appointments": [
            {
                "id": row["id"],
                "customer_name": row["customer_name"],
                "barber_name": row["barber_name"],
                "barber_id": row["barber_id"],
                "service_name": row["service_name"],
                "price_cents": row["price_cents"],
                "duration_minutes": row["duration_minutes"],
                "starts_at": row["starts_at"],
                "ends_at": row["ends_at"],
                "status": row["status"],
                "cancellation_reason": row["cancellation_reason"]
            }
            for row in rows
        ]
    }), 200


@admin_bp.route("/appointments/<int:appointment_id>/cancel", methods=["POST"])
@active_owner_required
def cancel_appointment_admin(appointment_id):
    """Permite ao proprietário cancelar um agendamento com motivo obrigatório."""

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Informe o motivo do cancelamento."}), 400

    reason = str(data.get("reason", "")).strip()
    if not reason or len(reason) > 250:
        return jsonify({"error": "O motivo deve ter entre 1 e 250 caracteres."}), 400

    db = get_db()
    cursor = db.execute(
        """
        UPDATE appointments
        SET status = 'cancelled',
            cancellation_reason = ?,
            cancelled_at = CURRENT_TIMESTAMP
        WHERE id = ?
          AND barbershop_id = ?
          AND status = 'scheduled'
        """,
        (reason, appointment_id, session["barbershop_id"])
    )
    db.commit()

    if cursor.rowcount == 0:
        return jsonify({
            "error": "Agendamento ativo não encontrado nesta barbearia."
        }), 404

    return jsonify({"message": "Agendamento cancelado com sucesso."}), 200



@admin_bp.route("/panel", methods=["GET"])
def admin_panel_page():
    """Entrega o painel ao proprietário e redireciona profissionais."""

    if session.get("user_role") == "barber":
        db = get_db()
        staff = db.execute(
            """
            SELECT id
            FROM users
            WHERE id = ?
              AND barbershop_id = ?
              AND role IN ('barber', 'owner')
              AND is_active = 1
              AND (role = 'barber' OR can_serve = 1)
            """,
            (session.get("user_id"), session.get("barbershop_id"))
        ).fetchone()
        shop = db.execute(
            "SELECT slug FROM barbershops WHERE id = ?",
            (session.get("barbershop_id"),)
        ).fetchone() if staff else None

        if staff and shop:
            return redirect(f"/barber/{shop['slug']}", code=303)

        session.clear()

    return render_template("admin.html")


@admin_bp.route("/barbershop", methods=["GET"])
@active_owner_required
def get_barbershop_settings():
    """Retorna os dados básicos e a logo da barbearia autenticada."""

    row = get_db().execute(
        "SELECT name, logo_data, brand_color, theme, whatsapp FROM barbershops WHERE id = ?",
        (session["barbershop_id"],)
    ).fetchone()
    if row is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    return jsonify({
        "name": row["name"], "logo_data": row["logo_data"],
        "brand_color": row["brand_color"], "theme": row["theme"],
        "whatsapp": row["whatsapp"]
    }), 200


@admin_bp.route("/barbershop/logo", methods=["POST"])
@active_owner_required
def upload_barbershop_logo():
    """Salva uma logo rasterizada pequena diretamente no banco da barbearia."""

    import base64

    image = request.files.get("logo")
    if image is None:
        return jsonify({"error": "Selecione uma imagem para enviar."}), 400

    raw = image.read(512 * 1024 + 1)
    if not raw or len(raw) > 512 * 1024:
        return jsonify({"error": "A imagem deve ter no máximo 512 KB."}), 400

    if raw.startswith(b"\x89PNG\r\n\x1a\n"):
        mime = "image/png"
    elif raw.startswith(b"\xff\xd8\xff"):
        mime = "image/jpeg"
    elif raw[:4] == b"RIFF" and raw[8:12] == b"WEBP":
        mime = "image/webp"
    elif raw[:6] in (b"GIF87a", b"GIF89a"):
        mime = "image/gif"
    else:
        return jsonify({"error": "Use uma imagem PNG, JPG, WEBP ou GIF válida."}), 400

    logo_data = "data:" + mime + ";base64," + base64.b64encode(raw).decode("ascii")
    db = get_db()
    db.execute(
        "UPDATE barbershops SET logo_data = ? WHERE id = ?",
        (logo_data, session["barbershop_id"])
    )
    db.commit()

    return jsonify({"message": "Logo atualizada com sucesso.", "logo_data": logo_data}), 200


@admin_bp.route("/customers", methods=["GET"])
@active_owner_required
def list_customers():
    """Lista os clientes cadastrados nesta barbearia, sem misturar instalações."""

    rows = get_db().execute(
        """
        SELECT id, name, phone, created_at
        FROM customers
        WHERE barbershop_id = ?
        ORDER BY name COLLATE NOCASE
        LIMIT 1000
        """,
        (session["barbershop_id"],)
    ).fetchall()

    return jsonify({
        "customers": [
            {
                "id": row["id"],
                "name": row["name"],
                "phone": row["phone"],
                "created_at": row["created_at"]
            }
            for row in rows
        ]
    }), 200


# ---------------------------------------------------------------------------
# Gestão de equipe, horários individuais, produtos, caixa e metas financeiras
# ---------------------------------------------------------------------------

def _staff_record(user_id, barbershop_id):
    return get_db().execute(
        """
        SELECT id, name, role, is_active, can_serve
        FROM users
        WHERE id = ? AND barbershop_id = ?
          AND role IN ('owner', 'barber')
        """,
        (user_id, barbershop_id)
    ).fetchone()


@admin_bp.route("/barbers", methods=["GET"])
@active_owner_required
def list_barbers():
    rows = get_db().execute(
        """
        SELECT id, name, role, is_active, can_serve, commission_percent
        FROM users
        WHERE barbershop_id = ? AND role = 'barber'
        ORDER BY is_active DESC, name COLLATE NOCASE
        """,
        (session["barbershop_id"],)
    ).fetchall()
    owner = get_db().execute(
        """
        SELECT id, name, role, is_active, can_serve, commission_percent
        FROM users
        WHERE barbershop_id = ? AND role = 'owner'
        LIMIT 1
        """,
        (session["barbershop_id"],)
    ).fetchone()
    records = [dict(row) for row in rows]
    if owner:
        records.insert(0, dict(owner))
    return jsonify({"barbers": records}), 200


@admin_bp.route("/barbers/<int:barber_id>", methods=["PATCH"])
@active_owner_required
def update_barber(barber_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Envie os dados que deseja atualizar."}), 400
    db = get_db()
    barber = db.execute(
        "SELECT id, name, is_active, commission_percent FROM users WHERE id = ? AND barbershop_id = ? AND role = 'barber'",
        (barber_id, session["barbershop_id"])
    ).fetchone()
    if barber is None:
        return jsonify({"error": "Colaborador não encontrado."}), 404
    name = str(data.get("name", barber["name"])).strip()
    if not name or len(name) > 120:
        return jsonify({"error": "Informe um nome de até 120 caracteres."}), 400
    is_active = data.get("is_active", bool(barber["is_active"]))
    if not isinstance(is_active, bool):
        return jsonify({"error": "Estado de ativação inválido."}), 400
    try:
        commission_percent = parse_commission_percent(
            data.get("commission_percent", barber["commission_percent"])
        )
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    pin_hash = None
    if "pin" in data and data["pin"] != "":
        pin = data["pin"]
        if not isinstance(pin, str) or len(pin) != 4 or not pin.isdigit():
            return jsonify({"error": "O PIN deve conter exatamente quatro números."}), 400
        pin_hash = generate_password_hash(pin)
    if pin_hash:
        db.execute(
            "UPDATE users SET name = ?, is_active = ?, pin_hash = ?, commission_percent = ?, can_serve = CASE WHEN ? = 1 THEN 1 ELSE can_serve END WHERE id = ? AND barbershop_id = ?",
            (name, int(is_active), pin_hash, float(commission_percent), int(is_active), barber_id, session["barbershop_id"])
        )
    else:
        db.execute(
            "UPDATE users SET name = ?, is_active = ?, commission_percent = ?, can_serve = CASE WHEN ? = 1 THEN 1 ELSE can_serve END WHERE id = ? AND barbershop_id = ?",
            (name, int(is_active), float(commission_percent), int(is_active), barber_id, session["barbershop_id"])
        )
    db.commit()
    return jsonify({"message": "Colaborador atualizado.", "barber": {
        "id": barber_id, "name": name, "is_active": is_active,
        "commission_percent": float(commission_percent)
    }}), 200


@admin_bp.route("/barbers/<int:barber_id>", methods=["DELETE"])
@active_owner_required
def deactivate_barber(barber_id):
    cursor = get_db().execute(
        "UPDATE users SET is_active = 0 WHERE id = ? AND barbershop_id = ? AND role = 'barber'",
        (barber_id, session["barbershop_id"])
    )
    get_db().commit()
    if cursor.rowcount == 0:
        return jsonify({"error": "Colaborador não encontrado."}), 404
    return jsonify({"message": "Colaborador desativado. O histórico foi preservado."}), 200


@admin_bp.route("/staff/owner", methods=["PATCH"])
@active_owner_required
def update_owner_provider():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("can_serve"), bool):
        return jsonify({"error": "Informe can_serve como verdadeiro ou falso."}), 400
    db = get_db()
    current = db.execute(
        "SELECT pin_hash, commission_percent FROM users WHERE id = ? AND barbershop_id = ? AND role = 'owner'",
        (session["user_id"], session["barbershop_id"])
    ).fetchone()
    pin_hash = current["pin_hash"] if current else None
    try:
        commission_percent = parse_commission_percent(
            data.get("commission_percent", current["commission_percent"] if current else 0)
        )
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    if data["can_serve"]:
        pin = data.get("pin", "")
        if pin:
            if not isinstance(pin, str) or len(pin) != 4 or not pin.isdigit():
                return jsonify({"error": "O PIN do proprietário deve ter quatro números."}), 400
            pin_hash = generate_password_hash(pin)
        if not pin_hash:
            return jsonify({"error": "Defina um PIN de quatro números para aparecer como profissional."}), 400
    db.execute(
        "UPDATE users SET can_serve = ?, pin_hash = ?, commission_percent = ? WHERE id = ? AND barbershop_id = ? AND role = 'owner'",
        (int(data["can_serve"]), pin_hash, float(commission_percent), session["user_id"], session["barbershop_id"])
    )
    db.commit()
    return jsonify({"message": "Preferência de atendimento do proprietário atualizada."}), 200


@admin_bp.route("/staff/<int:user_id>/schedule", methods=["GET"])
@active_owner_required
def get_staff_schedule(user_id):
    staff = _staff_record(user_id, session["barbershop_id"])
    if staff is None:
        return jsonify({"error": "Profissional não encontrado."}), 404
    rows = get_db().execute(
        """
        SELECT weekday, is_open, open_time, close_time, break_start, break_end
        FROM staff_hours WHERE barbershop_id = ? AND user_id = ?
        ORDER BY weekday
        """,
        (session["barbershop_id"], user_id)
    ).fetchall()
    configured = {row["weekday"]: dict(row) for row in rows}
    return jsonify({"user": dict(staff), "days": [
        configured.get(day, {"weekday": day, "is_open": False,
            "open_time": None, "close_time": None,
            "break_start": None, "break_end": None})
        for day in range(7)
    ], "uses_business_hours_when_unset": not bool(rows)}), 200


@admin_bp.route("/staff/<int:user_id>/schedule", methods=["PUT"])
@active_owner_required
def save_staff_schedule(user_id):
    staff = _staff_record(user_id, session["barbershop_id"])
    if staff is None:
        return jsonify({"error": "Profissional não encontrado."}), 404
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("days"), list) or len(data["days"]) != 7:
        return jsonify({"error": "Envie os sete dias da semana."}), 400
    seen = set()
    normalized = []
    try:
        for item in data["days"]:
            weekday = item.get("weekday") if isinstance(item, dict) else None
            if isinstance(weekday, bool) or not isinstance(weekday, int) or weekday not in range(7) or weekday in seen:
                raise ValueError("Cada dia da semana deve aparecer uma única vez.")
            seen.add(weekday)
            is_open = item.get("is_open")
            if not isinstance(is_open, bool):
                raise ValueError("Selecione se o profissional atende em cada dia.")
            if not is_open:
                normalized.append((weekday, 0, None, None, None, None))
                continue
            opening = validate_clock_time(item.get("open_time"), "abertura")
            closing = validate_clock_time(item.get("close_time"), "fechamento")
            if closing <= opening:
                raise ValueError("O fechamento deve ser depois da abertura.")
            start_break, end_break = item.get("break_start"), item.get("break_end")
            if (start_break is None) != (end_break is None):
                raise ValueError("Informe os dois horários do intervalo.")
            if start_break is not None:
                start_break = validate_clock_time(start_break, "início do intervalo")
                end_break = validate_clock_time(end_break, "fim do intervalo")
                if not opening < start_break < end_break < closing:
                    raise ValueError("O intervalo precisa ficar dentro do expediente.")
            normalized.append((weekday, 1, opening, closing, start_break, end_break))
    except (ValueError, TypeError, AttributeError) as error:
        return jsonify({"error": str(error)}), 400
    db = get_db()
    for weekday, is_open, opening, closing, start_break, end_break in normalized:
        db.execute(
            """
            INSERT INTO staff_hours (barbershop_id, user_id, weekday, is_open,
                open_time, close_time, break_start, break_end)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ON CONFLICT(barbershop_id, user_id, weekday) DO UPDATE SET
                is_open = excluded.is_open, open_time = excluded.open_time,
                close_time = excluded.close_time, break_start = excluded.break_start,
                break_end = excluded.break_end
            """,
            (session["barbershop_id"], user_id, weekday, is_open,
             opening, closing, start_break, end_break)
        )
    db.commit()
    return jsonify({"message": "Horários individuais salvos."}), 200



@admin_bp.route("/staff/<int:user_id>/schedule", methods=["DELETE"])
@active_owner_required
def reset_staff_schedule(user_id):
    """Remove o expediente individual e volta a herdar o expediente da barbearia."""
    staff = _staff_record(user_id, session["barbershop_id"])
    if staff is None:
        return jsonify({"error": "Profissional não encontrado."}), 404

    db = get_db()
    db.execute(
        "DELETE FROM staff_hours WHERE barbershop_id = ? AND user_id = ?",
        (session["barbershop_id"], user_id)
    )
    db.commit()
    return jsonify({
        "message": "Expediente individual removido. O profissional voltou a usar o horário da barbearia."
    }), 200


@admin_bp.route("/products", methods=["GET"])
@active_owner_required
def list_products():
    rows = get_db().execute(
        "SELECT id, name, description, price_cents, is_active FROM products WHERE barbershop_id = ? ORDER BY is_active DESC, name COLLATE NOCASE",
        (session["barbershop_id"],)
    ).fetchall()
    return jsonify({"products": [dict(row) for row in rows]}), 200


@admin_bp.route("/products", methods=["POST"])
@active_owner_required
def create_product():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados do produto em JSON."}), 400
    name = str(data.get("name", "")).strip()
    description = str(data.get("description", "")).strip() or None
    if not name or len(name) > 120 or (description and len(description) > 500):
        return jsonify({"error": "Informe um nome válido e descrição de até 500 caracteres."}), 400
    try:
        price = parse_price_cents(data.get("price"))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    cursor = get_db().execute(
        "INSERT INTO products (barbershop_id, name, description, price_cents) VALUES (?, ?, ?, ?)",
        (session["barbershop_id"], name, description, price)
    )
    get_db().commit()
    return jsonify({"message": "Produto cadastrado.", "product": {
        "id": cursor.lastrowid, "name": name, "description": description,
        "price_cents": price, "is_active": True
    }}), 201


@admin_bp.route("/products/<int:product_id>", methods=["PATCH"])
@active_owner_required
def update_product(product_id):
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not data:
        return jsonify({"error": "Envie os campos para atualizar."}), 400
    db = get_db()
    row = db.execute(
        "SELECT * FROM products WHERE id = ? AND barbershop_id = ?",
        (product_id, session["barbershop_id"])
    ).fetchone()
    if row is None:
        return jsonify({"error": "Produto não encontrado."}), 404
    name = str(data.get("name", row["name"])).strip()
    description = data.get("description", row["description"])
    description = str(description).strip() or None if description is not None else None
    if not name or len(name) > 120 or (description and len(description) > 500):
        return jsonify({"error": "Nome ou descrição inválidos."}), 400
    try:
        price = parse_price_cents(data["price"]) if "price" in data else row["price_cents"]
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    active = data.get("is_active", bool(row["is_active"]))
    if not isinstance(active, bool):
        return jsonify({"error": "is_active deve ser verdadeiro ou falso."}), 400
    db.execute(
        "UPDATE products SET name = ?, description = ?, price_cents = ?, is_active = ? WHERE id = ? AND barbershop_id = ?",
        (name, description, price, int(active), product_id, session["barbershop_id"])
    )
    db.commit()
    return jsonify({"message": "Produto atualizado."}), 200


@admin_bp.route("/products/<int:product_id>", methods=["DELETE"])
@active_owner_required
def deactivate_product(product_id):
    cursor = get_db().execute(
        "UPDATE products SET is_active = 0 WHERE id = ? AND barbershop_id = ?",
        (product_id, session["barbershop_id"])
    )
    get_db().commit()
    if cursor.rowcount == 0:
        return jsonify({"error": "Produto não encontrado."}), 404
    return jsonify({"message": "Produto desativado."}), 200


@admin_bp.route("/barbershop/settings", methods=["POST"])
@active_owner_required
def save_barbershop_settings():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie as configurações em JSON."}), 400
    name = str(data.get("name", "")).strip()
    whatsapp = "".join(ch for ch in str(data.get("whatsapp", "")) if ch.isdigit())
    color = str(data.get("brand_color", "#a8f05a")).strip()
    theme = str(data.get("theme", "dark")).strip().lower()
    import re
    if not name or len(name) > 120:
        return jsonify({"error": "Informe um nome de barbearia válido."}), 400
    if color and not re.fullmatch(r"#[0-9a-fA-F]{6}", color):
        return jsonify({"error": "Escolha uma cor válida."}), 400
    if theme not in {"dark", "light"}:
        return jsonify({"error": "Tema inválido."}), 400
    db = get_db()
    db.execute(
        "UPDATE barbershops SET name = ?, whatsapp = ?, brand_color = ?, theme = ? WHERE id = ?",
        (name, whatsapp or None, color.lower(), theme, session["barbershop_id"])
    )
    db.commit()
    return jsonify({"message": "Identidade da barbearia atualizada."}), 200


def _finance_period(period):
    from datetime import date, timedelta
    today = date.today()
    if period == "today":
        start = end = today
    elif period == "week":
        start = today - timedelta(days=today.weekday())
        end = today
    elif period == "month":
        start = today.replace(day=1)
        end = today
    elif period == "year":
        start = today.replace(month=1, day=1)
        end = today
    else:
        raise ValueError("Período inválido. Use today, week, month ou year.")
    return start.isoformat(), end.isoformat()




def _financial_config(db, barbershop_id):
    costs = db.execute(
        "SELECT id, name, amount_cents FROM fixed_costs WHERE barbershop_id = ? ORDER BY id",
        (barbershop_id,)
    ).fetchall()
    settings = db.execute(
        "SELECT desired_profit_cents FROM financial_settings WHERE barbershop_id = ?",
        (barbershop_id,)
    ).fetchone()
    desired_profit = settings["desired_profit_cents"] if settings else 0
    total_costs = sum(row["amount_cents"] for row in costs)
    return costs, desired_profit, total_costs


def _open_days_in_range(db, barbershop_id, start_date, end_date):
    from datetime import timedelta
    rows = db.execute(
        "SELECT weekday, is_open FROM business_hours WHERE barbershop_id = ?",
        (barbershop_id,)
    ).fetchall()
    if rows:
        open_weekdays = {row["weekday"] for row in rows if row["is_open"]}
    else:
        open_weekdays = set(range(6))
    days = []
    current = start_date
    while current <= end_date:
        if current.weekday() in open_weekdays:
            days.append(current)
        current += timedelta(days=1)
    return days


def _monthly_revenue_target(db, barbershop_id, year, month):
    from calendar import monthrange
    from datetime import date
    _, desired_profit, total_costs = _financial_config(db, barbershop_id)
    month_start = date(year, month, 1)
    month_end = date(year, month, monthrange(year, month)[1])
    open_days = _open_days_in_range(db, barbershop_id, month_start, month_end)
    monthly_target = total_costs + desired_profit
    daily_target = int(round(monthly_target / len(open_days))) if open_days else 0
    return monthly_target, daily_target, len(open_days)


def _goal_targets(db, barbershop_id):
    from datetime import date, timedelta
    today = date.today()
    month_target, daily_target, open_days_month = _monthly_revenue_target(
        db, barbershop_id, today.year, today.month
    )
    week_start = today - timedelta(days=today.weekday())
    week_end = week_start + timedelta(days=6)
    weekly_target = 0
    for day in _open_days_in_range(db, barbershop_id, week_start, week_end):
        _, day_target, _ = _monthly_revenue_target(
            db, barbershop_id, day.year, day.month
        )
        weekly_target += day_target
    return {"daily": daily_target, "weekly": weekly_target, "monthly": month_target}


@admin_bp.route("/finance/config", methods=["GET"])
@active_owner_required
def get_financial_config():
    costs, desired_profit, total_costs = _financial_config(
        get_db(), session["barbershop_id"]
    )
    return jsonify({
        "fixed_costs": [dict(row) for row in costs],
        "fixed_costs_total_cents": total_costs,
        "desired_profit_cents": desired_profit
    }), 200


@admin_bp.route("/finance/config", methods=["PUT"])
@active_owner_required
def save_financial_config():
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("fixed_costs"), list):
        return jsonify({"error": "Informe as despesas fixas e o lucro desejado."}), 400
    try:
        desired_profit = parse_price_cents(data.get("desired_profit", 0))
        if len(data["fixed_costs"]) > 50:
            raise ValueError("Cadastre no máximo 50 despesas fixas.")
        normalized = []
        for item in data["fixed_costs"]:
            if not isinstance(item, dict):
                raise ValueError("Uma das despesas está inválida.")
            name = str(item.get("name", "")).strip()
            amount = parse_price_cents(item.get("amount"))
            if not name or len(name) > 100 or amount <= 0:
                raise ValueError("Cada despesa precisa de nome e valor maior que zero.")
            normalized.append((name, amount))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400

    db = get_db()
    barbershop_id = session["barbershop_id"]
    db.execute("DELETE FROM fixed_costs WHERE barbershop_id = ?", (barbershop_id,))
    db.executemany(
        "INSERT INTO fixed_costs (barbershop_id, name, amount_cents) VALUES (?, ?, ?)",
        [(barbershop_id, name, amount) for name, amount in normalized]
    )
    db.execute(
        """
        INSERT INTO financial_settings (barbershop_id, desired_profit_cents)
        VALUES (?, ?)
        ON CONFLICT(barbershop_id) DO UPDATE SET
            desired_profit_cents = excluded.desired_profit_cents,
            updated_at = CURRENT_TIMESTAMP
        """,
        (barbershop_id, desired_profit)
    )
    db.commit()
    return jsonify({"message": "Despesas fixas e lucro desejado salvos."}), 200


@admin_bp.route("/finance/summary", methods=["GET"])
@active_owner_required
def finance_summary():
    from datetime import date
    period = request.args.get("period", "month")
    try:
        start, end = _finance_period(period)
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    db = get_db()
    # Reconcilia atendimentos concluídos antes da implantação do livro-caixa.
    db.execute(
        """
        INSERT OR IGNORE INTO finance_entries
            (barbershop_id, entry_type, description, category, amount_cents, entry_date, appointment_id)
        SELECT barbershop_id, 'income', 'Atendimento concluído: ' || service_name,
               'Atendimentos', price_cents, date(starts_at), id
        FROM appointments
        WHERE barbershop_id = ? AND status = 'completed'
        """,
        (session["barbershop_id"],)
    )
    db.commit()
    totals = db.execute(
        """
        SELECT
            COALESCE(SUM(CASE WHEN entry_type = 'income' THEN amount_cents ELSE 0 END), 0) AS income,
            COALESCE(SUM(CASE WHEN entry_type = 'expense' THEN amount_cents ELSE 0 END), 0) AS expenses,
            COUNT(*) AS count
        FROM finance_entries
        WHERE barbershop_id = ? AND entry_date >= ? AND entry_date <= ?
        """,
        (session["barbershop_id"], start, end)
    ).fetchone()
    goals = _goal_targets(db, session["barbershop_id"])
    goal_achieved = {}
    for goal_period in ("daily", "weekly", "monthly"):
        goal_start, goal_end = _finance_period({
            "daily": "today", "weekly": "week", "monthly": "month"
        }[goal_period])
        achieved = db.execute(
            """
            SELECT COALESCE(SUM(price_cents), 0) AS amount
            FROM appointments
            WHERE barbershop_id = ? AND status = 'completed'
              AND date(starts_at) >= ? AND date(starts_at) <= ?
            """,
            (session["barbershop_id"], goal_start, goal_end)
        ).fetchone()
        goal_achieved[goal_period] = achieved["amount"]
    _, desired_profit, fixed_costs_total = _financial_config(
        db, session["barbershop_id"]
    )
    return jsonify({
        "period": period, "start": start, "end": end,
        "income_cents": totals["income"], "expense_cents": totals["expenses"],
        "profit_cents": totals["income"] - totals["expenses"],
        "entry_count": totals["count"],
        "goals": goals,
        "goal_achieved": goal_achieved,
        "fixed_costs_total_cents": fixed_costs_total,
        "desired_profit_cents": desired_profit
    }), 200


@admin_bp.route("/finance/entries", methods=["GET"])
@active_owner_required
def list_finance_entries():
    from datetime import date
    start = request.args.get("from")
    end = request.args.get("to")
    conditions = ["barbershop_id = ?"]
    params = [session["barbershop_id"]]
    for value, operator, label in ((start, ">=", "inicial"), (end, "<=", "final")):
        if value:
            try:
                date.fromisoformat(value)
            except ValueError:
                return jsonify({"error": f"Data {label} inválida."}), 400
            conditions.append(f"entry_date {operator} ?")
            params.append(value)
    rows = get_db().execute(
        f"SELECT id, entry_type, description, category, amount_cents, entry_date, appointment_id FROM finance_entries WHERE {' AND '.join(conditions)} ORDER BY entry_date DESC, id DESC LIMIT 500",
        params
    ).fetchall()
    return jsonify({"entries": [dict(row) for row in rows]}), 200


@admin_bp.route("/finance/entries", methods=["POST"])
@active_owner_required
def create_finance_entry():
    from datetime import date
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie o lançamento em JSON."}), 400
    entry_type = data.get("entry_type")
    description = str(data.get("description", "")).strip()
    category = str(data.get("category", "")).strip() or None
    try:
        amount = parse_price_cents(data.get("amount"))
        entry_date = date.fromisoformat(str(data.get("entry_date", date.today().isoformat())))
    except (ValueError, TypeError) as error:
        return jsonify({"error": str(error) or "Valor ou data inválidos."}), 400
    if entry_type not in {"income", "expense"}:
        return jsonify({"error": "Selecione entrada ou saída."}), 400
    if not description or len(description) > 160 or amount <= 0:
        return jsonify({"error": "Informe descrição e valor maior que zero."}), 400
    cursor = get_db().execute(
        "INSERT INTO finance_entries (barbershop_id, entry_type, description, category, amount_cents, entry_date) VALUES (?, ?, ?, ?, ?, ?)",
        (session["barbershop_id"], entry_type, description, category, amount, entry_date.isoformat())
    )
    get_db().commit()
    return jsonify({"message": "Lançamento salvo.", "id": cursor.lastrowid}), 201


@admin_bp.route("/finance/entries/<int:entry_id>", methods=["DELETE"])
@active_owner_required
def delete_finance_entry(entry_id):
    cursor = get_db().execute(
        "DELETE FROM finance_entries WHERE id = ? AND barbershop_id = ? AND appointment_id IS NULL",
        (entry_id, session["barbershop_id"])
    )
    get_db().commit()
    if cursor.rowcount == 0:
        return jsonify({"error": "Lançamento manual não encontrado."}), 404
    return jsonify({"message": "Lançamento removido."}), 200


@admin_bp.route("/finance/goals", methods=["PUT"])
@active_owner_required
def save_financial_goals():
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie as metas em JSON."}), 400
    normalized = []
    try:
        for period in ("daily", "weekly", "monthly"):
            value = parse_price_cents(data.get(period, 0))
            normalized.append((period, value))
    except ValueError as error:
        return jsonify({"error": str(error)}), 400
    db = get_db()
    for period, target in normalized:
        db.execute(
            """
            INSERT INTO financial_goals (barbershop_id, period_type, target_cents)
            VALUES (?, ?, ?)
            ON CONFLICT(barbershop_id, period_type) DO UPDATE SET
                target_cents = excluded.target_cents, updated_at = CURRENT_TIMESTAMP
            """,
            (session["barbershop_id"], period, target)
        )
    db.commit()
    return jsonify({"message": "Metas financeiras atualizadas."}), 200




@admin_bp.route("/appointments/<int:appointment_id>/barber", methods=["PATCH"])
@active_owner_required
def update_appointment_barber(appointment_id):
    """Permite ao proprietário trocar o profissional de um agendamento ativo."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Informe o profissional do agendamento."}), 400
    raw_barber_id = data.get("barber_id")
    barber_id = None
    commission_percent = None
    if raw_barber_id not in (None, ""):
        try:
            barber_id = int(raw_barber_id)
        except (TypeError, ValueError):
            return jsonify({"error": "Selecione um profissional válido."}), 400
        staff = get_db().execute(
            """SELECT id, role, can_serve, commission_percent FROM users
               WHERE id = ? AND barbershop_id = ? AND is_active = 1
                 AND (role = 'barber' OR (role = 'owner' AND can_serve = 1))""",
            (barber_id, session["barbershop_id"])
        ).fetchone()
        if staff is None:
            return jsonify({"error": "Esse profissional não está disponível para atendimento."}), 400
        commission_percent = staff["commission_percent"] or 0
    db = get_db()
    appointment = db.execute(
        """SELECT id, starts_at, ends_at, status FROM appointments
           WHERE id = ? AND barbershop_id = ?""",
        (appointment_id, session["barbershop_id"])
    ).fetchone()
    if appointment is None:
        return jsonify({"error": "Agendamento não encontrado."}), 404
    if appointment["status"] != "scheduled":
        return jsonify({"error": "Só é possível editar o barbeiro de um agendamento ativo."}), 409
    if barber_id is not None:
        conflict = db.execute(
            """SELECT id FROM appointments WHERE barbershop_id = ? AND barber_id = ?
               AND id <> ? AND status = 'scheduled' AND starts_at < ? AND ends_at > ? LIMIT 1""",
            (session["barbershop_id"], barber_id, appointment_id, appointment["ends_at"], appointment["starts_at"])
        ).fetchone()
        if conflict:
            return jsonify({"error": "Esse profissional já possui outro atendimento nesse horário."}), 409
    db.execute(
        """UPDATE appointments SET barber_id = ?, commission_percent = ?, commission_cents = 0
           WHERE id = ? AND barbershop_id = ? AND status = 'scheduled'""",
        (barber_id, commission_percent, appointment_id, session["barbershop_id"])
    )
    db.commit()
    return jsonify({"message": "Profissional do agendamento atualizado."}), 200


@admin_bp.route("/appointments/<int:appointment_id>/complete", methods=["POST"])
@active_owner_required
def complete_appointment_admin(appointment_id):
    db = get_db()
    row = db.execute(
        """
        SELECT appointments.id, appointments.service_name,
               appointments.price_cents, appointments.starts_at,
               appointments.commission_percent,
               users.commission_percent AS current_commission_percent
        FROM appointments
        LEFT JOIN users
          ON users.id = appointments.barber_id
         AND users.barbershop_id = appointments.barbershop_id
        WHERE appointments.id = ? AND appointments.barbershop_id = ?
          AND appointments.status = 'scheduled'
        """,
        (appointment_id, session["barbershop_id"])
    ).fetchone()
    if row is None:
        return jsonify({"error": "Agendamento ativo não encontrado."}), 404
    commission_percent = (
        row["commission_percent"]
        if row["commission_percent"] is not None
        else (row["current_commission_percent"] or 0)
    )
    commission_cents = int((
        Decimal(row["price_cents"]) * Decimal(str(commission_percent)) / Decimal("100")
    ).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
    db.execute(
        """UPDATE appointments
           SET status = 'completed', commission_percent = ?, commission_cents = ?
           WHERE id = ? AND barbershop_id = ?""",
        (commission_percent, commission_cents, appointment_id, session["barbershop_id"])
    )
    db.execute(
        """
        INSERT OR IGNORE INTO finance_entries
            (barbershop_id, entry_type, description, category, amount_cents, entry_date, appointment_id)
        VALUES (?, 'income', ?, 'Atendimentos', ?, date(?), ?)
        """,
        (session["barbershop_id"], "Atendimento concluído: " + row["service_name"],
         row["price_cents"], row["starts_at"], appointment_id)
    )
    db.commit()
    return jsonify({"message": "Atendimento concluído e registrado no financeiro."}), 200
