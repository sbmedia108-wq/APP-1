// Scene content for the four vertical (9:16) Ask Mavis videos.
// Every on-screen app text is copied from the real app screens.
// --d is the delay in seconds after the scene starts.

const head = (title, sub) =>
  `<div class="brand a fade"><img src="logo.png">Ask Mavis</div>
   <h1 class="a" style="--d:.1">${title}${sub ? `<small>${sub}</small>` : ""}</h1>`;
const band = `<div class="band"><span>✓ Free to download</span><span>✓ Made in the UK</span><span>✓ No adverts</span></div>`;
const phone = (inner) => `<div class="phone">${inner}</div>`;
const end = (tag, sub) => `<div class="scene end" style="--s:$S">
  <img class="a pop" style="--d:.1" src="logo.png">
  <div class="name a" style="--d:.35">Ask Mavis</div>
  <div class="tag a" style="--d:.7">${tag}</div>
  <div class="pill a pop" style="--d:1.3">Free to download</div>
  <div class="sub a fade" style="--d:1.7">${sub}</div>
  ${band}</div>`;
const ap = (inner, cls = "") => `<div class="scene ap ${cls}" style="--s:$S">${inner}</div>`;
const pr = (inner) => `<div class="scene pr" style="--s:$S">${inner}</div>`;
const mp = (screen, scale) => `<div class="mp" style="transform:scale(${scale}); width:780px; height:1500px"><div class="phone"><div class="screen">${screen}</div></div></div><div style="width:${780 * scale}px; height:${1500 * scale}px"></div>`;
const dot = (pos) => `<div class="dot a pop" style="${pos}"><img src="logo.png"></div>`;
const cap = (text, d, len) => `<div class="cap" style="--d:${d}; --len:${len}">${text}</div>`;
// Phone screens used by the showcase promo (wording from the app).
const S = {
  home: `<div style="height:60px"></div><div class="t1">Hello, I'm Mavis. What's not working?</div>
    <div class="muted" style="margin-top:12px">Tap the big button and tell me in your own words.</div>
    <div class="btn" style="padding:70px 24px; font-size:50px">🎤<br>Tap and tell me</div><div class="btn sec">🛡️ Is this a scam?</div><div class="btn sec">🧠 Today's brain teaser</div>`,
  step: `<div class="kind"><span style="color:#1F5FBF">✕ Start over</span> <span>Step 1 of 7</span></div>
    <div class="prog"><i class="on"></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="t2" style="margin-top:0; line-height:1.3; font-size:46px">Turn the TV on with the red power button on the remote.</div>
    <div class="hint"><b>👀 What you should see</b>A picture comes on the screen.</div>
    <div class="btn sec">🔊 Read it to me again</div><div class="btn green">✅ Done – next step</div>`,
  scam: `<div class="link">✕ Start over</div><div class="banner"><b>🛑</b>This looks like a scam</div><div class="t2">Why</div>
    <div class="card">It wants you to tap a link. Links in unexpected messages often lead to fake websites.</div>
    <div class="card">It's about a parcel or delivery fee. Fake delivery messages are very common.</div>`,
  cloud: `<div class="link">✕ Start over</div><div style="font-size:100px; line-height:1.1">☁️</div><div class="t1">The cloud</div>
    <div class="card" style="font-size:42px">“The cloud” just means storing your photos and files on the internet instead of only on your phone.</div>
    <div class="btn sec">🔊 Read it to me again</div>`,
  picker: `<div class="link">✕ Start over</div><div class="muted">No problem, let's sort it out.</div>
    <div class="t1" style="font-size:50px">What's happening with Netflix?</div>
    <div class="opt">🔍 I can't find it on the TV</div><div class="opt">⏳ It's stuck or keeps loading</div><div class="opt">🔑 It wants a password or payment</div>`,
  teaser: `<div class="link">✕ Start over</div><div style="font-size:100px;line-height:1.1">🧠</div><div class="t1">Today's brain teaser</div>
    <div class="muted" style="margin-top:10px">Three quick questions: a tech tip, spot the scam, and a word puzzle.</div>
    <div class="stats"><div class="stat"><b>⭐ 12</b>stars</div><div class="stat"><b>🔥 4</b>day streak</div><div class="stat"><b>📅 6</b>days played</div></div>
    <div class="btn green">▶️ Let's play</div>`,
  gp: `<div class="kind"><span style="color:#1F5FBF">✕ Start over</span> <span>Step 1 of 6</span></div>
    <div class="prog"><i class="on"></i><i></i><i></i><i></i><i></i><i></i></div>
    <div class="t2" style="margin-top:0; line-height:1.3">The easy way: ring your GP surgery. Most phone lines open at 8 in the morning, and that's when they're busiest.</div>
    <div class="hint"><b>👀 What you should see</b>Someone answers and asks what the problem is.</div><div class="btn green">✅ Done – next step</div>`,
  kiosk: `<div class="coach"><b>🎓 PRACTICE · nothing here is real</b>Today let's order a cheeseburger and a cup of tea. Touch the Cheeseburger.</div>
    <div class="kiosk"><div class="kbar">☀ CORNER GRILL</div><div class="menu">
      <div class="cats"><div class="on"><span>🍔</span>Burgers</div><div><span>🍗</span>Chicken</div><div><span>🍟</span>Sides</div><div><span>🥤</span>Drinks</div></div>
      <div class="items"><div class="item" style="box-shadow:0 0 0 10px #F59E0B"><span>🍔</span>Cheeseburger<small>£2.49</small></div><div class="item"><span>🍔</span>Double Burger<small>£4.29</small></div>
        <div class="item"><span>🥬</span>Veggie Burger<small>£3.79</small></div><div class="item"><span>🐟</span>Fish Burger<small>£3.49</small></div></div></div></div>`,
};
const scene = (inner) => `<div class="scene" style="--s:$S">${inner}${band}</div>`;

