import { hashPassword } from "./passwords.js";

const json = (data, status = 200) => new Response(JSON.stringify(data), {
  status,
  headers: { "content-type": "application/json; charset=utf-8" }
});

async function readOwnerSession(request, env) {
  const raw = request.headers.get("Cookie") || "";
  const sid = raw.split(";").map(value => value.trim())
    .find(value => value.startsWith("barber_session="))?.slice(15);
  if (!sid) return null;
  return env.DB.prepare(
    "SELECT s.id,s.user_id,s.barbershop_id,s.role,u.name,u.email,u.role AS account_role,u.is_active,b.slug AS barbershop_slug FROM auth_sessions s JOIN users u ON u.id=s.user_id JOIN barbershops b ON b.id=s.barbershop_id WHERE s.id=? AND s.expires_at>datetime('now') AND u.is_active=1 AND u.role='owner'"
  ).bind(sid).first();
}

function validDate(value) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}$/.test(value)) return false;
  const [year, month, day] = value.split("-").map(Number);
  const date = new Date(Date.UTC(year, month - 1, day));
  return date.getUTCFullYear() === year && date.getUTCMonth() === month - 1 && date.getUTCDate() === day;
}

export function parseMoneyCents(value) {
  const normalized = String(value ?? "").trim().replace(",", ".");
  if (!/^\d+(\.\d{1,2})?$/.test(normalized)) throw new Error("Informe um valor válido em reais.");
  const [whole, fraction = ""] = normalized.split(".");
  const amount = Number(whole) * 100 + Number(fraction.padEnd(2, "0"));
  if (!Number.isSafeInteger(amount) || amount < 0 || amount > 100000000) {
    throw new Error("Informe um valor entre R$ 0,00 e R$ 1.000.000,00.");
  }
  return amount;
}

function dateText(date) {
  return date.toISOString().slice(0, 10);
}

function addDays(value, count) {
  const date = new Date(value + "T00:00:00.000Z");
  date.setUTCDate(date.getUTCDate() + count);
  return dateText(date);
}

function mondayOf(value) {
  const weekday = new Date(value + "T00:00:00.000Z").getUTCDay();
  return addDays(value, -((weekday + 6) % 7));
}

export function financePeriod(period, today = new Date().toISOString().slice(0, 10)) {
  if (!validDate(today)) throw new Error("Data atual inválida.");
  if (period === "today") return { start: today, end: today };
  if (period === "week") return { start: mondayOf(today), end: today };
  if (period === "month") return { start: today.slice(0, 7) + "-01", end: today };
  if (period === "year") return { start: today.slice(0, 4) + "-01-01", end: today };
  throw new Error("Período inválido. Use today, week, month ou year.");
}

async function financialConfig(env, shopId) {
  const [costs, settings] = await Promise.all([
    env.DB.prepare("SELECT id,name,amount_cents FROM fixed_costs WHERE barbershop_id=? ORDER BY id").bind(shopId).all(),
    env.DB.prepare("SELECT desired_profit_cents FROM financial_settings WHERE barbershop_id=?").bind(shopId).first()
  ]);
  const fixedCosts = costs.results || [];
  const totalCosts = fixedCosts.reduce((total, item) => total + Number(item.amount_cents), 0);
  return { fixedCosts, desiredProfit: settings?.desired_profit_cents || 0, totalCosts };
}

async function openDaysInRange(env, shopId, startValue, endValue) {
  const rows = await env.DB.prepare(
    "SELECT weekday,is_open FROM business_hours WHERE barbershop_id=?"
  ).bind(shopId).all();
  const openWeekdays = rows.results?.length
    ? new Set(rows.results.filter(row => row.is_open).map(row => row.weekday))
    : new Set([0, 1, 2, 3, 4, 5]);
  const days = [];
  for (let current = startValue; current <= endValue; current = addDays(current, 1)) {
    const weekday = (new Date(current + "T00:00:00.000Z").getUTCDay() + 6) % 7;
    if (openWeekdays.has(weekday)) days.push(current);
  }
  return days;
}

async function monthlyRevenueTarget(env, shopId, year, month) {
  const config = await financialConfig(env, shopId);
  const start = String(year).padStart(4, "0") + "-" + String(month).padStart(2, "0") + "-01";
  const endDate = new Date(Date.UTC(year, month + 1, 0));
  const end = dateText(endDate);
  const openDays = await openDaysInRange(env, shopId, start, end);
  const monthlyTarget = config.totalCosts + config.desiredProfit;
  const dailyTarget = openDays.length ? Math.round(monthlyTarget / openDays.length) : 0;
  return { monthlyTarget, dailyTarget, openDays: openDays.length };
}

async function goalTargets(env, shopId, today) {
  const [yearText, monthText] = today.split("-");
  const year = Number(yearText), month = Number(monthText);
  const monthData = await monthlyRevenueTarget(env, shopId, year, month);
  const weekStart = mondayOf(today);
  const weekEnd = addDays(weekStart, 6);
  const weekDays = await openDaysInRange(env, shopId, weekStart, weekEnd);
  let weekly = 0;
  for (const day of weekDays) {
    const [dayYear, dayMonth] = day.split("-").map(Number);
    const dayTarget = await monthlyRevenueTarget(env, shopId, dayYear, dayMonth);
    weekly += dayTarget.dailyTarget;
  }
  return { daily: monthData.dailyTarget, weekly, monthly: monthData.monthlyTarget };
}

async function getFinancialConfig(env, shopId) {
  const config = await financialConfig(env, shopId);
  return json({
    fixed_costs: config.fixedCosts,
    fixed_costs_total_cents: config.totalCosts,
    desired_profit_cents: config.desiredProfit
  });
}

async function saveFinancialConfig(request, env, shopId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object" || !Array.isArray(data.fixed_costs)) {
    return json({ error: "Informe as despesas fixas e o lucro desejado." }, 400);
  }
  if (data.fixed_costs.length > 50) return json({ error: "Cadastre no máximo 50 despesas fixas." }, 400);
  let desiredProfit;
  const normalized = [];
  try {
    desiredProfit = parseMoneyCents(data.desired_profit ?? 0);
    for (const item of data.fixed_costs) {
      if (!item || typeof item !== "object") throw new Error("Uma das despesas está inválida.");
      const name = String(item.name || "").trim();
      const amount = parseMoneyCents(item.amount);
      if (!name || name.length > 100 || amount <= 0) throw new Error("Cada despesa precisa de nome e valor maior que zero.");
      normalized.push({ name, amount });
    }
  } catch (error) {
    return json({ error: error.message }, 400);
  }
  const statements = [
    env.DB.prepare("DELETE FROM fixed_costs WHERE barbershop_id=?").bind(shopId),
    ...normalized.map(item => env.DB.prepare(
      "INSERT INTO fixed_costs(barbershop_id,name,amount_cents) VALUES(?,?,?)"
    ).bind(shopId, item.name, item.amount)),
    env.DB.prepare(
      "INSERT INTO financial_settings(barbershop_id,desired_profit_cents) VALUES(?,?) ON CONFLICT(barbershop_id) DO UPDATE SET desired_profit_cents=excluded.desired_profit_cents,updated_at=CURRENT_TIMESTAMP"
    ).bind(shopId, desiredProfit)
  ];
  await env.DB.batch(statements);
  return json({ message: "Despesas fixas e lucro desejado salvos." });
}

