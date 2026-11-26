// Willow House Budget — one render function per page. Each page is
// plain HTML built from the state, so every number on screen comes
// from the same transactions, bills and goals.

import { HOUSEHOLD, CATEGORIES, MONTHLY_HISTORY } from './data.js';
import {
  state, money, money0, fmtDate, shortDate, incomeTotal, spentTotal,
  spentByCategory, categoryColor, billsSummary, goalsSummary,
} from './store.js';
import { drawMonthlyChart, drawCategoryChart } from './charts.js';

export function esc(s) {
  return String(s)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

function pageHead(tag, title, intro) {
  return `<div class="page-head"><span class="month-tag">${esc(tag)}</span><h1>${esc(title)}</h1><p>${esc(intro)}</p></div>`;
}

function barRow(spent, limit) {
  const pct = limit > 0 ? Math.min(100, Math.round((spent / limit) * 100)) : 0;
  const over = spent > limit;
  const left = limit - spent;
  const cls = over ? 'over' : pct >= 85 ? 'warm' : '';
  return `<div class="bar" role="img" aria-label="${pct}% of budget used"><span class="${cls}" style="width:${pct}%"></span></div>
  <div class="bar-row"><span class="spent">${money(spent)} of ${money(limit)}</span>
  <span class="left ${over ? 'over' : ''}">${over ? money(-left) + ' over' : money(left) + ' left'}</span></div>`;
}

// ---------- Dashboard ----------

export function renderDashboard() {
  const income = incomeTotal();
  const spent = spentTotal();
  const remaining = income - spent;
  const rate = income > 0 ? Math.round(((income - spent) / income) * 100) : 0;
  const byCat = spentByCategory();
  const topCats = CATEGORIES.map((c) => ({ ...c, spent: byCat[c.name] || 0 }))
    .filter((c) => c.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 6);
  const bills = billsSummary();
  const upcoming = [...state.bills].filter((b) => !b.paid).sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);
  const recent = [...state.transactions].sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id)).slice(0, 6);
  const goals = goalsSummary();

  return `
  ${pageHead(HOUSEHOLD.month, 'Good morning, Willows', 'November at a glance: what came in, what went out, what is still due, and how the savings goals are doing. ' + HOUSEHOLD.members + '.')}
  <div class="grid grid-4">
    <div class="card stat good"><div class="label">Income in November</div><div class="value">${money0(income)}</div><div class="note">2 salaries + freelance work</div></div>
    <div class="card stat"><div class="label">Spent in November</div><div class="value">${money0(spent)}</div><div class="note">${state.transactions.filter((t) => t.type === 'expense').length} expenses so far</div></div>
    <div class="card stat ${remaining < 0 ? 'bad' : 'good'}"><div class="label">Left to spend</div><div class="value">${money0(remaining)}</div><div class="note">${rate}% of income not spent</div></div>
    <div class="card stat"><div class="label">Saved towards goals</div><div class="value">${money0(goals.saved)}</div><div class="note">of ${money0(goals.target)} across ${state.goals.length} goals</div></div>
  </div>

  <section class="block">
    <h2>Where the money went</h2>
    <div class="grid grid-2">
      <div class="card">
        <h3>Spending by category</h3>
        <p class="sub">November 2026, biggest first. Housing is rent; Savings is the monthly transfer.</p>
        ${topCats.map((c) => `<div style="margin-bottom:14px"><div class="bar-row"><span><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${c.color};margin-right:8px"></span>${esc(c.name)}</span><span class="spent">${money(c.spent)}</span></div>${barRow(c.spent, state.limits[c.name])}</div>`).join('')}
        <p class="hint"><a href="#/budgets">See all budgets →</a></p>
      </div>
      <div class="card">
        <h3>Income vs spending — last 6 months</h3>
        <p class="sub">August was the tight month: the car repair pushed spending to $5,120.</p>
        <canvas class="chart" id="trend-chart" aria-label="Bar chart of income and spending, June to November 2026"></canvas>
        <div class="legend"><span><i style="background:#1e4d3b"></i>Income</span><span><i style="background:#c98a2b"></i>Spending</span></div>
      </div>
    </div>
  </section>

  <section class="block">
    <h2>Still to pay &amp; latest activity</h2>
    <div class="grid grid-2">
      <div class="card">
        <h3>Upcoming bills</h3>
        <p class="sub">${money(bills.unpaidTotal)} still due in November across ${bills.unpaidCount} bills.</p>
        ${upcoming.length ? upcoming.map((b) => `<div class="bill-row"><div><div class="name">${esc(b.name)}</div><div class="due">Due ${fmtDate(b.due)}</div></div><span class="amount">${money(b.amount)}</span></div>`).join('') : '<p class="empty">All bills are paid. Nothing due.</p>'}
        <p class="hint"><a href="#/bills">See all bills →</a></p>
      </div>
      <div class="card">
        <h3>Recent transactions</h3>
        <p class="sub">The latest money in and out.</p>
        <table><tbody>
        ${recent.map((t) => `<tr class="${t.type}"><td>${esc(t.description)}<br><span class="muted">${shortDate(t.date)} · ${esc(t.category)}</span></td><td class="num">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td></tr>`).join('')}
        </tbody></table>
        <p class="hint"><a href="#/transactions">See all transactions →</a></p>
      </div>
    </div>
  </section>`;
}

export function afterDashboard() {
  drawMonthlyChart(document.getElementById('trend-chart'), MONTHLY_HISTORY);
}

// ---------- Transactions ----------

export function renderTransactions(filter) {
  const q = (filter.q || '').toLowerCase();
  const cat = filter.cat || 'All';
  const sort = filter.sort || 'date-desc';
  let list = [...state.transactions];
  if (q) list = list.filter((t) => (t.description + ' ' + t.category).toLowerCase().includes(q));
  if (cat !== 'All') list = list.filter((t) => t.category === cat);
  const sorts = {
    'date-desc': (a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id),
    'date-asc': (a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id),
    'amount-desc': (a, b) => b.amount - a.amount,
    'amount-asc': (a, b) => a.amount - b.amount,
  };
  list.sort(sorts[sort] || sorts['date-desc']);
  const shownSpent = list.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
  const shownIncome = list.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);

  return `
  ${pageHead(HOUSEHOLD.month, 'Transactions', 'Every dollar in and out in November. Search, filter by category, sort, add a new one, or delete a mistake — the totals update everywhere.')}
  <div class="card">
    <div class="toolbar">
      <div class="field grow"><label for="f-q">Search</label><input id="f-q" type="search" placeholder="e.g. GreenMart" value="${esc(filter.q || '')}"></div>
      <div class="field"><label for="f-cat">Category</label><select id="f-cat">
        <option ${cat === 'All' ? 'selected' : ''}>All</option>
        <option ${cat === 'Income' ? 'selected' : ''}>Income</option>
        ${CATEGORIES.map((c) => `<option ${cat === c.name ? 'selected' : ''}>${esc(c.name)}</option>`).join('')}
      </select></div>
      <div class="field"><label for="f-sort">Sort by</label><select id="f-sort">
        <option value="date-desc" ${sort === 'date-desc' ? 'selected' : ''}>Newest first</option>
        <option value="date-asc" ${sort === 'date-asc' ? 'selected' : ''}>Oldest first</option>
        <option value="amount-desc" ${sort === 'amount-desc' ? 'selected' : ''}>Largest amount</option>
        <option value="amount-asc" ${sort === 'amount-asc' ? 'selected' : ''}>Smallest amount</option>
      </select></div>
    </div>
    <p class="sub">Showing ${list.length} of ${state.transactions.length} transactions · income in view ${money(shownIncome)} · spending in view ${money(shownSpent)}</p>
    ${list.length ? `<table class="responsive"><thead><tr><th>What</th><th>Date</th><th>Category</th><th class="num">Amount</th><th></th></tr></thead><tbody>
      ${list.map((t) => `<tr class="${t.type}"><td>${esc(t.description)}</td><td class="nowrap">${shortDate(t.date)}</td><td><span class="cat">${esc(t.category)}</span></td><td class="num">${t.type === 'income' ? '+' : '−'}${money(t.amount)}</td><td><button class="danger small" data-action="delete-tx" data-id="${t.id}">Delete</button></td></tr>`).join('')}
    </tbody></table>` : '<p class="empty">No transactions match that search. Clear the search or pick another category.</p>'}
  </div>

  <section class="block"><div class="card">
    <h2>Add a transaction</h2>
    <p class="sub">It appears in the list above and in every total at once.</p>
    <form class="inline" id="add-tx-form">
      <div class="field"><label for="tx-date">Date</label><input id="tx-date" type="date" value="2026-11-27" required></div>
      <div class="field grow"><label for="tx-desc">Description</label><input id="tx-desc" type="text" placeholder="e.g. GreenMart — weekly shop" required maxlength="80"></div>
      <div class="field"><label for="tx-cat">Category</label><select id="tx-cat">
        ${CATEGORIES.map((c) => `<option>${esc(c.name)}</option>`).join('')}
      </select></div>
      <div class="field"><label for="tx-amount">Amount ($)</label><input id="tx-amount" type="number" min="0.01" step="0.01" placeholder="0.00" required></div>
      <div class="field"><label for="tx-type">Type</label><select id="tx-type"><option value="expense">Expense</option><option value="income">Income</option></select></div>
      <button type="submit">Add transaction</button>
    </form>
    <p class="hint"><button class="secondary small" data-action="reset-demo">Reset demo data</button> — restores the original November transactions, bills and goals.</p>
  </div></section>`;
}

// ---------- Budgets ----------

export function renderBudgets() {
  const byCat = spentByCategory();
  const totalLimit = CATEGORIES.reduce((s, c) => s + state.limits[c.name], 0);
  const totalSpent = CATEGORIES.reduce((s, c) => s + (byCat[c.name] || 0), 0);
  const over = CATEGORIES.filter((c) => (byCat[c.name] || 0) > state.limits[c.name]);

  return `
  ${pageHead(HOUSEHOLD.month, 'Budgets', `November limits for each category. ${money(totalSpent)} spent of ${money(totalLimit)} budgeted. ${over.length ? over.map((c) => c.name).join(', ') + ' is over budget.' : 'No category is over budget.'}`)}
  <div class="grid grid-3">
    ${CATEGORIES.map((c) => {
      const spent = byCat[c.name] || 0;
      const limit = state.limits[c.name];
      return `<div class="card">
        <h3><span style="display:inline-block;width:12px;height:12px;border-radius:3px;background:${c.color};margin-right:8px"></span>${esc(c.name)}</h3>
        ${barRow(spent, limit)}
        <form class="inline" data-limit-form="${esc(c.name)}" style="margin-top:12px">
          <div class="field"><label for="limit-${esc(c.name)}">Monthly limit ($)</label><input id="limit-${esc(c.name)}" type="number" min="0" step="1" value="${limit}" style="width:110px"></div>
          <button class="secondary small" type="submit">Save limit</button>
        </form>
      </div>`;
    }).join('')}
  </div>
  <section class="block"><div class="card">
    <h2>How the budget is set</h2>
    <p class="sub">Limits are the household's own plan, agreed at the start of the month: rent is fixed, groceries are shopped weekly, and $600 goes to savings before anything else. Change a limit and the bar above it updates — and so does the Dashboard.</p>
    <p class="total-line"><span>Total budgeted</span><span>${money(totalLimit)}</span></p>
    <p class="total-line"><span>Total spent</span><span>${money(totalSpent)}</span></p>
    <p class="total-line"><span>Still inside the plan</span><span>${money(totalLimit - totalSpent)}</span></p>
  </div></section>`;
}

// ---------- Bills ----------

export function renderBills() {
  const s = billsSummary();
  const rows = [...state.bills].sort((a, b) => a.due.localeCompare(b.due));
  const today = '2026-11-27';
  return `
  ${pageHead(HOUSEHOLD.month, 'Bills & subscriptions', 'Everything due in November, in due-date order. Mark a bill paid and the totals below update — nothing is due twice.')}
  <div class="grid grid-3">
    <div class="card stat"><div class="label">Due this month</div><div class="value">${money0(s.total)}</div><div class="note">${state.bills.length} bills &amp; subscriptions</div></div>
    <div class="card stat good"><div class="label">Already paid</div><div class="value">${money0(s.paid)}</div><div class="note">${state.bills.length - s.unpaidCount} of ${state.bills.length} paid</div></div>
    <div class="card stat ${s.unpaidCount ? 'warn' : 'good'}"><div class="label">Still to pay</div><div class="value">${money0(s.unpaidTotal)}</div><div class="note">${s.unpaidCount} bill${s.unpaidCount === 1 ? '' : 's'} left</div></div>
  </div>
  <section class="block"><div class="card">
    <h2>All bills</h2>
    ${rows.map((b) => {
      const overdue = !b.paid && b.due < today;
      const pill = b.paid ? '<span class="pill paid">Paid</span>' : overdue ? '<span class="pill overdue">Overdue</span>' : '<span class="pill due">Due</span>';
      return `<div class="bill-row">
        <div><div class="name">${esc(b.name)}</div><div class="due">Due ${fmtDate(b.due)}</div></div>
        ${pill}
        <span class="amount">${money(b.amount)}</span>
        <button class="secondary small" data-action="toggle-bill" data-id="${b.id}">${b.paid ? 'Mark unpaid' : 'Mark paid'}</button>
      </div>`;
    }).join('')}
    <p class="hint">Rent, power, water, internet, insurance and the small subscriptions — the same amounts appear in Transactions when they are paid.</p>
  </div></section>`;
}

// ---------- Goals ----------

export function renderGoals() {
  const s = goalsSummary();
  return `
  ${pageHead(HOUSEHOLD.month, 'Savings goals', `${money(s.saved)} saved towards ${money(s.target)} of goals. Add money to a goal and its bar moves — the money comes out of what is left to spend.`)}
  <div class="grid grid-2">
    ${state.goals.map((g) => {
      const pct = Math.min(100, Math.round((g.saved / g.target) * 100));
      const left = g.target - g.saved;
      return `<div class="card">
        <h3>${esc(g.name)}</h3>
        <p class="sub">${esc(g.note)}</p>
        ${barRow(g.saved, g.target)}
        <p class="bar-row"><span class="spent">${money(g.saved)} saved</span><span class="left">${left > 0 ? money(left) + ' to go' : 'Goal reached!'}</span></p>
        <form class="inline" data-goal-form="${g.id}" style="margin-top:12px">
          <div class="field"><label for="goal-${g.id}">Add funds ($)</label><input id="goal-${g.id}" type="number" min="1" step="1" placeholder="50" style="width:110px" required></div>
          <button class="secondary small" type="submit">Add to goal</button>
        </form>
      </div>`;
    }).join('')}
  </div>
  <section class="block"><div class="card">
    <h2>Why these four</h2>
    <p class="sub">The emergency fund comes first — three months of essentials before anything fun. The holiday is booked for next summer, the fridge is on borrowed time, and Leo has outgrown his bike. November's $600 savings transfer is already counted in the Emergency fund.</p>
    <p class="total-line"><span>Saved across all goals</span><span>${money(s.saved)}</span></p>
    <p class="total-line"><span>Still to save</span><span>${money(s.target - s.saved)}</span></p>
  </div></section>`;
}

// ---------- Reports ----------

export function renderReports(selectedKey) {
  const month = MONTHLY_HISTORY.find((m) => m.key === selectedKey) || MONTHLY_HISTORY[MONTHLY_HISTORY.length - 1];
  const byCat = spentByCategory();
  const catRows = CATEGORIES.map((c) => ({ label: c.name, value: byCat[c.name] || 0, color: c.color }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
  const total = catRows.reduce((s, r) => s + r.value, 0);
  const best = [...MONTHLY_HISTORY].sort((a, b) => (a.income - a.spent) - (b.income - b.spent)).pop();
  const worst = [...MONTHLY_HISTORY].sort((a, b) => (a.income - a.spent) - (b.income - b.spent)).shift();
  const saved = month.income - month.spent;

  return `
  ${pageHead(HOUSEHOLD.month, 'Reports', 'Six months of the household, side by side. Pick a month to see its income, spending and what was left over.')}
  <div class="card">
    <div class="toolbar">
      <div class="field"><label for="rep-month">Month</label><select id="rep-month">
        ${MONTHLY_HISTORY.map((m) => `<option value="${m.key}" ${m.key === month.key ? 'selected' : ''}>${m.label}</option>`).join('')}
      </select></div>
    </div>
    <div class="grid grid-4">
      <div class="stat"><div class="label">Income — ${esc(month.label)}</div><div class="value">${money0(month.income)}</div></div>
      <div class="stat"><div class="label">Spent — ${esc(month.label)}</div><div class="value">${money0(month.spent)}</div></div>
      <div class="stat ${saved < 0 ? 'bad' : 'good'}"><div class="label">Left over</div><div class="value">${money0(saved)}</div><div class="note">${Math.round((saved / month.income) * 100)}% of income kept</div></div>
      <div class="stat"><div class="label">Best month</div><div class="value" style="font-size:22px">${esc(best.label)}</div><div class="note">${money0(best.income - best.spent)} left over</div></div>
    </div>
  </div>

  <section class="block"><div class="grid grid-2">
    <div class="card">
      <h2>Income vs spending</h2>
      <p class="sub">Green is income, amber is spending. ${esc(worst.label)} was the tightest month — ${money0(worst.spent)} spent against ${money0(worst.income)} in.</p>
      <canvas class="chart" id="rep-trend" aria-label="Bar chart of income and spending, June to November 2026"></canvas>
      <div class="legend"><span><i style="background:#1e4d3b"></i>Income</span><span><i style="background:#c98a2b"></i>Spending</span></div>
    </div>
    <div class="card">
      <h2>Where November's money went</h2>
      <p class="sub">November 2026 breakdown, ${money(total)} of spending across ${catRows.length} categories.</p>
      <canvas class="chart" id="rep-cats" aria-label="Bar chart of November spending by category"></canvas>
      <div class="legend">${catRows.slice(0, 4).map((r) => `<span><i style="background:${r.color}"></i>${esc(r.label)} ${Math.round((r.value / total) * 100)}%</span>`).join('')}</div>
    </div>
  </div></section>

  <section class="block"><div class="card">
    <h2>Month by month</h2>
    <table class="responsive"><thead><tr><th>Month</th><th class="num">Income</th><th class="num">Spent</th><th class="num">Left over</th><th class="num">Kept</th></tr></thead><tbody>
    ${MONTHLY_HISTORY.map((m) => `<tr><td>${esc(m.label)}</td><td class="num">${money(m.income)}</td><td class="num">${money(m.spent)}</td><td class="num">${money(m.income - m.spent)}</td><td class="num">${Math.round(((m.income - m.spent) / m.income) * 100)}%</td></tr>`).join('')}
    </tbody></table>
    <p class="hint">The household keeps about a quarter of its income most months; August's car repair is the one exception, at 12% kept.</p>
  </div></section>`;
}

export function afterReports(selectedKey) {
  drawMonthlyChart(document.getElementById('rep-trend'), MONTHLY_HISTORY);
  const byCat = spentByCategory();
  const catRows = CATEGORIES.map((c) => ({ label: c.name, value: byCat[c.name] || 0, color: c.color }))
    .filter((r) => r.value > 0)
    .sort((a, b) => b.value - a.value);
  drawCategoryChart(document.getElementById('rep-cats'), catRows);
}
