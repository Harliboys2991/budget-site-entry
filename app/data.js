// Willow House Budget — seed data for November 2026.
// Every figure is the household's own: two salaries, one freelance job,
// and the month's real spending. Totals are never typed in by hand —
// store.js adds the transactions up, so the dashboard always agrees
// with the Transactions page.

export const HOUSEHOLD = {
  name: 'The Willow household',
  members: 'Maya & Tom Willow, and Leo (9)',
  month: 'November 2026',
  monthKey: '2026-11',
  currency: 'USD',
};

export const CATEGORIES = [
  { name: 'Housing', color: '#1e4d3b' },
  { name: 'Groceries', color: '#2f6f8f' },
  { name: 'Transport', color: '#c98a2b' },
  { name: 'Utilities', color: '#6b7fa3' },
  { name: 'Dining Out', color: '#a8543c' },
  { name: 'Entertainment', color: '#7a5ea3' },
  { name: 'Health', color: '#3d8a6d' },
  { name: 'Household', color: '#8a6d3b' },
  { name: 'Clothing', color: '#4a6b8a' },
  { name: 'Savings', color: '#1e4d3b' },
];

// Monthly budget limits per category. "Spent" is computed from transactions.
export const BUDGET_LIMITS = {
  Housing: 1700,
  Groceries: 720,
  Transport: 340,
  Utilities: 320,
  'Dining Out': 220,
  Entertainment: 160,
  Health: 200,
  Household: 120,
  Clothing: 150,
  Savings: 600,
};

export const SEED_TRANSACTIONS = [
  { id: 't01', date: '2026-11-01', description: 'Salary — Maya (school office)', category: 'Income', amount: 3150, type: 'income' },
  { id: 't02', date: '2026-11-01', description: 'Salary — Tom (warehouse lead)', category: 'Income', amount: 2400, type: 'income' },
  { id: 't03', date: '2026-11-01', description: 'Rent — Willow Lane apartment', category: 'Housing', amount: 1650, type: 'expense' },
  { id: 't04', date: '2026-11-02', description: 'GreenMart — weekly shop', category: 'Groceries', amount: 128.4, type: 'expense' },
  { id: 't05', date: '2026-11-03', description: 'City Power — electricity', category: 'Utilities', amount: 96.2, type: 'expense' },
  { id: 't06', date: '2026-11-03', description: 'Shell — petrol', category: 'Transport', amount: 42, type: 'expense' },
  { id: 't07', date: '2026-11-04', description: 'Corner Cafe — lunch', category: 'Dining Out', amount: 18.5, type: 'expense' },
  { id: 't08', date: '2026-11-05', description: 'Pharmacy — cold medicine', category: 'Health', amount: 34.75, type: 'expense' },
  { id: 't09', date: '2026-11-06', description: 'GreenMart — weekly shop', category: 'Groceries', amount: 86.3, type: 'expense' },
  { id: 't10', date: '2026-11-07', description: 'NorthNet — internet', category: 'Utilities', amount: 79, type: 'expense' },
  { id: 't11', date: '2026-11-07', description: 'Riverside Cinema — movie night', category: 'Entertainment', amount: 32, type: 'expense' },
  { id: 't12', date: '2026-11-08', description: 'City bus — monthly pass', category: 'Transport', amount: 55, type: 'expense' },
  { id: 't13', date: '2026-11-09', description: 'Luigi’s — takeaway pizza', category: 'Dining Out', amount: 27.9, type: 'expense' },
  { id: 't14', date: '2026-11-10', description: 'City Water — water bill', category: 'Utilities', amount: 48.6, type: 'expense' },
  { id: 't15', date: '2026-11-11', description: 'Farmers market — vegetables', category: 'Groceries', amount: 54.2, type: 'expense' },
  { id: 't16', date: '2026-11-12', description: 'FitHouse gym — membership', category: 'Health', amount: 45, type: 'expense' },
  { id: 't17', date: '2026-11-13', description: 'GreenMart — weekly shop', category: 'Groceries', amount: 142.75, type: 'expense' },
  { id: 't18', date: '2026-11-14', description: 'SafeDrive — car insurance', category: 'Transport', amount: 112, type: 'expense' },
  { id: 't19', date: '2026-11-15', description: 'Freelance — Tom, weekend shifts', category: 'Income', amount: 300, type: 'income' },
  { id: 't20', date: '2026-11-15', description: 'The Copper Pot — dinner out', category: 'Dining Out', amount: 64.5, type: 'expense' },
  { id: 't21', date: '2026-11-16', description: 'FixIt Hardware — tap washer', category: 'Household', amount: 38.9, type: 'expense' },
  { id: 't22', date: '2026-11-17', description: 'StreamBox — monthly plan', category: 'Entertainment', amount: 15.99, type: 'expense' },
  { id: 't23', date: '2026-11-18', description: 'GreenMart — weekly shop', category: 'Groceries', amount: 97.6, type: 'expense' },
  { id: 't24', date: '2026-11-19', description: 'Dental check — Leo', category: 'Health', amount: 85, type: 'expense' },
  { id: 't25', date: '2026-11-20', description: 'Shell — petrol', category: 'Transport', amount: 38.5, type: 'expense' },
  { id: 't26', date: '2026-11-21', description: 'Bakery — bread and rolls', category: 'Groceries', amount: 22.4, type: 'expense' },
  { id: 't27', date: '2026-11-22', description: 'CallPlus — mobile bill', category: 'Utilities', amount: 62, type: 'expense' },
  { id: 't28', date: '2026-11-22', description: 'Arena — concert tickets', category: 'Entertainment', amount: 78, type: 'expense' },
  { id: 't29', date: '2026-11-23', description: 'GreenMart — weekly shop', category: 'Groceries', amount: 118.45, type: 'expense' },
  { id: 't30', date: '2026-11-24', description: 'Noodle House — lunch', category: 'Dining Out', amount: 21.75, type: 'expense' },
  { id: 't31', date: '2026-11-25', description: 'Transfer to savings account', category: 'Savings', amount: 600, type: 'expense' },
  { id: 't32', date: '2026-11-26', description: 'Old Navy — winter jacket for Leo', category: 'Clothing', amount: 89.99, type: 'expense' },
  { id: 't33', date: '2026-11-26', description: 'GreenMart — top-up shop', category: 'Groceries', amount: 41.6, type: 'expense' },
];

