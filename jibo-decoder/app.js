const serialInput = document.getElementById('serial-input');
const modelInput = document.getElementById('model-input');
const decodeBtn = document.getElementById('decode-btn');
const clearBtn = document.getElementById('clear-btn');
const resultsEl = document.getElementById('results');
const themeToggle = document.getElementById('theme-toggle');
const themeMenu = document.getElementById('theme-menu');
const themeKey = 'jibo-revival-theme';

function applyTheme(theme) {
  if (theme !== 'aero') {
    document.body.removeAttribute('data-theme');
  } else {
    document.body.dataset.theme = theme;
  }
  localStorage.setItem(themeKey, theme);
}

applyTheme(localStorage.getItem(themeKey) === 'aero' ? 'aero' : 'default');

function setMenuOpen(open) {
  if (!themeMenu || !themeToggle) return;
  themeMenu.hidden = !open;
  themeToggle.setAttribute('aria-expanded', String(open));
}

if (themeToggle && themeMenu) {
  themeToggle.addEventListener('click', () => {
    setMenuOpen(themeMenu.hidden);
  });

  themeMenu.addEventListener('click', (event) => {
    const button = event.target.closest('[data-theme]');
    if (!button) return;
    applyTheme(button.dataset.theme);
    setMenuOpen(false);
  });

  document.addEventListener('click', (event) => {
    if (themeMenu.hidden) return;
    if (themeMenu.contains(event.target) || themeToggle.contains(event.target)) return;
    setMenuOpen(false);
  });
}

function renderField(label, value, { mono = false, badge = null } = {}) {
  return `
    <div class="result-field">
      <span class="result-label">${label}</span>
      <span class="result-value${mono ? ' mono' : ''}">${escapeHtml(value)}${badge ? ` <span class="chip">${escapeHtml(badge)}</span>` : ''}</span>
    </div>
  `;
}

function renderNote(text) {
  return `<p class="result-note">${escapeHtml(text)}</p>`;
}

function renderModelBlock(model, title = 'Model configuration') {
  const notes = (model.notes || []).map(renderNote).join('');
  return `
    <article class="result-block">
      <h3>${title}</h3>
      <p class="result-summary">${escapeHtml(model.summary)}</p>
      <div class="result-grid">
        ${renderField('Model number', model.formatted, { mono: true })}
        ${renderField('Color', `${model.color.label} (${model.color.code})`)}
        ${renderField('Generation', `${model.model.label} (${model.model.code})`)}
        ${renderField('Hardware block', `${model.future.label} (${model.future.code})`)}
        ${renderField('Destination', `${model.country.label} (${model.country.code})`)}
      </div>
      ${notes}
    </article>
  `;
}

function renderSerialBlock(serial) {
  const refurb = serial.refurbNote ? renderNote(serial.refurbNote) : '';
  return `
    <article class="result-block">
      <h3>Serial decode</h3>
      <p class="result-summary">${escapeHtml(serial.summary)}</p>
      <div class="result-grid">
        ${renderField('Serial number', serial.formatted, { mono: true })}
        ${renderField('Manufacturer', `${serial.manufacturer.label} (${serial.manufacturer.code})`)}
        ${renderField('Manufacture date', serial.date.formatted)}
        ${renderField('Build sequence', serial.sequence.label, { mono: true, badge: `#${serial.sequence.code}` })}
      </div>
      ${refurb}
    </article>
    ${renderModelBlock(serial.model, 'Embedded model')}
  `;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function showError(message) {
  resultsEl.classList.remove('hidden');
  resultsEl.innerHTML = `
    <div class="panel error-panel" role="alert">
      <h2>Could not decode</h2>
      <p>${escapeHtml(message)}</p>
    </div>
  `;
}

function showResults(result) {
  resultsEl.classList.remove('hidden');

  let html = '';

  if (result.warning) {
    html += `
      <div class="panel warning-panel" role="status">
        <p>${escapeHtml(result.warning)}</p>
      </div>
    `;
  }

  if (result.type === 'serial' || result.type === 'both') {
    html += `<div class="panel results-panel">${renderSerialBlock(result.serial)}</div>`;
  } else if (result.type === 'model') {
    html += `<div class="panel results-panel">${renderModelBlock(result.model)}</div>`;
  }

  resultsEl.innerHTML = html;
}

function runDecode() {
  const result = decode({
    serial: serialInput.value,
    model: modelInput.value,
  });

  if (!result.ok) {
    showError(result.error);
    return;
  }

  showResults(result);
}

function clearAll() {
  serialInput.value = '';
  modelInput.value = '';
  resultsEl.classList.add('hidden');
  resultsEl.innerHTML = '';
  serialInput.focus();
}

decodeBtn.addEventListener('click', runDecode);
clearBtn.addEventListener('click', clearAll);

[serialInput, modelInput].forEach((input) => {
  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      runDecode();
    }
  });
});

if (window.location.hash === '#example') {
  serialInput.value = 'BOJW-1000-0017-0212-0001';
  runDecode();
}
