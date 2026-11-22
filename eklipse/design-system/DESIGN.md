# Eklipse Media design system

## 1. What the current site uses

These are the values extracted from the live GoDaddy Website Builder theme on eklipsemedia.co.uk (22 Nov 2026), kept as a record:

| Role | Value | Notes |
|---|---|---|
| Background | `rgb(5, 11, 24)` / `#050b18` | Near-black navy |
| Card | `rgb(34, 48, 63)` / `#22303f` | Slate |
| Light text / buttons | `rgb(223, 233, 245)` / `#dfe9f5` | Ice blue |
| Mid tones | `#b9cadd`, `#b8c2ce`, `#8b95a3`, `#5a6675` | Greys |
| Hover | `#27303e` | |
| Font | Inter throughout | No display face |
| Radius | 2–4px | |
| Button | Ghost outline, white border | Low contrast and doesn't read as the main action |

**Verdict:** this is a GoDaddy preset, not a brand. Every colour is a grey-blue, so nothing pulls the eye and the "Contact Us" button looks the same as the frame around it. It reads like a template.

## 2. New system: "Eclipse"

**The idea:** the name already gives us the visual. A dark field, a black disc and a ring of warm corona light. The corona is the brand's only colour. It marks the things that matter: the main action, the logo and the one highlight per section. Darkness is the venue and the warm light is the moment.

It suits both halves of the business. Events take place in dark rooms with warm stage light, and audio and podcast work is "sound you feel, not see".

### Colour
- **Ink** (`#07070a` → `#24242f`) for backgrounds and surfaces.
- **Moon** (`#e9e8ee`, `#a9adbd`) for text. Never use pure white for body text.
- **Corona** (`#f4a62a`) is the one accent. Give it at most one use per screen region, plus the CTA.
- Contrast is checked. Body text on the background is 16.8:1, muted text 7.9:1, and the accent 9.9:1. Dark text on corona buttons passes AA.

### Type
- **Display: Bricolage Grotesque** (Google Fonts) at weight 700–800, tight tracking (-0.035em) and big sizes. It's characterful without being a "DJ font" cliché.
- **Body: Inter** at 400/500 and 17px, with 1.6 leading.
- **Labels:** Inter 500, uppercase, 0.14em tracking, 13px, in the corona or muted colour.

### Logo
- `logo-mark.svg` is a ring with a darker disc offset over it: a crescent of corona light.
- The lockup is the mark plus "EKLIPSE" in Bricolage 800 with "MEDIA" in Inter 500 tracked labels.
- The minimum size for the mark is 20px. It works in one colour (corona on ink, or ink on corona).
- This is a starting concept. Get a designer to refine it before you print anything large.

### Components (built in `/site`)
- **Primary button:** corona background, ink text, pill shape. Hover lifts to `--corona-400` with a soft glow.
- **Secondary button:** text on a 1px border, with a corona border on hover.
- **Service card:** surface, 1px border, 20px radius. A corona label on top shows the division (LIVE / STUDIO).
- **Section label:** small tracked uppercase in corona, above the H2.
- **Form fields:** surface-2 background, 1px border, corona focus ring, and labels above the field (no floating labels).

### Motion
- One entrance on the hero: the eclipse ring fades and scales in over 700ms.
- Sections reveal with a subtle upward fade of 12px.
- All motion is off under `prefers-reduced-motion`.

### Photography direction (the most important thing still missing)
The site needs **real photos of your own events**. Stock concert crowds don't win clients. Shot list:
1. DJ booth from behind the decks, facing the crowd, with warm light. This is the hero image.
2. Close-ups of hands on mixer and mic, and a podcast mic with headphones.
3. Wide shots of corporate and wedding rooms with your lighting rig on.
4. The team, natural and not posed, at least one person by name.
5. The podcast studio set-up.

Shoot dark and warm, with one strong light source. That fits the brand.
