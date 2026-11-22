const { chromium } = require('playwright');
const OUT = __dirname + '/';
const mark = (fg) => `<svg viewBox="0 0 32 32" width="44" height="44"><defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#b9a2f0"/><stop offset="1" stop-color="#6a3cc9"/></linearGradient></defs><circle cx="16" cy="16" r="13" fill="none" stroke="url(#g)" stroke-width="2.4"/><circle cx="19.5" cy="13" r="8.2" fill="${fg}"/></svg>`;
const base = (dark, inner) => `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap">
<style>
*{box-sizing:border-box;margin:0}
body{width:1080px;height:1350px;overflow:hidden;font-family:Inter,-apple-system,Helvetica,Arial,sans-serif;letter-spacing:-.022em;-webkit-font-smoothing:antialiased;
 background:${dark?'#000':'#fbfbfd'};color:${dark?'#f5f5f7':'#1d1d1f'};position:relative}
.pad{position:absolute;inset:88px 88px 0 88px}
.fill{bottom:190px;display:flex;flex-direction:column}.fill .end{margin-top:auto!important}
.eyebrow{font-size:24px;font-weight:600;letter-spacing:.07em;text-transform:uppercase;color:${dark?'#b9a2f0':'#6a3cc9'}}
h1{font-weight:700;letter-spacing:-.04em;line-height:1.02}
.sub{font-size:34px;line-height:1.35;font-weight:500;color:${dark?'#a1a1a6':'#6e6e73'};letter-spacing:-.018em}
.foot{position:absolute;left:88px;right:88px;bottom:72px;display:flex;align-items:center;justify-content:space-between;font-size:24px;color:${dark?'#a1a1a6':'#6e6e73'};letter-spacing:-.01em}
.brand{display:flex;align-items:center;gap:16px;font-weight:600;font-size:28px;color:${dark?'#f5f5f7':'#1d1d1f'};letter-spacing:-.02em}
.tile{background:${dark?'#161617':'#fff'};border-radius:40px;padding:44px}
.muted{color:${dark?'#a1a1a6':'#6e6e73'}}
</style></head><body>${inner}
<div class="foot"><div class="brand">${mark(dark?'#000':'#1d1d1f')}Eklipse Construction Group</div><div>eklipseconstructiongroup.com</div></div></body></html>`;

const eclipse = (size, x, y) => `<div style="position:absolute;left:${x}px;top:${y}px;width:${size}px;height:${size}px">
<div style="position:absolute;inset:-38%;border-radius:50%;background:radial-gradient(closest-side,rgba(255,255,255,.95) 34%,rgba(214,196,255,.55) 40%,rgba(150,110,240,.22) 54%,rgba(106,60,201,.08) 70%,transparent 100%)"></div>
<div style="position:absolute;inset:-30%;border-radius:50%;background:repeating-conic-gradient(from 0deg,rgba(255,255,255,.10) 0deg 2deg,transparent 2deg 9deg);-webkit-mask:radial-gradient(closest-side,transparent 38%,#000 42%,transparent 92%)"></div>
<div style="position:absolute;inset:21.4%;border-radius:50%;background:#000;box-shadow:0 0 0 2px rgba(255,255,255,.9),0 0 30px 6px rgba(214,196,255,.7)"></div></div>`;

