// Willow House Budget — routing and wiring. The pages are rendered by
// views.js; this file only decides which page to show and handles
// clicks and forms, then re-renders so every total updates at once.

import { state, addTransaction, deleteTransaction, setLimit, toggleBill, addToGoal, resetDemo, save } from './store.js';
import { renderDashboard, afterDashboard, renderTransactions, renderBudgets, renderBills, renderGoals, renderReports, afterReports } from './views.js';

const app = document.getElementById('app');
const navLinks = [...document.querySelectorAll('[data-nav]')];

// Transactions page keeps its own filter while you use it.
const txFilter = { q: '', cat: 'All', sort: 'date-desc' };
let reportMonth = '2026-11';

function route() {
  const hash = location.hash || '#/';
  const page = hash.replace(/^#\/?/, '').split('/')[0] || 'dashboard';
  for (const link of navLinks) {
    link.classList.toggle('active', link.dataset.nav === page);
  }
  let html = '';
  let after = null;
  if (page === 'transactions') html = renderTransactions(txFilter);
  else if (page === 'budgets') html = renderBudgets();
  else if (page === 'bills') html = renderBills();
  else if (page === 'goals') html = renderGoals();
  else if (page === 'reports') { html = renderReports(reportMonth); after = () => afterReports(reportMonth); }
  else { html = renderDashboard(); after = afterDashboard; }
  app.innerHTML = html;
  if (after) after();
  window.scrollTo(0, 0);
}

// Clicks: delete a transaction, toggle a bill, reset the demo data.
document.addEventListener('click', (event) => {
  const button = event.target.closest('[data-action]');
  if (!button) return;
  const action = button.dataset.action;
  if (action === 'delete-tx') {
    if (deleteTransaction(button.dataset.id)) route();
  } else if (action === 'toggle-bill') {
    if (toggleBill(button.dataset.id)) route();
  } else if (action === 'reset-demo') {
    resetDemo();
    route();
  }
});

// Forms and filters, handled by delegation so re-rendering never loses them.
document.addEventListener('submit', (event) => {
  event.preventDefault();
  const form = event.target;
  if (form.id === 'add-tx-form') {
    const type = document.getElementById('tx-type').value;
    addTransaction({
      date: document.getElementById('tx-date').value || '2026-11-27',
      description: document.getElementById('tx-desc').value,
      category: type === 'income' ? 'Income' : document.getElementById('tx-cat').value,
      amount: document.getElementById('tx-amount').value,
      type,
    });
    route();
    return;
  }
  const limitForm = form.dataset.limitForm;
  if (limitForm) {
    const input = form.querySelector('input[type="number"]');
    if (input && input.value !== '') setLimit(limitForm, input.value);
    route();
    return;
  }
  const goalForm = form.dataset.goalForm;
  if (goalForm) {
    const input = form.querySelector('input[type="number"]');
    if (input && Number(input.value) > 0) addToGoal(goalForm, input.value);
    route();
  }
});

document.addEventListener('input', (event) => {
  const el = event.target;
  if (el.id === 'f-q') {
    txFilter.q = el.value;
    const pos = el.selectionStart;
    route();
    const again = document.getElementById('f-q');
    if (again) {
      again.focus();
      again.setSelectionRange(pos, pos);
    }
  } else if (el.id === 'rep-month') {
    reportMonth = el.value;
    route();
  }
});

document.addEventListener('change', (event) => {
  const el = event.target;
  if (el.id === 'f-cat') {
    txFilter.cat = el.value;
    route();
  } else if (el.id === 'f-sort') {
    txFilter.sort = el.value;
    route();
  } else if (el.id === 'rep-month') {
    reportMonth = el.value;
    route();
  }
});

window.addEventListener('hashchange', route);
save();
route();
