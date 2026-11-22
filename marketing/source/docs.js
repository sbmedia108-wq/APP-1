// Client questionnaire, client proposal and SB Media evening plan (A4 PDFs) in the Site Queue brand.
const { chromium } = require('playwright');
const K = require('./kit');

const CSS = `
@page{size:A4;margin:0}
body{background:#FBFBF8;color:#1F1F1F}
.page{position:relative;width:794px;height:1123px;padding:56px 56px 80px;overflow:hidden;page-break-after:always;background:#FBFBF8}
.page.cover{padding:0;background:#1F1F1F;color:#F2F3EF}
h1{font-family:'Barlow Condensed';font-weight:800;font-size:44px;line-height:.95;margin-bottom:12px}
h2{font-family:'Barlow Condensed';font-weight:800;font-size:32px;line-height:1;margin:30px 0 12px}
h3{font-family:'Barlow Condensed';font-weight:800;font-size:20px;margin:16px 0 6px}
p{font-size:15px;line-height:1.6;color:#2E322D;margin-bottom:10px}
.lead{font-size:17px;line-height:1.55;color:#3A3F38;max-width:660px}
.small{font-size:12px;color:#545A52;line-height:1.5}
.foot{position:absolute;left:56px;right:56px;bottom:30px;display:flex;justify-content:space-between;font-size:10.5px;font-weight:600;color:#9A9F98}
.qq{display:grid;grid-template-columns:28px 1fr;gap:6px;margin-bottom:14px}
.qq .n{font-family:'Barlow Condensed';font-weight:800;font-size:20px;color:#2E5A14;line-height:1}
.qq b{font-size:13.5px;line-height:1.35}
.qq .why{font-size:11.5px;color:#62675F;margin:2px 0 6px}
.line{border-bottom:1px solid #C9CCC4;height:22px}
.t{width:100%;border-collapse:collapse;font-size:13.5px}
.t th{text-align:left;font-size:10.5px;font-weight:700;color:#7D827C;padding:0 6px 6px;border-bottom:1.5px solid #1F1F1F}
.t td{padding:9px 6px;border-bottom:1px solid #E1E3DC;vertical-align:top;line-height:1.4}
.t td.k{font-weight:700;white-space:nowrap}
.t .w{font-size:11px;color:#62675F;margin-top:2px}
.grid2{display:grid;grid-template-columns:1fr 1fr;gap:14px}
.grid3{display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px}
.tile2{background:#ECEDE8;border-radius:10px;padding:18px 18px}
.tile2 b{display:block;font-family:'Barlow Condensed';font-weight:800;font-size:23px;margin-bottom:6px}
.tile2 span{font-size:14px;line-height:1.5;color:#3A3F38;display:block}
.tile2.lime{background:#80D83B}.tile2.lime span{color:#1F3A0C}
.tile2.dark{background:#1F1F1F;color:#F2F3EF}.tile2.dark span{color:#C9CDC5}
ul.l{padding-left:18px;margin:4px 0 8px}ul.l li{font-size:14.5px;line-height:1.55;margin-bottom:7px;color:#2E322D}
.own{display:inline-block;font-size:10.5px;font-weight:700;border-radius:999px;padding:3px 8px;white-space:nowrap}
.own.you{background:#80D83B}.own.agency{background:#1F1F1F;color:#fff}.own.tog{background:#E6E8E1}.own.cl{background:#2E5A14;color:#fff}
.box{display:inline-block;width:13px;height:13px;border:1.5px solid #9A9F98;border-radius:3px;vertical-align:-2px;margin-right:6px}
.sign{display:grid;grid-template-columns:1fr 1fr;gap:28px;margin-top:16px}
.sign div{border-bottom:1px solid #1F1F1F;height:42px;font-size:11px;color:#7D827C;display:flex;align-items:flex-end;padding-bottom:4px}
.cta{border-radius:14px;padding:20px 24px;background:#80D83B;margin-top:18px}
.tl{display:grid;grid-template-columns:repeat(6,1fr);gap:8px;margin:8px 0}
.tlb{background:#ECEDE8;border-radius:10px;padding:10px;display:flex;flex-direction:column;gap:3px}
.tlb b{font-size:14px}.tlb span{font-size:11px;color:#545A52}.tlb.hl{background:#80D83B}.pn{font-size:11px;font-weight:700;color:#2E5A14}
`;

