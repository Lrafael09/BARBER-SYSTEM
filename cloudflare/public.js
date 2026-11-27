const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" }
});

export function normalizePhone(value) {
  return String(value ?? "").replace(/\D/g, "");
}

export function maskCustomerName(value) {
  return String(value ?? "").trim().split(/\s+/).filter(Boolean).map(part =>
    part.length <= 2 ? part[0] + "*".repeat(Math.max(0, part.length - 1)) :
      part.slice(0, 2) + "*".repeat(Math.min(part.length - 2, 5))
  ).join(" ");
}

export function parseDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return null;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  if (date.getUTCFullYear() !== year || date.getUTCMonth() !== month - 1 || date.getUTCDate() !== day) return null;
  return { value, weekday: (date.getUTCDay() + 6) % 7 };
}

export function parseClock(value) {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function clockText(minutes) {
  return String(Math.floor(minutes / 60)).padStart(2, "0") + ":" + String(minutes % 60).padStart(2, "0");
}

function dateTimeText(date, minutes) {
  return date + "T" + clockText(minutes) + ":00";
}

function overlaps(startA, endA, startB, endB) {
  return startA < endB && endA > startB;
}

function intervalOverlapsClock(start, end, date, startClock, endClock) {
  if (!startClock || !endClock) return false;
  const startValue = dateTimeText(date, startClock);
  const endValue = dateTimeText(date, endClock);
  return start < endValue && end > startValue;
}

async function findShop(env, slug) {
  return env.DB.prepare(
    "SELECT id,name,slug,whatsapp,logo_data,brand_color,theme FROM barbershops WHERE slug=?"
  ).bind(slug).first();
}

async function getService(env, shopId, serviceId) {
  return env.DB.prepare(
    "SELECT id,name,description,price_cents,duration_minutes FROM services WHERE id=? AND barbershop_id=? AND is_active=1"
  ).bind(serviceId, shopId).first();
}

async function getBookableBarber(env, shopId, barberId) {
  return env.DB.prepare(
    "SELECT id,name,role,commission_percent FROM users WHERE id=? AND barbershop_id=? AND is_active=1 AND (role='barber' OR (role='owner' AND can_serve=1))"
  ).bind(barberId, shopId).first();
}

async function loadHours(env, shopId, barberId, weekday) {
  const [business, personal, staffBreak] = await Promise.all([
    env.DB.prepare(
      "SELECT is_open,open_time,close_time,break_start,break_end FROM business_hours WHERE barbershop_id=? AND weekday=?"
    ).bind(shopId, weekday).first(),
    env.DB.prepare(
      "SELECT is_open,open_time,close_time,break_start,break_end FROM staff_hours WHERE barbershop_id=? AND user_id=? AND weekday=?"
    ).bind(shopId, barberId, weekday).first(),
    env.DB.prepare(
      "SELECT break_start,break_end FROM staff_breaks WHERE barbershop_id=? AND user_id=? AND weekday=?"
    ).bind(shopId, barberId, weekday).first()
  ]);
  return { business, personal, staffBreak, effective: personal || business };
}

function validBreak(start, end) {
  if (!start && !end) return true;
  return parseClock(start) !== null && parseClock(end) !== null && parseClock(end) > parseClock(start);
}

async function publicCatalog(env, slug) {
  const shop = await findShop(env, slug);
  if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
  const [services, staff] = await Promise.all([
    env.DB.prepare(
      "SELECT id,name,description,price_cents,duration_minutes FROM services WHERE barbershop_id=? AND is_active=1 ORDER BY name COLLATE NOCASE"
    ).bind(shop.id).all(),
    env.DB.prepare(
      "SELECT id,name,role FROM users WHERE barbershop_id=? AND is_active=1 AND (role='barber' OR (role='owner' AND can_serve=1)) ORDER BY name COLLATE NOCASE"
    ).bind(shop.id).all()
  ]);
  return json({
    shop,
    services: services.results || [],
    staff: staff.results || [],
    whatsapp: shop.whatsapp,
    logo_data: shop.logo_data,
    brand_color: shop.brand_color,
    theme: shop.theme
  });
}

async function publicSchedule(env, slug) {
  const shop = await findShop(env, slug);
  if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
  const rows = await env.DB.prepare(
    "SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM business_hours WHERE barbershop_id=? ORDER BY weekday"
  ).bind(shop.id).all();
  const configured = new Map((rows.results || []).map(row => [row.weekday, {
    weekday: row.weekday, is_open: Boolean(row.is_open), open_time: row.open_time,
    close_time: row.close_time, break_start: row.break_start, break_end: row.break_end
  }]));
  const days = Array.from({ length: 7 }, (_, weekday) => configured.get(weekday) || {
    weekday, is_open: false, open_time: null, close_time: null, break_start: null, break_end: null
  });
  return json({
    barbershop: { name: shop.name, slug: shop.slug },
    days,
    weekday_reference: "0=segunda-feira, 6=domingo"
  });
}

async function createCustomer(request, env, slug) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie nome e telefone em formato JSON." }, 400);
  const name = String(data.name || "").trim();
  const phone = normalizePhone(data.phone);
  if (!name || name.length > 120) return json({ error: "Informe um nome de até 120 caracteres." }, 400);
  if (phone.length < 10 || phone.length > 13) return json({ error: "Informe um telefone válido com DDD." }, 400);
  const shop = await findShop(env, slug);
  if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
  const existing = await env.DB.prepare(
    "SELECT id,name FROM customers WHERE barbershop_id=? AND phone=?"
  ).bind(shop.id, phone).first();
  if (existing) return json({
    message: "Este telefone já possui cadastro. Selecione o cadastro encontrado.",
    customer: { id: existing.id, display_name: maskCustomerName(existing.name) },
    already_registered: true
  });
  try {
    const result = await env.DB.prepare(
      "INSERT INTO customers(barbershop_id,name,phone,phone_last4) VALUES(?,?,?,?)"
    ).bind(shop.id, name, phone, phone.slice(-4)).run();
    return json({
      message: "Cadastro realizado com sucesso.",
      customer: { id: result.meta.last_row_id, display_name: maskCustomerName(name) },
      already_registered: false
    }, 201);
  } catch (error) {
    // Trata duas tentativas simultâneas de cadastrar o mesmo telefone.
    const duplicate = await env.DB.prepare(
      "SELECT id,name FROM customers WHERE barbershop_id=? AND phone=?"
    ).bind(shop.id, phone).first();
    if (duplicate) return json({
      message: "Este telefone já possui cadastro. Selecione o cadastro encontrado.",
      customer: { id: duplicate.id, display_name: maskCustomerName(duplicate.name) },
      already_registered: true
    });
    throw error;
  }
}

