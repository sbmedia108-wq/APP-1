// Client-facing launch action plan (A4 PDF) for Site Queue, prepared by SB Media.
const { chromium } = require('playwright');
const K = require('./kit');
const OUT = K.ROOT + '/site-queue-launch-action-plan.pdf';

const own = o => `<span class="own ${o === 'You' ? 'you' : o === 'SB Media' ? 'agency' : 'tog'}">${o}</span>`;
const table = rows => `<table class="t"><tr><th style="width:26px">#</th><th>Action</th><th style="width:78px">Owner</th><th style="width:74px">Due</th><th style="width:30px">Done</th></tr>
${rows.map((r, i) => `<tr><td class="n">${i + 1}</td><td><b>${r[0]}</b>${r[1] ? `<div class="w">${r[1]}</div>` : ''}</td><td>${own(r[2])}</td><td class="due">${r[3]}</td><td><span class="box"></span></td></tr>`).join('')}</table>`;
const phase = (n, name, dates, goal, rows) => `<div class="ph"><div class="phh"><div><div class="pn">Phase ${n}</div><h2>${name}</h2></div><div class="pd">${dates}</div></div><p class="goal"><b>Goal:</b> ${goal}</p>${table(rows)}</div>`;

let pageNo = 0;
const page = (body, cls = '') => { pageNo++; return `<div class="page ${cls}">${body}${cls.includes('cover') ? '' : `<div class="foot"><span>Site Queue launch action plan</span><span>Prepared by SB Media</span><span>${pageNo}</span></div>`}</div>`; };

const P = [];
P.push(page(`
  <div class="abs" style="left:520px;top:0;width:274px;height:1123px;background:var(--lime)"></div>
  ${K.phone(470, 250, 290, K.phoneHome())}
  <img class="tile abs" src="${K.LOGO}" style="left:56px;top:56px;width:84px">
  ${K.stack(56, 300, 420, [`<div class="d" style="font-size:76px">Your launch action plan</div>`, `<div style="font-size:18px;line-height:1.5;color:#B7BCB4">Every step from today to the Site Queue launch at UK Construction Week London, 11–13 May 2027, and what follows.</div>`], 26)}
  <div class="abs" style="left:56px;bottom:56px;font-size:14px;line-height:1.6;color:#B7BCB4">Prepared for [Founder name]<br>by SB Media, 21 November 2026</div>`, 'cover on-char'));

P.push(page(`
  <h1>At a glance</h1>
  <p class="lead">The plan in one line: get 10 founding sites on board before launch, turn them into case studies, then launch Site Queue properly at UK Construction Week London on 11 May 2027.</p>
  <h3>The six phases</h3>
  <div class="tl">${[['0', 'Foundations', '23 Nov – 4 Dec'], ['1', 'First outreach', '7 – 18 Dec'], ['2', 'Pilots live', 'Jan – Feb'], ['3', 'Proof', 'Mar – Apr'], ['4', 'Launch', '11–13 May'], ['5', 'Scale', 'Jun – Sep']].map(([n, t, d]) => `<div class="tlb ${n === '4' ? 'hl' : ''}"><div class="pn">Phase ${n}</div><b>${t}</b><span>${d}</span></div>`).join('')}</div>
  <h3>Targets by launch day</h3>
  <div class="nums">${[['1,000', 'target contacts emailed'], ['100', 'demo tours held'], ['10', 'founding sites live'], ['400', 'demo and waitlist sign-ups']].map(([a, b]) => `<div><div class="d big">${a}</div><span>${b}</span></div>`).join('')}</div>
  <p class="small">Plus 3 published case studies and 5 paying sites from the launch offer.</p>
  <h3>How to read this plan</h3>
  <div class="key"><div>${own('You')}<span>Actions for you as founder. Only you can do these: your story, your product, your decisions.</span></div><div>${own('SB Media')}<span>Actions we deliver, and report on each week.</span></div><div>${own('Together')}<span>Work we do side by side, such as pilot onboarding and the launch event.</span></div></div>
  <p class="small">Every action has a due date and a box to tick. We'll go through it together every Monday evening.</p>`));

