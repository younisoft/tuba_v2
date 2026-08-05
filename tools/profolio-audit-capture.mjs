import { spawn } from 'node:child_process';
import { mkdir, writeFile, rm } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import path from 'node:path';
import WebSocket from 'ws';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'product-audit');
const SHOTS = path.join(ROOT, 'screenshots');
const DATA = path.join(OUT, 'report-assets');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMAIL = process.env.PROFOLIO_EMAIL;
const PASSWORD = process.env.PROFOLIO_PASSWORD;
const START_URL = 'https://profolio.bayut.sa/en/dashboard';
const PORT = Number(process.env.PROFOLIO_DEBUG_PORT || 9333);

if (!EMAIL || !PASSWORD) {
  throw new Error('Set PROFOLIO_EMAIL and PROFOLIO_PASSWORD in the environment.');
}

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
const safeName = (value) =>
  (value || 'page')
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[?#].*$/, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 90) || 'dashboard';

class CDP {
  constructor(wsUrl) {
    this.ws = new WebSocket(wsUrl);
    this.id = 0;
    this.pending = new Map();
    this.events = [];
    this.ws.onmessage = (msg) => {
      const data = JSON.parse(msg.data);
      if (data.id && this.pending.has(data.id)) {
        const { resolve, reject } = this.pending.get(data.id);
        this.pending.delete(data.id);
        data.error ? reject(new Error(JSON.stringify(data.error))) : resolve(data.result);
      } else if (data.method) {
        this.events.push(data);
      }
    };
  }
  async open() {
    while (this.ws.readyState === WebSocket.CONNECTING) await delay(50);
  }
  send(method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  sendSession(sessionId, method, params = {}) {
    const id = ++this.id;
    this.ws.send(JSON.stringify({ id, sessionId, method, params }));
    return new Promise((resolve, reject) => this.pending.set(id, { resolve, reject }));
  }
  close() {
    this.ws.close();
  }
}

async function fetchJson(url) {
  const res = await fetch(url);
  if (!res.ok) throw new Error(`${url} -> ${res.status}`);
  return res.json();
}

async function connect() {
  const deadline = Date.now() + 15000;
  let lastError = '';
  while (Date.now() < deadline) {
    try {
      const pages = await fetchJson(`http://127.0.0.1:${PORT}/json`);
      const page = pages.find((p) => p.type === 'page') || pages[0];
      if (page?.webSocketDebuggerUrl) {
        const cdp = new CDP(page.webSocketDebuggerUrl);
        await cdp.open();
        await cdp.send('Page.enable');
        await cdp.send('Runtime.enable');
        await cdp.send('Network.enable');
        await cdp.send('Emulation.setDeviceMetricsOverride', {
          width: 1440,
          height: 1000,
          deviceScaleFactor: 1,
          mobile: false,
        });
        return cdp;
      }
    } catch (err) {
      lastError = String(err?.message || err || '');
    }
    try {
      const version = await fetchJson(`http://127.0.0.1:${PORT}/json/version`);
      if (version?.webSocketDebuggerUrl) {
        const browser = new CDP(version.webSocketDebuggerUrl);
        await browser.open();
        const target = await browser.send('Target.createTarget', { url: 'about:blank' });
        const attached = await browser.send('Target.attachToTarget', { targetId: target.targetId, flatten: true });
        const sessionId = attached.sessionId;
        const page = {
          send: (method, params = {}) => browser.sendSession(sessionId, method, params),
          close: () => browser.close(),
        };
        await page.send('Page.enable');
        await page.send('Runtime.enable');
        await page.send('Network.enable');
        await page.send('Emulation.setDeviceMetricsOverride', {
          width: 1440,
          height: 1000,
          deviceScaleFactor: 1,
          mobile: false,
        });
        return page;
      }
    } catch (err) {
      lastError = String(err?.message || err || '');
      await delay(250);
    }
  }
  throw new Error(`Could not connect to Chrome DevTools. ${lastError}`);
}

async function evaluate(cdp, expression) {
  const result = await cdp.send('Runtime.evaluate', {
    expression,
    awaitPromise: true,
    returnByValue: true,
    timeout: 15000,
  });
  if (result.exceptionDetails) {
    throw new Error(result.exceptionDetails.text || 'Runtime evaluation failed');
  }
  return result.result.value;
}

async function navigate(cdp, url) {
  await cdp.send('Page.navigate', { url });
  await delay(3500);
  await evaluate(cdp, `new Promise(r => {
    if (document.readyState === 'complete') return r(true);
    window.addEventListener('load', () => r(true), { once: true });
    setTimeout(() => r(false), 8000);
  })`);
  await delay(1200);
}

async function screenshot(cdp, file) {
  const shot = await cdp.send('Page.captureScreenshot', { format: 'png', captureBeyondViewport: true });
  await writeFile(file, Buffer.from(shot.data, 'base64'));
}

const pageSummaryScript = `(() => {
  const txt = (el) => (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
  const visible = (el) => {
    const s = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
  };
  const pick = (sel, limit = 80) => [...document.querySelectorAll(sel)].filter(visible).slice(0, limit).map((el) => ({
    tag: el.tagName.toLowerCase(),
    text: txt(el).slice(0, 180),
    href: el.href || el.getAttribute('href') || '',
    type: el.getAttribute('type') || '',
    role: el.getAttribute('role') || '',
    aria: el.getAttribute('aria-label') || '',
    placeholder: el.getAttribute('placeholder') || '',
    name: el.getAttribute('name') || '',
  })).filter((x) => x.text || x.href || x.aria || x.placeholder || x.name);
  const headings = pick('h1,h2,h3,h4', 60);
  const links = pick('a[href]', 160);
  const buttons = pick('button,[role=button]', 140);
  const inputs = pick('input,select,textarea', 100);
  const tables = [...document.querySelectorAll('table')].filter(visible).map((table) => ({
    headers: [...table.querySelectorAll('th')].map(txt).filter(Boolean).slice(0, 20),
    rows: table.querySelectorAll('tbody tr').length || table.querySelectorAll('tr').length,
  }));
  const cards = [...document.querySelectorAll('[class*=card i], [class*=stat i], [class*=metric i]')].filter(visible).slice(0, 80).map((el) => txt(el).slice(0, 220)).filter(Boolean);
  const charts = [...document.querySelectorAll('canvas,svg,[class*=chart i],[class*=graph i]')].filter(visible).length;
  const text = txt(document.body).slice(0, 12000);
  return { url: location.href, title: document.title, headings, links, buttons, inputs, tables, cards, charts, text };
})()`;

async function login(cdp) {
  await navigate(cdp, START_URL);
  await screenshot(cdp, path.join(SHOTS, '00-login-initial.png'));
  await evaluate(cdp, `(() => {
    const clickText = ['email login', 'email', 'login with email', 'sign in with email'];
    const candidates = [...document.querySelectorAll('button,a,[role=button]')];
    const target = candidates.find(el => clickText.some(t => (el.innerText || el.textContent || '').toLowerCase().includes(t)));
    if (target) target.click();
    return !!target;
  })()`);
  await delay(1000);
  await evaluate(cdp, `(() => {
    const email = ${JSON.stringify(EMAIL)};
    const password = ${JSON.stringify(PASSWORD)};
    const inputs = [...document.querySelectorAll('input')];
    const emailInput = inputs.find(i => /email|text/.test((i.type || '').toLowerCase()) || /email/i.test(i.name + i.placeholder));
    const passInput = inputs.find(i => (i.type || '').toLowerCase() === 'password' || /password/i.test(i.name + i.placeholder));
    const set = (input, value) => {
      input.focus();
      input.value = value;
      input.dispatchEvent(new Event('input', { bubbles: true }));
      input.dispatchEvent(new Event('change', { bubbles: true }));
    };
    if (emailInput) set(emailInput, email);
    if (passInput) set(passInput, password);
    return { email: !!emailInput, password: !!passInput, inputs: inputs.length };
  })()`);
  await screenshot(cdp, path.join(SHOTS, '00-login-filled.png'));
  await evaluate(cdp, `(() => {
    const controls = [...document.querySelectorAll('button,input[type=submit],[role=button]')];
    const target = controls.find(el => /login|sign in|continue/i.test(el.innerText || el.value || el.getAttribute('aria-label') || '')) || controls[0];
    if (target) target.click();
    return !!target;
  })()`);
  await delay(6000);
  await screenshot(cdp, path.join(SHOTS, '01-dashboard-after-login.png'));
}

function internalUrls(summary) {
  const urls = [];
  for (const link of summary.links || []) {
    try {
      const u = new URL(link.href, summary.url);
      if (u.hostname === 'profolio.bayut.sa' && u.pathname.startsWith('/en/')) {
        u.hash = '';
        urls.push(u.toString());
      }
    } catch {}
  }
  return [...new Set(urls)];
}

async function exploreDialogs(cdp, slug, pageRecord) {
  const labels = await evaluate(cdp, `(() => [...document.querySelectorAll('button,[role=button]')]
    .filter(el => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      const t = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim();
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && t && /filter|search|export|import|sort|more|action|settings|view|details|edit|add|create|upload/i.test(t);
    })
    .slice(0, 12)
    .map((el, index) => ({ index, text: (el.innerText || el.textContent || el.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim().slice(0, 80) })))()`);
  let shotIndex = 0;
  for (const item of labels) {
    const clicked = await evaluate(cdp, `(() => {
      const els = [...document.querySelectorAll('button,[role=button]')].filter(el => {
        const r = el.getBoundingClientRect();
        const s = getComputedStyle(el);
        const t = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').replace(/\\s+/g, ' ').trim();
        return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && t === ${JSON.stringify(item.text)};
      });
      const el = els[0];
      if (!el) return false;
      el.scrollIntoView({ block: 'center', inline: 'center' });
      el.click();
      return true;
    })()`);
    if (!clicked) continue;
    await delay(900);
    const modalText = await evaluate(cdp, `(() => {
      const txt = (el) => (el.innerText || el.textContent || '').replace(/\\s+/g, ' ').trim();
      const modal = document.querySelector('[role=dialog], .modal, [class*=modal i], [class*=popover i], [class*=dropdown i], [class*=menu i]');
      return modal ? txt(modal).slice(0, 3000) : '';
    })()`);
    if (modalText) {
      const file = `${slug}-dialog-${String(++shotIndex).padStart(2, '0')}.png`;
      await screenshot(cdp, path.join(SHOTS, file));
      pageRecord.dialogs.push({ trigger: item.text, screenshot: file, text: modalText });
    }
    await evaluate(cdp, `(() => {
      document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', code: 'Escape', bubbles: true }));
      const close = [...document.querySelectorAll('button,[role=button]')].find(el => /close|cancel|x/i.test(el.innerText || el.getAttribute('aria-label') || ''));
      if (close) close.click();
      return true;
    })()`);
    await delay(400);
  }
}

async function main() {
  await mkdir(SHOTS, { recursive: true });
  await mkdir(DATA, { recursive: true });
  const profile = path.join(ROOT, '.tmp-profolio-chrome');
  if (existsSync(profile)) await rm(profile, { recursive: true, force: true });
  const chromeArgs = [
    `--remote-debugging-port=${PORT}`,
    '--remote-debugging-address=127.0.0.1',
    `--user-data-dir=${profile}`,
    '--disable-gpu',
    '--disable-blink-features=AutomationControlled',
    '--disable-dev-shm-usage',
    '--no-first-run',
    '--window-size=1440,1000',
    'about:blank',
  ];
  if (process.env.PROFOLIO_HEADFUL !== '1') {
    chromeArgs.splice(3, 0, '--headless=new');
  }
  const chrome = spawn(CHROME, chromeArgs, { stdio: ['ignore', 'pipe', 'pipe'], detached: false });
  chrome.stdout.on('data', (data) => process.stderr.write(String(data)));
  chrome.stderr.on('data', (data) => process.stderr.write(String(data)));

  try {
    const cdp = await connect();
    await login(cdp);
    let summary = await evaluate(cdp, pageSummaryScript);
    const queue = [summary.url, ...internalUrls(summary)];
    const seen = new Set();
    const records = [];
    for (let i = 0; i < queue.length && seen.size < 55; i++) {
      const url = queue[i];
      if (seen.has(url)) continue;
      seen.add(url);
      await navigate(cdp, url);
      const current = await evaluate(cdp, pageSummaryScript);
      const slug = `${String(seen.size).padStart(2, '0')}-${safeName(current.url)}`;
      const shot = `${slug}.png`;
      await screenshot(cdp, path.join(SHOTS, shot));
      const record = { ...current, screenshot: shot, dialogs: [] };
      await exploreDialogs(cdp, slug, record);
      records.push(record);
      for (const found of internalUrls(current)) {
        if (!seen.has(found) && !queue.includes(found)) queue.push(found);
      }
    }
    await writeFile(path.join(DATA, 'capture.json'), JSON.stringify({ capturedAt: new Date().toISOString(), records }, null, 2));
    await writeFile(path.join(DATA, 'pages.csv'), [
      'url,title,screenshot,headings,links,buttons,inputs,tables,charts,dialogs',
      ...records.map((r) => [
        r.url,
        r.title,
        r.screenshot,
        (r.headings || []).map((h) => h.text).join(' | '),
        (r.links || []).length,
        (r.buttons || []).length,
        (r.inputs || []).length,
        (r.tables || []).length,
        r.charts || 0,
        (r.dialogs || []).length,
      ].map((v) => `"${String(v ?? '').replaceAll('"', '""')}"`).join(',')),
    ].join('\n'));
    cdp.close();
  } finally {
    chrome.kill();
  }
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exitCode = 1;
});