async function lookupCustomer(request, env, slug) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie os quatro números em formato JSON." }, 400);
  const last4 = normalizePhone(data.phone_last4);
  if (last4.length !== 4) return json({ error: "Informe exatamente os quatro últimos números do telefone." }, 400);
  const shop = await findShop(env, slug);
  if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
  const rows = await env.DB.prepare(
    "SELECT id,name FROM customers WHERE barbershop_id=? AND phone_last4=? ORDER BY name COLLATE NOCASE LIMIT 10"
  ).bind(shop.id, last4).all();
  const matches = (rows.results || []).map(row => ({ id: row.id, display_name: row.name }));
  return json({
    matches,
    count: matches.length,
    message: matches.length ? "Escolha seu cadastro ou informe outro telefone." :
      "Nenhum cadastro encontrado. Você pode fazer um novo cadastro."
  });
}

async function confirmCustomer(request, env, slug) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie os dados em formato JSON." }, 400);
  const last4 = normalizePhone(data.phone_last4);
  const customerId = Number(data.customer_id);
  if (last4.length !== 4 || !Number.isSafeInteger(customerId) || customerId < 1) {
    return json({ error: "Informe o cadastro e os quatro últimos números." }, 400);
  }
  const shop = await findShop(env, slug);
  if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
  const customer = await env.DB.prepare(
    "SELECT id,name FROM customers WHERE id=? AND barbershop_id=? AND phone_last4=?"
  ).bind(customerId, shop.id, last4).first();
  if (!customer) return json({ error: "Cadastro não encontrado para esses números." }, 404);
  return json({
    message: "Cadastro selecionado.",
    customer: { id: customer.id, display_name: customer.name },
    identity_verified: false
  });
}

