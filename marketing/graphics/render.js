// Renders every poster to PNG. Needs Playwright + Chromium.
//   node render.js
// posters.html     -> exports/                 (first set, lads included)
// popculture.html  -> exports/popculture/      (clean drafts, no lads)
//                     exports/popculture/guides/   (same, showing where the lads go)
//                     exports/popculture/tape/     (transparent tape strip to layer over the lads in Canva)
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

async function shoot(page, outDir, opts = {}) {
  fs.mkdirSync(outDir, { recursive: true });
  for (const el of await page.$$('.p')) {
    const id = await el.getAttribute('id');
    await el.screenshot({ path: path.join(outDir, id + '.png'), ...opts });
  }
}

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1200, height: 1500 } });
  const open = async (file) => {
    await page.goto('file://' + path.join(__dirname, file));
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(500);
  };

  await open('posters.html');
  await shoot(page, path.join(__dirname, 'exports'));

  const out = path.join(__dirname, 'exports', 'popculture');
  for (const file of ['popculture.html', 'set3.html']) {   // set3.html is built by build_set3.py
    await open(file);
    await shoot(page, out);
    await page.evaluate(() => document.body.classList.add('guide'));
    await shoot(page, path.join(out, 'guides'));
    await page.evaluate(() => { document.body.classList.remove('guide'); document.body.classList.add('tapeonly'); });
    await shoot(page, path.join(out, 'tape'), { omitBackground: true });
  }

  await browser.close();
  console.log('done');
})();
