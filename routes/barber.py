"""
BARBER-SYSTEM
Autenticação e área do colaborador/barbeiro.

O profissional entra pelo endereço da própria barbearia,
informando seu identificador e PIN de quatro dígitos.
As tentativas são limitadas e registradas no banco.
"""

import re
import time
from datetime import date, datetime, timedelta
from decimal import Decimal, ROUND_HALF_UP
from functools import wraps

from flask import Blueprint, jsonify, request, session, render_template
from werkzeug.security import check_password_hash

from database import get_db


barber_bp = Blueprint("barber", __name__, url_prefix="/barber")

MAX_PIN_ATTEMPTS = 5
PIN_WINDOW_SECONDS = 15 * 60
PIN_LOCK_SECONDS = 15 * 60


def barber_required(view):
    """Permite acesso somente ao colaborador autenticado e ainda ativo."""

    @wraps(view)
    def wrapped_view(*args, **kwargs):
        if session.get("user_role") != "barber" or not session.get("user_id"):
            return jsonify({"error": "Acesso não autorizado. Faça login."}), 401

        barber = get_db().execute(
            """
            SELECT id
            FROM users
            WHERE id = ?
              AND barbershop_id = ?
              AND role IN ('barber', 'owner')
              AND is_active = 1
              AND (role = 'barber' OR can_serve = 1)
            """,
            (session["user_id"], session.get("barbershop_id"))
        ).fetchone()

        if barber is None:
            session.clear()
            return jsonify({
                "error": "Sessão inválida. Faça login novamente."
            }), 401

        return view(*args, **kwargs)

    return wrapped_view


@barber_bp.route("/<slug>/<int:barber_id>/login", methods=["POST"])
def login_barber(slug, barber_id):
    """Autentica um barbeiro pelo PIN e aplica bloqueio temporário."""

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie o PIN em formato JSON."}), 400

    pin = data.get("pin", "")
    if not isinstance(pin, str) or len(pin) != 4 or not pin.isdigit():
        return jsonify({"error": "O PIN deve conter quatro números."}), 400

    db = get_db()

    barber = db.execute(
        """
        SELECT users.id, users.barbershop_id, users.name, users.pin_hash,
               users.commission_percent, barbershops.slug
        FROM users
        INNER JOIN barbershops
            ON barbershops.id = users.barbershop_id
        WHERE barbershops.slug = ?
          AND users.id = ?
          AND users.role IN ('barber', 'owner')
          AND users.is_active = 1
          AND (users.role = 'barber' OR users.can_serve = 1)
          AND users.pin_hash IS NOT NULL
        """,
        (slug, barber_id)
    ).fetchone()

    if barber is None or not barber["pin_hash"]:
        return jsonify({"error": "PIN ou acesso inválido."}), 401

    # O endereço IP integra a chave de limitação. Em produção, se houver
    # proxy reverso, a aplicação deverá confiar somente no proxy configurado.
    ip_address = request.remote_addr or "unknown"
    scope_key = f"barber-pin:{barber['barbershop_id']}:{barber_id}:{ip_address}"
    now = int(time.time())

    db.execute("BEGIN IMMEDIATE")
    attempt = db.execute(
        """
        SELECT failed_attempts, window_started_at, locked_until
        FROM login_attempts
        WHERE scope_key = ?
        """,
        (scope_key,)
    ).fetchone()

    if attempt and attempt["locked_until"] and attempt["locked_until"] > now:
        db.rollback()
        return jsonify({
            "error": "Muitas tentativas. Aguarde 15 minutos para tentar novamente."
        }), 429

    if attempt is None or now - attempt["window_started_at"] >= PIN_WINDOW_SECONDS:
        failed_attempts = 0
        window_started_at = now
    else:
        failed_attempts = attempt["failed_attempts"]
        window_started_at = attempt["window_started_at"]

    valid_pin = check_password_hash(barber["pin_hash"], pin)

    if not valid_pin:
        failed_attempts += 1
        locked_until = (
            now + PIN_LOCK_SECONDS
            if failed_attempts >= MAX_PIN_ATTEMPTS
            else None
        )

        db.execute(
            """
            INSERT INTO login_attempts (
                scope_key, failed_attempts, window_started_at, locked_until
            )
            VALUES (?, ?, ?, ?)
            ON CONFLICT(scope_key) DO UPDATE SET
                failed_attempts = excluded.failed_attempts,
                window_started_at = excluded.window_started_at,
                locked_until = excluded.locked_until
            """,
            (scope_key, failed_attempts, window_started_at, locked_until)
        )
        db.commit()

        if locked_until:
            return jsonify({
                "error": "Limite de tentativas atingido. Acesso bloqueado por 15 minutos."
            }), 429

        return jsonify({"error": "PIN ou acesso inválido."}), 401

    db.execute(
        "DELETE FROM login_attempts WHERE scope_key = ?",
        (scope_key,)
    )
    db.commit()

    session.clear()
    session["user_id"] = barber["id"]
    session["barbershop_id"] = barber["barbershop_id"]
    session["user_role"] = "barber"

    return jsonify({
        "message": "Login realizado com sucesso.",
        "barber": {
            "id": barber["id"],
            "name": barber["name"],
            "role": "barber",
            "commission_percent": barber["commission_percent"]
        },
        "barbershop": {
            "slug": barber["slug"]
        }
    }), 200