function build(title, credit) {
  let n = 0; const pages = [];
  const page = (body, cls = '') => { n++; pages.push(`<div class="page ${cls}">${body}${cls.includes('cover') ? '' : `<div class="foot"><span>${title}</span><span>${credit}</span><span>${n}</span></div>`}</div>`); };
  const cover = (h, sub, meta, screen) => page(`
    <div class="abs" style="left:520px;top:0;width:274px;height:1123px;background:var(--lime)"></div>
    ${K.phone(470, 250, 290, screen)}
    <img class="tile abs" src="${K.LOGO}" style="left:56px;top:56px;width:84px">
    ${K.stack(56, 300, 410, [`<div class="d" style="font-size:72px">${h}</div>`, `<div style="font-size:17px;line-height:1.5;color:#B7BCB4">${sub}</div>`], 26)}
    <div class="abs" style="left:56px;bottom:56px;font-size:14px;line-height:1.6;color:#B7BCB4">${meta}</div>`, 'cover');
  return { page, cover, html: () => pages.join('') };
}
const own = o => `<span class="own ${{ You: 'you', 'SB Media': 'agency', Together: 'tog', Founder: 'cl' }[o] || 'tog'}">${o}</span>`;

// ---------- 1. Client questionnaire ----------
function questionnaire() {
  const D = build('Site Queue marketing questionnaire', 'SB Media');
  const Q = (i, q, why, lines = 2) => `<div class="qq"><div class="n">${i}</div><div><b>${q}</b><div class="why">${why}</div>${'<div class="line"></div>'.repeat(lines)}</div></div>`;
  let i = 0; const q = (a, b, l) => Q(++i, a, b, l);
  D.page(`
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:22px"><img class="tile" src="${K.LOGO}" style="width:56px"><div><h1 style="margin:0">Before we crack on: 20 quick questions</h1></div></div>
    <p class="lead">Your answers shape everything we say about Site Queue: what we promise in adverts, who we go after first and how we tell your story. Short answers are fine. If it's easier, just send voice notes on Messenger and I'll write them up.</p>
    <p class="small"><b>Please return by 28 November 2026</b> so the first outreach can go out on 7 December.</p>
    <h2>About you</h2>
    ${q('What is your background on site: role, years, and which companies? Why did you build Site Queue?', 'Your story leads the press release, your LinkedIn and the first line of every email.', 3)}
    ${q('Are you happy to be the face of Site Queue: posting on LinkedIn, appearing in short videos and presenting at events?', 'Founder-led marketing is the fastest way to win trust with site managers.')}
    ${q('How many hours a week can you give to demos, sales calls and site visits?', 'This sets how many demos and site visits we line up.')}
    ${q('Are there companies you cannot approach (former employers, non-competes) or that you already know personally?', 'So we never contact the wrong people, and warm up the right ones first.')}`);
  D.page(`
    <h2 style="margin-top:0">About the product</h2>
    ${q('Which features are fully built and working today, and which are still in progress?', 'We only advertise what works. The demo looks complete; please confirm.', 3)}
    ${q('Is the mobile app live or ready for the App Store and Google Play? If not, when?', 'Trades need the app on day one of a pilot.')}
    ${q('Does Site Queue work with poor or no signal on site?', 'Competitors sell on this; contractors ask about it early.')}
    ${q('Does it connect with anything contractors already use, such as CSCS checks, Procore or Excel?', 'Larger contractors will ask about integrations and exports.')}
    ${q('Where is customer data hosted, and do you have a privacy policy and data terms ready?', 'Needed for the website and for contractors’ procurement checks.')}
    <h2>Pricing and the offer</h2>
    ${q('What will Site Queue cost: per site, per user or tiered? Who pays, the main contractor or each subcontractor?', 'Sets the website pricing message and the early-bird offer.')}`);
  D.page(`
    ${q('Is the trade app definitely free for workers on site?', 'A free trade app is a strong selling point; we want to say it confidently.')}
    ${q('Are you happy to give one pilot site 8 weeks free, and an early-bird rate to sites that sign up before launch? What rate?', 'This is the offer in every email and post.')}
    ${q('Is advertising launching with the product or later? Roughly what would a supplier pay?', 'Decides when we start talking to merchants and plant hire.')}
    <h2>Proof and contacts</h2>
    ${q('Has Site Queue been used on a real site yet, even informally? Any numbers, feedback or quotes?', 'Any real proof makes the first emails far stronger.', 3)}
    ${q('Who in your network would take a call: site managers, contractors, suppliers?', 'Warm introductions convert far better than cold emails.', 3)}
    ${q('How many pilot sites can you set up and support at the same time?', 'We will not sign more pilots than you can look after well.')}`);
  D.page(`
    <h2 style="margin-top:0">Business and brand</h2>
    ${q('What is the registered company name? Is Toolbit (the contact email on the site) the parent company or the developer?', 'Needed for the privacy policy, press releases and the website footer.')}
    ${q('Do you own the domains and the original logo files? Is “Site Queue” trademarked?', 'We need vector logo files for print and must protect the name before launch PR.')}
    ${q('Is the 2027 launch date firm? Is UK Construction Week London (11–13 May 2027) realistic for you?', 'Stand and speaker applications open early.')}
    ${q('What monthly budget is available for tools, ads, design and events? What does success look like to you by launch?', 'So we spend where it matters and measure what you care about.', 3)}
    <div class="cta"><div class="d" style="font-size:30px">Cheers</div><p style="margin:6px 0 0;color:#1F3A0C;font-weight:600">Just reply to the email with your answers, or send them as voice notes on Messenger, whatever's easiest.</p></div>`);
  return D.html();
}