async function financeSummary(env, shopId, url) {
  const period = url.searchParams.get("period") || "month";
  let range;
  try { range = financePeriod(period); }
  catch (error) { return json({ error: error.message }, 400); }

  await env.DB.prepare(
    "INSERT OR IGNORE INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date,appointment_id) SELECT barbershop_id,'income','Atendimento concluído: '||service_name,'Atendimentos',price_cents,date(starts_at),id FROM appointments WHERE barbershop_id=? AND status='completed'"
  ).bind(shopId).run();

  const [totals, goals, config] = await Promise.all([
    env.DB.prepare(
      "SELECT COALESCE(SUM(CASE WHEN entry_type='income' THEN amount_cents ELSE 0 END),0) AS income,COALESCE(SUM(CASE WHEN entry_type='expense' THEN amount_cents ELSE 0 END),0) AS expenses,COUNT(*) AS count FROM finance_entries WHERE barbershop_id=? AND entry_date>=? AND entry_date<=?"
    ).bind(shopId, range.start, range.end).first(),
    goalTargets(env, shopId, new Date().toISOString().slice(0, 10)),
    financialConfig(env, shopId)
  ]);

  const today = new Date().toISOString().slice(0, 10);
  const periods = {
    daily: financePeriod("today", today),
    weekly: financePeriod("week", today),
    monthly: financePeriod("month", today)
  };
  const achieved = {};
  for (const [key, dates] of Object.entries(periods)) {
    const row = await env.DB.prepare(
      "SELECT COALESCE(SUM(price_cents),0) AS amount FROM appointments WHERE barbershop_id=? AND status='completed' AND substr(starts_at,1,10)>=? AND substr(starts_at,1,10)<=?"
    ).bind(shopId, dates.start, dates.end).first();
    achieved[key] = row?.amount || 0;
  }
  return json({
    period, start: range.start, end: range.end,
    income_cents: totals?.income || 0, expense_cents: totals?.expenses || 0,
    profit_cents: (totals?.income || 0) - (totals?.expenses || 0),
    entry_count: totals?.count || 0, goals, goal_achieved: achieved,
    fixed_costs_total_cents: config.totalCosts,
    desired_profit_cents: config.desiredProfit
  });
}

async function listFinanceEntries(env, shopId, url) {
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  if (from && !validDate(from)) return json({ error: "Data inicial inválida." }, 400);
  if (to && !validDate(to)) return json({ error: "Data final inválida." }, 400);
  const conditions = ["barbershop_id=?"];
  const params = [shopId];
  if (from) { conditions.push("entry_date>=?"); params.push(from); }
  if (to) { conditions.push("entry_date<=?"); params.push(to); }
  const rows = await env.DB.prepare(
    "SELECT id,entry_type,description,category,amount_cents,entry_date,appointment_id FROM finance_entries WHERE " + conditions.join(" AND ") + " ORDER BY entry_date DESC,id DESC LIMIT 500"
  ).bind(...params).all();
  return json({ entries: rows.results || [] });
}

async function createFinanceEntry(request, env, shopId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie o lançamento em JSON." }, 400);
  const type = data.entry_type;
  const description = String(data.description || "").trim();
  const category = String(data.category || "").trim() || null;
  const entryDate = data.entry_date || new Date().toISOString().slice(0, 10);
  let amount;
  try { amount = parseMoneyCents(data.amount); }
  catch (error) { return json({ error: error.message }, 400); }
  if (!["income", "expense"].includes(type)) return json({ error: "Selecione entrada ou saída." }, 400);
  if (!description || description.length > 160 || amount <= 0) return json({ error: "Informe descrição e valor maior que zero." }, 400);
  if (!validDate(entryDate)) return json({ error: "Data do lançamento inválida." }, 400);
  const result = await env.DB.prepare(
    "INSERT INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date) VALUES(?,?,?,?,?,?)"
  ).bind(shopId, type, description, category, amount, entryDate).run();
  return json({ message: "Lançamento salvo.", id: result.meta.last_row_id }, 201);
}

async function deleteFinanceEntry(env, shopId, entryId) {
  const result = await env.DB.prepare(
    "DELETE FROM finance_entries WHERE id=? AND barbershop_id=? AND appointment_id IS NULL"
  ).bind(entryId, shopId).run();
  if (!result.meta.changes) return json({ error: "Lançamento manual não encontrado." }, 404);
  return json({ message: "Lançamento removido." });
}

async function saveFinancialGoals(request, env, shopId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie as metas em JSON." }, 400);
  const statements = [];
  try {
    for (const period of ["daily", "weekly", "monthly"]) {
      const target = parseMoneyCents(data[period] ?? 0);
      statements.push(env.DB.prepare(
        "INSERT INTO financial_goals(barbershop_id,period_type,target_cents) VALUES(?,?,?) ON CONFLICT(barbershop_id,period_type) DO UPDATE SET target_cents=excluded.target_cents,updated_at=CURRENT_TIMESTAMP"
      ).bind(shopId, period, target));
    }
  } catch (error) {
    return json({ error: error.message }, 400);
  }
  await env.DB.batch(statements);
  return json({ message: "Metas financeiras atualizadas." });
}

