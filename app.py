"""
BARBER-SYSTEM
Arquivo principal da aplicação.

Responsabilidades:
- Criar e configurar a aplicação Flask.
- Conectar o gerenciamento do banco de dados.
- Inicializar as tabelas necessárias.
- Registrar as primeiras rotas de teste.
- Permitir iniciar o servidor em ambiente local.
"""

import os

from flask import Flask, jsonify

from database import init_app as init_database
from database import init_db
from routes.auth import auth_bp
from routes.public import public_bp
from routes.admin import admin_bp
from routes.barber import barber_bp


def create_app():
    """Cria e configura a aplicação Flask."""

    app = Flask(__name__)

    # A chave secreta deve ser definida no ambiente em produção.
    # O valor abaixo serve somente para desenvolvimento local.
    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY",
        "chave-local-apenas-para-desenvolvimento"
    )

    # Configura o caminho do SQLite e o fechamento das conexões.
    init_database(app)

    # Registra os módulos de rotas do sistema.
    app.register_blueprint(auth_bp)
    app.register_blueprint(public_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(barber_bp)

    # Cria as tabelas iniciais caso ainda não existam.
    with app.app_context():
        init_db()

    @app.route("/")
    def inicio():
        """Página inicial temporária da aplicação."""
        return jsonify({
            "sistema": "BARBER-SYSTEM",
            "status": "online",
            "mensagem": "A estrutura inicial do sistema está funcionando."
        })

    @app.route("/health")
    def verificar_status():
        """Verifica se a aplicação e o banco de dados estão acessíveis."""

        # Executa uma consulta simples para confirmar a conexão com SQLite.
        from database import get_db
        get_db().execute("SELECT 1").fetchone()

        return jsonify({
            "status": "ok",
            "database": "connected"
        }), 200

    return app


# Cria a aplicação para que o Flask consiga encontrá-la.
app = create_app()


if __name__ == "__main__":
    # Servidor local de desenvolvimento. Não usar debug em produção.
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