// ---------- 2. Client proposal ----------
function proposal() {
  const D = build('Site Queue marketing proposal', 'SB Media');
  D.cover('Marketing proposal', 'Taking Site Queue from a working demo to a proper launch at UK Construction Week London, May 2027.', 'Prepared for Luke Valvona<br>by SB Media, 21 November 2026', K.phoneHome());
  D.page(`
    <h1>Our recommendation</h1>
    <p class="lead">Right, straight to it. Site Queue is a properly good product, but at the minute nobody knows it exists. The plan is simple: prove it on one pilot site, get paying sites lined up on an early-access list, then launch it properly at UK Construction Week London, 11–13 May 2027.</p>
    <div class="grid3" style="margin-top:14px">
      <div class="tile2"><b>The product's ready</b><span>Logistics, inductions, programme, drawings, safety, site map and feed, for every role on site. The demo's good enough to sell from today.</span></div>
      <div class="tile2"><b>The marketing isn't</b><span>The website's got no way to capture a lead, no link to the demo and a Gmail contact. Basically, nobody can find you yet.</span></div>
      <div class="tile2 lime"><b>The plan</b><span>Sort the basics, prove it on one pilot site, line up paying customers, then launch with them stood beside you.</span></div>
    </div>
    <h2>How we position Site Queue</h2>
    <div class="tile2 dark" style="padding:22px 24px"><b style="font-size:36px;line-height:1">Run the whole site from one app.</b><span style="font-size:13.5px;margin-top:8px">For UK housebuilders and contractors who lose hours to waiting, chasing and paperwork, Site Queue is the one live app that keeps people, plant, materials and information moving, with a free app for every trade on site.</span></div>
    <h2>The offer that opens doors</h2>
    <p>No giving it away. <b>One pilot site</b> gets Site Queue free for 8 weeks, in return for honest feedback, a case study and a quote, then moves onto the paid plan. <b>Everyone else pays.</b> Interested sites join an early-access list on the website and get an early-bird rate if they sign up before launch. Sites that want it sooner can start paying from April.</p>
    <h2>Who we go after first</h2>
    <p>We start with regional housebuilders down south. The demo's built around plots and phases, which is exactly how they work, and you can actually get to their sites. Once we've got proof, we go after the national builders and mid-tier contractors, then suppliers and plant hire as advertisers once sites are live. We've already built a list of 112 companies to go after.</p>`);
  D.page(`
    <h1>Our approach</h1>
    <p class="lead">Three stages. Each one has a clear finish line, so we both know exactly where we're at.</p>
    <div class="grid3" style="margin-top:12px">
      <div class="tile2"><b>1. Get ready</b><span><b style="font-family:Barlow;font-size:12px;display:inline">Nov–Dec 2026.</b> Sort the website and demo so every visit can turn into a conversation. Set up company email, LinkedIn, CRM and the outreach system. First emails and site visits.</span></div>
      <div class="tile2"><b>2. Prove it</b><span><b style="font-family:Barlow;font-size:12px;display:inline">Jan–Apr 2027.</b> One pilot site live and measured. A case study with real numbers. First paying sites from April. Founder story in the press. National builders and contractors approached with proof.</span></div>
      <div class="tile2 lime"><b>3. Launch and scale</b><span><b style="font-family:Barlow;font-size:12px;display:inline">May–Sep 2027.</b> Public launch at UK Construction Week London. Paying sites. Advertisers and partners. Digital Construction Week and UKCW Birmingham.</span></div>
    </div>
    <h2>Channels, in order of impact</h2>
    <table class="t">
      <tr><th style="width:28%">Channel</th><th>What happens</th></tr>
      <tr><td class="k">Direct outreach</td><td>Founder-signed emails to target contractors, 20 a day, sent automatically from your inbox. LinkedIn connections. Your site visits with the one-pager.</td></tr>
      <tr><td class="k">Your LinkedIn</td><td>Three posts a week about the problem, the build and pilot progress. We write them; you approve and post.</td></tr>
      <tr><td class="k">Company LinkedIn and social</td><td>12 posts ready now, one for every feature, plus an animated product video.</td></tr>
      <tr><td class="k">Trade PR</td><td>Founder story now, pilot results in March, launch in May: Construction Enquirer, Housebuilder &amp; Developer, local press.</td></tr>
      <tr><td class="k">Events</td><td>Launch at UK Construction Week London, 11–13 May 2027. Then Digital Construction Week (June) and UKCW Birmingham (September).</td></tr>
      <tr><td class="k">Partners and ads</td><td>Plant hire and merchant partners. LinkedIn and Google ads from March, once the website captures leads.</td></tr>
    </table>`);
  D.page(`
    <h1>What's included</h1>
    <h2 style="margin-top:6px">Already delivered</h2>
    <div class="grid2">
      ${[['Marketing playbook', 'Positioning, messages for every role, email and LinkedIn templates, demo script.'], ['Target list', '112 organisations in 10 segments with roles to contact and a tracker.'], ['12 social posts', 'One for every part of the platform, the founding-site offer and advertisers.'], ['Animated product video', '32 seconds, square for social and widescreen for the website.'], ['Sales one-pager and pull-up banner', 'For calls, site cabins and the UKCW stand.'], ['Brand basics and pitch deck', 'Colours, type and rules; a 17-slide go-to-market deck.']].map(([a, b]) => `<div class="tile2"><b>${a}</b><span>${b}</span></div>`).join('')}
    </div>
    <h2>Every month from December</h2>
    <ul class="l">
      <li><b>Outreach running:</b> target research, email sequences written and scheduled, replies handled with you.</li>
      <li><b>Content:</b> 12 LinkedIn posts for you, 8 company posts, short videos edited from your site footage.</li>
      <li><b>PR:</b> press releases, journalist pitches and award entries at each milestone.</li>
      <li><b>Website:</b> fixes, new pages (advertisers, security, case studies) and SEO articles.</li>
      <li><b>Design:</b> any new graphics, print, ads and event material.</li>
      <li><b>Reporting:</b> a monthly numbers review against the launch targets.</li>
    </ul>
    <h2>Targets by launch day</h2>
    <div class="grid3" style="grid-template-columns:repeat(4,1fr)">${[['1,000', 'target contacts emailed'], ['100', 'demo tours held'], ['5', 'paying sites by launch'], ['400', 'early-access sign-ups']].map(([a, b]) => `<div><div class="d" style="font-size:46px">${a}</div><span class="small">${b}</span></div>`).join('')}</div>`);
  D.page(`
    <h1>Timeline</h1>
    <div class="tl">${[['0', 'Foundations', '23 Nov – 4 Dec'], ['1', 'First outreach', '7 – 18 Dec'], ['2', 'Pilot live', 'Jan – Feb'], ['3', 'Proof', 'Mar – Apr'], ['4', 'Launch', '11–13 May'], ['5', 'Scale', 'Jun – Sep']].map(([n, t, d]) => `<div class="tlb ${n === '4' ? 'hl' : ''}"><div class="pn">Phase ${n}</div><b>${t}</b><span>${d}</span></div>`).join('')}</div>
    <table class="t" style="margin-top:12px">
      <tr><th style="width:16%">When</th><th>Milestone</th><th style="width:20%">Who</th></tr>
      ${[['28 Nov', 'Questionnaire answered, decisions made, access shared', 'Founder'], ['4 Dec', 'Website fixed: demo form, demo link, privacy policy, analytics', 'Together'], ['7 Dec', 'First emails to housebuilders go out', 'SB Media'], ['18 Dec', 'Pilot site agreed before the Christmas break', 'Together'], ['4 Jan', 'Pilot site goes live', 'Founder'], ['31 Jan', 'Founder story in local and trade press', 'SB Media'], ['28 Feb', 'Pilot results measured; early-access list growing', 'Together'], ['31 Mar', 'Pilot case study published; ads start', 'SB Media'], ['15 Apr', 'Pricing final, billing on, first paying sites', 'Founder'], ['30 Apr', 'Stand, banner and launch offer ready', 'Together'], ['11–13 May', 'Public launch at UK Construction Week London', 'Together'], ['Jun–Sep', 'Advertisers, partners, DCW and UKCW Birmingham', 'Together']].map(r => `<tr><td class="k">${r[0]}</td><td>${r[1]}</td><td>${own(r[2])}</td></tr>`).join('')}
    </table>
    <p class="small" style="margin-top:10px">The full step-by-step list, with every action, owner and due date, is in the separate launch action plan.</p>`);
  D.page(`
    <h1>Working together</h1>
    <div class="grid2" style="margin-top:8px">
      <div class="tile2"><b>You</b><span>Your story and your face on LinkedIn and at events. Demo tours and sales calls. Site visits and onboarding the pilot site. Product decisions, pricing and approvals.</span></div>
      <div class="tile2 dark"><b>SB Media</b><span>Strategy, all writing and design, outreach setup and running, LinkedIn content, PR, website updates, event material and reporting.</span></div>
    </div>
    <h2>How we work</h2>
    <ul class="l">
      <li><b>Weekly update:</b> a quick catch-up on Messenger every Monday evening, and a call only if we actually need one.</li>
      <li><b>Replies:</b> within 24 hours on weekdays, by email or Messenger.</li>
      <li><b>Approvals:</b> we'll batch posts and emails for you to approve once a week, so you're not getting chased every day.</li>
      <li><b>Visibility:</b> one shared CRM and tracker, so you can see every contact and demo whenever you want.</li>
      <li><b>Monthly review:</b> we look at the numbers against the targets and put more effort into whatever's booking demos.</li>
    </ul>
    <h2>Next steps</h2>
    <p>Two things and we're off. If I've got them by 28 November, the first emails go out on 7 December.</p>
    <div class="grid2" style="margin-top:10px">
      <div class="tile2 lime"><b>1. Have a look</b><span>Read through the plan and the offer (one free pilot site, everyone else pays), and let me know what you think.</span></div>
      <div class="tile2"><b>2. Answer the questions</b><span>The 20-question questionnaire, by email or voice notes, whatever's easiest.</span></div>
    </div>`);
  return D.html();
}

