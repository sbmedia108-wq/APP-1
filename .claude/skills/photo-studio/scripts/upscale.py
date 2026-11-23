#!/usr/bin/env python3
"""AI upscale photos with Real-ESRGAN x4plus (runs on CPU through onnxruntime).

usage: upscale.py IMAGE [IMAGE ...] [--scale 2|3|4] [--out PATH] [--tile 192]
       [--fallback]   use high-quality Lanczos + sharpening instead of the AI model

The model works at 4x; --scale 2 or 3 runs it at 4x and resizes down, which still
recovers far more detail than plain resizing. Large photos are processed in tiles.
"""
import argparse
import sys
import time

import numpy as np
from PIL import Image, ImageFilter

from common import ESRGAN_ONNX, load_rgb, out_path, save


def esrgan(img, tile, pad=12):
    import onnxruntime as ort

    if not ESRGAN_ONNX.exists():
        sys.exit(f"Model missing at {ESRGAN_ONNX}. Run scripts/setup.sh first (or pass --fallback).")
    opts = ort.SessionOptions()
    sess = ort.InferenceSession(str(ESRGAN_ONNX), opts, providers=["CPUExecutionProvider"])
    h, w, _ = img.shape
    x = img.astype(np.float32).transpose(2, 0, 1)[None] / 255.0
    out = np.zeros((1, 3, h * 4, w * 4), np.float32)
    tiles = [(ty, tx) for ty in range(0, h, tile) for tx in range(0, w, tile)]
    t0 = time.time()
    for i, (ty, tx) in enumerate(tiles, 1):
        y0, x0 = max(ty - pad, 0), max(tx - pad, 0)
        y1, x1 = min(ty + tile + pad, h), min(tx + tile + pad, w)
        res = sess.run(None, {"input": x[:, :, y0:y1, x0:x1]})[0]
        ey, ex = min(ty + tile, h), min(tx + tile, w)
        out[:, :, ty * 4:ey * 4, tx * 4:ex * 4] = res[:, :, (ty - y0) * 4:(ey - y0) * 4, (tx - x0) * 4:(ex - x0) * 4]
        if len(tiles) > 1:
            print(f"  tile {i}/{len(tiles)} ({time.time() - t0:.0f}s)", file=sys.stderr, flush=True)
    return (np.clip(out[0].transpose(1, 2, 0), 0, 1) * 255.0 + 0.5).astype(np.uint8)


def lanczos(img, scale):
    im = Image.fromarray(img)
    im = im.resize((im.width * scale, im.height * scale), Image.LANCZOS)
    return np.array(im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2)))


def main():
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("images", nargs="+")
    ap.add_argument("--scale", type=int, default=4, choices=[2, 3, 4])
    ap.add_argument("--out", help="output file (single image) or folder")
    ap.add_argument("--tile", type=int, default=192)
    ap.add_argument("--fallback", action="store_true")
    a = ap.parse_args()
    for src in a.images:
        img, alpha, exif = load_rgb(src)
        h, w, _ = img.shape
        if a.fallback:
            big = lanczos(img, a.scale)
        else:
            big = esrgan(img, a.tile)
            if a.scale != 4:
                big = np.array(Image.fromarray(big).resize((w * a.scale, h * a.scale), Image.LANCZOS))
        dest = out_path(src, None, f"_x{a.scale}")
        if a.out:
            from pathlib import Path
            o = Path(a.out)
            dest = o / dest.name if (o.is_dir() or len(a.images) > 1) else o
        save(big, dest, alpha, exif)
        print(f"{src}: {w}x{h} -> {big.shape[1]}x{big.shape[0]}  saved {dest}")


if __name__ == "__main__":
    main()
