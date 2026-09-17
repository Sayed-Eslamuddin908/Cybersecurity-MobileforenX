// ============================================================
// MobileForenX — Frontend
// Engineered & Designed by Sayed Eslamuddin
// ============================================================

/* ---------- Utilities ---------- */
function getCSRFToken() {
  const m = document.querySelector('meta[name="csrf-token"]');
  return m ? m.getAttribute('content') : '';
}

function escapeHtml(s) {
  return String(s == null ? '' : s)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

function toast(msg, kind) {
  kind = kind || 'ok';
  const el = document.getElementById('toast');
  if (!el) return;
  el.textContent = msg;
  el.className = 'toast show ' + kind;
  clearTimeout(el._timer);
  el._timer = setTimeout(() => el.classList.remove('show'), 4500);
}

function setStatus(text, busy) {
  const pill = document.getElementById('status-pill');
  const span = document.getElementById('status-text');
  if (!pill || !span) return;
  span.innerHTML = busy ? '<span class="spinner"></span>' + text : text;
  pill.style.borderColor = busy ? 'rgba(59,130,246,0.4)' : 'rgba(16,185,129,0.3)';
  pill.style.background = busy ? 'rgba(59,130,246,0.1)' : 'rgba(16,185,129,0.1)';
  pill.style.color = busy ? 'var(--accent)' : 'var(--green)';
}

function startProgressDisplay(outEl, label) {
  if (!outEl) return null;
  outEl.style.display = 'block';
  outEl.textContent = label;
  let dots = 0;
  return setInterval(() => {
    dots = (dots + 1) % 4;
    outEl.textContent = label + ' ' + '...'.substring(0, dots);
  }, 400);
}

function stopProgressDisplay(handle) {
  if (handle) clearInterval(handle);
}

function postOpts(body) {
  return {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-CSRF-Token': getCSRFToken(),
    },
    body: JSON.stringify(body || {}),
  };
}

