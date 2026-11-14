import { createRequire } from "node:module";
import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = new URL(".", import.meta.url).pathname;
const foot = (t = "Free to download") => `<div class="foot"><div><img src="logo.png">Ask Mavis</div><span>${t}</span></div>`;
const posts = {
  "1-scam-watch-hi-mum": ["", `<span class="eyebrow red">SCAM WATCH</span>
    <div class="sms">Hi Mum 👋 I've broken my phone. This is my new number. Can you send £200?</div>
    <div class="stop">🛑 Stop. Ring them on their <u>old</u> number first.</div>
    <p>“Hi Mum, new number” is one of the most common scams.</p>`],
  "2-word-of-the-week-the-cloud": ["", `<span class="eyebrow">WORD OF THE WEEK</span>
    <div class="emoji">☁️</div><h1>“The cloud”</h1>
    <div class="card">It just means storing your photos and files on the internet, instead of only on your phone.</div>`],
  "3-brain-teaser-aeroplane": ["yellow", `<span class="eyebrow">BRAIN TEASER</span>
    <h1 style="font-size:78px">What does the little aeroplane ✈️ at the top of a phone mean?</h1>
    <div class="opt"><i>A</i>You're on a plane</div>
    <div class="opt"><i>B</i>No calls or internet</div>
    <div class="opt"><i>C</i>The battery is full</div>
    <p style="font-weight:800">Tell us A, B or C in the comments 👇</p>`],
  "4-worth-knowing-159": ["", `<span class="eyebrow">WORTH KNOWING</span>
    <div class="huge">159</div>
    <h1 style="margin-top:20px">A call about your bank? Hang up. Ring 159.</h1>
    <p>It puts you through to your bank safely.</p>`],
  "5-telly-tip-home-button": ["", `<span class="eyebrow">TELLY TIP</span>
    <div class="emoji">🏠</div><h1>Lost on the telly? Press the little house.</h1>
    <p>It's the <b>Home</b> button. It shows your apps, like Netflix and BBC iPlayer.</p>`],
  "6-scam-watch-7726": ["", `<span class="eyebrow red">SCAM WATCH</span>
    <div class="huge" style="font-size:330px">7726</div>
    <h1 style="margin-top:20px">Forward scam texts to 7726. It's free.</h1>
    <p>Easy to remember: on a keypad, it spells <b>SPAM</b>.</p>`],
  "7-no-silly-questions": ["blue", `<span class="eyebrow">A KIND REMINDER</span>
    <h1 class="xl" style="margin-top:50px">Nobody is born knowing how a smart TV works.</h1>
    <p style="margin-top:60px">There are no silly questions. Just ask.</p>`],
};
const b = await chromium.launch();
const page = await b.newPage({ viewport: { width: 1080, height: 1350 }, deviceScaleFactor: 1 });
for (const [name, [cls, inner]] of Object.entries(posts)) {
  fs.writeFileSync(`${HERE}${name}.html`, `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="posts.css"><body class="${cls}">${inner}${foot()}</body>`);
  await page.goto(`file://${HERE}${name}.html`); await page.evaluate(() => document.fonts.ready);
  await page.screenshot({ path: `${HERE}out/ask-mavis-post-${name}.png` });
}
await b.close();
