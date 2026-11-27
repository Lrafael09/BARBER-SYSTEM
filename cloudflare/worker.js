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


async function readSession(request, env) {
 const raw=request.headers.get("Cookie")||"";
 const sid=raw.split(";").map(v=>v.trim()).find(v=>v.startsWith("barber_session="))?.slice(15);
 if(!sid)return null;
 return await env.DB.prepare("SELECT s.id,s.user_id,s.barbershop_id,s.role,u.name,u.email,u.is_active,b.slug AS barbershop_slug FROM auth_sessions s JOIN users u ON u.id=s.user_id JOIN barbershops b ON b.id=s.barbershop_id WHERE s.id=? AND s.expires_at>datetime('now') AND u.is_active=1").bind(sid).first();
}
async function hashPassword(password) {
 const salt=crypto.getRandomValues(new Uint8Array(16));
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
 const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt,iterations:310000},key,256);
 const hex=a=>[...new Uint8Array(a)].map(x=>x.toString(16).padStart(2,"0")).join("");
 return "pbkdf2_sha256$310000$"+hex(salt)+"$"+hex(bits);
}
async function verifyPassword(stored,password) {
 if(!stored||!stored.startsWith("pbkdf2_sha256$"))return false;
 const [,rounds,saltHex,expected]=stored.split("$");
 const salt=new Uint8Array(saltHex.match(/.{2}/g).map(x=>parseInt(x,16)));
 const key=await crypto.subtle.importKey("raw",new TextEncoder().encode(password),"PBKDF2",false,["deriveBits"]);
 const bits=await crypto.subtle.deriveBits({name:"PBKDF2",hash:"SHA-256",salt,iterations:Number(rounds)},key,256);
 const actual=[...new Uint8Array(bits)].map(x=>x.toString(16).padStart(2,"0")).join("");
 return actual===expected;
}

async function api(request, env, url) {
  if (request.method === "OPTIONS") return new Response(null, { status: 204 });
  if (url.pathname === "/api/health") {
    const row = await env.DB.prepare("SELECT COUNT(*) AS total FROM barbershops").first();
    return json({ ok: true, service: "barber-system", database: "connected", shops: row.total });
  }


  if(url.pathname==="/api/auth/registration-status"&&request.method==="GET"){
   const c=await env.DB.prepare("SELECT COUNT(*) AS n FROM barbershops").first();
   return json({available:env.OWNER_REGISTRATION_ENABLED==="true"&&c.n===0});
  }
  if(url.pathname==="/api/auth/register"&&request.method==="POST"){
   const d=await request.json().catch(()=>null); if(!d)return json({error:"Envie os dados em JSON."},400);
   const shop=String(d.shop_name||"").trim(),name=String(d.owner_name||"").trim(),email=String(d.email||"").trim().toLowerCase(),pass=d.password,wa=String(d.whatsapp||"").replace(/\\D/g,"");
   if(!shop||!name||!email||!pass)return json({error:"Preencha todos os campos."},400);
   if(shop.length>120||name.length>120||!/^[^@\\s]+@[^@\\s]+\\.[^@\\s]+$/.test(email))return json({error:"Confira os dados informados."},400);
   if(typeof pass!=="string"||pass.length<8)return json({error:"A senha deve ter pelo menos 8 caracteres."},400);
   if(env.OWNER_REGISTRATION_ENABLED!=="true")return json({error:"Cadastro inicial desativado."},403);
   const count=await env.DB.prepare("SELECT COUNT(*) AS n FROM barbershops").first(); if(count.n)return json({error:"Já existe um proprietário cadastrado."},409);
   const base=shop.normalize("NFKD").replace(/[\\u0300-\\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); if(!base)return json({error:"Nome inválido para endereço."},400);
   let slug=base,i=2; while(await env.DB.prepare("SELECT id FROM barbershops WHERE slug=?").bind(slug).first())slug=base+"-"+i++;
   const created=await env.DB.prepare("INSERT INTO barbershops(name,slug,whatsapp) VALUES(?,?,?)").bind(shop,slug,wa||null).run();
   await env.DB.prepare("INSERT INTO users(barbershop_id,name,email,password_hash,role,can_serve) VALUES(?,?,?,?,'owner',0)").bind(created.meta.last_row_id,name,email,await hashPassword(pass)).run();
   return json({message:"Cadastro concluído. Agora entre com seu e-mail e senha.",barbershop:{id:created.meta.last_row_id,name:shop,slug}},201);
  }
  if(url.pathname==="/api/auth/login"&&request.method==="POST"){
   const d=await request.json().catch(()=>null);if(!d)return json({error:"Informe e-mail e senha."},400);
   const email=String(d.email||"").trim().toLowerCase();
   const u=await env.DB.prepare("SELECT u.id,u.barbershop_id,u.name,u.email,u.password_hash,u.role,u.is_active,b.name AS shop_name,b.slug AS shop_slug FROM users u JOIN barbershops b ON b.id=u.barbershop_id WHERE u.email=? AND u.role='owner'").bind(email).first();
   if(!u||!u.is_active||!await verifyPassword(u.password_hash,d.password||""))return json({error:"E-mail ou senha incorretos."},401);
   const sid=crypto.randomUUID();await env.DB.prepare("INSERT INTO auth_sessions(id,user_id,barbershop_id,role,expires_at) VALUES(?,?,?,'owner',datetime('now','+7 days'))").bind(sid,u.id,u.barbershop_id).run();
   return json({message:"Login realizado com sucesso.",user:{id:u.id,name:u.name,email:u.email,role:u.role},barbershop:{id:u.barbershop_id,name:u.shop_name,slug:u.shop_slug}},200,{"set-cookie":"barber_session="+sid+"; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=604800"});
  }
  if(url.pathname==="/api/auth/me"&&request.method==="GET"){
   const s=await readSession(request,env);if(!s||s.role!=="owner")return json({error:"Acesso não autorizado. Faça login."},401);
   return json({id:s.user_id,barbershop_id:s.barbershop_id,name:s.name,email:s.email,role:s.role,barbershop_slug:s.barbershop_slug});
  }
  if(url.pathname==="/api/auth/logout"&&request.method==="POST"){
   const s=await readSession(request,env);if(s)await env.DB.prepare("DELETE FROM auth_sessions WHERE id=?").bind(s.id).run();
   return json({message:"Logout realizado com sucesso."},200,{"set-cookie":"barber_session=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0"});
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