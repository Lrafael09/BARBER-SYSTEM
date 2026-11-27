import { hashPassword, verifyPassword, needsPasswordRehash } from "./passwords.js";
import { handlePublicApi } from "./public.js";

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...headers }
});

const cors = (response, origin) => {
  const headers = new Headers(response.headers);
  headers.set("access-control-allow-origin", origin || "*");
  headers.set("access-control-allow-methods", "GET,POST,PUT,PATCH,DELETE,OPTIONS");
  headers.set("access-control-allow-headers", "Content-Type, Authorization");
  headers.set("vary", "Origin");
  return new Response(response.body, { status: response.status, headers });
};

const sessionCookie = (sid, maxAge = 604800) =>
  "barber_session=" + sid + "; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=" + maxAge;

async function createSession(env, user, role) {
  const sid = crypto.randomUUID();
  await env.DB.prepare(
    "INSERT INTO auth_sessions(id,user_id,barbershop_id,role,expires_at) VALUES(?,?,?,?,datetime('now','+7 days'))"
  ).bind(sid, user.id, user.barbershop_id, role).run();
  return sid;
}

async function readSession(request, env) {
  const raw = request.headers.get("Cookie") || "";
  const sid = raw.split(";").map(v => v.trim()).find(v => v.startsWith("barber_session="))?.slice(15);
  if (!sid) return null;
  return await env.DB.prepare(
    "SELECT s.id,s.user_id,s.barbershop_id,s.role,u.name,u.email,u.is_active,u.role AS account_role,u.can_serve,u.commission_percent,b.slug AS barbershop_slug FROM auth_sessions s JOIN users u ON u.id=s.user_id JOIN barbershops b ON b.id=s.barbershop_id WHERE s.id=? AND s.expires_at>datetime('now') AND u.is_active=1"
  ).bind(sid).first();
}

