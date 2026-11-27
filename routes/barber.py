"""
BARBER-SYSTEM
Autenticação e área do colaborador/barbeiro.

O profissional entra pelo endereço da própria barbearia,
informando seu identificador e PIN de quatro dígitos.
As tentativas são limitadas e registradas no banco.
"""

import time
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
              AND role = 'barber'
              AND is_active = 1
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
               barbershops.slug
        FROM users
        INNER JOIN barbershops
            ON barbershops.id = users.barbershop_id
        WHERE barbershops.slug = ?
          AND users.id = ?
          AND users.role = 'barber'
          AND users.is_active = 1
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
            "role": "barber"
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
        SELECT id, barbershop_id, name, role
        FROM users
        WHERE id = ? AND barbershop_id = ?
        """,
        (session["user_id"], session["barbershop_id"])
    ).fetchone()

    return jsonify({
        "id": barber["id"],
        "barbershop_id": barber["barbershop_id"],
        "name": barber["name"],
        "role": barber["role"]
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


@barber_bp.route("/appointments/<int:appointment_id>/complete", methods=["POST"])
@barber_required
def complete_barber_appointment(appointment_id):
    """Marca como concluído somente um atendimento do barbeiro logado."""

    db = get_db()
    cursor = db.execute(
        """
        UPDATE appointments
        SET status = 'completed'
        WHERE id = ?
          AND barbershop_id = ?
          AND barber_id = ?
          AND status = 'scheduled'
        """,
        (appointment_id, session["barbershop_id"], session["user_id"])
    )
    db.commit()

    if cursor.rowcount == 0:
        return jsonify({"error": "Atendimento ativo não encontrado na sua agenda."}), 404

    return jsonify({"message": "Atendimento marcado como concluído."}), 200


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
