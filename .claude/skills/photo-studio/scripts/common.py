"""Shared helpers: where models live, and loading/saving photos safely."""
import os
from pathlib import Path

import numpy as np
from PIL import Image, ImageOps

CACHE = Path(os.environ.get("PHOTO_STUDIO_HOME", Path.home() / ".cache" / "photo-studio"))
ESRGAN_ONNX = CACHE / "realesrgan_x4plus.onnx"
U2NET_DIR = CACHE / "u2net"


def load_rgb(path):
    """Load a photo upright (honours EXIF rotation). Returns (RGB uint8 array, alpha or None, exif bytes)."""
    im = Image.open(path)
    exif = im.info.get("exif")
    im = ImageOps.exif_transpose(im)
    alpha = None
    if im.mode in ("RGBA", "LA") or (im.mode == "P" and "transparency" in im.info):
        im = im.convert("RGBA")
        alpha = np.array(im)[:, :, 3]
    return np.array(im.convert("RGB")), alpha, exif


def save(arr, path, alpha=None, exif=None, quality=95):
    path = Path(path)
    path.parent.mkdir(parents=True, exist_ok=True)
    im = Image.fromarray(arr)
    if alpha is not None:
        im = im.convert("RGBA")
        im.putalpha(Image.fromarray(alpha).resize(im.size, Image.LANCZOS))
    ext = path.suffix.lower()
    kw = {}
    if ext in (".jpg", ".jpeg"):
        if im.mode == "RGBA":
            im = im.convert("RGB")
        kw = dict(quality=quality, subsampling=0, optimize=True)
    elif ext == ".webp":
        kw = dict(quality=quality, method=6)
    if exif and ext in (".jpg", ".jpeg", ".webp"):
        # Orientation is already applied to the pixels, so reset that tag.
        e = Image.Exif()
        e.load(exif)
        e[0x0112] = 1
        kw["exif"] = e.tobytes()
    im.save(path, **kw)
    return path


def out_path(src, out, suffix):
    if out:
        return Path(out)
    p = Path(src)
    return p.with_name(f"{p.stem}{suffix}{p.suffix if p.suffix.lower() != '.png' else '.png'}")