@barber_bp.route("/me", methods=["GET"])
@barber_required
def current_barber():
    """Retorna somente os dados básicos do profissional autenticado."""

    barber = get_db().execute(
        """
        SELECT id, barbershop_id, name, role, commission_percent
        FROM users
        WHERE id = ? AND barbershop_id = ?
        """,
        (session["user_id"], session["barbershop_id"])
    ).fetchone()

    return jsonify({
        "id": barber["id"],
        "barbershop_id": barber["barbershop_id"],
        "name": barber["name"],
        "role": barber["role"],
        "commission_percent": barber["commission_percent"]
    }), 200


@barber_bp.route("/logout", methods=["POST"])
def logout_barber():
    """Encerra a sessão atual do colaborador."""

    if session.get("user_role") != "barber":
        return jsonify({"error": "Nenhuma sessão de barbeiro ativa."}), 401

    session.clear()
    return jsonify({"message": "Logout realizado com sucesso."}), 200



@barber_bp.route("/appointments", methods=["GET"])
@barber_required
def barber_appointments():
    """Lista somente os atendimentos do barbeiro autenticado."""

    from datetime import date

    date_filter = request.args.get("date")
    status_filter = request.args.get("status")

    if date_filter:
        try:
            date.fromisoformat(date_filter)
        except ValueError:
            return jsonify({"error": "A data deve usar AAAA-MM-DD."}), 400

    if status_filter and status_filter not in {"scheduled", "completed", "cancelled"}:
        return jsonify({"error": "Status inválido."}), 400

    conditions = [
        "appointments.barbershop_id = ?",
        "appointments.barber_id = ?"
    ]
    params = [session["barbershop_id"], session["user_id"]]

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
        SELECT appointments.id, appointments.service_name,
               appointments.price_cents, appointments.duration_minutes,
               appointments.starts_at, appointments.ends_at,
               appointments.status, appointments.cancellation_reason,
               customers.name AS customer_name
        FROM appointments
        INNER JOIN customers
          ON customers.id = appointments.customer_id
         AND customers.barbershop_id = appointments.barbershop_id
        WHERE {" AND ".join(conditions)}
        ORDER BY appointments.starts_at
        LIMIT 300
        """,
        params
    ).fetchall()

    return jsonify({
        "appointments": [
            {
                "id": row["id"],
                "customer_name": row["customer_name"],
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



def _phone_digits(value):
    return re.sub(r"\D", "", str(value or ""))


def _clock_value(value, field_name):
    try:
        return datetime.strptime(str(value), "%H:%M").strftime("%H:%M")
    except (TypeError, ValueError):
        raise ValueError(field_name + " deve usar HH:MM.")


def _staff_hours_for_day(db, barbershop_id, user_id, weekday):
    business = db.execute(
        """SELECT is_open, open_time, close_time, break_start, break_end
           FROM business_hours WHERE barbershop_id = ? AND weekday = ?""",
        (barbershop_id, weekday)
    ).fetchone()
    personal = db.execute(
        """SELECT is_open, open_time, close_time, break_start, break_end
           FROM staff_hours WHERE barbershop_id = ? AND user_id = ? AND weekday = ?""",
        (barbershop_id, user_id, weekday)
    ).fetchone()
    return business, personal, personal if personal is not None else business

def _staff_break_for_day(db, barbershop_id, user_id, weekday):
    return db.execute(
        """SELECT break_start, break_end FROM staff_breaks
           WHERE barbershop_id = ? AND user_id = ? AND weekday = ?""",
        (barbershop_id, user_id, weekday)
    ).fetchone()



@barber_bp.route("/customers", methods=["GET"])
@barber_required
def barber_customers():
    """Lista apenas nomes de clientes já cadastrados pelo administrador."""
    rows = get_db().execute(
        """SELECT id, name FROM customers
           WHERE barbershop_id = ?
           ORDER BY name COLLATE NOCASE
           LIMIT 1000""",
        (session["barbershop_id"],)
    ).fetchall()
    return jsonify({
        "customers": [{"id": row["id"], "name": row["name"]} for row in rows]
    }), 200


@barber_bp.route("/services", methods=["GET"])
@barber_required
def barber_services():
    """Lista os serviços ativos para agendamentos feitos pelo profissional."""
    rows = get_db().execute(
        """SELECT id, name, price_cents, duration_minutes
           FROM services
           WHERE barbershop_id = ? AND is_active = 1
           ORDER BY name COLLATE NOCASE""",
        (session["barbershop_id"],)
    ).fetchall()
    return jsonify({"services": [dict(row) for row in rows]}), 200


@barber_bp.route("/availability", methods=["GET"])
@barber_required
def barber_availability():
    """Calcula horários livres apenas para o profissional autenticado."""
    try:
        service_id = int(request.args.get("service_id", ""))
        selected_day = date.fromisoformat(request.args.get("date", ""))
    except (TypeError, ValueError):
        return jsonify({"error": "Informe um serviço e uma data válida."}), 400

    db = get_db()
    service = db.execute(
        """SELECT duration_minutes FROM services
           WHERE id = ? AND barbershop_id = ? AND is_active = 1""",
        (service_id, session["barbershop_id"])
    ).fetchone()
    if service is None:
        return jsonify({"error": "Serviço não encontrado ou inativo."}), 404

    business, personal, effective = _staff_hours_for_day(
        db, session["barbershop_id"], session["user_id"], selected_day.weekday()
    )
    if (business is None or not business["is_open"]
            or effective is None or not effective["is_open"]):
        return jsonify({"date": selected_day.isoformat(), "slots": []}), 200

    opening = datetime.combine(selected_day, datetime.strptime(effective["open_time"], "%H:%M").time())
    closing = datetime.combine(selected_day, datetime.strptime(effective["close_time"], "%H:%M").time())
    duration = timedelta(minutes=service["duration_minutes"])
    day_start = f"{selected_day.isoformat()}T00:00:00"
    day_end = f"{selected_day.isoformat()}T23:59:59"

    blocks = db.execute(
        """SELECT starts_at, ends_at FROM time_blocks
           WHERE barbershop_id = ? AND (barber_id IS NULL OR barber_id = ?)
             AND starts_at < ? AND ends_at > ?""",
        (session["barbershop_id"], session["user_id"], day_end, day_start)
    ).fetchall()
    appointments = db.execute(
        """SELECT starts_at, ends_at FROM appointments
           WHERE barbershop_id = ? AND barber_id = ? AND status = 'scheduled'
             AND starts_at < ? AND ends_at > ?""",
        (session["barbershop_id"], session["user_id"], day_end, day_start)
    ).fetchall()
    occupied = [
        (datetime.fromisoformat(row["starts_at"]), datetime.fromisoformat(row["ends_at"]))
        for row in list(blocks) + list(appointments)
    ]

    staff_break = _staff_break_for_day(
        db, session["barbershop_id"], session["user_id"], selected_day.weekday()
    )
    breaks = []
    for schedule in (business, personal, staff_break):
        if schedule is not None and schedule["break_start"] and schedule["break_end"]:
            breaks.append((
                datetime.combine(selected_day, datetime.strptime(schedule["break_start"], "%H:%M").time()),
                datetime.combine(selected_day, datetime.strptime(schedule["break_end"], "%H:%M").time())
            ))

    business_open = datetime.combine(selected_day, datetime.strptime(business["open_time"], "%H:%M").time())
    business_close = datetime.combine(selected_day, datetime.strptime(business["close_time"], "%H:%M").time())
    slots = []
    candidate = opening
    while candidate + duration <= closing:
        candidate_end = candidate + duration
        inside_business = candidate >= business_open and candidate_end <= business_close
        overlaps_break = any(candidate < break_end and candidate_end > break_start for break_start, break_end in breaks)
        overlaps_busy = any(candidate < busy_end and candidate_end > busy_start for busy_start, busy_end in occupied)
        if inside_business and not overlaps_break and not overlaps_busy:
            slots.append(candidate.strftime("%H:%M"))
        candidate += timedelta(minutes=15)

    return jsonify({"date": selected_day.isoformat(), "slots": slots}), 200


@barber_bp.route("/appointments", methods=["POST"])
@barber_required
def create_barber_appointment():
    """Permite ao profissional cadastrar um cliente e reservar um serviço na própria agenda."""
    from datetime import datetime

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Informe os dados do agendamento."}), 400

    try:
        customer_id = int(data.get("customer_id"))
        service_id = int(data.get("service_id"))
        if customer_id <= 0:
            raise ValueError

        starts_value = data.get("starts_at")
        if not isinstance(starts_value, str):
            raise ValueError
        starts = datetime.fromisoformat(starts_value)
        if starts.tzinfo is not None or starts.second or starts.microsecond:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({"error": "Selecione um serviço e um horário válido."}), 400

    db = get_db()
    shop_id = session["barbershop_id"]
    user_id = session["user_id"]

    try:
        db.execute("BEGIN IMMEDIATE")
        service = db.execute(
            """SELECT id, name, price_cents, duration_minutes
               FROM services WHERE id = ? AND barbershop_id = ? AND is_active = 1""",
            (service_id, shop_id)
        ).fetchone()
        professional = db.execute(
            """SELECT commission_percent FROM users
               WHERE id = ? AND barbershop_id = ? AND is_active = 1""",
            (user_id, shop_id)
        ).fetchone()
        customer = db.execute(
            """SELECT id, name FROM customers
               WHERE id = ? AND barbershop_id = ?""",
            (customer_id, shop_id)
        ).fetchone()
        if service is None or professional is None:
            db.rollback()
            return jsonify({"error": "Serviço ou profissional indisponível."}), 404
        if customer is None:
            db.rollback()
            return jsonify({"error": "Cliente não encontrado. Peça ao administrador para cadastrá-lo."}), 404

        ends = starts + timedelta(minutes=service["duration_minutes"])
        if ends.date() != starts.date():
            db.rollback()
            return jsonify({"error": "O serviço precisa terminar no mesmo dia."}), 409

        business, personal, effective = _staff_hours_for_day(db, shop_id, user_id, starts.weekday())
        start_clock, end_clock = starts.strftime("%H:%M"), ends.strftime("%H:%M")
        if (business is None or not business["is_open"]
                or effective is None or not effective["is_open"]
                or start_clock < business["open_time"] or end_clock > business["close_time"]
                or start_clock < effective["open_time"] or end_clock > effective["close_time"]):
            db.rollback()
            return jsonify({"error": "Esse horário está fora do expediente."}), 409

        staff_break = _staff_break_for_day(db, shop_id, user_id, starts.weekday())
        for schedule in (business, personal, staff_break):
            if (schedule is not None and schedule["break_start"] and schedule["break_end"]
                    and start_clock < schedule["break_end"] and end_clock > schedule["break_start"]):
                db.rollback()
                return jsonify({"error": "Esse horário coincide com o intervalo."}), 409

        starts_text = starts.strftime("%Y-%m-%dT%H:%M:%S")
        ends_text = ends.strftime("%Y-%m-%dT%H:%M:%S")
        block = db.execute(
            """SELECT id FROM time_blocks
               WHERE barbershop_id = ? AND (barber_id IS NULL OR barber_id = ?)
                 AND starts_at < ? AND ends_at > ? LIMIT 1""",
            (shop_id, user_id, ends_text, starts_text)
        ).fetchone()
        if block:
            db.rollback()
            return jsonify({"error": "Você ou a barbearia está indisponível nesse horário."}), 409

        conflict = db.execute(
            """SELECT id FROM appointments
               WHERE barbershop_id = ? AND barber_id = ? AND status = 'scheduled'
                 AND starts_at < ? AND ends_at > ? LIMIT 1""",
            (shop_id, user_id, ends_text, starts_text)
        ).fetchone()
        if conflict:
            db.rollback()
            return jsonify({"error": "Esse horário acabou de ser ocupado. Escolha outro."}), 409

        cursor = db.execute(
            """INSERT INTO appointments (
                   barbershop_id, customer_id, service_id, barber_id,
                   service_name, price_cents, duration_minutes, starts_at, ends_at,
                   commission_percent, status
               ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')""",
            (shop_id, customer_id, service_id, user_id, service["name"],
             service["price_cents"], service["duration_minutes"], starts_text,
             ends_text, professional["commission_percent"])
        )
        db.commit()
    except Exception:
        db.rollback()
        raise

    return jsonify({
        "message": "Agendamento criado com sucesso.",
        "appointment": {
            "id": cursor.lastrowid,
            "customer_name": customer["name"],
            "service_name": service["name"],
            "price_cents": service["price_cents"],
            "duration_minutes": service["duration_minutes"],
            "starts_at": starts_text,
            "ends_at": ends_text,
            "status": "scheduled"
        }
    }), 201