// ---------- 3. SB Media evening plan (internal) ----------
function evening() {
  const D = build('Your Site Queue evening plan', 'Internal to SB Media');
  D.page(`
    <div style="display:flex;gap:16px;align-items:center;margin-bottom:18px"><img class="tile" src="${K.LOGO}" style="width:56px"><h1 style="margin:0">Your evening plan</h1></div>
    <p class="lead">Everything you need to run Site Queue around work: about <b>8 hours a week</b>, 1 to 2 hours a night, never more than five nights. Claude does the writing, design, research and prep. You do the bits that need an actual person.</p>
    <div class="grid3" style="margin-top:12px">
      <div class="tile2 lime"><b>8 hours</b><span>a week, across 4–5 evenings</span></div>
      <div class="tile2"><b>1–2 hours</b><span>per evening, never more</span></div>
      <div class="tile2"><b>0 daytime</b><span>calls or visits: the founder covers anything in working hours</span></div>
    </div>
    <h2>Rules that keep it to evenings</h2>
    <ul class="l">
      <li><b>The founder does the daytime work.</b> Demos, sales calls, site visits and pilot onboarding are his. Give him a booking link (Calendly free) so prospects book straight into his diary, never yours.</li>
      <li><b>Automate sending.</b> Emails go out from the founder's inbox through the sending tool on a schedule. You load them once a week; they send themselves during the day.</li>
      <li><b>Schedule posts.</b> Use LinkedIn's own scheduler or Buffer (free). Load a week of posts on Sunday.</li>
      <li><b>Batch approvals.</b> One weekly approval pack to the founder, not daily messages.</li>
      <li><b>Claude first.</b> Before you write, design or research anything, ask Claude. Your time goes on sending, deciding and talking to the client.</li>
      <li><b>Set expectations.</b> Tell the client: replies within 24 hours on weekdays, and a Monday evening update on Messenger. That is already written into the proposal.</li>
    </ul>
    <h2>Days you will need off work</h2>
    <p>UK Construction Week London, ExCeL, 11–13 May 2027: book at least one day, ideally two. Everything else can be done in evenings.</p>`);
  D.page(`
    <h1>Your standard week</h1>
    <p class="lead">Once set up (from about 7 December), this is the whole job. Total: about 7.5 hours.</p>
    <table class="t" style="margin-top:10px">
      <tr><th style="width:15%">Evening</th><th style="width:12%">Time</th><th>What you do</th></tr>
      <tr><td class="k">Sunday</td><td>1.5 h</td><td><b>Plan and load the week.</b> Ask Claude for the week's posts and emails. Review, then schedule the posts and load 100 contacts into the sending tool. Send the founder his approval pack.<div class="w">Claude prepares: posts, email copy, contact research notes, approval pack.</div></td></tr>
      <tr><td class="k">Monday</td><td>1 h</td><td><b>Client catch-up.</b> Send the founder a quick Messenger update (Claude drafts it), sort anything he needs, then update the tracker.<div class="w">Claude prepares: the update message and last week's numbers from your CRM export.</div></td></tr>
      <tr><td class="k">Tuesday</td><td>1.5 h</td><td><b>Contacts.</b> Find named contacts in LinkedIn Sales Navigator for next week's companies (about 30 people), and send LinkedIn connection requests from the company page or founder account.<div class="w">Claude prepares: which companies and job titles to search, and the connection notes.</div></td></tr>
      <tr><td class="k">Wednesday</td><td>1.5 h</td><td><b>Replies and leads.</b> Answer replies with Claude's drafts, pass hot leads to the founder's booking link, log everything in the CRM.<div class="w">Claude prepares: reply drafts from the messages you paste in.</div></td></tr>
      <tr><td class="k">Thursday</td><td>1 h</td><td><b>One project task.</b> Website update, press pitch, event application or new design: whatever this week's action plan says.<div class="w">Claude prepares: the finished piece, ready to send or upload.</div></td></tr>
      <tr><td class="k">Fri / Sat</td><td>Off</td><td>Nothing scheduled. Use as catch-up only.</td></tr>
    </table>
    <h2>What to send Claude each week</h2>
    <ul class="l">
      <li>Anything the founder has sent you on Messenger or email: answers, decisions, voice notes (paste in the text).</li>
      <li>A CRM export (contacts, replies, demos booked) for the weekly numbers.</li>
      <li>Any replies from prospects or journalists you want help answering.</li>
      <li>Photos or video clips from pilot sites the founder sends you.</li>
    </ul>`);
  D.page(`
    <h1>One-off setup</h1>
    <p class="lead">Do these across the first two weeks, about 6 hours in total. The client pays for the tools; sign up using a Site Queue email address so the accounts belong to the business.</p>
    <table class="t" style="margin-top:10px">
      <tr><th style="width:4%"></th><th>Task</th><th style="width:11%">Time</th><th style="width:20%">Cost (client pays)</th></tr>
      ${[['Send the founder the proposal, questionnaire and action plan', '30 min', ''], ['Set up hello@sitequeue.uk (Google Workspace) with SPF, DKIM, DMARC', '1 h', 'About £6–£10 a month'], ['Create the LinkedIn company page; upload banner and logo', '30 min', 'Free'], ['Set up the CRM and import the target spreadsheet', '45 min', 'HubSpot free'], ['Set up the sending tool on the founder\'s inbox and load sequence A', '45 min', 'About £30–£60 a month'], ['LinkedIn Sales Navigator (one seat, for contact research)', '15 min', 'About £80–£100 a month'], ['Calendly booking link for the founder\'s demos', '15 min', 'Free'], ['Buffer or LinkedIn scheduler for posts', '15 min', 'Free'], ['Website: create a WordPress login for SB Media, or ask the founder for an application password so Claude can make the fixes', '30 min', 'Free'], ['Book a 1–2 day leave request for UKCW London, 11–13 May', '5 min', '']].map(r => `<tr><td><span class="box"></span></td><td>${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}
    </table>
    <h2>Evening load by phase</h2>
    <table class="t">
      <tr><th style="width:24%">Phase</th><th style="width:14%">Hours / week</th><th>Your focus</th></tr>
      ${[['0. Foundations (to 4 Dec)', '6–8', 'Setup list above; send the client pack; website fixes with Claude.'], ['1. First outreach (7–18 Dec)', '7–8', 'Standard week; first contacts loaded; first LinkedIn posts out.'], ['Christmas break', '1–2', 'Replies only.'], ['2. Pilots live (Jan–Feb)', '7–8', 'Standard week; send the founder the onboarding pack; collect pilot photos and notes.'], ['3. Proof (Mar–Apr)', '8', 'Standard week; approve case studies; set up ads; UKCW preparation.'], ['4. Launch (May)', '8 + 1–2 days off', 'Press release out; on the stand at UKCW; follow up leads in the evenings after.'], ['5. Scale (Jun–Sep)', '6–8', 'Standard week; advertiser outreach; monthly review.']].map(r => `<tr><td class="k">${r[0]}</td><td>${r[1]}</td><td>${r[2]}</td></tr>`).join('')}
    </table>`);
  D.page(`
    <h1>Who does what</h1>
    <div class="grid3" style="margin-top:10px">
      <div class="tile2 lime"><b>You (evenings)</b><span>Client relationship and check-ins. Approvals. Sending, scheduling and loading tools. Finding named contacts. Replies. Paying for and setting up accounts. Journalist and event contact.</span></div>
      <div class="tile2 dark"><b>Claude</b><span>All writing and design. Research and prospect notes. Email sequences, posts and press releases. Website pages and fixes (with access). Videos and graphics. Weekly numbers from your exports. Keeping the plan, deck and documents up to date.</span></div>
      <div class="tile2"><b>The founder (daytime)</b><span>Demo tours and sales calls. Site visits and pilot onboarding. Product, pricing and launch decisions. His LinkedIn posts (approves and posts). Being on camera and at events.</span></div>
    </div>
    <h2>Things Claude cannot do</h2>
    <ul class="l">
      <li>Send emails, post on social media or reply to anyone on your behalf.</li>
      <li>Make phone calls, attend meetings or visit sites.</li>
      <li>Find personal email addresses or phone numbers reliably. Use Sales Navigator and an email finder for that.</li>
      <li>Sign up for or pay for tools, ads, events or printing.</li>
      <li>Guarantee press coverage or event places: it writes the pitch, you send it.</li>
    </ul>
    <h2>Useful things to ask Claude</h2>
    <ul class="l">
      <li>“Write next week's 3 LinkedIn posts for the founder and 2 company posts, with graphics.”</li>
      <li>“Here are this week's replies. Draft answers and tell me which are hot leads.”</li>
      <li>“Research these 10 housebuilders: who to target, their live sites near Eastleigh, and a first line for each email.”</li>
      <li>“Here's the CRM export. Give me this week's numbers against the launch targets.”</li>
      <li>“Turn the founder's notes from pilot site 1 into a one-page case study.”</li>
    </ul>`);
  return D.html();
}

(async () => {
  const b = await chromium.launch();
  const p = await (await b.newContext({ viewport: { width: 794, height: 1123 }, deviceScaleFactor: 2 })).newPage();
  for (const [name, fn] of [['site-queue-client-questionnaire', questionnaire], ['site-queue-proposal', proposal], ['sb-media-evening-plan', evening]]) {
    await p.setContent(`<!doctype html><html><head><style>${K.CSS}${CSS} body{overflow:visible}</style></head><body>${fn()}</body></html>`);
    await p.evaluate(() => document.fonts.ready); await p.waitForTimeout(300);
    const over = await p.evaluate(() => [...document.querySelectorAll('.page')].map((pg, i) => { const lim = pg.getBoundingClientRect().bottom - 70; let w = 0; pg.querySelectorAll('*').forEach(e => { if (e.closest('.foot') || getComputedStyle(e).position === 'absolute' || e.closest('.phone')) return; const r = e.getBoundingClientRect(); if (r.height && r.bottom > lim) w = Math.max(w, Math.round(r.bottom - lim)); }); return w ? `p${i + 1}+${w}` : null; }).filter(Boolean));
    console.log(name, over.length ? 'OVER ' + over.join(' ') : 'ok');
    await p.pdf({ path: `${K.ROOT}/${name}.pdf`, format: 'A4', printBackground: true });
  }
  await b.close();
})();
