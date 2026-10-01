let benchmarkChart = null;
let carrierFrequency = 3.8;

document.addEventListener("DOMContentLoaded", () => {
  initHeroTowerCanvas();
  initConstellationCanvas();
  initNPUMatrixCanvas();
  initRAGVectorCanvas();
  initVisionScannerCanvas();
  initAudioEqualizerCanvas();
  initChart();
  fetchHealthStatus();
  fetchCatalog();
});

// XSS Prevention Helper
function escapeHtml(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// User-Facing Error Toast Notification
function showErrorToast(message) {
  const toast = document.getElementById('uiErrorAlert');
  if (!toast) return;
  toast.innerText = `⚠️ ${message}`;
  toast.style.display = 'block';
  setTimeout(() => {
    toast.style.display = 'none';
  }, 5000);
}

// Fetch Health Status & Detect Hardware Providers
async function fetchHealthStatus() {
  try {
    const res = await fetch('/api/health');
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);
    const data = await res.json();
    
    const statusPill = document.getElementById('signalStatus');
    if (statusPill) {
      statusPill.innerText = escapeHtml(data.detected_provider);
    }
  } catch (e) {
    console.error("Health check error:", e);
    showErrorToast("Could not connect to SnapPulse local API server");
  }
}

// Tab Switcher
function switchTab(tabId) {
  document.querySelectorAll('.tab-item').forEach(btn => btn.classList.remove('active'));
  document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));

  const activeBtn = Array.from(document.querySelectorAll('.tab-item')).find(b => b.getAttribute('onclick').includes(tabId));
  if (activeBtn) activeBtn.classList.add('active');

  const activePanel = document.getElementById(`tab-${tabId}`);
  if (activePanel) activePanel.classList.add('active');
}

// Carrier Slider
function updateCarrier(val) {
  carrierFrequency = parseFloat(val);
  document.getElementById('carrierVal').innerText = `${val} GHz`;
  document.getElementById('statFreq').innerText = `${val} GHz`;
  drawConstellation();
}

function randomizeSignal() {
  const newSnr = (38 + Math.random() * 10).toFixed(1);
  document.getElementById('statSnr').innerText = `${newSnr} dB`;
  drawConstellation();
}

// 1. Hero Signal Tower Canvas
function initHeroTowerCanvas() {
  const canvas = document.getElementById('heroTowerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  let offset = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    offset += 0.04;

    const towerX = 60;
    const towerY = canvas.height - 20;

    ctx.lineWidth = 3;
    ctx.strokeStyle = '#3B82F6';
    ctx.beginPath();
    ctx.moveTo(towerX - 25, towerY);
    ctx.lineTo(towerX, towerY - 100);
    ctx.lineTo(towerX + 25, towerY);
    ctx.stroke();

    ctx.lineWidth = 1.5;
    ctx.strokeStyle = '#8B5CF6';
    ctx.beginPath();
    ctx.moveTo(towerX - 15, towerY - 40); ctx.lineTo(towerX + 15, towerY - 40);
    ctx.moveTo(towerX - 10, towerY - 70); ctx.lineTo(towerX + 10, towerY - 70);
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(towerX, towerY - 105, 6, 0, Math.PI * 2);
    ctx.fillStyle = '#EF4444';
    ctx.fill();

    for (let r = 20; r < 240; r += 40) {
      const radius = (r + offset * 30) % 240;
      const alpha = 1 - radius / 240;
      ctx.beginPath();
      ctx.arc(towerX, towerY - 105, radius, -Math.PI / 3, Math.PI / 3);
      ctx.lineWidth = 2.5;
      ctx.strokeStyle = radius % 80 < 40 ? `rgba(239, 68, 68, ${alpha})` : `rgba(59, 130, 246, ${alpha})`;
      ctx.stroke();
    }

    for (let i = 0; i < 4; i++) {
      const bx = towerX + ((offset * 100 + i * 80) % (canvas.width - 90));
      const by = (towerY - 105) + Math.sin(bx * 0.05) * 20;
      ctx.beginPath();
      ctx.arc(bx, by, 7, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#10B981' : '#8B5CF6';
      ctx.fill();
    }

    requestAnimationFrame(render);
  }

  render();
}

// 2. QAM-64 Constellation Canvas
function initConstellationCanvas() {
  drawConstellation();
}

function drawConstellation() {
  const canvas = document.getElementById('constellationCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  ctx.strokeStyle = '#CBD5E1';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.moveTo(canvas.width / 2, 0); ctx.lineTo(canvas.width / 2, canvas.height);
  ctx.moveTo(0, canvas.height / 2); ctx.lineTo(canvas.width, canvas.height / 2);
  ctx.stroke();

  const step = canvas.width / 10;
  for (let i = 1; i <= 8; i++) {
    for (let j = 1; j <= 8; j++) {
      const cx = i * step + (Math.random() - 0.5) * 4;
      const cy = j * step + (Math.random() - 0.5) * 4;

      ctx.beginPath();
      ctx.arc(cx, cy, 3.5, 0, Math.PI * 2);
      ctx.fillStyle = (i + j) % 2 === 0 ? '#EF4444' : '#3B82F6';
      ctx.fill();
    }
  }
}

// 3. NPU Matrix Canvas
function initNPUMatrixCanvas() {
  const canvas = document.getElementById('npuMatrixCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  let tick = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    tick += 0.05;

    const cols = 10;
    const rows = 4;
    const cellW = canvas.width / cols;
    const cellH = canvas.height / rows;

    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const pulse = Math.sin(tick + (r + c) * 0.5) * 0.5 + 0.5;
        ctx.fillStyle = (r + c) % 2 === 0 ? `rgba(59, 130, 246, ${0.2 + pulse * 0.6})` : `rgba(139, 92, 246, ${0.2 + pulse * 0.6})`;
        ctx.fillRect(c * cellW + 4, r * cellH + 4, cellW - 8, cellH - 8);
      }
    }
    requestAnimationFrame(render);
  }

  render();
}