async function listAdminAppointments(env, shopId, url) {
  const date = url.searchParams.get("date");
  const from = url.searchParams.get("from");
  const to = url.searchParams.get("to");
  const status = url.searchParams.get("status");
  for (const value of [date, from, to].filter(Boolean)) {
    if (!validDate(value)) return json({ error: "A data deve usar AAAA-MM-DD." }, 400);
  }
  if (status && !["scheduled", "completed", "cancelled"].includes(status)) {
    return json({ error: "Status de agendamento inválido." }, 400);
  }
  const conditions = ["a.barbershop_id=?"];
  const params = [shopId];
  if (date) { conditions.push("substr(a.starts_at,1,10)=?"); params.push(date); }
  if (from) { conditions.push("substr(a.starts_at,1,10)>=?"); params.push(from); }
  if (to) { conditions.push("substr(a.starts_at,1,10)<=?"); params.push(to); }
  if (status) { conditions.push("a.status=?"); params.push(status); }
  const rows = await env.DB.prepare(
    "SELECT a.id,a.barber_id,a.service_name,a.price_cents,a.duration_minutes,a.starts_at,a.ends_at,a.status,a.cancellation_reason,c.name AS customer_name,u.name AS barber_name FROM appointments a JOIN customers c ON c.id=a.customer_id AND c.barbershop_id=a.barbershop_id LEFT JOIN users u ON u.id=a.barber_id AND u.barbershop_id=a.barbershop_id WHERE " + conditions.join(" AND ") + " ORDER BY a.starts_at LIMIT 500"
  ).bind(...params).all();
  return json({ appointments: rows.results || [] });
}

async function cancelAdminAppointment(request, env, shopId, appointmentId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Informe o motivo do cancelamento." }, 400);
  const reason = String(data.reason || "").trim();
  if (!reason || reason.length > 250) return json({ error: "O motivo deve ter entre 1 e 250 caracteres." }, 400);
  const result = await env.DB.prepare(
    "UPDATE appointments SET status='cancelled',cancellation_reason=?,cancelled_at=CURRENT_TIMESTAMP WHERE id=? AND barbershop_id=? AND status='scheduled'"
  ).bind(reason, appointmentId, shopId).run();
  if (!result.meta.changes) return json({ error: "Agendamento ativo não encontrado nesta barbearia." }, 404);
  return json({ message: "Agendamento cancelado com sucesso." });
}

async function assignAppointmentBarber(request, env, shopId, appointmentId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Informe o profissional do agendamento." }, 400);
  let barberId = null, commissionPercent = null;
  if (data.barber_id !== null && data.barber_id !== "") {
    barberId = Number(data.barber_id);
    if (!Number.isSafeInteger(barberId) || barberId < 1) return json({ error: "Selecione um profissional válido." }, 400);
    const staff = await env.DB.prepare(
      "SELECT id,commission_percent FROM users WHERE id=? AND barbershop_id=? AND is_active=1 AND (role='barber' OR (role='owner' AND can_serve=1))"
    ).bind(barberId, shopId).first();
    if (!staff) return json({ error: "Esse profissional não está disponível para atendimento." }, 400);
    commissionPercent = staff.commission_percent || 0;
  }
  const appointment = await env.DB.prepare(
    "SELECT id,starts_at,ends_at,status FROM appointments WHERE id=? AND barbershop_id=?"
  ).bind(appointmentId, shopId).first();
  if (!appointment) return json({ error: "Agendamento não encontrado." }, 404);
  if (appointment.status !== "scheduled") return json({ error: "Só é possível editar o barbeiro de um agendamento ativo." }, 409);
  if (barberId !== null) {
    const conflict = await env.DB.prepare(
      "SELECT id FROM appointments WHERE barbershop_id=? AND barber_id=? AND id<>? AND status='scheduled' AND starts_at<? AND ends_at>? LIMIT 1"
    ).bind(shopId, barberId, appointmentId, appointment.ends_at, appointment.starts_at).first();
    if (conflict) return json({ error: "Esse profissional já possui outro atendimento nesse horário." }, 409);
  }
  try {
    const result = await env.DB.prepare(
      "UPDATE appointments SET barber_id=?,commission_percent=?,commission_cents=0 WHERE id=? AND barbershop_id=? AND status='scheduled'"
    ).bind(barberId, commissionPercent, appointmentId, shopId).run();
    if (!result.meta.changes) return json({ error: "Agendamento não encontrado ou já alterado." }, 409);
    return json({ message: "Profissional do agendamento atualizado." });
  } catch (error) {
    if (String(error?.message || error).includes("appointment_conflict")) {
      return json({ error: "Esse profissional já possui outro atendimento nesse horário." }, 409);
    }
    throw error;
  }
}

async function completeAdminAppointment(env, shopId, appointmentId) {
  const row = await env.DB.prepare(
    "SELECT a.id,a.service_name,a.price_cents,a.starts_at,a.commission_percent,u.commission_percent AS current_commission_percent FROM appointments a LEFT JOIN users u ON u.id=a.barber_id AND u.barbershop_id=a.barbershop_id WHERE a.id=? AND a.barbershop_id=? AND a.status='scheduled'"
  ).bind(appointmentId, shopId).first();
  if (!row) return json({ error: "Agendamento ativo não encontrado." }, 404);
  const percent = row.commission_percent ?? row.current_commission_percent ?? 0;
  const cents = Math.round(Number(row.price_cents) * Number(percent) / 100);
  await env.DB.batch([
    env.DB.prepare(
      "UPDATE appointments SET status='completed',commission_percent=?,commission_cents=? WHERE id=? AND barbershop_id=? AND status='scheduled'"
    ).bind(percent, cents, appointmentId, shopId),
    env.DB.prepare(
      "INSERT OR IGNORE INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date,appointment_id) VALUES(?,'income',?,'Atendimentos',?,date(?),?)"
    ).bind(shopId, "Atendimento concluído: " + row.service_name, row.price_cents, row.starts_at, appointmentId)
  ]);
  return json({ message: "Atendimento concluído e registrado no financeiro.", commission_cents: cents });
}


function parsePercent(value) {
  const normalized = String(value ?? "0").trim().replace(",", ".");
  if (!/^\d{1,3}(\.\d{1,2})?$/.test(normalized)) throw new Error("A comissão deve ser uma porcentagem entre 0 e 100.");
  const amount = Number(normalized);
  if (!Number.isFinite(amount) || amount < 0 || amount > 100) throw new Error("A comissão deve ser uma porcentagem entre 0 e 100.");
  return Math.round(amount * 100) / 100;
}

