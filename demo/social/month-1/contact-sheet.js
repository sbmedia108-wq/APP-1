// Builds contact-sheet.png: every graphic of the month, in posting order, labelled with its date and theme.
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
(async () => {
  const dir = path.join(__dirname, 'posts');
  const pngs = fs.readdirSync(dir).filter(f => /^\d{4}-\d\d-\d\d-.*\.png$/.test(f)).sort();
  const day = f => new Date(f.slice(0, 10) + 'T12:00:00').toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short' });
  const label = f => f.slice(11, -4).replace(/-/g, ' ');
  const cells = pngs.map(f => `<figure><img src="posts/${f}"><figcaption><b>${day(f)}</b> ${label(f)}</figcaption></figure>`).join('');
  const html = `<!doctype html><html><head><meta charset="utf-8">
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?family=Atkinson+Hyperlegible+Next:wght@400;800&display=swap">
<style>*{margin:0;box-sizing:border-box} body{background:#eef0f4;font-family:"Atkinson Hyperlegible Next",sans-serif;padding:40px;width:2380px;color:#102A56}
h1{font-size:44px;font-weight:800;margin-bottom:6px} p{font-size:22px;margin-bottom:30px;color:#4a5a78}
.g{display:grid;grid-template-columns:repeat(6,360px);gap:28px 24px}
figure img{width:360px;height:450px;display:block;border-radius:10px;box-shadow:0 6px 16px rgba(16,42,86,.18)}
figcaption{font-size:17px;margin-top:8px;line-height:1.3} figcaption b{font-weight:800;display:block}</style></head>
<body><h1>Ask Mavis: posts for 23 November to 26 December 2026</h1><p>${pngs.length} graphics, 1080 x 1350 each. Red warns, green confirms, yellow coaches, blue introduces.</p><div class="g">${cells}</div></body></html>`;
  fs.writeFileSync(path.join(__dirname, 'contact-sheet.html'), html);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 2460, height: 1000 }, deviceScaleFactor: 1 });
  await p.goto('file://' + path.join(__dirname, 'contact-sheet.html'));
  await p.evaluate(async () => { await document.fonts.ready; await Promise.all([...document.images].map(i => i.decode().catch(() => {}))); });
  await p.screenshot({ path: path.join(__dirname, 'contact-sheet.png'), fullPage: true });
  await b.close();
  console.log('contact sheet:', pngs.length, 'graphics');
})();
