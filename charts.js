/**
 * MAPFRE Design System — Chart.js Showcase
 * =========================================
 * Todos los colores se leen de las CSS custom properties definidas en charts.css.
 * El objeto ALIAS expone los tokens semánticos de gráficos para usarlos
 * también en el Laboratorio de código.
 *
 * REGLA DE COLOR:
 *   Gráficos → usar SIEMPRE $color-chart-* (paleta SUPPORT: blue, green, yellow).
 *   Rojo de marca ($color-brand-primary) → SOLO botones / CTAs / acciones.
 */

/* ─── LEER TOKENS DESDE CSS CUSTOM PROPERTIES ──────────────────────────── */
const css = (prop) => getComputedStyle(document.documentElement).getPropertyValue(prop).trim();

const ALIAS = {
  // Paleta de gráficos (10 colores — rosas + support colors)
  chart_c1:  css('--color-chart-1'),   // #349EA0 support-blue-05
  chart_c2:  css('--color-chart-2'),   // #FF4D96 pink-400
  chart_c3:  css('--color-chart-3'),   // #28A545 support-green-05
  chart_c4:  css('--color-chart-4'),   // #C8A22B support-yellow-05
  chart_c5:  css('--color-chart-5'),   // #1D6F70 support-blue-06
  chart_c6:  css('--color-chart-6'),   // #C83371 pink-500
  chart_c7:  css('--color-chart-7'),   // #15722B support-green-06
  chart_c8:  css('--color-chart-8'),   // #907215 support-yellow-06
  chart_c9:  css('--color-chart-9'),   // #901A4D pink-600
  chart_c10: css('--color-chart-10'),  // #063F3F support-blue-07

  // Semántico UI
  text:      css('--color-text-primary'),
  textSec:   css('--color-text-secondary'),
  bgPrimary: css('--color-bg-primary'),
  bgSec:     css('--color-bg-secondary'),
  border:    css('--color-border-subtle'),

  // Solo para botones/CTAs — NO usar en gráficos
  brand:     css('--color-brand-primary'),
};

/* Función utilitaria: añadir canal alfa a un hex */
function alpha(hex, a) {
  const r = parseInt(hex.slice(1,3),16);
  const g = parseInt(hex.slice(3,5),16);
  const b = parseInt(hex.slice(5,7),16);
  return `rgba(${r},${g},${b},${a})`;
}

/* ─── DEFAULTS GLOBALES DE CHART.JS ────────────────────────────────────── */
Chart.defaults.font.family  = "'Segoe UI', Arial, sans-serif";
Chart.defaults.font.size    = 12;
Chart.defaults.color        = ALIAS.textSec;
Chart.defaults.borderColor  = ALIAS.border;

/* Opciones base reutilizables */
const BASE_OPTS = {
  responsive: true,
  maintainAspectRatio: false,
  plugins: {
    legend: {
      labels: {
        color: ALIAS.text,
        font: { size: 12 },
        boxWidth: 12,
        padding: 12,
      }
    },
    tooltip: {
      backgroundColor: ALIAS.bgPrimary,
      titleColor: ALIAS.text,
      bodyColor: ALIAS.textSec,
      borderColor: ALIAS.border,
      borderWidth: 1,
      padding: 10,
      cornerRadius: 6,
    }
  }
};

const MONTHS  = ['Enero','Febrero','Marzo','Abril','Mayo','Junio'];
const CATS    = ['Vida','Hogar','Auto','Salud','Viaje'];

/* ─── 1. BAR CHART ──────────────────────────────────────────────────────── */
const barCtx = document.getElementById('barChart');
const barChart = new Chart(barCtx, {
  type: 'bar',
  data: {
    labels: MONTHS,
    datasets: [{
      label: 'Pólizas nuevas',
      data: [65, 72, 80, 74, 88, 95],
      backgroundColor: alpha(ALIAS.chart_c1, 0.85),
      borderColor:     ALIAS.chart_c1,
      borderWidth: 1,
      borderRadius: 4,
    }]
  },
  options: {
    ...BASE_OPTS,
    plugins: { ...BASE_OPTS.plugins, legend: { ...BASE_OPTS.plugins.legend, position: 'top' } },
    scales: {
      x: { grid: { color: alpha(ALIAS.border, 0.5) }, ticks: { color: ALIAS.textSec } },
      y: { grid: { color: alpha(ALIAS.border, 0.5) }, ticks: { color: ALIAS.textSec }, beginAtZero: true },
    }
  }
});

