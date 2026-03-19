/* ─────────────────────────────────────────────────────────────
   finops.js  –  FinOPs Dashboard · MAPFRE ZEUS
   ───────────────────────────────────────────────────────────── */

/* ── Color tokens (mapped to B2B CSS variables) ─────────────────────────────────────────── */
// --b2b-brand-blue-01: #2d373d  →  Z.brand1  titles, dark text
// --b2b-brand-blue-02: #526570  →  Z.brand2  secondary text, borders, icons
// --b2b-brand-blue-03: #9cb0bc  →  Z.brand4  percentage values
// --b2b-brand-blue-05: #d8dfe4  →  Z.brand5  borders, dividers
// --b2b-brand-blue-06: #e8ebed  →  Z.brand6  light backgrounds
// --b2b-state-info-01: #0d82bd  →  C.c4  blue accent (managed, services, compute)
// --b2b-state-success-01: #008c47  →  C.c5  green (executed, positive deltas, networking)
// --b2b-state-error-01: #da2a2a  →  C.c8  red (pending, errors, negative deltas, forecast, other)
// --b2b-state-alert-01: #e46b15  →  C.c3  orange (services, alerts, potential)
// --b2b-support-05-turquoise: #0ca6b3  →  C.c1  teal (Mongo Atlas)
// --b2b-support-08-purple: #a51783  →  C.cloud  purple (Cloud brand)
// --b2b-customer-gold: #ac9316  →  C.saas  gold (SaaS brand, DevOps Azure)
// --b2b-customer-platinum: #7994a4  →  C.dc  platinum (Datacenter brand, AI)
const C = {
  c1: '#0CA6B3',  // teal (Mongo)
  c3: '#E46B15',  // orange (alert/potential)
  c4: '#0D82BD',  // blue (info/managed/compute/historical)
  c5: '#008C47',  // green (success/executed/networking)
  c8: '#DA2A2A',  // red (error/pending/forecast/other)
  white: '#FFFFFF',  // white (borders, backgrounds, tooltips)
  cloud: '#A51783',  // purple (Cloud product)
  dc: '#7994A4',  // platinum (Datacenter product)
  saas: '#AC9316',  // gold (SaaS product)
};
const Z = {
  brand1: '#2D373D',  // blue-01 (dark text, titles)
  brand2: '#526570',  // blue-02 (secondary text)
  brand4: '#9CB0BC',  // blue-03 (tertiary/percentages)
  brand5: '#D8DFE4',  // blue-05 (borders)
  brand6: '#E8EBED',  // blue-06 (light backgrounds)
};

function alpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ── Global Chart.js defaults ─────────────────────────────── */
Chart.defaults.font.family = "'DM Sans', system-ui, sans-serif";
Chart.defaults.font.size   = 12;
Chart.defaults.color       = Z.brand2;

const TOOLTIP_OPTS = {
  backgroundColor: '#fff',
  borderColor: Z.brand5,
  borderWidth: 1,
  titleColor: Z.brand1,
  bodyColor: Z.brand2,
  padding: 10,
  cornerRadius: 6,
  position: 'nearest',
  caretPadding: 8,
  caretSize: 6,
  displayColors: false,
  callbacks: {
    label: ctx => {
      const v = ctx.parsed.y ?? ctx.parsed.x ?? ctx.parsed;
      const num = typeof v === 'number' ? v : 0;
      return ` ${ctx.dataset.label ?? ctx.label ?? ''}: €${(num/1000).toFixed(0)}K`;
    }
  }
};

const BASE_SCALES = {
  x: { grid: { color: Z.brand6, drawBorder: false }, ticks: { color: Z.brand2 } },
  y: { grid: { color: Z.brand6, drawBorder: false }, ticks: { color: Z.brand2 } },
};

/* ── Toggle chart ↔ table ─────────────────────────────────── */
const _tableViews = {};

