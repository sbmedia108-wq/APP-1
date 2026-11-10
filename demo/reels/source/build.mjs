// Builds the vertical Ask Mavis videos: HTML scenes -> frames (Playwright) -> mp4 (ffmpeg) with voice + app sounds.
// usage: node build.mjs <repo> [video ...] [--still]
import { createRequire } from "node:module";
const { chromium } = createRequire(import.meta.url)("playwright");
import { execFileSync, spawn } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { videos } from "./videos.mjs";

const HERE = path.dirname(new URL(import.meta.url).pathname);
const REPO = process.argv[2];
const only = process.argv.slice(3).filter((a) => !a.startsWith("--"));
const STILL = process.argv.includes("--still");
const FPS = 30, LEAD = 0.3, GAP = 0.55, TAIL = 1.6;
const sh = (cmd, args) => execFileSync(cmd, args, { encoding: "utf8", stdio: ["ignore", "pipe", "ignore"] });
fs.mkdirSync(`${HERE}/out`, { recursive: true });
fs.mkdirSync(`${HERE}/trim`, { recursive: true });
fs.copyFileSync(`${REPO}/demo/ask-mavis-logo.png`, `${HERE}/logo.png`);

const browser = await chromium.launch();
for (const [name, v] of Object.entries(videos)) {
  if (only.length && !only.includes(name)) continue;
  // 1. trim silence off each voice line and time the scenes around it
  let t = 0;
  const audio = [];
  for (const [i, sc] of v.scenes.entries()) {
    const src = `${HERE}/wav/${name}__${sc.key}.wav`, dst = `${HERE}/trim/${name}__${sc.key}.wav`;
    sh("ffmpeg", ["-y", "-i", src, "-af",
      "atempo=0.94", dst]);
    const dur = parseFloat(sh("ffprobe", ["-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", dst]));
    sc.start = t;
    audio.push({ file: dst, at: t + LEAD, vol: 1 });
    for (const [s, d] of sc.sfx || []) audio.push({ file: `${REPO}/app/assets/sounds/${s}.wav`, at: t + d, vol: 0.3 });
    t += LEAD + dur + (sc.hold || 0) + (i === v.scenes.length - 1 ? TAIL : GAP);
  }
  const total = t, frames = Math.round(total * FPS);

  // 2. the page
  const html = `<!doctype html><meta charset="utf-8"><title>${v.title}</title><link rel="stylesheet" href="common.css"><body>
${v.scenes.map((sc) => sc.html.replace("$S", sc.start.toFixed(3))).join("\n")}</body>`;
  fs.writeFileSync(`${HERE}/${name}.html`, html);
  const page = await browser.newPage({ viewport: { width: 1080, height: 1920 }, deviceScaleFactor: 1 });
  await page.goto(`file://${HERE}/${name}.html`);
  await page.evaluate(() => document.fonts.ready);
  const spans = await page.evaluate(() => document.getAnimations().map((a) => {
    a.pause(); const c = a.effect.getComputedTiming(); return [c.delay, c.endTime];
  }));
  const seek = (ms) => page.evaluate((ms) => { for (const a of document.getAnimations()) a.currentTime = ms; }, ms);

  if (STILL) { // one frame near the end of each scene, for checking the layout
    for (const [i, sc] of v.scenes.entries()) {
      const endT = (i + 1 < v.scenes.length ? v.scenes[i + 1].start : total) - 0.1;
      await seek(endT * 1000);
      await page.screenshot({ path: `${HERE}/out/${name}-${i + 1}-${sc.key}.jpg`, type: "jpeg", quality: 70 });
    }
    await page.close(); console.log(name, "stills", total.toFixed(1) + "s"); continue;
  }

  // 3. frames -> ffmpeg, reusing the last frame while nothing is moving
  const silent = `${HERE}/out/${name}.silent.mp4`;
  const ff = spawn("ffmpeg", ["-y", "-f", "image2pipe", "-framerate", String(FPS), "-c:v", "png", "-i", "-",
    "-c:v", "libx264", "-preset", "slow", "-crf", "17", "-pix_fmt", "yuv420p", "-r", String(FPS), silent], { stdio: ["pipe", "ignore", "ignore"] });
  let last = null, shots = 0;
  for (let f = 0; f < frames; f++) {
    const ms = (f / FPS) * 1000;
    if (!last || spans.some(([a, b]) => ms >= a - 40 && ms <= b + 80)) {
      await seek(ms); last = await page.screenshot({ type: "png" }); shots++;
    }
    if (!ff.stdin.write(last)) await new Promise((r) => ff.stdin.once("drain", r));
  }
  ff.stdin.end();
  await new Promise((r) => ff.on("close", r));
  await page.close();

  // 4. sound: voice lines and app sounds placed on the timeline
  const args = ["-y", "-i", silent];
  audio.forEach((a) => args.push("-i", a.file));
  const fc = audio.map((a, i) => `[${i + 1}:a]aresample=48000,volume=${a.vol},adelay=${Math.round(a.at * 1000)}:all=1[a${i}]`).join(";") +
    ";" + audio.map((_, i) => `[a${i}]`).join("") + `amix=inputs=${audio.length}:normalize=0,apad,atrim=0:${total.toFixed(3)},loudnorm=I=-16:TP=-1.5[out]`;
  args.push("-filter_complex", fc, "-map", "0:v", "-map", "[out]", "-c:v", "copy", "-c:a", "aac", "-b:a", "160k", "-ar", "48000", "-movflags", "+faststart", `${HERE}/out/${name}.mp4`);
  sh("ffmpeg", args);
  fs.rmSync(silent);
  console.log(name, total.toFixed(1) + "s", `${frames} frames (${shots} drawn)`);
}
await browser.close();