function clockValue(value, label) {
  if (typeof value !== "string" || !/^([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error("Informe " + label + " no formato HH:MM.");
  }
  return value;
}

function localDateTime(value, label) {
  if (typeof value !== "string" || !/^\d{4}-\d{2}-\d{2}T([01]\d|2[0-3]):[0-5]\d$/.test(value)) {
    throw new Error(label + " deve usar o formato AAAA-MM-DDTHH:MM.");
  }
  const [day, time] = value.split("T");
  if (!validDate(day)) throw new Error(label + " contém uma data inválida.");
  return value + ":00";
}

async function listAdminServices(env, shopId) {
  const rows = await env.DB.prepare(
    "SELECT id,name,description,price_cents,duration_minutes,is_active FROM services WHERE barbershop_id=? ORDER BY is_active DESC,name COLLATE NOCASE"
  ).bind(shopId).all();
  return json({ services: (rows.results || []).map(row => ({
    ...row, price: (Number(row.price_cents) / 100).toFixed(2), is_active: Boolean(row.is_active)
  })) });
}

async function saveService(request, env, shopId, serviceId = null) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object" || (!serviceId && !data.name)) return json({ error: "Envie os dados do serviço em JSON." }, 400);
  let existing = null;
  if (serviceId) {
    existing = await env.DB.prepare(
      "SELECT id,name,description,price_cents,duration_minutes,is_active FROM services WHERE id=? AND barbershop_id=?"
    ).bind(serviceId, shopId).first();
    if (!existing) return json({ error: "Serviço não encontrado." }, 404);
  }
  const name = String(data.name ?? existing?.name ?? "").trim();
  const descriptionValue = data.description !== undefined ? data.description : existing?.description;
  const description = descriptionValue === null || descriptionValue === undefined ? null : String(descriptionValue).trim() || null;
  let price;
  try { price = data.price !== undefined ? parseMoneyCents(data.price) : Number(existing?.price_cents); }
  catch (error) { return json({ error: error.message }, 400); }
  const duration = data.duration_minutes !== undefined ? Number(data.duration_minutes) : Number(existing?.duration_minutes);
  if (!name || name.length > 120 || (description && description.length > 500)) {
    return json({ error: "Informe nome válido e descrição de até 500 caracteres." }, 400);
  }
  if (!Number.isSafeInteger(price) || price <= 0 || price > 100000000) return json({ error: "Informe um preço válido em reais." }, 400);
  if (!Number.isSafeInteger(duration) || duration < 1 || duration > 1440) return json({ error: "A duração deve estar entre 1 e 1440 minutos." }, 400);
  let active = existing ? Boolean(existing.is_active) : true;
  if (data.is_active !== undefined) {
    if (typeof data.is_active !== "boolean") return json({ error: "is_active deve ser verdadeiro ou falso." }, 400);
    active = data.is_active;
  }
  if (serviceId) {
    await env.DB.prepare(
      "UPDATE services SET name=?,description=?,price_cents=?,duration_minutes=?,is_active=? WHERE id=? AND barbershop_id=?"
    ).bind(name, description, price, duration, Number(active), serviceId, shopId).run();
    return json({ message: "Serviço atualizado com sucesso.", service: { id: serviceId, name, description, price_cents: price, duration_minutes: duration, is_active: active } });
  }
  const result = await env.DB.prepare(
    "INSERT INTO services(barbershop_id,name,description,price_cents,duration_minutes) VALUES(?,?,?,?,?)"
  ).bind(shopId, name, description, price, duration).run();
  return json({ message: "Serviço cadastrado com sucesso.", service: { id: result.meta.last_row_id, name, description, price_cents: price, duration_minutes: duration, is_active: true } }, 201);
}

async function deactivateService(env, shopId, serviceId) {
  const result = await env.DB.prepare(
    "UPDATE services SET is_active=0 WHERE id=? AND barbershop_id=?"
  ).bind(serviceId, shopId).run();
  if (!result.meta.changes) return json({ error: "Serviço não encontrado." }, 404);
  return json({ message: "Serviço desativado. O histórico foi preservado." });
}

async function listAdminBarbers(env, shopId) {
  const [barbers, owner] = await Promise.all([
    env.DB.prepare("SELECT id,name,role,is_active,can_serve,commission_percent FROM users WHERE barbershop_id=? AND role='barber' ORDER BY is_active DESC,name COLLATE NOCASE").bind(shopId).all(),
    env.DB.prepare("SELECT id,name,role,is_active,can_serve,commission_percent FROM users WHERE barbershop_id=? AND role='owner' LIMIT 1").bind(shopId).first()
  ]);
  const records = barbers.results || [];
  if (owner) records.unshift(owner);
  return json({ barbers: records.map(row => ({ ...row, is_active: Boolean(row.is_active), can_serve: Boolean(row.can_serve) })) });
}

async function createAdminBarber(request, env, shopId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie os dados do colaborador em JSON." }, 400);
  const name = String(data.name || "").trim();
  const pin = data.pin;
  let commission;
  try { commission = parsePercent(data.commission_percent ?? 0); }
  catch (error) { return json({ error: error.message }, 400); }
  if (!name || name.length > 120) return json({ error: "Informe um nome de até 120 caracteres." }, 400);
  if (typeof pin !== "string" || !/^\d{4}$/.test(pin)) return json({ error: "O PIN deve conter exatamente quatro números." }, 400);
  const result = await env.DB.prepare(
    "INSERT INTO users(barbershop_id,name,pin_hash,role,is_active,can_serve,commission_percent) VALUES(?,?,?,'barber',1,1,?)"
  ).bind(shopId, name, await hashPassword(pin), commission).run();
  return json({ message: "Colaborador cadastrado com sucesso.", barber: {
    id: result.meta.last_row_id, name, role: "barber", commission_percent: commission
  } }, 201);
}

async function updateAdminBarber(request, env, shopId, barberId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object" || !Object.keys(data).length) return json({ error: "Envie os dados que deseja atualizar." }, 400);
  const barber = await env.DB.prepare(
    "SELECT id,name,is_active,commission_percent FROM users WHERE id=? AND barbershop_id=? AND role='barber'"
  ).bind(barberId, shopId).first();
  if (!barber) return json({ error: "Colaborador não encontrado." }, 404);
  const name = String(data.name ?? barber.name).trim();
  const active = data.is_active ?? Boolean(barber.is_active);
  if (!name || name.length > 120) return json({ error: "Informe um nome de até 120 caracteres." }, 400);
  if (typeof active !== "boolean") return json({ error: "Estado de ativação inválido." }, 400);
  let commission;
  try { commission = parsePercent(data.commission_percent ?? barber.commission_percent ?? 0); }
  catch (error) { return json({ error: error.message }, 400); }
  let pinHash = null;
  if (data.pin !== undefined && data.pin !== "") {
    if (typeof data.pin !== "string" || !/^\d{4}$/.test(data.pin)) return json({ error: "O PIN deve conter exatamente quatro números." }, 400);
    pinHash = await hashPassword(data.pin);
  }
  if (pinHash) {
    await env.DB.prepare(
      "UPDATE users SET name=?,is_active=?,pin_hash=?,commission_percent=?,can_serve=CASE WHEN ?=1 THEN 1 ELSE can_serve END WHERE id=? AND barbershop_id=?"
    ).bind(name, Number(active), pinHash, commission, Number(active), barberId, shopId).run();
  } else {
    await env.DB.prepare(
      "UPDATE users SET name=?,is_active=?,commission_percent=?,can_serve=CASE WHEN ?=1 THEN 1 ELSE can_serve END WHERE id=? AND barbershop_id=?"
    ).bind(name, Number(active), commission, Number(active), barberId, shopId).run();
  }
  return json({ message: "Colaborador atualizado.", barber: { id: barberId, name, is_active: active, commission_percent: commission } });
}

async function deactivateAdminBarber(env, shopId, barberId) {
  const result = await env.DB.prepare(
    "UPDATE users SET is_active=0 WHERE id=? AND barbershop_id=? AND role='barber'"
  ).bind(barberId, shopId).run();
  if (!result.meta.changes) return json({ error: "Colaborador não encontrado." }, 404);
  return json({ message: "Colaborador desativado. O histórico foi preservado." });
}

async function updateOwnerProvider(request, env, session) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object" || typeof data.can_serve !== "boolean") {
    return json({ error: "Informe can_serve como verdadeiro ou falso." }, 400);
  }
  const current = await env.DB.prepare(
    "SELECT pin_hash,commission_percent FROM users WHERE id=? AND barbershop_id=? AND role='owner'"
  ).bind(session.user_id, session.barbershop_id).first();
  let pinHash = current?.pin_hash || null;
  let commission;
  try { commission = parsePercent(data.commission_percent ?? current?.commission_percent ?? 0); }
  catch (error) { return json({ error: error.message }, 400); }
  if (data.can_serve) {
    if (data.pin) {
      if (typeof data.pin !== "string" || !/^\d{4}$/.test(data.pin)) return json({ error: "O PIN do proprietário deve ter quatro números." }, 400);
      pinHash = await hashPassword(data.pin);
    }
    if (!pinHash) return json({ error: "Defina um PIN de quatro números para aparecer como profissional." }, 400);
  }
  await env.DB.prepare(
    "UPDATE users SET can_serve=?,pin_hash=?,commission_percent=? WHERE id=? AND barbershop_id=? AND role='owner'"
  ).bind(Number(data.can_serve), pinHash, commission, session.user_id, session.barbershop_id).run();
  return json({ message: "Preferência de atendimento do proprietário atualizada." });
}