/* BAR: modos */
const barDatasets = {
  basic: [{
    label: 'Pólizas nuevas',
    data: [65,72,80,74,88,95],
    backgroundColor: alpha(ALIAS.chart_c1, 0.85),
    borderColor: ALIAS.chart_c1, borderWidth:1, borderRadius:4,
  }],
  multi: [
    { label:'Vida',  data:[55,60,75,65,80,90], backgroundColor:alpha(ALIAS.chart_c1,0.85), borderColor:ALIAS.chart_c1, borderWidth:1, borderRadius:4 },
    { label:'Hogar', data:[30,40,35,50,45,55], backgroundColor:alpha(ALIAS.chart_c2,0.85), borderColor:ALIAS.chart_c2, borderWidth:1, borderRadius:4 },
    { label:'Auto',  data:[20,25,30,22,35,40], backgroundColor:alpha(ALIAS.chart_c3,0.85), borderColor:ALIAS.chart_c3, borderWidth:1, borderRadius:4 },
  ],
  stacked: [
    { label:'Vida',  data:[55,60,75,65,80,90], backgroundColor:alpha(ALIAS.chart_c1,0.85), borderColor:ALIAS.chart_c1, borderWidth:1 },
    { label:'Hogar', data:[30,40,35,50,45,55], backgroundColor:alpha(ALIAS.chart_c2,0.85), borderColor:ALIAS.chart_c2, borderWidth:1 },
    { label:'Auto',  data:[20,25,30,22,35,40], backgroundColor:alpha(ALIAS.chart_c3,0.85), borderColor:ALIAS.chart_c3, borderWidth:1 },
  ],
};

document.querySelectorAll('[data-chart="bar"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    document.querySelectorAll('[data-chart="bar"]').forEach(b => b.classList.remove('btn--active'));
    btn.classList.add('btn--active');
    document.querySelectorAll('[data-chart="bar"]').forEach(b => {
      b.classList.remove('btn--primary');
      b.classList.add('btn--ghost');
    });
    btn.classList.remove('btn--ghost');
    btn.classList.add('btn--primary');

    barChart.data.datasets = barDatasets[mode];
    barChart.options.scales.x.stacked = mode === 'stacked';
    barChart.options.scales.y.stacked = mode === 'stacked';
    barChart.update();
  });
});

/* ─── 2. LINE CHART ─────────────────────────────────────────────────────── */
const lineCtx = document.getElementById('lineChart');
const lineChart = new Chart(lineCtx, {
  type: 'line',
  data: {
    labels: MONTHS,
    datasets: [{
      label: 'Siniestros',
      data: [30,45,35,55,40,60],
      borderColor:     ALIAS.chart_c1,
      backgroundColor: alpha(ALIAS.chart_c1, 0.1),
      pointBackgroundColor: ALIAS.chart_c1,
      pointRadius: 4,
      tension: 0.4,
      fill: false,
    }]
  },
  options: {
    ...BASE_OPTS,
    plugins: { ...BASE_OPTS.plugins, legend: { ...BASE_OPTS.plugins.legend, position: 'top' } },
    scales: {
      x: { grid: { color: alpha(ALIAS.border, 0.5) }, ticks: { color: ALIAS.textSec } },
      y: { grid: { color: alpha(ALIAS.border, 0.5) }, ticks: { color: ALIAS.textSec }, beginAtZero: true },
    }
  }
});

