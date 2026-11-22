// Bolder LinkedIn set (v2). Run: node generate-v2.js  (needs Playwright)
const { chromium } = require('playwright');
const OUT = __dirname + '/v2/';
const W = 1080, H = 1350;
const C = { violet: '#6a3cc9', deep: '#2a1066', lilac: '#b9a2f0', ink: '#0b0b0d', paper: '#f5f3fa', graphite: '#2c2c30', green: '#3d5631' };
const mark = (disc) => `<svg viewBox="0 0 32 32" width="46" height="46"><circle cx="16" cy="16" r="13" fill="none" stroke="#b9a2f0" stroke-width="2.6"/><circle cx="19.5" cy="13" r="8.2" fill="${disc}"/></svg>`;
const css = `
*{box-sizing:border-box;margin:0}
.s{width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:Inter,-apple-system,Helvetica,Arial,sans-serif;letter-spacing:-.025em;-webkit-font-smoothing:antialiased;page-break-after:always}
.pad{position:absolute;left:84px;right:84px;top:84px;bottom:190px;display:flex;flex-direction:column}
.eyebrow{font-size:26px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.hook{font-weight:800;letter-spacing:-.05em;line-height:.98}
.foot{position:absolute;left:84px;right:84px;bottom:70px;display:flex;align-items:center;justify-content:space-between;font-size:25px}
.brand{display:flex;align-items:center;gap:16px;font-weight:700;font-size:29px;letter-spacing:-.02em}
.pill{display:inline-flex;align-items:center;gap:14px;border-radius:999px;padding:18px 30px;font-size:30px;font-weight:600}
.hl{background:linear-gradient(transparent 58%, rgba(185,162,240,.55) 58%, rgba(185,162,240,.55) 92%, transparent 92%)}
`;
const foot = (fg, sub, disc) => `<div class="foot" style="color:${sub}"><div class="brand" style="color:${fg}">${mark(disc)}Eklipse Construction Group</div><div>eklipseconstructiongroup.com</div></div>`;
const glow = (x, y, s, o = 1) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${s}px;height:${s}px;opacity:${o}">
<div style="position:absolute;inset:-40%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.98) 33%,rgba(214,196,255,.6) 40%,rgba(150,110,240,.28) 55%,rgba(106,60,201,.1) 72%,transparent 100%)"></div>
<div style="position:absolute;inset:-32%;border-radius:50%;background:repeating-conic-gradient(from 4deg,rgba(255,255,255,.13) 0deg 2deg,transparent 2deg 8deg);-webkit-mask:radial-gradient(closest-side,transparent 38%,#000 42%,transparent 94%)"></div>
<div style="position:absolute;inset:21.4%;border-radius:50%;background:#050208;box-shadow:0 0 0 3px rgba(255,255,255,.95),0 0 40px 10px rgba(214,196,255,.8)"></div></div>`;
const swipe = (fg) => `<div style="position:absolute;right:84px;bottom:150px;font-size:26px;font-weight:600;color:${fg};display:flex;align-items:center;gap:12px">Swipe <svg width="34" height="20" viewBox="0 0 34 20" fill="none" stroke="${fg}" stroke-width="3" stroke-linecap="round"><path d="M2 10h28M22 2l8 8-8 8"/></svg></div>`;
const counter = (n, t, fg) => `<div style="position:absolute;right:84px;top:92px;font-size:24px;font-weight:600;color:${fg};letter-spacing:.02em">${n} / ${t}</div>`;

/* ---------- Single posts ---------- */
const singles = {
'01-budgets-lost': `<div class="s" style="background:radial-gradient(120% 80% at 70% 85%, #3b1a78 0%, #12061f 55%, #050208 100%);color:#fff">
${glow(560, 760, 480)}
<div class="pad"><div class="eyebrow" style="color:${C.lilac}">Quantity surveyors · Southampton</div>
<div class="hook" style="font-size:118px;margin-top:34px">Most project<br>budgets are lost<br><span style="color:${C.lilac}">before anyone's<br>on site.</span></div></div>
${foot('#fff', 'rgba(255,255,255,.6)', '#050208')}</div>`,

'03-tenders-line-up': `<div class="s" style="background:${C.paper};color:${C.ink}">
<div class="pad"><div class="eyebrow" style="color:${C.violet}">Bills of quantities</div>
<div class="hook" style="font-size:104px;margin-top:30px">If your tenders<br>don't line up,<br><span class="hl">your BOQ didn't.</span></div>
<div style="margin-top:auto;background:#fff;border-radius:36px;padding:34px 36px;box-shadow:0 30px 60px -30px rgba(42,16,102,.35)">
  <div style="display:grid;grid-template-columns:2.4fr 1fr 1fr 1fr;gap:0;font-size:24px">
  ${['Item','Tender A','Tender B','Tender C'].map(h=>`<div style="padding:12px 10px;font-weight:700;color:#6e6e73;border-bottom:2px solid #e5e2ee">${h}</div>`).join('')}
  ${['Substructure','Frame','Roof','External walls','M&amp;E'].map((r,i)=>`<div style="padding:16px 10px;border-bottom:1px solid #eeebf4;font-weight:600">${r}</div>${[0,1,2].map(j=>`<div style="padding:16px 10px;border-bottom:1px solid #eeebf4"><div style="height:16px;border-radius:8px;margin-top:6px;width:${[78,64,88,70,82][i]}%;background:${j===1&&i===2?'#e8445a':C.violet};opacity:${j===1&&i===2?1:.85}"></div></div>`).join('')}`).join('')}
  </div>
  <div style="margin-top:22px;font-size:24px;color:#6e6e73">Same items. Same measurement. <b style="color:${C.ink}">Comparable prices.</b> Measured to NRM2.</div>
