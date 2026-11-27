"""
BARBER-SYSTEM
Módulo inicial das páginas públicas.

Responsabilidades desta etapa:
- Criar o grupo de rotas públicas.
- Localizar uma barbearia pelo seu endereço exclusivo (slug).
- Preparar a base para a futura página de agendamento do cliente.

Nesta primeira versão, a rota retorna os dados básicos em JSON.
A página visual e o formulário de agendamento serão criados depois.
"""

from flask import Blueprint, jsonify

from database import get_db


# Blueprint que reunirá as páginas acessíveis sem login.
public_bp = Blueprint("public", __name__)


@public_bp.route("/b/<slug>", methods=["GET"])
def barbershop_page(slug):
    """Busca uma barbearia pelo slug e retorna suas informações públicas."""

    db = get_db()

    barbershop = db.execute(
        """
        SELECT id, name, slug, whatsapp
        FROM barbershops
        WHERE slug = ?
        """,
        (slug,)
    ).fetchone()

    # Se o endereço não corresponder a uma barbearia cadastrada,
    # respondemos com 404 sem revelar informações de outras contas.
    if barbershop is None:
        return jsonify({
            "error": "Barbearia não encontrada."
        }), 404

    return jsonify({
        "id": barbershop["id"],
        "name": barbershop["name"],
        "slug": barbershop["slug"],
        "whatsapp": barbershop["whatsapp"]
    }), 200