// 4. RAG Vector Canvas
function initRAGVectorCanvas() {
  const canvas = document.getElementById('ragVectorCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  const nodes = [];
  for (let i = 0; i < 20; i++) {
    nodes.push({
      x: Math.random() * canvas.width,
      y: Math.random() * canvas.height,
      vx: (Math.random() - 0.5) * 0.6,
      vy: (Math.random() - 0.5) * 0.6
    });
  }

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    for (let i = 0; i < nodes.length; i++) {
      const n1 = nodes[i];
      n1.x += n1.vx; n1.y += n1.vy;
      if (n1.x < 0 || n1.x > canvas.width) n1.vx *= -1;
      if (n1.y < 0 || n1.y > canvas.height) n1.vy *= -1;

      ctx.beginPath();
      ctx.arc(n1.x, n1.y, 4, 0, Math.PI * 2);
      ctx.fillStyle = i % 2 === 0 ? '#8B5CF6' : '#06B6D4';
      ctx.fill();

      for (let j = i + 1; j < nodes.length; j++) {
        const n2 = nodes[j];
        const dist = Math.hypot(n1.x - n2.x, n1.y - n2.y);
        if (dist < 80) {
          ctx.beginPath();
          ctx.moveTo(n1.x, n1.y); ctx.lineTo(n2.x, n2.y);
          ctx.strokeStyle = `rgba(139, 92, 246, ${0.4 * (1 - dist / 80)})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }
    }
    requestAnimationFrame(render);
  }

  render();
}

// 5. Vision Scanner Canvas
function initVisionScannerCanvas() {
  const canvas = document.getElementById('visionScannerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  let scanY = 0;

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    scanY = (scanY + 2) % canvas.height;

    ctx.fillStyle = '#F8FAFC';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    ctx.strokeStyle = '#10B981';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(0, scanY); ctx.lineTo(canvas.width, scanY);
    ctx.stroke();

    requestAnimationFrame(render);
  }

  render();
}

// 6. Audio Equalizer Canvas
function initAudioEqualizerCanvas() {
  const canvas = document.getElementById('audioEqualizerCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  canvas.width = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;

  let step = 0;
  const colors = ['#EF4444', '#F59E0B', '#10B981', '#3B82F6', '#8B5CF6'];

  function render() {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    step += 0.08;

    const bars = 25;
    const barWidth = canvas.width / bars;

    for (let i = 0; i < bars; i++) {
      const h = Math.abs(Math.sin(step + i * 0.4)) * (canvas.height - 20) + 10;
      const x = i * barWidth + 3;
      const y = canvas.height - h;

      ctx.fillStyle = colors[i % colors.length];
      ctx.fillRect(x, y, barWidth - 6, h);
    }

    requestAnimationFrame(render);
  }

  render();
}

// Chart Initialization
function initChart() {
  const canvas = document.getElementById('benchmarkChart');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');

  benchmarkChart = new Chart(ctx, {
    type: 'bar',
    data: {
      labels: ['Target Execution Provider', 'CPU Baseline Provider'],
      datasets: [
        {
          label: 'Median Latency (ms) [Lower is Better]',
          data: [8.4, 40.7],
          backgroundColor: ['rgba(59, 130, 246, 0.85)', 'rgba(239, 68, 68, 0.85)'],
          borderColor: ['#3B82F6', '#EF4444'],
          borderWidth: 1.5,
          borderRadius: 8
        },
        {
          label: 'GFLOPs Compute Throughput [Higher is Better]',
          data: [142.8, 29.4],
          backgroundColor: ['rgba(16, 185, 129, 0.5)', 'rgba(148, 163, 184, 0.3)'],
          borderColor: ['#10B981', '#94A3B8'],
          borderWidth: 1,
          borderRadius: 8
        }
      ]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      scales: {
        y: {
          beginAtZero: true,
          grid: { color: '#E2E8F0' },
          ticks: { color: '#475569', font: { family: 'Plus Jakarta Sans' } }
        },
        x: {
          grid: { display: false },
          ticks: { color: '#0F172A', font: { family: 'Plus Jakarta Sans', weight: '700' } }
        }
      },
      plugins: {
        legend: { labels: { color: '#0F172A', font: { family: 'Plus Jakarta Sans', weight: '700' } } }
      }
    }
  });
}

// Run Real ONNX Benchmark
async function runLiveBenchmark() {
  try {
    const res = await fetch('/api/benchmark/run', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matrix_size: 512, iterations: 20 })
    });
    
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP Error ${res.status}`);
    }

    const data = await res.json();

    document.getElementById('targetProviderName').innerText = escapeHtml(data.target_results.provider_label);
    document.getElementById('npuLatency').innerText = `${data.target_results.median_latency_ms} ms`;
    document.getElementById('cpuLatency').innerText = `${data.cpu_results.median_latency_ms} ms`;
    document.getElementById('npuP95').innerText = `${data.target_results.p95_latency_ms} ms`;
    document.getElementById('cpuP95').innerText = `${data.cpu_results.p95_latency_ms} ms`;
    document.getElementById('npuGflops').innerText = `GFLOPs: ${data.target_results.gflops} GFLOPS`;
    document.getElementById('cpuGflops').innerText = `GFLOPs: ${data.cpu_results.gflops} GFLOPS`;
    document.getElementById('statGflops').innerText = data.target_results.gflops;

    if (data.is_hardware_accelerated) {
      document.getElementById('npuBadgeLabel').innerText = "HARDWARE ACCELERATOR ACTIVE";
    } else {
      document.getElementById('npuBadgeLabel').innerText = "CPU BENCHMARK";
    }

    // Update Chart
    benchmarkChart.data.labels = [data.target_results.provider, 'CPUExecutionProvider'];
    benchmarkChart.data.datasets[0].data = [data.target_results.median_latency_ms, data.cpu_results.median_latency_ms];
    benchmarkChart.data.datasets[1].data = [data.target_results.gflops, data.cpu_results.gflops];
    benchmarkChart.update();
  } catch (e) {
    console.error("Benchmark error:", e);
    showErrorToast(e.message || "Benchmark failed to execute");
  }
}

// Index RAG Document
async function indexDocument() {
  const title = document.getElementById('docTitle').value.trim();
  const content = document.getElementById('docContent').value.trim();
  if (!title || !content) {
    showErrorToast("Document title and content cannot be empty");
    return;
  }

  try {
    const res = await fetch('/api/rag/index', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, content })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    document.getElementById('indexStatus').innerText = `✅ Indexed "${escapeHtml(title)}" (${data.indexed_chunks} chunks vectorized via TF-IDF)`;
  } catch (e) {
    console.error("Index error:", e);
    showErrorToast(e.message || "Document indexing failed");
  }
}