async function listAdminCustomers(env, shopId) {
  const rows = await env.DB.prepare(
    "SELECT id,name,phone,created_at FROM customers WHERE barbershop_id=? ORDER BY name COLLATE NOCASE LIMIT 1000"
  ).bind(shopId).all();
  return json({ customers: rows.results || [] });
}

async function getBarbershopSettings(env, shopId) {
  const row = await env.DB.prepare(
    "SELECT name,logo_data,brand_color,theme,whatsapp FROM barbershops WHERE id=?"
  ).bind(shopId).first();
  if (!row) return json({ error: "Barbearia não encontrada." }, 404);
  return json(row);
}

async function saveBarbershopSettings(request, env, shopId) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie as configurações em JSON." }, 400);
  const name = String(data.name || "").trim();
  const whatsapp = String(data.whatsapp || "").replace(/\D/g, "");
  const color = String(data.brand_color || "#a8f05a").trim();
  const theme = String(data.theme || "dark").trim().toLowerCase();
  if (!name || name.length > 120) return json({ error: "Informe um nome de barbearia válido." }, 400);
  if (!/^#[0-9a-fA-F]{6}$/.test(color)) return json({ error: "Escolha uma cor válida." }, 400);
  if (!["dark", "light"].includes(theme)) return json({ error: "Tema inválido." }, 400);
  await env.DB.prepare(
    "UPDATE barbershops SET name=?,whatsapp=?,brand_color=?,theme=? WHERE id=?"
  ).bind(name, whatsapp || null, color.toLowerCase(), theme, shopId).run();
  return json({ message: "Identidade da barbearia atualizada." });
}

async function saveBarbershopLogo(request, env, shopId) {
  const form = await request.formData().catch(() => null);
  const image = form?.get("logo");
  if (!image || typeof image.arrayBuffer !== "function") return json({ error: "Selecione uma imagem para enviar." }, 400);
  if (Number(image.size) > 512 * 1024) return json({ error: "A imagem deve ter no máximo 512 KB." }, 400);
  const buffer = new Uint8Array(await image.arrayBuffer());
  if (!buffer.length || buffer.length > 512 * 1024) return json({ error: "A imagem deve ter no máximo 512 KB." }, 400);
  let mime = null;
  if (buffer.length >= 8 && [137,80,78,71,13,10,26,10].every((v,i)=>buffer[i]===v)) mime="image/png";
  else if (buffer.length >= 3 && buffer[0]===255 && buffer[1]===216 && buffer[2]===255) mime="image/jpeg";
  else if (buffer.length >= 12 && String.fromCharCode(...buffer.slice(0,4))==="RIFF" && String.fromCharCode(...buffer.slice(8,12))==="WEBP") mime="image/webp";
  else if (buffer.length >= 6 && ["GIF87a","GIF89a"].includes(String.fromCharCode(...buffer.slice(0,6)))) mime="image/gif";
  if (!mime) return json({ error: "Use uma imagem PNG, JPG, WEBP ou GIF válida." }, 400);
  let binary = "";
  for (let index = 0; index < buffer.length; index += 0x8000) {
    binary += String.fromCharCode(...buffer.subarray(index, index + 0x8000));
  }
  const logoData = "data:" + mime + ";base64," + btoa(binary);
  await env.DB.prepare("UPDATE barbershops SET logo_data=? WHERE id=?").bind(logoData, shopId).run();
  return json({ message: "Logo atualizada com sucesso.", logo_data: logoData });
}

