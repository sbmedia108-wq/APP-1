const { chromium } = require('playwright'); const fs = require('fs'); const K = require('./kit');
const F = '/home/user/APP-1/marketing/website/';
(async () => {
  const b = await chromium.launch();
  let html = fs.readFileSync(F + 'pricing-section.html', 'utf8').replace(/<link[^>]*fonts[^>]*>/g, '').replace('<style>', '<style>' + K.CSS.split('\n*{')[0]);
  for (const [name, w] of [['desktop', 1100], ['mobile', 390]]) {
    const p = await (await b.newContext({ viewport: { width: w, height: 900 }, deviceScaleFactor: 2 })).newPage();
    await p.setContent(html); await p.evaluate(() => document.fonts.ready);
    await p.screenshot({ path: F + `pricing-preview-${name}.png`, fullPage: true });
  }
  await b.close(); console.log('ok');
})();