P.push(page(`
  <h1>What we need from you this week</h1>
  <p class="lead">These decisions and bits unlock everything else. If I've got them by 28 November, the first outreach goes out on 7 December.</p>
  <h3>Decisions</h3>
  ${table([
    ['Approve the founding-site offer', 'Free use on one live site until launch, founding pricing locked in, a direct line to you.', 'You', '28 Nov'],
    ['Confirm pricing', 'Price per site per month, any tiers, and confirm the trade app stays free.', 'You', '28 Nov'],
    ['Confirm the launch date and event', 'We recommend UK Construction Week London, ExCeL, 11–13 May 2027.', 'You', '28 Nov'],
    ['Agree the launch budget', 'Tools, ads, design, video, print and event costs (see the budget page).', 'You', '28 Nov'],
    ['Confirm how many pilots you can support', 'We plan for 10 sites live by the end of February.', 'You', '28 Nov'],
  ])}
  <h3>Information and access</h3>
  ${table([
    ['Your background on site', 'Role, years, companies, why you built it. 15-minute call; we write it up.', 'You', '28 Nov'],
    ['Admin access to the website (WordPress)', 'So we can add the demo form, privacy policy, analytics and fixes.', 'You', '28 Nov'],
    ['Domain access for company email', 'To set up hello@sitequeue.uk with proper email authentication.', 'You', '28 Nov'],
    ['Screenshots or a screen recording of the mobile app', 'To replace our designed phone screens with the real app.', 'You', '4 Dec'],
    ['Your contacts', 'Contractors, site managers or suppliers who have seen Site Queue or would take a call.', 'You', '4 Dec'],
    ['Original logo files', 'Any source file, so a designer can produce a vector logo for print.', 'You', '4 Dec'],
  ])}`));

P.push(page(`
  ${phase(0, 'Foundations', '23 Nov – 4 Dec 2026', 'everything a prospect touches works before anyone is contacted.', [
    ['Set up hello@sitequeue.uk', 'Google Workspace or Microsoft 365, with SPF, DKIM and DMARC so emails land in inboxes.', 'SB Media', '30 Nov'],
    ['Add a “Book a demo / Join the founding sites” form to every page', 'Name, company, role, number of sites, phone. Entries go to the CRM.', 'SB Media', '2 Dec'],
    ['Add a “Try the live demo” button and link', '', 'SB Media', '2 Dec'],
    ['Publish a privacy policy, cookie notice and security page', 'Needed under UK GDPR: the app stores GPS positions and CSCS card photos.', 'Together', '4 Dec'],
    ['Website clean-up', 'Delete the “hello-world” post, hide the public user sitemap, add share image, analytics, Search Console.', 'SB Media', '2 Dec'],
    ['Create the LinkedIn company page and refresh your profile', 'Banner and graphics are ready.', 'SB Media', '30 Nov'],
    ['Set up the CRM and import the 112 targets', 'HubSpot free or Pipedrive.', 'SB Media', '4 Dec'],
    ['Demo quick fixes', 'Open on a site after choosing a role; fix sample-data typos; link back to the website.', 'You', '4 Dec'],
    ['Register social handles and check the trademark', 'LinkedIn, Instagram, TikTok, YouTube, Facebook; UK IPO search and filing.', 'Together', '4 Dec'],
  ])}
  <div class="tip"><b>Why this comes first:</b> every email, post and ad from Phase 1 sends people to the website and the demo. If they can't book a demo there, we're wasting the outreach.</div>`));

P.push(page(`
  ${phase(1, 'First outreach', '7 – 18 Dec 2026', '10 demo tours held and 3 founding sites signed before the Christmas break.', [
    ['Research named contacts for 10 regional housebuilders and 30 live local sites', '', 'SB Media', '7 Dec'],
    ['Start the founding-site email sequence, 20 contacts a day', 'Sent from your address; we write and schedule it.', 'Together', '7 Dec'],
    ['Visit 3 local sites a week with the one-pager', 'Site boards name the contractor and often the site manager.', 'You', 'Weekly'],
    ['Publish your first LinkedIn post: why you built Site Queue', 'We draft, you post.', 'You', '8 Dec'],
    ['Run 20-minute demo tours for everyone who replies', 'Script in the playbook.', 'You', 'Ongoing'],
    ['Apply to UK Construction Week London and Digital Construction Week', 'Start-up zone, speaker slot or stand.', 'SB Media', '11 Dec'],
    ['Contact HBF, FMB, CITB and Build UK', 'Member newsletters and innovation showcases.', 'SB Media', '18 Dec'],
  ])}`));