function fpToggle(id, btn) {
  const body = document.getElementById('body-' + id);
  if (!body) return;
  const toggleGroup = btn.closest('.panel-toggle');
  const btns = toggleGroup ? Array.from(toggleGroup.querySelectorAll('.panel-toggle__btn')) : [];
  const btnIndex = btns.indexOf(btn);
  const isTableBtn = btnIndex === 1; // second button is always "Tabla"

  // Update active state — always set to the clicked button
  btns.forEach(function (b) { b.classList.remove('active'); });
  btn.classList.add('active');

  // Sync table view state
  _tableViews[id] = isTableBtn;

  if (isTableBtn) {
    body.style.display = 'none';
    if (!document.getElementById('table-' + id)) {
      const placeholder = document.createElement('div');
      placeholder.id = 'table-' + id;
      placeholder.style.cssText = 'padding:16px;font-size:13px;color:var(--b2b-brand-blue-02);min-height:200px;display:flex;align-items:center;justify-content:center;';
      placeholder.innerHTML = '<em>Vista tabla no disponible en esta demo.</em>';
      body.parentNode.insertBefore(placeholder, body.nextSibling);
    }
  } else {
    const tbl = document.getElementById('table-' + id);
    if (tbl) tbl.remove();
    body.style.display = '';
  }
}

/* ── Data ─────────────────────────────────────────────────── */
const MONTHS = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic'];

const MONTHLY_CLOUD = [45,48,52,55,58,57,60,62,58,55,60,60];
const MONTHLY_DC    = [25,25,27,27,28,27,28,28,27,27,27,24];
const MONTHLY_SAAS  = [9, 10, 10, 11, 11, 11, 11, 11, 11, 11, 12, 12];

const RANKING_LABELS = [
  'MVID RPM','Seguros Generales','Vida & Pensiones',
  'IT Core','Digital Experience','Reaseguro','Analytics',
  'MAPFRE Internacional','Data Platform','Otros',
];
const RANKING_VALUES = [185,165,148,132,118,105,92,78,65,37];

/* helper – set canvas height before Chart.js mounts */
function setH(id, px) {
  const el = document.getElementById(id);
  if (el) { el.style.height = px + 'px'; el.height = px * (window.devicePixelRatio || 1); }
}

/* ── 1. Monthly Costs Stacked Bar ─────────────────── */
function initMonthly() {
  setH('chart-monthly', 360);
  const ctx = document.getElementById('chart-monthly');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: MONTHS,
      datasets: [
        { label: 'Cloud',       data: MONTHLY_CLOUD, backgroundColor: '#A51783', borderWidth: 2, borderColor: '#fff', borderSkipped: false, stack: 'stack' },
        { label: 'Datacenter',  data: MONTHLY_DC,    backgroundColor: '#7994A4', borderWidth: 2, borderColor: '#fff', borderSkipped: false, stack: 'stack' },
        { label: 'SaaS',        data: MONTHLY_SAAS,  backgroundColor: '#AC9316', borderWidth: 2, borderColor: '#fff', borderSkipped: false, stack: 'stack' },
      ],
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { boxWidth: 10, boxHeight: 10, borderRadius: 2, padding: 16, color: Z.brand2, font: { size: 12 } }
        },
        tooltip: TOOLTIP_OPTS,
      },
      scales: {
        x: { ...BASE_SCALES.x, stacked: true },
        y: { ...BASE_SCALES.y, stacked: true, ticks: { callback: v => `€${v}K` } },
      },
    },
  });
}

/* ── 2. Ranking Horizontal Bar ───────────────────── */
function initRanking() {
  setH('chart-ranking', 360);
  const ctx = document.getElementById('chart-ranking');
  if (!ctx) return;
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: RANKING_LABELS,
      datasets: [{
        label: 'Cost',
        data: RANKING_VALUES,
        backgroundColor: '#A51783',
      }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      plugins: {
        legend: { display: false },
        tooltip: { ...TOOLTIP_OPTS, callbacks: { label: ctx => ` €${ctx.parsed.x}K` } },
      },
      scales: {
        x: { ...BASE_SCALES.x, ticks: { callback: v => `€${v}K` } },
        y: { ...BASE_SCALES.y, ticks: { font: { size: 11 } } },
      },
    },
  });
}

