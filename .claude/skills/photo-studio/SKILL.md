---
name: photo-studio
description: Edit and retouch photos locally — fix lighting and exposure, colour casts and white balance, brighten dark or dull shots, reduce noise, sharpen, AI-upscale small or blurry images (Real-ESRGAN 2x/3x/4x), and remove or replace backgrounds (cutouts, white product backgrounds, new scenes). Use whenever the user shares photos and asks to edit, retouch, enhance, brighten, fix lighting, "make it pop", upscale, enlarge, increase resolution, sharpen, clean up, cut out, remove background, put on white, or prepare images for a website, social post, flyer, menu, listing or print — even if they only say "make these look better".
---

# Photo Studio

Local photo editing with open-source tools. Nothing is uploaded anywhere; all
processing runs on this machine's CPU.

| Job | Script | Engine |
|---|---|---|
| Lighting, exposure, colour, noise, sharpness | `scripts/enhance.py` | OpenCV |
| AI upscaling 2x / 3x / 4x | `scripts/upscale.py` | Real-ESRGAN x4plus (ONNX) |
| Background removal / replacement | `scripts/cutout.py` | rembg U2-Net |

## Setup (once per machine, ~1 minute)

```bash
bash .claude/skills/photo-studio/scripts/setup.sh
```

This installs the Python packages and downloads the models (~250 MB) into
`~/.cache/photo-studio`. Re-running it is harmless. Run the scripts from their
own folder (`cd .claude/skills/photo-studio/scripts`) or with full paths.

## Workflow

1. **Keep originals.** Never overwrite the user's file. Scripts write new files
   next to the input (`_edit`, `_x4`, `_cutout.png`, `_newbg.jpg`) unless `--out`
   is given. Put deliverables in a folder the user can open (e.g. `photos/edited/`).
2. **Look first.** Open each photo and say in one line what it needs (too dark,
   blue cast, small, busy background). Don't fix what isn't broken.
3. **Order of operations:** cutout (if needed) → enhance → upscale last. Upscaling
   magnifies noise, so denoise before, never after.
4. **Show before/after.** Use `enhance.py --compare` and look at the result
   yourself before presenting it. If it looks over-processed (halos, plastic skin,
   neon colour, crunchy edges), back off and rerun.
5. **Deliver** with sizes and where the files are. For the web, a 2000 px long
   edge JPEG at quality 85-90 is plenty; for print, aim for 300 dpi at the print size.

## enhance.py — lighting and colour

```bash
python3 enhance.py IMG [IMG ...] [--preset natural|bright|punchy|warm|product|portrait] [--compare]
```

Auto exposure and a careful white balance (measured only on near-neutral areas,
so food, sunsets and wood stay warm) run first, then the preset. Fine-tune with:
`--exposure` (stops, ±), `--warmth` (−1..1), `--contrast` (0-3), `--shadows`,
`--highlights` (0-1), `--saturation` (1 = unchanged), `--denoise` (0-10),
`--sharpen` (0-1.5), `--no-auto`.

Preset guide:
- **natural** — default; fix the light, keep it honest.
- **bright** — dim interiors, overcast days, dark phone shots.
- **punchy** — food, products, social posts that need to stand out.
- **warm** — cafés, hospitality, cosy interiors, people at golden hour.
- **product** — clean, bright, crisp detail for listings and menus.
- **portrait** — people: softer contrast, more noise reduction, light sharpening
  so skin isn't harsh. Never reshape faces or bodies.

Batch a whole shoot with one preset so the set looks consistent, then adjust outliers.

## upscale.py — AI enlargement

```bash
python3 upscale.py IMG [--scale 2|3|4] [--out PATH]
```

Real-ESRGAN rebuilds real-looking detail (fabric, foliage, skin texture, edges).
Roughly 2-4 s per 200×200 px of input on 4 CPU cores, so a 1000 px photo at 4x
takes a minute or two; upscale only the finals. It can invent detail in very
small text and logos — check those areas and use `--fallback` (Lanczos + sharpen)
if text looks garbled.

## cutout.py — backgrounds

```bash
python3 cutout.py IMG [--bg transparent|white|#RRGGBB|background.jpg] [--shadow] [--model u2net|u2net_human_seg|isnet-general-use]
```

- Products: `--bg white --shadow` gives a clean listing shot.
- People: `--model u2net_human_seg` gives cleaner hair and arm edges.
- Check edges at 100 % zoom; fine hair and glass are the hard cases. Say so
  rather than hiding it.

## Honesty and consent

- Retouching fixes light, colour and clarity. Don't change what something is:
  no altering food portions, product features, property defects, or people's
  bodies and faces in marketing images, which can break advertising rules.
- Only edit photos the user has the right to use. Flag watermarks or stock
  images instead of removing watermarks.