@barber_bp.route("/schedule", methods=["GET"])
@barber_required
def get_barber_schedule():
    """Retorna expediente efetivo e intervalo individual do profissional."""
    db = get_db()
    business_rows = db.execute(
        """SELECT weekday, is_open, open_time, close_time, break_start, break_end
           FROM business_hours WHERE barbershop_id = ? ORDER BY weekday""",
        (session["barbershop_id"],)
    ).fetchall()
    personal_rows = db.execute(
        """SELECT weekday, is_open, open_time, close_time, break_start, break_end
           FROM staff_hours WHERE barbershop_id = ? AND user_id = ? ORDER BY weekday""",
        (session["barbershop_id"], session["user_id"])
    ).fetchall()
    break_rows = db.execute(
        """SELECT weekday, break_start, break_end FROM staff_breaks
           WHERE barbershop_id = ? AND user_id = ? ORDER BY weekday""",
        (session["barbershop_id"], session["user_id"])
    ).fetchall()
    business = {row["weekday"]: dict(row) for row in business_rows}
    personal = {row["weekday"]: dict(row) for row in personal_rows}
    individual_breaks = {row["weekday"]: dict(row) for row in break_rows}
    days = []
    for weekday in range(7):
        base = business.get(weekday, {
            "weekday": weekday, "is_open": False, "open_time": None,
            "close_time": None, "break_start": None, "break_end": None
        })
        own = personal.get(weekday)
        own_break = individual_breaks.get(weekday)
        effective = own if own is not None else base
        if own_break is not None:
            break_start, break_end = own_break["break_start"], own_break["break_end"]
        elif own is not None and own["break_start"]:
            break_start, break_end = own["break_start"], own["break_end"]
        else:
            break_start, break_end = base["break_start"], base["break_end"]
        days.append({
            "weekday": weekday,
            "is_open": bool(effective["is_open"]),
            "open_time": effective["open_time"],
            "close_time": effective["close_time"],
            "break_start": break_start,
            "break_end": break_end,
            "has_personal_schedule": own is not None,
            "has_individual_break": own_break is not None,
            "business_break_start": base["break_start"],
            "business_break_end": base["break_end"]
        })
    return jsonify({"days": days}), 200


