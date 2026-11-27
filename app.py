"""
BARBER-SYSTEM
Arquivo principal da aplicação.

Responsabilidades desta primeira versão:
- Criar e configurar a aplicação Flask.
- Registrar as primeiras rotas de teste.
- Permitir iniciar o servidor em ambiente local.

O banco de dados, autenticação e módulos do sistema serão adicionados
em etapas separadas.
"""

import os

from flask import Flask, jsonify


def create_app():
    """Cria e configura a aplicação Flask."""

    app = Flask(__name__)

    # A chave secreta será configurada por variável de ambiente.
    # Em desenvolvimento, usamos um valor local para facilitar os testes.
    app.config["SECRET_KEY"] = os.environ.get(
        "SECRET_KEY",
        "chave-local-apenas-para-desenvolvimento"
    )

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
        """Rota simples para verificar se o servidor está respondendo."""
        return jsonify({"status": "ok"}), 200

    return app


# Cria a aplicação para que o Flask consiga encontrá-la.
app = create_app()


if __name__ == "__main__":
    # O modo de depuração fica ativo apenas ao executar localmente.
    # Não deve ser usado quando o sistema estiver publicado.
    app.run(
        host="127.0.0.1",
        port=5000,
        debug=True
    )
