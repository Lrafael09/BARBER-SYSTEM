# BARBER-SYSTEM

Sistema web de agendamento para barbearias pequenas, com separação de dados por barbearia.

## Estado atual

O projeto contém a base Flask/SQLite, cadastro e login do proprietário, cadastro de barbeiros por PIN, serviços, horários semanais, bloqueios, agendamento público, cancelamentos e páginas web iniciais para cliente, barbeiro e proprietário.

**Ainda não considere esta versão pronta para receber clientes reais.** A aplicação precisa passar pelos testes, revisão de segurança e configuração de hospedagem persistente antes da publicação.

## Executar localmente

Requer Python 3.10 ou superior.

```bash
python -m venv .venv
```

No Windows:

```powershell
.venv\Scripts\activate
python -m pip install -r requirements.txt
python app.py
```

Abra `http://127.0.0.1:5000/health` para verificar a aplicação e o SQLite.

## Executar os testes

Na raiz do repositório:

```bash
python -m unittest discover -s tests -v
```

Os testes usam um banco temporário e não devem alterar o banco local normal.

## Páginas

- Página pública de agendamento: `/b/SLUG/book`
- Painel do proprietário: `/admin/panel`
- Área do barbeiro: `/barber/SLUG`
- Verificação da aplicação: `/health`

O proprietário cria a conta pela API `POST /auth/register`. O barbeiro é cadastrado no painel/API do proprietário e recebe seu identificador e PIN.

## Rotas principais

### Proprietário
- `POST /auth/register` — cadastro inicial da barbearia e proprietário.
- `POST /auth/login` — login.
- `GET /admin/dashboard` — resumo do painel.
- `GET|POST /admin/services` — listar e cadastrar serviços.
- `PATCH|DELETE /admin/services/<id>` — editar ou desativar serviço.
- `GET|PUT /admin/schedule` — consultar e salvar expediente semanal.
- `GET|POST /admin/blocks` — consultar e criar bloqueios.
- `GET /admin/appointments` — consultar agenda.
- `POST /admin/appointments/<id>/cancel` — cancelar com motivo.

### Barbeiro
- `POST /barber/<slug>/<barber_id>/login` — login por PIN.
- `GET /barber/appointments` — agenda individual.
- `POST /barber/appointments/<id>/complete` — concluir atendimento.
- `POST /barber/appointments/<id>/cancel` — cancelar com motivo.

### Cliente
- `GET /b/<slug>/book` — interface pública.
- `GET /b/<slug>/catalog` — serviços e profissionais ativos.
- `GET /b/<slug>/availability` — horários livres calculados.
- `POST /b/<slug>/customers/lookup` — localizar por quatro últimos dígitos.
- `POST /b/<slug>/customers` — cadastrar cliente.
- `POST /b/<slug>/appointments` — reservar horário.
- `POST /b/<slug>/appointments/<id>/cancel` — cancelar usando telefone como conferência.

## Configuração de produção

Defina pelo ambiente, nunca diretamente no código:

- `APP_ENV=production`
- `SECRET_KEY` com valor aleatório, longo e exclusivo.
- `PORT` conforme a plataforma de hospedagem.

Em produção, o código exige `SECRET_KEY`, desativa o modo debug e marca o cookie de sessão como Secure. Use HTTPS.

O banco SQLite precisa estar em armazenamento persistente e com backup. Sistemas de hospedagem com disco efêmero podem apagar o banco em reinicializações ou novos deploys.

## Pendências importantes antes de produção

1. Implementar proteção CSRF nos endpoints que alteram dados e usam sessão.
2. Adicionar autenticação forte do cliente para consulta/cancelamento; quatro dígitos ou telefone digitado não comprovam identidade.
3. Definir e aplicar fuso horário da barbearia em todos os cálculos de agenda e relatórios.
4. Revisar isolamento multi-barbearia com chaves estrangeiras compostas ou validações adicionais em todas as operações.
5. Adicionar limite de tentativas ao login do proprietário e proteção adicional ao PIN.
6. Testar conflitos simultâneos, cancelamentos, horários de almoço, bloqueios e cenários de fronteira.
7. Configurar servidor WSGI, HTTPS, backups, logs e monitoramento na hospedagem escolhida.
8. Completar telas de cadastro inicial, gerenciamento de equipe, expediente e edição de serviços.

## Observações de segurança e privacidade

A página pública mascara nomes na busca de clientes, mas a seleção por quatro últimos dígitos é apenas uma forma de localizar um cadastro. O painel do barbeiro não retorna telefone do cliente. O proprietário tem acesso aos dados completos conforme as rotas administrativas atuais.

O faturamento do dashboard é uma soma simples dos serviços marcados como concluídos; não representa ainda um caixa financeiro completo, com despesas, taxas, comissões e conciliação de pagamentos.
