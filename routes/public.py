"""
BARBER-SYSTEM
Rotas públicas da barbearia e identificação inicial de clientes.

A busca pelos quatro últimos dígitos apresenta apenas nomes mascarados.
Os quatro dígitos servem para localizar cadastros, não para comprovar
a identidade do cliente.
"""

import re

from flask import Blueprint, jsonify, request

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
        SELECT id, name, slug, whatsapp
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

    Retorna somente IDs e nomes mascarados; nunca retorna telefone completo.
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
                "display_name": mask_customer_name(row["name"])
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
            "display_name": mask_customer_name(customer["name"])
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
