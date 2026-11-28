// Renders the PDFs and social images. Usage: node build.js [previewDir]
const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

(async () => {
  const out = path.join(__dirname, 'output');
  fs.mkdirSync(path.join(out, 'social'), { recursive: true });
  const src = f => 'file://' + path.join(__dirname, 'src', f);
  const b = await chromium.launch();

  const p = await b.newPage();
  for (const [f, name] of [['campaign.html', 'Hampton-CV-Launch-Campaign.pdf'], ['cv-samples.html', 'Hampton-CV-Sample-CVs.pdf']]) {
    await p.goto(src(f), { waitUntil: 'networkidle' });
    await p.pdf({ path: path.join(out, name), format: 'A4', printBackground: true, preferCSSPageSize: true });
  }

  const s = await b.newPage({ viewport: { width: 1080, height: 1080 } });
  await s.goto(src('social.html'), { waitUntil: 'networkidle' });
  for (const id of ['s1', 's2', 's3']) {
    await (await s.$('#' + id)).screenshot({ path: path.join(out, 'social', `post-${id.slice(1)}.png`) });
  }

  const prev = process.argv[2];
  if (prev) {
    fs.mkdirSync(prev, { recursive: true });
    const v = await b.newPage({ viewport: { width: 794, height: 1123 } });
    await v.emulateMedia({ media: 'print' });
    for (const f of ['campaign.html', 'cv-samples.html']) {
      await v.goto(src(f), { waitUntil: 'networkidle' });
      const pages = await v.$$('.page');
      for (let i = 0; i < pages.length; i++) {
        await pages[i].screenshot({ path: path.join(prev, `${f.split('.')[0]}-${i + 1}.png`) });
      }
    }
  }
  await b.close();
})();
