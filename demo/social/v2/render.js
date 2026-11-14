const { chromium } = require('playwright');
(async () => {
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1700, height: 1500 }, deviceScaleFactor: 1 });
  await p.goto('file://' + __dirname + '/source.html');
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  await p.waitForTimeout(600);
  const fam = await p.evaluate(() => document.fonts.check('800 40px "Atkinson Hyperlegible Next"'));
  console.log('font loaded', fam);
  // nothing may spill past the 80px margin
  const over = await p.evaluate(() => [...document.querySelectorAll('section.post')].map(s => { const r = s.getBoundingClientRect();
    return [s.id, [...s.querySelectorAll('h1,p,.bubble,.why,.phone,.btn,.tv,.sig')].filter(e => { const q = e.getBoundingClientRect(); return q.right > r.right - 60 || q.bottom > r.bottom - 60 || q.left < r.left + 60; }).map(e => e.className || e.tagName).slice(0, 4)]; }).filter(x => x[1].length));
  console.log('near edge:', JSON.stringify(over));
  const names = { r1: '1-ring-159', r2: '2-spot-the-scam', r3: '3-just-say-netflix', r4: '4-things-said-to-the-telly', r5: '5-practice-mode', r6: '6-features', r7: '7-hi-mum-scam', r8: '8-coming-soon', r9: '9-intro', r10: '10-linkedin-1-in-3', r11: '11-linkedin-grandchild-screen', cover: 'facebook-cover', banner: 'linkedin-banner' };
  for (const [id, n] of Object.entries(names)) await (await p.$('#' + id)).screenshot({ path: `ask-mavis-${n}.png` });
  await b.close();
})();
