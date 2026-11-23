#!/usr/bin/env python3
"""Fix lighting and colour in photos: exposure, white balance, contrast, shadows,
noise, sharpness. Natural-looking by default; every step can be tuned or turned off.

usage: enhance.py IMAGE [IMAGE ...] [--out PATH_OR_FOLDER] [options]

  --preset natural|bright|punchy|warm|product|portrait   (default natural)
  --exposure F     brightness in stops, e.g. 0.3 brighter, -0.2 darker (added to auto)
  --warmth F       -1..1, cooler to warmer (added after auto white balance)
  --contrast F     local contrast strength 0..3
  --shadows F      lift shadows 0..1
  --highlights F   recover highlights 0..1
  --saturation F   1.0 = unchanged
  --denoise F      0 = off, 3-10 typical
  --sharpen F      0 = off, 0.5-1.5 typical
  --no-auto        skip auto exposure and auto white balance
  --compare        also save a side-by-side before/after JPEG
"""
import argparse
from pathlib import Path

import cv2
import numpy as np

from common import load_rgb, out_path, save

PRESETS = {
    "natural":  dict(contrast=1.2, shadows=0.25, highlights=0.25, saturation=1.06, denoise=3, sharpen=0.6, warmth=0.0, exposure=0.0),
    "bright":   dict(contrast=1.3, shadows=0.45, highlights=0.3, saturation=1.08, denoise=4, sharpen=0.6, warmth=0.05, exposure=0.25),
    "punchy":   dict(contrast=2.0, shadows=0.3, highlights=0.35, saturation=1.18, denoise=3, sharpen=0.9, warmth=0.0, exposure=0.0),
    "warm":     dict(contrast=1.2, shadows=0.3, highlights=0.25, saturation=1.08, denoise=3, sharpen=0.6, warmth=0.25, exposure=0.05),
    "product":  dict(contrast=1.4, shadows=0.35, highlights=0.4, saturation=1.05, denoise=4, sharpen=1.0, warmth=0.0, exposure=0.15),
    "portrait": dict(contrast=0.9, shadows=0.35, highlights=0.3, saturation=1.02, denoise=6, sharpen=0.35, warmth=0.08, exposure=0.1),
}


def auto_white_balance(img, strength=0.8):
    """Neutralise a colour cast using only pixels that are nearly grey/white.

    Plain grey-world would also "correct" scenes that are genuinely warm (food,
    sunsets, wood), so the cast is measured on low-chroma pixels only and the
    shift is capped. Too few neutral pixels -> leave the photo alone.
    """
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB).astype(np.float32)
    L, a, b = lab[:, :, 0], lab[:, :, 1] - 128, lab[:, :, 2] - 128
    chroma = np.hypot(a, b)
    mask = (L > 40) & (L < 250) & (chroma < np.percentile(chroma, 15) + 2) & (chroma < 25)
    if mask.sum() < max(500, img.shape[0] * img.shape[1] * 0.01):
        return img
    da, db = np.median(a[mask]), np.median(b[mask])
    if np.hypot(da, db) < 2:
        return img
    lab[:, :, 1] -= np.clip(da, -12, 12) * strength
    lab[:, :, 2] -= np.clip(db, -12, 12) * strength
    return cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)


def auto_exposure(L):
    """Stretch luminance between the 0.5th and 99.5th percentile, gently."""
    lo, hi = np.percentile(L, (0.5, 99.5))
    lo, hi = min(lo, 25), max(hi, 230)
    if hi - lo < 10:
        return L
    out = (L.astype(np.float32) - lo) * (255.0 / (hi - lo))
    # Pull mid-tones toward a mean of ~118 with a mild gamma.
    mean = np.clip(out, 0, 255).mean() / 255.0
    if 0.05 < mean < 0.95:
        gamma = np.clip(np.log(0.46) / np.log(mean), 0.7, 1.4)
        out = 255.0 * np.power(np.clip(out, 0, 255) / 255.0, gamma)
    return np.clip(out, 0, 255)