async function adminDashboard(env, shopId) {
  await env.DB.prepare(
    "INSERT OR IGNORE INTO finance_entries(barbershop_id,entry_type,description,category,amount_cents,entry_date,appointment_id) SELECT barbershop_id,'income','Atendimento concluído: '||service_name,'Atendimentos',price_cents,date(starts_at),id FROM appointments WHERE barbershop_id=? AND status='completed'"
  ).bind(shopId).run();
  const today = new Date().toISOString().slice(0, 10);
  const month = today.slice(0, 7);
  const [totals, monthly, revenue, counts] = await Promise.all([
    env.DB.prepare("SELECT COUNT(*) AS appointments_today,SUM(CASE WHEN status='scheduled' THEN 1 ELSE 0 END) AS scheduled_today,SUM(CASE WHEN status='completed' THEN 1 ELSE 0 END) AS completed_today,SUM(CASE WHEN status='cancelled' THEN 1 ELSE 0 END) AS cancelled_today FROM appointments WHERE barbershop_id=? AND substr(starts_at,1,10)=?").bind(shopId, today).first(),
    env.DB.prepare("SELECT COUNT(*) AS appointments_month FROM appointments WHERE barbershop_id=? AND substr(starts_at,1,7)=?").bind(shopId, month).first(),
    env.DB.prepare("SELECT COALESCE(SUM(CASE WHEN entry_date=? AND entry_type='income' THEN amount_cents ELSE 0 END),0) AS today_income,COALESCE(SUM(CASE WHEN substr(entry_date,1,7)=? AND entry_type='income' THEN amount_cents ELSE 0 END),0) AS month_income FROM finance_entries WHERE barbershop_id=?").bind(today, month, shopId).first(),
    env.DB.prepare("SELECT (SELECT COUNT(*) FROM customers WHERE barbershop_id=?) AS customers,(SELECT COUNT(*) FROM services WHERE barbershop_id=? AND is_active=1) AS active_services,(SELECT COUNT(*) FROM users WHERE barbershop_id=? AND role IN ('barber','owner') AND is_active=1 AND can_serve=1) AS active_barbers").bind(shopId, shopId, shopId).first()
  ]);
  return json({
    today: { appointments: totals?.appointments_today || 0, scheduled: totals?.scheduled_today || 0, completed: totals?.completed_today || 0, cancelled: totals?.cancelled_today || 0, revenue_cents: revenue?.today_income || 0 },
    month: { appointments: monthly?.appointments_month || 0, revenue_cents: revenue?.month_income || 0 },
    base: counts || { customers: 0, active_services: 0, active_barbers: 0 }
  });
}

async function getBusinessSchedule(env, shopId) {
  const rows = await env.DB.prepare(
    "SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM business_hours WHERE barbershop_id=? ORDER BY weekday"
  ).bind(shopId).all();
  const map = new Map((rows.results || []).map(row => [row.weekday, {
    weekday: row.weekday, is_open: Boolean(row.is_open), open_time: row.open_time,
    close_time: row.close_time, break_start: row.break_start, break_end: row.break_end
  }]));
  return json({ days: Array.from({ length: 7 }, (_, weekday) => map.get(weekday) || {
    weekday, is_open: false, open_time: null, close_time: null, break_start: null, break_end: null
  }), weekday_reference: "0=segunda-feira, 6=domingo" });
}

async function saveBusinessSchedule(request, env, shopId) {
  const data = await request.json().catch(() => null);
  if (!data || !Array.isArray(data.days) || data.days.length < 1 || data.days.length > 7) {
    return json({ error: "Envie entre 1 e 7 dias em 'days'." }, 400);
  }
  const seen = new Set(), statements = [];
  for (const item of data.days) {
    const weekday = item?.weekday;
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6 || seen.has(weekday)) {
      return json({ error: "Cada dia deve aparecer uma única vez e usar weekday de 0 a 6." }, 400);
    }
    seen.add(weekday);
    if (typeof item.is_open !== "boolean") return json({ error: "is_open deve ser verdadeiro ou falso." }, 400);
    let opening = null, closing = null, breakStart = null, breakEnd = null, open = Number(item.is_open);
    if (open) {
      try {
        opening = clockValue(item.open_time, "abertura");
        closing = clockValue(item.close_time, "fechamento");
        if (closing <= opening) throw new Error("O fechamento deve ser depois da abertura.");
        if ((item.break_start == null) !== (item.break_end == null)) throw new Error("Informe início e fim do intervalo ou deixe ambos vazios.");
        if (item.break_start != null) {
          breakStart = clockValue(item.break_start, "início do intervalo");
          breakEnd = clockValue(item.break_end, "fim do intervalo");
          if (!(opening < breakStart && breakStart < breakEnd && breakEnd < closing)) throw new Error("O intervalo deve ficar dentro do horário de funcionamento.");
        }
      } catch (error) { return json({ error: error.message }, 400); }
    }
    statements.push(env.DB.prepare(
      "INSERT INTO business_hours(barbershop_id,weekday,is_open,open_time,close_time,break_start,break_end) VALUES(?,?,?,?,?,?,?) ON CONFLICT(barbershop_id,weekday) DO UPDATE SET is_open=excluded.is_open,open_time=excluded.open_time,close_time=excluded.close_time,break_start=excluded.break_start,break_end=excluded.break_end"
    ).bind(shopId, weekday, open, opening, closing, breakStart, breakEnd));
  }
  await env.DB.batch(statements);
  return json({ message: "Horários atualizados com sucesso." });
}

async function listTimeBlocks(env, shopId) {
  const rows = await env.DB.prepare(
    "SELECT b.id,b.barber_id,u.name AS barber_name,b.starts_at,b.ends_at,b.reason FROM time_blocks b LEFT JOIN users u ON u.id=b.barber_id AND u.barbershop_id=b.barbershop_id WHERE b.barbershop_id=? ORDER BY b.starts_at"
  ).bind(shopId).all();
  return json({ blocks: rows.results || [] });
}

async function createTimeBlock(request, env, session) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie os dados do bloqueio em JSON." }, 400);
  let start, end;
  try {
    start = localDateTime(data.starts_at, "starts_at");
    end = localDateTime(data.ends_at, "ends_at");
    if (end <= start) throw new Error("O fim do bloqueio deve ser depois do início.");
  } catch (error) { return json({ error: error.message }, 400); }
  const reason = data.reason == null ? null : String(data.reason).trim() || null;
  if (reason && reason.length > 250) return json({ error: "O motivo deve ter até 250 caracteres." }, 400);
  let barberId = null;
  if (data.barber_id != null && data.barber_id !== "") {
    barberId = Number(data.barber_id);
    if (!Number.isSafeInteger(barberId) || barberId < 1) return json({ error: "Barbeiro inválido." }, 400);
    const barber = await env.DB.prepare(
      "SELECT id FROM users WHERE id=? AND barbershop_id=? AND role IN ('barber','owner') AND is_active=1"
    ).bind(barberId, session.barbershop_id).first();
    if (!barber) return json({ error: "Barbeiro não encontrado nesta barbearia." }, 404);
  }
  const result = await env.DB.prepare(
    "INSERT INTO time_blocks(barbershop_id,barber_id,starts_at,ends_at,reason,created_by) VALUES(?,?,?,?,?,?)"
  ).bind(session.barbershop_id, barberId, start, end, reason, session.user_id).run();
  return json({ message: "Bloqueio cadastrado com sucesso.", block: {
    id: result.meta.last_row_id, barber_id: barberId, starts_at: start, ends_at: end, reason
  } }, 201);
}

