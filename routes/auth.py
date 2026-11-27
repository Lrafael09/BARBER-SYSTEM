"""
BARBER-SYSTEM
Módulo inicial de autenticação.

Responsabilidades desta etapa:
- Criar o espaço das rotas de autenticação.
- Fornecer funções para gerar e verificar hashes de senha.
- Preparar o módulo para receber as rotas de login e logout.

Importante:
- Senhas nunca devem ser armazenadas em texto puro.
- Este módulo ainda não implementa login, logout ou sessões.
  Isso será feito quando as tabelas de usuários estiverem prontas.
"""

from flask import Blueprint
from werkzeug.security import check_password_hash, generate_password_hash


# Blueprint: grupo independente de rotas que será conectado ao Flask.
auth_bp = Blueprint("auth", __name__)


def hash_password(password):
    """Gera um hash seguro para armazenar no banco, nunca a senha original."""

    if not password:
        raise ValueError("A senha não pode ser vazia.")

    return generate_password_hash(password)


def verify_password(password_hash, password):
    """Confere uma senha digitada com o hash salvo no banco."""

    if not password_hash or not password:
        return False

    return check_password_hash(password_hash, password)