async function recordFailedPinAttempt(env, scopeKey, now) {
  await env.DB.prepare(
    "INSERT INTO login_attempts(scope_key,failed_attempts,window_started_at,locked_until) VALUES(?,1,?,NULL) ON CONFLICT(scope_key) DO UPDATE SET failed_attempts=CASE WHEN excluded.window_started_at-login_attempts.window_started_at>=900 THEN 1 ELSE login_attempts.failed_attempts+1 END,window_started_at=CASE WHEN excluded.window_started_at-login_attempts.window_started_at>=900 THEN excluded.window_started_at ELSE login_attempts.window_started_at END,locked_until=CASE WHEN (CASE WHEN excluded.window_started_at-login_attempts.window_started_at>=900 THEN 1 ELSE login_attempts.failed_attempts+1 END)>=5 THEN excluded.window_started_at+900 ELSE NULL END"
  ).bind(scopeKey, now).run();
  return await env.DB.prepare(
    "SELECT failed_attempts,locked_until FROM login_attempts WHERE scope_key=?"
  ).bind(scopeKey).first();
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
   const shop=String(d.shop_name||"").trim(),name=String(d.owner_name||"").trim(),email=String(d.email||"").trim().toLowerCase(),pass=d.password,wa=String(d.whatsapp||"").replace(/\D/g,"");
   if(!shop||!name||!email||!pass)return json({error:"Preencha todos os campos."},400);
   if(shop.length>120||name.length>120||!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email))return json({error:"Confira os dados informados."},400);
   if(typeof pass!=="string"||pass.length<8)return json({error:"A senha deve ter pelo menos 8 caracteres."},400);
   if(env.OWNER_REGISTRATION_ENABLED!=="true")return json({error:"Cadastro inicial desativado."},403);
   const count=await env.DB.prepare("SELECT COUNT(*) AS n FROM barbershops").first(); if(count.n)return json({error:"Já existe um proprietário cadastrado."},409);
   const base=shop.normalize("NFKD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,""); if(!base)return json({error:"Nome inválido para endereço."},400);
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
   if(needsPasswordRehash(u.password_hash)) {
    await env.DB.prepare("UPDATE users SET password_hash=? WHERE id=?").bind(await hashPassword(d.password),u.id).run();
   }
   const sid=await createSession(env,u,"owner");
   return json({message:"Login realizado com sucesso.",user:{id:u.id,name:u.name,email:u.email,role:u.role},barbershop:{id:u.barbershop_id,name:u.shop_name,slug:u.shop_slug}},200,{"set-cookie":sessionCookie(sid)});
  }
  if(url.pathname==="/api/auth/me"&&request.method==="GET"){
   const s=await readSession(request,env);if(!s||s.role!=="owner")return json({error:"Acesso não autorizado. Faça login."},401);
   return json({id:s.user_id,barbershop_id:s.barbershop_id,name:s.name,email:s.email,role:s.role,barbershop_slug:s.barbershop_slug});
  }
  if(url.pathname==="/api/auth/logout"&&request.method==="POST"){
   const s=await readSession(request,env);if(s)await env.DB.prepare("DELETE FROM auth_sessions WHERE id=?").bind(s.id).run();
   return json({message:"Logout realizado com sucesso."},200,{"set-cookie":sessionCookie("",0)});
  }

  if(url.pathname==="/api/auth/barber/login"&&request.method==="POST"){
   const d=await request.json().catch(()=>null);
   if(!d||typeof d!=="object")return json({error:"Informe o profissional e o PIN."},400);
   const slug=String(d.slug||"").trim().toLowerCase();
   const barberId=Number(d.barber_id);
   const pin=d.pin;
   if(!/^[a-z0-9-]{1,120}$/.test(slug)||!Number.isSafeInteger(barberId)||barberId<1||typeof pin!=="string"||!/^\d{4}$/.test(pin))return json({error:"Selecione o profissional e informe um PIN de quatro números."},400);
   const user=await env.DB.prepare("SELECT u.id,u.barbershop_id,u.name,u.pin_hash,u.role,u.can_serve,u.commission_percent,b.slug FROM users u JOIN barbershops b ON b.id=u.barbershop_id WHERE b.slug=? AND u.id=? AND u.role IN ('barber','owner') AND u.is_active=1 AND (u.role='barber' OR u.can_serve=1)").bind(slug,barberId).first();
   if(!user||!user.pin_hash)return json({error:"PIN ou acesso inválido."},401);
   const ip=request.headers.get("CF-Connecting-IP")||"unknown";
   const scopeKey="barber-pin:"+user.barbershop_id+":"+user.id+":"+ip;
   const now=Math.floor(Date.now()/1000);
   const current=await env.DB.prepare("SELECT failed_attempts,locked_until FROM login_attempts WHERE scope_key=?").bind(scopeKey).first();
   if(current?.locked_until&&current.locked_until>now)return json({error:"Muitas tentativas. Aguarde 15 minutos para tentar novamente."},429);
   const valid=await verifyPassword(user.pin_hash,pin);
   if(!valid){
    const attempt=await recordFailedPinAttempt(env,scopeKey,now);
    if(attempt?.locked_until&&attempt.locked_until>now)return json({error:"Limite de tentativas atingido. Acesso bloqueado por 15 minutos."},429);
    return json({error:"PIN ou acesso inválido."},401);
   }
   await env.DB.prepare("DELETE FROM login_attempts WHERE scope_key=?").bind(scopeKey).run();
   if(needsPasswordRehash(user.pin_hash)){
    await env.DB.prepare("UPDATE users SET pin_hash=? WHERE id=? AND barbershop_id=?").bind(await hashPassword(pin),user.id,user.barbershop_id).run();
   }
   const sid=await createSession(env,user,"barber");
   return json({message:"Login realizado com sucesso.",barber:{id:user.id,name:user.name,role:"barber",commission_percent:user.commission_percent||0},barbershop:{slug:user.slug}},200,{"set-cookie":sessionCookie(sid)});
  }
  if(url.pathname==="/api/auth/barber/me"&&request.method==="GET"){
   const s=await readSession(request,env);
   if(!s||s.role!=="barber"||!(s.account_role==="barber"||(s.account_role==="owner"&&s.can_serve)))return json({error:"Acesso não autorizado. Faça login."},401);
   return json({id:s.user_id,barbershop_id:s.barbershop_id,name:s.name,role:"barber",commission_percent:s.commission_percent||0,barbershop_slug:s.barbershop_slug});
  }
  if(url.pathname==="/api/auth/barber/logout"&&request.method==="POST"){
   const s=await readSession(request,env);
   if(s?.role==="barber")await env.DB.prepare("DELETE FROM auth_sessions WHERE id=?").bind(s.id).run();
   return json({message:"Logout realizado com sucesso."},200,{"set-cookie":sessionCookie("",0)});
  }

  const publicResponse = await handlePublicApi(request, env, url);
  if (publicResponse) return publicResponse;

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