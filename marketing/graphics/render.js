// Renders every poster to PNG. Needs Playwright + Chromium.
//   python3 build.py && node render.js
// all.html (built by build.py) -> exports/, one PNG per poster, named by posting date
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const OUT = { 'all.html': 'exports', 'hero.html': 'exports', 'styles.html': 'exports/styles', 'twenty.html': 'exports/twenty', 'daily.html': 'exports/daily' };

(async () => {
  const only = process.argv.slice(2);
  const browser = await chromium.launch({ args: ['--allow-file-access-from-files'] });
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1200, height: 1500 } });
  for (const [file, dir] of Object.entries(OUT)) {
    if (only.length && !only.includes(file)) continue;
    await page.goto('file://' + path.join(__dirname, file));
    await page.waitForFunction(() => document.body.dataset.ready === '1');
    await page.waitForTimeout(300);
    const outDir = path.join(__dirname, dir);
    fs.mkdirSync(outDir, { recursive: true });
    for (const el of await page.$$('.p')) {
      await el.screenshot({ path: path.join(outDir, (await el.getAttribute('id')) + '.png') });
    }
    console.log('rendered', file);
  }
  await browser.close();
})();
