// Shared Site Queue visual kit (v2): tokens, fonts, device frames, queue/induction phone screens, site-plan linework.
const fs = require('fs');
const ROOT = '/home/user/APP-1/marketing';
const F = __dirname + '/fonts/';
const b64 = f => fs.readFileSync(f).toString('base64');
const img = f => `data:image/png;base64,${b64(f)}`;
const LOGO = img(ROOT + '/brand/sq-logo.png');
const SHOT = n => img(`${ROOT}/brand/screens/dashboard-${n}.png`);

const face = (fam, dir, file, w) => `@font-face{font-family:'${fam}';font-weight:${w};src:url(data:font/woff2;base64,${b64(F + file)}) format('woff2')}`;
const FONTS = [
  ...[500, 600, 700, 800, 900].map(w => face('Barlow Condensed', 'barlow-condensed', `barlow-condensed-latin-${w}-normal.woff2`, w)),
  ...[400, 500, 600, 700].map(w => face('Barlow', 'barlow', `barlow-latin-${w}-normal.woff2`, w)),
].join('');

const CSS = `${FONTS}
*{box-sizing:border-box;margin:0;padding:0}
:root{--char:#1F1F1F;--char2:#2A2B29;--lime:#80D83B;--deep:#2E5A14;--con:#ECEDE8;--con2:#DCDED7;--grey:#7D827C;--white:#fff}
body{font-family:Barlow,sans-serif;-webkit-font-smoothing:antialiased;overflow:hidden;position:relative}
.d{font-family:'Barlow Condensed',sans-serif;font-weight:800;letter-spacing:-.01em;line-height:.92}
.on-char{background:var(--char);color:#F2F3EF}
.on-lime{background:var(--lime);color:var(--char)}
.on-con{background:var(--con);color:var(--char)}
.muted-c{color:#B7BCB4}.muted-l{color:#545A52}
.tile{border-radius:22%;display:block;box-shadow:0 6px 18px rgba(0,0,0,.18)}
.abs{position:absolute}
/* laptop */
.laptop{position:absolute}
.laptop .lid{background:#151515;border-radius:18px 18px 6px 6px;padding:14px 14px 18px;box-shadow:0 40px 80px rgba(0,0,0,.35)}
.laptop .lid img{display:block;width:100%;border-radius:4px}
.laptop .base{height:16px;background:linear-gradient(#cfd2cc,#9a9e98);border-radius:0 0 14px 14px;margin:0 -6%;}
/* phone */
.phone{position:absolute;background:#111;border-radius:54px;padding:12px;box-shadow:0 40px 90px rgba(0,0,0,.38),inset 0 0 0 2px #333}
.phone .scr{background:#F4F5F1;border-radius:43px;overflow:hidden;height:100%;position:relative;font-family:Barlow,sans-serif;color:#1F1F1F}
.phone .notch{position:absolute;top:12px;left:50%;transform:translateX(-50%);width:34%;height:30px;background:#111;border-radius:18px;z-index:3}
.sb{height:54px;display:flex;justify-content:space-between;align-items:flex-end;padding:0 28px 6px;font-weight:700;font-size:15px}
.apphead{background:#1F1F1F;color:#fff;padding:14px 20px 16px}
.apphead small{display:block;color:#9fd673;font-size:13px;font-weight:600}
.apphead b{font-size:22px;font-weight:700}
.q{padding:12px 14px;display:flex;flex-direction:column;gap:10px}
.job{background:#fff;border-radius:16px;padding:12px 14px;display:flex;gap:12px;align-items:center;box-shadow:0 1px 0 #e2e4de}
.job .n{font-family:'Barlow Condensed';font-weight:800;font-size:34px;width:34px;text-align:center;color:#1F1F1F}
.job .t{flex:1;line-height:1.2}
.job .t b{font-size:17px;font-weight:700;display:block}
.job .t span{font-size:13px;color:#6a6f68}
.st{font-size:12px;font-weight:700;border-radius:999px;padding:5px 10px;white-space:nowrap}
.st.w{background:#F1EFE4;color:#7A6A1E}.st.p{background:#E1F5D2;color:#2E5A14}
.job.me{outline:3px solid #80D83B}
.cta{margin:4px 14px;background:#80D83B;color:#1F1F1F;border-radius:16px;padding:15px;text-align:center;font-weight:700;font-size:17px}
`;