/* ── 3 & 4. Cloud Tracker ────────────────────────────────── */

// Cloud Services data
const SERVICES = ['EC2 / VMs', 'RDS / SQL', 'Storage', 'AKS / EKS', 'Networking'];
const SERVICE_VALUES = [310, 100, 70, 60, 50];  // in K
const SERVICE_COLORS = '#0D82BD';  // single blue color

let trackerServicesChart = null;

function syncTrackerServicesHeight() {
  const trackerBody = document.getElementById('body-tracker');
  const servicesWrap = document.getElementById('tracker-services-chart');
  if (!servicesWrap) return;

  // Clear any previously set minHeight to avoid infinite growth on resize
  if (trackerBody) trackerBody.style.minHeight = '';

  // Use the fixed CSS height (200px) — no dynamic sync against optimizer
  // to avoid layout feedback loops on narrow viewports.
  setH('chart-tracker-services', 200);
  if (trackerServicesChart) trackerServicesChart.resize();
}

function initTrackerServices() {
  syncTrackerServicesHeight();
  const ctx = document.getElementById('chart-tracker-services');
  if (!ctx) return;
  
  if (trackerServicesChart) trackerServicesChart.destroy();

  trackerServicesChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: SERVICES,
      datasets: [{
        label: 'Cost',
        data: SERVICE_VALUES,
        backgroundColor: SERVICE_COLORS,
      }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      plugins: {
        legend: { display: false },
        tooltip: { ...TOOLTIP_OPTS, callbacks: { label: ctx => ` €${ctx.parsed.x}K` } },
      },
      scales: {
        x: { ...BASE_SCALES.x, ticks: { callback: v => `€${v}K` } },
        y: { ...BASE_SCALES.y, ticks: { font: { size: 11 } } },
      },
    },
  });
}

