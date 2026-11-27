import { handlePublicApi, saoPauloDateTime } from "./public.js";

const json = (data, status = 200, headers = {}) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8", ...headers }
});

async function readBarberSession(request, env) {
  const raw = request.headers.get("Cookie") || "";
  const sid = raw.split(";").map(value => value.trim())
    .find(value => value.startsWith("barber_session="))?.slice(15);
  if (!sid) return null;
  return env.DB.prepare(
    "SELECT s.id,s.user_id,s.barbershop_id,s.role,u.name,u.is_active,u.role AS account_role,u.can_serve,u.commission_percent,b.slug AS barbershop_slug FROM auth_sessions s JOIN users u ON u.id=s.user_id JOIN barbershops b ON b.id=s.barbershop_id WHERE s.id=? AND s.expires_at>datetime('now') AND u.is_active=1"
  ).bind(sid).first();
}

async function requireBarber(request, env) {
  const session = await readBarberSession(request, env);
  if (!session || session.role !== "barber" ||
      !(session.account_role === "barber" || (session.account_role === "owner" && session.can_serve))) {
    return { error: json({ error: "Acesso não autorizado. Faça login." }, 401) };
  }
  return { session };
}

export function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const parsed = new Date(Date.UTC(year, month - 1, day));
  return parsed.getUTCFullYear() === year && parsed.getUTCMonth() === month - 1 && parsed.getUTCDate() === day;
}

export function parseClock(value) {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) return null;
  const [hour, minute] = value.split(":").map(Number);
  return hour * 60 + minute;
}

function dateText(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value, count) {
  const date = new Date(value + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + count);
  return dateText(date);
}

export function mondayOf(value) {
  const weekday = new Date(value + "T00:00:00.000Z").getUTCDay();
  return addDays(value, -((weekday + 6) % 7));
}

export function monthStart(value) {
  return value.slice(0, 7) + "-01";
}

export function monthEnd(value) {
  const [year, month] = value.split("-").map(Number);
  return dateText(new Date(Date.UTC(year, month, 0)));
}

export function commissionCents(priceCents, percent) {
  return Math.round(Number(priceCents) * Number(percent || 0) / 100);
}

async function getBarberAppointment(env, session, appointmentId, statuses = null) {
  const statusClause = statuses ? " AND a.status IN ('scheduled','completed','cancelled')" : "";
  return env.DB.prepare(
    "SELECT a.id,a.service_name,a.price_cents,a.starts_at,a.ends_at,a.status,a.commission_percent,a.commission_cents,a.duration_minutes,a.cancellation_reason,u.commission_percent AS current_commission_percent FROM appointments a JOIN users u ON u.id=a.barber_id AND u.barbershop_id=a.barbershop_id WHERE a.id=? AND a.barbershop_id=? AND a.barber_id=?" + statusClause
  ).bind(appointmentId, session.barbershop_id, session.user_id).first();
}

async function completeAppointment(env, session, appointmentId, allowAnyStatus = false) {
  const statusFilter = allowAnyStatus ? "" : " AND a.status='scheduled'";
  const appointment = await env.DB.prepare(
    "SELECT a.id,a.service_name,a.price_cents,a.starts_at,a.commission_percent,u.commission_percent AS current_commission_percent FROM appointments a JOIN users u ON u.id=a.barber_id AND u.barbershop_id=a.barbershop_id WHERE a.id=? AND a.barbershop_id=? AND a.barber_id=?" + statusFilter
  ).bind(appointmentId, session.barbershop_id, session.user_id).first();
  if (!appointment) return json({ error: "Atendimento ativo não encontrado na sua agenda." }, 404);
  const percent = appointment.commission_percent ?? appointment.current_commission_percent ?? 0;
  const cents = commissionCents(appointment.price_cents, percent);
  const updateStatusFilter = allowAnyStatus ? "" : " AND status='scheduled'";
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE appointments SET status='completed',cancellation_reason=NULL,cancelled_at=NULL,commission_percent=?,commission_cents=? WHERE id=? AND barbershop_id=? AND barber_id=?" + updateStatusFilter
    ).bind(percent, cents, appointmentId, session.barbershop_id, session.user_id),
    env.DB.prepare(
      "INSERT OR IGNORE INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date,appointment_id) VALUES(?,'income',?,'Atendimentos',?,date(?),?)"
    ).bind(session.barbershop_id, "Atendimento concluído: " + appointment.service_name,
      appointment.price_cents, appointment.starts_at, appointmentId)
  ]);
  return json({ message: "Atendimento concluído e registrado no financeiro.", commission_cents: cents });
}

