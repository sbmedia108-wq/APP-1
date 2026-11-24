// v2 print + deck assets: transparent phone renders, A4 one-pager, brand guidelines sheet, preview sheet.
const { chromium } = require('playwright');
const fs = require('fs');
const K = require('./kit');
const G = K.ROOT + '/graphics', B = K.ROOT + '/brand';

const page = (css, body, cls = '') => `<!doctype html><html><head><style>${K.CSS}${css}</style></head><body class="${cls}">${body}</body></html>`;

// A4 one-pager (portrait, 794x1123 CSS px)
const feats = [
  ['Deliveries & forklift queue', 'One live queue for forklift jobs and booked deliveries, with wait times, voice booking and photo proof.'],
  ['Live site map', 'Your site plan over satellite imagery, with forklifts, plant, hazards and first-aid calls shown live.'],
  ['Digital inductions', 'Built once, completed on a phone: CSCS card, pass mark, signed declaration, automatic expiry.'],
  ['Programme & plots', 'Master programme, plot register, delays with reasons, snagging and photo-approved tasks.'],
  ['Drawings & documents', 'Always the current revision, shared markup, RAMS, permits and certificates in one place.'],
  ['Safety & site feed', 'One-tap first-aid requests, hazard reports tracked to close, and a noticeboard for the whole site.'],
];
const onePager = page(`
@page{size:A4;margin:0}
body{width:794px;height:1123px;background:#FBFBF8;color:#1F1F1F}
.hero{position:relative;height:430px;background:var(--char);color:#F2F3EF;overflow:hidden}
.grid2{display:grid;grid-template-columns:1fr 1fr;column-gap:34px;row-gap:20px}
.f h3{font-family:'Barlow Condensed';font-weight:800;font-size:23px;line-height:1;margin-bottom:5px}
.f p{font-size:12.5px;line-height:1.45;color:#4A4F48}
.roles{display:flex;flex-wrap:wrap;gap:8px}
.roles span{background:#E6E8E1;border-radius:6px;padding:6px 10px;font-size:12.5px;font-weight:600}
`, `
<div class="hero">
  <img class="tile abs" src="${K.LOGO}" style="left:48px;top:44px;width:62px">
  ${K.stack(48, 132, 380, [`<div class="d" style="font-size:56px">Run the whole site from one app.</div>`, `<div style="font-size:14px;line-height:1.5;color:#B7BCB4">Logistics, inductions, programme, drawings and safety for main contractors, site managers, trades and delivery drivers. It replaces radio calls, group chats, paper induction packs and whiteboards.</div>`], 16)}
  ${K.laptop(520, 70, 400, 'overview')}
  ${K.phone(470, 150, 150, K.phoneHome())}
</div>
<div style="padding:34px 48px 0">
  <div class="d" style="font-size:30px;margin-bottom:18px">What it does</div>
  <div class="grid2">${feats.map(([a, b]) => `<div class="f"><h3>${a}</h3><p>${b}</p></div>`).join('')}</div>
  <div class="d" style="font-size:30px;margin:30px 0 12px">Built for every role on site</div>
  <div class="roles">${['Main contractors', 'Site and project managers', 'Contracts managers', 'Subcontractors and trades', 'Forklift and delivery drivers', 'Labour and plant operators'].map(r => `<span>${r}</span>`).join('')}</div>
</div>
<div class="abs on-lime" style="left:48px;right:48px;bottom:44px;border-radius:14px;padding:22px 26px;display:flex;justify-content:space-between;align-items:center;gap:24px">
  <div><div class="d" style="font-size:34px">Get early access</div><div style="font-size:13.5px;font-weight:600;color:#2E5A14;margin-top:6px;max-width:400px;line-height:1.45">Sign up before the 2027 launch for 25% off your first 6 months, and a direct line to the founder.</div></div>
  <div style="text-align:right;font-weight:700;font-size:15px;line-height:1.5">sitequeue.uk<br><span style="font-weight:600;color:#2E5A14">[contact email]</span></div>
</div>
<div class="abs" style="right:48px;bottom:18px;font-size:9px;font-weight:600;color:#9A9F98;letter-spacing:.02em">Design by SB Media</div>`);

