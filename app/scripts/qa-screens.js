// Screen-by-screen check for older users. Build the web copy and serve it first:
//   npx expo export --platform web --output-dir /tmp/qa-web && python3 -m http.server 8095 -d /tmp/qa-web
// then: node scripts/qa-screens.js qa-out   (needs Playwright). Writes qa-out/report.json and screenshots.
// Ask Mavis QA: walks every screen at several screen sizes and text sizes and measures what matters for older users.
const { chromium } = require('playwright');
const fs = require('fs');
const OUT = process.argv[2] || 'qa-out';
fs.mkdirSync(OUT, { recursive: true });

const VIEWPORTS = [
  { name: 'small-phone-320', width: 320, height: 640 },
  { name: 'phone-360', width: 360, height: 760 },
  { name: 'phone-412', width: 412, height: 915 },
  { name: 'tablet-800', width: 800, height: 1280 },
  { name: 'landscape-780', width: 780, height: 360 },
];
const SCALES = ['Big', 'Biggest'];

// measured on the page itself
const AUDIT = () => {
  const lum = (r, g, b) => { const f = (c) => { c /= 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; }; return .2126 * f(r) + .7152 * f(g) + .0722 * f(b); };
  const parse = (s) => { const m = s.match(/rgba?\(([^)]+)\)/); if (!m) return null; const v = m[1].split(',').map(Number); return { r: v[0], g: v[1], b: v[2], a: v[3] ?? 1 }; };
  const bgOf = (el) => { for (let e = el; e; e = e.parentElement) { const c = parse(getComputedStyle(e).backgroundColor); if (c && c.a > .5) return c; } return { r: 255, g: 255, b: 255, a: 1 }; };
  const ratio = (a, b) => { const L1 = lum(a.r, a.g, a.b), L2 = lum(b.r, b.g, b.b); return (Math.max(L1, L2) + .05) / (Math.min(L1, L2) + .05); };
  const vis = (e) => { const r = e.getBoundingClientRect(); const s = getComputedStyle(e); return r.width > 0 && r.height > 0 && s.visibility !== 'hidden' && s.display !== 'none' && +s.opacity > .1; };
  const out = { contrast: [], small: [], clipped: [], tiny: [], noname: [], overflow: 0 };
  out.overflow = Math.max(0, document.documentElement.scrollWidth - innerWidth);
  const seen = new Set();
  for (const el of document.querySelectorAll('div, span, input, textarea')) {
    const own = [...el.childNodes].filter((n) => n.nodeType === 3 && n.textContent.trim()).map((n) => n.textContent.trim()).join(' ');
    const text = own || ((el.tagName === 'INPUT' || el.tagName === 'TEXTAREA') ? (el.value || '') : '');
    if (!text || !vis(el)) continue;
    if (/^\p{Extended_Pictographic}/u.test(text) && text.length <= 3) continue;
    const s = getComputedStyle(el); const fg = parse(s.color); if (!fg) continue;
    const r = ratio(fg, bgOf(el)); const fs = parseFloat(s.fontSize); const big = fs >= 24 || (fs >= 18.66 && +s.fontWeight >= 700);
    const need = big ? 3 : 4.5;
    const key = text.slice(0, 40);
    if (r < need && !seen.has('c' + key)) { seen.add('c' + key); out.contrast.push(`${r.toFixed(2)}:1 (${fs}px) "${key}"`); }
    if (fs < 16 && !seen.has('t' + key)) { seen.add('t' + key); out.tiny.push(`${fs}px "${key}"`); }
    if ((el.scrollWidth > el.clientWidth + 2 && s.overflow !== 'visible') || el.getBoundingClientRect().right > innerWidth + 1) { if (!seen.has('x' + key)) { seen.add('x' + key); out.clipped.push(`"${key}"`); } }
  }
  for (const el of document.querySelectorAll('[role=button], button, [role=switch], [role=checkbox], input, textarea')) {
    if (!vis(el)) continue;
    const r = el.getBoundingClientRect();
    const name = el.getAttribute('aria-label') || el.innerText?.trim() || el.getAttribute('placeholder') || '';
    if (!name) out.noname.push(el.outerHTML.slice(0, 80));
    if ((r.width < 48 || r.height < 48)) out.small.push(`${Math.round(r.width)}x${Math.round(r.height)} "${name.replace(/\s+/g, ' ').slice(0, 40)}"`);
  }
  return out;
};