async function publicAvailability(env, slug, url) {
  const shop = await findShop(env, slug);
  if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
  const serviceId = Number(url.searchParams.get("service_id"));
  const barberId = Number(url.searchParams.get("barber_id"));
  const day = parseDate(url.searchParams.get("date"));
  if (!Number.isSafeInteger(serviceId) || serviceId < 1 ||
      !Number.isSafeInteger(barberId) || barberId < 1 || !day) {
    return json({ error: "Informe service_id, barber_id e date (AAAA-MM-DD)." }, 400);
  }
  const [service, barber] = await Promise.all([
    getService(env, shop.id, serviceId),
    getBookableBarber(env, shop.id, barberId)
  ]);
  if (!service || !barber) return json({ error: "Serviço ou barbeiro indisponível." }, 404);
  const hours = await loadHours(env, shop.id, barberId, day.weekday);
  const { business, personal, staffBreak, effective } = hours;
  if (!business || !business.is_open || !effective || !effective.is_open) {
    return json({ date: day.value, slots: [] });
  }
  const opening = parseClock(effective.open_time);
  const closing = parseClock(effective.close_time);
  const businessOpening = parseClock(business.open_time);
  const businessClosing = parseClock(business.close_time);
  if ([opening, closing, businessOpening, businessClosing].some(value => value === null) ||
      !validBreak(business.break_start, business.break_end) ||
      !validBreak(personal?.break_start, personal?.break_end) ||
      !validBreak(staffBreak?.break_start, staffBreak?.break_end)) {
    return json({ error: "Os horários de funcionamento estão configurados incorretamente." }, 500);
  }
  const [blocks, appointments] = await Promise.all([
    env.DB.prepare(
      "SELECT starts_at,ends_at FROM time_blocks WHERE barbershop_id=? AND (barber_id IS NULL OR barber_id=?) AND starts_at<? AND ends_at>?"
    ).bind(shop.id, barberId, day.value + "T23:59:59", day.value + "T00:00:00").all(),
    env.DB.prepare(
      "SELECT starts_at,ends_at FROM appointments WHERE barbershop_id=? AND barber_id=? AND status='scheduled' AND starts_at<? AND ends_at>?"
    ).bind(shop.id, barberId, day.value + "T23:59:59", day.value + "T00:00:00").all()
  ]);
  const occupied = [...(blocks.results || []), ...(appointments.results || [])];
  const breaks = [
    [business.break_start, business.break_end],
    [effective.break_start, effective.break_end],
    [staffBreak?.break_start, staffBreak?.break_end]
  ].filter(([start, end]) => start && end).map(([start, end]) => [parseClock(start), parseClock(end)]);
  const slots = [];
  const duration = Number(service.duration_minutes);
  if (!Number.isSafeInteger(duration) || duration < 1 || duration > 1440) {
    return json({ error: "A duração do serviço está configurada incorretamente." }, 500);
  }
  for (let candidate = opening; candidate + duration <= closing; candidate += 15) {
    const end = candidate + duration;
    if (candidate < businessOpening || end > businessClosing) continue;
    if (breaks.some(([breakStart, breakEnd]) => overlaps(candidate, end, breakStart, breakEnd))) continue;
    const startText = dateTimeText(day.value, candidate);
    const endText = dateTimeText(day.value, end);
    if (occupied.some(item => item.starts_at < endText && item.ends_at > startText)) continue;
    slots.push(clockText(candidate));
  }
  return json({ date: day.value, slots });
}