const lineDatasets = {
  basic: [{
    label: 'Siniestros',
    data: [30,45,35,55,40,60],
    borderColor: ALIAS.chart_c1, backgroundColor: alpha(ALIAS.chart_c1,0.1),
    pointBackgroundColor: ALIAS.chart_c1, pointRadius:4, tension:0.4, fill:false,
  }],
  multiline: [
    { label:'Vida',  data:[30,45,35,55,40,60], borderColor:ALIAS.chart_c1, backgroundColor:alpha(ALIAS.chart_c1,0.1), pointBackgroundColor:ALIAS.chart_c1, pointRadius:4, tension:0.4, fill:false },
    { label:'Hogar', data:[20,30,25,40,35,50], borderColor:ALIAS.chart_c2, backgroundColor:alpha(ALIAS.chart_c2,0.1), pointBackgroundColor:ALIAS.chart_c2, pointRadius:4, tension:0.4, fill:false },
    { label:'Auto',  data:[15,22,18,30,28,42], borderColor:ALIAS.chart_c3, backgroundColor:alpha(ALIAS.chart_c3,0.1), pointBackgroundColor:ALIAS.chart_c3, pointRadius:4, tension:0.4, fill:false },
  ],
  area: [
    { label:'Vida',  data:[30,45,35,55,40,60], borderColor:ALIAS.chart_c1, backgroundColor:alpha(ALIAS.chart_c1,0.3), pointBackgroundColor:ALIAS.chart_c1, pointRadius:3, tension:0.4, fill:true },
    { label:'Hogar', data:[20,30,25,40,35,50], borderColor:ALIAS.chart_c2, backgroundColor:alpha(ALIAS.chart_c2,0.3), pointBackgroundColor:ALIAS.chart_c2, pointRadius:3, tension:0.4, fill:true },
  ],
};

document.querySelectorAll('[data-chart="line"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    document.querySelectorAll('[data-chart="line"]').forEach(b => {
      b.classList.remove('btn--active','btn--primary');
      b.classList.add('btn--ghost');
    });
    btn.classList.remove('btn--ghost');
    btn.classList.add('btn--primary','btn--active');
    lineChart.data.datasets = lineDatasets[mode];
    lineChart.update();
  });
});

/* ─── 3. PIE CHART ──────────────────────────────────────────────────────── */
const pieCtx = document.getElementById('pieChart');
const pieChart = new Chart(pieCtx, {
  type: 'pie',
  data: {
    labels: CATS,
    datasets: [{
      data: [35,25,20,12,8],
      backgroundColor: [
        ALIAS.chart_c1, ALIAS.chart_c2, ALIAS.chart_c3,
        ALIAS.chart_c4, ALIAS.chart_c5,
      ],
      borderColor: ALIAS.bgPrimary,
      borderWidth: 4,
      hoverOffset: 8,
    }]
  },
  options: {
    ...BASE_OPTS,
    plugins: {
      ...BASE_OPTS.plugins,
      legend: { ...BASE_OPTS.plugins.legend, position: 'right' }
    }
  }
});

document.querySelectorAll('[data-chart="pie"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const pos = btn.dataset.mode === 'right' ? 'right' : 'bottom';
    document.querySelectorAll('[data-chart="pie"]').forEach(b => {
      b.classList.remove('btn--active','btn--primary');
      b.classList.add('btn--ghost');
    });
    btn.classList.remove('btn--ghost');
    btn.classList.add('btn--primary','btn--active');
    pieChart.options.plugins.legend.position = pos;
    pieChart.update();
  });
});

/* ─── 4. DOUGHNUT CHART ─────────────────────────────────────────────────── */
const doughnutCtx = document.getElementById('doughnutChart');
const doughnutData = {
  seguros:    { labels:['Vida','Hogar','Auto','Salud'],    data:[40,25,20,15] },
  inversiones:{ labels:['Renta Fija','Renta Var.','Mixto','Liquidez'], data:[35,30,25,10] },
};

const doughnutChart = new Chart(doughnutCtx, {
  type: 'doughnut',
  data: {
    labels: doughnutData.seguros.labels,
    datasets: [{
      data: doughnutData.seguros.data,
      backgroundColor: [ALIAS.chart_c1, ALIAS.chart_c2, ALIAS.chart_c3, ALIAS.chart_c4],
      borderColor: ALIAS.bgPrimary,
      borderWidth: 4,
      hoverOffset: 8,
    }]
  },
  options: {
    ...BASE_OPTS,
    cutout: '62%',
    plugins: {
      ...BASE_OPTS.plugins,
      legend: { ...BASE_OPTS.plugins.legend, position: 'right' }
    }
  }
});

document.getElementById('doughnutSelect').addEventListener('change', (e) => {
  const key = e.target.value;
  doughnutChart.data.labels = doughnutData[key].labels;
  doughnutChart.data.datasets[0].data = doughnutData[key].data;
  doughnutChart.update();
});

