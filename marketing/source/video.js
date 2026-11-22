// Site Queue animated product video. Renders frame by frame (deterministic), then encodes with ffmpeg.
// usage: node video.js square|wide
const { chromium } = require('playwright');
const fs = require('fs');
const { execSync } = require('child_process');
const K = require('./kit');

const MODE = process.argv[2] || 'square';
const W = MODE === 'wide' ? 1920 : 1080, H = 1080, FPS = 30;
// Scene timing follows the voiceover: each scene lasts at least its minimum, or its line plus breathing room.
const TTS = '/tmp/claude-0/-home-user-APP-1/60ebac03-fad6-5156-a5c9-2f31bd489645/scratchpad/tts/';
const vo = id => parseFloat(execSync(`ffprobe -v error -show_entries format=duration -of csv=p=0 ${TTS}l_${id}.wav`).toString());
const LEAD = 0.5;
const dur = { s1: Math.max(7.0, vo('s1') + LEAD + 1.2), s2: Math.max(3.2, vo('s2') + LEAD + 1.0), s3: Math.max(4.5, vo('s3') + LEAD + 1.4) };
const fd = [0, 1, 2, 3, 4, 5].map(i => Math.max(4.2, vo('f' + i) + LEAD + 0.8));
dur.s5 = Math.max(4.5, vo('s5') + LEAD + 1.4); dur.s6 = vo('s6') + LEAD + 1.6;
const T = { s1: 0 }; T.s2 = T.s1 + dur.s1; T.s3 = T.s2 + dur.s2; T.f = [T.s3 + dur.s3]; for (let i = 1; i < 6; i++) T.f[i] = T.f[i - 1] + fd[i - 1];
T.s5 = T.f[5] + fd[5]; T.s6 = T.s5 + dur.s5; const DUR = T.s6 + dur.s6;
const CUES = [['s1', T.s1], ['s2', T.s2], ['s3', T.s3], ...T.f.map((t, i) => ['f' + i, t]), ['s5', T.s5], ['s6', T.s6]].map(([id, t]) => [id, t + LEAD]);
const FR = `/tmp/claude-0/-home-user-APP-1/60ebac03-fad6-5156-a5c9-2f31bd489645/scratchpad/frames-${MODE}`;
const OUT = `${K.ROOT}/video/site-queue-${MODE === 'wide' ? '16x9' : '1x1'}.mp4`;
fs.rmSync(FR, { recursive: true, force: true }); fs.mkdirSync(FR, { recursive: true }); fs.mkdirSync(K.ROOT + '/video', { recursive: true });

const wide = MODE === 'wide';
// layout: text column and phone position
const TX = 90, TW = wide ? 1700 : 900;
const PX = wide ? 1180 : 600, PY = wide ? 150 : 330, PW = wide ? 420 : 380;

const olds = ['Radio calls for the forklift', 'Six WhatsApp groups', 'Paper induction packs', 'A whiteboard programme', 'Drawings out of date', 'Shouting for a first aider'];
const feats = [
  ['Forklift and deliveries', 'Book it in seconds. See the wait.', K.phoneQueue()],
  ['Digital inductions', 'Done on the phone before day one.', K.phoneInduction()],
  ['Live site map', 'Plant, hazards and first aid, live.', K.phoneMap()],
  ['Drawings and RAMS', 'Always the current revision.', K.phoneDrawings()],
  ['First-aid alerts', 'Help found in seconds.', K.phoneAlert()],
  ['Site feed', 'One noticeboard, not six chats.', K.phoneFeed()],
];