def tone(L, shadows, highlights):
    x = L / 255.0
    if shadows:
        x = x + shadows * 0.5 * x * (1 - x) ** 3 * 4
    if highlights:
        x = x - highlights * 0.5 * (x ** 3) * (1 - x) * 4
    return np.clip(x * 255.0, 0, 255)


def enhance(img, p, auto=True):
    if auto:
        img = auto_white_balance(img)
    lab = cv2.cvtColor(img, cv2.COLOR_RGB2LAB).astype(np.float32)
    L = lab[:, :, 0]
    if auto:
        L = auto_exposure(L)
    if p["exposure"]:
        L = np.clip(L * (2 ** p["exposure"]), 0, 255)
    L = tone(L, p["shadows"], p["highlights"])
    if p["contrast"] > 0:
        clahe = cv2.createCLAHE(clipLimit=p["contrast"], tileGridSize=(8, 8))
        Lc = clahe.apply(L.astype(np.uint8)).astype(np.float32)
        L = 0.5 * L + 0.5 * Lc
    # Brightening in LAB dilutes colour; give chroma back in proportion to the lift.
    lift = np.clip((L + 20) / (lab[:, :, 0] + 20), 1.0, 1.8) ** 0.7
    lab[:, :, 1:] = (lab[:, :, 1:] - 128) * lift[:, :, None] + 128
    lab[:, :, 0] = L
    # Warmth: shift the b (blue-yellow) channel a little, and a touch of a (green-magenta).
    if p["warmth"]:
        lab[:, :, 2] += p["warmth"] * 12
        lab[:, :, 1] += p["warmth"] * 3
    # Saturation in LAB keeps skin tones natural.
    if p["saturation"] != 1:
        lab[:, :, 1:] = (lab[:, :, 1:] - 128) * p["saturation"] + 128
    out = cv2.cvtColor(np.clip(lab, 0, 255).astype(np.uint8), cv2.COLOR_LAB2RGB)
    if p["denoise"] > 0:
        out = cv2.fastNlMeansDenoisingColored(out, None, p["denoise"], p["denoise"], 7, 21)
    if p["sharpen"] > 0:
        blur = cv2.GaussianBlur(out, (0, 0), 1.2)
        out = cv2.addWeighted(out, 1 + p["sharpen"], blur, -p["sharpen"], 0)
    return out


def side_by_side(a, b):
    h = 900
    sa = cv2.resize(a, (int(a.shape[1] * h / a.shape[0]), h), interpolation=cv2.INTER_AREA)
    sb = cv2.resize(b, (sa.shape[1], h), interpolation=cv2.INTER_AREA)
    gap = np.full((h, 12, 3), 255, np.uint8)
    return np.hstack([sa, gap, sb])


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("images", nargs="+")
    ap.add_argument("--out")
    ap.add_argument("--preset", default="natural", choices=PRESETS)
    for k in ("exposure", "warmth", "contrast", "shadows", "highlights", "saturation", "denoise", "sharpen"):
        ap.add_argument(f"--{k}", type=float)
    ap.add_argument("--no-auto", action="store_true")
    ap.add_argument("--compare", action="store_true")
    a = ap.parse_args()
    p = dict(PRESETS[a.preset])
    for k in ("exposure", "warmth"):
        v = getattr(a, k)
        if v is not None:
            p[k] += v
    for k in ("contrast", "shadows", "highlights", "saturation", "denoise", "sharpen"):
        v = getattr(a, k)
        if v is not None:
            p[k] = v
    for src in a.images:
        img, alpha, exif = load_rgb(src)
        res = enhance(img, p, auto=not a.no_auto)
        dest = out_path(src, None, "_edit")
        if a.out:
            o = Path(a.out)
            dest = o / dest.name if (o.is_dir() or len(a.images) > 1) else o
        save(res, dest, alpha, exif)
        print(f"{src}: saved {dest}")
        if a.compare:
            cmp = dest.with_name(dest.stem + "_before_after.jpg")
            save(side_by_side(img, res), cmp)
            print(f"  before/after: {cmp}")


if __name__ == "__main__":
    main()