/* ─── 5. RADAR CHART ────────────────────────────────────────────────────── */
const radarCtx = document.getElementById('radarChart');
const radarChart = new Chart(radarCtx, {
  type: 'radar',
  data: {
    labels: ['Cobertura','Calidad','Precio','Servicio','Digital'],
    datasets: [{
      label: 'Mapfre',
      data: [85,78,70,90,80],
      borderColor:     ALIAS.chart_c1,
      backgroundColor: alpha(ALIAS.chart_c1, 0.2),
      pointBackgroundColor: ALIAS.chart_c1,
      pointRadius: 4,
    }]
  },
  options: {
    ...BASE_OPTS,
    plugins: { ...BASE_OPTS.plugins, legend: { ...BASE_OPTS.plugins.legend, position: 'top' } },
    scales: {
      r: {
        angleLines: { color: alpha(ALIAS.border, 0.8) },
        grid:       { color: alpha(ALIAS.border, 0.8) },
        pointLabels: { color: ALIAS.textSec, font: { size: 11 } },
        ticks:       { color: ALIAS.textSec, backdropColor: 'transparent', stepSize: 20 },
        suggestedMin: 0,
        suggestedMax: 100,
      }
    }
  }
});

const radarDatasets = {
  simple: [{
    label: 'Mapfre',
    data: [85,78,70,90,80],
    borderColor: ALIAS.chart_c1, backgroundColor: alpha(ALIAS.chart_c1,0.2),
    pointBackgroundColor: ALIAS.chart_c1, pointRadius:4,
  }],
  comparative: [
    { label:'Mapfre',    data:[85,78,70,90,80], borderColor:ALIAS.chart_c1, backgroundColor:alpha(ALIAS.chart_c1,0.2), pointBackgroundColor:ALIAS.chart_c1, pointRadius:4 },
    { label:'Sector',   data:[70,65,80,75,60], borderColor:ALIAS.chart_c2, backgroundColor:alpha(ALIAS.chart_c2,0.15), pointBackgroundColor:ALIAS.chart_c2, pointRadius:4 },
  ],
};

document.querySelectorAll('[data-chart="radar"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    document.querySelectorAll('[data-chart="radar"]').forEach(b => {
      b.classList.remove('btn--active','btn--primary');
      b.classList.add('btn--ghost');
    });
    btn.classList.remove('btn--ghost');
    btn.classList.add('btn--primary','btn--active');
    radarChart.data.datasets = radarDatasets[mode];
    radarChart.update();
  });
});

/* ─── 6. SCATTER CHART ──────────────────────────────────────────────────── */
const scatterCtx = document.getElementById('scatterChart');

function genScatter(n, cx, cy, spread) {
  return Array.from({length:n}, () => ({
    x: +(cx + (Math.random()-0.5)*spread).toFixed(1),
    y: +(cy + (Math.random()-0.5)*spread).toFixed(1),
  }));
}

const scatterChart = new Chart(scatterCtx, {
  type: 'scatter',
  data: {
    datasets: [{
      label: 'Clientes',
      data: genScatter(20, 15, 25, 18),
      backgroundColor: alpha(ALIAS.chart_c1, 0.75),
      borderColor: ALIAS.chart_c1,
      pointRadius: 6,
    }]
  },
  options: {
    ...BASE_OPTS,
    plugins: { ...BASE_OPTS.plugins, legend: { ...BASE_OPTS.plugins.legend, position: 'top' } },
    scales: {
      x: { grid: { color: alpha(ALIAS.border, 0.5) }, ticks: { color: ALIAS.textSec } },
      y: { grid: { color: alpha(ALIAS.border, 0.5) }, ticks: { color: ALIAS.textSec } },
    }
  }
});

document.querySelectorAll('[data-chart="scatter"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    document.querySelectorAll('[data-chart="scatter"]').forEach(b => {
      b.classList.remove('btn--active','btn--primary');
      b.classList.add('btn--ghost');
    });
    btn.classList.remove('btn--ghost');
    btn.classList.add('btn--primary','btn--active');

    if (mode === 'basic') {
      scatterChart.data.datasets = [{
        label: 'Clientes',
        data: genScatter(20,15,25,18),
        backgroundColor: alpha(ALIAS.chart_c1,0.75), borderColor:ALIAS.chart_c1, pointRadius:6,
      }];
    } else {
      scatterChart.data.datasets = [
        { label:'Vida',  data:genScatter(15,10,30,14), backgroundColor:alpha(ALIAS.chart_c1,0.75), borderColor:ALIAS.chart_c1, pointRadius:6 },
        { label:'Auto',  data:genScatter(15,20,20,12), backgroundColor:alpha(ALIAS.chart_c2,0.75), borderColor:ALIAS.chart_c2, pointRadius:6 },
        { label:'Hogar', data:genScatter(12,14,14,10), backgroundColor:alpha(ALIAS.chart_c3,0.75), borderColor:ALIAS.chart_c3, pointRadius:6 },
      ];
    }
    scatterChart.update();
  });
});