const kbar = `<div class="kbar">☀ CORNER GRILL</div>`;
const coach = (t) => `<div class="coach"><b>🎓 PRACTICE · nothing here is real</b>${t}</div>`;
const stats = (s, f, d) => `<div class="stats"><div class="stat"><b>⭐ ${s}</b>stars</div><div class="stat"><b>🔥 ${f}</b>day streak</div><div class="stat"><b>📅 ${d}</b>days played</div></div>`;

export const videos = {
  /* ------------------------------------------------------------------ */
  reel_scam: {
    title: "Is this a scam?",
    scenes: [
      { key: "hook", html: scene(`${head("Is this text real?", "“Your parcel needs a fee…”")}
        ${phone(`<div class="screen">
          <div class="smshead"><b>07700 900123</b>Text message · Today 10:42</div>
          <div class="sms a" style="--d:.5">Your parcel could not be delivered. Pay the £1.99 redelivery fee today or it will be returned: <u>parcel-redeliver.example/pay</u></div>
        </div>`)}
        <div class="qmark a pop" style="--d:2.3">?</div>`) },
      { key: "ask", html: scene(`${head("Don’t guess.<br>Ask Mavis.", "Say or type what the message said.")}
        ${phone(`<div class="screen">
          <div class="link">✕ Start over</div>
          <div class="t1">Is this a scam?</div>
          <div class="muted" style="margin-top:10px">Tell me what the message or phone call said. You can say it, type it, or paste it in.</div>
          <div class="btn">🎤 Tap and tell me</div>
          <div class="input"><span class="a fade" style="--d:1.6">It says my parcel can't be delivered, and to tap a link to pay £1.99</span></div>
          <div class="btn green rel">Check it<i class="tap" style="--d:3.6"></i></div>
        </div>`)}`) },
      { key: "result", html: scene(`${head("A plain answer", "Mavis checks it for warning signs.")}
        ${phone(`<div class="screen">
          <div class="link">✕ Start over</div>
          <div class="banner a pop" style="--d:2.9"><b>🛑</b>This looks like a scam</div>
          <div class="t2 a fade" style="--d:3.5">Why</div>
          <div class="card a" style="--d:3.7">It wants you to tap a link. Links in unexpected messages often lead to fake websites.</div>
          <div class="card a" style="--d:4.1">It's about a parcel or delivery fee. Fake delivery messages are very common.</div>
        </div>`)}`),
        sfx: [["try_again", 2.9]] },
      { key: "why", html: scene(`${head("Why, and what to do", "In plain words. No jargon.")}
        ${phone(`<div class="screen">
          <div class="t2" style="margin-top:0">What to do</div>
          <div class="card a" style="--d:.4">Don't reply.</div>
          <div class="card a" style="--d:.9">Don't tap any links or ring any numbers in the message.</div>
          <div class="card a" style="--d:1.4">Never share codes, PINs, passwords or card details.</div>
          <div class="card a" style="--d:1.9">Forward scam text messages to 7726. It's free, and helps stop them.</div>
        </div>`)}`) },
      { key: "bank", html: scene(`${head("Ring your bank safely", "One big button rings 159.")}
        ${phone(`<div class="screen">
          <div class="t2" style="margin-top:0">What to do</div>
          <div class="card">To check with your bank safely, hang up and ring 159 from a phone you trust. It connects you to your bank.</div>
          <div class="btn rel a glow" style="--d:1.6; padding:44px 24px; font-size:48px">🏦 Ring my bank safely (159)<i class="tap" style="--d:3.2"></i></div>
          <div class="btn sec">📞 Call Sarah</div>
          <div class="btn sec">Check something else</div>
        </div>`)}`) },
      { key: "cta", html: end("Feel safer today.", "Search “Ask Mavis” in your app store"), sfx: [["well_done", 0.1]] },
    ],
  },

  /* ------------------------------------------------------------------ */
  reel_practice: {
    title: "Practise the ordering screen",
    scenes: [
      { key: "hook", html: scene(`${head("Do ordering screens make you nervous?", "")}
        <div class="stand a" style="--d:.4">
          <div class="kiosk">${kbar}<div class="attract"><span>🍔🍟</span><b>Order here</b><p>Touch the screen to start</p></div></div>
          <div class="pole"></div>
        </div>
        <div class="qmark a pop" style="--d:2.6; top:1180px; right:70px">?</div>`) },
      { key: "pretend", html: scene(`${head("Practise at home", "Nothing is real, so you can’t get it wrong.")}
        ${phone(`<div class="screen">
          ${coach("This is a pretend ordering screen, like the ones in takeaways. Nothing here is real, so you can't get it wrong. Touch the screen to start.")}
          <div class="kiosk">${kbar}<div class="attract rel a glow" style="--d:3.5"><span>🍔🍟</span><b>Order here</b><p>Touch the screen to start</p><i class="tap" style="--d:5.8"></i></div></div>
        </div>`)}`) },
      { key: "coach", html: scene(`${head("Mavis tells you what to touch", "And lights it up.")}
        ${phone(`<div class="screen">
          ${coach("Today let's order a cheeseburger and a cup of tea. The burgers are showing. Touch the Cheeseburger.")}
          <div class="kiosk">${kbar}<div class="menu">
            <div class="cats"><div class="on"><span>🍔</span>Burgers</div><div><span>🍗</span>Chicken</div><div><span>🍟</span>Sides</div><div><span>🥤</span>Drinks</div></div>
            <div class="items">
              <div class="item rel a glow" style="--d:1.3"><span>🍔</span>Cheeseburger<small>£2.49</small><i class="tap" style="--d:2.6"></i></div>
              <div class="item"><span>🍔</span>Double Burger<small>£4.29</small></div>
              <div class="item"><span>🥬</span>Veggie Burger<small>£3.79</small></div>
              <div class="item"><span>🐟</span>Fish Burger<small>£3.49</small></div>
            </div></div>
            <div class="kfoot">Your order: 0 items · £0.00 <em style="opacity:.45">Checkout ›</em></div>
          </div>
        </div>`)}`),
        sfx: [["step", 2.9]] },
      { key: "order", html: scene(`${head("Choose. Check. Pay.", "Just like the real thing.")}
        ${phone(`<div class="screen">
          ${coach("This is your order. Always check it. It's all correct, so touch “Pay”.")}
          <div class="kiosk">${kbar}<div class="kpad">
            <div class="t2" style="margin-top:0">Check your order</div>
            <div class="line"><span>🍔 Cheeseburger</span><span>£2.49</span></div>
            <div class="line"><span>☕ Tea</span><span>£1.29</span></div>
            <div class="line" style="background:none;font-size:42px"><span>Total</span><span>£3.78</span></div>
            <div class="btn green rel a glow" style="--d:.5">Pay<i class="tap" style="--d:1.5"></i></div>
          </div></div>
        </div>
        <div class="screen a fade" style="--d:2">
          ${coach("Now hold your bank card flat on the card reader, under the screen. Here, just touch the card reader.")}
          <div class="kiosk">${kbar}<div class="kpad" style="padding:70px 26px">
            <div class="t2" style="margin-top:0">Please pay £3.78</div>
            <div class="muted">Hold your card on the reader below ⬇️</div>
          </div></div>
          <div class="reader rel a glow" style="--d:2.3"><span>💳 )))</span>Card reader: touch here<i class="tap" style="--d:2.9"></i></div>
        </div>`)}`),
        hold: 1.2, sfx: [["step", 1.8], ["card_beep", 3.3]] },
      { key: "done", html: scene(`${head("Well done!", "You ordered all by yourself.")}
        ${phone(`<div class="screen">
          ${coach("Well done! You ordered all by yourself. Your order number is 42.")}
          <div class="receipt a pop" style="--d:.3">
            <div class="cg">CORNER GRILL</div><div class="muted">TAKE AWAY</div>
            <div style="margin-top:16px">Your order number</div><div class="num">42</div>
            <div class="row"><span>1 × Cheeseburger</span><span>£2.49</span></div>
            <div class="row"><span>1 × Tea</span><span>£1.29</span></div><hr>
            <div class="row"><b>Total</b><b>£3.78</b></div>
          </div>
        </div>`)}`),
        hold: 0.7, sfx: [["well_done", 0.2]] },
      { key: "cta", html: end("No queue.<br>Nobody watching.", "Search “Ask Mavis” in your app store") },
    ],
  },

  /* ------------------------------------------------------------------ */
  reel_teaser: {
    title: "Today's brain teaser",
    scenes: [
      { key: "hook", html: scene(`${head("Three little questions a day", "To keep you sharp.")}
        ${phone(`<div class="screen">
          <div class="link">✕ Start over</div>
          <div style="font-size:100px;line-height:1.1">🧠</div>
          <div class="t1">Today's brain teaser</div>
          <div class="muted" style="margin-top:10px">Three quick questions: a tech tip, spot the scam, and a word puzzle. There's no rush, and no wrong answers, only things to learn.</div>
          ${stats(12, 4, 6)}
          <div class="btn green rel">▶️ Let's play<i class="tap" style="--d:2.3"></i></div>
        </div>`)}`) },
      { key: "kinds", html: scene(`${head("A tip, a scam and a puzzle", "New ones every day.")}
        <div class="cards">
          <div class="big a pop" style="--d:.3"><span>💡</span>Tech tip</div>
          <div class="big a pop" style="--d:1.3"><span>🛡️</span>Spot the scam</div>
          <div class="big a pop" style="--d:2.4"><span>🧩</span>Word puzzle</div>
        </div>`) },
      { key: "question", html: scene(`${head("Like this one…", "What should you do?")}
        ${phone(`<div class="screen">
          <div class="kind">🛡️ Spot the scam <span>Question 2 of 3</span></div>
          <div class="t2 a fade" style="--d:1.2; font-size:40px; line-height:1.3; margin-top:16px">A text says: “Hi Mum, I've broken my phone, this is my new number. Can you send £200?” What should you do?</div>
          <div class="opt a" style="--d:5.2">Send the money quickly</div>
          <div class="opt a" style="--d:5.6">Ring your child on their old number to check</div>
          <div class="opt a" style="--d:6">Reply asking which child it is</div>
        </div>`)}`) },
      { key: "answer", html: scene(`${head("Lovely, that’s right!", "Every answer comes with a kind explanation.")}
        ${phone(`<div class="screen tight">
          <div class="kind">🛡️ Spot the scam <span>Question 2 of 3</span></div>
          <div class="t2" style="font-size:36px; line-height:1.3; margin-top:12px">A text says: “Hi Mum, I've broken my phone, this is my new number. Can you send £200?” What should you do?</div>
          <div class="opt">Send the money quickly</div>
          <div class="opt rel a right" style="--d:.5">✅ Ring your child on their old number to check<i class="tap" style="--d:.1"></i></div>
          <div class="opt">Reply asking which child it is</div>
          <div class="okcard a" style="--d:.9"><b>Lovely, that's right!</b>“Hi Mum, new number” is one of the most common scams. Always check by ringing their usual number.</div>
        </div>`)}`),
        sfx: [["correct", 0.45]] },
      { key: "stars", html: scene(`${head("Stars, streaks and badges", "A little reward every day.")}
        ${phone(`<div class="screen center">
          <div class="a pop" style="--d:.2; font-size:130px; line-height:1.15">🏆</div>
          <div class="t1 a" style="--d:.4">Full marks!</div>
          <div class="a fade" style="--d:.6; margin-top:10px; font-size:42px">You got 3 out of 3, and earned 3 stars.</div>
          <div class="card amber a pop" style="--d:1.4">🔥 5 days in a row!</div>
          <div class="card greenc a pop" style="--d:2.4">🛡️ New badge: Scam Spotter</div>
          <div class="a fade" style="--d:2.8">${stats(15, 5, 7)}</div>
        </div>`)}`),
        hold: 0.7, sfx: [["well_done", 0.2]] },
      { key: "cta", html: end("Today’s brain teaser.<br>Only in Ask Mavis.", "Search “Ask Mavis” in your app store") },
    ],
  },

  /* ------------------------------------------------------------------ */
  reel_everyday: {
    title: "Everyday life, made easier",
    scenes: [
      { key: "hook", html: scene(`${head("Has it all gone online?", "")}
        <div class="cards" style="top:600px">
          <div class="big a pop" style="--d:.2"><span>🩺</span>Booking the doctor</div>
          <div class="big a pop" style="--d:1.6"><span>💊</span>Ordering a prescription</div>
          <div class="big a pop" style="--d:3.1"><span>🅿️</span>Paying for parking</div>
        </div>`) },
      { key: "say", html: scene(`${head("Just tell Mavis", "In your own words.")}
        <div class="bubble a pop" style="--d:.9"><b>👵 Margaret says:</b><i>“I need to book a doctor’s appointment.”</i></div>
        ${phone(`<div class="screen" style="padding-top:150px">
          <div class="t1">Hello, I'm Mavis. What's not working?</div>
          <div class="btn red" style="padding:60px 24px">⏹<br>I'm listening…<br>Tap here when you've finished</div>
          <div class="card muted">I'm hearing:<br><b style="color:#1A1A1A">I need to book a doctor's appointment</b></div>
        </div>`)}`) },
      { key: "steps", html: scene(`${head("One small step at a time", "Big writing, read out loud.")}
        ${phone(`<div class="screen">
          <div class="kind"><span style="color:#1F5FBF">✕ Start over</span> <span>Step 3 of 6</span></div>
          <div class="prog"><i class="on"></i><i class="on"></i><i class="on"></i><i></i><i></i><i></i></div>
          <div class="t2" style="margin-top:0; line-height:1.3">If you'd rather use the NHS App: find it on your phone. It's a blue square with the white letters NHS. Touch it once.</div>
          <div class="hint"><b>👀 What you should see</b>It asks you to log in.</div>
          <div class="btn sec">🔊 Read it to me again</div>
          <div class="btn green rel">✅ Done – next step<i class="tap" style="--d:4.6"></i></div>
        </div>`)}`),
        sfx: [["step", 4.9]] },
      { key: "other", html: scene(`${head("There’s always another way", "Like ringing the surgery.")}
        ${phone(`<div class="screen">
          <div class="kind"><span style="color:#1F5FBF">✕ Start over</span> <span>Step 1 of 6</span></div>
          <div class="prog"><i class="on"></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="t2" style="margin-top:0; line-height:1.3">The easy way: ring your GP surgery. Most phone lines open at 8 in the morning, and that's when they're busiest. If you're in a queue, it's fine to wait.</div>
          <div class="hint a" style="--d:1.2"><b>👀 What you should see</b>Someone answers and asks what the problem is.</div>
          <div class="btn green">✅ Done – next step</div>
        </div>`)}`) },
      { key: "cta", html: end("Everyday life,<br>made easier.", "Search “Ask Mavis” in your app store"), sfx: [["well_done", 0.1]] },
    ],
  },

  /* ------------------------------------------------------------------ */
  reel_whatis: {
    title: "What is…?",
    scenes: [
      { key: "hook", html: scene(`${head("What do these words mean?", "")}
        <div class="cards" style="top:600px">
          <div class="big a pop" style="--d:.2"><span>☁️</span>“The cloud”</div>
          <div class="big a pop" style="--d:1.3"><span>📶</span>“Wi-Fi”</div>
          <div class="big a pop" style="--d:2.2"><span>🔲</span>“An app”</div>
        </div>`) },
      { key: "ask", html: scene(`${head("Just ask Mavis", "In your own words.")}
        <div class="bubble a pop" style="--d:1.3"><b>👵 Margaret says:</b><i>“What is the cloud?”</i></div>
        ${phone(`<div class="screen">
          <div class="link">✕ Start over</div>
          <div class="t1">What is…?</div>
          <div class="muted" style="margin-top:10px">Ask me what something means, in your own words. Like “What is AI?” or “What's the cloud?” There are no silly questions.</div>
          <div class="btn red">⏹ I'm listening… tap when finished</div>
          <div class="input" style="min-height:120px"><span class="a fade" style="--d:2">What is the cloud?</span></div>
          <div class="btn green">💡 Explain it to me</div>
        </div>`)}`) },
      { key: "answer", html: scene(`${head("A short, friendly answer", "In plain English, read out loud.")}
        ${phone(`<div class="screen">
          <div class="link">✕ Start over</div>
          <div class="a pop" style="--d:.2; font-size:100px; line-height:1.1">☁️</div>
          <div class="t1">The cloud</div>
          <div class="card a" style="--d:.6; font-size:42px">“The cloud” just means storing your photos and files on the internet instead of only on your phone.</div>
          <div class="card a" style="--d:2.2">It means your photos are safe even if you lose your phone. iCloud and Google Photos are examples.</div>
          <div class="btn sec">🔊 Read it to me again</div>
        </div>`)}`),
        sfx: [["step", 0.5]] },
      { key: "more", html: scene(`${head("About 50 everyday words", "And you can ask about anything else.")}
        <div class="cards" style="top:640px; gap:26px">
          <div class="big a pop" style="--d:.2; padding:32px 44px"><span>📶</span>Wi-Fi</div>
          <div class="big a pop" style="--d:.7; padding:32px 44px"><span>📦</span>Router</div>
          <div class="big a pop" style="--d:1.2; padding:32px 44px"><span>🧭</span>A web browser</div>
          <div class="big a pop" style="--d:1.7; padding:32px 44px"><span>🔑</span>A password</div>
          <div class="big a pop" style="--d:2.2; padding:32px 44px"><span>🔲</span>An app</div>
        </div>`) },
      { key: "cta", html: end("There are no<br>silly questions.", "Search “Ask Mavis” in your app store"), sfx: [["well_done", 0.1]] },
    ],
  },

  /* ------------------------------------------------------------------ */
  reel_himum: {
    title: "The Hi Mum scam",
    scenes: [
      { key: "hook", html: scene(`${head("Got a text like this?", "")}
        ${phone(`<div class="screen">
          <div class="smshead"><b>07700 900456</b>Text message · Today 09:15</div>
          <div class="sms a" style="--d:.3">Hi Mum 👋 I've broken my phone. This is my new number.</div>
          <div class="sms a" style="--d:3.2">Can you send me some money? I'll pay you back x</div>
        </div>`)}`) },
      { key: "stop", html: scene(`${head("Stop.", "This is one of the most common scams.")}
        ${phone(`<div class="screen">
          <div class="smshead"><b>07700 900456</b>Text message · Today 09:15</div>
          <div class="sms">Hi Mum 👋 I've broken my phone. This is my new number.</div>
          <div class="sms">Can you send me some money? I'll pay you back x</div>
          <div class="banner a pop" style="--d:.2; margin-top:40px"><b>🛑</b>This looks like a scam</div>
        </div>`)}`),
        sfx: [["try_again", 0.2]] },
      { key: "do", html: scene(`${head("Ring their old number", "Don’t send anything until you’ve checked.")}
        <div class="cards" style="top:660px">
          <div class="big a pop" style="--d:.2"><span>🚫</span>Don’t send money</div>
          <div class="big a pop" style="--d:1.4"><span>📞</span>Ring them on their old number</div>
        </div>`) },
      { key: "report", html: scene(`${head("Then forward it to 7726", "It’s free, and helps stop them.")}
        <div class="cards" style="top:660px">
          <div class="big a pop" style="--d:.6; justify-content:center; font-family:Merri,serif; font-size:230px; padding:70px 20px; color:#1F5FBF">7726</div>
          <div class="big a pop" style="--d:2.6"><span>📲</span>Forward scam texts here, free</div>
        </div>`) },
      { key: "cta", html: end("Not sure about<br>a message?", "Mavis checks it for warning signs"), sfx: [["well_done", 0.1]] },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Minimal black-and-white ads: big type, one phone, very few words.  */
  min_sorted: {
    title: "Say it. Sorted.",
    scenes: [
      { key: "funny", hold: 0.5, html: ap(`<div class="mid"><div class="hl a" style="--d:.1">The telly’s<br>gone funny.</div></div>`) },
      { key: "again", hold: 0.4, html: ap(`<div class="mid"><div class="hl xl a pop" style="--d:.1">Again.</div></div>`) },
      { key: "say", hold: 1.3, html: ap(`<div class="top"><div class="hl a" style="--d:.1">Just say it.</div></div>
        <div class="phone a rise" style="--d:.3"><div class="screen" style="padding-top:150px">
          <div class="t1">Hello, I'm Mavis. What's not working?</div>
          <div class="btn red" style="padding:60px 24px">⏹<br>I'm listening…<br>Tap here when you've finished</div>
          <div class="card muted">I'm hearing:<br><b class="a fade" style="--d:1.5; color:#1A1A1A; display:block">The telly's gone funny</b></div>
        </div></div>`) },
      { key: "steps", hold: 1.0, html: ap(`<div class="top"><div class="hl a" style="--d:.1">One small step<br>at a time.</div></div>
        <div class="phone"><div class="screen">
          <div class="kind"><span style="color:#1F5FBF">✕ Start over</span> <span>Step 1 of 7</span></div>
          <div class="prog"><i class="on"></i><i></i><i></i><i></i><i></i><i></i><i></i></div>
          <div class="t2" style="margin-top:0; line-height:1.3; font-size:46px">Turn the TV on with the red power button on the remote.</div>
          <div class="hint"><b>👀 What you should see</b>A picture comes on the screen.</div>
          <div class="btn sec">🔊 Read it to me again</div>
          <div class="btn green rel">✅ Done – next step<i class="tap" style="--d:3.6"></i></div>
        </div></div>`, "light"), sfx: [["step", 3.9]] },
      { key: "sorted", hold: 1.0, html: ap(`<div class="mid"><div class="hl xl grad a pop" style="--d:.1">Sorted.</div></div>`), sfx: [["well_done", 0.2]] },
      { key: "end", hold: 0.8, html: ap(`<div class="mid"><img class="logo a pop" style="--d:.1" src="logo.png"><div class="name a" style="--d:.3">Ask Mavis</div>
        <div class="sub a fade" style="--d:.8">Tech help, in your own words.<br>Free to download.</div></div>`) },
    ],
  },
  min_scam: {
    title: "Scams, spotted.",
    scenes: [
      { key: "real", hold: 0.8, html: ap(`<div class="mid"><div class="sms a" style="--d:.1">Your parcel could not be delivered. Pay the £1.99 fee today: <u>parcel-redeliver.example/pay</u></div>
        <div class="hl xl a pop" style="--d:1.9">Real?</div></div>`) },
      { key: "ask", hold: 1.6, html: ap(`<div class="top"><div class="hl a" style="--d:.1">Ask.</div></div>
        <div class="phone a rise" style="--d:.3"><div class="screen">
          <div class="link">✕ Start over</div>
          <div class="t1">Is this a scam?</div>
          <div class="muted" style="margin-top:10px">Tell me what the message or phone call said. You can say it, type it, or paste it in.</div>
          <div class="btn">🎤 Tap and tell me</div>
          <div class="input"><span class="a fade" style="--d:1">It says my parcel can't be delivered, and to tap a link to pay £1.99</span></div>
          <div class="btn green rel">Check it<i class="tap" style="--d:2.2"></i></div>
        </div></div>`, "light") },
      { key: "result", hold: 1.2, html: ap(`<div class="mid"><div class="a pop" style="--d:.1; font-size:200px; line-height:1.2">🛑</div>
        <div class="hl redbig a" style="--d:.3">This looks<br>like a scam.</div>
        <div class="sub a fade" style="--d:1.3">It wants you to tap a link.<br>It’s about a parcel fee.</div></div>`), sfx: [["try_again", 0.1]] },
      { key: "spotted", hold: 1.0, html: ap(`<div class="mid"><div class="hl xl grad a pop" style="--d:.1">Scams,<br>spotted.</div></div>`), sfx: [["well_done", 0.2]] },
      { key: "end", hold: 0.6, html: ap(`<div class="mid"><img class="logo a pop" style="--d:.1" src="logo.png"><div class="name a" style="--d:.3">Ask Mavis</div>
        <div class="sub a fade" style="--d:.8">Check any message for warning signs.<br>Free to download.</div></div>`) },
    ],
  },

  /* ------------------------------------------------------------------ */
  /* Showcase promo: colour blobs, a tilted wall of phones, one phone with a
     changing keyword, a fan of phones, a sliding row, bold word captions.   */
  promo_showcase: {
    title: "Ask Mavis showcase",
    music: "music.wav",
    scenes: [
      { key: "intro", hold: 0.5, html: pr(`
        <div class="blob a from" style="--fx:-300px; --fy:-300px; left:-330px; top:-420px; width:640px; height:640px"></div>
        <div class="blob a from" style="--fx:400px; --fy:400px; --d:.1; right:-420px; bottom:-380px; width:1100px; height:1100px"></div>
        <div class="tag a from" style="--fx:-200px; --d:.5; top:270px">Tech help<small>MADE SIMPLE</small></div>
        <div style="position:absolute; left:790px; top:330px; transform:rotate(28deg); transform-origin: top left">
          ${[[0, 0, S.home, "0, 900px", .2], [0, 700, S.picker, "0, 900px", .35], [0, 1400, S.teaser, "0, 900px", .5],
             [400, -350, S.step, "0, -900px", .3], [400, 350, S.scam, "0, -900px", .45], [400, 1050, S.cloud, "0, -900px", .6]]
            .map(([x, y, scr, f, d]) => `<div class="a from" style="--fx:${f.split(",")[0]}; --fy:${f.split(",")[1]}; --d:${d}; position:absolute; left:${x}px; top:${y}px">${mp(scr, .44)}</div>`).join("")}
        </div>
        ${dot("right:70px; top:150px")}
        ${cap("Telly <em>playing up?</em>", .25, 1.45)}${cap("Phone <em>gone funny?</em>", 1.7, 3)}`) },
      ...[["simple", "Simple", "home", "Ask Mavis is <em>simple</em>", "Just say <em>what’s wrong</em>", 1.5],
         ["calm", "Calm", "step", "<em>Calm.</em>", "One small step <em>at a time</em>", .8],
         ["safe", "Safe", "scam", "<em>Safe.</em>", "Mavis spots <em>the scams</em>", .8],
         ["friendly", "Friendly", "cloud", "And <em>friendly</em>", "No <em>silly questions</em>", 1.2]]
        .map(([key, word, scr, c1, c2, at]) => ({ key, html: pr(`
        <div class="blob" style="right:-200px; top:-260px; width:680px; height:680px"></div>
        <div class="blob" style="left:-620px; bottom:-1150px; width:1900px; height:1900px"></div>
        ${dot("left:70px; top:150px")}
        <div style="position:absolute; left:110px; top:470px">${mp(S[scr], .62)}</div>
        <div class="kw a from" style="--fx:120px; --d:.15">${word}</div>
        ${cap(c1, .25, at)}${cap(c2, at + .25, 3)}`) })),
      { key: "fan", hold: 0.5, html: pr(`
        <div class="a to" style="--tx:-210px; --ty:60px; --tr:-11deg; --d:1.1; position:absolute; left:306px; top:560px; transform-origin: 50% 80%">${mp(S.picker, .6)}</div>
        <div class="a to" style="--tx:210px; --ty:60px; --tr:11deg; --d:1.1; position:absolute; left:306px; top:560px; transform-origin: 50% 80%">${mp(S.scam, .6)}</div>
        <div class="a from" style="--fs:2.1; --fy:260px; --d:.1; animation-duration:1s; position:absolute; left:306px; top:520px; transform-origin: 234px 300px">${mp(S.step, .6)}</div>
        ${cap("<em>Big</em> writing", .25, .95)}${cap("Read <em>out loud</em>", 1.2, 1)}${cap("No <em>jargon</em>", 2.2, 3)}`) },
      { key: "logo", html: pr(`
        <div class="cen" style="top:200px"><img class="a pop" style="--d:.1" src="logo.png"><div class="nm a" style="--d:.25">Ask Mavis</div>
          <div class="a pop" style="--d:.6; margin-top:26px"><span class="pill2">Free to download</span></div></div>
        <div style="position:absolute; left:96px; top:900px; transform:rotate(-11deg); transform-origin: 50% 80%">${mp(S.picker, .6)}</div>
        <div style="position:absolute; left:516px; top:900px; transform:rotate(11deg); transform-origin: 50% 80%">${mp(S.scam, .6)}</div>
        <div style="position:absolute; left:306px; top:840px">${mp(S.step, .6)}</div>
        ${cap("Help, <em>whenever</em> you need it", 1.1, 3)}`) },
      { key: "carousel", hold: 0.5, html: pr(`
        ${dot("left:465px; top:130px")}
        ${["The telly", "Scams", "The doctor", "Ordering screens", "Brain teasers"].map((l, i) => `<div class="plab a fade" style="--d:${i ? .75 + (i - 1) * .9 : 0}; animation-duration:.25s">${l}</div>`).join("")}
        <div class="a to" style="--tx:-450px; --d:.6"><div class="a to" style="--tx:-450px; --d:1.5"><div class="a to" style="--tx:-450px; --d:2.4"><div class="a to" style="--tx:-450px; --d:3.3">
          <div class="strip">${[S.step, S.scam, S.gp, S.kiosk, S.teaser, S.home].map((s, i) => `<div style="position:absolute; left:${i * 450}px; top:0">${mp(s, .5)}</div>`).join("")}</div>
        </div></div></div></div>
        ${cap("The telly. <em>Scams.</em>", .25, 1.6)}${cap("The doctor. <em>And more.</em>", 1.9, 4)}`) },
      { key: "end", html: pr(`
        <div class="blob a from" style="--fx:-300px; --fy:-300px; left:-260px; top:-300px; width:760px; height:760px"></div>
        <div class="blob a from" style="--fx:400px; --fy:400px; right:-420px; bottom:-380px; width:1100px; height:1100px"></div>
        <div class="cen" style="top:560px"><img class="a pop" style="--d:.1; width:320px; height:320px; border-radius:72px" src="logo.png">
          <div class="nm a" style="--d:.3; font-size:150px">Ask Mavis</div>
          <div class="a pop" style="--d:.9; margin-top:40px"><span class="pill2" style="font-size:58px; padding:30px 70px">Free to download</span></div></div>
        ${cap("Try Ask Mavis <em>today</em>", .25, 8)}`) },
    ],
  },
};