async function deleteTimeBlock(env, shopId, blockId) {
  const result = await env.DB.prepare("DELETE FROM time_blocks WHERE id=? AND barbershop_id=?").bind(blockId, shopId).run();
  if (!result.meta.changes) return json({ error: "Bloqueio não encontrado." }, 404);
  return json({ message: "Bloqueio removido com sucesso." });
}

async function getStaffSchedule(env, shopId, userId) {
  const staff = await env.DB.prepare(
    "SELECT id,name,role,is_active,can_serve FROM users WHERE id=? AND barbershop_id=? AND role IN ('owner','barber')"
  ).bind(userId, shopId).first();
  if (!staff) return json({ error: "Profissional não encontrado." }, 404);
  const rows = await env.DB.prepare(
    "SELECT weekday,is_open,open_time,close_time,break_start,break_end FROM staff_hours WHERE barbershop_id=? AND user_id=? ORDER BY weekday"
  ).bind(shopId, userId).all();
  const map = new Map((rows.results || []).map(row => [row.weekday, row]));
  return json({ user: staff, days: Array.from({ length: 7 }, (_, weekday) => map.get(weekday) || {
    weekday, is_open: false, open_time: null, close_time: null, break_start: null, break_end: null
  }), uses_business_hours_when_unset: !(rows.results || []).length });
}

async function saveStaffSchedule(request, env, shopId, userId) {
  const staff = await env.DB.prepare(
    "SELECT id FROM users WHERE id=? AND barbershop_id=? AND role IN ('owner','barber')"
  ).bind(userId, shopId).first();
  if (!staff) return json({ error: "Profissional não encontrado." }, 404);
  const data = await request.json().catch(() => null);
  if (!data || !Array.isArray(data.days) || data.days.length !== 7) return json({ error: "Envie os sete dias da semana." }, 400);
  const seen = new Set(), statements = [];
  for (const item of data.days) {
    const weekday = item?.weekday;
    if (!Number.isInteger(weekday) || weekday < 0 || weekday > 6 || seen.has(weekday)) return json({ error: "Cada dia da semana deve aparecer uma única vez." }, 400);
    seen.add(weekday);
    if (typeof item.is_open !== "boolean") return json({ error: "Selecione se o profissional atende em cada dia." }, 400);
    let open = Number(item.is_open), opening = null, closing = null, breakStart = null, breakEnd = null;
    if (open) {
      try {
        opening = clockValue(item.open_time, "abertura");
        closing = clockValue(item.close_time, "fechamento");
        if (closing <= opening) throw new Error("O fechamento deve ser depois da abertura.");
        if ((item.break_start == null) !== (item.break_end == null)) throw new Error("Informe os dois horários do intervalo.");
        if (item.break_start != null) {
          breakStart = clockValue(item.break_start, "início do intervalo");
          breakEnd = clockValue(item.break_end, "fim do intervalo");
          if (!(opening < breakStart && breakStart < breakEnd && breakEnd < closing)) throw new Error("O intervalo precisa ficar dentro do expediente.");
        }
      } catch (error) { return json({ error: error.message }, 400); }
    }
    statements.push(env.DB.prepare(
      "INSERT INTO staff_hours(barbershop_id,user_id,weekday,is_open,open_time,close_time,break_start,break_end) VALUES(?,?,?,?,?,?,?,?) ON CONFLICT(barbershop_id,user_id,weekday) DO UPDATE SET is_open=excluded.is_open,open_time=excluded.open_time,close_time=excluded.close_time,break_start=excluded.break_start,break_end=excluded.break_end"
    ).bind(shopId, userId, weekday, open, opening, closing, breakStart, breakEnd));
  }
  await env.DB.batch(statements);
  return json({ message: "Horários individuais salvos." });
}

async function resetStaffSchedule(env, shopId, userId) {
  const staff = await env.DB.prepare("SELECT id FROM users WHERE id=? AND barbershop_id=? AND role IN ('owner','barber')").bind(userId, shopId).first();
  if (!staff) return json({ error: "Profissional não encontrado." }, 404);
  await env.DB.prepare("DELETE FROM staff_hours WHERE barbershop_id=? AND user_id=?").bind(shopId, userId).run();
  return json({ message: "Expediente individual removido. O profissional voltou a usar o horário da barbearia." });
}

async function listProducts(env, shopId) {
  const rows = await env.DB.prepare("SELECT id,name,description,price_cents,is_active FROM products WHERE barbershop_id=? ORDER BY is_active DESC,name COLLATE NOCASE").bind(shopId).all();
  return json({ products: (rows.results || []).map(row => ({ ...row, is_active: Boolean(row.is_active) })) });
}

async function saveProduct(request, env, shopId, productId = null) {
  const data = await request.json().catch(() => null);
  if (!data || typeof data !== "object") return json({ error: "Envie os dados do produto em JSON." }, 400);
  let existing = null;
  if (productId) {
    existing = await env.DB.prepare("SELECT id,name,description,price_cents,is_active FROM products WHERE id=? AND barbershop_id=?").bind(productId, shopId).first();
    if (!existing) return json({ error: "Produto não encontrado." }, 404);
  }
  const name = String(data.name ?? existing?.name ?? "").trim();
  const descriptionValue = data.description !== undefined ? data.description : existing?.description;
  const description = descriptionValue == null ? null : String(descriptionValue).trim() || null;
  let price;
  try { price = data.price !== undefined ? parseMoneyCents(data.price) : Number(existing?.price_cents); }
  catch (error) { return json({ error: error.message }, 400); }
  let active = existing ? Boolean(existing.is_active) : true;
  if (data.is_active !== undefined) {
    if (typeof data.is_active !== "boolean") return json({ error: "is_active deve ser verdadeiro ou falso." }, 400);
    active = data.is_active;
  }
  if (!name || name.length > 120 || (description && description.length > 500) || !Number.isSafeInteger(price) || price <= 0) {
    return json({ error: "Nome, descrição ou preço inválidos." }, 400);
  }
  if (productId) {
    await env.DB.prepare("UPDATE products SET name=?,description=?,price_cents=?,is_active=? WHERE id=? AND barbershop_id=?").bind(name, description, price, Number(active), productId, shopId).run();
    return json({ message: "Produto atualizado." });
  }
  const result = await env.DB.prepare("INSERT INTO products(barbershop_id,name,description,price_cents) VALUES(?,?,?,?)").bind(shopId, name, description, price).run();
  return json({ message: "Produto cadastrado.", product: { id: result.meta.last_row_id, name, description, price_cents: price, is_active: true } }, 201);
}