/* ─── 7. AREA CHART ─────────────────────────────────────────────────────── */
const areaCtx = document.getElementById('areaChart');
const areaChart = new Chart(areaCtx, {
  type: 'line',
  data: {
    labels: MONTHS,
    datasets: [{
      label: 'Primas',
      data: [40,55,48,70,62,85],
      borderColor:     ALIAS.chart_c1,
      backgroundColor: alpha(ALIAS.chart_c1, 0.25),
      pointBackgroundColor: ALIAS.chart_c1,
      pointRadius: 4,
      tension: 0.4,
      fill: true,
    }]
  },
  options: {
    ...BASE_OPTS,
    plugins: { ...BASE_OPTS.plugins, legend: { ...BASE_OPTS.plugins.legend, position: 'top' } },
    scales: {
      x: { grid: { color: alpha(ALIAS.border, 0.5) }, ticks: { color: ALIAS.textSec } },
      y: { grid: { color: alpha(ALIAS.border, 0.5) }, ticks: { color: ALIAS.textSec }, beginAtZero: true },
    }
  }
});

const areaDatasets = {
  simple: [{
    label: 'Primas',
    data: [40,55,48,70,62,85],
    borderColor: ALIAS.chart_c1, backgroundColor: alpha(ALIAS.chart_c1,0.25),
    pointBackgroundColor: ALIAS.chart_c1, pointRadius:4, tension:0.4, fill:true,
  }],
  stacked: [
    { label:'Vida',  data:[25,30,28,38,35,42], borderColor:ALIAS.chart_c1, backgroundColor:alpha(ALIAS.chart_c1,0.3), pointRadius:3, tension:0.4, fill:true, stack:'s' },
    { label:'Hogar', data:[15,20,18,22,20,28], borderColor:ALIAS.chart_c2, backgroundColor:alpha(ALIAS.chart_c2,0.3), pointRadius:3, tension:0.4, fill:true, stack:'s' },
    { label:'Auto',  data:[10,12,10,14,12,18], borderColor:ALIAS.chart_c3, backgroundColor:alpha(ALIAS.chart_c3,0.3), pointRadius:3, tension:0.4, fill:true, stack:'s' },
  ],
};

document.querySelectorAll('[data-chart="area"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    document.querySelectorAll('[data-chart="area"]').forEach(b => {
      b.classList.remove('btn--active','btn--primary');
      b.classList.add('btn--ghost');
    });
    btn.classList.remove('btn--ghost');
    btn.classList.add('btn--primary','btn--active');
    areaChart.data.datasets = areaDatasets[mode];
    areaChart.update();
  });
});

/* ─── 8. HORIZONTAL BAR ─────────────────────────────────────────────────── */
const hbarCtx = document.getElementById('hbarChart');
const hbarChart = new Chart(hbarCtx, {
  type: 'bar',
  data: {
    labels: CATS,
    datasets: [{
      label: 'Cuota de mercado',
      data: [80,65,55,45,35],
      backgroundColor: alpha(ALIAS.chart_c3, 0.85),
      borderColor:     ALIAS.chart_c3,
      borderWidth: 1,
      borderRadius: 4,
    }]
  },
  options: {
    ...BASE_OPTS,
    indexAxis: 'y',
    plugins: { ...BASE_OPTS.plugins, legend: { ...BASE_OPTS.plugins.legend, position: 'top' } },
    scales: {
      x: { grid: { color: alpha(ALIAS.border, 0.5) }, ticks: { color: ALIAS.textSec }, beginAtZero: true },
      y: { grid: { color: 'transparent' }, ticks: { color: ALIAS.textSec } },
    }
  }
});