async function createAppointment(request, env, slug) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie os dados do agendamento em JSON." }, 400);
  const customerId = Number(data.customer_id);
  const serviceId = Number(data.service_id);
  const barberId = Number(data.barber_id);
  const startsValue = data.starts_at;
  const match = typeof startsValue === "string" && startsValue.match(/^(\d{4}-\d{2}-\d{2})T([01]\d|2[0-3]):([0-5]\d)$/);
  const day = match && parseDate(match[1]);
  if (!Number.isSafeInteger(customerId) || customerId < 1 ||
      !Number.isSafeInteger(serviceId) || serviceId < 1 ||
      !Number.isSafeInteger(barberId) || barberId < 1 || !day) {
    return json({ error: "Informe cliente, serviço, barbeiro e data/hora válidos." }, 400);
  }
  const startMinutes = Number(match[2]) * 60 + Number(match[3]);
  const shop = await findShop(env, slug);
  if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
  const [service, customer, barber] = await Promise.all([
    getService(env, shop.id, serviceId),
    env.DB.prepare("SELECT id FROM customers WHERE id=? AND barbershop_id=?").bind(customerId, shop.id).first(),
    getBookableBarber(env, shop.id, barberId)
  ]);
  if (!service) return json({ error: "Serviço indisponível." }, 404);
  if (!customer) return json({ error: "Cliente não encontrado nesta barbearia." }, 404);
  if (!barber) return json({ error: "Barbeiro não encontrado nesta barbearia." }, 404);
  const duration = Number(service.duration_minutes);
  const endMinutes = startMinutes + duration;
  if (!Number.isSafeInteger(duration) || duration < 1 || duration > 1440 || endMinutes >= 1440) {
    return json({ error: "O serviço precisa terminar no mesmo dia." }, 409);
  }
  const endText = clockText(endMinutes);
  const startText = clockText(startMinutes);
  const hours = await loadHours(env, shop.id, barberId, day.weekday);
  const { business, personal, staffBreak, effective } = hours;
  if (!business || !business.is_open || !effective || !effective.is_open) {
    return json({ error: "Esse horário está fora do expediente da barbearia ou do profissional." }, 409);
  }
  const opening = parseClock(business.open_time);
  const closing = parseClock(business.close_time);
  const effectiveOpening = parseClock(effective.open_time);
  const effectiveClosing = parseClock(effective.close_time);
  if ([opening, closing, effectiveOpening, effectiveClosing].some(value => value === null) ||
      startMinutes < opening || endMinutes > closing ||
      startMinutes < effectiveOpening || endMinutes > effectiveClosing) {
    return json({ error: "Esse horário está fora do expediente da barbearia ou do profissional." }, 409);
  }
  const breaks = [
    [business.break_start, business.break_end],
    [effective.break_start, effective.break_end],
    [staffBreak?.break_start, staffBreak?.break_end]
  ].filter(([start, end]) => start && end).map(([start, end]) => [parseClock(start), parseClock(end)]);
  if (breaks.some(([breakStart, breakEnd]) =>
      breakStart === null || breakEnd === null || overlaps(startMinutes, endMinutes, breakStart, breakEnd))) {
    return json({ error: "Esse horário coincide com um intervalo." }, 409);
  }
  const startsAt = dateTimeText(day.value, startMinutes);
  const endsAt = dateTimeText(day.value, endMinutes);
  const block = await env.DB.prepare(
    "SELECT id FROM time_blocks WHERE barbershop_id=? AND (barber_id IS NULL OR barber_id=?) AND starts_at<? AND ends_at>? LIMIT 1"
  ).bind(shop.id, barberId, endsAt, startsAt).first();
  if (block) return json({ error: "O barbeiro ou a barbearia está indisponível nesse horário." }, 409);
  const conflict = await env.DB.prepare(
    "SELECT id FROM appointments WHERE barbershop_id=? AND barber_id=? AND status='scheduled' AND starts_at<? AND ends_at>? LIMIT 1"
  ).bind(shop.id, barberId, endsAt, startsAt).first();
  if (conflict) return json({ error: "Esse horário acabou de ser ocupado. Escolha outro." }, 409);
  try {
    const result = await env.DB.prepare(
      "INSERT INTO appointments(barbershop_id,customer_id,service_id,barber_id,service_name,price_cents,duration_minutes,starts_at,ends_at,commission_percent,status) VALUES(?,?,?,?,?,?,?,?,?,?,'scheduled')"
    ).bind(shop.id, customerId, serviceId, barberId, service.name, service.price_cents,
      duration, startsAt, endsAt, barber.commission_percent).run();
    return json({
      message: "Agendamento realizado com sucesso.",
      appointment: {
        id: result.meta.last_row_id, service: service.name, price_cents: service.price_cents,
        duration_minutes: duration, starts_at: startsAt, ends_at: endsAt, status: "scheduled"
      }
    }, 201);
  } catch (error) {
    if (String(error?.message || error).includes("appointment_conflict")) {
      return json({ error: "Esse horário acabou de ser ocupado. Escolha outro." }, 409);
    }
    throw error;
  }
}