P.push(page(`
  ${phase(2, 'Pilots live', '4 Jan – 28 Feb 2027', '10 founding sites live with a measured baseline, and the founder story in the press.', [
    ['Prepare the pilot onboarding pack', 'Step-by-step setup guide, QR posters for the cabin, induction template, trade invite message.', 'SB Media', '22 Dec'],
    ['Onboard each pilot site in person', 'Using the onboarding pack: induction built, trades joined by QR code, drivers and first aiders set up.', 'You', 'From 4 Jan'],
    ['Measure a baseline in week 1 of each pilot', 'A 5-minute form we provide: forklift waiting time, induction time, calls to the office, hazards logged.', 'You', 'Week 1 of each'],
    ['Weekly check-in with each pilot site manager', 'Capture quotes, photos and issues.', 'You', 'Weekly'],
    ['Keep outreach running until 10 pilots are live; invite trades on pilot sites', '', 'SB Media', 'Ongoing'],
    ['Post weekly on LinkedIn and start short videos filmed on pilot sites', '2 short videos a week from February.', 'Together', 'Weekly'],
    ['Pitch the founder story to local and trade press', 'Southern Daily Echo, BBC South business, Construction Enquirer.', 'SB Media', '31 Jan'],
    ['Brief a designer: vector logo, product video, advertiser media pack', '', 'SB Media', '15 Jan'],
  ])}
  ${phase(3, 'Proof', '1 Mar – 30 Apr 2027', '3 case studies published, national builders and contractors in conversation, billing ready.', [
    ['Write 2–3 case studies with numbers and site-manager quotes', '', 'SB Media', '31 Mar'],
    ['Start wave 2: national housebuilders, mid-tier contractors, subcontractors', 'With the case studies attached.', 'Together', '1 Mar'],
    ['Start LinkedIn and Google ads to the demo form', '£500–£1,000 a month, reviewed weekly.', 'SB Media', '1 Mar'],
    ['Pilot results press release', '', 'SB Media', '25 Mar'],
    ['Confirm final pricing and turn on billing for site subscriptions', '', 'You', '15 Apr'],
    ['Prepare for UKCW: stand, print-ready banner, demo devices, launch offer', 'Meetings booked with targets before the show.', 'Together', '30 Apr'],
  ])}`));

P.push(page(`
  ${phase(4, 'Launch', 'May 2027', 'a public launch with pilot customers beside you, and every lead followed up within 48 hours.', [
    ['Send embargoed launch release to trade press', '', 'SB Media', '4 May'],
    ['App Store and Google Play listings live, with screenshots and video', '', 'You', '8 May'],
    ['UK Construction Week London, ExCeL', 'Live demos, pilot customers on the stand or a panel, “founding pricing ends this week” offer.', 'Together', '11–13 May'],
    ['Follow up every UKCW lead within 48 hours', '', 'SB Media', '15 May'],
  ])}
  ${phase(5, 'Scale and advertising', 'June – September 2027', 'paying sites growing month on month, and the first paid advertising campaigns.', [
    ['Start wave 3: plant hire, merchants and manufacturers', 'With the media pack and founding advertiser rates.', 'SB Media', '1 Jun'],
    ['Switch on advert billing and moderation', '', 'You', '1 Jun'],
    ['Digital Construction Week, ExCeL', 'Meetings with heads of digital at larger contractors.', 'Together', '23–24 Jun'],
    ['Sign one plant or forklift hire partner and one merchant partner', '', 'Together', '31 Jul'],
    ['UK Construction Week Birmingham, NEC', '', 'Together', '28–30 Sep'],
    ['Monthly numbers review; move budget to what books demos most cheaply', '', 'Together', 'Monthly'],
  ])}`));

const fix = (t, items) => `<div class="fix"><h3>${t}</h3>${items.map(([a, b]) => `<div class="fi"><span class="box"></span><div><b>${a}</b><div class="w">${b}</div></div></div>`).join('')}</div>`;
P.push(page(`
  <h1>The fix list in detail</h1>
  <p class="lead">Every campaign sends people to the website and the demo, so these come first. Most of them take less than a day.</p>
  <div class="two">
  ${fix('Website', [
    ['Company email instead of Gmail', 'Contractors trust a company address, and outreach needs it to reach inboxes.'],
    ['Demo-booking form on every page', 'Today there is no way for an interested site manager to get in touch except email.'],
    ['“Try the live demo” button', 'The demo is the strongest sales tool and the website never mentions it.'],
    ['Privacy policy, cookies and security page', 'Required under UK GDPR; procurement teams will ask for it.'],
    ['“For advertisers” page', 'Explains site-by-site advertising, with its own enquiry form.'],
    ['Pricing signal', '“From £X per site” or “Free founding pilot, then a locked rate”.'],
    ['Remove the “hello-world” post', 'A default WordPress post is still live.'],
    ['Hide the public user sitemap', 'It shows admin usernames to anyone.'],
    ['Share image, analytics, Search Console', 'So links look right on LinkedIn and we can measure every visit.'],
  ])}
  ${fix('Demo, app and brand', [
    ['Open on a site after choosing a role', 'The first screen is currently an empty “Select a site” page.'],
    ['Fix sample-data typos', '“solor panel” and “Fence imcomplete” show on screen shares.'],
    ['Make the web dashboard work on phones', 'On a phone, labels break mid-word (“Peo / ple On Site”).'],
    ['Add an Advertiser demo role', 'So suppliers can see what they would buy.'],
    ['Restrict the Google Maps key to Site Queue domains', 'A quick check in Google Cloud.'],
    ['Vector logo', 'The current logo is an image file and will not print cleanly on banners or PPE.'],
    ['Trademark “Site Queue”', 'Before the launch press release.'],
    ['Social handles', 'Reserve @sitequeue on every main platform now.'],
  ])}
  </div>`));