function handleQueryKey(e) {
  if (e.key === 'Enter') queryRAG();
}

async function queryRAG() {
  const query = document.getElementById('ragQuery').value.trim();
  if (!query) return;

  try {
    const res = await fetch('/api/rag/query', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ query })
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    const container = document.getElementById('ragResults');
    container.innerHTML = '';

    if (!data.matches || data.matches.length === 0) {
      container.innerHTML = `<div class="empty-msg">No semantic matches found for "${escapeHtml(query)}".</div>`;
      return;
    }

    data.matches.forEach(m => {
      const card = document.createElement('div');
      card.className = 'match-card';
      card.innerHTML = `
        <div style="display:flex; justify-content:space-between; color:#3B82F6; font-weight:800; font-size:13px; margin-bottom:4px;">
          <span>📄 ${escapeHtml(m.title)}</span>
          <span>Cosine Score: ${escapeHtml(m.score)}</span>
        </div>
        <div style="font-family:var(--font-mono); font-size:13px; color:#1E293B;">"${escapeHtml(m.snippet)}"</div>
      `;
      container.appendChild(card);
    });
  } catch (e) {
    console.error("Query error:", e);
    showErrorToast(e.message || "Search query failed");
  }
}

// Upload Custom Vision Image
async function uploadVisionImage(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/vision/analyze', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    renderVisionResults(data);
  } catch (e) {
    console.error("Upload vision error:", e);
    showErrorToast(e.message || "Image upload failed");
  }
}