@barber_bp.route("/schedule", methods=["PUT"])
@barber_required
def update_barber_lunch_breaks():
    """Permite ao profissional configurar seu almoço sem alterar o expediente-base."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict) or not isinstance(data.get("days"), list) or len(data["days"]) != 7:
        return jsonify({"error": "Envie a pausa dos sete dias da semana."}), 400

    db = get_db()
    shop_id, user_id = session["barbershop_id"], session["user_id"]
    seen, normalized = set(), []
    try:
        for item in data["days"]:
            if not isinstance(item, dict):
                raise ValueError("Dados de dia inválidos.")
            weekday = item.get("weekday")
            if isinstance(weekday, bool) or not isinstance(weekday, int) or weekday not in range(7) or weekday in seen:
                raise ValueError("Cada dia deve aparecer uma única vez.")
            seen.add(weekday)

            business, own, effective = _staff_hours_for_day(db, shop_id, user_id, weekday)
            start = item.get("break_start") or None
            end = item.get("break_end") or None
            if (start is None) != (end is None):
                raise ValueError("Informe início e fim do almoço, ou deixe os dois vazios.")

            if start is not None:
                if business is None or not business["is_open"] or effective is None or not effective["is_open"]:
                    raise ValueError("Não é possível definir almoço em um dia sem expediente.")
                start = _clock_value(start, "Início do almoço")
                end = _clock_value(end, "Fim do almoço")
                opening, closing = effective["open_time"], effective["close_time"]
                if not opening < start < end < closing:
                    raise ValueError("O almoço precisa ficar dentro do seu expediente.")

                # Não permite criar pausa recorrente sobre atendimentos futuros.
                bookings = db.execute(
                    """SELECT starts_at, ends_at FROM appointments
                       WHERE barbershop_id = ? AND barber_id = ? AND status = 'scheduled'
                         AND starts_at >= ?""",
                    (shop_id, user_id, datetime.now().strftime("%Y-%m-%dT00:00:00"))
                ).fetchall()
                for booking in bookings:
                    booking_start = datetime.fromisoformat(booking["starts_at"])
                    booking_end = datetime.fromisoformat(booking["ends_at"])
                    if booking_start.weekday() == weekday:
                        if booking_start.strftime("%H:%M") < end and booking_end.strftime("%H:%M") > start:
                            raise ValueError("Já existe um agendamento futuro nesse horário de almoço. Ajuste ou remarque primeiro.")

            normalized.append((weekday, start, end))
    except (ValueError, TypeError, AttributeError) as error:
        return jsonify({"error": str(error)}), 400

    for weekday, start, end in normalized:
        if start is None:
            db.execute(
                "DELETE FROM staff_breaks WHERE barbershop_id = ? AND user_id = ? AND weekday = ?",
                (shop_id, user_id, weekday)
            )
        else:
            db.execute(
                """INSERT INTO staff_breaks (
                       barbershop_id, user_id, weekday, break_start, break_end
                   ) VALUES (?, ?, ?, ?, ?)
                   ON CONFLICT(barbershop_id, user_id, weekday) DO UPDATE SET
                       break_start = excluded.break_start,
                       break_end = excluded.break_end""",
                (shop_id, user_id, weekday, start, end)
            )
    db.commit()
    return jsonify({"message": "Horários de almoço atualizados."}), 200


@barber_bp.route("/commissions", methods=["GET"])
@barber_required
def barber_commissions():
    """Mostra somente a comissão do profissional autenticado por período."""
    from calendar import monthrange

    period = request.args.get("period", "weekly")
    today = date.today()
    if period == "daily":
        start = end = today
    elif period == "weekly":
        start = today - timedelta(days=today.weekday())
        end = start + timedelta(days=6)
    elif period == "monthly":
        start = today.replace(day=1)
        end = today.replace(day=monthrange(today.year, today.month)[1])
    elif period == "yearly":
        start = date(today.year, 1, 1)
        end = date(today.year, 12, 31)
    else:
        return jsonify({"error": "Período inválido."}), 400

    row = get_db().execute(
        """SELECT COUNT(*) AS completed_count,
                  COALESCE(SUM(price_cents), 0) AS sales_cents,
                  COALESCE(SUM(commission_cents), 0) AS commission_cents
           FROM appointments
           WHERE barbershop_id = ? AND barber_id = ? AND status = 'completed'
             AND date(starts_at) BETWEEN ? AND ?""",
        (session["barbershop_id"], session["user_id"], start.isoformat(), end.isoformat())
    ).fetchone()
    user = get_db().execute(
        "SELECT commission_percent FROM users WHERE id = ? AND barbershop_id = ?",
        (session["user_id"], session["barbershop_id"])
    ).fetchone()
    return jsonify({
        "period": period,
        "start": start.isoformat(),
        "end": end.isoformat(),
        "commission_percent": user["commission_percent"] if user else 0,
        "completed_count": row["completed_count"],
        "sales_cents": row["sales_cents"],
        "commission_cents": row["commission_cents"]
    }), 200


@barber_bp.route("/appointments/<int:appointment_id>/complete", methods=["POST"])
@barber_required
def complete_barber_appointment(appointment_id):
    """Marca como concluído somente um atendimento do barbeiro logado."""

    db = get_db()
    appointment = db.execute(
        """
        SELECT appointments.id, appointments.service_name,
               appointments.price_cents, appointments.starts_at,
               appointments.commission_percent,
               users.commission_percent AS current_commission_percent
        FROM appointments
        INNER JOIN users
          ON users.id = appointments.barber_id
         AND users.barbershop_id = appointments.barbershop_id
        WHERE appointments.id = ? AND appointments.barbershop_id = ?
          AND appointments.barber_id = ? AND appointments.status = 'scheduled'
        """,
        (appointment_id, session["barbershop_id"], session["user_id"])
    ).fetchone()
    if appointment is None:
        return jsonify({"error": "Atendimento ativo não encontrado na sua agenda."}), 404
    commission_percent = (
        appointment["commission_percent"]
        if appointment["commission_percent"] is not None
        else (appointment["current_commission_percent"] or 0)
    )
    commission_cents = int((
        Decimal(appointment["price_cents"]) * Decimal(str(commission_percent)) / Decimal("100")
    ).quantize(Decimal("1"), rounding=ROUND_HALF_UP))
    db.execute(
        """UPDATE appointments
           SET status = 'completed', commission_percent = ?, commission_cents = ?
           WHERE id = ? AND barbershop_id = ? AND barber_id = ?""",
        (commission_percent, commission_cents, appointment_id,
         session["barbershop_id"], session["user_id"])
    )
    db.execute(
        """
        INSERT OR IGNORE INTO finance_entries
            (barbershop_id, entry_type, description, category, amount_cents, entry_date, appointment_id)
        VALUES (?, 'income', ?, 'Atendimentos', ?, date(?), ?)
        """,
        (session["barbershop_id"], "Atendimento concluído: " + appointment["service_name"],
         appointment["price_cents"], appointment["starts_at"], appointment_id)
    )
    db.commit()
    return jsonify({"message": "Atendimento concluído e registrado no financeiro."}), 200


@barber_bp.route("/appointments/<int:appointment_id>/cancel", methods=["POST"])
@barber_required
def cancel_barber_appointment(appointment_id):
    """Cancela um atendimento próprio exigindo o motivo."""

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
          AND barber_id = ?
          AND status = 'scheduled'
        """,
        (reason, appointment_id, session["barbershop_id"], session["user_id"])
    )
    db.commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "Atendimento ativo não encontrado na sua agenda."}), 404

    return jsonify({"message": "Atendimento cancelado com sucesso."}), 200