async function cancelPublicAppointment(request, env, slug, appointmentId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie o telefone para localizar o agendamento." }, 400);
  const phone = normalizePhone(data.phone);
  if (phone.length < 10 || phone.length > 13) return json({ error: "Informe o telefone completo com DDD." }, 400);
  const shop = await findShop(env, slug);
  if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
  const appointment = await env.DB.prepare(
    "SELECT a.id,a.status FROM appointments a JOIN customers c ON c.id=a.customer_id AND c.barbershop_id=a.barbershop_id WHERE a.id=? AND a.barbershop_id=? AND c.phone=?"
  ).bind(appointmentId, shop.id, phone).first();
  if (!appointment) return json({ error: "Agendamento não encontrado para esses dados." }, 404);
  if (appointment.status !== "scheduled") return json({ error: "Esse agendamento não está mais ativo." }, 409);
  const result = await env.DB.prepare(
    "UPDATE appointments SET status='cancelled',cancellation_reason='Cancelado pelo cliente',cancelled_at=CURRENT_TIMESTAMP WHERE id=? AND barbershop_id=? AND status='scheduled'"
  ).bind(appointmentId, shop.id).run();
  if (!result.meta.changes) return json({ error: "Esse agendamento já foi alterado." }, 409);
  return json({ message: "Agendamento cancelado com sucesso." });
}

export async function handlePublicApi(request, env, url) {
  const catalog = url.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/catalog$/);
  if (catalog && request.method === "GET") return publicCatalog(env, catalog[1]);

  const schedule = url.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/schedule$/);
  if (schedule && request.method === "GET") return publicSchedule(env, schedule[1]);

  const createCustomerMatch = url.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/customers$/);
  if (createCustomerMatch && request.method === "POST") return createCustomer(request, env, createCustomerMatch[1]);

  const lookupMatch = url.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/customers\/lookup$/);
  if (lookupMatch && request.method === "POST") return lookupCustomer(request, env, lookupMatch[1]);

  const confirmMatch = url.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/customers\/confirm$/);
  if (confirmMatch && request.method === "POST") return confirmCustomer(request, env, confirmMatch[1]);

  const availability = url.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/availability$/);
  if (availability && request.method === "GET") return publicAvailability(env, availability[1], url);

  const cancel = url.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/appointments\/(\d+)\/cancel$/);
  if (cancel && request.method === "POST") return cancelPublicAppointment(request, env, cancel[1], Number(cancel[2]));

  const appointment = url.pathname.match(/^\/api\/public\/shops\/([a-z0-9-]+)\/appointments$/);
  if (appointment && request.method === "POST") return createAppointment(request, env, appointment[1]);

  return null;
}
