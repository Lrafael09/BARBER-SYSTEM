"""
BARBER-SYSTEM
Módulo inicial das rotas administrativas.

Este módulo reunirá as páginas e ações exclusivas do proprietário
da barbearia. Nesta etapa, criamos o Blueprint e uma rota simples
de verificação. As funcionalidades administrativas serão adicionadas
gradualmente, com autenticação e autorização antes de expor dados.
"""

from flask import Blueprint, jsonify


# Grupo de rotas reservado ao painel do proprietário.
admin_bp = Blueprint("admin", __name__, url_prefix="/admin")


@admin_bp.route("/", methods=["GET"])
def admin_home():
    """Endpoint inicial do painel administrativo."""

    return jsonify({
        "module": "admin",
        "message": "Módulo administrativo preparado."
    }), 200
