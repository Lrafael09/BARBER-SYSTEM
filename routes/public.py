"""
BARBER-SYSTEM
Rotas públicas da barbearia e identificação inicial de clientes.

A busca pelos quatro últimos dígitos apresenta os nomes correspondentes para confirmação.
Os quatro dígitos servem para localizar cadastros, não para comprovar
a identidade do cliente.
"""

import re

from flask import Blueprint, jsonify, request, render_template

from database import get_db


public_bp = Blueprint("public", __name__)


def normalize_phone(value):
    """Mantém somente números do telefone informado."""

    return re.sub(r"\D", "", str(value or ""))


def mask_customer_name(name):
    """Mascara partes do nome para reduzir exposição de dados pessoais."""

    parts = str(name).split()
    masked = []

    for part in parts:
        if len(part) <= 2:
            masked.append(part[0] + "*" * (len(part) - 1))
        else:
            masked.append(part[:2] + "*" * min(len(part) - 2, 5))

    return " ".join(masked)


def find_barbershop(slug):
    return get_db().execute(
        """
        SELECT id, name, slug, whatsapp, logo_data, brand_color, theme
        FROM barbershops
        WHERE slug = ?
        """,
        (slug,)
    ).fetchone()


@public_bp.route("/b/<slug>", methods=["GET"])
def barbershop_page(slug):
    """Retorna as informações públicas básicas da barbearia."""

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    return jsonify({
        "id": barbershop["id"],
        "name": barbershop["name"],
        "slug": barbershop["slug"],
        "whatsapp": barbershop["whatsapp"]
    }), 200


@public_bp.route("/b/<slug>/customers/lookup", methods=["POST"])
def lookup_customer(slug):
    """
    Localiza possíveis cadastros pelos quatro últimos dígitos do telefone.

    Retorna IDs e nomes para seleção; nunca retorna telefone completo.
    """

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie os quatro números em formato JSON."}), 400

    last4 = normalize_phone(data.get("phone_last4", ""))
    if len(last4) != 4:
        return jsonify({
            "error": "Informe exatamente os quatro últimos números do telefone."
        }), 400

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    rows = get_db().execute(
        """
        SELECT id, name
        FROM customers
        WHERE barbershop_id = ? AND phone_last4 = ?
        ORDER BY name COLLATE NOCASE
        LIMIT 10
        """,
        (barbershop["id"], last4)
    ).fetchall()

    return jsonify({
        "matches": [
            {
                "id": row["id"],
                "display_name": row["name"]
            }
            for row in rows
        ],
        "count": len(rows),
        "message": (
            "Escolha seu cadastro ou informe outro telefone."
            if rows else
            "Nenhum cadastro encontrado. Você pode fazer um novo cadastro."
        )
    }), 200


@public_bp.route("/b/<slug>/customers/confirm", methods=["POST"])
def confirm_customer(slug):
    """
    Confirma qual cadastro o cliente selecionou na lista de possíveis nomes.

    Esta confirmação é uma seleção de cadastro, não autenticação de identidade.
    """

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados em formato JSON."}), 400

    last4 = normalize_phone(data.get("phone_last4", ""))
    customer_id = data.get("customer_id")

    if len(last4) != 4 or isinstance(customer_id, bool):
        return jsonify({"error": "Informe o cadastro e os quatro últimos números."}), 400

    try:
        customer_id = int(customer_id)
    except (TypeError, ValueError):
        return jsonify({"error": "Cadastro inválido."}), 400

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    customer = get_db().execute(
        """
        SELECT id, name
        FROM customers
        WHERE id = ?
          AND barbershop_id = ?
          AND phone_last4 = ?
        """,
        (customer_id, barbershop["id"], last4)
    ).fetchone()

    if customer is None:
        return jsonify({"error": "Cadastro não encontrado para esses números."}), 404

    return jsonify({
        "message": "Cadastro selecionado.",
        "customer": {
            "id": customer["id"],
            "display_name": customer["name"]
        },
        "identity_verified": False
    }), 200


