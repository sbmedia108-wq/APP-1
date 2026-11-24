// Two trend posts (Nov 2026). Run: node generate-trends.js  (needs Playwright)
const { chromium } = require('playwright');
const OUT = __dirname + '/trends/';
const W = 1080, H = 1350;
const mark = (disc) => `<svg viewBox="0 0 32 32" width="46" height="46"><circle cx="16" cy="16" r="13" fill="none" stroke="#b9a2f0" stroke-width="2.6"/><circle cx="19.5" cy="13" r="8.2" fill="${disc}"/></svg>`;
const css = `*{box-sizing:border-box;margin:0}
.s{width:${W}px;height:${H}px;position:relative;overflow:hidden;font-family:Inter,-apple-system,Helvetica,Arial,sans-serif;letter-spacing:-.025em;-webkit-font-smoothing:antialiased}
.pad{position:absolute;left:84px;right:84px;top:84px;bottom:190px;display:flex;flex-direction:column}
.eyebrow{font-size:26px;font-weight:700;letter-spacing:.08em;text-transform:uppercase}
.hook{font-weight:800;letter-spacing:-.05em;line-height:.98}
.foot{position:absolute;left:84px;right:84px;bottom:70px;display:flex;align-items:center;justify-content:space-between;font-size:25px}
.brand{display:flex;align-items:center;gap:16px;font-weight:700;font-size:29px;letter-spacing:-.02em}
.src{font-size:21px;letter-spacing:-.005em;line-height:1.35}`;
const foot = (fg, sub, disc) => `<div class="foot" style="color:${sub}"><div class="brand" style="color:${fg}">${mark(disc)}Eklipse Construction Group</div><div>eklipseconstructiongroup.com</div></div>`;

const bars = [18, 26, 31, 37, 46, 58, 74];
const posts = {
'01-tender-prices-rising': `<div class="s" style="background:radial-gradient(110% 80% at 85% 100%, #3b1a78 0%, #12061f 55%, #050208 100%);color:#fff">
<div class="pad"><div class="eyebrow" style="color:#b9a2f0">Market update · November 2026</div>
<div class="hook" style="font-size:108px;margin-top:30px">Tender prices<br>are rising again.</div>
<div style="font-size:44px;font-weight:700;margin-top:22px;color:#b9a2f0;letter-spacing:-.03em">Is your cost plan?</div>
<div style="margin-top:auto;display:flex;align-items:flex-end;gap:16px;height:200px">
${bars.map((h,i)=>`<div style="flex:1;height:${h+20}%;border-radius:12px 12px 4px 4px;background:${i===bars.length-1?'linear-gradient(#e6dcff,#b9a2f0)':'rgba(185,162,240,'+(0.14+i*0.07)+')'}"></div>`).join('')}
</div>
<div style="margin-top:40px">
  <div style="font-size:240px;font-weight:800;letter-spacing:-.06em;line-height:.85;background:linear-gradient(120deg,#fff 30%,#b9a2f0);-webkit-background-clip:text;color:transparent">+3.75%</div>
  <div style="font-size:30px;font-weight:600;margin-top:18px;line-height:1.25">a year forecast for UK building tender prices, 2026 and 2027</div>
  <div class="src" style="color:rgba(255,255,255,.55);margin-top:14px">Source: Turner &amp; Townsend, November 2026</div>
</div></div>
${foot('#fff','rgba(255,255,255,.6)','#050208')}</div>`,

'02-future-homes-standard': `<div class="s" style="background:#f5f3fa;color:#0b0b0d">
<div class="pad"><div class="eyebrow" style="color:#6a3cc9">Future Homes Standard</div>
<div class="hook" style="font-size:100px;margin-top:30px">4 months to go.<br><span style="color:#6a3cc9">Is your next scheme<br>costed for it?</span></div>
<div style="margin-top:auto;display:flex;flex-direction:column;gap:16px">
${[['24 Mar 2027','In force','New Part L energy rules apply to new homes in England.','#6a3cc9','#fff'],
   ['24 Sep 2027','Higher-risk buildings','A separate, later timetable applies.','#fff','#0b0b0d'],
   ['24 Mar 2028','Last chance to start','Homes applied for before 24 Mar 2027 must start on site by now to stay on the current rules.','#fff','#0b0b0d']].map(([d,t,p,bg,fg])=>`<div style="background:${bg};color:${fg};border-radius:30px;padding:28px 34px;display:flex;gap:30px;align-items:center;box-shadow:0 20px 40px -30px rgba(42,16,102,.4)">
<div style="font-size:40px;font-weight:800;letter-spacing:-.035em;width:270px;flex:none">${d}</div>
<div><div style="font-size:31px;font-weight:700">${t}</div><div style="font-size:23px;opacity:.75;margin-top:4px;line-height:1.3">${p}</div></div></div>`).join('')}
<div class="src" style="color:#6e6e73;margin-top:4px">Source: MHCLG Building Circular 01/2026. Check transitional rules for your plots.</div>
</div></div>
${foot('#0b0b0d','#6e6e73','#0b0b0d')}</div>`,
};
const page = (b) => `<!doctype html><html><head><meta charset="utf-8"><link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&display=swap"><style>${css} body{margin:0}</style></head><body>${b}</body></html>`;
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:W,height:H},deviceScaleFactor:2});
for(const [n,h] of Object.entries(posts)){await p.setContent(page(h),{waitUntil:'networkidle'});await p.evaluate(()=>document.fonts.ready);await p.screenshot({path:OUT+n+'.png'});console.log(n)}
await b.close()})();