@barber_bp.route("/<slug>", methods=["GET"])
def barber_panel_page(slug):
    """Entrega a interface de login e agenda individual do barbeiro."""

    shop = get_db().execute(
        "SELECT name, slug FROM barbershops WHERE slug = ?",
        (slug,)
    ).fetchone()
    if shop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    return render_template(
        "barber.html",
        barbershop_name=shop["name"],
        barbershop_slug=shop["slug"]
    )


@barber_bp.route("/<slug>/staff", methods=["GET"])
def list_public_staff(slug):
    """Lista somente os profissionais que podem receber agendamentos."""
    shop = get_db().execute(
        "SELECT id FROM barbershops WHERE slug = ?", (slug,)
    ).fetchone()
    if shop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404
    rows = get_db().execute(
        """
        SELECT id, name, role
        FROM users
        WHERE barbershop_id = ? AND is_active = 1
          AND (role = 'barber' OR (role = 'owner' AND can_serve = 1))
          AND pin_hash IS NOT NULL
        ORDER BY name COLLATE NOCASE
        """,
        (shop["id"],)
    ).fetchall()
    return jsonify({"staff": [dict(row) for row in rows]}), 200


@barber_bp.route("/<slug>/login", methods=["POST"])
def login_barber_from_shop_link(slug):
    """Login simplificado: o colaborador escolhe o próprio nome e informa o PIN."""
    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Selecione seu nome e informe o PIN."}), 400
    try:
        barber_id = int(data.get("barber_id"))
    except (TypeError, ValueError):
        return jsonify({"error": "Selecione um profissional válido."}), 400
    # Reutiliza a autenticação, limitação de tentativas e bloqueio do endpoint legado.
    return login_barber(slug, barber_id)