@public_bp.route("/b/<slug>/customers", methods=["POST"])
def create_customer(slug):
    """Cria um cadastro de cliente ou localiza o telefone já existente."""

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie nome e telefone em formato JSON."}), 400

    name = str(data.get("name", "")).strip()
    phone = normalize_phone(data.get("phone", ""))

    if not name or len(name) > 120:
        return jsonify({"error": "Informe um nome de até 120 caracteres."}), 400

    if not 10 <= len(phone) <= 13:
        return jsonify({
            "error": "Informe um telefone válido com DDD."
        }), 400

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    db = get_db()
    existing = db.execute(
        """
        SELECT id, name
        FROM customers
        WHERE barbershop_id = ? AND phone = ?
        """,
        (barbershop["id"], phone)
    ).fetchone()

    if existing:
        return jsonify({
            "message": "Este telefone já possui cadastro. Selecione o cadastro encontrado.",
            "customer": {
                "id": existing["id"],
                "display_name": mask_customer_name(existing["name"])
            },
            "already_registered": True
        }), 200

    cursor = db.execute(
        """
        INSERT INTO customers (barbershop_id, name, phone, phone_last4)
        VALUES (?, ?, ?, ?)
        """,
        (barbershop["id"], name, phone, phone[-4:])
    )
    db.commit()

    return jsonify({
        "message": "Cadastro realizado com sucesso.",
        "customer": {
            "id": cursor.lastrowid,
            "display_name": mask_customer_name(name)
        },
        "already_registered": False
    }), 201



