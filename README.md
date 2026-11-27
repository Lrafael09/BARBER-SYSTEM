# BARBER-SYSTEM

Sistema de gestão e agendamento para barbearias pequenas. Cada instalação atende uma barbearia, com banco de dados separado.

## Ambientes incluídos

### Página pública do cliente
- Identificação de primeira visita ou cliente recorrente.
- Cadastro de nome e telefone.
- Seleção de serviço, profissional, data e horário disponível.
- Confirmação do agendamento e atalho para WhatsApp.
- Logo, cor de destaque e tema claro/escuro configuráveis.
- Alternância de tema claro/escuro na própria página.

A busca por quatro últimos dígitos ajuda a localizar um cadastro, mas não comprova a identidade do cliente. Não use essa etapa como autenticação forte para dados sensíveis.

### Painel do proprietário
- Cadastro inicial único e login.
- Visão geral com indicadores de agendamentos, clientes, serviços e profissionais.
- Agenda semanal com filtros de status e ações para concluir/cancelar atendimentos.
- Expediente semanal da barbearia, incluindo intervalo.
- Bloqueios gerais ou individuais.
- Cadastro, edição e ativação de serviços.
- Cadastro, edição e ativação de produtos.
- Gestão de colaboradores com PIN de quatro números.
- Opção para o proprietário aparecer como profissional, usando PIN próprio.
- Horários individuais por profissional.
- Consulta de clientes.
- Livro-caixa com entradas, despesas, histórico e resultado.
- Metas diárias, semanais e mensais com progresso.

O faturamento de atendimentos é registrado no caixa quando o atendimento é concluído. Entradas e saídas adicionais podem ser lançadas manualmente.

### Área do colaborador
- Link único por barbearia.
- Seleção do próprio nome e autenticação por PIN de quatro números.
- Agenda individual, sem exibir a agenda dos demais profissionais.
- Conclusão e cancelamento dos próprios atendimentos.
- A conclusão gera uma entrada no financeiro da barbearia.

## Executar localmente

Requer Python 3.10 ou superior.

No terminal, na pasta do projeto:

```powershell
python -m venv .venv
.venv\Scripts\activate
python -m pip install -r requirements.txt
python app.py
```

Abra:
- Painel: http://127.0.0.1:5000/admin/panel
- Saúde da aplicação: http://127.0.0.1:5000/health

## Banco de dados de demonstração

Para testar sem modificar o banco normal, use um arquivo separado:

```powershell
$env:BARBER_DATABASE = "instance\barber-demo.db"
python app.py
```

Para voltar ao banco padrão na mesma janela PowerShell:

```powershell
Remove-Item Env:BARBER_DATABASE
```

Não apague o arquivo `instance\barber.db` se ele contiver cadastros que deseja preservar.

## Testes automáticos

```powershell
python -m unittest discover -s tests -v
```

O GitHub Actions executa os mesmos testes automaticamente em novos commits para a branch principal.

## Rotas principais

### Proprietário
- `POST /auth/register`, `POST /auth/login`, `POST /auth/logout`
- `GET /admin/dashboard`, `GET /admin/appointments`
- `GET|POST /admin/services`, `PATCH|DELETE /admin/services/<id>`
- `GET|POST /admin/products`, `PATCH|DELETE /admin/products/<id>`
- `GET|PUT /admin/schedule`
- `GET|POST /admin/blocks`, `DELETE /admin/blocks/<id>`
- `GET|POST /admin/barbers`, `PATCH|DELETE /admin/barbers/<id>`
- `GET|PUT /admin/staff/<id>/schedule`, `PATCH /admin/staff/owner`
- `GET /admin/customers`
- `GET|POST /admin/finance/entries`, `DELETE /admin/finance/entries/<id>`
- `GET /admin/finance/summary`, `PUT /admin/finance/goals`
- `GET /admin/barbershop`, `POST /admin/barbershop/settings`, `POST /admin/barbershop/logo`

### Colaborador
- `GET /barber/<slug>/staff`
- `POST /barber/<slug>/login`
- `GET /barber/appointments`
- `POST /barber/appointments/<id>/complete`
- `POST /barber/appointments/<id>/cancel`
- `POST /barber/logout`

### Cliente
- `GET /b/<slug>/book`
- `GET /b/<slug>/catalog`
- `GET /b/<slug>/availability`
- `POST /b/<slug>/customers`
- `POST /b/<slug>/customers/lookup`
- `POST /b/<slug>/customers/confirm`
- `POST /b/<slug>/appointments`

## Modelo de instalação

Uma instalação corresponde a uma barbearia e tem o próprio arquivo de banco. O primeiro cadastro cria o proprietário. Para impedir um novo cadastro inicial nessa instalação, altere `OWNER_REGISTRATION_ENABLED` para `False` em `app.py`.

## Antes de usar com clientes reais

Esta versão amplia bastante as funções do sistema, mas ainda precisa ser validada no ambiente de execução que será usado pela barbearia. Antes de produção:
1. Execute os testes automáticos e faça testes manuais dos três ambientes.
2. Configure uma `SECRET_KEY` forte, HTTPS e servidor WSGI; nunca use o servidor de desenvolvimento em produção.
3. Configure armazenamento persistente e backups do banco de dados.
4. Implemente proteção CSRF, autenticação forte para clientes, recuperação de conta e limites de tentativa para o login do proprietário.
5. Revise privacidade, fuso horário da barbearia e regras legais de tratamento dos dados dos clientes.
6. Teste agendamentos simultâneos, cancelamentos, intervalos, bloqueios e disponibilidade individual em datas de fronteira.

O projeto não deve ser considerado pronto para receber dados reais até essas verificações serem concluídas.