// Faint site-plan linework (plots, road, plot numbers) as an SVG background
function sitePlan(w, h, stroke = '#1F1F1F', op = .06) {
  let s = `<svg class="abs" style="left:0;top:0" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><g fill="none" stroke="${stroke}" stroke-opacity="${op}" stroke-width="2">`;
  const pw = 150, ph = 190; let n = 1;
  s += `<path d="M -50 ${h * .55} C ${w * .3} ${h * .45}, ${w * .55} ${h * .75}, ${w + 50} ${h * .6}" stroke-width="44" stroke-opacity="${op * .6}"/>`;
  for (let y = 30; y < h; y += ph + 30) for (let x = 30; x < w; x += pw + 24) {
    s += `<rect x="${x}" y="${y}" width="${pw}" height="${ph}" rx="4"/><rect x="${x + 30}" y="${y + 30}" width="${pw - 60}" height="${ph * .45}"/>`;
    s += `<text x="${x + 12}" y="${y + ph - 14}" fill="${stroke}" fill-opacity="${op * 1.6}" stroke="none" font-family="Barlow Condensed" font-weight="700" font-size="26">${n++}</text>`;
  }
  return s + '</g></svg>';
}

function phoneQueue() {
  return `<div class="notch"></div><div class="sb"><span>07:42</span><span>5G</span></div>
  <div class="apphead"><small>Haywood Heights</small><b>Forklift queue</b></div>
  <div class="q">
    <div class="job"><div class="n">1</div><div class="t"><b>Fence panels</b><span>Plot 3 · UK Landscaping</span></div><span class="st p">In progress</span></div>
    <div class="job"><div class="n">2</div><div class="t"><b>Trusses</b><span>Plot 9 · UK Roofing</span></div><span class="st w">~10 min</span></div>
    <div class="job me"><div class="n">3</div><div class="t"><b>2 packs of blocks</b><span>Plot 16 · You</span></div><span class="st w">~25 min</span></div>
    <div class="job"><div class="n">4</div><div class="t"><b>Roof ties</b><span>Plot 38 · UK Roofing</span></div><span class="st w">~40 min</span></div>
    <div class="job"><div class="n">5</div><div class="t"><b>Plasterboard, 2 pallets</b><span>Plot 21 · Drylining</span></div><span class="st w">~55 min</span></div>
  </div>
  <div style="padding:6px 20px 4px;font-weight:700;font-size:15px;color:#545A52">Deliveries due</div>
  <div class="q" style="padding-top:4px"><div class="job"><div class="t"><b>Bricks, artic</b><span>Gate 2 · ETA 08:15</span></div><span class="st p">On time</span></div></div>
  <div class="cta">Book the forklift</div>`;
}
function phoneInduction() {
  return `<div class="notch"></div><div class="sb"><span>06:58</span><span>5G</span></div>
  <div class="apphead"><small>Haywood Heights</small><b>Site induction</b></div>
  <div class="q">
    <div class="job"><div class="t"><b>Site rules & PPE</b><span>Section 1 of 4 · video watched</span></div><span class="st p">Done</span></div>
    <div class="job"><div class="t"><b>Traffic & pedestrians</b><span>Section 2 of 4</span></div><span class="st p">Done</span></div>
    <div class="job"><div class="t"><b>CSCS card</b><span>Blue skilled worker · photo added</span></div><span class="st p">Added</span></div>
    <div class="job"><div class="t"><b>Questions</b><span>9 of 10 correct · pass mark 8</span></div><span class="st p">Passed</span></div>
    <div class="job me"><div class="t"><b>Declaration</b><span>Sign with your name</span></div><span class="st w">To do</span></div>
  </div>
  <div style="padding:6px 20px 4px;font-weight:700;font-size:15px;color:#545A52">Before you start</div>
  <div class="q" style="padding-top:4px"><div class="job"><div class="t"><b>Assembly point</b><span>Site compound, by gate 1</span></div></div><div class="job"><div class="t"><b>First aiders on site</b><span>3 on site now</span></div></div></div>
  <div class="cta">Sign and finish</div>`;
}
function phoneAdvert() {
  return `<div class="notch"></div><div class="sb"><span>12:15</span><span>5G</span></div>
  <div class="apphead"><small>Haywood Heights</small><b>Site feed</b></div>
  <div class="q">
    <div class="job"><div class="t"><b>Crane lift on plots 12–14 at 10:00</b><span>Site manager · 2h</span></div></div>
    <div class="job" style="display:block;padding:0;overflow:hidden;outline:3px solid #80D83B">
      <div style="height:120px;background:linear-gradient(135deg,#2E5A14,#80D83B);display:flex;align-items:flex-end;padding:12px 14px;color:#fff;font-family:'Barlow Condensed';font-weight:800;font-size:30px;line-height:.95">Same-day blocks to site</div>
      <div style="padding:10px 14px 12px"><b style="font-size:16px">Your merchant here</b><div style="font-size:13px;color:#6a6f68">Sponsored · Eastleigh sites this week</div></div></div>
    <div class="job"><div class="t"><b>Plot 9 roof watertight</b><span>UK Roofing · 4h</span></div></div>
    <div class="job"><div class="t"><b>Spare scaffold boards at plot 30</b><span>Groundworks · 5h</span></div></div>
    <div class="job"><div class="t"><b>Road closed by gate 2 until 14:00</b><span>Site manager · 6h</span></div></div>
  </div>`;
}
// Phone is always laid out at 390px wide, then scaled to the requested width so text never reflows.
const phone = (x, y, w, inner, extra = '') => `<div class="phone" style="left:${x}px;top:${y}px;width:390px;height:745px;transform-origin:0 0;transform:scale(${w / 390}) ${extra}"><div class="scr">${inner}</div></div>`;
// Left-aligned text stack: items flow top to bottom with a fixed gap, so headlines can never overlap body copy.
const stack = (x, y, w, items, gap = 28) => `<div class="abs" style="left:${x}px;top:${y}px;width:${w}px;display:flex;flex-direction:column;gap:${gap}px">${items.join('')}</div>`;
const laptop = (x, y, w, shot, extra = '') => `<div class="laptop" style="left:${x}px;top:${y}px;width:${w}px;${extra}"><div class="lid"><img src="${SHOT(shot)}"></div><div class="base"></div></div>`;


