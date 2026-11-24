#!/usr/bin/env python3
"""Remove or replace a photo's background (rembg / U2-Net, runs on CPU).

usage: cutout.py IMAGE [IMAGE ...] [--bg transparent|white|#RRGGBB|path/to/background.jpg]
                 [--model u2net|isnet-general-use|u2net_human_seg] [--out PATH_OR_FOLDER]
                 [--shadow]   add a soft drop shadow under the subject (product shots)

Transparent results are saved as PNG.
"""
import argparse
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageFilter

from common import U2NET_DIR, load_rgb, save

os.environ.setdefault("U2NET_HOME", str(U2NET_DIR))


def parse_bg(spec, size):
    if spec == "transparent":
        return None
    if spec == "white":
        spec = "#ffffff"
    if spec.startswith("#") and len(spec) == 7:
        rgb = tuple(int(spec[i:i + 2], 16) for i in (1, 3, 5))
        return Image.new("RGB", size, rgb)
    bg = Image.open(spec).convert("RGB")
    # Cover-fit the background image.
    s = max(size[0] / bg.width, size[1] / bg.height)
    bg = bg.resize((round(bg.width * s), round(bg.height * s)), Image.LANCZOS)
    l, t = (bg.width - size[0]) // 2, (bg.height - size[1]) // 2
    return bg.crop((l, t, l + size[0], t + size[1]))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("images", nargs="+")
    ap.add_argument("--bg", default="transparent")
    ap.add_argument("--model", default="u2net")
    ap.add_argument("--shadow", action="store_true")
    ap.add_argument("--out")
    a = ap.parse_args()
    from rembg import new_session, remove

    session = new_session(a.model)
    for src in a.images:
        img, _, exif = load_rgb(src)
        cut = remove(Image.fromarray(img), session=session, post_process_mask=True)
        alpha = cut.getchannel("A")
        bg = parse_bg(a.bg, cut.size)
        p = Path(src)
        if bg is None:
            dest = p.with_name(p.stem + "_cutout.png")
            result, out_alpha = np.array(cut.convert("RGB")), np.array(alpha)
        else:
            if a.shadow:
                sh = Image.new("L", cut.size, 0)
                sh.paste(alpha.point(lambda v: int(v * 0.45)), (0, int(cut.height * 0.015)))
                sh = sh.filter(ImageFilter.GaussianBlur(cut.width / 60))
                bg = Image.composite(Image.new("RGB", cut.size, (0, 0, 0)), bg, sh)
            bg.paste(cut.convert("RGB"), (0, 0), alpha)
            dest = p.with_name(p.stem + "_newbg.jpg")
            result, out_alpha = np.array(bg), None
        if a.out:
            o = Path(a.out)
            dest = o / dest.name if (o.is_dir() or len(a.images) > 1) else o
        save(result, dest, out_alpha, exif if out_alpha is None else None)
        print(f"{src}: saved {dest}")


if __name__ == "__main__":
    main()