const htmlRaw = `<!doctype html><html><head><style>${K.CSS}
body{width:${W}px;height:${H}px;background:#1F1F1F;overflow:hidden}
.sc{position:absolute;inset:0;opacity:0}
.it{position:absolute;opacity:0;will-change:transform,opacity}
.d,.it>div,.it{text-wrap:balance}
.strike{position:absolute;left:0;top:52%;height:5px;background:#80D83B;width:0}
</style></head><body>
<!-- S1: how sites run today -->
<div class="sc on-char" id="s1">
  <div class="it d" id="s1h" style="left:${TX}px;top:${wide ? 150 : 120}px;width:${TW}px;font-size:${wide ? 96 : 92}px">Most UK sites still run on…</div>
  ${olds.map((o, i) => `<div class="it" id="o${i}" style="left:${TX}px;top:${(wide ? 360 : 380) + i * 96}px;font-size:${wide ? 50 : 48}px;font-weight:600;color:#D9DCD5;white-space:nowrap"><span style="position:relative;display:inline-block">${o}<span class="strike" id="k${i}"></span></span></div>`).join('')}
</div>
<!-- S2: the answer -->
<div class="sc on-lime" id="s2">
  <div class="it d" id="s2h" style="left:${TX}px;top:${wide ? 330 : 300}px;width:${wide ? 1500 : 900}px;font-size:${wide ? 190 : 150}px;width:${wide ? 1500 : 960}px">One app replaces<br>all of it.</div>
</div>
<!-- S3: today on site -->
<div class="sc on-con" id="s3">
  ${K.sitePlan(W, H)}
  <div class="it" id="s3t" style="left:${TX}px;top:${wide ? 330 : 120}px;width:${wide ? 900 : 460}px">
    <div class="d" style="font-size:${wide ? 120 : 100}px">Your whole site, on one screen.</div></div>
  <div class="it" id="s3p" style="left:${PX}px;top:${wide ? 120 : PY - 60}px">${K.phone(0, 0, PW + 40, K.phoneHome())}</div>
</div>
<!-- S4: features -->
<div class="sc on-char" id="s4">
  ${feats.map(([t, s, scr], i) => `
  <div class="it" id="ft${i}" style="left:${TX}px;top:${wide ? 360 : 140}px;width:${wide ? 900 : 470}px">
    <div style="font-size:${wide ? 30 : 28}px;font-weight:700;color:#80D83B;margin-bottom:18px">${i + 1} of 6</div>
    <div class="d" style="font-size:${wide ? 120 : 92}px">${t}</div>
    <div style="font-size:${wide ? 40 : 34}px;line-height:1.3;color:#B7BCB4;margin-top:24px;font-weight:500">${s}</div></div>
  <div class="it" id="fp${i}" style="left:${PX}px;top:${PY - (wide ? 40 : 100)}px">${K.phone(0, 0, PW + (wide ? 40 : 60), scr)}</div>`).join('')}
</div>
<!-- S5: office dashboard -->
<div class="sc on-char" id="s5">
  <div class="it d" id="s5h" style="left:${TX}px;top:${wide ? 110 : 110}px;width:${wide ? 1700 : 900}px;font-size:${wide ? 104 : 92}px">And the office sees it all, live.</div>
  <div class="it" id="s5l" style="left:${wide ? 260 : 60}px;top:${wide ? 330 : 430}px">${K.laptop(0, 0, wide ? 1400 : 1100, 'overview')}</div>
</div>
<!-- S6: end card -->
<div class="sc on-lime" id="s6">
  <img class="it tile" id="s6l" src="${K.LOGO}" style="left:${TX}px;top:${wide ? 140 : 120}px;width:${wide ? 170 : 150}px">
  <div class="it d" id="s6h" style="left:${TX}px;top:${wide ? 390 : 360}px;width:${wide ? 1500 : 900}px;font-size:${wide ? 170 : 140}px">Run the whole site from one app.</div>
  <div class="it" id="s6s" style="left:${TX + 4}px;top:${wide ? 800 : 820}px;font-size:${wide ? 44 : 40}px;font-weight:700">Launching 2027. Early access open now.</div>
  <div class="it d" id="s6u" style="left:${TX}px;top:${wide ? 880 : 900}px;font-size:${wide ? 72 : 66}px;color:#2E5A14">sitequeue.uk</div>
</div>
<script>
const $ = id => document.getElementById(id);
const e3 = x => 1 - Math.pow(1 - Math.max(0, Math.min(1, x)), 3);
// visible between a and b seconds, with fade-in/out and a rise
function show(id, t, a, b, o = {}) {
  const el = $(id), f = o.f || .45, dy = o.dy ?? 40, dx = o.dx || 0, sc = o.s || 0;
  let op = 0, k = 0;
  if (t >= a && t <= b) { const i = e3((t - a) / f), u = e3((b - t) / f); op = Math.min(i, u); k = i; }
  el.style.opacity = op;
  el.style.transform = 'translate(' + (dx * (1 - k)) + 'px,' + (dy * (1 - k)) + 'px) scale(' + (1 - sc * (1 - k)) + ')';
}
function scene(id, t, a, b) { $(id).style.opacity = (t >= a && t < b) ? 1 : 0; }
window.render = t => {
  const T = __T__, fd = __FD__;
  scene('s1', t, 0, T.s2); scene('s2', t, T.s2, T.s3); scene('s3', t, T.s3, T.f[0]); scene('s4', t, T.f[0], T.s5); scene('s5', t, T.s5, T.s6); scene('s6', t, T.s6, 999);
  show('s1h', t, 0.2, T.s2);
  // list appears quickly, then each item is struck as the voice names it
  for (let i = 0; i < 6; i++) { show('o' + i, t, 0.7 + i * .25, T.s2, { dy: 24, f: .35 }); $('k' + i).style.width = (100 * e3((t - (2.4 + i * .62)) / .35)) + '%'; }
  show('s2h', t, T.s2 + .05, T.s3, { dy: 60, s: .04 });
  show('s3t', t, T.s3 + .1, T.f[0]); show('s3p', t, T.s3 + .3, T.f[0], { dy: 140, f: .7 });
  for (let i = 0; i < 6; i++) { const a = T.f[i], b = a + fd[i]; show('ft' + i, t, a, b, { dy: 0, dx: -40, f: .45 }); show('fp' + i, t, a, b, { dy: 0, dx: 120, f: .5 }); }
  show('s5h', t, T.s5 + .1, T.s6); show('s5l', t, T.s5 + .4, T.s6, { dy: 160, f: .8 });
  show('s6l', t, T.s6 + .1, 999, { s: .2 }); show('s6h', t, T.s6 + .4, 999, { dy: 50 }); show('s6s', t, T.s6 + 1.4, 999); show('s6u', t, T.s6 + 2.2, 999);
};
render(0);
</script></body></html>`;

