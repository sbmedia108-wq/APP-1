const { chromium } = require('playwright'); const fs = require('fs');
const shots = [
  ['01','Talk, don’t type','Talk the job.<br><em>Done.</em>','Say it like you’d tell your labourer. Graft does the sums.','03-talk-memory.png'],
  ['02','Itemised. Priced. Proper.','Priced before the <em>kettle’s boiled.</em>','Labour, materials, waste and VAT at your rates.','04-quote.png'],
  ['03','Straight to their phone','Sent on <em>WhatsApp.</em> Not by pigeon.','One tap. Deposit and dates spelled out.','05-quote-total.png'],
  ['04','Materials finder','Cheapest <em>4x4s</em> near you.','Seven merchants compared. Your own prices remembered.','09-materials.png'],
  ['05','Won it?','Booked in. <em>Calendar sorted.</em>','Straight into your phone’s calendar, reminder included.','13-book.png'],
  ['06','Van check','Don’t be the lad who <em>left the drill.</em>','Tick off your kit before you leave site.','11-vancheck.png'],
  ['07','Receipts','Receipts sorted. <em>Accountant happy.</em>','Snap it, get a clean record. Monthly PDF, done.','07-receipts.png'],
];
(async () => { const b = await chromium.launch(); const p = await b.newPage({ viewport: { width: 1080, height: 1920 } });
  const tpl = fs.readFileSync('shot.html','utf8');
  for (const [n,e,h,s,img] of shots) { fs.writeFileSync('t.html', tpl.replace('EYEBROW',e).replace('HEADLINE',h).replace('SUB',s).replace('SCREEN',img));
    await p.goto('file://' + process.cwd() + '/t.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
    await p.screenshot({ path: `/home/user/APP-1/marketing/store/screenshot-${n}.png` }); }
  await p.setViewportSize({ width: 1024, height: 500 });
  await p.goto('file://' + process.cwd() + '/feature.html', { waitUntil: 'networkidle' }); await p.waitForTimeout(400);
  await p.screenshot({ path: '/home/user/APP-1/marketing/store/feature-graphic.png' });
  await b.close(); })();
