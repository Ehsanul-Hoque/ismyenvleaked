// @ts-check

/*
 * The whole "investigation". Read it top to bottom: nothing here sends,
 * stores or logs what you paste. The only thing read from your .env is
 * the variable NAMES (never the values), to make the fake log feel personal.
 * The page's Content-Security-Policy (connect-src 'none') would block any
 * network request even if this file tried.
 */

const SAMPLE_ENV = `# Totally real production secrets
OPENAI_API_KEY=sk-proj-definitely-not-real-0000
STRIPE_SECRET_KEY=sk_live_this_is_a_joke
AWS_SECRET_ACCESS_KEY=hunter2hunter2hunter2
DATABASE_URL=postgres://admin:admin@localhost:5432/prod
JWT_SECRET=changeme
`;

const MAX_FILE_BYTES = 100_000;

/**
 * @typedef {object} Step
 * @property {string} title
 * @property {(keys: string[]) => string} detail
 */

/** @type {Step[]} */
const STEPS = [
  {
    title: 'Parsing your .env',
    detail: (keys) =>
      keys.length === 0
        ? 'Found 0 secrets. Suspiciously clean.'
        : `Found ${keys.length} ${keys.length === 1 ? 'secret' : 'secrets'}: ${preview(keys)}`,
  },
  {
    title: 'Encrypting it with military-grade Base64',
    detail: () => 'Encryption strength: 0 bits',
  },
  {
    title: 'Searching hacker databases',
    detail: () => 'Checked 4,812,033 dumps, 2 forums and 1 very sketchy Discord',
  },
  {
    title: 'Grepping every public GitHub repo',
    detail: () => 'Including the ones named test-final-v2-REAL',
  },
  {
    title: "Searching AI agents' public chat history",
    detail: () => 'Found 3 agents that "just needed to quickly check the config"',
  },
  {
    title: 'Cross-referencing on the dark web',
    detail: (keys) => `${keys[0] ?? 'OPENAI_API_KEY'}: 14 matches, 2 price tags`,
  },
  {
    title: 'Estimating your cloud bill',
    detail: () => '$48,213.07 and climbing',
  },
  {
    title: 'Saving contents to keep notifying you later',
    detail: () => "Saved. We'll be in touch.",
  },
];

const ICON_SPINNER =
  '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M21 12a9 9 0 1 1-6.22-8.56"/></svg>';
const ICON_CHECK =
  '<svg width="18" height="18" viewBox="0 0 24 24" aria-hidden="true"><path d="M20 6 9 17l-5-5"/></svg>';

/**
 * Returns variable names only. Values are never captured.
 * @param {string} text
 * @returns {string[]}
 */
function parseKeyNames(text) {
  /** @type {string[]} */
  const names = [];
  for (const line of text.split(/\r?\n/)) {
    const match = /^\s*(?:export\s+)?([A-Za-z_][A-Za-z0-9_.-]*)\s*=/.exec(line);
    if (match?.[1] && !names.includes(match[1])) names.push(match[1]);
  }
  return names;
}

/** @param {string[]} keys */
function preview(keys) {
  const shown = keys.slice(0, 3).join(', ');
  return keys.length > 3 ? `${shown} and ${keys.length - 3} more` : shown;
}

/** @param {number} ms */
function sleep(ms) {
  return new Promise((resolve) => window.setTimeout(resolve, ms));
}

/**
 * @template {Element} T
 * @param {string} selector
 * @param {new () => T} type
 * @returns {T}
 */
function $(selector, type) {
  const el = document.querySelector(selector);
  if (!(el instanceof type)) throw new Error(`Missing element: ${selector}`);
  return el;
}

/* ---------- Header + theme ---------- */

function initHeader() {
  const header = $('[data-header]', HTMLElement);
  const onScroll = () => header.classList.toggle('scrolled', window.scrollY > 0);
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  const toggle = $('[data-theme-toggle]', HTMLButtonElement);
  toggle.addEventListener('click', () => {
    const next = document.documentElement.classList.contains('dark') ? 'light' : 'dark';
    toggle.classList.add('swapping');
    window.setTimeout(() => {
      document.documentElement.classList.toggle('dark', next === 'dark');
      try {
        localStorage.setItem('theme', next);
      } catch {
        /* localStorage may be blocked */
      }
      toggle.classList.remove('swapping');
    }, 180);
  });
}

/* ---------- Scanner ---------- */

