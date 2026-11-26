// Willow House Budget — small canvas charts, drawn with no library.
// Bars are drawn from the numbers passed in, with value labels on top.

function setupCanvas(canvas, height) {
  const dpr = window.devicePixelRatio || 1;
  const width = canvas.clientWidth || canvas.parentElement.clientWidth || 600;
  canvas.width = Math.round(width * dpr);
  canvas.height = Math.round(height * dpr);
  canvas.style.height = height + 'px';
  const ctx = canvas.getContext('2d');
  ctx.scale(dpr, dpr);
  return { ctx, width, height };
}

function niceMax(value) {
  if (value <= 0) return 100;
  const step = value > 5000 ? 1000 : value > 1000 ? 500 : value > 500 ? 100 : 50;
  return Math.ceil(value / step) * step;
}

// Grouped bars: one group per month, income in green, spending in amber.
export function drawMonthlyChart(canvas, months) {
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas, 220);
  const pad = { left: 52, right: 12, top: 26, bottom: 28 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...months.map((m) => Math.max(m.income, m.spent))));
  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  ctx.fillStyle = '#5f6f66';
  ctx.textAlign = 'right';
  for (let i = 0; i <= 4; i++) {
    const v = (max / 4) * i;
    const y = pad.top + plotH - (plotH * v) / max;
    ctx.strokeStyle = '#e8ede8';
    ctx.beginPath();
    ctx.moveTo(pad.left, y);
    ctx.lineTo(width - pad.right, y);
    ctx.stroke();
    ctx.fillText('$' + Math.round(v).toLocaleString('en-US'), pad.left - 8, y + 4);
  }
  const groupW = plotW / months.length;
  const barW = Math.min(26, groupW * 0.28);
  months.forEach((m, i) => {
    const cx = pad.left + groupW * i + groupW / 2;
    const incomeH = (plotH * m.income) / max;
    const spentH = (plotH * m.spent) / max;
    ctx.fillStyle = '#1e4d3b';
    ctx.fillRect(cx - barW - 3, pad.top + plotH - incomeH, barW, incomeH);
    ctx.fillStyle = '#c98a2b';
    ctx.fillRect(cx + 3, pad.top + plotH - spentH, barW, spentH);
    ctx.fillStyle = '#22302a';
    ctx.textAlign = 'center';
    ctx.fillText(m.label, cx, height - 8);
  });
  ctx.fillStyle = '#22302a';
  ctx.textAlign = 'left';
  ctx.font = '700 12px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  ctx.fillText('Income vs spending, Jun – Nov 2026', pad.left, 16);
}

// Single-series bars: one value per category, labelled with dollars.
export function drawCategoryChart(canvas, rows) {
  if (!canvas) return;
  const { ctx, width, height } = setupCanvas(canvas, 220);
  const pad = { left: 96, right: 64, top: 10, bottom: 10 };
  const plotW = width - pad.left - pad.right;
  const plotH = height - pad.top - pad.bottom;
  const max = niceMax(Math.max(...rows.map((r) => r.value), 1));
  const rowH = plotH / rows.length;
  ctx.clearRect(0, 0, width, height);
  ctx.font = '12px -apple-system, "Segoe UI", Roboto, Arial, sans-serif';
  rows.forEach((r, i) => {
    const y = pad.top + rowH * i + rowH * 0.18;
    const barH = rowH * 0.58;
    const w = (plotW * r.value) / max;
    ctx.fillStyle = '#22302a';
    ctx.textAlign = 'right';
    ctx.fillText(r.label, pad.left - 8, y + barH / 2 + 4);
    ctx.fillStyle = r.color || '#1e4d3b';
    ctx.fillRect(pad.left, y, Math.max(w, 2), barH);
    ctx.fillStyle = '#22302a';
    ctx.textAlign = 'left';
    ctx.fillText('$' + Math.round(r.value).toLocaleString('en-US'), pad.left + w + 8, y + barH / 2 + 4);
  });
}
