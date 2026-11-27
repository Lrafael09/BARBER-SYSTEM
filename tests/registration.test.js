import test from "node:test";
import assert from "node:assert/strict";
import worker from "../cloudflare/worker.js";

test("cadastro de proprietário conclui e retorna slug após gravar a conta", async () => {
  const executed = [];
  const db = {
    prepare(sql) {
      return {
        async first() {
          if (sql.includes("SELECT COUNT(*) AS n FROM barbershops")) return { n: 1 };
          if (sql.includes("SELECT COUNT(*) AS n FROM users")) return { n: 0 };
          if (sql.includes("SELECT id FROM barbershops ORDER BY id")) return { id: 1 };
          return null;
        },
        bind(...values) {
          return {
            async first() {
              if (sql.includes("SELECT failed_attempts,locked_until FROM login_attempts")) {
                return { failed_attempts: 1, locked_until: null };
              }
              if (sql.includes("SELECT id FROM users WHERE lower(email)")) return null;
              if (sql.includes("SELECT COUNT(*) AS n FROM barbershops")) return { n: 1 };
              if (sql.includes("SELECT COUNT(*) AS n FROM users")) return { n: 0 };
              if (sql.includes("SELECT id FROM barbershops ORDER BY id")) return { id: 1 };
              if (sql.includes("SELECT id FROM barbershops WHERE whatsapp")) return null;
              if (sql.includes("SELECT id FROM barbershops WHERE slug")) return null;
              return null;
            },
            async run() {
              executed.push({ sql, values });
              return { meta: { changes: 1, last_row_id: 1 } };
            }
          };
        }
      };
    },
    async batch(statements) {
      executed.push({ batch: statements.length });
      return statements.map(() => ({ meta: { changes: 1 } }));
    }
  };

  const request = new Request("https://barber-system.test/api/auth/register", {
    method: "POST",
    headers: { "content-type": "application/json", "CF-Connecting-IP": "192.0.2.10" },
    body: JSON.stringify({
      shop_name: "Barbearia Teste",
      owner_name: "Dono Teste",
      email: "dono@example.com",
      password: "senha-segura-123",
      whatsapp: "11987654321"
    })
  });

  const response = await worker.fetch(request, {
    DB: db,
    OWNER_REGISTRATION_ENABLED: "true",
    ENVIRONMENT: "test"
  });

  assert.equal(response.status, 201);
  const body = await response.json();
  assert.equal(body.message, "Barbearia cadastrada com sucesso. Agora entre com seu e-mail e senha.");
  assert.equal(body.barbershop.slug, "barbearia-teste");
  assert.ok(executed.some(item => item.batch === 2));
});