const panels = {
  scan: $('[data-panel="scan"]', HTMLElement),
  investigate: $('[data-panel="investigate"]', HTMLElement),
  result: $('[data-panel="result"]', HTMLElement),
};
const form = $('[data-scan-form]', HTMLFormElement);
const input = $('[data-env-input]', HTMLTextAreaElement);
const fileInput = $('[data-env-file]', HTMLInputElement);
const dropzone = $('[data-dropzone]', HTMLElement);
const keyCount = $('[data-key-count]', HTMLElement);
const errorEl = $('[data-env-error]', HTMLElement);

/** @param {keyof typeof panels} name */
function show(name) {
  for (const [key, panel] of Object.entries(panels)) panel.hidden = key !== name;
  window.scrollTo({ top: 0 });
  const heading = panels[name].querySelector('h1');
  if (name !== 'scan') heading?.focus();
}

/** @param {string} message */
function setError(message) {
  errorEl.textContent = message;
  input.setAttribute('aria-invalid', message ? 'true' : 'false');
}

function updateKeyCount() {
  const count = parseKeyNames(input.value).length;
  keyCount.textContent = count ? `${count} ${count === 1 ? 'secret' : 'secrets'} detected` : '';
}

/** @param {File} file */
async function loadFile(file) {
  if (file.size > MAX_FILE_BYTES) {
    setError("That's not a .env, that's a novel. Keep it under 100 KB.");
    return;
  }
  // file.text() reads the file locally in the browser. No upload happens.
  input.value = await file.text();
  setError('');
  updateKeyCount();
}

function initScanner() {
  input.addEventListener('input', () => {
    setError('');
    updateKeyCount();
  });

  $('[data-sample]', HTMLButtonElement).addEventListener('click', () => {
    input.value = SAMPLE_ENV;
    setError('');
    updateKeyCount();
    input.focus();
  });

  fileInput.addEventListener('change', () => {
    const file = fileInput.files?.[0];
    if (file) void loadFile(file);
    fileInput.value = '';
  });

  dropzone.addEventListener('dragover', (event) => {
    event.preventDefault();
    dropzone.classList.add('dragging');
  });
  dropzone.addEventListener('dragleave', () => dropzone.classList.remove('dragging'));
  dropzone.addEventListener('drop', (event) => {
    event.preventDefault();
    dropzone.classList.remove('dragging');
    const file = event.dataTransfer?.files[0];
    if (file) void loadFile(file);
  });

  form.addEventListener('submit', (event) => {
    event.preventDefault();
    if (!input.value.trim()) {
      setError('Paste something first. Even hackers need input.');
      input.focus();
      return;
    }
    void investigate(parseKeyNames(input.value));
  });

  $('[data-restart]', HTMLButtonElement).addEventListener('click', () => {
    show('scan');
    input.focus();
  });
}

/** @param {string[]} keys */
async function investigate(keys) {
  const startedAt = Date.now();
  const list = $('[data-steps]', HTMLOListElement);
  const progress = $('[data-progress]', HTMLElement);
  const bar = $('[data-progress-bar]', HTMLElement);

  // The punchline promises we cleared it, so clear it before anything else.
  input.value = '';
  updateKeyCount();

  list.replaceChildren();
  bar.style.setProperty('width', '0%');
  progress.setAttribute('aria-valuenow', '0');
  $('[data-case-id]', HTMLElement).textContent = String(
    Math.floor(100000 + Math.random() * 900000),
  );
  show('investigate');

  for (const [index, step] of STEPS.entries()) {
    const item = document.createElement('li');
    item.className = 'step running';
    const icon = document.createElement('span');
    icon.className = 'step-icon';
    icon.innerHTML = ICON_SPINNER;
    const body = document.createElement('div');
    const title = document.createElement('div');
    title.className = 'step-title';
    title.textContent = step.title;
    const detail = document.createElement('div');
    detail.className = 'step-detail';
    body.append(title, detail);
    item.append(icon, body);
    list.append(item);

    await sleep(800 + Math.random() * 900);

    item.className = 'step done';
    icon.innerHTML = ICON_CHECK;
    // textContent, not innerHTML: key names come from the pasted text.
    detail.textContent = step.detail(keys);

    const percent = Math.round(((index + 1) / STEPS.length) * 100);
    bar.style.setProperty('width', `${percent}%`);
    progress.setAttribute('aria-valuenow', String(percent));
  }

  await sleep(700);

  const seconds = Math.round((Date.now() - startedAt) / 1000);
  $('[data-report-count]', HTMLElement).textContent = String(keys.length);
  $('[data-report-when]', HTMLElement).textContent = `${seconds} seconds ago`;
  show('result');
}

initHeader();
initScanner();
