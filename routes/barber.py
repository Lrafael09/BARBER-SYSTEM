"""
BARBER-SYSTEM
Módulo inicial das rotas do colaborador/barbeiro.

Este módulo reunirá as páginas e ações disponíveis ao profissional,
como agenda, atendimentos e consulta das próprias comissões.

As rotas e consultas reais serão adicionadas gradualmente.
O acesso deverá ser protegido por autenticação e autorização,
garantindo que cada barbeiro veja somente os próprios dados.
"""

from flask import Blueprint, jsonify


# Grupo de rotas reservado aos colaboradores.
barber_bp = Blueprint("barber", __name__, url_prefix="/barber")


@barber_bp.route("/", methods=["GET"])
def barber_home():
    """Endpoint inicial do módulo do colaborador."""

    return jsonify({
        "module": "barber",
        "message": "Módulo do colaborador preparado."
    }), 200