// Brand guidelines sheet (A4 landscape, 1123x794)
const sw = (hex, name, use, dark) => `<div style="flex:1"><div style="height:84px;border-radius:12px;background:${hex};${hex === '#FBFBF8' || hex === '#ECEDE8' ? 'border:1px solid #D5D8D0' : ''}"></div><div style="font-weight:700;font-size:15px;margin-top:10px">${name}</div><div style="font-size:13px;color:#545A52">${hex}<br>${use}</div></div>`;
const brandSheet = page(`
@page{size:A4 landscape;margin:0}
body{width:1123px;height:794px;background:#FBFBF8;color:#1F1F1F;padding:48px 56px}
.h{font-family:'Barlow Condensed';font-weight:800;font-size:24px;margin-bottom:14px}
`, `
<div style="display:flex;justify-content:space-between;align-items:flex-start">
  <div style="display:flex;gap:20px;align-items:center"><img class="tile" src="${K.LOGO}" style="width:76px"><div><div class="d" style="font-size:54px">Site Queue brand basics</div><div style="font-size:15px;color:#545A52;margin-top:6px">Version 1, November 2026. For social, print, web and sales material.</div></div></div>
</div>
<div style="display:grid;grid-template-columns:1.25fr 1fr;gap:48px;margin-top:28px">
  <div>
    <div class="h">Colour</div>
    <div style="display:flex;gap:14px">${sw('#1F1F1F', 'Charcoal', 'Dark grounds, text')}${sw('#80D83B', 'Hi-vis lime', 'Fields, buttons, the one accent')}${sw('#2E5A14', 'Site green', 'Text on lime')}${sw('#ECEDE8', 'Concrete', 'Light grounds')}${sw('#7D827C', 'Ballast', 'Secondary text')}</div>
    <div class="h" style="margin-top:24px">Type</div>
    <div style="display:flex;gap:36px;align-items:flex-end">
      <div><div class="d" style="font-size:52px">Barlow Condensed</div><div style="font-size:13px;color:#545A52">Headlines. ExtraBold 800, sentence case, tight leading.</div></div>
      <div><div style="font-size:30px;font-weight:500">Barlow</div><div style="font-size:13px;color:#545A52">Body and labels. Medium 500, SemiBold 600.</div></div>
    </div>
    <div class="h" style="margin-top:24px">Rules</div>
    <div style="font-size:13.5px;line-height:1.6;color:#2A2B29">
      Use lime as a whole field or button, never to highlight one word.<br>
      Headlines in sentence case. No all-caps labels, no hazard stripes.<br>
      Show the whole product: logistics, inductions, programme, drawings, safety.<br>
      Logo tile always on its own dark square, at least 48px, with clear space of half its width.<br>
      Free Google Fonts: Barlow and Barlow Condensed.</div>
  </div>
  <div style="position:relative">
    <div class="h">The signature: the live site</div>
    <div style="font-size:14px;line-height:1.55;color:#2A2B29;max-width:420px">Show the real product: live counts, statuses and numbered plots. Every piece shows a screen from the app, never stock photos of hard hats.</div>
    <div style="position:relative;height:420px;margin-top:16px;background:var(--lime);border-radius:16px;overflow:hidden">${K.phone(110, 30, 230, K.phoneHome())}</div>
  </div>
</div>
<div class="abs" style="right:56px;bottom:22px;font-size:10px;font-weight:600;color:#9A9F98">Brand guide by SB Media</div>`);

(async () => {
  const b = await chromium.launch();
  const ctx = await b.newContext({ deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  // transparent phone renders for the deck
  for (const [n, scr] of [['home', K.phoneHome()], ['queue', K.phoneQueue()], ['induction', K.phoneInduction()], ['map', K.phoneMap()], ['drawings', K.phoneDrawings()], ['alert', K.phoneAlert()], ['feed', K.phoneFeed()], ['advert', K.phoneAdvert()]]) {
    await p.setViewportSize({ width: 470, height: 830 });
    await p.setContent(page('body{background:transparent;width:470px;height:830px}', K.phone(40, 30, 390, scr)));
    await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: `${G}/phone-${n}.png`, omitBackground: true });
  }
  for (const [name, html, w, h, fmt] of [['one-pager-a4', onePager, 794, 1123, { format: 'A4' }], ['brand-basics', brandSheet, 1123, 794, { format: 'A4', landscape: true }]]) {
    await p.setViewportSize({ width: w, height: h });
    await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({ path: `${name === 'brand-basics' ? B : G}/${name}-preview.png` });
    await p.pdf({ path: `${name === 'brand-basics' ? B : G}/${name}.pdf`, printBackground: true, ...fmt });
  }
  console.log('done');
  await b.close();
})();
