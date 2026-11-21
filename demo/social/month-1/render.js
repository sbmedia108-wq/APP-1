// Renders every posts/*.html to a 1080 x 1350 PNG of its #post, and reports layout problems:
// anything outside the 60px safe edge, elements marked .chk that overlap, and lines holding one lonely word.
// Usage: node render.js            (all posts)
//        node render.js 2026-12-0  (only files whose names contain this)
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = path.join(__dirname, 'posts');
  const only = process.argv[2] || '';
  const files = fs.readdirSync(dir).filter(f => f.endsWith('.html') && f.includes(only)).sort();
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 1120, height: 1400 }, deviceScaleFactor: 1 });
  for (const f of files) {
    await p.goto('file://' + path.join(dir, f));
    await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
    await p.waitForTimeout(400);
    const report = await p.evaluate(() => {
      const out = [];
      if (!document.fonts.check('800 40px "Atkinson Hyperlegible Next"')) out.push('FONT NOT LOADED');
      const s = document.querySelector('#post').getBoundingClientRect();
      // text blocks near or past the edge
      for (const e of document.querySelectorAll('h1,p,.lead,.sig,.say,.tag,.chk')) {
        const r = e.getBoundingClientRect();
        if (r.width === 0) continue;
        if (r.left < s.left + 56 || r.right > s.right - 56 || r.top < s.top + 56 || r.bottom > s.bottom - 50) out.push('edge: ' + (e.className || e.tagName) + ' ' + Math.round(r.left - s.left) + ',' + Math.round(r.top - s.top) + ' ' + Math.round(r.right - s.left) + ',' + Math.round(r.bottom - s.top));
      }
      // overlaps between blocks marked .chk (and the signature)
      const boxes = [...document.querySelectorAll('h1,.chk,.sig')].map(e => [e, e.getBoundingClientRect()]);
      for (let i = 0; i < boxes.length; i++) for (let j = i + 1; j < boxes.length; j++) {
        const [a, ra] = boxes[i], [c, rc] = boxes[j];
        if (a.contains(c) || c.contains(a)) continue;
        if (ra.left < rc.right && rc.left < ra.right && ra.top < rc.bottom && rc.top < ra.bottom) out.push('overlap: ' + (a.className) + ' x ' + (c.className));
      }
      // a word alone on the last line of a headline or paragraph
      for (const e of document.querySelectorAll('h1,.lead,.say .bub,p,.chk-lines')) {
        const words = []; const w = document.createTreeWalker(e, NodeFilter.SHOW_TEXT);
        while (w.nextNode()) { const n = w.currentNode; const re = /\S+/g; let m; while ((m = re.exec(n.data))) { const rg = document.createRange(); rg.setStart(n, m.index); rg.setEnd(n, m.index + m[0].length); const rr = rg.getClientRects()[0]; if (rr) words.push(rr.top); } }
        if (words.length > 3) { const last = words[words.length - 1]; const onLast = words.filter(t => Math.abs(t - last) < 4).length; const lines = new Set(words.map(t => Math.round(t / 6))).size; if (onLast === 1 && lines > 1) out.push('lonely word in: ' + (e.className || e.tagName) + ' "' + e.textContent.trim().slice(-30) + '"'); }
      }
      return out;
    });
    await (await p.$('#post')).screenshot({ path: path.join(dir, f.replace('.html', '.png')) });
    console.log(f, report.length ? '\n   ' + report.join('\n   ') : 'ok');
  }
  await b.close();
})();
