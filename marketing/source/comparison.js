// "What Site Queue replaces" comparison graphics, from Luke's pricing research (Nov 2026, cheapest published plans, one site).
const { chromium } = require('playwright');
const K = require('./kit');
const OUT = K.ROOT + '/graphics';

const rows = [
  ['Hazard and near-miss reporting', '£372'],
  ['Site chat and noticeboard', '£345'],
  ['Drawings, tasks and snagging', '£330'],
  ['Delivery booking', '£220'],
  ['Digital inductions', '£99'],
  ['Programme planning', '£97'],
  ['Plant tracking', '£50–£125'],
  ['Emergency alerts', '£76'],
];
const list = (fs, pad) => rows.map(([a, b]) => `<div style="display:flex;justify-content:space-between;gap:20px;border-top:1px solid #3A3B38;padding:${pad}px 0;font-size:${fs}px">
  <span style="color:#D9DCD5">${a}</span><span style="font-weight:700;color:#F2F3EF;white-space:nowrap">${b}</span></div>`).join('');

const portrait = `
  <img class="tile abs" src="${K.LOGO}" style="left:72px;top:64px;width:84px">
  <div class="abs" style="right:72px;top:92px;font-size:22px;font-weight:600;color:#B7BCB4">sitequeue.uk</div>
  ${K.stack(72, 200, 936, [
    `<div class="d" style="font-size:104px">Eight tools. Or one app.</div>`,
    `<div style="font-size:26px;color:#B7BCB4;line-height:1.4">What it costs to run one site on separate software, per month:</div>`,
    `<div>${list(28, 15)}<div style="display:flex;justify-content:space-between;border-top:2px solid #F2F3EF;padding-top:16px;font-size:34px;font-weight:700"><span>Total</span><span>about £1,600</span></div></div>`,
    `<div style="background:#80D83B;color:#1F1F1F;border-radius:18px;padding:26px 30px;display:flex;justify-content:space-between;align-items:center;gap:24px">
       <div><div class="d" style="font-size:60px">Site Queue</div><div style="font-size:22px;font-weight:600;color:#2E5A14;margin-top:6px">Everything above, in one app. Unlimited users. Free for workers.</div></div>
       <div style="text-align:right;white-space:nowrap"><div style="font-size:22px;font-weight:700">from</div><div class="d" style="font-size:84px">£149</div><div style="font-size:20px;font-weight:600;color:#2E5A14">per site, per month</div></div></div>`,
  ], 26)}
  <div class="abs" style="left:72px;right:72px;bottom:34px;font-size:15px;color:#7D827C;line-height:1.4">Based on the cheapest published plans for one housing site with 10 office users, 50 operatives and 5 tracked machines, November 2026. Excludes VAT, setup fees and hardware.</div>`;

const wide = `
  <img class="tile abs" src="${K.LOGO}" style="left:80px;top:72px;width:84px">
  ${K.stack(80, 200, 640, [
    `<div class="d" style="font-size:104px">Eight tools. Or one app.</div>`,
    `<div style="font-size:26px;color:#B7BCB4;line-height:1.45">Running one site on separate software costs around £1,600 a month. Site Queue does all of it, from £149 per site.</div>`,
    `<div style="background:#80D83B;color:#1F1F1F;border-radius:18px;padding:24px 28px"><div class="d" style="font-size:56px">from £149</div><div style="font-size:21px;font-weight:600;color:#2E5A14;margin-top:6px">per site, per month. Unlimited users. Free for workers.</div></div>`,
  ], 28)}
  <div class="abs" style="left:800px;top:120px;width:720px">${list(26, 14)}<div style="display:flex;justify-content:space-between;border-top:2px solid #F2F3EF;padding-top:16px;font-size:32px;font-weight:700"><span>Separate tools, per month</span><span>about £1,600</span></div></div>
  <div class="abs" style="left:80px;right:80px;bottom:34px;font-size:15px;color:#7D827C">Cheapest published plans for one housing site (10 office users, 50 operatives, 5 machines), November 2026. Excludes VAT, setup fees and hardware.</div>`;

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ deviceScaleFactor: 2 })).newPage();
  for (const [name, w, h, body] of [['post-13-what-it-replaces', 1080, 1350, portrait], ['what-it-replaces-wide', 1600, 900, wide]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(`<!doctype html><html><head><style>${K.CSS} body{width:${w}px;height:${h}px}</style></head><body class="on-char">${body}</body></html>`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    const over = await p.evaluate(() => { let m = 0; document.querySelectorAll('body *').forEach(e => { const r = e.getBoundingClientRect(); if (r.height) m = Math.max(m, r.bottom); }); return Math.round(m); });
    await p.screenshot({ path: `${OUT}/${name}.png` });
    console.log(name, 'lowest element', over, 'of', h);
  }
  await b.close();
})();