async function cancelAppointment(request, env, session, appointmentId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Informe o motivo do cancelamento." }, 400);
  const reason = String(data.reason || "").trim();
  if (!reason || reason.length > 250) return json({ error: "O motivo deve ter entre 1 e 250 caracteres." }, 400);
  const result = await env.DB.prepare(
    "UPDATE appointments SET status='cancelled',cancellation_reason=?,cancelled_at=CURRENT_TIMESTAMP WHERE id=? AND barbershop_id=? AND barber_id=? AND status='scheduled'"
  ).bind(reason, appointmentId, session.barbershop_id, session.user_id).run();
  if (!result.meta.changes) return json({ error: "Atendimento ativo não encontrado na sua agenda." }, 404);
  return json({ message: "Atendimento cancelado com sucesso." });
}

async function updateAppointmentStatus(request, env, session, appointmentId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Informe o novo status." }, 400);
  const status = data.status;
  if (!["scheduled", "completed", "cancelled"].includes(status)) return json({ error: "Status inválido." }, 400);
  const appointment = await getBarberAppointment(env, session, appointmentId);
  if (!appointment) return json({ error: "Atendimento não encontrado na sua agenda." }, 404);
  if (appointment.status === status) return json({ message: "O atendimento já está com esse status." });
  if (status === "completed") return completeAppointment(env, session, appointmentId, true);
  if (status === "cancelled") {
    const reason = String(data.reason || "").trim();
    if (!reason || reason.length > 250) return json({ error: "Informe o motivo do cancelamento (até 250 caracteres)." }, 400);
    await env.DB.batch([
      env.DB.prepare("UPDATE appointments SET status='cancelled',cancellation_reason=?,cancelled_at=CURRENT_TIMESTAMP,commission_cents=0 WHERE id=? AND barbershop_id=? AND barber_id=?").bind(reason, appointmentId, session.barbershop_id, session.user_id),
      env.DB.prepare("DELETE FROM finance_entries WHERE appointment_id=? AND barbershop_id=?").bind(appointmentId, session.barbershop_id)
    ]);
    return json({ message: "Status do atendimento atualizado com sucesso." });
  }
  try {
    await env.DB.batch([
      env.DB.prepare(
        "UPDATE appointments SET status='scheduled',cancellation_reason=NULL,cancelled_at=NULL,commission_cents=0 WHERE id=? AND barbershop_id=? AND barber_id=?"
      ).bind(appointmentId, session.barbershop_id, session.user_id),
      env.DB.prepare(
        "DELETE FROM finance_entries WHERE appointment_id=? AND barbershop_id=?"
      ).bind(appointmentId, session.barbershop_id)
    ]);
    return json({ message: "Status do atendimento atualizado com sucesso." });
  } catch (error) {
    if (String(error?.message || error).includes("appointment_conflict")) {
      return json({ error: "Não é possível reabrir: esse horário já possui outro atendimento agendado." }, 409);
    }
    throw error;
  }
}

