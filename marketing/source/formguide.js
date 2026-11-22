// Two-page A4 guide for Luke: how the demo form should look, what it captures, what happens after.
const { chromium } = require('playwright'); const fs = require('fs'); const K = require('./kit');
const W = K.ROOT + '/website/';
const img = f => 'data:image/png;base64,' + fs.readFileSync(f).toString('base64');

const CSS = `
@page{size:A4;margin:0}
body{background:#FBFBF8;color:#1F1F1F}
.page{position:relative;width:794px;height:1123px;padding:48px 52px 70px;overflow:hidden;page-break-after:always;background:#FBFBF8}
h1{font-family:'Barlow Condensed';font-weight:800;font-size:46px;line-height:.95;margin-bottom:10px}
h2{font-family:'Barlow Condensed';font-weight:800;font-size:26px;line-height:1;margin:22px 0 10px}
p{font-size:14px;line-height:1.55;color:#2E322D;margin-bottom:8px}
.lead{font-size:15.5px;line-height:1.5;color:#3A3F38}
.band{margin:-48px -52px 24px;padding:30px 52px 26px;background:#1F1F1F;color:#F2F3EF;display:flex;align-items:center;gap:18px}
.band img{width:54px;border-radius:12px}
.band .k{font-size:12px;font-weight:700;letter-spacing:.08em;text-transform:uppercase;color:#80D83B}
.band .h{font-family:'Barlow Condensed';font-weight:800;font-size:34px;line-height:1}
.shots{display:grid;grid-template-columns:360px 150px;gap:16px;align-items:start;justify-content:center}
.shots figure{background:#ECEDE8;border-radius:12px;padding:10px}
.shots img{width:100%;display:block;border-radius:6px}
.shots figcaption{font-size:11px;font-weight:700;color:#62675F;margin-top:6px;text-align:center}
.t{width:100%;border-collapse:collapse;font-size:12.5px}
.t th{text-align:left;font-size:10px;font-weight:700;color:#7D827C;padding:0 6px 5px;border-bottom:1.5px solid #1F1F1F;text-transform:uppercase;letter-spacing:.05em}
.t td{padding:6px 6px;border-bottom:1px solid #E1E3DC;vertical-align:top;line-height:1.35}
.t td.k{font-weight:700;white-space:nowrap}
.req{display:inline-block;font-size:10px;font-weight:700;border-radius:999px;padding:2px 7px;background:#80D83B}
.opt{display:inline-block;font-size:10px;font-weight:700;border-radius:999px;padding:2px 7px;background:#E6E8E1;color:#545A52}
.steps{display:grid;grid-template-columns:repeat(4,1fr);gap:10px}
.step{background:#ECEDE8;border-radius:10px;padding:14px}
.step .n{font-family:'Barlow Condensed';font-weight:800;font-size:28px;color:#2E5A14;line-height:1}
.step b{display:block;font-size:14px;margin:4px 0}
.step span{font-size:12px;line-height:1.45;color:#3A3F38;display:block}
.mail{background:#80D83B;border-radius:12px;padding:16px 20px;font-size:13.5px;line-height:1.5;color:#1F3A0C}
.mail b{color:#1F1F1F}
ul.c{list-style:none;padding:0}
ul.c li{font-size:13.5px;line-height:1.45;margin-bottom:9px;padding-left:24px;position:relative;color:#2E322D}
ul.c li:before{content:'';position:absolute;left:0;top:2px;width:13px;height:13px;border:1.5px solid #7D827C;border-radius:3px}
.two{display:grid;grid-template-columns:1fr 1fr;gap:22px}
.foot{position:absolute;left:52px;right:52px;bottom:26px;display:flex;justify-content:space-between;font-size:10.5px;font-weight:600;color:#9A9F98}
`;

const foot = n => `<div class="foot"><span>Site Queue · Demo form guide</span><span>Design by SB Media</span><span>${n}</span></div>`;
const R = '<span class="req">Required</span>', O = '<span class="opt">Optional</span>';