const fake = (said) => {
  class FakeRec extends EventTarget {
    start() { setTimeout(() => this.dispatchEvent(new Event('start')), 50); }
    stop() { const ev = new Event('result'); const r = [{ transcript: said, confidence: .95 }]; r.isFinal = true; ev.results = [r]; ev.resultIndex = 0; this.dispatchEvent(ev); setTimeout(() => this.dispatchEvent(new Event('end')), 50); }
    abort() { this.dispatchEvent(new Event('end')); }
  }
  window.webkitSpeechRecognition = FakeRec; window.SpeechRecognition = FakeRec;
};

(async () => {
  const b = await chromium.launch();
  const report = [];
  for (const vp of VIEWPORTS) for (const scale of SCALES) {
    const ctx = await b.newContext({ viewport: { width: vp.width, height: vp.height }, deviceScaleFactor: 1 });
    await ctx.addInitScript(fake, 'the telly says no signal');
    const p = await ctx.newPage();
    const errors = [];
    p.on('pageerror', (e) => errors.push(e.message));
    p.on('console', (m) => { if (m.type() === 'error' && !/favicon|Failed to load resource/.test(m.text())) errors.push(m.text().slice(0, 160)); });
    const tag = `${vp.name}/${scale}`;
    const check = async (screen) => {
      await p.waitForTimeout(500);
      const a = await p.evaluate(AUDIT);
      report.push({ tag, screen, ...a });
      if (vp.name === 'small-phone-320' || vp.name === 'tablet-800') await p.screenshot({ path: `${OUT}/${vp.name}-${scale}-${screen}.png`, fullPage: false });
    };
    const btn = (re) => p.getByRole('button', { name: re }).first();
    const home = async () => { await p.goto('http://localhost:8095'); await p.waitForTimeout(1800); };
    try {
      await home();
      await btn(/Settings/).click(); await p.waitForTimeout(400);
      await btn(new RegExp('^' + scale + '$')).click();
      await check('settings');
      await btn(/^Done$/).click();
      await check('home');
      // voice: speak a problem
      await btn(/Tap and tell me/).click(); await p.waitForTimeout(400);
      await check('listening');
      await btn(/Stop listening/).click(); await p.waitForTimeout(1500);
      await check('after-voice');
      if (await btn(/Yes, help me/).count()) { await btn(/Yes, help me/).click(); await p.waitForTimeout(1200); }
      await check('voice-result');
      // a typed problem, then the whole guide, step by step
      await home();
      await p.getByLabel('Type your problem').fill('my tv says no signal');
      await btn(/Help me with this/).click(); await p.waitForTimeout(1200);
      if (await btn(/Yes, help me/).count()) { await btn(/Yes, help me/).click(); await p.waitForTimeout(1200); }
      await check('guide-start');
      await btn(/Let's start/).click(); await p.waitForTimeout(500);
      await check('guide-step');
      let steps = 0;
      while (steps < 15) {
        const next = p.getByRole('button', { name: /^Done/ }).first();
        if (!(await next.count())) break;
        await next.click(); await p.waitForTimeout(350); steps++;
      }
      await check('guide-end');
      if (steps === 0) errors.push('GUIDE: could not step through');
      await btn(/Yes, it's working/).click(); await p.waitForTimeout(1500);
      await check('celebrate');
      // a vague problem: the choices screen
      await home();
      await p.getByLabel('Type your problem').fill('netflix');
      await btn(/Help me with this/).click(); await p.waitForTimeout(1000);
      if (await btn(/Yes, help me/).count()) { await btn(/Yes, help me/).click(); await p.waitForTimeout(1000); }
      await check('choices');
      // nothing matches
      await home();
      await p.getByLabel('Type your problem').fill('the fridge is humming loudly');
      await btn(/Help me with this/).click(); await p.waitForTimeout(1000);
      if (await btn(/Yes, help me/).count()) { await btn(/Yes, help me/).click(); await p.waitForTimeout(1000); }
      await check('not-found');
      // the other screens
      for (const [re, name] of [[/Is this a scam/, 'scam'], [/Browse all the help/, 'browse'], [/brain teaser/i, 'teaser'], [/Practise ordering/, 'practice']]) {
        await home(); await btn(re).click(); await p.waitForTimeout(800); await check(name);
      }
      // a category inside Browse
      await home(); await btn(/Browse all the help/).click(); await p.waitForTimeout(600);
      await p.getByRole('button').nth(1).click(); await p.waitForTimeout(600); await check('browse-category');
    } catch (e) { errors.push('FLOW STOPPED: ' + e.message.split('\n')[0]); }
    report.push({ tag, screen: '(errors)', errors });
    await ctx.close();
  }
  fs.writeFileSync(`${OUT}/report.json`, JSON.stringify(report, null, 1));
  await b.close();
})();
