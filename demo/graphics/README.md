# Ask Mavis graphics

Ready-to-use pictures in the Ask Mavis colours. All PNG.

| Folder or file | What it is | Size |
|---|---|---|
| `carousel-scam-signs/` | A swipe-through post, "5 signs a message is a scam", 7 slides. Post them in order, 1 to 7. The wording comes from the app's scam checker. | 1080 × 1080 |
| `ask-mavis-how-it-works.png` | "Help in three small steps" | 1080 × 1350 |
| `ask-mavis-what-mavis-helps-with.png` | The five main things Mavis helps with | 1080 × 1350 |
| `stories/` | Four Stories: 159, 7726, "No silly questions", "Telly playing up?". The top and bottom are left clear for the Instagram and Facebook buttons. | 1080 × 1920 |
| `highlight-covers/` | Five covers for Instagram Story highlights: Scams, Telly, Phone, Tips, Teasers | 1080 × 1920 |
| `page/ask-mavis-profile-picture.png` | Profile picture. The logo sits in the middle so a round crop doesn't cut it. | 1080 × 1080 |
| `page/ask-mavis-facebook-cover.png` | Facebook page cover | 1640 × 624 |
| `page/ask-mavis-play-store-feature-graphic.png` | The banner Google Play asks for on the app's store page | 1024 × 500 |

Suggested words for the carousel:

> Five signs a text, email or phone call is a scam. 🛑 Swipe through, save it, and send it to someone you love. If you're ever unsure, hang up and ring your bank on 159.

## Making them again

In `source/`: run `npm i @fontsource/merriweather`, copy `demo/ask-mavis-logo.png` there as `logo.png`, then `node make.mjs`. The words and sizes are in `make.mjs`, and the look is in `gfx.css`.
