// Usage:
//   node render.js stills v1.html 1.0,5.2,...   -> previews/v1_<t>.png
//   node render.js video  v1.html 32 audio/track1.wav out/swot-the-app.mp4
const { chromium } = require('playwright');
const { spawn } = require('child_process');
const path = require('path');
const fs = require('fs');
(async () => {
  const [mode, page_, a3, a4, a5] = process.argv.slice(2);
  const b = await chromium.launch();
  const p = await b.newPage({ viewport: { width: 540, height: 960 }, deviceScaleFactor: 2 });
  p.on('pageerror', e => console.log('PAGE ERROR', e.message));
  p.on('console', m => { if (m.type() === 'error') console.log('CONSOLE', m.text()); });
  await p.goto('file://' + path.resolve(page_));
  await p.waitForFunction(() => window.READY === true, null, { timeout: 30000 });
  await p.evaluate(() => document.fonts.ready);
  const stage = p.locator('#stage');
  if (mode === 'stills') {
    fs.mkdirSync('previews', { recursive: true });
    const name = path.basename(page_, '.html');
    for (const t of a3.split(',').map(Number)) {
      await p.evaluate(t => seek(t), t);
      await stage.screenshot({ path: `previews/${name}_${t.toFixed(2)}.png` });
    }
  } else {
    const dur = Number(a3), fps = 30, audio = a4, out = a5;
    fs.mkdirSync(path.dirname(out), { recursive: true });
    const ff = spawn('ffmpeg', ['-y', '-hide_banner', '-loglevel', 'error',
      '-f', 'image2pipe', '-framerate', String(fps), '-c:v', 'mjpeg', '-i', '-',
      '-i', audio,
      '-af', 'loudnorm=I=-13:TP=-1.2:LRA=9',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-profile:v', 'high',
      '-c:a', 'aac', '-b:a', '192k', '-ar', '44100',
      '-t', String(dur), '-movflags', '+faststart', out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const N = Math.round(dur * fps);
    for (let i = 0; i < N; i++) {
      await p.evaluate(t => seek(t), i / fps);
      const buf = await stage.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
      if (i % 150 === 0) console.log(`frame ${i}/${N}`);
    }
    ff.stdin.end();
    await new Promise(r => ff.on('close', r));
    console.log('wrote', out);
  }
  await b.close();
})();
