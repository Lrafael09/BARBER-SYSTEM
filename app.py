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


def create_app(test_config=None):
    """Cria e configura a aplicação Flask."""

    app = Flask(__name__)

    app.config.from_mapping(
        SECRET_KEY=os.environ.get(
            "SECRET_KEY",
            "chave-local-apenas-para-desenvolvimento"
        ),
        SESSION_COOKIE_HTTPONLY=True,
        SESSION_COOKIE_SAMESITE="Lax",
        SESSION_COOKIE_SECURE=os.environ.get("APP_ENV") == "production",
        MAX_CONTENT_LENGTH=1024 * 1024
    )

    if test_config:
        app.config.update(test_config)

    if os.environ.get("APP_ENV") == "production" and (
        not os.environ.get("SECRET_KEY")
        or app.config["SECRET_KEY"] == "chave-local-apenas-para-desenvolvimento"
    ):
        raise RuntimeError("Defina uma SECRET_KEY forte antes de iniciar em produção.")

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
    is_production = os.environ.get("APP_ENV") == "production"
    app.run(
        host="0.0.0.0" if is_production else "127.0.0.1",
        port=int(os.environ.get("PORT", "5000")),
        debug=not is_production
    )