// Bills and subscriptions due in November 2026. Paid ones match a
// transaction above; unpaid ones are still to come.
export const SEED_BILLS = [
  { id: 'b01', name: 'Rent — Willow Lane apartment', due: '2026-11-01', amount: 1650, paid: true },
  { id: 'b02', name: 'City Power — electricity', due: '2026-11-05', amount: 96.2, paid: true },
  { id: 'b03', name: 'NorthNet — internet', due: '2026-11-07', amount: 79, paid: true },
  { id: 'b04', name: 'City Water — water bill', due: '2026-11-10', amount: 48.6, paid: true },
  { id: 'b05', name: 'FitHouse gym — membership', due: '2026-11-12', amount: 45, paid: true },
  { id: 'b06', name: 'SafeDrive — car insurance', due: '2026-11-14', amount: 112, paid: true },
  { id: 'b07', name: 'StreamBox — monthly plan', due: '2026-11-17', amount: 15.99, paid: true },
  { id: 'b08', name: 'CallPlus — mobile bill', due: '2026-11-22', amount: 62, paid: true },
  { id: 'b09', name: 'MusicWave — family plan', due: '2026-11-25', amount: 11.99, paid: true },
  { id: 'b10', name: 'CloudDrive — 200 GB storage', due: '2026-11-27', amount: 9.99, paid: false },
  { id: 'b11', name: 'GreenBin — recycling collection', due: '2026-11-28', amount: 28, paid: false },
  { id: 'b12', name: 'HomeShield — home insurance', due: '2026-11-30', amount: 96, paid: false },
];

export const SEED_GOALS = [
  { id: 'g1', name: 'Emergency fund', note: 'Three months of essentials, kept separate', target: 10000, saved: 6250 },
  { id: 'g2', name: 'Family holiday — the coast', note: 'A week by the sea next summer', target: 2400, saved: 1480 },
  { id: 'g3', name: 'New fridge', note: 'The old one hums louder every month', target: 900, saved: 620 },
  { id: 'g4', name: 'Bike for Leo', note: 'A red one, with a basket', target: 350, saved: 210 },
];

// Six months of history for the Reports page. Income and spending are
// the household's own recorded months; November matches this month's data.
export const MONTHLY_HISTORY = [
  { key: '2026-06', label: 'Jun 2026', income: 5780, spent: 4210 },
  { key: '2026-07', label: 'Jul 2026', income: 5850, spent: 4480 },
  { key: '2026-08', label: 'Aug 2026', income: 5790, spent: 5120 },
  { key: '2026-09', label: 'Sep 2026', income: 5850, spent: 4290 },
  { key: '2026-10', label: 'Oct 2026', income: 5920, spent: 4375 },
  { key: '2026-11', label: 'Nov 2026', income: 5850, spent: 4027.28 },
];
