# Eklipse Media: review, rebuild and operating plan

Everything for relaunching and running Eklipse Media, prepared 22 November 2026.

| # | What | Where |
|---|---|---|
| 1 | **Review and critique** of the current site (6 urgent fixes, including Google showing a construction-company description) | [`01-AUDIT.md`](01-AUDIT.md) |
| 2 | **Brand and positioning**: two divisions, audiences, voice, packages | [`02-BRAND-AND-POSITIONING.md`](02-BRAND-AND-POSITIONING.md) |
| 3 | **Marketing plan**: 90 days, ranked channels, weekly rhythm, KPIs | [`03-MARKETING-PLAN.md`](03-MARKETING-PLAN.md) |
| 4 | **Operating plan**: how I'd run the company (sales process, tools, roster, compliance, 12-month roadmap, dashboard) | [`04-OPERATING-PLAN.md`](04-OPERATING-PLAN.md) |
| 5 | **Design system**: the current site's tokens extracted, plus the new "Eclipse" system (tokens, logo mark, rules) | [`design-system/`](design-system/) |
| 6 | **Rebuilt and redesigned website** (static HTML/CSS, no builder lock-in) | [`site/`](site/) |
| 7 | **Something new: the Quote Builder**, which turns visitors into structured WhatsApp and email enquiries | [`site/quote.html`](site/quote.html) |
| 8 | **Marketing assets**: 30 days of social posts, email/WhatsApp sequences, venue/corporate/podcast outreach, Google & Meta ad copy, Google Business Profile copy | [`marketing/`](marketing/) |
| 9 | **Graphics**: 3 Instagram posts (1080×1350) and a venue one-pager (PNG + print PDF) | [`marketing/graphics/`](marketing/graphics/) |
| 10 | **Step-by-step action plan**: Dad / you / Claude, in order | [`05-ACTION-PLAN.md`](05-ACTION-PLAN.md) |
| 11 | **Budget and hours**: 3 budget levels, booking maths, year-one scenarios, 5 hours a week each | [`06-BUDGET-AND-HOURS.md`](06-BUDGET-AND-HOURS.md) |

## Do these today (15 minutes, in GoDaddy)
1. Replace the **meta description**. It currently describes a construction consultancy.
2. Replace the **social share image**. It's currently a construction worker.
3. Change the **logo alt text** from "Piers Brown Associates" to "Eklipse Media".
4. **Hide the empty reviews section.**

Copy to paste is at the bottom of `01-AUDIT.md`.

## Preview the new site locally
```bash
cd eklipse/site && python3 -m http.server 8000
```
Then open http://localhost:8000.

## Go live (recommended: Netlify, free)
1. Drag the `eklipse/site` folder onto https://app.netlify.com/drop.
2. Under Domain settings, add `eklipsemedia.co.uk` and update the DNS at GoDaddy as Netlify instructs.
3. The enquiry form works automatically on Netlify. Turn on email notifications under Forms.
4. Add a 1200×630 event photo at `site/assets/og-image.jpg`, and move the privacy policy over as `privacy-policy.html`.

## Assumptions to confirm before launch
- **Base:** "Warwickshire", inferred from the 01926 phone number.
- **What's included in packages:** the site and graphics say lighting and a speeches mic are standard. The current site only says "full technical set-up included".
- **Experience claims:** the site now says "behind the decks since the 90s" and "vetted, insured DJs". Only keep the second once every freelancer's insurance has been checked.
- **Prices and revenue figures** in the plans are UK market estimates for planning only. Replace them with your real numbers.
- **The logo mark** is a concept. Get it refined before any large print run.
- **Photos:** there are no real event photos yet. This is the biggest gap (shot list in `design-system/DESIGN.md`).