// Analyze Vision Frame (Demo or Custom)
async function analyzeVision() {
  try {
    const res = await fetch('/api/vision/analyze', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    renderVisionResults(data);
  } catch (e) {
    console.error("Vision error:", e);
    showErrorToast(e.message || "Vision analysis failed");
  }
}

function renderVisionResults(data) {
  const img = document.getElementById('edgeMapImg');
  const placeholder = document.getElementById('visionPlaceholder');
  const sourceLabel = document.getElementById('visionSourceLabel');

  img.src = data.edge_map_base64;
  img.style.display = 'block';
  placeholder.style.display = 'none';

  if (sourceLabel) sourceLabel.innerText = escapeHtml(data.source_label);

  document.getElementById('vSource').innerText = data.is_custom_upload ? "Custom Image Upload" : "Synthetic Demo Frame";
  document.getElementById('vRes').innerText = escapeHtml(data.resolution);
  document.getElementById('vEdge').innerText = `${data.edge_density_pct}% edge pixels`;
  document.getElementById('vBright').innerText = `${data.mean_brightness} / 255`;
  document.getElementById('vRgb').innerText = `R:${data.rgb_distribution.red} G:${data.rgb_distribution.green} B:${data.rgb_distribution.blue}`;
}

// Upload Custom Audio File
async function uploadAudioFile(event) {
  const file = event.target.files[0];
  if (!file) return;

  const formData = new FormData();
  formData.append('file', file);

  try {
    const res = await fetch('/api/audio/analyze', {
      method: 'POST',
      body: formData
    });

    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    renderAudioResults(data);
  } catch (e) {
    console.error("Upload audio error:", e);
    showErrorToast(e.message || "Audio upload failed");
  }
}

// Analyze Audio (Demo or Custom)
async function analyzeAudio() {
  try {
    const res = await fetch('/api/audio/analyze', { method: 'POST' });
    if (!res.ok) {
      const err = await res.json();
      throw new Error(err.detail || `HTTP ${res.status}`);
    }

    const data = await res.json();
    renderAudioResults(data);
  } catch (e) {
    console.error("Audio error:", e);
    showErrorToast(e.message || "Audio analysis failed");
  }
}

function renderAudioResults(data) {
  const sourceLabel = document.getElementById('audioSourceLabel');
  if (sourceLabel) sourceLabel.innerText = escapeHtml(data.source_label);

  document.getElementById('aSource').innerText = data.is_custom_upload ? "Custom WAV Upload" : "Synthetic Demo Signal";
  document.getElementById('aFreq').innerText = `${data.spectral_metrics.dominant_frequency_hz} Hz`;
  document.getElementById('aDb').innerText = `${data.spectral_metrics.rms_energy_db} dB`;
  document.getElementById('audioSummary').innerText = escapeHtml(data.summary);

  const kwContainer = document.getElementById('audioKeywords');
  kwContainer.innerHTML = '';
  data.keywords.forEach(kw => {
    const chip = document.createElement('span');
    chip.style.cssText = "background: rgba(139, 92, 246, 0.15); color: #7C3AED; font-weight: 800; font-size: 12px; padding: 4px 10px; border-radius: 20px; margin-right: 6px; margin-bottom: 6px; display: inline-block;";
    chip.innerText = `# ${escapeHtml(kw)}`;
    kwContainer.appendChild(chip);
  });
}

// Catalog
async function fetchCatalog() {
  try {
    const res = await fetch('/api/ai-hub/models');
    if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

    const models = await res.json();
    const grid = document.getElementById('catalogGrid');
    if (!grid) return;
    grid.innerHTML = '';

    models.forEach(m => {
      const card = document.createElement('div');
      card.style.cssText = "background: #F8FAFC; border: 1.5px solid #E2E8F0; border-radius: 16px; padding: 24px;";
      card.innerHTML = `
        <div style="display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px;">
          <h4 style="font-weight: 800; color: #0F172A;">${escapeHtml(m.name)}</h4>
          <span style="background: rgba(59, 130, 246, 0.15); color: #3B82F6; font-size: 10px; font-weight: 800; padding: 4px 8px; border-radius: 6px;">${escapeHtml(m.category)}</span>
        </div>
        <p style="font-size: 13px; color: #475569; margin-bottom: 14px;">${escapeHtml(m.description)}</p>
        <div style="font-family: var(--font-mono); font-size: 12px; color: #3B82F6;">
          <div>Params: ${escapeHtml(m.parameters)} | ${escapeHtml(m.quantization)}</div>
          <div>Simulated Latency: ${escapeHtml(m.latency_npu_ms)} ms (vs CPU ${escapeHtml(m.latency_cpu_ms)} ms)</div>
        </div>
      `;
      grid.appendChild(card);
    });
  } catch (e) {
    console.error("Catalog error:", e);
    showErrorToast("Could not load AI Hub model catalog");
  }
}
