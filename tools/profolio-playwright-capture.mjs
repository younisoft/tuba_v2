import { chromium } from 'playwright-core';
import { mkdir, writeFile } from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const OUT = path.join(ROOT, 'product-audit');
const SHOTS = path.join(ROOT, 'screenshots');
const DATA = path.join(OUT, 'report-assets');
const CHROME = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const EMAIL = process.env.PROFOLIO_EMAIL;
const PASSWORD = process.env.PROFOLIO_PASSWORD;
const START_URL = 'https://profolio.bayut.sa/en/dashboard';

if (!EMAIL || !PASSWORD) throw new Error('Set PROFOLIO_EMAIL and PROFOLIO_PASSWORD.');

const safeName = (value) =>
  (value || 'page')
    .replace(/^https?:\/\/[^/]+/i, '')
    .replace(/[?#].*$/, '')
    .replace(/^\/+|\/+$/g, '')
    .replace(/[^a-z0-9]+/gi, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase()
    .slice(0, 90) || 'dashboard';

async function pageSummary(page) {
  return page.evaluate(() => {
    const txt = (el) => (el.innerText || el.textContent || '').replace(/\s+/g, ' ').trim();
    const visible = (el) => {
      const s = getComputedStyle(el);
      const r = el.getBoundingClientRect();
      return s.display !== 'none' && s.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    };
    const pick = (sel, limit = 100) => [...document.querySelectorAll(sel)].filter(visible).slice(0, limit).map((el) => ({
      tag: el.tagName.toLowerCase(),
      text: txt(el).slice(0, 200),
      href: el.href || el.getAttribute('href') || '',
      type: el.getAttribute('type') || '',
      role: el.getAttribute('role') || '',
      aria: el.getAttribute('aria-label') || '',
      placeholder: el.getAttribute('placeholder') || '',
      name: el.getAttribute('name') || '',
    })).filter((x) => x.text || x.href || x.aria || x.placeholder || x.name);
    return {
      url: location.href,
      title: document.title,
      headings: pick('h1,h2,h3,h4', 80),
      links: pick('a[href]', 220),
      buttons: pick('button,[role=button]', 180),
      inputs: pick('input,select,textarea', 140),
      tables: [...document.querySelectorAll('table')].filter(visible).map((table) => ({
        headers: [...table.querySelectorAll('th')].map(txt).filter(Boolean).slice(0, 30),
        rows: table.querySelectorAll('tbody tr').length || table.querySelectorAll('tr').length,
      })),
      cards: [...document.querySelectorAll('[class*=card i], [class*=stat i], [class*=metric i], [class*=panel i]')]
        .filter(visible).slice(0, 100).map((el) => txt(el).slice(0, 260)).filter(Boolean),
      charts: [...document.querySelectorAll('canvas,svg,[class*=chart i],[class*=graph i]')].filter(visible).length,
      text: txt(document.body).slice(0, 16000),
    };
  });
}

async function redactPII(page) {
  await page.evaluate(() => {
    const redact = (value) => value
      .replace(/[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,}/gi, '[email redacted]')
      .replace(/\+?\d[\d\s().-]{7,}\d/g, '[phone redacted]');
    const walker = document.createTreeWalker(document.body, NodeFilter.SHOW_TEXT);
    const nodes = [];
    while (walker.nextNode()) nodes.push(walker.currentNode);
    for (const node of nodes) {
      const next = redact(node.nodeValue || '');
      if (next !== node.nodeValue) node.nodeValue = next;
    }
    for (const input of document.querySelectorAll('input, textarea')) {
      const value = input.value || input.getAttribute('value') || '';
      const next = redact(value);
      if (next !== value) {
        input.value = next;
        input.setAttribute('value', next);
      }
    }
  }).catch(() => {});
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

async function clickDialogs(page, slug, record) {
  const labels = await page.locator('button, [role=button]').evaluateAll((els) => els
    .filter((el) => {
      const r = el.getBoundingClientRect();
      const s = getComputedStyle(el);
      const t = (el.innerText || el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim();
      return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && t && /filter|search|export|import|sort|more|action|settings|view|details|edit|add|create|upload/i.test(t);
    })
    .slice(0, 10)
    .map((el) => (el.innerText || el.textContent || el.getAttribute('aria-label') || '').replace(/\s+/g, ' ').trim().slice(0, 80)));
  let index = 0;
  for (const label of labels) {
    try {
      const control = page.getByText(label, { exact: true }).first();
      await control.click({ timeout: 1500 });
      await page.waitForTimeout(800);
      await redactPII(page);
      const modal = page.locator('[role=dialog], .modal, [class*=modal i], [class*=popover i], [class*=dropdown i], [class*=menu i]').first();
      if (await modal.count()) {
        const text = (await modal.innerText({ timeout: 1000 }).catch(() => '')).replace(/\s+/g, ' ').trim();
        if (text) {
          const file = `${slug}-dialog-${String(++index).padStart(2, '0')}.png`;
          await page.screenshot({ path: path.join(SHOTS, file), fullPage: true });
          record.dialogs.push({ trigger: label, screenshot: file, text: text.slice(0, 3000) });
        }
      }
      await page.keyboard.press('Escape');
    } catch {}
  }
}

async function login(page) {
  await page.goto(START_URL, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);
  await redactPII(page);
  await page.screenshot({ path: path.join(SHOTS, '00-login-initial.png'), fullPage: true });
  if (/captchaChallenge/i.test(page.url())) {
    console.error('CAPTCHA detected. Complete it in the Chrome window; waiting up to 180 seconds.');
    await page.waitForURL((url) => !/captchaChallenge/i.test(url.href), { timeout: 180000 });
  }
  const emailLogin = page.getByText(/email login|login with email|email/i).first();
  await emailLogin.click({ timeout: 4000 }).catch(() => {});
  await page.waitForTimeout(800);
  const emailInput = page.locator('input[type=email], input[name*=email i], input[placeholder*=email i], input[type=text]').first();
  const passInput = page.locator('input[type=password], input[name*=password i], input[placeholder*=password i]').first();
  await emailInput.fill(EMAIL, { timeout: 10000 });
  await passInput.fill(PASSWORD, { timeout: 10000 });
  await page.locator('button, input[type=submit], [role=button]').filter({ hasText: /log\s*in|sign in|continue/i }).first().click({ timeout: 8000 });
  await page.waitForLoadState('domcontentloaded').catch(() => {});
  await page.waitForTimeout(5000);
  if (/captchaChallenge/i.test(page.url())) {
    console.error('CAPTCHA detected after submit. Complete it in the Chrome window; waiting up to 180 seconds.');
    await page.waitForURL((url) => !/captchaChallenge/i.test(url.href), { timeout: 180000 });
    await page.waitForTimeout(4000);
  }
  await redactPII(page);
  await page.screenshot({ path: path.join(SHOTS, '01-dashboard-after-login.png'), fullPage: true });
}

async function main() {
  await mkdir(SHOTS, { recursive: true });
  await mkdir(DATA, { recursive: true });
  const browser = await chromium.launch({
    executablePath: CHROME,
    headless: process.env.PROFOLIO_HEADFUL !== '1',
    args: ['--disable-blink-features=AutomationControlled', '--window-size=1440,1000'],
  });
  const context = await browser.newContext({ viewport: { width: 1440, height: 1000 }, locale: 'en-US' });
  const page = await context.newPage();
  try {
    await login(page);
    const navLabels = [
      'Overview',
      'Post Listing',
      'My Listings',
      'Credits Usage',
      'TruLeads',
      'Agent Performance Reports',
      'Agency Staff',
      'Settings',
      'Credits & Packages',
    ];
    const records = [];
    for (const label of navLabels) {
      try {
        await page.getByText(label, { exact: true }).first().click({ timeout: 5000 });
        await page.waitForLoadState('domcontentloaded').catch(() => {});
        await page.waitForTimeout(3500);
        if ((await page.locator('text=Failed to fetch').count()) > 0) {
          await page.getByText('Retry', { exact: true }).click({ timeout: 1500 }).catch(() => {});
          await page.waitForTimeout(3500);
        }
        await redactPII(page);
        const current = await pageSummary(page);
        const slug = `${String(records.length + 1).padStart(2, '0')}-${safeName(current.url || label)}`;
        const shot = `${slug}.png`;
        await page.screenshot({ path: path.join(SHOTS, shot), fullPage: true });
        const record = { ...current, navLabel: label, screenshot: shot, dialogs: [] };
        await clickDialogs(page, slug, record);
        records.push(record);
      } catch (err) {
        records.push({
          navLabel: label,
          url: page.url(),
          title: await page.title().catch(() => ''),
          screenshot: '',
          text: `Navigation failed: ${err.message}`,
          headings: [],
          links: [],
          buttons: [],
          inputs: [],
          tables: [],
          cards: [],
          charts: 0,
          dialogs: [],
        });
      }
    }
    const first = records[0] || await pageSummary(page);
    const queue = [...internalUrls(first)];
    const seen = new Set();
    for (let i = 0; i < queue.length && seen.size < 70; i++) {
      const url = queue[i];
      if (seen.has(url)) continue;
      seen.add(url);
      await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 }).catch(() => {});
      await page.waitForTimeout(2500);
      await redactPII(page);
      const current = await pageSummary(page);
      const slug = `${String(seen.size).padStart(2, '0')}-${safeName(current.url)}`;
      const shot = `${slug}.png`;
      await page.screenshot({ path: path.join(SHOTS, shot), fullPage: true });
      const record = { ...current, screenshot: shot, dialogs: [] };
      await clickDialogs(page, slug, record);
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
  } finally {
    await browser.close();
  }
}

main().catch((err) => {
  console.error(err.stack || err.message);
  process.exitCode = 1;
});
