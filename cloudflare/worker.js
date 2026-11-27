const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" }
});

const cors = (response, origin) => {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", origin || "*");
  headers.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "Content-Type, Authorization");
  headers.set("vary", "Origin");
  return new Response(response.body, { status: response.status, headers });
};

async function api(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (url.pathname === "/api/health") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM barbershops").first();
    return json({ ok: true, service: "barber-system", database: "connected", shops: row.total });
  }

  const shopMatch = url.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/catalog$/);
  if (shopMatch && request.method === "GET") {
    const shop = await env.DB.prepare(
      "SELECT id, name, slug, whatsapp, brand_color, theme FROM barbershops WHERE slug = ?"
    ).bind(shopMatch[1]).first();
    if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
    const [services, staff] = await Promise.all([
      env.DB.prepare("SELECT id, name, description, price_cents, duration_minutes FROM services WHERE barbershop_id = ? AND is_active = 1 ORDER BY name").bind(shop.id).all(),
      env.DB.prepare("SELECT id, name FROM users WHERE barbershop_id = ? AND role = 'barber' AND is_active = 1 AND can_serve = 1 ORDER BY name").bind(shop.id).all()
    ]);
    return json({ shop, services: services.results, staff: staff.results });
  }

  return json({ error: "Rota ainda não migrada.", path: url.pathname }, 501);
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);
    let response;
    if (url.pathname.startsWith("/api/")) {
      try {
        response = await api(request, env, url);
      } catch (error) {
        response = json({ error: "Erro interno.", detail: env.ENVIRONMENT === "development" ? error.message : undefined }, 500);
      }
    } else if (env.ASSETS) {
      response = await env.ASSETS.fetch(request);
    } else {
      response = new Response("Barber System - interface em migração.", { status: 200 });
    }
    return cors(response, request.headers.get("Origin"));
  }
};