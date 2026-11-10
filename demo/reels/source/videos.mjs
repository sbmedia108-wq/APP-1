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
};
