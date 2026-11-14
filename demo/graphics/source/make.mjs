import { createRequire } from "node:module";
import fs from "node:fs";
const { chromium } = createRequire(import.meta.url)("playwright");
const HERE = new URL(".", import.meta.url).pathname;
const Y = process.argv[2] || "#FFC844";
const foot = (t = "Free to download") => `<div class="foot"><div><img src="logo.png">Ask Mavis</div><span>${t}</span></div>`;
const sign = (n, cls, emoji, title, why) => [1080, 1080, `sq ${cls}`, `<span class="eyebrow red">SIGN ${n} OF 5</span><div class="count">${n + 1} / 7</div>
  <div class="emoji">${emoji}</div><h1 style="margin-top:14px">${title}</h1><p>${why}</p>${foot("Swipe →")}`];
const hl = (cls, emoji, label) => [1080, 1920, `hl ${cls}`, `<div class="ring">${emoji}</div><div class="lab">${label}</div>`];
const g = {
  // --- carousel: 5 signs a message is a scam (wording from the app's scam checker)
  "carousel-scam-signs/1-cover": [1080, 1080, "sq red", `<span class="eyebrow">SCAM WATCH</span><div class="count">1 / 7</div>
    <h1 style="font-size:124px">5 signs a message is a scam</h1><p>Save this, and share it with someone you love.</p>${foot("Swipe →")}`],
  "carousel-scam-signs/2-codes": sign(1, "", "🔑", "It asks for a code, PIN or password", "Real banks and companies never ask for these."),
  "carousel-scam-signs/3-safe-account": sign(2, "", "💷", "It says to move your money to a “safe account”", "This is always a scam."),
  "carousel-scam-signs/4-gift-cards": sign(3, "", "🎁", "It asks for gift cards or crypto", "No real company or official asks to be paid this way."),
  "carousel-scam-signs/5-rushing": sign(4, "", "⏰", "It tries to rush or frighten you", "Scammers do this so you don't stop to think."),
  "carousel-scam-signs/6-links": sign(5, "", "🔗", "It wants you to tap a link", "Links in unexpected messages often lead to fake websites."),
  "carousel-scam-signs/7-ask-mavis": [1080, 1080, "sq blue", `<span class="eyebrow">NOT SURE?</span><div class="count">7 / 7</div>
    <h1 style="font-size:124px">Ask Mavis.</h1><p>Say or type what the message said. Mavis checks it for warning signs, and tells you what to do.</p>${foot()}`],
  // --- how it works
  "ask-mavis-how-it-works": [1080, 1350, "p45", `<span class="eyebrow">HOW IT WORKS</span><h1>Help in three small steps</h1>
    <div class="step"><div class="num">1</div><div>Tap the big button and say what's wrong</div><div class="emoji" style="margin-left:auto">🎤</div></div>
    <div class="step"><div class="num">2</div><div>Check what Mavis heard</div><div class="emoji" style="margin-left:auto">✅</div></div>
    <div class="step"><div class="num">3</div><div>Follow one small step at a time, read out loud</div><div class="emoji" style="margin-left:auto">🔊</div></div>${foot()}`],
  "ask-mavis-what-mavis-helps-with": [1080, 1350, "p45", `<span class="eyebrow">WHAT MAVIS HELPS WITH</span><h1 style="font-size:80px; margin:24px 0 0">Mavis can help with…</h1>
    <div class="step" style="padding:20px 40px; margin-top:22px"><div class="emoji">📺</div><div>The telly and the remote</div></div>
    <div class="step" style="padding:20px 40px; margin-top:22px"><div class="emoji">📱</div><div>Your phone or tablet</div></div>
    <div class="step" style="padding:20px 40px; margin-top:22px"><div class="emoji">🩺</div><div>Booking the doctor</div></div>
    <div class="step" style="padding:20px 40px; margin-top:22px"><div class="emoji">🛡️</div><div>Spotting a scam</div></div>
    <div class="step" style="padding:20px 40px; margin-top:22px"><div class="emoji">🍔</div><div>Ordering screens</div></div>${foot()}`],
  // --- stories
  "stories/ask-mavis-story-159": [1080, 1920, "st", `<span class="eyebrow">WORTH KNOWING</span><div class="huge">159</div>
    <h1>A call about your bank? Hang up. Ring 159.</h1><p>It puts you through to your bank safely.</p>${foot()}`],
  "stories/ask-mavis-story-7726": [1080, 1920, "st", `<span class="eyebrow red">SCAM WATCH</span><div class="huge" style="font-size:340px">7726</div>
    <h1>Forward scam texts to 7726. It's free.</h1><p>On a keypad, it spells <b>SPAM</b>.</p>${foot()}`],
  "stories/ask-mavis-story-no-silly-questions": [1080, 1920, "st blue", `<span class="eyebrow">A KIND REMINDER</span>
    <h1 style="font-size:124px; margin-top:70px">Nobody is born knowing how a smart TV works.</h1><p>There are no silly questions. Just ask.</p>${foot()}`],
  "stories/ask-mavis-story-telly-playing-up": [1080, 1920, "st yellow", `<span class="eyebrow">ASK MAVIS</span><div class="emoji">📺</div>
    <h1 style="font-size:124px">Telly playing up?</h1><p style="color:#1A1A1A">Just say what's wrong. Mavis shows you how to fix it, one small step at a time.</p>${foot()}`],
  // --- highlight covers
  "highlight-covers/ask-mavis-highlight-scams": hl("red", "🛡️", "Scams"),
  "highlight-covers/ask-mavis-highlight-telly": hl("blue", "📺", "Telly"),
  "highlight-covers/ask-mavis-highlight-phone": hl("yellow", "📱", "Phone"),
  "highlight-covers/ask-mavis-highlight-tips": hl("blue", "💡", "Tips"),
  "highlight-covers/ask-mavis-highlight-teasers": hl("yellow", "🧠", "Teasers"),
  // --- page furniture
  "page/ask-mavis-profile-picture": [1080, 1080, "pf yellow", `<img src="logo.png">`],
  "page/ask-mavis-facebook-cover": [1640, 624, "fb", `<img src="logo.png"><div><h1>Ask Mavis</h1><p>Friendly help with your phone, your telly, and more.</p>
    <div class="chips"><span class="chip">✓ Free to download</span><span class="chip">✓ Made in the UK</span><span class="chip">✓ No adverts</span></div></div>`],
  "page/ask-mavis-play-store-feature-graphic": [1024, 500, "gp blue", `<img src="logo.png"><div><h1>Ask Mavis</h1><p>Friendly help with your phone,<br>your telly, and more.</p></div>`],
};
const b = await chromium.launch();
for (const [name, [w, h, cls, inner]] of Object.entries(g)) {
  const page = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1 });
  fs.writeFileSync(`${HERE}_page.html`, `<!doctype html><meta charset="utf-8"><link rel="stylesheet" href="gfx.css"><body class="${cls}" style="--y:${Y}">${inner}</body>`);
  await page.goto(`file://${HERE}_page.html`); await page.evaluate(() => document.fonts.ready);
  fs.mkdirSync(`${HERE}out/${name}`.replace(/\/[^/]*$/, ""), { recursive: true });
  await page.screenshot({ path: `${HERE}out/${name}.png` }); await page.close();
}
await b.close();