@public_bp.route("/b/<slug>/schedule", methods=["GET"])
def public_business_schedule(slug):
    """Expõe somente os horários de funcionamento, sem dados internos."""

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    rows = get_db().execute(
        """
        SELECT weekday, is_open, open_time, close_time, break_start, break_end
        FROM business_hours
        WHERE barbershop_id = ?
        ORDER BY weekday
        """,
        (barbershop["id"],)
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
        "barbershop": {
            "name": barbershop["name"],
            "slug": barbershop["slug"]
        },
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



@public_bp.route("/b/<slug>/appointments", methods=["POST"])
def create_appointment(slug):
    """
    Cria um agendamento público respeitando expediente, intervalo,
    bloqueios e conflitos de horário.
    
    Espera customer_id, service_id, barber_id e starts_at
    (AAAA-MM-DDTHH:MM, horário local da barbearia).
    """

    from datetime import datetime, timedelta

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie os dados do agendamento em JSON."}), 400

    try:
        customer_id = int(data.get("customer_id"))
        service_id = int(data.get("service_id"))
        barber_id = int(data.get("barber_id"))
        starts_value = data.get("starts_at")
        if not isinstance(starts_value, str):
            raise ValueError
        starts = datetime.fromisoformat(starts_value)
        if starts.tzinfo is not None or starts.second or starts.microsecond:
            raise ValueError
    except (TypeError, ValueError):
        return jsonify({
            "error": "Informe cliente, serviço, barbeiro e data/hora válidos."
        }), 400

    if min(customer_id, service_id, barber_id) <= 0:
        return jsonify({"error": "Os identificadores devem ser positivos."}), 400

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    db = get_db()
    service = db.execute(
        """
        SELECT id, name, price_cents, duration_minutes
        FROM services
        WHERE id = ? AND barbershop_id = ? AND is_active = 1
        """,
        (service_id, barbershop["id"])
    ).fetchone()
    customer = db.execute(
        """
        SELECT id FROM customers
        WHERE id = ? AND barbershop_id = ?
        """,
        (customer_id, barbershop["id"])
    ).fetchone()
    barber = db.execute(
        """
        SELECT id FROM users
        WHERE id = ? AND barbershop_id = ? AND is_active = 1
          AND (role = 'barber' OR (role = 'owner' AND can_serve = 1))
        """,
        (barber_id, barbershop["id"])
    ).fetchone()

    if service is None:
        return jsonify({"error": "Serviço indisponível."}), 404
    if customer is None:
        return jsonify({"error": "Cliente não encontrado nesta barbearia."}), 404
    if barber is None:
        return jsonify({"error": "Barbeiro não encontrado nesta barbearia."}), 404

    ends = starts + timedelta(minutes=service["duration_minutes"])
    if ends.date() != starts.date():
        return jsonify({"error": "O serviço precisa terminar no mesmo dia."}), 409
    starts_text = starts.strftime("%Y-%m-%dT%H:%M:%S")
    ends_text = ends.strftime("%Y-%m-%dT%H:%M:%S")
    weekday = starts.weekday()
    start_clock = starts.strftime("%H:%M")
    end_clock = ends.strftime("%H:%M")

    # BEGIN IMMEDIATE serializa as tentativas de reserva no SQLite e
    # reduz o risco de dois clientes ocuparem o mesmo horário simultaneamente.
    db.execute("BEGIN IMMEDIATE")
    try:
        hours = db.execute(
            """
            SELECT is_open, open_time, close_time, break_start, break_end
            FROM business_hours
            WHERE barbershop_id = ? AND weekday = ?
            """,
            (barbershop["id"], weekday)
        ).fetchone()
        personal_hours = db.execute(
            """
            SELECT is_open, open_time, close_time, break_start, break_end
            FROM staff_hours
            WHERE barbershop_id = ? AND user_id = ? AND weekday = ?
            """,
            (barbershop["id"], barber_id, weekday)
        ).fetchone()
        effective_hours = personal_hours if personal_hours is not None else hours

        if (
            hours is None or not hours["is_open"]
            or effective_hours is None or not effective_hours["is_open"]
            or start_clock < hours["open_time"] or end_clock > hours["close_time"]
            or start_clock < effective_hours["open_time"]
            or end_clock > effective_hours["close_time"]
        ):
            db.rollback()
            return jsonify({"error": "Esse horário está fora do expediente da barbearia ou do profissional."}), 409

        for schedule in (hours, personal_hours):
            if schedule is not None and schedule["break_start"]:
                if start_clock < schedule["break_end"] and end_clock > schedule["break_start"]:
                    db.rollback()
                    return jsonify({"error": "Esse horário coincide com um intervalo."}), 409

        block = db.execute(
            """
            SELECT id FROM time_blocks
            WHERE barbershop_id = ?
              AND (barber_id IS NULL OR barber_id = ?)
              AND starts_at < ?
              AND ends_at > ?
            LIMIT 1
            """,
            (barbershop["id"], barber_id, ends_text, starts_text)
        ).fetchone()

        if block:
            db.rollback()
            return jsonify({"error": "O barbeiro ou a barbearia está indisponível nesse horário."}), 409

        conflict = db.execute(
            """
            SELECT id FROM appointments
            WHERE barbershop_id = ?
              AND barber_id = ?
              AND status = 'scheduled'
              AND starts_at < ?
              AND ends_at > ?
            LIMIT 1
            """,
            (barbershop["id"], barber_id, ends_text, starts_text)
        ).fetchone()

        if conflict:
            db.rollback()
            return jsonify({"error": "Esse horário acabou de ser ocupado. Escolha outro."}), 409

        cursor = db.execute(
            """
            INSERT INTO appointments (
                barbershop_id, customer_id, service_id, barber_id,
                service_name, price_cents, duration_minutes,
                starts_at, ends_at, status
            )
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, 'scheduled')
            """,
            (
                barbershop["id"],
                customer_id,
                service_id,
                barber_id,
                service["name"],
                service["price_cents"],
                service["duration_minutes"],
                starts_text,
                ends_text
            )
        )
        db.commit()

    except Exception:
        db.rollback()
        raise

    return jsonify({
        "message": "Agendamento realizado com sucesso.",
        "appointment": {
            "id": cursor.lastrowid,
            "service": service["name"],
            "price_cents": service["price_cents"],
            "duration_minutes": service["duration_minutes"],
            "starts_at": starts_text,
            "ends_at": ends_text,
            "status": "scheduled"
        }
    }), 201


@public_bp.route("/b/<slug>/appointments/<int:appointment_id>/cancel", methods=["POST"])
def cancel_public_appointment(slug, appointment_id):
    """
    Cancela um agendamento público usando telefone completo como dado
    de conferência. Não equivale a autenticação forte do cliente.
    """

    data = request.get_json(silent=True)
    if not isinstance(data, dict):
        return jsonify({"error": "Envie o telefone para localizar o agendamento."}), 400

    phone = normalize_phone(data.get("phone", ""))
    if not 10 <= len(phone) <= 13:
        return jsonify({"error": "Informe o telefone completo com DDD."}), 400

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    db = get_db()
    appointment = db.execute(
        """
        SELECT appointments.id, appointments.status
        FROM appointments
        INNER JOIN customers
          ON customers.id = appointments.customer_id
         AND customers.barbershop_id = appointments.barbershop_id
        WHERE appointments.id = ?
          AND appointments.barbershop_id = ?
          AND customers.phone = ?
        """,
        (appointment_id, barbershop["id"], phone)
    ).fetchone()

    if appointment is None:
        return jsonify({"error": "Agendamento não encontrado para esses dados."}), 404
    if appointment["status"] != "scheduled":
        return jsonify({"error": "Esse agendamento não está mais ativo."}), 409

    cursor = db.execute(
        """
        UPDATE appointments
        SET status = 'cancelled',
            cancellation_reason = 'Cancelado pelo cliente',
            cancelled_at = CURRENT_TIMESTAMP
        WHERE id = ? AND barbershop_id = ? AND status = 'scheduled'
        """,
        (appointment_id, barbershop["id"])
    )
    db.commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "Esse agendamento já foi alterado."}), 409

    return jsonify({"message": "Agendamento cancelado com sucesso."}), 200