P.push(page(`
  <h1>Launch budget</h1>
  <p class="lead">We're keeping it lean: about £300 a month on tools, ads from March once the website's capturing leads, and a few one-off costs for design, video, print and the event. All figures are estimates until we get quotes.</p>
  <table class="t b"><tr><th>Item</th><th style="width:150px">Monthly</th><th style="width:150px">One-off</th><th style="width:90px">From</th></tr>
  ${[['Company email', '£10', '', 'Now'], ['LinkedIn Sales Navigator (1 seat)', '£80–£100', '', 'Now'], ['Email finder (Apollo or Hunter)', '£0–£50', '', 'Now'], ['CRM (HubSpot free or Pipedrive)', '£0–£30', '', 'Now'], ['Cold email sending tool', '£30–£60', '', 'Now'], ['Canva Pro', '£10', '', 'Now'], ['Trademark filing (UK IPO)', '', 'About £200', 'Now'], ['Vector logo, pitch deck, advertiser media pack', '', '£500–£1,500', 'Jan'], ['Product video and three short clips', '', '£500–£2,000', 'Feb'], ['LinkedIn and Google ads', '£500–£1,000', '', 'Mar'], ['Print: one-pagers, pull-up banner, site signs, hi-vis', '', '£300–£800', 'Mar'], ['UK Construction Week stand or start-up pod', '', 'Quote from organiser', 'Book Jan']].map(r => `<tr><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td><td>${r[3]}</td></tr>`).join('')}</table>
  <h1 style="margin-top:34px">How we'll work together</h1>
  <div class="key">
    <div>${own('Weekly')}<span><b>Monday evening check-in, 30 minutes by video call.</b> What went out, who replied, demos booked, what we need from you this week.</span></div>
    <div>${own('Monthly')}<span><b>Numbers review.</b> Contacts, replies, demos, pilots, sign-ups, website visits, against the targets on page 2.</span></div>
    <div>${own('Shared')}<span><b>One CRM and one tracker.</b> You can see every contact, email and demo at any time.</span></div>
  </div>
  <p class="small">Healthy rates we watch: email replies over 5%, demo-to-pilot over 20%, website visitors to form over 2%.</p>`));

const ready = [['Marketing playbook', 'Positioning, messages for every role, who to email, email and LinkedIn templates, demo script, channels.'], ['Outreach target list', '112 organisations in 10 segments, with roles to contact and a status tracker.'], ['12 social posts', 'One for every part of the platform, plus the founding-site offer and advertisers.'], ['LinkedIn banner, share image, email header', 'Ready to upload.'], ['A4 sales one-pager', 'To email after calls and leave at site cabins.'], ['Pull-up banner layout', 'For the UKCW stand, to be finished for print.'], ['Brand basics sheet', 'Colours, type and rules so everything stays consistent.'], ['Go-to-market pitch deck', '17 slides covering the whole plan.']];
P.push(page(`
  <h1>Ready to use today</h1>
  <p class="lead">Everything below is already done, in the Site Queue brand, and ready to go from day one.</p>
  <div class="ready">${ready.map(([a, b]) => `<div><b>${a}</b><span>${b}</span></div>`).join('')}</div>
  <div class="cta on-lime">
    <div class="d" style="font-size:40px">Next step</div>
    <div style="font-size:15px;line-height:1.5;font-weight:600;color:#2E5A14;margin-top:8px">Get me the decisions and bits on page 3 by 28 November and we'll start Phase 0 the same day. The first founding-site emails go out on 7 December.</div>
  </div>`));