const posts = {
'01-cost-certainty': base(true, `${eclipse(520, 280, 640)}
<div class="pad"><div class="eyebrow">Quantity surveyors · Southampton</div>
<h1 style="font-size:104px;margin-top:30px">Cost certainty,<br>from first sketch<br>to final account.</h1></div>`),

'02-cost-of-change': base(false, `<div class="pad"><div class="eyebrow">Design management &amp; value engineering</div>
<h1 style="font-size:84px;margin-top:28px">The earlier we're involved, the more we can save.</h1>
<div class="tile" style="margin-top:56px;background:#f5f5f7;padding:40px 44px 30px">
<svg viewBox="0 0 520 300" width="816" style="display:block;font-family:Inter,sans-serif">
<g stroke="#d2d2d7"><line x1="40" y1="260" x2="500" y2="260"/><line x1="40" y1="40" x2="40" y2="260"/></g>
<path d="M40 52 C 180 58, 250 220, 500 244" fill="none" stroke="#6a3cc9" stroke-width="5" stroke-linecap="round"/>
<path d="M40 248 C 250 238, 330 90, 500 50" fill="none" stroke="#1d1d1f" stroke-width="5" stroke-linecap="round"/>
<circle cx="238" cy="146" r="7" fill="#fff" stroke="#6a3cc9" stroke-width="3"/>
<text x="52" y="34" font-size="15" font-weight="600" fill="#6a3cc9">Ability to influence cost</text>
<text x="496" y="34" font-size="15" font-weight="600" text-anchor="end" fill="#1d1d1f">Cost of change</text>
<g font-size="14" fill="#6e6e73" text-anchor="middle">${[0,1,2,3,4,5,6,7].map(i=>`<text x="${40+i*65.7}" y="283">${i}</text>`).join('')}</g>
</svg><p class="muted" style="font-size:22px;margin-top:6px;text-align:center">RIBA Plan of Work 2020 stage · illustrative</p></div></div>`),

'03-bills-of-quantities': base(false, `<div class="pad fill"><div class="eyebrow">Bills of quantities</div>
<h1 style="font-size:108px;margin-top:28px">Measured precisely.<br><span style="color:#6e6e73">Priced accurately.</span></h1>
<div class="end" style="display:grid;grid-template-columns:1fr 1fr;gap:24px">
${[['NRM2','or SMM7 where your project calls for it'],['BIM','model-based take-off'],['4 formats','ConQuest, CITE, Excel or PDF'],['QA','audit trail through dimsheets']].map(([k,v])=>`<div class="tile" style="padding:40px"><div style="font-size:64px;font-weight:700;letter-spacing:-.035em;background:linear-gradient(120deg,#1d1d1f,#6a3cc9 140%);-webkit-background-clip:text;color:transparent">${k}</div><div class="muted" style="font-size:26px;margin-top:12px;line-height:1.35">${v}</div></div>`).join('')}
</div></div>`),

'04-the-group': base(true, `<div style="position:absolute;width:1100px;height:1100px;right:-480px;top:-420px;border-radius:50%;background:radial-gradient(closest-side,rgba(185,162,240,.3),rgba(106,60,201,.1) 55%,transparent 75%)"></div>
<div class="pad fill"><div class="eyebrow">The Eklipse group</div>
<h1 style="font-size:104px;margin-top:28px">Three specialists.<br>One group.</h1>
<div class="end" style="display:flex;flex-direction:column;gap:22px">
${[['P','#8a63e0,#4b2496','Piers Brown Associates','Quantity surveying &amp; project management'],['S','#6f6f78,#2c2c30','Scalerule Tenders &amp; Estimates','Tendering &amp; estimating'],['C','#7d9a6c,#3d5631','Corylus Projects','Construction &amp; property services']].map(([l,g,n,r])=>`<div class="tile" style="display:flex;align-items:center;gap:32px;padding:34px 40px"><div style="width:88px;height:88px;border-radius:24px;flex:none;display:grid;place-items:center;font-size:40px;font-weight:700;color:#fff;background:linear-gradient(140deg,${g})">${l}</div><div><div style="font-size:38px;font-weight:600;letter-spacing:-.02em">${n}</div><div class="muted" style="font-size:26px;margin-top:6px">${r}</div></div></div>`).join('')}
</div></div>`),

'05-hiring': base(false, `<div class="pad fill"><div class="eyebrow">We're hiring</div>
<h1 style="font-size:116px;margin-top:28px">Build what's next with us.</h1>
<div class="end" style="display:flex;flex-direction:column;gap:22px">
${[['Quantity Surveyor','Piers Brown Associates'],['Site Manager','Corylus Projects']].map(([r,c])=>`<div class="tile" style="display:flex;justify-content:space-between;align-items:center;padding:44px 48px"><div><div style="font-size:52px;font-weight:700;letter-spacing:-.03em">${r}</div><div class="muted" style="font-size:28px;margin-top:8px">${c}</div></div><div style="width:72px;height:72px;border-radius:50%;background:#6a3cc9;display:grid;place-items:center"><svg width="30" height="30" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.4" stroke-linecap="round"><path d="M5 12h14M13 6l6 6-6 6"/></svg></div></div>`).join('')}
</div>
<p class="sub" style="margin-top:48px">Apply at eklipseconstructiongroup.com/careers</p></div>`),
};
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350},deviceScaleFactor:2});
for(const [n,html] of Object.entries(posts)){await p.setContent(html,{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:OUT+n+'.png'});console.log(n)}
await b.close()})();
