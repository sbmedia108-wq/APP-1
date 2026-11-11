// Renders every poster in posters.html to a PNG in exports/.
// Usage: node render.js   (needs Playwright + Chromium)
const { chromium } = require('playwright');
const path = require('path');

(async () => {
  const browser = await chromium.launch();
  const page = await browser.newPage({ deviceScaleFactor: 2, viewport: { width: 1200, height: 1500 } });
  await page.goto('file://' + path.join(__dirname, 'posters.html'));
  await page.evaluate(() => document.fonts.ready);
  await page.waitForTimeout(500);
  for (const el of await page.$$('.p')) {
    const id = await el.getAttribute('id');
    await el.screenshot({ path: path.join(__dirname, 'exports', id + '.png') });
    console.log('rendered', id);
  }
  await browser.close();
})();