const CSS = `
@page{size:A4;margin:0}
body{background:#FBFBF8;color:#1F1F1F}
.page{position:relative;width:794px;height:1123px;padding:56px 56px 80px;overflow:hidden;page-break-after:always;background:#FBFBF8}
.page.cover{padding:0;background:#1F1F1F;color:#F2F3EF}
h1{font-family:'Barlow Condensed';font-weight:800;font-size:44px;line-height:.95;margin-bottom:12px}
h2{font-family:'Barlow Condensed';font-weight:800;font-size:32px;line-height:1}
h3{font-family:'Barlow Condensed';font-weight:800;font-size:22px;margin:22px 0 10px}
.lead{font-size:15px;line-height:1.5;color:#3A3F38;max-width:640px}
.small{font-size:12.5px;color:#545A52;margin-top:10px;line-height:1.5}
.foot{position:absolute;left:56px;right:56px;bottom:30px;display:flex;justify-content:space-between;font-size:10.5px;font-weight:600;color:#9A9F98}
.own{display:inline-block;font-size:10.5px;font-weight:700;border-radius:999px;padding:3px 8px;white-space:nowrap}
.own.you{background:#80D83B;color:#1F1F1F}.own.agency{background:#1F1F1F;color:#fff}.own.tog{background:#E6E8E1;color:#1F1F1F}
.t{width:100%;border-collapse:collapse;font-size:12px}
.t th{text-align:left;font-size:10.5px;font-weight:700;color:#7D827C;padding:0 6px 6px;border-bottom:1.5px solid #1F1F1F}
.t td{padding:7px 6px;border-bottom:1px solid #E1E3DC;vertical-align:top;line-height:1.35}
.t td.n{font-family:'Barlow Condensed';font-weight:800;font-size:16px;color:#7D827C}
.t td.due{font-weight:600;font-size:11.5px}
.t .w{font-size:11px;color:#62675F;margin-top:2px}
.t.b td{font-size:12.5px}
.box{display:inline-block;width:14px;height:14px;border:1.5px solid #9A9F98;border-radius:3px}
.ph{margin-bottom:24px}
.phh{display:flex;justify-content:space-between;align-items:flex-end;margin-bottom:6px}
.pn{font-size:11px;font-weight:700;color:#2E5A14}
.pd{font-size:13px;font-weight:700;background:#ECEDE8;border-radius:6px;padding:4px 10px}
.goal{font-size:12.5px;color:#3A3F38;margin-bottom:8px}
.tl{display:grid;grid-template-columns:repeat(6,1fr);gap:8px}
.tlb{background:#ECEDE8;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:3px}
.tlb b{font-size:14px}.tlb span{font-size:11px;color:#545A52}.tlb.hl{background:#80D83B}
.nums{display:grid;grid-template-columns:repeat(4,1fr);gap:12px}
.nums .big{font-size:48px;color:#1F1F1F}.nums span{font-size:12px;color:#545A52}
.key{display:flex;flex-direction:column;gap:10px}
.key>div{display:grid;grid-template-columns:90px 1fr;gap:12px;align-items:start;font-size:13px;line-height:1.45}
.two{display:grid;grid-template-columns:1fr 1fr;gap:28px}
.fi{display:grid;grid-template-columns:20px 1fr;gap:8px;margin-bottom:10px;font-size:12.5px;line-height:1.35}
.fi .w{font-size:11.5px;color:#62675F;margin-top:2px}
.ready{display:grid;grid-template-columns:1fr 1fr;gap:12px;margin-top:16px}
.ready>div{background:#ECEDE8;border-radius:10px;padding:14px 16px;display:flex;flex-direction:column;gap:4px}
.ready b{font-family:'Barlow Condensed';font-weight:800;font-size:20px}.ready span{font-size:12.5px;color:#3A3F38;line-height:1.4}
.tip{background:#ECEDE8;border-radius:10px;padding:14px 16px;font-size:13px;line-height:1.5;margin-top:6px}
.cta{text-align:left;margin-top:26px;border-radius:14px;padding:24px 26px}
`;

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 })).newPage();
  await p.setContent(`<!doctype html><html><head><style>${K.CSS}${CSS} body{overflow:visible}</style></head><body>${P.join('')}</body></html>`);
  await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
  const over = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => { const lim = pg.getBoundingClientRect().bottom - 70; let worst = 0; pg.querySelectorAll('table,.fix,.key,.ready,.cta,p,h1,h3,.tl,.nums').forEach(e => { const r = e.getBoundingClientRect(); if (r.bottom > lim) worst = Math.max(worst, Math.round(r.bottom - lim)); }); return worst ? `page ${i + 1} over by ${worst}px` : null; }).filter(Boolean));
  console.log(over.length ? over.join('\n') : 'no overflow');
  await p.pdf({ path: OUT, format: 'A4', printBackground: true });
  for (let i = 0; i < P.length; i++) { await p.evaluate(i => window.scrollTo(0, i * 1123), i); }
  await b.close();
  console.log('pages', P.length);
})();