@public_bp.route("/b/<slug>/book", methods=["GET"])
def public_booking_page(slug):
    """Entrega a interface pública de agendamento da barbearia."""

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    return render_template(
        "booking.html",
        barbershop_name=barbershop["name"],
        barbershop_slug=barbershop["slug"],
        barbershop_logo=barbershop["logo_data"],
        brand_color=barbershop["brand_color"],
        theme=barbershop["theme"]
    )


@public_bp.route("/b/<slug>/catalog", methods=["GET"])
def public_booking_catalog(slug):
    """Lista serviços e barbeiros ativos disponíveis para o cliente."""

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    db = get_db()
    services = db.execute(
        """
        SELECT id, name, description, price_cents, duration_minutes
        FROM services
        WHERE barbershop_id = ? AND is_active = 1
        ORDER BY name COLLATE NOCASE
        """,
        (barbershop["id"],)
    ).fetchall()

    barbers = db.execute(
        """
        SELECT id, name, role
        FROM users
        WHERE barbershop_id = ? AND is_active = 1
          AND (role = 'barber' OR (role = 'owner' AND can_serve = 1))
        ORDER BY name COLLATE NOCASE
        """,
        (barbershop["id"],)
    ).fetchall()

    return jsonify({
        "services": [dict(row) for row in services],
        "barbers": [dict(row) for row in barbers],
        "whatsapp": barbershop["whatsapp"],
        "logo_data": barbershop["logo_data"],
        "brand_color": barbershop["brand_color"],
        "theme": barbershop["theme"]
    }), 200