/* ── 5. Cloud Optimizer Doughnut ──────────────────── */
function initOptimizer() {
  setH('chart-optimizer', 180);
  const ctx = document.getElementById('chart-optimizer');
  if (!ctx) return;
  const cssVars = getComputedStyle(document.documentElement);
  const pendingColor = cssVars.getPropertyValue('--Customer-Platinium').trim() || '#7994A4';

  // Draw centre text plugin
  const plugin = {
    id: 'centreText',
    afterDatasetsDraw(chart) {
      const { ctx: c, chartArea: { width, height, left, top } } = chart;
      c.save();
      c.textAlign = 'center';
      c.textBaseline = 'middle';
      const cx = left + width / 2;
      const cy = top + height / 2;
      c.font = 'bold 16px "DM Sans", system-ui';
      c.fillStyle = Z.brand1;
      c.fillText('10.24%', cx, cy - 6);
      c.font = '10px "DM Sans", system-ui';
      c.fillStyle = Z.brand2;
      c.fillText('Savings Rate', cx, cy + 10);
      c.restore();
    }
  };

  new Chart(ctx, {
    type: 'doughnut',
    plugins: [plugin],
    data: {
      labels: ['Executed','Managed','Pending'],
      datasets: [{
        data: [30, 2, 68],
        backgroundColor: ['#008C47', '#0D82BD', pendingColor],
        borderWidth: 2,
        borderColor: '#fff',
        cutout: '68%',
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff', borderColor: Z.brand5, borderWidth: 1,
          titleColor: Z.brand1, bodyColor: Z.brand2, padding: 10, cornerRadius: 6,
          position: 'average',
          yAlign: 'top',
          caretPadding: 12,
          caretSize: 8,
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` }
        },
      },
    },
  });

  // Cloud Optimizer Matrix (stacked horizontal bars)
  const ctxMatrix = document.getElementById('chart-optimizer-matrix');
  if (!ctxMatrix) return;

  const ACTIONS = ['Wasted resources','Savings plans','IaaS Stop','Reservation','Rebiller','Migration','Rightsizing','BYOL'];
  
  new Chart(ctxMatrix, {
    type: 'bar',
    data: {
      labels: ACTIONS,
      datasets: [
        { label: 'Executed', data: [45,20,30,15,25,35,40,10], backgroundColor: '#008C47', borderWidth: 2, borderColor: '#fff', borderSkipped: ['left', 'top', 'bottom'], stack: 'opt' },
        { label: 'Managed',  data: [15,10,5,8,12,10,8,5],     backgroundColor: '#0D82BD', borderWidth: 2, borderColor: '#fff', borderSkipped: ['left', 'top', 'bottom'], stack: 'opt' },
        { label: 'Pending',  data: [40,70,65,77,63,55,52,85], backgroundColor: pendingColor, borderWidth: 2, borderColor: '#fff', borderSkipped: ['left', 'top', 'bottom'], stack: 'opt' },
      ],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff', borderColor: Z.brand5, borderWidth: 1,
          titleColor: Z.brand1, bodyColor: Z.brand2, padding: 10, cornerRadius: 6,
          callbacks: { label: ctx => ` ${ctx.dataset.label}: ${ctx.parsed.x}%` }
        },
      },
      scales: {
        x: { ...BASE_SCALES.x, stacked: true, max: 100, ticks: { callback: v => v+'%' } },
        y: { ...BASE_SCALES.y, stacked: true, ticks: { font: { size: 11 } } },
      },
    },
  });
}

/* ── 6. Datacenter Treemap ────────────────────────────────── */
function initDC() {
  setH('chart-dc', 230);
  const ctx = document.getElementById('chart-dc');
  if (!ctx) return;

  const DC_DATA = [
    { label: 'Infrastructure', value: 150, color: Z.brand1  },  // --b2b-brand-blue-01 #2D373D
    { label: 'Database',       value: 120, color: Z.brand2  },  // --b2b-brand-blue-02 #526570
    { label: 'Licences',       value: 50,  color: Z.brand4  },  // --b2b-brand-blue-03 #9CB0BC
    { label: 'Services',       value: 5,   color: Z.brand5  },  // --b2b-brand-blue-05 #D8DFE4
  ];
  const total = DC_DATA.reduce((s, d) => s + d.value, 0);

  new Chart(ctx, {
    type: 'treemap',
    data: {
      datasets: [{
        label: 'Datacenter',
        tree: DC_DATA.map(d => ({ ...d })),
        key: 'value',
        borderWidth: 2,
        borderColor: '#fff',
        spacing: 2,
        backgroundColor(ctx) {
          const item = ctx.raw?._data;
          if (!item) return Z.brand6;
          const found = DC_DATA.find(d => d.label === item.label);
          return found ? found.color : Z.brand6;
        },
        labels: {
          display: true,
          align: 'center',
          position: 'middle',
          color(ctx) {
            // tiles claros (blue-03, blue-05) → texto oscuro; tiles oscuros → blanco
            const item = ctx.raw?._data;
            const found = item ? DC_DATA.find(d => d.label === item.label) : null;
            const light = [Z.brand4, Z.brand5];
            return (found && light.includes(found.color)) ? Z.brand1 : '#fff';
          },
          font: [
            { size: 13, weight: '600' },
            { size: 11 },
          ],
          formatter(ctx) {
            const item = ctx.raw?._data;
            if (!item) return '';
            const pct = Math.round((item.value / total) * 100);
            // Solo mostrar texto si el tile es suficientemente grande
            const w = ctx.raw.w ?? 0;
            const h = ctx.raw.h ?? 0;
            if (w < 60 || h < 36) return '';
            if (w < 100 || h < 50) return item.label;
            return [item.label, `€${item.value}K · ${pct}%`];
          },
        },
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff',
          borderColor: Z.brand5,
          borderWidth: 1,
          titleColor: Z.brand1,
          bodyColor: Z.brand2,
          padding: 10,
          cornerRadius: 6,
          callbacks: {
            title(items) {
              return items[0]?.raw?._data?.label ?? '';
            },
            label(ctx) {
              const item = ctx.raw?._data;
              if (!item) return '';
              const pct = Math.round((item.value / total) * 100);
              return ` €${item.value}K — ${pct}% del total`;
            },
          },
        },
      },
    },
  });
}

/* ── 7. SAAS Doughnut ─────────────────────────────────────── */
function initSaas() {
  setH('chart-saas', 180);
  const ctx = document.getElementById('chart-saas');
  if (!ctx) return;

  const SAAS_MONGO = 75;
  const SAAS_DEVOPS = 55;
  const SAAS_TOTAL = SAAS_MONGO + SAAS_DEVOPS;
  const SAAS_MONGO_PCT = Math.round((SAAS_MONGO / SAAS_TOTAL) * 100);
  const COLOR_MONGO = '#E46B15';
  const COLOR_DEVOPS = '#AC9316';

  const plugin = {
    id: 'saasCentre',
    afterDatasetsDraw(chart) {
      const { ctx: c, chartArea: { width, height, left, top } } = chart;
      c.save();
      c.textAlign = 'center'; c.textBaseline = 'middle';
      const cx = left + width / 2, cy = top + height / 2;
      c.font = 'bold 18px "DM Sans", system-ui'; c.fillStyle = Z.brand1;
      c.fillText(`${SAAS_MONGO_PCT}%`, cx, cy - 7);
      c.font = '11px "DM Sans", system-ui'; c.fillStyle = Z.brand2;
      c.fillText('Mongo', cx, cy + 11);
      c.restore();
    }
  };

  new Chart(ctx, {
    type: 'doughnut',
    plugins: [plugin],
    data: {
      labels: ['Mongo','DevOps'],
      datasets: [{
        data: [SAAS_MONGO, SAAS_DEVOPS],
        backgroundColor: [COLOR_MONGO, COLOR_DEVOPS],
        borderWidth: 2,
        borderColor: '#fff',
        cutout: '68%',
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff', borderColor: Z.brand5, borderWidth: 1,
          titleColor: Z.brand1, bodyColor: Z.brand2, padding: 10, cornerRadius: 6,
          position: 'average',
          yAlign: 'top',
          caretPadding: 12,
          caretSize: 8,
          callbacks: {
            label: ctx => {
              const pct = Math.round((ctx.parsed / SAAS_TOTAL) * 100);
              return ` ${ctx.label}: €${ctx.parsed}K (${pct}%)`;
            },
          }
        },
      },
    },
  });

  setH('chart-saas-services', 150);
  const ctxServices = document.getElementById('chart-saas-services');
  if (!ctxServices) return;

  new Chart(ctxServices, {
    type: 'bar',
    data: {
      labels: ['Mongo Atlas', 'GitHub Licenses', 'GitHub Actions'],
      datasets: [{
        label: 'Cost',
        data: [75, 35, 20],
        backgroundColor: [COLOR_MONGO, COLOR_DEVOPS, COLOR_DEVOPS],
      }],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      interaction: { mode: 'nearest', intersect: true },
      plugins: {
        legend: { display: false },
        tooltip: { ...TOOLTIP_OPTS, callbacks: { label: item => ` €${item.parsed.x}K` } },
      },
      scales: {
        x: { ...BASE_SCALES.x, ticks: { callback: v => `€${v}K` } },
        y: { ...BASE_SCALES.y, ticks: { font: { size: 11 } } },
      },
    },
  });
}

/* ═══════════════════════════════════════════════════════════
   DOMAIN PAGE CHARTS
   ═══════════════════════════════════════════════════════════ */

/* ── D1. Total Costs & Forecasting Bar Chart ─────────────── */
function initDCosts() {
  const ctx = document.getElementById('chart-d-costs');
  if (!ctx) return;

  // Historical months (Jan 2025 – Dec 2025) + Forecast (Jan–Jul 2026)
  const labels = [
    'Jan 25','Feb 25','Mar 25','Apr 25','May 25','Jun 25',
    'Jul 25','Aug 25','Sep 25','Oct 25','Nov 25','Dec 25',
    'Jan 26','Feb 26','Mar 26','Apr 26','May 26','Jun 26','Jul 26',
  ];
  const historical = [1250,1220,1050,1010,1150,1080,1100,1150,1200,1200,1310,1850, null,null,null,null,null,null,null];
  const forecast   = [null,null,null,null,null,null,null,null,null,null,null,null, 1310,1340,1340,1200,1200,1190,640];

  const AVG = 1462.829;

  const avgPlugin = {
    id: 'avgLine',
    afterDatasetsDraw(chart) {
      const { ctx: c, scales: { x, y }, chartArea } = chart;
      const yPos = y.getPixelForValue(AVG);
      if (yPos < chartArea.top || yPos > chartArea.bottom) return;
      c.save();
      c.setLineDash([5, 4]);
      c.strokeStyle = Z.brand2;
      c.lineWidth = 1;
      c.beginPath();
      c.moveTo(chartArea.left, yPos);
      c.lineTo(chartArea.right, yPos);
      c.stroke();
      c.setLineDash([]);
      c.font = '11px "DM Sans", system-ui';
      c.fillStyle = Z.brand2;
      c.textAlign = 'left';
      c.fillText(`Avg. ${AVG.toLocaleString('es-ES', {minimumFractionDigits:3})}`, chartArea.left + 4, yPos - 5);
      c.restore();
    }
  };

  setH('chart-d-costs', 320);
  new Chart(ctx, {
    type: 'bar',
    plugins: [avgPlugin],
    data: {
      labels,
      datasets: [
        {
          label: 'Historical',
          data: historical,
          backgroundColor: C.c4,    // blue
          borderWidth: 0,
          order: 1,
        },
        {
          label: 'Forecast',
          data: forecast,
          backgroundColor: C.c8,    // red
          borderWidth: 0,
          order: 2,
        },
      ],
    },
    options: {
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { boxWidth: 10, boxHeight: 10, borderRadius: 2, padding: 16, color: Z.brand2, font: { size: 12 } },
        },
        tooltip: {
          ...TOOLTIP_OPTS,
          callbacks: {
            label: ctx => {
              if (ctx.parsed.y === null) return null;
              return ` ${ctx.dataset.label}: $${(ctx.parsed.y / 1000).toFixed(2)}M`;
            },
          },
        },
      },
      scales: {
        x: { ...BASE_SCALES.x, ticks: { color: Z.brand2, maxRotation: 45, font: { size: 10 } } },
        y: {
          ...BASE_SCALES.y,
          ticks: { callback: v => `${(v/1000).toFixed(1)}M`, color: Z.brand2 },
        },
      },
    },
  });
}

/* ── D2. Consumption Ranking Doughnut ─────────────────────── */
function initDRanking() {
  const ctx = document.getElementById('chart-d-ranking');
  if (!ctx) return;

  const CATEGORIES = ['Other','Compute','Networking','Storage','AI'];
  const VALUES      = [63, 16, 10, 6, 2];   // %
  const COLORS      = [C.c8, C.c4, C.c5, C.c2, Z.brand4];  // red, blue, green, purple, grey
  const TOTAL_LABEL = '2.27M';

  const centrePlugin = {
    id: 'dRankingCentre',
    afterDatasetsDraw(chart) {
      const { ctx: c, chartArea: { width, height, left, top } } = chart;
      const cx = left + width / 2, cy = top + height / 2;
      c.save();
      c.textAlign = 'center'; c.textBaseline = 'middle';
      c.font = 'bold 22px "DM Sans", system-ui';
      c.fillStyle = Z.brand1;
      c.fillText(TOTAL_LABEL, cx, cy);
      c.restore();
    }
  };

  setH('chart-d-ranking', 260);
  new Chart(ctx, {
    type: 'doughnut',
    plugins: [centrePlugin],
    data: {
      labels: CATEGORIES,
      datasets: [{
        data: VALUES,
        backgroundColor: COLORS,
        borderWidth: 2,
        borderColor: '#fff',
        cutout: '65%',
      }],
    },
    options: {
      maintainAspectRatio: false,
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: '#fff', borderColor: Z.brand5, borderWidth: 1,
          titleColor: Z.brand1, bodyColor: Z.brand2, padding: 10, cornerRadius: 6,
          callbacks: { label: ctx => ` ${ctx.label}: ${ctx.parsed}%` },
        },
      },
    },
  });

  // Build custom HTML legend
  const legendEl = document.getElementById('d-ranking-legend');
  if (!legendEl) return;
  legendEl.innerHTML = CATEGORIES.map((cat, i) => `
    <div class="d-ranking-legend__item">
      <span class="d-ranking-legend__swatch" style="background:${COLORS[i]}"></span>
      <span class="d-ranking-legend__name">${cat}</span>
      <span class="d-ranking-legend__pct">${VALUES[i]}%</span>
    </div>
  `).join('');
}

/* ── D4. Savings Distribution Horizontal Bar ──────────────── */
function initDSavings() {
  const ctx = document.getElementById('chart-d-savings');
  if (!ctx) return;

  const ACTIONS = ['Wasted Resources','Savings Plans','Rebiller','Migration','Reservation','IaaS Stop','Rightsizing','BYOL'];
  // Two segments: executed (green) + potential (orange). Values are % of total
  const EXECUTED  = [10.6, 6.25, 0,    0,    0,    0.55, 0,   0   ];
  const POTENTIAL = [1.08, 6.4,  1.48, 2.02, 1.11, 1.16, 1.2, 0.08];

  setH('chart-d-savings', 260);
  new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ACTIONS,
      datasets: [
        {
          label: 'Executed',
          data: EXECUTED,
          backgroundColor: C.c5,
          borderWidth: 2,
          borderColor: '#fff',
          borderSkipped: false,
          stack: 'savings',
        },
        {
          label: 'Potential',
          data: POTENTIAL,
          backgroundColor: C.c3,
          borderWidth: 2,
          borderColor: '#fff',
          borderSkipped: false,
          stack: 'savings',
        },
      ],
    },
    options: {
      indexAxis: 'y',
      maintainAspectRatio: false,
      interaction: { mode: 'index', intersect: false },
      plugins: {
        legend: {
          display: true,
          position: 'bottom',
          labels: { boxWidth: 10, boxHeight: 10, borderRadius: 2, padding: 16, color: Z.brand2, font: { size: 12 } },
        },
        tooltip: {
          backgroundColor: '#fff', borderColor: Z.brand5, borderWidth: 1,
          titleColor: Z.brand1, bodyColor: Z.brand2, padding: 10, cornerRadius: 6,
          callbacks: { label: ctx => ctx.parsed.x > 0 ? ` ${ctx.dataset.label}: ${ctx.parsed.x}%` : null },
        },
      },
      scales: {
        x: { ...BASE_SCALES.x, stacked: true, ticks: { callback: v => v + '%', color: Z.brand2 } },
        y: { ...BASE_SCALES.y, stacked: true, ticks: { font: { size: 11 }, color: Z.brand2 } },
      },
    },
  });
}

/* ── Bootstrap ────────────────────────────────────────────── */
document.addEventListener('DOMContentLoaded', () => {
  initMonthly();
  initRanking();

  initOptimizer();
  initTrackerServices();
  initDC();
  initSaas();

  // Domain page charts
  initDCosts();
  initDRanking();
  initDSavings();

  requestAnimationFrame(syncTrackerServicesHeight);
  window.addEventListener('resize', syncTrackerServicesHeight);
});