async function barberSchedule(env, session) {
  const [businessRows, personalRows, breakRows] = await Promise.all([
    env.DB.prepare("SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM business_hours WHERE barbershop_id=? ORDER BY weekday").bind(session.barbershop_id).all(),
    env.DB.prepare("SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM staff_hours WHERE barbershop_id=? AND user_id=? ORDER BY weekday").bind(session.barbershop_id, session.user_id).all(),
    env.DB.prepare("SELECT weekday,break_start,break_end FROM staff_breaks WHERE barbershop_id=? AND user_id=? ORDER BY weekday").bind(session.barbershop_id, session.user_id).all()
  ]);
  const business = new Map((businessRows.results || []).map(row => [row.weekday, row]));
  const personal = new Map((personalRows.results || []).map(row => [row.weekday, row]));
  const breaks = new Map((breakRows.results || []).map(row => [row.weekday, row]));
  const days = Array.from({ length: 7 }, (_, weekday) => {
    const base = business.get(weekday) || {
      weekday, is_open: 0, open_time: null, close_time: null, break_start: null, break_end: null
    };
    const own = personal.get(weekday);
    const ownBreak = breaks.get(weekday);
    const effective = own || base;
    const lunchStart = ownBreak?.break_start ?? (own?.break_start || base.break_start);
    const lunchEnd = ownBreak?.break_end ?? (own?.break_end || base.break_end);
    return {
      weekday, is_open: Boolean(effective.is_open), open_time: effective.open_time,
      close_time: effective.close_time, break_start: lunchStart, break_end: lunchEnd,
      has_personal_schedule: Boolean(own), has_individual_break: Boolean(ownBreak),
      business_break_start: base.break_start, business_break_end: base.break_end
    };
  });
  return json({ days });
}

async function updateLunchBreaks(request, env, session) {
  const data = await request.json().catch(() => null);
  if (!data || !Array.isArray(data.days) || data.days.length !== 7) {
    return json({ error: "Envie a pausa dos sete dias da semana." }, 400);
  }
  const today = saoPauloDateTime().date;
  const seen = new Set();
  const writes = [];
  for (const item of data.days) {
    const weekday = item?.weekday;
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6 || seen.has(weekday)) {
      return json({ error: "Cada dia deve aparecer uma única vez." }, 400);
    }
    seen.add(weekday);
    let start = item.break_start || null;
    let end = item.break_end || null;
    if ((start === null) !== (end === null)) return json({ error: "Informe início e fim do almoço, ou deixe os dois vazios." }, 400);
    const [business, personal] = await Promise.all([
      env.DB.prepare("SELECT is_open,open_time,close_time FROM business_hours WHERE barbershop_id=? AND weekday=?").bind(session.barbershop_id, weekday).first(),
      env.DB.prepare("SELECT is_open,open_time,close_time FROM staff_hours WHERE barbershop_id=? AND user_id=? AND weekday=?").bind(session.barbershop_id, session.user_id, weekday).first()
    ]);
    if (start !== null) {
      const startMinute = parseClock(start), endMinute = parseClock(end);
      const effective = personal || business;
      if (startMinute === null || endMinute === null || endMinute <= startMinute) {
        return json({ error: "O almoço deve usar horários válidos no formato HH:MM." }, 400);
      }
      const effectiveOpen = parseClock(effective?.open_time);
      const effectiveClose = parseClock(effective?.close_time);
      if (!business?.is_open || !effective?.is_open || effectiveOpen === null || effectiveClose === null ||
          startMinute <= effectiveOpen || endMinute >= effectiveClose) {
        return json({ error: "O almoço precisa ficar dentro de um dia com expediente." }, 400);
      }
      const bookings = await env.DB.prepare(
        "SELECT starts_at,ends_at FROM appointments WHERE barbershop_id=? AND barber_id=? AND status='scheduled' AND starts_at>=?"
      ).bind(session.barbershop_id, session.user_id, today + "T00:00:00").all();
      for (const booking of bookings.results || []) {
        const bookingDate = booking.starts_at.slice(0, 10);
        const weekdayOfBooking = (new Date(bookingDate + "T00:00:00Z").getUTCDay() + 6) % 7;
        if (weekdayOfBooking === weekday &&
            parseClock(booking.starts_at.slice(11, 16)) < endMinute &&
            parseClock(booking.ends_at.slice(11, 16)) > startMinute) {
          return json({ error: "Já existe um agendamento futuro nesse horário de almoço. Ajuste ou remarque primeiro." }, 409);
        }
      }
    }
    if (start === null) {
      writes.push(env.DB.prepare(
        "DELETE FROM staff_breaks WHERE barbershop_id=? AND user_id=? AND weekday=?"
      ).bind(session.barbershop_id, session.user_id, weekday));
    } else {
      writes.push(env.DB.prepare(
        "INSERT INTO staff_breaks(barbershop_id,user_id,weekday,break_start,break_end) VALUES(?,?,?,?,?) ON CONFLICT(barbershop_id,user_id,weekday) DO UPDATE SET break_start=excluded.break_start,break_end=excluded.break_end"
      ).bind(session.barbershop_id, session.user_id, weekday, start, end));
    }
  }
  await env.DB.batch(writes);
  return json({ message: "Horários de almoço atualizados." });
}