</div></div>
${foot(C.ink, '#6e6e73', C.ink)}</div>`,

'04-one-number': `<div class="s" style="background:${C.ink};color:#fff">
<div class="pad" style="bottom:200px"><div class="eyebrow" style="color:${C.lilac}">The Eklipse group</div>
<div class="hook" style="font-size:112px;margin-top:30px">Advice.<br>Estimates.<br>Construction.</div>
<div style="font-size:46px;font-weight:700;letter-spacing:-.03em;margin-top:22px;color:${C.lilac}">One group. One phone call.</div>
<div style="margin-top:auto;display:flex;flex-direction:column;gap:16px">
${[['P','linear-gradient(120deg,#8a63e0,#4b2496)','Piers Brown Associates','Quantity surveying &amp; project management'],['S','linear-gradient(120deg,#5d5d66,#2c2c30)','Scalerule Tenders &amp; Estimates','Tendering &amp; estimating'],['C','linear-gradient(120deg,#6f8f5d,#2f4526)','Corylus Projects','Main &amp; principal contractor']].map(([l,g,n,r])=>`<div style="background:${g};border-radius:30px;padding:26px 34px;display:flex;align-items:center;gap:28px"><div style="font-size:64px;font-weight:800;opacity:.35;width:56px">${l}</div><div><div style="font-size:36px;font-weight:700">${n}</div><div style="font-size:24px;opacity:.8;margin-top:4px">${r}</div></div></div>`).join('')}
</div></div>
${foot('#fff', 'rgba(255,255,255,.6)', C.ink)}</div>`,

'05-hiring': `<div class="s" style="background:linear-gradient(160deg,#7b4fe0 0%,#5a2ec4 45%,#2a1066 100%);color:#fff">
<div style="position:absolute;right:-260px;top:-200px;width:900px;height:900px;border-radius:50%;border:3px solid rgba(255,255,255,.18)"></div>
<div style="position:absolute;right:-120px;top:-20px;width:620px;height:620px;border-radius:50%;background:rgba(5,2,8,.55)"></div>
<div class="pad"><div class="eyebrow" style="color:#e6dcff">Careers</div>
<div class="hook" style="font-size:168px;margin-top:30px">We're<br>hiring.</div>
<div style="font-size:40px;font-weight:600;margin-top:28px;opacity:.9;letter-spacing:-.02em;max-width:22ch">Grow your career with an ambitious South Coast team.</div>
<div style="margin-top:auto;display:flex;flex-direction:column;gap:18px">
${[['Quantity Surveyor','Piers Brown Associates'],['Site Manager','Corylus Projects']].map(([r,c])=>`<div style="background:#fff;color:${C.ink};border-radius:30px;padding:32px 38px;display:flex;justify-content:space-between;align-items:center"><div><div style="font-size:46px;font-weight:800;letter-spacing:-.035em">${r}</div><div style="font-size:26px;color:#6e6e73;margin-top:4px">${c}</div></div><div style="width:72px;height:72px;border-radius:50%;background:${C.violet};display:grid;place-items:center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.6" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div></div>`).join('')}
</div></div>
${foot('#fff', 'rgba(255,255,255,.75)', '#5a2ec4')}</div>`,
};

/* ---------- Carousel: when should your QS join? ---------- */
const T = 6;
const curve = (hiStage) => `<svg viewBox="0 0 520 300" width="912" style="display:block;font-family:Inter,sans-serif">
<rect x="${40+hiStage[0]*65.7}" y="30" width="${(hiStage[1]-hiStage[0])*65.7}" height="230" rx="10" fill="rgba(185,162,240,.18)"/>
<g stroke="rgba(255,255,255,.25)"><line x1="40" y1="260" x2="500" y2="260"/></g>
<path d="M40 52 C 180 58, 250 220, 500 244" fill="none" stroke="#b9a2f0" stroke-width="6" stroke-linecap="round"/>
<path d="M40 248 C 250 238, 330 90, 500 50" fill="none" stroke="#fff" stroke-width="6" stroke-linecap="round"/>
<text x="50" y="22" font-size="16" font-weight="700" fill="#b9a2f0">Ability to influence cost</text>
<text x="498" y="22" font-size="16" font-weight="700" text-anchor="end" fill="#fff">Cost of change</text>
<g font-size="15" fill="rgba(255,255,255,.6)" text-anchor="middle">${[0,1,2,3,4,5,6,7].map(i=>`<text x="${40+i*65.7}" y="286">${i}</text>`).join('')}</g></svg>
<div style="font-size:22px;color:rgba(255,255,255,.55);margin-top:8px;text-align:center">RIBA Plan of Work 2020 stage · illustrative</div>`;
const dark = 'background:radial-gradient(120% 90% at 80% 0%, #2a1066 0%, #0b0618 60%, #050208 100%);color:#fff';
const slides = [
`<div class="s" style="${dark}">${glow(600,700,420,.95)}
<div class="pad"><div class="eyebrow" style="color:${C.lilac}">A question for developers</div>
<div class="hook" style="font-size:132px;margin-top:34px">When should<br>your QS join<br>the project?</div>
<div style="font-size:40px;font-weight:600;margin-top:30px;color:rgba(255,255,255,.75)">Earlier than you think.</div></div>
${swipe('#fff')}${foot('#fff','rgba(255,255,255,.6)','#050208')}</div>`,
`<div class="s" style="${dark}">${counter(2,T,'rgba(255,255,255,.5)')}
<div class="pad"><div class="eyebrow" style="color:${C.lilac}">Two curves</div>
<div class="hook" style="font-size:92px;margin-top:30px">Every project has two curves.</div>
<div style="margin-top:auto">${curve([0,0])}</div></div>
${swipe('#fff')}${foot('#fff','rgba(255,255,255,.6)','#050208')}</div>`,
`<div class="s" style="${dark}">${counter(3,T,'rgba(255,255,255,.5)')}
<div class="pad"><div class="eyebrow" style="color:${C.lilac}">Stages 0–2</div>
<div class="hook" style="font-size:92px;margin-top:30px">Early on, change is <span style="color:${C.lilac}">cheap</span> and influence is high.</div>
<div style="margin-top:auto">${curve([0,2])}</div></div>
${swipe('#fff')}${foot('#fff','rgba(255,255,255,.6)','#050208')}</div>`,
`<div class="s" style="${dark}">${counter(4,T,'rgba(255,255,255,.5)')}
<div class="pad"><div class="eyebrow" style="color:${C.lilac}">Stages 4–7</div>
<div class="hook" style="font-size:92px;margin-top:30px">On site, every change <span style="color:#ff8a9a">costs more</span>.</div>
<div style="margin-top:auto">${curve([4,7])}</div></div>
${swipe('#fff')}${foot('#fff','rgba(255,255,255,.6)','#050208')}</div>`,
`<div class="s" style="background:${C.paper};color:${C.ink}">${counter(5,T,'#6e6e73')}
<div class="pad"><div class="eyebrow" style="color:${C.violet}">What we do early</div>
<div class="hook" style="font-size:96px;margin-top:30px">Cost advice inside the design process.</div>
<div style="margin-top:auto;display:flex;flex-direction:column;gap:18px">
${[['01','Functional analysis','Find what each component really needs to do.'],['02','Option costing','Weigh every saving against any change in quality.'],['03','Team collaboration','Work with architects and engineers before drawings set.']].map(([n,h,p])=>`<div style="background:#fff;border-radius:30px;padding:30px 36px;display:flex;gap:30px;align-items:center"><div style="font-size:44px;font-weight:800;color:${C.violet};width:70px">${n}</div><div><div style="font-size:38px;font-weight:700;letter-spacing:-.025em">${h}</div><div style="font-size:26px;color:#6e6e73;margin-top:4px">${p}</div></div></div>`).join('')}
</div></div>
${swipe(C.ink)}${foot(C.ink,'#6e6e73',C.ink)}</div>`,
`<div class="s" style="background:linear-gradient(160deg,#7b4fe0 0%,#5a2ec4 45%,#2a1066 100%);color:#fff">${counter(6,T,'rgba(255,255,255,.7)')}
<div class="pad"><div class="eyebrow" style="color:#e6dcff">The short answer</div>
<div class="hook" style="font-size:150px;margin-top:30px">Stage 0.</div>
<div style="font-size:44px;font-weight:600;margin-top:26px;letter-spacing:-.02em;max-width:20ch;opacity:.92">The earlier we're involved, the more we can save.</div>
<div style="margin-top:auto"><div class="pill" style="background:#fff;color:${C.ink}">Talk to us about your next scheme</div></div></div>
${foot('#fff','rgba(255,255,255,.75)','#5a2ec4')}</div>`,
];

const page = (body) => `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"><style>${css} @page{size:${W}px ${H}px;margin:0} body{margin:0}</style></head><body>${body}</body></html>`;

(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: W, height: H }, deviceScaleFactor: 2 });
  for (const [n, html] of Object.entries(singles)) {
    await p.setContent(page(html), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: OUT + n + '.png' }); console.log(n);
  }
  for (const [i, html] of slides.entries()) {
    await p.setContent(page(html), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: OUT + `02-carousel-slide-${i + 1}.png` });
  }
  await p.setContent(page(slides.join('')), { waitUntil: 'networkidle' }); await p.evaluate(() => document.fonts.ready);
  await p.pdf({ path: OUT + '02-carousel-when-should-your-qs-join.pdf', width: W + 'px', height: H + 'px', printBackground: true });
  console.log('carousel');
  await b.close();
})();
