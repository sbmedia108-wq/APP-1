// Site Queue marketing graphics v2.1 — the whole site in one app; signage type, hi-vis fields.
const { chromium } = require('playwright');
const fs = require('fs');
const K = require('./kit');
const OUT = K.ROOT + '/graphics';
fs.mkdirSync(OUT, { recursive: true });
for (const f of fs.readdirSync(OUT)) if (/^(post-|linkedin-banner|og-image|email-header|pullup)/.test(f)) fs.unlinkSync(OUT + '/' + f);

const H = (size, text, color = '') => `<div class="d" style="font-size:${size}px;${color ? 'color:' + color : ''}">${text}</div>`;
const P = (size, text, color, weight = 500) => `<div style="font-size:${size}px;line-height:1.4;font-weight:${weight};color:${color}">${text}</div>`;
const L = '#545A52', DK = '#B7BCB4', DG = '#2E5A14';
const D = {};

D['linkedin-banner'] = { w: 1584, h: 396, cls: 'on-con', html: `
  ${K.sitePlan(1584, 396)}
  <div class="abs" style="left:1060px;top:0;width:524px;height:396px;background:var(--lime)"></div>
  ${K.stack(380, 70, 640, [H(84, 'Run the whole site from one app.'), P(22, 'Logistics, inductions, programme, drawings and safety for UK construction sites. Launching 2027.', L, 600)], 22)}
  ${K.phone(1170, 46, 320, K.phoneHome(), 'rotate(-6deg)')}` };

D['og-image'] = { w: 1200, h: 630, cls: 'on-char', html: `
  <img class="tile abs" src="${K.LOGO}" style="left:72px;top:64px;width:88px">
  ${K.stack(72, 200, 470, [H(88, 'Run the whole site from one app.'), P(24, 'Logistics, inductions, programme, drawings and safety, live for everyone on site.', DK)], 26)}
  ${K.laptop(640, 110, 700, 'overview')}
  ${K.phone(585, 230, 210, K.phoneHome())}` };

D['email-header'] = { w: 1200, h: 400, cls: 'on-lime', html: `
  <img class="tile abs" src="${K.LOGO}" style="left:64px;top:52px;width:80px">
  ${K.stack(64, 168, 640, [H(84, 'Founding sites are open'), P(22, 'Run your whole site on Site Queue, free, before the 2027 launch.', DG, 600)], 18)}
  ${K.phone(850, 36, 290, K.phoneHome(), 'rotate(5deg)')}` };

const post = (cls, html) => ({ w: 1080, h: 1080, cls, html });
const brand = dark => `<img class="tile abs" src="${K.LOGO}" style="left:72px;top:72px;width:88px">
  <div class="abs" style="right:72px;top:100px;font-size:22px;font-weight:600;color:${dark ? DK : L}">sitequeue.uk</div>`;
const split = (cls, head, body, screen, hs = 118) => {
  const dark = cls === 'on-char', lime = cls === 'on-lime';
  return post(cls, `${cls === 'on-con' ? K.sitePlan(1080, 1080) : ''}${brand(dark)}
  ${K.stack(72, 230, 480, [H(hs, head), P(27, body, dark ? DK : lime ? DG : L, lime ? 600 : 500)], 34)}
  ${K.phone(600, 190, 400, screen)}`);
};

// 01: the all-in-one statement — what Site Queue replaces
const replaces = [['Radio calls for the forklift', 'Forklift & delivery queue'], ['WhatsApp groups', 'Live site feed'], ['Paper induction packs', 'Digital inductions'], ['Whiteboard programme', 'Programme & plot tracking'], ['Drawing folders in the cabin', 'Current drawings & RAMS'], ['Shouting for a first aider', 'First-aid & hazard alerts'], ['Guessing where the plant is', 'Live site map']];
D['post-01-all-in-one'] = post('on-char', `${brand(true)}
  ${K.stack(72, 210, 940, [H(130, 'One app replaces seven.'), `<div style="display:flex;flex-direction:column;gap:18px;margin-top:14px">${replaces.map(([a, b]) => `<div style="display:grid;grid-template-columns:450px 1fr;gap:24px;align-items:center;border-top:1px solid #3A3B38;padding-top:18px"><div style="font-size:31px;color:#8F948D;text-decoration:line-through;text-decoration-color:#6B7069">${a}</div><div style="font-size:33px;font-weight:700;color:#F2F3EF">${b}</div></div>`).join('')}</div>`], 26)}`);