/* ---------- API wrapper ---------- */
async function api(path, opts) {
  opts = opts || {};
  const method = (opts.method || 'GET').toUpperCase();

  if (['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) {
    opts.headers = opts.headers || {};
    opts.headers['X-CSRF-Token'] = getCSRFToken();
  }

  setStatus('Working...', true);
  try {
    const r = await fetch(path, opts);
    let j;
    try {
      j = await r.json();
    } catch (e) {
      j = { ok: false, error: 'Server returned ' + r.status };
    }
    setStatus('Ready', false);

    if (r.status === 403) {
      toast('Session expired or CSRF invalid — please log in again', 'err');
      setTimeout(() => (window.location.href = '/login'), 1500);
    } else if (r.status === 401) {
      toast('Session expired — please log in again', 'err');
      setTimeout(() => (window.location.href = '/login'), 1500);
    } else if (r.status === 429) {
      toast(j.error || 'Too many requests — slow down', 'err');
    }
    return j;
  } catch (e) {
    setStatus('Error', false);
    toast('Request failed: ' + e.message, 'err');
    throw e;
  }
}

/* ---------- Tab switching ---------- */
document.querySelectorAll('.nav-item').forEach((item) => {
  item.addEventListener('click', () => {
    const tab = item.dataset.tab;

    document.querySelectorAll('.nav-item').forEach((n) => n.classList.remove('active'));
    item.classList.add('active');

    document.querySelectorAll('.pane').forEach((p) => p.classList.remove('active'));
    const pane = document.getElementById('pane-' + tab);
    if (pane) pane.classList.add('active');

    const titleEl = document.getElementById('page-title');
    if (titleEl) {
      const label = item.querySelector('span:not(.nav-icon)');
      if (label) titleEl.textContent = label.textContent;
    }

    if (tab === 'wireless') {
      setTimeout(wirelessNetworkInfo, 200);
      wirelessShowCode();
    }
    if (tab === 'report') {
      setTimeout(reportLoadTypes, 200);
    }
    if (tab === 'about') {
      // no-op
    }
  });
});

function showTab(name) {
  const item = document.querySelector(`.nav-item[data-tab="${name}"]`);
  if (item) item.click();
}

/* ============================================================
   DEVICES
   ============================================================ */
async function scanDevices() {
  const j = await api('/api/devices');
  const el = document.getElementById('devices-list');
  const sum = document.getElementById('device-result');
  if (!j.devices || j.devices.length === 0) {
    const empty = '<div class="badge warn">No devices detected</div>';
    if (el) el.innerHTML = empty;
    if (sum) sum.innerHTML = empty;
    return;
  }
  const html = j.devices.map((d) =>
    '<div class="device-row">' +
      '<span class="dot"></span>' +
      '<div style="flex:1">' +
        '<div class="name">' + escapeHtml(d.platform.toUpperCase()) + ' · ' +
          escapeHtml(d.manufacturer) + ' ' + escapeHtml(d.model) + '</div>' +
        '<div class="meta">Serial: ' + escapeHtml(d.serial) +
          ' · OS: ' + escapeHtml(d.os_version) +
          ' · Rooted: ' + escapeHtml(d.is_rooted) + '</div>' +
      '</div>' +
    '</div>'
  ).join('');
  if (el) el.innerHTML = html;
  if (sum) sum.innerHTML = '<div class="badge ok">' + j.devices.length + ' device(s) found</div>';
}

/* ============================================================
   CASES
   ============================================================ */
async function createCase() {
  const id = document.getElementById('new-case-id').value.trim();
  const ex = document.getElementById('new-case-examiner').value.trim();
  const cdEl = document.getElementById('new-case-date');
  let cd = cdEl ? cdEl.value.trim() : '';

  if (!id || !ex) {
    toast('Case Number and Examiner are required', 'err');
    return;
  }
  if (cd && !/^\d{2}\/\d{2}\/\d{4}$/.test(cd)) {
    toast('Date must be DD/MM/YYYY', 'err');
    return;
  }
  if (!cd) {
    const d = new Date();
    cd = String(d.getDate()).padStart(2, '0') + '/' +
         String(d.getMonth() + 1).padStart(2, '0') + '/' +
         d.getFullYear();
  }

  const j = await api('/api/case/create',
    postOpts({ case_id: id, examiner: ex, case_date: cd }));

  if (j.ok) {
    toast('Case created: ' + id, 'ok');
    loadCases();
  } else {
    toast(j.error || 'Failed to create case', 'err');
  }
}

async function loadCases() {
  const j = await api('/api/case/list');
  const el = document.getElementById('cases-list');
  if (!el) return;
  if (!j.cases || j.cases.length === 0) {
    el.innerHTML = '<div class="badge warn">No cases yet</div>';
    return;
  }
  el.innerHTML = j.cases.map((c) =>
    '<div class="device-row">' +
      '<div style="flex:1"><div class="name">' + escapeHtml(c) + '</div></div>' +
      '<button class="btn btn-ghost" data-case="' + escapeHtml(c) + '">Load</button>' +
    '</div>'
  ).join('');

  el.querySelectorAll('button[data-case]').forEach((btn) => {
    btn.addEventListener('click', () => selectCase(btn.dataset.case));
  });
}

async function selectCase(id) {
  const j = await api('/api/case/load', postOpts({ case_id: id }));
  if (j.ok) {
    toast('Loaded case ' + id, 'ok');
  } else {
    toast(j.error || 'Failed to load case', 'err');
  }
}

/* ============================================================
   ACQUISITION
   ============================================================ */
async function runAcquisition() {
  const serial = document.getElementById('acq-serial').value.trim();
  const method = document.getElementById('acq-method').value;
  const out = document.getElementById('acq-output');
  const handle = startProgressDisplay(out, 'Starting acquisition');
  try {
    const j = await api('/api/acquire', postOpts({ serial, method }));
    stopProgressDisplay(handle);
    out.textContent = j.log || j.error || '(no output)';
    toast(j.ok ? 'Acquisition complete' : 'Acquisition failed', j.ok ? 'ok' : 'err');
  } catch (e) {
    stopProgressDisplay(handle);
    out.textContent = 'Error: ' + e.message;
  }
}

/* ============================================================
   CONTENT PROVIDERS
   ============================================================ */
async function runContentExtract() {
  const out = document.getElementById('content-output');
  const handle = startProgressDisplay(out, 'Extracting via ContentProvider');
  try {
    const j = await api('/api/extract/content', postOpts({}));
    stopProgressDisplay(handle);
    out.textContent = j.log || j.error || '(no output)';
    toast('Extracted ' + (j.total || 0) + ' rows', j.ok ? 'ok' : 'err');
  } catch (e) {
    stopProgressDisplay(handle);
    out.textContent = 'Error: ' + e.message;
  }
}

async function viewContentExtract() {
  const viewer = document.getElementById('content-viewer');
  viewer.style.display = 'block';
  viewer.innerHTML = '<p class="muted">Loading extracted data...</p>';

  const j = await api('/api/extract/content/view');

  if (!j.ok || !j.providers || Object.keys(j.providers).length === 0) {
    viewer.innerHTML = '<div class="badge warn">No extracted data yet.</div>';
    return;
  }

  let html = '';
  for (const name in j.providers) {
    const rows = j.providers[name];
    if (!rows || rows.length === 0) continue;

    html += '<div class="card">';
    html += '<div class="card-head"><div class="card-icon">📋</div>';
    html += '<h3>' + escapeHtml(name) + ' — ' + rows.length + ' records</h3></div>';

    const cols = [];
    for (let i = 0; i < Math.min(rows.length, 5); i++) {
      for (const k in rows[i]) {
        if (k.indexOf('_') !== 0 && cols.indexOf(k) === -1) {
          cols.push(k);
        }
        if (cols.length >= 8) break;
      }
      if (cols.length >= 8) break;
    }

    if (cols.length === 0) {
      html += '<p class="muted">No visible fields</p></div>';
      continue;
    }

    html += '<div style="overflow-x:auto"><table>';
    html += '<thead><tr><th>#</th>';
    cols.forEach((c) => {
      html += '<th>' + escapeHtml(c.replace(/_/g, ' ')) + '</th>';
    });
    html += '</tr></thead><tbody>';

    rows.slice(0, 100).forEach((row, idx) => {
      html += '<tr>';
      html += '<td>' + (idx + 1) + '</td>';
      cols.forEach((c) => {
        let v = row[c] == null ? '' : String(row[c]);
        if (v.length > 60) v = v.substring(0, 57) + '…';
        html += '<td>' + escapeHtml(v) + '</td>';
      });
      html += '</tr>';
    });

    html += '</tbody></table></div>';
    if (rows.length > 100) {
      html += '<p class="muted" style="margin-top:8px">' +
        (rows.length - 100) + ' more records in JSON.</p>';
    }
    html += '</div>';
  }

  viewer.innerHTML = html;
}

/* ============================================================
   ROOT EXTRACT
   ============================================================ */
async function runRootExtract() {
  const out = document.getElementById('root-output');
  const handle = startProgressDisplay(out, 'Extracting app databases via root');
  try {
    const j = await api('/api/extract/root', postOpts({}));
    stopProgressDisplay(handle);
    out.textContent = j.log || j.error || '(no output)';
    toast('Root extract: ' + (j.total || 0) + ' files', j.ok ? 'ok' : 'err');
  } catch (e) {
    stopProgressDisplay(handle);
    out.textContent = 'Error: ' + e.message;
  }
}

/* ============================================================
   FOLDER PICKER (Analysis)
   ============================================================ */
let _folderTree = [];
let _selectedPaths = new Set();

function _renderFolderNode(node, container) {
  const div = document.createElement('div');
  div.className = 'folder-node';
  div.style.marginLeft = (node.depth * 20) + 'px';
  div.style.marginTop = '6px';
  div.style.padding = '8px 12px';
  div.style.background = 'rgba(0,0,0,0.25)';
  div.style.border = '1px solid var(--border)';
  div.style.borderRadius = '8px';
  div.style.display = 'flex';
  div.style.alignItems = 'center';
  div.style.gap = '12px';

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.dataset.path = node.path;
  cb.className = 'folder-cb';
  cb.checked = _selectedPaths.has(node.path);
  cb.onchange = function () {
    if (this.checked) _selectedPaths.add(node.path);
    else _selectedPaths.delete(node.path);
    updateSelectedSummary();
  };
  div.appendChild(cb);

  const label = document.createElement('div');
  label.style.flex = '1';
  label.innerHTML = '<b>📁 ' + escapeHtml(node.name) + '</b>' +
    '<div class="muted" style="font-size:13px">' +
    node.file_count + ' files · ' + escapeHtml(node.total_size_human) +
    '</div>';
  div.appendChild(label);

  container.appendChild(div);

  (node.children || []).forEach((c) => _renderFolderNode(c, container));
}

async function scanFolders() {
  const viewer = document.getElementById('folders-viewer');
  viewer.innerHTML = '<p class="muted">Scanning case folders...</p>';

  try {
    const j = await api('/api/folders/scan', postOpts({}));

    if (!j.ok) {
      viewer.innerHTML = '<div class="badge err">' +
        escapeHtml(j.error || 'Scan failed') + '</div>';
      return;
    }

    _folderTree = j.folders || [];
    _selectedPaths = new Set();
    viewer.innerHTML = '';

    if (_folderTree.length === 0) {
      viewer.innerHTML = '<div class="badge warn">No folders in this case yet. Extract data first.</div>';
      return;
    }

    _folderTree.forEach((node) => _renderFolderNode(node, viewer));

    toast('Scanned ' + _folderTree.length + ' folder(s)', 'ok');
    updateSelectedSummary();
  } catch (e) {
    viewer.innerHTML = '<div class="badge err">Error: ' + escapeHtml(e.message) + '</div>';
  }
}

function selectAllFolders() {
  _selectedPaths.clear();
  document.querySelectorAll('.folder-cb').forEach((cb) => {
    cb.checked = true;
    _selectedPaths.add(cb.dataset.path);
  });
  updateSelectedSummary();
}

function clearAllFolders() {
  _selectedPaths.clear();
  document.querySelectorAll('.folder-cb').forEach((cb) => {
    cb.checked = false;
  });
  updateSelectedSummary();
}

function updateSelectedSummary() {
  const el = document.getElementById('selected-summary');
  if (!el) return;
  if (_selectedPaths.size === 0) {
    el.textContent = 'No folders selected yet.';
    return;
  }
  let totalFiles = 0;
  _folderTree.forEach(function walk(n) {
    if (_selectedPaths.has(n.path)) totalFiles += n.file_count;
    (n.children || []).forEach(walk);
  });
  el.innerHTML = 'Selected: <b>' + _selectedPaths.size +
    '</b> folder(s), approximately <b>' + totalFiles +
    '</b> files will be indexed.';
}

async function runIndexSelected() {
  const out = document.getElementById('index-output');
  out.style.display = 'block';

  if (_selectedPaths.size === 0) {
    out.textContent = 'Select at least one folder first.';
    toast('No folders selected', 'err');
    return;
  }

  const paths = Array.from(_selectedPaths);
  out.textContent = 'Indexing ' + paths.length + ' folder(s)...';

  try {
    const j = await api('/api/index/selected', postOpts({ paths }));
    out.textContent = j.log || j.error || '(no output)';
    toast('Indexed ' + (j.total || 0) + ' files', j.ok ? 'ok' : 'err');
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
    toast('Index failed', 'err');
  }
}

async function clearAllArtifacts() {
  if (!confirm('Remove ALL indexed artifacts from the case? This cannot be undone.')) return;
  const j = await api('/api/artifacts/clear', postOpts({}));
  if (j.ok) {
    toast('Cleared ' + (j.removed || 0) + ' artifacts', 'ok');
  } else {
    toast(j.error || 'Clear failed', 'err');
  }
}

/* ============================================================
   ANALYSIS
   ============================================================ */
async function runAnalysis() {
  const out = document.getElementById('analysis-output');
  const handle = startProgressDisplay(out, 'Running parsers');
  try {
    const j = await api('/api/analyze', postOpts({}));
    stopProgressDisplay(handle);
    out.textContent = j.log || j.error || '(no output)';
    toast('Analysis: ' + (j.total || 0) + ' artifacts', j.ok ? 'ok' : 'err');
  } catch (e) {
    stopProgressDisplay(handle);
    out.textContent = 'Error: ' + e.message;
  }
}

/* ============================================================
   REPORT PICKER
   ============================================================ */
let _reportSelectedTypes = new Set();
let _reportSelectedFolders = new Set();
let _reportFolderTree = [];

async function reportLoadTypes() {
  const el = document.getElementById('report-type-picker');
  if (!el) return;
  el.innerHTML = '<p class="muted">Loading available data types...</p>';
  try {
    const j = await api('/api/report/available', postOpts({}));
    if (!j.ok || !j.types || j.types.length === 0) {
      el.innerHTML = '<div class="badge warn">No artifact types yet — extract data first.</div>';
      return;
    }
    _reportSelectedTypes = new Set(j.types.map((t) => t.name));
    renderReportTypes(j.types);
  } catch (e) {
    el.innerHTML = '<div class="badge err">Error: ' + escapeHtml(e.message) + '</div>';
  }
}

function renderReportTypes(types) {
  const el = document.getElementById('report-type-picker');
  el.innerHTML = '';
  types.forEach((t) => {
    const row = document.createElement('div');
    row.style.cssText = 'display:flex;align-items:center;gap:12px;padding:10px 14px;background:rgba(0,0,0,0.25);border:1px solid var(--border);border-radius:8px;margin-bottom:8px';

    const cb = document.createElement('input');
    cb.type = 'checkbox';
    cb.checked = _reportSelectedTypes.has(t.name);
    cb.style.cssText = 'width:20px;height:20px;accent-color:var(--accent)';
    cb.onchange = function () {
      if (this.checked) _reportSelectedTypes.add(t.name);
      else _reportSelectedTypes.delete(t.name);
      updateReportSummary();
    };
    row.appendChild(cb);

    const lbl = document.createElement('div');
    lbl.style.flex = '1';
    lbl.innerHTML = '<b>' + escapeHtml(t.name) + '</b> ' +
      '<span class="muted">(' + t.count + ' records)</span>';
    row.appendChild(lbl);

    el.appendChild(row);
  });
  updateReportSummary();
}

function reportSelectAllTypes() {
  _reportSelectedTypes = new Set();
  document.querySelectorAll('#report-type-picker > div').forEach((row) => {
    const cb = row.querySelector('input[type="checkbox"]');
    const b = row.querySelector('b');
    if (cb && b) {
      cb.checked = true;
      _reportSelectedTypes.add(b.textContent.trim());
    }
  });
  updateReportSummary();
}

function reportClearAllTypes() {
  _reportSelectedTypes = new Set();
  document.querySelectorAll('#report-type-picker input[type="checkbox"]').forEach((cb) => {
    cb.checked = false;
  });
  updateReportSummary();
}

async function reportScanFolders() {
  const el = document.getElementById('report-folder-picker');
  el.innerHTML = '<p class="muted">Scanning folders...</p>';
  try {
    const j = await api('/api/folders/scan', postOpts({}));
    if (!j.ok || !j.folders || j.folders.length === 0) {
      el.innerHTML = '<div class="badge warn">No folders found — extract data first.</div>';
      return;
    }
    _reportFolderTree = j.folders;
    _reportSelectedFolders = new Set();
    j.folders.forEach((node) => _reportSelectedFolders.add(node.path));
    renderReportFolders(j.folders);
  } catch (e) {
    el.innerHTML = '<div class="badge err">Error: ' + escapeHtml(e.message) + '</div>';
  }
}

function renderReportFolderNode(node, container) {
  const row = document.createElement('div');
  row.style.cssText = 'margin-left:' + (node.depth * 20) + 'px;display:flex;align-items:center;gap:12px;padding:8px 12px;background:rgba(0,0,0,0.25);border:1px solid var(--border);border-radius:8px;margin-bottom:6px';

  const cb = document.createElement('input');
  cb.type = 'checkbox';
  cb.checked = _reportSelectedFolders.has(node.path);
  cb.dataset.path = node.path;
  cb.style.cssText = 'width:20px;height:20px;accent-color:var(--accent)';
  cb.onchange = function () {
    if (this.checked) _reportSelectedFolders.add(node.path);
    else _reportSelectedFolders.delete(node.path);
    updateReportSummary();
  };
  row.appendChild(cb);

  const lbl = document.createElement('div');
  lbl.style.flex = '1';
  lbl.innerHTML = '<b>📁 ' + escapeHtml(node.name) + '</b>' +
    '<div class="muted" style="font-size:13px">' +
    node.file_count + ' files · ' + escapeHtml(node.total_size_human) +
    '</div>';
  row.appendChild(lbl);

  container.appendChild(row);

  (node.children || []).forEach((c) => renderReportFolderNode(c, container));
}

function renderReportFolders(folders) {
  const el = document.getElementById('report-folder-picker');
  el.innerHTML = '';
  folders.forEach((node) => renderReportFolderNode(node, el));
  updateReportSummary();
}

function reportSelectAllFolders() {
  _reportSelectedFolders.clear();
  document.querySelectorAll('#report-folder-picker input[type="checkbox"]').forEach((cb) => {
    cb.checked = true;
    _reportSelectedFolders.add(cb.dataset.path);
  });
  updateReportSummary();
}

function reportClearAllFolders() {
  _reportSelectedFolders.clear();
  document.querySelectorAll('#report-folder-picker input[type="checkbox"]').forEach((cb) => {
    cb.checked = false;
  });
  updateReportSummary();
}

function updateReportSummary() {
  const el = document.getElementById('report-summary');
  if (!el) return;
  el.innerHTML =
    'Selected: <b>' + _reportSelectedTypes.size + '</b> data type(s) · ' +
    '<b>' + _reportSelectedFolders.size + '</b> folder(s).';
}

async function generateReport() {
  const out = document.getElementById('report-output');
  out.style.display = 'block';

  if (_reportSelectedTypes.size === 0 && _reportSelectedFolders.size === 0) {
    out.textContent = 'Select at least one data type or folder.';
    toast('Nothing selected', 'err');
    return;
  }

  const payload = {
    types: Array.from(_reportSelectedTypes),
    folders: Array.from(_reportSelectedFolders),
  };

  const handle = startProgressDisplay(out, 'Generating reports (PDF + TXT + JSON)');
  try {
    const j = await api('/api/report/generate', postOpts(payload));
    stopProgressDisplay(handle);
    out.textContent = j.log || j.error || '(no output)';

    if (j.ok) {
      const token = j.token || Date.now();
      ['pdf', 'txt', 'json'].forEach((k) => {
        const el = document.getElementById('dl-' + k);
        if (el) el.href = '/api/report/download/' + k + '?v=' + token;
      });
      out.textContent += '\n\nDownload links refreshed. Click download below.';
      toast('Reports generated — click download', 'ok');
    } else {
      toast('Report failed', 'err');
    }
  } catch (e) {
    stopProgressDisplay(handle);
    out.textContent = 'Error: ' + e.message;
    toast('Report failed', 'err');
  }
}

/* ============================================================
   CHAIN OF CUSTODY
   ============================================================ */
async function loadCoC() {
  const j = await api('/api/coc');
  const el = document.getElementById('coc-output');
  if (el) {
    el.style.display = 'block';
    el.textContent = j.text || '(empty)';
  }
}

async function verifyCoC() {
  const j = await api('/api/coc/verify');
  toast(j.ok ? 'Chain VERIFIED' : 'Chain TAMPERED', j.ok ? 'ok' : 'err');
}

/* ============================================================
   WIRELESS ADB
   ============================================================ */
function wirelessShowQR() {
  document.getElementById('wireless-qr-panel').style.display = 'block';
  document.getElementById('wireless-code-panel').style.display = 'none';
  toast('QR pairing is experimental — pairing code is recommended', 'warn');
}

function wirelessShowCode() {
  document.getElementById('wireless-qr-panel').style.display = 'none';
  document.getElementById('wireless-code-panel').style.display = 'block';
}

async function wirelessNetworkInfo() {
  const el = document.getElementById('wireless-net-status');
  if (!el) return;
  el.innerHTML = '<p class="muted">Detecting Kali network...</p>';
  try {
    const j = await api('/api/wireless/network');
    if (j.ok) {
      el.innerHTML =
        '<div class="kv"><span>Kali IP</span><span class="mono">' +
          escapeHtml(j.host_ip || '—') + '</span></div>' +
        '<div class="kv"><span>Subnet</span><span class="mono">' +
          escapeHtml(j.host_subnet || '—') + '</span></div>' +
        '<div class="kv"><span>Status</span><span>' +
          '<span class="badge ok">Online</span></span></div>';
    } else {
      el.innerHTML = '<div class="badge err">Could not detect network</div>';
    }
  } catch (e) {
    el.innerHTML = '<div class="badge err">Network error</div>';
  }
}

async function wirelessGenerateQR() {
  const host = document.getElementById('wireless-host').value.trim();
  const port = parseInt(document.getElementById('wireless-port').value) || 37000;
  const password = document.getElementById('wireless-password').value.trim() || 'mfx-pair';
  const result = document.getElementById('wireless-qr-result');
  result.innerHTML = '<p class="muted">Generating QR code...</p>';

  try {
    const j = await api('/api/wireless/qr',
      postOpts({ host, port, password }));
    if (!j.ok) {
      result.innerHTML = '<div class="badge err">Error: ' +
        escapeHtml(j.error || 'unknown') + '</div>';
      return;
    }
    let html = '';
    if (j.qr_data_uri) {
      html += '<div style="background:#fff;padding:20px;border-radius:12px;display:inline-block">';
      html += '<img src="' + j.qr_data_uri + '" alt="QR" style="width:280px;height:280px;display:block">';
      html += '</div>';
    } else {
      html += '<div class="badge warn">QR library not installed (pip install qrcode)</div>';
    }
    html += '<div style="margin-top:16px;text-align:left;max-width:520px;margin-inline:auto">';
    html += '<div class="kv"><span>Kali Host</span><span class="mono">' + escapeHtml(j.host) + '</span></div>';
    html += '<div class="kv"><span>Service</span><span class="mono">' + escapeHtml(j.service_name) + '</span></div>';
    html += '<div class="kv"><span>Password</span><span class="mono">' + escapeHtml(j.password) + '</span></div>';
    html += '</div>';
    html += '<div style="margin-top:16px;padding:14px;background:rgba(239,68,68,0.1);' +
            'border:1px solid rgba(239,68,68,0.35);border-radius:10px;text-align:left">';
    html += '<strong style="color:var(--red)">⚠ This QR will not pair automatically</strong>';
    html += '<p class="muted" style="margin-top:8px">Android needs a real mDNS service, ';
    html += 'which this tool doesn\'t provide. Use the pairing code method instead.</p>';
    html += '</div>';
    result.innerHTML = html;
    toast('QR generated (experimental)', 'warn');
  } catch (e) {
    result.innerHTML = '<div class="badge err">Failed: ' + escapeHtml(e.message) + '</div>';
  }
}

async function wirelessPair() {
  const host = document.getElementById('pair-host').value.trim();
  const port = parseInt(document.getElementById('pair-port').value);
  const code = document.getElementById('pair-code').value.trim();
  const out = document.getElementById('pair-output');
  out.style.display = 'block';
  if (!host || !port || !code) {
    out.textContent = 'Fill in host, port, and code.';
    return;
  }
  out.textContent = 'Pairing with ' + host + ':' + port + ' ...';
  try {
    const j = await api('/api/wireless/pair',
      postOpts({ host, port, code }));
    out.textContent = j.output || j.error || '(no output)';
    if (j.ok) {
      toast('Device paired successfully', 'ok');
      document.getElementById('conn-host').value = host;
    } else {
      toast('Pairing failed', 'err');
    }
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
  }
}

async function wirelessCheckNetwork() {
  const host = document.getElementById('pair-host').value.trim();
  const out = document.getElementById('net-check-output');
  out.style.display = 'block';
  if (!host) {
    out.textContent = 'Enter the phone IP first.';
    return;
  }
  out.textContent = 'Checking ' + host + ' ...';
  try {
    const j = await api('/api/wireless/check', postOpts({ phone_ip: host }));
    out.textContent = j.message || j.error || 'Unknown result';
    if (j.ok && !j.warn) toast('Same network', 'ok');
    else if (j.warn) toast('Same subnet, no ping reply', 'warn');
    else toast('Not on same network', 'err');
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
  }
}

async function wirelessScanPorts() {
  const host = document.getElementById('pair-host').value.trim();
  const out = document.getElementById('pair-output');
  out.style.display = 'block';
  if (!host) {
    out.textContent = 'Enter the phone IP first.';
    return;
  }
  out.textContent = 'Scanning ' + host + ' ...';
  try {
    const j = await api('/api/wireless/scan', postOpts({ host }));
    if (j.ok && j.open_ports && j.open_ports.length) {
      out.textContent = 'Open ports on ' + host + ':\n\n' +
        j.open_ports.map((p) => '  ' + p).join('\n');
    } else {
      out.textContent = 'No open ADB ports found on ' + host;
    }
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
  }
}

async function wirelessConnect() {
  const host = document.getElementById('conn-host').value.trim();
  const port = parseInt(document.getElementById('conn-port').value);
  const out = document.getElementById('wireless-output');
  out.style.display = 'block';
  if (!host || !port) {
    out.textContent = 'Enter host and port.';
    return;
  }
  out.textContent = 'Connecting to ' + host + ':' + port + ' ...';
  try {
    const j = await api('/api/wireless/connect',
      postOpts({ host, port }));
    out.textContent = j.output || j.error || '(no output)';
    if (j.ok) {
      toast('Connected to ' + host + ':' + port, 'ok');
      wirelessNetworkInfo();
    } else {
      toast('Connection failed', 'err');
    }
  } catch (e) {
    out.textContent = 'Error: ' + e.message;
  }
}

/* ============================================================
   INIT
   ============================================================ */
document.addEventListener('DOMContentLoaded', () => {
  // Auto-scan devices on load
  scanDevices().catch(() => {});
});
