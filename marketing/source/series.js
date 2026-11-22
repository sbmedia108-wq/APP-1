// Site Queue launch series: 5 static posts for Facebook and LinkedIn, 1080x1350 (4:5), rendered at 2x.
const { chromium } = require('playwright');
const fs = require('fs');
const K = require('./kit');
const OUT = K.ROOT + '/social/launch-series';
fs.mkdirSync(OUT, { recursive: true });

const W = 1080, H = 1350;
const THEMES = {
  con: { bg: '#ECEDE8', ink: '#1F1F1F', sub: '#545A52' },
  lime: { bg: '#80D83B', ink: '#1F1F1F', sub: '#24470F' },
  char: { bg: '#1F1F1F', ink: '#F4F5F1', sub: '#AEB3AB' },
};
const CSS = `${K.CSS}
body{width:${W}px;height:${H}px}
.top{position:absolute;left:0;right:0;top:92px;display:flex;flex-direction:column;align-items:center;text-align:center}
.top .tile{width:76px;box-shadow:none}
.dk .top .tile{outline:1.5px solid rgba(255,255,255,.16);outline-offset:0}
.h{font-family:'Barlow Condensed';font-weight:800;font-size:112px;line-height:.93;letter-spacing:-.5px;margin-top:40px}
.s{font-size:30px;line-height:1.38;font-weight:500;max-width:700px;margin-top:26px;text-wrap:balance}
.h{text-wrap:balance}
.glow{position:absolute;left:50%;transform:translateX(-50%);border-radius:50%;filter:blur(60px);opacity:.55}
`;
// A centred phone that bleeds off the bottom edge, with a soft ground shadow.
const hero = (screen, top = 610, w = 560) => `
  <div class="glow" style="top:${top + 120}px;width:${w * 1.3}px;height:${w * 1.3}px;background:rgba(0,0,0,.18)"></div>
  ${K.phone((W - w) / 2, top, w, screen)}`;
const post = (theme, headline, sub, body) => {
  const t = THEMES[theme];
  return { theme, html: `<body class="${theme === 'char' ? 'dk' : ''}" style="background:${t.bg};color:${t.ink}">
  <div class="top"><img class="tile" src="${K.LOGO}" alt="">
    <div class="h">${headline}</div><div class="s" style="color:${t.sub}">${sub}</div></div>
  ${body}</body>` };
};

const P = {};
P['01-whole-site'] = post('con', 'The whole site.<br>One app.',
  'Logistics, inductions, programme, drawings and safety, live for everyone on site.', hero(K.phoneHome()));
P['02-queue'] = post('lime', 'Know your place<br>in the queue.',
  'Book the forklift in seconds and see a live wait time. No more shouting across site.', hero(K.phoneQueue()));
P['03-inductions'] = post('char', 'Inducted before<br>the gate.',
  'CSCS card, test and signature, all done on the phone before day one.', hero(K.phoneInduction()));

// 04: value story, no phone; two big figures do the work.
P['04-value'] = { theme: 'con', html: `<body style="background:#ECEDE8;color:#1F1F1F">
  <div class="top"><img class="tile" src="${K.LOGO}" alt="">
    <div class="h">Eight tools.<br>One app.</div>
    <div class="s" style="color:#545A52">Delivery booking, drawings, inductions, programme, plant tracking, hazard reporting, alerts and site chat.</div></div>
  <div class="abs" style="left:90px;right:90px;top:740px;display:flex;flex-direction:column;gap:24px">
    <div style="background:#FBFBF8;border-radius:28px;padding:40px 48px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:28px;font-weight:600;color:#545A52;line-height:1.3">Separate software<br>for one site, roughly</div>
      <div style="text-align:right"><div class="d" style="font-size:128px;color:#8A8F88">£1,600</div><div style="font-size:21px;color:#7D827C;font-weight:600">a month</div></div></div>
    <div style="background:#80D83B;border-radius:28px;padding:40px 48px;display:flex;justify-content:space-between;align-items:center">
      <div style="font-size:28px;font-weight:700;line-height:1.3">Site Queue,<br>everything included</div>
      <div style="text-align:right"><div class="d" style="font-size:128px">£399</div><div style="font-size:21px;color:#24470F;font-weight:700">a site, a month</div></div></div>
  </div>
  <div class="abs" style="left:90px;right:90px;bottom:62px;text-align:center;font-size:17px;line-height:1.45;color:#7D827C;text-wrap:balance">Unlimited users. Free for workers. Comparison uses the cheapest published plans for one housing site, November 2026, excluding VAT.</div>
  </body>` };

// 05: call to action; a smaller phone sits behind a lime pill.
P['05-early-access'] = { theme: 'char', html: `<body class="dk" style="background:#1F1F1F;color:#F4F5F1">
  <div class="top"><img class="tile" src="${K.LOGO}" alt="">
    <div class="h" style="color:#80D83B">Early access<br>is open.</div>
    <div class="s" style="color:#AEB3AB">Get Site Queue on your site before launch, at the early-bird rate.</div>
    <div style="margin-top:40px;background:#80D83B;color:#1F1F1F;border-radius:999px;padding:20px 46px;font-size:30px;font-weight:700">Join at sitequeue.uk</div></div>
  ${hero(K.phoneHome(), 790, 500)}
  </body>` };

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 2 })).newPage();
  for (const [name, d] of Object.entries(P)) {
    await p.setContent(`<!doctype html><html><head><style>${CSS}</style></head>${d.html}</html>`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    // QA: text must not run off the canvas or into the phone
    const qa = await p.evaluate(() => {
      const out = []; const ph = document.querySelector('.phone'); const pr = ph && ph.getBoundingClientRect();
      document.querySelectorAll('.top *, .abs').forEach(e => { const r = e.getBoundingClientRect();
        if (r.width && (r.left < 40 || r.right > 1040)) out.push('edge:' + e.className + ':' + Math.round(r.left) + '-' + Math.round(r.right)); });
      const top = document.querySelector('.top').getBoundingClientRect();
      if (pr && top.bottom > pr.top - 30) out.push('text-into-phone ' + Math.round(top.bottom) + '>' + Math.round(pr.top));
      return out; });
    await p.screenshot({ path: `${OUT}/site-queue-${name}.png` });
    console.log(name, qa.length ? qa.join(' | ') : 'ok');
  }
  await b.close();
})();