D['post-02-launch-teaser'] = post('on-lime', `${brand(false)}
  ${K.stack(72, 250, 940, [H(160, 'Less waiting.<br>Better coordination.<br>More building.')])}
  <div class="abs" style="left:74px;bottom:76px;font-size:30px;font-weight:600;color:${DG}">Site Queue launches in 2027. One app for the whole site.</div>`);

D['post-03-today-on-site'] = split('on-con', 'Your whole site, on one screen.', 'Who’s on site, what’s waiting, what’s late and what’s unsafe, live for the site manager and the office.', K.phoneHome());
D['post-04-logistics'] = split('on-lime', 'Stop shouting for the forklift.', 'Trades book it in seconds and see a live wait time. Deliveries book a slot and update their ETA.', K.phoneQueue());
D['post-05-inductions'] = split('on-char', 'Inducted before they reach the gate.', 'Your induction on their phone, with CSCS card, pass mark and signed declaration on record.', K.phoneInduction());
D['post-06-programme'] = post('on-con', `${brand(false)}
  ${K.stack(72, 220, 900, [H(124, 'Every plot, stage by stage.'), P(28, 'Master programme, plot register, delays with reasons, snagging and sign-off. Trades see next week’s plots before they arrive.', L)], 26)}
  ${K.laptop(72, 640, 1140, 'programme')}`);
D['post-07-site-map'] = split('on-char', 'Know where everything is.', 'Your site plan on the map, with forklifts, plant, hazards and first-aid calls shown live.', K.phoneMap(), 100);
D['post-08-drawings'] = split('on-con', 'Always the current drawing.', 'New revisions replace the old ones on every phone. Mark up together; RAMS, permits and certificates in one place.', K.phoneDrawings());
D['post-09-safety'] = split('on-lime', 'Help, found in seconds.', 'One tap alerts every first aider with the exact location. Hazards are reported with a photo and tracked until closed.', K.phoneAlert());
D['post-10-site-feed'] = split('on-char', 'One noticeboard for the whole site.', 'Updates, photos and video in one place instead of six group chats. Only people inducted on the site can post.', K.phoneFeed(), 88);

D['post-11-founding-sites'] = post('on-char', `${brand(true)}
  <div class="abs d" style="left:56px;top:150px;font-size:540px;color:var(--lime);line-height:.8">10</div>
  ${K.stack(72, 620, 900, [H(96, 'founding sites wanted'), P(28, 'Run your whole site on Site Queue free before launch.<br>Founding pricing locked in.<br>A direct line to the founder.', '#D9DCD5')], 30)}
  <div class="abs" style="left:74px;bottom:72px;font-size:26px;font-weight:700;color:var(--lime)">Housebuilders and main contractors: book a demo at sitequeue.uk</div>`);
D['post-12-advertisers'] = split('on-lime', 'Your brand, on site.', 'Reach the trades and site managers ordering materials and plant. Choose the sites, pick the dates, pay per placement.', K.phoneAdvert());

D['pullup-banner-preview'] = { w: 850, h: 2000, cls: 'on-char', html: `
  <img class="tile abs" src="${K.LOGO}" style="left:70px;top:90px;width:170px">
  ${K.stack(70, 340, 720, [H(150, 'Run the whole site from one app.'), P(36, 'Logistics, inductions, programme, drawings and safety for main contractors, site managers and trades.', DK)], 40)}
  <div class="abs" style="left:0;top:1260px;width:850px;height:740px;background:var(--lime)"></div>
  ${K.phone(255, 1130, 340, K.phoneHome())}
  <div class="abs d" style="left:70px;top:1860px;font-size:66px;color:var(--char)">sitequeue.uk</div>
  <div class="abs" style="right:70px;top:1890px;font-size:18px;font-weight:600;color:${DG}">Design by SB Media</div>` };

module.exports = { D };
if (require.main === module) (async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ deviceScaleFactor: 2 })).newPage();
  for (const [name, d] of Object.entries(D)) {
    await p.setViewportSize({ width: d.w, height: d.h });
    await p.setContent(`<!doctype html><html><head><style>${K.CSS} body{width:${d.w}px;height:${d.h}px}</style></head><body class="${d.cls}">${d.html}</body></html>`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(150);
    await p.screenshot({ path: `${OUT}/${name}.png` });
  }
  console.log('rendered', Object.keys(D).length);
  await b.close();
})();