const html = htmlRaw.replace('__T__', JSON.stringify(T)).replace('__FD__', JSON.stringify(fd));
(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: W, height: H }, deviceScaleFactor: 1 })).newPage();
  await p.setContent(html); await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const N = Math.ceil(FPS * DUR);
  for (let f = 0; f < N; f++) {
    await p.evaluate(t => window.render(t), f / FPS);
    await p.screenshot({ path: `${FR}/${String(f).padStart(4, '0')}.jpg`, type: 'jpeg', quality: 93 });
  }
  await b.close();
  const A = FR + '/../audio-' + MODE; fs.mkdirSync(A, { recursive: true });
  execSync(`python3 ${__dirname}/music.py ${A}/music.wav ${DUR} ${T.s2} ${T.s3} ${T.f[0]} ${T.s5} ${T.s6}`);
  const ins = CUES.map(([id]) => `-i ${TTS}l_${id}.wav`).join(' ');
  const dl = CUES.map(([id, t], i) => `[${i}:a]aresample=44100,pan=stereo|c0=c0|c1=c0,adelay=${Math.round(t * 1000)}|${Math.round(t * 1000)}[v${i}]`).join(';');
  execSync(`ffmpeg -y -loglevel error ${ins} -filter_complex "${dl};${CUES.map((_, i) => `[v${i}]`).join('')}amix=inputs=${CUES.length}:normalize=0,apad,atrim=0:${DUR},loudnorm=I=-16:TP=-1.5[vo]" -map "[vo]" ${A}/vo.wav`);
  execSync(`ffmpeg -y -loglevel error -i ${A}/music.wav -i ${A}/vo.wav -filter_complex "[0:a]volume=0.32[m];[1:a]asplit[v][sc];[m][sc]sidechaincompress=threshold=0.03:ratio=6:attack=40:release=500[md];[md][v]amix=inputs=2:normalize=0,alimiter=limit=0.8:level=false[a]" -map "[a]" -ar 44100 ${A}/mix.wav`);
  execSync(`ffmpeg -y -loglevel error -framerate ${FPS} -i ${FR}/%04d.jpg -i ${A}/mix.wav -c:v libx264 -preset slow -crf 18 -pix_fmt yuv420p -c:a aac -b:a 192k -shortest -movflags +faststart ${OUT}`);
  console.log('timeline', JSON.stringify({ T, fd, DUR }));
  for (const t of [1.5, 4.5, T.s2 + 1, T.s3 + 2, ...T.f.map(x => x + 2), T.s5 + 2.5, T.s6 + 4]) execSync(`ffmpeg -y -loglevel error -ss ${t} -i ${OUT} -frames:v 1 ${FR}/../still-${MODE}-${t}.jpg`);
  fs.rmSync(FR, { recursive: true, force: true });
  console.log('wrote', OUT, fs.statSync(OUT).size);
})();