const tile = (title, big, sub, tone = '') => `<div style="background:${tone === 'alert' ? '#FFF1EC' : '#fff'};border-radius:16px;padding:12px 14px;box-shadow:0 1px 0 #e2e4de">
  <div style="font-size:13px;font-weight:700;color:#545A52">${title}</div>
  <div style="font-family:'Barlow Condensed';font-weight:800;font-size:34px;line-height:1;margin-top:4px;color:${tone === 'alert' ? '#B2401C' : '#1F1F1F'}">${big}</div>
  <div style="font-size:12px;color:#6a6f68;margin-top:2px">${sub}</div></div>`;
function phoneHome() {
  return `<div class="notch"></div><div class="sb"><span>07:30</span><span>5G</span></div>
  <div class="apphead"><small>Haywood Heights</small><b>Today on site</b></div>
  <div style="display:grid;grid-template-columns:1fr 1fr;gap:10px;padding:12px 14px">
    ${tile('People on site', '46', '9 companies')}
    ${tile('Forklift queue', '4', 'waiting, ~12 min')}
    ${tile('Deliveries', '3', 'due before 11:00')}
    ${tile('Inductions', '5 / 8', 'new starters done')}
    ${tile('Hazards', '3', 'open, 1 urgent', 'alert')}
    ${tile('Programme', '2', 'activities delayed')}
    ${tile('Drawings', 'Rev C', 'A-102 issued today')}
    ${tile('Snags', '7', 'awaiting sign-off')}
  </div>
  <div class="q" style="padding-top:2px"><div class="job"><div class="t"><b>Crane lift, plots 12–14 at 10:00</b><span>Site feed · Site manager</span></div><span class="st p">New</span></div></div>`;
}
function phoneMap() {
  const plots = [];
  for (let r = 0; r < 3; r++) for (let c = 0; c < 4; c++) plots.push(`<rect x="${22 + c * 86}" y="${34 + r * 128}" width="70" height="96" rx="4" fill="#fff" stroke="#C9CCC4" stroke-width="2"/><text x="${30 + c * 86}" y="${122 + r * 128}" font-family="Barlow Condensed" font-weight="700" font-size="18" fill="#9A9F98">${r * 4 + c + 1}</text>`);
  return `<div class="notch"></div><div class="sb"><span>09:14</span><span>5G</span></div>
  <div class="apphead"><small>Haywood Heights</small><b>Live site map</b></div>
  <div style="position:relative;height:470px;background:#DDE3D3">
    <svg width="366" height="470" viewBox="0 0 366 470" style="position:absolute;left:0;top:0">
      <path d="M -10 160 C 120 150, 240 175, 380 158" stroke="#B9BDB2" stroke-width="22" fill="none"/>
      <path d="M -10 290 C 120 280, 240 300, 380 290" stroke="#B9BDB2" stroke-width="22" fill="none"/>
      ${plots.join('')}
    </svg>
    <div style="position:absolute;left:112px;top:146px;background:#80D83B;border-radius:10px;padding:4px 8px;font-size:12px;font-weight:700;box-shadow:0 2px 6px rgba(0,0,0,.2)">Forklift · Simon</div>
    <div style="position:absolute;left:236px;top:278px;background:#1F1F1F;color:#fff;border-radius:10px;padding:4px 8px;font-size:12px;font-weight:700">Excavator · Doug</div>
    <div style="position:absolute;left:44px;top:380px;background:#E8572A;color:#fff;border-radius:10px;padding:4px 8px;font-size:12px;font-weight:700">Hazard · open trench</div>
    <div style="position:absolute;left:214px;top:48px;background:#fff;color:#B2401C;border:2px solid #E8572A;border-radius:10px;padding:4px 8px;font-size:12px;font-weight:700">First aid · plot 7</div>
  </div>
  <div class="q"><div class="job"><div class="t"><b>2 forklifts, 3 plant working</b><span>Positions shared only while on a job</span></div></div></div>`;
}
function phoneDrawings() {
  const row = (no, t, rev, chip, cls) => `<div class="job"><div class="t"><b>${no} ${t}</b><span>${rev}</span></div><span class="st ${cls}">${chip}</span></div>`;
  return `<div class="notch"></div><div class="sb"><span>08:05</span><span>5G</span></div>
  <div class="apphead"><small>Haywood Heights</small><b>Drawings</b></div>
  <div class="q">
    ${row('A-102', 'Ground floor plan', 'Plots 21–30 · issued for construction', 'Rev C new', 'p')}
    ${row('S-210', 'Roof trusses', 'Plots 1–9 · Roofers', 'Rev B', 'w')}
    ${row('E-301', 'External works', 'Phase 1 · Groundworks', 'Rev A', 'w')}
    ${row('F-01', 'Fencing layout', 'Plots 13–18 · Landscaping', 'Rev D', 'w')}
  </div>
  <div style="padding:6px 20px 4px;font-weight:700;font-size:15px;color:#545A52">Documents</div>
  <div class="q" style="padding-top:4px">
    ${row('', 'RAMS: roofing works', 'UK Roofing · revised yesterday', 'Rev 3', 'p')}
    ${row('', 'Hot works permit', 'Plot 9 · expires 17:00', 'Live', 'p')}
  </div>`;
}
function phoneAlert() {
  return `<div class="notch"></div><div class="sb"><span>11:42</span><span>5G</span></div>
  <div style="background:#B2401C;color:#fff;padding:22px 20px 24px">
    <div style="font-size:14px;font-weight:700;opacity:.85">Emergency alert</div>
    <div style="font-family:'Barlow Condensed';font-weight:800;font-size:44px;line-height:.95;margin-top:6px">First aid requested</div>
    <div style="font-size:17px;margin-top:10px">Plot 24, by the loading bay. Cut to hand.</div></div>
  <div class="q">
    <div class="job"><div class="t"><b>Dan Sampson is responding</b><span>First aider · 2 min away</span></div><span class="st p">On the way</span></div>
    <div class="job"><div class="t"><b>Location pinned on the map</b><span>GPS captured at 11:41</span></div></div>
    <div class="job"><div class="t"><b>Emergency contact</b><span>Site office, one tap to call</span></div></div>
  </div>
  <div class="cta" style="background:#1F1F1F;color:#fff">I'm responding</div>
  <div style="padding:10px 20px;font-size:12px;color:#6a6f68">In an emergency, always call 999.</div>`;
}
function phoneFeed() {
  return `<div class="notch"></div><div class="sb"><span>16:20</span><span>5G</span></div>
  <div class="apphead"><small>Haywood Heights</small><b>Site feed</b></div>
  <div class="q">
    <div class="job" style="display:block;padding:0;overflow:hidden">
      <div style="height:150px;background:linear-gradient(160deg,#9FB5C9 0%,#C9D3D8 55%,#8E8A7E 56%,#6F6B60 100%);position:relative">
        <div style="position:absolute;left:40px;bottom:22px;width:110px;height:70px;background:#B85C3C;clip-path:polygon(0 40%,50% 0,100% 40%,100% 100%,0 100%)"></div>
        <div style="position:absolute;left:170px;bottom:22px;width:110px;height:70px;background:#A4522F;clip-path:polygon(0 40%,50% 0,100% 40%,100% 100%,0 100%)"></div></div>
      <div style="padding:10px 14px 12px"><b style="font-size:16px">Plots 7 and 8 roofs watertight</b><div style="font-size:13px;color:#6a6f68">Site manager · 24 likes · 6 comments</div></div></div>
    <div class="job"><div class="t"><b>Road closed by gate 2 until 14:00</b><span>Logistics · 3h</span></div></div>
    <div class="job"><div class="t"><b>Spare scaffold boards at plot 30</b><span>Groundworks · 5h</span></div></div>
    <div class="job"><div class="t"><b>Toolbox talk 07:30 tomorrow: working at height</b><span>H&S · 6h</span></div></div>
  </div>`;
}

module.exports = { phoneHome, phoneMap, phoneDrawings, phoneAlert, phoneFeed, stack, CSS, LOGO, SHOT, sitePlan, phone, laptop, phoneQueue, phoneInduction, phoneAdvert, ROOT };