async function barberCommissions(env, session, url) {
  const period = url.searchParams.get("period") || "weekly";
  const today = saoPauloDateTime().date;
  let start, end;
  if (period === "daily") start = end = today;
  else if (period === "weekly") { start = mondayOf(today); end = addDays(start, 6); }
  else if (period === "monthly") { start = monthStart(today); end = monthEnd(today); }
  else if (period === "yearly") { start = today.slice(0, 4) + "-01-01"; end = today.slice(0, 4) + "-12-31"; }
  else return json({ error: "Período inválido." }, 400);
  const [row, user] = await Promise.all([
    env.DB.prepare(
      "SELECT COUNT(*) AS completed_count,COALESCE(SUM(price_cents),0) AS sales_cents,COALESCE(SUM(commission_cents),0) AS commission_cents FROM appointments WHERE barbershop_id=? AND barber_id=? AND status='completed' AND date(starts_at) BETWEEN ? AND ?"
    ).bind(session.barbershop_id, session.user_id, start, end).first(),
    env.DB.prepare("SELECT commission_percent FROM users WHERE id=? AND barbershop_id=?").bind(session.user_id, session.barbershop_id).first()
  ]);
  return json({
    period, start, end, commission_percent: user?.commission_percent || 0,
    completed_count: row?.completed_count || 0, sales_cents: row?.sales_cents || 0,
    commission_cents: row?.commission_cents || 0
  });
}