const page1 = `<div class="page">
  <div class="band"><img src="${K.LOGO}"><div><div class="k">For the website</div><div class="h">The demo form: how it looks and what it asks</div></div></div>
  <p class="lead">One short form does three jobs: book a demo, join the early-access list, or ask about advertising. It's built and ready to drop into WordPress (<b>demo-form.html</b>), or rebuild it in WPForms, Fluent Forms or Gravity Forms using the fields below.</p>
  <div class="shots">
    <figure><img src="${img(W + 'demo-form-preview-desktop.png')}"><figcaption>Desktop</figcaption></figure>
    <figure><img src="${img(W + 'demo-form-preview-mobile.png')}" style="max-height:330px;object-fit:cover;object-position:top"><figcaption>Phone</figcaption></figure>
  </div>
  <h2>What it captures, and why</h2>
  <table class="t">
    <tr><th>Field</th><th></th><th>Why we ask</th></tr>
    <tr><td class="k">What are you after?</td><td>${R}</td><td>Demo, early access or advertising. Tells us how to reply.</td></tr>
    <tr><td class="k">Full name</td><td>${R}</td><td>So we can reply properly.</td></tr>
    <tr><td class="k">Company</td><td>${R}</td><td>Housebuilder, contractor, trade or supplier at a glance.</td></tr>
    <tr><td class="k">Work email</td><td>${R}</td><td>How we get back to them.</td></tr>
    <tr><td class="k">Your role</td><td>${R}</td><td>Site manager, QS, director, sub or supplier. Sets which demo they get.</td></tr>
    <tr><td class="k">Phone</td><td>${O}</td><td>Site managers often prefer a call. Optional keeps sign-ups up.</td></tr>
    <tr><td class="k">How many live sites?</td><td>${O}</td><td>Shows how big the job is (and which price plan fits).</td></tr>
    <tr><td class="k">Anything we should know?</td><td>${O}</td><td>Start dates and headaches. Gold for the demo.</td></tr>
    <tr><td class="k">Email updates tick box</td><td>${O}</td><td>Unticked by default. Needed under UK GDPR to send early-access emails.</td></tr>
  </table>
  <p style="margin-top:10px;font-size:12.5px;color:#545A52">Keep it to this. Every extra required box loses people. Hidden fields (utm_source, utm_medium, utm_campaign, page_url) record which post, email or ad brought them in.</p>
  ${foot(1)}</div>`;

const page2 = `<div class="page">
  <h1>Where it goes</h1>
  <div class="two">
    <ul class="c">
      <li><b>"Book a demo" button</b> in the header on every page, linking to the form.</li>
      <li><b>The form</b> at the bottom of the homepage and on its own page: <b>/book-a-demo/</b></li>
    </ul>
    <ul class="c">
      <li><b>"Try the live demo" button</b> right next to it, linking to demo.sitequeue.uk.</li>
      <li><b>LinkedIn page button</b> points at /book-a-demo/ too.</li>
    </ul>
  </div>
  <h2>What happens after they press send</h2>
  <div class="steps">
    <div class="step"><div class="n">1</div><b>Thank-you page</b><span>/thanks/ says "Cheers, we've got your details." Demo requests see your Calendly so they book a slot there and then.</span></div>
    <div class="step"><div class="n">2</div><b>Email to them</b><span>Sent automatically from hello@sitequeue.uk (wording below).</span></div>
    <div class="step"><div class="n">3</div><b>Email to us</b><span>You and me both get the details, so nothing sits unanswered.</span></div>
    <div class="step"><div class="n">4</div><b>Into the CRM</b><span>Lands in HubSpot (free), tagged demo, early access or advertiser.</span></div>
  </div>
  <h2>The automatic reply</h2>
  <div class="mail"><b>Subject: Thanks for your interest in Site Queue</b><br><br>Hi [first name], thanks for getting in touch. We'll be back to you within one working day. In the meantime you can have a go on the live demo at demo.sitequeue.uk.<br><br>Cheers,<br>Luke<br>Founder, Site Queue</div>
  <h2>Before it goes live</h2>
  <div class="two">
    <ul class="c">
      <li><b>Spam protection:</b> the hidden honeypot is already in. Add the plugin's anti-spam or Cloudflare Turnstile. No picture puzzles.</li>
      <li><b>Privacy policy</b> page at /privacy-policy/ needs to exist and be linked under the form.</li>
      <li><b>Phones first:</b> fields stack and the boxes are big enough to tap with gloves on. Test it on yours.</li>
    </ul>
    <ul class="c">
      <li><b>Tracking:</b> a "Lead" event on the thank-you page for Google Analytics and the LinkedIn Insight Tag (I'll send you the tag).</li>
      <li><b>Test it:</b> send one of each type and check the emails, the thank-you page and HubSpot all work.</li>
      <li><b>Calendly link</b> set up in your diary for the demo slots.</li>
    </ul>
  </div>
  ${foot(2)}</div>`;

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 794, height: 1123 } })).newPage();
  await p.setContent(`<!doctype html><html><head><style>${K.CSS}${CSS} body{overflow:visible}</style></head><body>${page1}${page2}</body></html>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const over = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => { const lim = pg.getBoundingClientRect().bottom - 60; let w = 0; pg.querySelectorAll('*').forEach(e => { if (e.closest('.foot')) return; const r = e.getBoundingClientRect(); if (r.height && r.bottom > lim) w = Math.max(w, Math.round(r.bottom - lim)); }); return w ? `p${i + 1}+${w}` : null; }).filter(Boolean));
  console.log(over.length ? 'OVER ' + over.join(' ') : 'ok');
  await p.pdf({ path: W + 'site-queue-demo-form-guide.pdf', format: 'A4', printBackground: true });
  await b.close();
})();
