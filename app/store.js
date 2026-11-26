// Willow House Budget — state, persistence and the arithmetic.
// One rule: every figure on screen is computed from the transaction
// list, so the Dashboard, Budgets and Reports pages can never disagree.

import { SEED_TRANSACTIONS, SEED_BILLS, SEED_GOALS, BUDGET_LIMITS, CATEGORIES } from './data.js';

const STORAGE_KEY = 'willow-house-budget-v1';

function clone(value) {
  return JSON.parse(JSON.stringify(value));
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed.transactions) || !Array.isArray(parsed.bills) || !Array.isArray(parsed.goals)) return null;
    return parsed;
  } catch {
    return null;
  }
}

export const state = loadState() || {
  transactions: clone(SEED_TRANSACTIONS),
  bills: clone(SEED_BILLS),
  goals: clone(SEED_GOALS),
  limits: clone(BUDGET_LIMITS),
};

export function save() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // Private browsing or full storage: the site still works in memory.
  }
}

export function resetDemo() {
  state.transactions = clone(SEED_TRANSACTIONS);
  state.bills = clone(SEED_BILLS);
  state.goals = clone(SEED_GOALS);
  state.limits = clone(BUDGET_LIMITS);
  save();
}

export function money(n) {
  return '$' + Number(n).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

export function money0(n) {
  return '$' + Math.round(Number(n)).toLocaleString('en-US');
}

export function fmtDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
}

export function shortDate(iso) {
  const [y, m, d] = iso.split('-').map(Number);
  return new Date(y, m - 1, d).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

export function incomeTotal() {
  return state.transactions.filter((t) => t.type === 'income').reduce((s, t) => s + t.amount, 0);
}

export function spentTotal() {
  return state.transactions.filter((t) => t.type === 'expense').reduce((s, t) => s + t.amount, 0);
}

export function spentByCategory() {
  const out = {};
  for (const c of CATEGORIES) out[c.name] = 0;
  for (const t of state.transactions) {
    if (t.type === 'expense' && Object.prototype.hasOwnProperty.call(out, t.category)) {
      out[t.category] += t.amount;
    }
  }
  return out;
}

export function categoryColor(name) {
  const found = CATEGORIES.find((c) => c.name === name);
  return found ? found.color : '#5f6f66';
}

export function addTransaction({ date, description, category, amount, type }) {
  const tx = {
    id: 't' + Date.now().toString(36),
    date,
    description: description.trim(),
    category,
    amount: Math.round(Number(amount) * 100) / 100,
    type,
  };
  state.transactions.push(tx);
  save();
  return tx;
}

export function deleteTransaction(id) {
  const i = state.transactions.findIndex((t) => t.id === id);
  if (i !== -1) {
    state.transactions.splice(i, 1);
    save();
    return true;
  }
  return false;
}

export function setLimit(category, amount) {
  state.limits[category] = Math.max(0, Math.round(Number(amount) * 100) / 100);
  save();
}

export function toggleBill(id) {
  const bill = state.bills.find((b) => b.id === id);
  if (bill) {
    bill.paid = !bill.paid;
    save();
    return bill;
  }
  return null;
}

export function addToGoal(id, amount) {
  const goal = state.goals.find((g) => g.id === id);
  if (goal) {
    goal.saved = Math.round((goal.saved + Number(amount)) * 100) / 100;
    save();
    return goal;
  }
  return null;
}

export function billsSummary() {
  const total = state.bills.reduce((s, b) => s + b.amount, 0);
  const paid = state.bills.filter((b) => b.paid).reduce((s, b) => s + b.amount, 0);
  const unpaid = state.bills.filter((b) => !b.paid);
  return { total, paid, unpaidTotal: total - paid, unpaidCount: unpaid.length, unpaid };
}

export function goalsSummary() {
  const target = state.goals.reduce((s, g) => s + g.target, 0);
  const saved = state.goals.reduce((s, g) => s + g.saved, 0);
  return { target, saved };
}
