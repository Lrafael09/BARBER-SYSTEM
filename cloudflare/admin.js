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

export async function handleAdminApi(request, env, url) {
  if (!url.pathname.startsWith("/api/admin/")) return null;
  const session = await readOwnerSession(request, env);
  if (!session || session.role !== "owner" || session.account_role !== "owner") {
    return json({ error: "Acesso não autorizado. Faça login como proprietário." }, 401);
  }
  const shopId = session.barbershop_id;

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