export async function handleBarberApi(request, env, url) {
  if (!url.pathname.startsWith("/api/barber/")) return null;

  const staff = url.pathname.match(/^\/api\/barber\/shops\/([a-z0-9-]+)\/staff$/);
  if (staff && request.method === "GET") {
    const shop = await env.DB.prepare("SELECT id FROM barbershops WHERE slug=?").bind(staff[1]).first();
    if (!shop) return json({ error: "Barbearia não encontrada." }, 404);
    const rows = await env.DB.prepare(
      "SELECT id,name,role FROM users WHERE barbershop_id=? AND is_active=1 AND (role='barber' OR (role='owner' AND can_serve=1)) AND pin_hash IS NOT NULL ORDER BY name COLLATE NOCASE"
    ).bind(shop.id).all();
    return json({ staff: rows.results || [] });
  }

  const auth = await requireBarber(request, env);
  if (auth.error) return auth.error;
  const session = auth.session;

  if (url.pathname === "/api/barber/me" && request.method === "GET") {
    return json({
      id: session.user_id, barbershop_id: session.barbershop_id, name: session.name,
      role: "barber", commission_percent: session.commission_percent || 0
    });
  }

  if (url.pathname === "/api/barber/appointments" && request.method === "GET") {
    const date = url.searchParams.get("date");
    const from = url.searchParams.get("from");
    const to = url.searchParams.get("to");
    const status = url.searchParams.get("status");
    for (const value of [date, from, to].filter(Boolean)) {
      if (!validDate(value)) return json({ error: "A data deve usar AAAA-MM-DD." }, 400);
    }
    if (status && !["scheduled", "completed", "cancelled"].includes(status)) return json({ error: "Status inválido." }, 400);
    const conditions = ["a.barbershop_id=?", "a.barber_id=?"];
    const params = [session.barbershop_id, session.user_id];
    if (date) { conditions.push("substr(a.starts_at,1,10)=?"); params.push(date); }
    if (from) { conditions.push("substr(a.starts_at,1,10)>=?"); params.push(from); }
    if (to) { conditions.push("substr(a.starts_at,1,10)<=?"); params.push(to); }
    if (status) { conditions.push("a.status=?"); params.push(status); }
    const rows = await env.DB.prepare(
      "SELECT a.id,a.service_name,a.price_cents,a.duration_minutes,a.starts_at,a.ends_at,a.status,a.cancellation_reason,c.name AS customer_name FROM appointments a JOIN customers c ON c.id=a.customer_id AND c.barbershop_id=a.barbershop_id WHERE " + conditions.join(" AND ") + " ORDER BY a.starts_at LIMIT 300"
    ).bind(...params).all();
    return json({ appointments: rows.results || [] });
  }

  if (url.pathname === "/api/barber/customers" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT id,name FROM customers WHERE barbershop_id=? ORDER BY name COLLATE NOCASE LIMIT 1000"
    ).bind(session.barbershop_id).all();
    return json({ customers: rows.results || [] });
  }

  if (url.pathname === "/api/barber/services" && request.method === "GET") {
    const rows = await env.DB.prepare(
      "SELECT id,name,price_cents,duration_minutes FROM services WHERE barbershop_id=? AND is_active=1 ORDER BY name COLLATE NOCASE"
    ).bind(session.barbershop_id).all();
    return json({ services: rows.results || [] });
  }

  if (url.pathname === "/api/barber/commissions" && request.method === "GET") {
    return barberCommissions(env, session, url);
  }

  if (url.pathname === "/api/barber/schedule" && request.method === "GET") {
    return barberSchedule(env, session);
  }
  if (url.pathname === "/api/barber/schedule" && request.method === "PUT") {
    return updateLunchBreaks(request, env, session);
  }

  if (url.pathname === "/api/barber/availability" && request.method === "GET") {
    const forwarded = new URL(url);
    forwarded.pathname = "/api/public/shops/" + session.barbershop_slug + "/availability";
    forwarded.searchParams.set("barber_id", String(session.user_id));
    return handlePublicApi(request, env, forwarded);
  }

  if (url.pathname === "/api/barber/appointments" && request.method === "POST") {
    const data = await request.json().catch(() => null);
    if (!data || typeof data !== "object") return json({ error: "Informe os dados do agendamento." }, 400);
    data.barber_id = session.user_id;
    const forwardedRequest = new Request(request.url, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(data)
    });
    const forwarded = new URL(url);
    forwarded.pathname = "/api/public/shops/" + session.barbershop_slug + "/appointments";
    return handlePublicApi(forwardedRequest, env, forwarded);
  }

  const complete = url.pathname.match(/^\/api\/barber\/appointments\/(\d+)\/complete$/);
  if (complete && request.method === "POST") return completeAppointment(env, session, Number(complete[1]));

  const cancel = url.pathname.match(/^\/api\/barber\/appointments\/(\d+)\/cancel$/);
  if (cancel && request.method === "POST") return cancelAppointment(request, env, session, Number(cancel[1]));

  const status = url.pathname.match(/^\/api\/barber\/appointments\/(\d+)\/status$/);
  if (status && request.method === "PATCH") return updateAppointmentStatus(request, env, session, Number(status[1]));

  return json({ error: "Rota do profissional ainda não migrada.", path: url.pathname }, 501);
}
