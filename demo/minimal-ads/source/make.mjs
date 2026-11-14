import { createRequire } from "node:module";
import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = new URL(".", import.meta.url).pathname;
const ad = (cls, hl, sub, screen, two = false) => `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="ads.css">
<body class="${cls}" style="${two ? "--subtop:440px; --ptop:630px" : "--subtop:310px; --ptop:500px"}">
<div class="brandline"><img src="logo.png">Ask Mavis</div>
<div class="hl">${hl}</div><div class="sub">${sub}<b>Free to download.</b></div>
<div class="phone"><div class="screen">${screen}</div></div></body>`;
const ads = {
  "1-say-it-sorted": ad("", `Say it. <span class="grad">Sorted.</span>`, "Tech help, in your own words.", `
    <div style="height:60px"></div><div class="t1">Hello, I'm Mavis. What's not working?</div>
    <div class="muted" style="margin-top:12px">Tap the big button and tell me in your own words.</div>
    <div class="btn" style="padding:70px 24px; font-size:50px">🎤<br>Tap and tell me</div>
    <div class="btn sec">🛡️ Is this a scam?</div>`),
  "2-one-step-then-the-next": ad("light", "One step.<br>Then the next.", "Big writing. Read out loud.", `
    <div class="kind"><span style="color:#1F5FBF">✕ Start over</span> <span>Step 3 of 7</span></div>
    <div class="prog"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i><i></i><i></i></div>
    <div class="t2" style="margin-top:0; line-height:1.3">No Netflix button? Find the button with a little house on it. It's called the Home button. Press it once.</div>
    <div class="hint"><b>👀 What you should see</b>A row of small pictures appears on the screen. These are the apps.</div>
    <div class="btn green">✅ Done – next step</div>`, true),
  "3-scams-spotted": ad("", `Scams, <span style="color:#FF453A">spotted.</span>`, "Check any message for warning signs.", `
    <div class="link">✕ Start over</div>
    <div class="banner"><b>🛑</b>This looks like a scam</div>
    <div class="t2">Why</div>
    <div class="card">It wants you to tap a link. Links in unexpected messages often lead to fake websites.</div>
    <div class="card">It's about a parcel or delivery fee. Fake delivery messages are very common.</div>`),
  "4-just-say-netflix": ad("light", "Just say<br>“Netflix.”", "One word is enough.", `
    <div class="link">✕ Start over</div>
    <div class="muted">No problem, let's sort it out.</div>
    <div class="t1" style="font-size:50px">What's happening with Netflix?</div>
    <div class="opt">🔍 I can't find it on the TV</div>
    <div class="opt">⏳ It's stuck or keeps loading</div>
    <div class="opt">🔑 It wants a password or payment</div>`, true),
  "5-practice-makes-confident": ad("", `Practice makes <span class="grad">confident.</span>`, "A pretend ordering screen. No queue.", `
    <div class="coach"><b>🎓 PRACTICE · nothing here is real</b>Today let's order a cheeseburger and a cup of tea. Touch the Cheeseburger.</div>
    <div class="kiosk"><div class="kbar">☀ CORNER GRILL</div><div class="menu">
      <div class="cats"><div class="on"><span>🍔</span>Burgers</div><div><span>🍗</span>Chicken</div><div><span>🍟</span>Sides</div><div><span>🥤</span>Drinks</div></div>
      <div class="items">
        <div class="item" style="box-shadow:0 0 0 10px #F59E0B"><span>🍔</span>Cheeseburger<small>£2.49</small></div>
        <div class="item"><span>🍔</span>Double Burger<small>£4.29</small></div>
        <div class="item"><span>🥬</span>Veggie Burger<small>£3.79</small></div>
        <div class="item"><span>🐟</span>Fish Burger<small>£3.49</small></div>
      </div></div></div>`, true),
  "6-no-silly-questions": ad("light", "No silly questions.", "Plain-English answers to tech words.", `
    <div class="link">✕ Start over</div>
    <div style="font-size:100px; line-height:1.1">☁️</div><div class="t1">The cloud</div>
    <div class="card" style="font-size:42px">“The cloud” just means storing your photos and files on the internet instead of only on your phone.</div>
    <div class="btn sec">🔊 Read it to me again</div>`),
};
fs.copyFileSync(`${HERE}../vid/common.css`, `${HERE}common.css`);
fs.cpSync(`${HERE}../vid/node_modules`, `${HERE}node_modules`, { recursive: true });
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
for (const [name, html] of Object.entries(ads)) {
  fs.writeFileSync(`${HERE}_page.html`, html);
  await page.goto(`file://${HERE}_page.html`); await page.evaluate(() => document.fonts.ready);
  // the video styles pause on first frame; jump every animation to its end
  await page.evaluate(() => document.getAnimations().forEach((a) => a.finish()));
  await page.screenshot({ path: `${HERE}out/ask-mavis-minimal-ad-${name}.png` });
}
await b.close();
