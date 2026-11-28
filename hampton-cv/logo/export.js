// Exports PNGs of every logo SVG plus the logo sheet PDF. Usage: node logo/export.js
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const dir = __dirname;
  const svgDir = path.join(dir, 'svg');
  const pngDir = path.join(dir, 'png');
  fs.mkdirSync(pngDir, { recursive: true });
  const b = await chromium.launch();
  const p = await b.newPage();

  for (const f of fs.readdirSync(svgDir).filter(f => f.endsWith('.svg'))) {
    const svg = fs.readFileSync(path.join(svgDir, f), 'utf8');
    const [, w, h] = svg.match(/viewBox="0 0 ([\d.]+) ([\d.]+)"/).map(Number);
    const target = f.includes('avatar') ? 1080 : f.includes('mark') ? 1024 : 2400; // px on the long edge
    const scale = target / Math.max(w, h);
    await p.setViewportSize({ width: Math.ceil(w * scale), height: Math.ceil(h * scale) });
    await p.setContent(`<style>html,body{margin:0;background:transparent}img{display:block;width:100vw;height:100vh}</style><img src="data:image/svg+xml;base64,${Buffer.from(svg).toString('base64')}">`);
    await p.screenshot({ path: path.join(pngDir, f.replace('.svg', '.png')), omitBackground: true });
  }

  await p.goto('file://' + path.join(dir, 'sheet.html'), { waitUntil: 'networkidle' });
  await p.pdf({ path: path.join(dir, '..', 'output', 'Hampton-CV-Logo.pdf'), format: 'A4', printBackground: true, preferCSSPageSize: true });
  await p.setViewportSize({ width: 794, height: 1123 });
  await p.emulateMedia({ media: 'print' });
  await p.screenshot({ path: process.argv[2] || path.join(dir, 'sheet-preview.png') });
  await b.close();
})();