@public_bp.route("/b/<slug>/availability", methods=["GET"])
def public_availability(slug):
    """Calcula horários livres de um barbeiro para um serviço e uma data."""

    from datetime import datetime, timedelta

    barbershop = find_barbershop(slug)
    if barbershop is None:
        return jsonify({"error": "Barbearia não encontrada."}), 404

    try:
        service_id = int(request.args.get("service_id", ""))
        barber_id = int(request.args.get("barber_id", ""))
        day = datetime.strptime(request.args.get("date", ""), "%Y-%m-%d").date()
    except (TypeError, ValueError):
        return jsonify({
            "error": "Informe service_id, barber_id e date (AAAA-MM-DD)."
        }), 400

    db = get_db()
    service = db.execute(
        """
        SELECT duration_minutes FROM services
        WHERE id = ? AND barbershop_id = ? AND is_active = 1
        """,
        (service_id, barbershop["id"])
    ).fetchone()
    barber = db.execute(
        """
        SELECT id FROM users
        WHERE id = ? AND barbershop_id = ? AND is_active = 1
          AND (role = 'barber' OR (role = 'owner' AND can_serve = 1))
        """,
        (barber_id, barbershop["id"])
    ).fetchone()

    if service is None or barber is None:
        return jsonify({"error": "Serviço ou barbeiro indisponível."}), 404

    business_hours = db.execute(
        """
        SELECT is_open, open_time, close_time, break_start, break_end
        FROM business_hours
        WHERE barbershop_id = ? AND weekday = ?
        """,
        (barbershop["id"], day.weekday())
    ).fetchone()
    personal_hours = db.execute(
        """
        SELECT is_open, open_time, close_time, break_start, break_end
        FROM staff_hours
        WHERE barbershop_id = ? AND user_id = ? AND weekday = ?
        """,
        (barbershop["id"], barber_id, day.weekday())
    ).fetchone()
    hours = personal_hours if personal_hours is not None else business_hours

    if (business_hours is None or not business_hours["is_open"]
            or hours is None or not hours["is_open"]):
        return jsonify({"date": day.isoformat(), "slots": []}), 200

    opening = datetime.combine(
        day, datetime.strptime(hours["open_time"], "%H:%M").time()
    )
    closing = datetime.combine(
        day, datetime.strptime(hours["close_time"], "%H:%M").time()
    )
    duration = timedelta(minutes=service["duration_minutes"])

    blocks = db.execute(
        """
        SELECT starts_at, ends_at
        FROM time_blocks
        WHERE barbershop_id = ?
          AND (barber_id IS NULL OR barber_id = ?)
          AND starts_at < ?
          AND ends_at > ?
        """,
        (
            barbershop["id"], barber_id,
            f"{day.isoformat()}T23:59:59",
            f"{day.isoformat()}T00:00:00"
        )
    ).fetchall()

    appointments = db.execute(
        """
        SELECT starts_at, ends_at
        FROM appointments
        WHERE barbershop_id = ?
          AND barber_id = ?
          AND status = 'scheduled'
          AND starts_at < ?
          AND ends_at > ?
        """,
        (
            barbershop["id"], barber_id,
            f"{day.isoformat()}T23:59:59",
            f"{day.isoformat()}T00:00:00"
        )
    ).fetchall()

    occupied = [
        (datetime.fromisoformat(row["starts_at"]), datetime.fromisoformat(row["ends_at"]))
        for row in list(blocks) + list(appointments)
    ]

    break_start = (
        datetime.combine(day, datetime.strptime(hours["break_start"], "%H:%M").time())
        if hours["break_start"] else None
    )
    break_end = (
        datetime.combine(day, datetime.strptime(hours["break_end"], "%H:%M").time())
        if hours["break_end"] else None
    )

    slots = []
    candidate = opening
    while candidate + duration <= closing:
        candidate_end = candidate + duration
        overlaps_break = (
            break_start is not None
            and candidate < break_end
            and candidate_end > break_start
        )
        if personal_hours is not None:
            personal_break_start = (
                datetime.combine(day, datetime.strptime(personal_hours["break_start"], "%H:%M").time())
                if personal_hours["break_start"] else None
            )
            personal_break_end = (
                datetime.combine(day, datetime.strptime(personal_hours["break_end"], "%H:%M").time())
                if personal_hours["break_end"] else None
            )
            overlaps_break = overlaps_break or (
                personal_break_start is not None
                and candidate < personal_break_end
                and candidate_end > personal_break_start
            )
        # O horário individual não amplia o expediente geral da barbearia.
        business_open = datetime.combine(day, datetime.strptime(business_hours["open_time"], "%H:%M").time())
        business_close = datetime.combine(day, datetime.strptime(business_hours["close_time"], "%H:%M").time())
        if candidate < business_open or candidate_end > business_close:
            candidate += timedelta(minutes=15)
            continue
        business_break_start = (
            datetime.combine(day, datetime.strptime(business_hours["break_start"], "%H:%M").time())
            if business_hours["break_start"] else None
        )
        business_break_end = (
            datetime.combine(day, datetime.strptime(business_hours["break_end"], "%H:%M").time())
            if business_hours["break_end"] else None
        )
        if business_break_start and candidate < business_break_end and candidate_end > business_break_start:
            candidate += timedelta(minutes=15)
            continue
        overlaps_busy = any(
            candidate < busy_end and candidate_end > busy_start
            for busy_start, busy_end in occupied
        )

        if not overlaps_break and not overlaps_busy:
            slots.append(candidate.strftime("%H:%M"))

        candidate += timedelta(minutes=15)

    return jsonify({"date": day.isoformat(), "slots": slots}), 200
