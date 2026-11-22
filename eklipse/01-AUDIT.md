# 01. Review and critique of eklipsemedia.co.uk

*Audited 22 November 2026. Screenshots of the current site are in `research/`.*

**Overall verdict:** the business has real substance: over a decade of events, a broad service list and good underlying copy. The website hides that behind template leftovers, a confused message and no proof. Right now it is more likely to lose enquiries than win them. **Score: 3.5/10.**

---

## 🔴 Fix this week. These are actively hurting you.

| # | Problem | Why it matters | Fix |
|---|---|---|---|
| 1 | **Google meta description is a construction company's**: *"Expert construction consultancy services in cost planning, tendering, estimating and quantity surveying…"* | This is the text Google shows under your name in search results. Anyone searching "Eklipse Media" sees construction consultancy. | Site settings → SEO → replace it (copy below). |
| 2 | **The social share image is a Getty photo of a construction worker** (og:image) | When anyone shares your link on WhatsApp, Facebook or LinkedIn, the preview shows a man in a hard hat at a container port. | Upload one of your own event photos as the social image. |
| 3 | **The logo's alt text says "Piers Brown Associates"** | Screen readers and Google read your logo as another company's name. It was left over from a template or another site. | Change the logo alt text to "Eklipse Media". |
| 4 | **Placeholder headings left on the service cards.** Each card has hidden duplicate headings ("Public Engagement" ×3, "Podcast Production" ×3), and the **"Brand Marketing" card describes audio logos**, not marketing | Google and screen readers see a jumble of repeated or wrong headings. Visitors see a "Brand Marketing" card that's actually about sonic branding. | Rename the card "Audio Branding" and delete the hidden duplicate titles in each card's settings. |
| 5 | **Empty "Our Reputation in the Words of Our Customers" section** | A big heading over blank space tells visitors you have no happy customers. That's worse than having no section at all. | Hide it until you have 3+ real reviews. Then connect Google reviews. |
| 6 | **The hero image and 3 of the 4 "What Drives Us" images are stock or missing.** The one photo with alt text is a stock concert crowd | Generic stock tells buyers you're new or small. Event clients buy on photos of *your* events. | See the shot list in `design-system/DESIGN.md`. Even good phone photos beat stock. |

*Note: images from GoDaddy's image CDN were blocked in my test browser, so some image slots rendered empty for me. The issues above come from the page code (alt text, Getty IDs and meta tags), not only from the screenshot.*

## 🟠 Positioning and messaging

1. **Three different stories at once.**
   - Header: *"media & events brand marketing and public relations"*
   - Hero: *"Delivering unforgettable experiences for corporate and private events"*
   - About: *"a UK-wide podcast and media company"*

   A visitor can't tell within 5 seconds whether you're a DJ company, a PR agency or a podcast studio. **The fix is to keep everything but organise it into two clear divisions: Eklipse Live (events) and Eklipse Studio (podcasts, audio branding, PR).** Lead with Live, which is where your decade of proof is.
2. **"We Set The Tone" is a great line** and it's buried at the bottom-right of the hero, under a decorative line. Make it the headline.
3. **The About copy is written about you, not the client.** It's three paragraphs of history before any benefit. Cut it to two sentences and move proof up.
4. **No location.** Your phone number is 01926 (Warwick and Leamington Spa), but the site never names a town or county. Local search ("wedding DJ Warwickshire", "corporate event entertainment Coventry") is where your easiest bookings come from. *Confirm your base. The new site says "Warwickshire".*
5. **No prices and no "from" figures.** Buyers shortlist on budget. Without even a "packages from £X" figure, many won't enquire.
6. **No proof anywhere:** no named clients, venues, logos, reviews, videos, case studies or team faces.

## 🟡 UX, conversion and accessibility

- The **main CTA is a ghost button** (white outline on navy). It doesn't stand out as the thing to click.
- **The contact form asks for name, email and message only.** It doesn't ask for event type, date or venue, so every enquiry needs a back-and-forth before you can quote.
- **There's only one page**, with no separate service pages. You can't rank for "wedding DJ", "podcast production Midlands" and the rest with a single page.
- The **"What Do We Do ?"** heading has a stray space before the question mark, and the title case is inconsistent across headings.
- Body text is **centred in long paragraphs**, which is hard to read. Left-align anything over two lines.
- **"Powered by GoDaddy"** in the footer. Remove it, as it looks DIY.
- og:locale is `en_US`. It should be `en_GB`.
- There's no structured data (schema.org LocalBusiness), so you miss richer Google results.
- Opening hours are Mon–Fri 9–5 with Saturday "Closed", which is odd for an events company that works weekends. Say "Office hours" and add "Event days: 7 days".

## ✅ What's working (keep it)

- **"We Set The Tone"**: memorable, on-brand and ownable.
- The **service descriptions are genuinely good**: specific, with formats, genres and use cases. I've reused most of them.
- **The WhatsApp button**: the right channel for event clients. Make it more prominent.
- **The values** (Craft, Reliability, Versatility, Passion) are credible and fit the brand.
- The dark theme suits the industry. It just needs a point of colour.

---

## Meta copy to paste into GoDaddy today (5-minute fix)

**SEO title:** `Eklipse Media | Event DJs, Live Music & Podcast Production | Warwickshire & UK-wide`

**Meta description:** `DJs, live music and full event production for weddings, corporate events and private parties, plus podcast production, audio branding and PR. Based in Warwickshire, working across the UK.`

**Logo alt text:** `Eklipse Media`