const hbarDatasets = {
  simple: [{
    label: 'Cuota de mercado',
    data: [80,65,55,45,35],
    backgroundColor: alpha(ALIAS.chart_c3,0.85), borderColor:ALIAS.chart_c3, borderWidth:1, borderRadius:4,
  }],
  comparative: [
    { label:'Mapfre', data:[80,65,55,45,35], backgroundColor:alpha(ALIAS.chart_c1,0.85), borderColor:ALIAS.chart_c1, borderWidth:1, borderRadius:4 },
    { label:'Sector', data:[60,70,50,55,40], backgroundColor:alpha(ALIAS.chart_c2,0.85), borderColor:ALIAS.chart_c2, borderWidth:1, borderRadius:4 },
  ],
};

document.querySelectorAll('[data-chart="hbar"]').forEach(btn => {
  btn.addEventListener('click', () => {
    const mode = btn.dataset.mode;
    document.querySelectorAll('[data-chart="hbar"]').forEach(b => {
      b.classList.remove('btn--active','btn--primary');
      b.classList.add('btn--ghost');
    });
    btn.classList.remove('btn--ghost');
    btn.classList.add('btn--primary','btn--active');
    hbarChart.data.datasets = hbarDatasets[mode];
    hbarChart.update();
  });
});

/* ─── CODE LAB ──────────────────────────────────────────────────────────── */
const DEFAULT_CODE = `// Usa el objeto ALIAS para los colores del sistema.
// ALIAS.chart_c1  → --color-chart-1  (azul Mapfre)
// ALIAS.brand_primary → --color-brand-primary (solo botones)

var ctx = document.getElementById('labCanvas').getContext('2d');

new Chart(ctx, {
  type: 'bar',
  data: {
    labels: ['Vida', 'Hogar', 'Auto', 'Salud', 'Viaje'],
    datasets: [{
      label: 'Pólizas 2024',
      data: [90, 55, 80, 61, 76],
      backgroundColor: [
        alpha(ALIAS.chart_c1, 0.7),
        alpha(ALIAS.chart_c2, 0.7),
        alpha(ALIAS.chart_c3, 0.7),
        alpha(ALIAS.chart_c4, 0.7),
        alpha(ALIAS.chart_c5, 0.7),
      ],
      borderColor: [
        ALIAS.chart_c1,
        ALIAS.chart_c2,
        ALIAS.chart_c3,
        ALIAS.chart_c4,
        ALIAS.chart_c5,
      ],
      borderWidth: 1,
      borderRadius: 4,
    }]
  },
  options: {
    responsive: true,
    maintainAspectRatio: true,
    plugins: { legend: { position: 'top' } },
    scales: {
      y: { beginAtZero: true }
    }
  }
});`;

const editor   = document.getElementById('codeEditor');
const labCanvas = document.getElementById('labChart');
editor.value = DEFAULT_CODE;

let labChartInstance = null;

function runLabCode() {
  if (labChartInstance) {
    labChartInstance.destroy();
    labChartInstance = null;
  }

  // Redefinir el canvas para evitar reuso
  const parent = labCanvas.parentElement;
  labCanvas.remove();
  const newCanvas = document.createElement('canvas');
  newCanvas.id = 'labChart';
  newCanvas.id = 'labCanvas';
  parent.appendChild(newCanvas);

  try {
    const fn = new Function('Chart','ALIAS','alpha', editor.value);
    fn(Chart, ALIAS, alpha);
    // Capturar la instancia activa del canvas
    const registeredChart = Chart.getChart(newCanvas);
    if (registeredChart) labChartInstance = registeredChart;
  } catch(err) {
    console.error('[Code Lab]', err);
    const errMsg = document.createElement('p');
    errMsg.style.cssText = 'color:#DA2A2A;font-size:12px;padding:8px;';
    errMsg.textContent = '⚠ ' + err.message;
    parent.insertBefore(errMsg, newCanvas);
    setTimeout(() => errMsg.remove(), 4000);
  }
}

document.getElementById('btnRender').addEventListener('click', runLabCode);

document.getElementById('btnRestore').addEventListener('click', () => {
  editor.value = DEFAULT_CODE;
  runLabCode();
});

document.getElementById('btnDownload').addEventListener('click', () => {
  const canvas = document.getElementById('labCanvas');
  if (!canvas) return;
  const link = document.createElement('a');
  link.download = 'mapfre-chart.png';
  link.href = canvas.toDataURL('image/png');
  link.click();
});

// Renderizar el lab al cargar
runLabCode();
