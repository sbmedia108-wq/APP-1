# Site Queue demo form: how it should work

The form is in `demo-form.html`, ready to paste into a WordPress Custom HTML block or rebuild in a form plugin (WPForms, Fluent Forms or Gravity Forms all work). Previews: `demo-form-preview-desktop.png` and `demo-form-preview-mobile.png`.

## Where it goes

- A **"Book a demo"** button in the header on every page, linking to the form.
- The form at the bottom of the homepage (`#demo`) and on its own page, `/book-a-demo/`.
- A **"Try the live demo"** button next to it, linking to demo.sitequeue.uk.

## What it asks, and why

Seven visible fields, only four of them required. Every extra required field loses people.

| Field | Required | Why we ask |
| --- | --- | --- |
| What are you after? (Book a demo / Join early access / Advertise) | Yes | One form for all three; tells us how to reply |
| Full name | Yes | |
| Company | Yes | Shows whether it's a housebuilder, contractor, trade or supplier |
| Work email | Yes | How we reply |
| Phone | No | Site managers often prefer a call, but making it optional keeps sign-ups up |
| Your role | Yes | Sets which demo we give and which emails they get |
| How many live sites? | No | Shows how big the opportunity is |
| Anything we should know? | No | Start dates and pain points, gold for the demo |
| Updates tick box (unticked by default) | No | Consent to send the early-access emails, as UK GDPR requires |

Hidden fields: `utm_source`, `utm_medium`, `utm_campaign`, `page_url`. These show which post, email or ad brought each lead in. Most form plugins fill them in automatically.

## What happens after they press "Send my request"

1. **Thank-you page** (`/thanks/`): "Cheers, we've got your details." If they chose **Book a demo**, embed Luke's Calendly so they can pick a time straight away instead of waiting for an email.
2. **Automatic email to them**, from hello@sitequeue.uk:
   > Subject: Thanks for your interest in Site Queue
   >
   > Hi [first name], thanks for getting in touch. We'll be back to you within one working day. In the meantime you can try the live demo at demo.sitequeue.uk. Cheers, Luke, Founder, Site Queue
3. **Notification** to Luke and Sam with all the details.
4. **Into the CRM** (HubSpot free) automatically, tagged by what they chose, so nobody gets lost.

## Must-haves

- **Spam protection:** the hidden honeypot field is already in the form; add the plugin's built-in anti-spam or Cloudflare Turnstile. Avoid annoying image CAPTCHAs.
- **Privacy policy:** the page at `/privacy-policy/` needs to exist before the form goes live.
- **Mobile:** fields stack on phones, and the inputs are big enough to tap with work gloves on. Most site managers will see it on a phone.
- **Tracking:** fire a "Lead" conversion event on the thank-you page for Google Analytics and the LinkedIn Insight Tag, so we can see which posts and ads work.
