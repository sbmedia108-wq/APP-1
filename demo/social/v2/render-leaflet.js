// Renders the A5 leaflet: a print PDF (with bleed) and two PNG previews.
const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 582, height: 816 }, deviceScaleFactor: 3 });
  await p.goto('file://' + __dirname + '/leaflet.html');
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  await p.waitForTimeout(400);
  // Nothing may spill out of the safe area that printers won't trim.
  const over = await p.evaluate(() => [...document.querySelectorAll('.safe')].map(s => { const r = s.getBoundingClientRect();
    return [...s.querySelectorAll('*')].filter(e => { const q = e.getBoundingClientRect(); return q.bottom > r.bottom + 1 || q.right > r.right + 1; }).map(e => e.className || e.tagName).slice(0, 5); }));
  const gap = await p.evaluate(() => { const s = document.querySelector('.back .safe'); return Math.round(s.querySelector('.bottom').getBoundingClientRect().top - s.querySelector('.steps').getBoundingClientRect().bottom); });
  console.log('overflow:', JSON.stringify(over), 'gap above QR row (px):', gap);
  await p.pdf({ path: 'ask-mavis-leaflet-A5-print.pdf', width: '154mm', height: '216mm', printBackground: true, preferCSSPageSize: true });
  const pages = await p.$$('section.page');
  await pages[0].screenshot({ path: 'ask-mavis-leaflet-front.png' });
  await pages[1].screenshot({ path: 'ask-mavis-leaflet-back.png' });
  await b.close();
})();