async function deactivateProduct(env, shopId, productId) {
  const result = await env.DB.prepare("UPDATE products SET is_active=0 WHERE id=? AND barbershop_id=?").bind(productId, shopId).run();
  if (!result.meta.changes) return json({ error: "Produto não encontrado." }, 404);
  return json({ message: "Produto desativado." });
}

export async function handleAdminApi(request, env, url) {
  if (!url.pathname.startsWith("/api/admin/")) return null;
  const session = await readOwnerSession(request, env);
  if (!session || session.role !== "owner" || session.account_role !== "owner") {
    return json({ error: "Acesso não autorizado. Faça login como proprietário." }, 401);
  }
  const shopId = session.barbershop_id;

  if (url.pathname === "/api/admin/dashboard" && request.method === "GET") return adminDashboard(env, shopId);
  if (url.pathname === "/api/admin/customers" && request.method === "GET") return listAdminCustomers(env, shopId);
  if (url.pathname === "/api/admin/barbershop" && request.method === "GET") return getBarbershopSettings(env, shopId);
  if (url.pathname === "/api/admin/barbershop/settings" && request.method === "POST") return saveBarbershopSettings(request, env, shopId);
  if (url.pathname === "/api/admin/barbershop/logo" && request.method === "POST") return saveBarbershopLogo(request, env, shopId);

  if (url.pathname === "/api/admin/schedule" && request.method === "GET") return getBusinessSchedule(env, shopId);
  if (url.pathname === "/api/admin/schedule" && request.method === "PUT") return saveBusinessSchedule(request, env, shopId);
  if (url.pathname === "/api/admin/blocks" && request.method === "GET") return listTimeBlocks(env, shopId);
  if (url.pathname === "/api/admin/blocks" && request.method === "POST") return createTimeBlock(request, env, session);

  const block = url.pathname.match(/^\/api\/admin\/blocks\/(\d+)$/);
  if (block && request.method === "DELETE") return deleteTimeBlock(env, shopId, Number(block[1]));

  if (url.pathname === "/api/admin/services" && request.method === "GET") return listAdminServices(env, shopId);
  if (url.pathname === "/api/admin/services" && request.method === "POST") return saveService(request, env, shopId);
  const service = url.pathname.match(/^\/api\/admin\/services\/(\d+)$/);
  if (service && request.method === "PATCH") return saveService(request, env, shopId, Number(service[1]));
  if (service && request.method === "DELETE") return deactivateService(env, shopId, Number(service[1]));

  if (url.pathname === "/api/admin/barbers" && request.method === "GET") return listAdminBarbers(env, shopId);
  if (url.pathname === "/api/admin/barbers" && request.method === "POST") return createAdminBarber(request, env, shopId);
  const barber = url.pathname.match(/^\/api\/admin\/barbers\/(\d+)$/);
  if (barber && request.method === "PATCH") return updateAdminBarber(request, env, shopId, Number(barber[1]));
  if (barber && request.method === "DELETE") return deactivateAdminBarber(env, shopId, Number(barber[1]));
  if (url.pathname === "/api/admin/staff/owner" && request.method === "PATCH") return updateOwnerProvider(request, env, session);

  const staffSchedule = url.pathname.match(/^\/api\/admin\/staff\/(\d+)\/schedule$/);
  if (staffSchedule && request.method === "GET") return getStaffSchedule(env, shopId, Number(staffSchedule[1]));
  if (staffSchedule && request.method === "PUT") return saveStaffSchedule(request, env, shopId, Number(staffSchedule[1]));
  if (staffSchedule && request.method === "DELETE") return resetStaffSchedule(env, shopId, Number(staffSchedule[1]));

  if (url.pathname === "/api/admin/products" && request.method === "GET") return listProducts(env, shopId);
  if (url.pathname === "/api/admin/products" && request.method === "POST") return saveProduct(request, env, shopId);
  const product = url.pathname.match(/^\/api\/admin\/products\/(\d+)$/);
  if (product && request.method === "PATCH") return saveProduct(request, env, shopId, Number(product[1]));
  if (product && request.method === "DELETE") return deactivateProduct(env, shopId, Number(product[1]));

  if (url.pathname === "/api/admin/appointments" && request.method === "GET") return listAdminAppointments(env, shopId, url);

  const cancelAppointment = url.pathname.match(/^\/api\/admin\/appointments\/(\d+)\/cancel$/);
  if (cancelAppointment && request.method === "POST") return cancelAdminAppointment(request, env, shopId, Number(cancelAppointment[1]));

  const assignBarber = url.pathname.match(/^\/api\/admin\/appointments\/(\d+)\/barber$/);
  if (assignBarber && request.method === "PATCH") return assignAppointmentBarber(request, env, shopId, Number(assignBarber[1]));

  const completeAppointment = url.pathname.match(/^\/api\/admin\/appointments\/(\d+)\/complete$/);
  if (completeAppointment && request.method === "POST") return completeAdminAppointment(env, shopId, Number(completeAppointment[1]));

  if (url.pathname === "/api/admin/finance/config" && request.method === "GET") return getFinancialConfig(env, shopId);
  if (url.pathname === "/api/admin/finance/config" && request.method === "PUT") return saveFinancialConfig(request, env, shopId);
  if (url.pathname === "/api/admin/finance/summary" && request.method === "GET") return financeSummary(env, shopId, url);
  if (url.pathname === "/api/admin/finance/entries" && request.method === "GET") return listFinanceEntries(env, shopId, url);
  if (url.pathname === "/api/admin/finance/entries" && request.method === "POST") return createFinanceEntry(request, env, shopId);
  if (url.pathname === "/api/admin/finance/goals" && request.method === "PUT") return saveFinancialGoals(request, env, shopId);

  const entry = url.pathname.match(/^\/api\/admin\/finance\/entries\/(\d+)$/);
  if (entry && request.method === "DELETE") return deleteFinanceEntry(env, shopId, Number(entry[1]));

  return json({ error: "Rota administrativa ainda não migrada.", path: url.pathname }, 501);
}
