"""Builds the Hampton CV logo set as SVG with text converted to outlines.

Run: python3 logo/make_logo.py   (needs fonttools and Inter Display installed)
"""
from pathlib import Path
from fontTools.ttLib import TTFont
from fontTools.pens.svgPathPen import SVGPathPen
from fontTools.pens.transformPen import TransformPen

OUT = Path(__file__).parent / "svg"
OUT.mkdir(exist_ok=True)

FOREST, AMBER, AMBER_DK, PAPER, INK = "#1f3a33", "#e6a23c", "#b97f25", "#f6f2ea", "#16241f"
FONTS = "/usr/share/fonts/opentype/inter/"


def text_path(text, font_file, size, x, y, tracking=0.0):
    """Return (svg path d, advance width) for text set at baseline (x, y)."""
    font = TTFont(FONTS + font_file)
    gs, cmap = font.getGlyphSet(), font.getBestCmap()
    upm = font["head"].unitsPerEm
    scale = size / upm
    # basic pair kerning from the legacy kern table if present
    kern = {}
    if "kern" in font:
        for t in font["kern"].kernTables:
            kern.update(t.kernTable)
    pen = SVGPathPen(gs)
    cx = 0.0
    prev = None
    for ch in text:
        g = cmap[ord(ch)]
        if prev and (prev, g) in kern:
            cx += kern[(prev, g)]
        tp = TransformPen(pen, (scale, 0, 0, -scale, x + cx * scale, y))
        gs[g].draw(tp)
        cx += gs[g].width + tracking * upm
        prev = g
    return pen.getCommands(), (cx - tracking * upm) * scale


def mark(x=0, y=0, s=1.0, page=AMBER, fold=AMBER_DK, letter=FOREST):
    """The mark: a page with a folded corner and an H. Designed on a 64x64 grid."""
    return f'''<g transform="translate({x} {y}) scale({s})">
    <path d="M14 3h27l16 16v38a4 4 0 0 1-4 4H14a4 4 0 0 1-4-4V7a4 4 0 0 1 4-4z" fill="{page}"/>
    <path d="M41 3v12a4 4 0 0 0 4 4h12z" fill="{fold}"/>
    <path d="M23 24v24M44 24v24M23 36h21" stroke="{letter}" stroke-width="6.5" stroke-linecap="round" fill="none"/>
  </g>'''


def svg(w, h, body, bg=None, title="Hampton CV logo"):
    rect = f'<rect width="{w}" height="{h}" fill="{bg}"/>' if bg else ""
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" '
            f'role="img" aria-label="Hampton CV"><title>{title}</title>{rect}{body}</svg>\n')


def horizontal(word, mark_kw, pad=0):
    d, wd = text_path("Hampton CV", "InterDisplay-ExtraBold.otf", 46, 0, 0, tracking=-0.02)
    w = 64 + 18 + wd + pad * 2
    h = 64 + pad * 2
    body = mark(pad, pad, **mark_kw) + f'<path transform="translate({pad + 82} {pad + 48})" d="{d}" fill="{word}"/>'
    return svg(round(w), h, body)


def stacked(word, tag, mark_kw, pad=0):
    d1, w1 = text_path("Hampton CV", "InterDisplay-ExtraBold.otf", 46, 0, 0, tracking=-0.02)
    d2, w2 = text_path("CV WRITING SERVICE", "Inter-SemiBold.otf", 13, 0, 0, tracking=0.22)
    w = max(w1, w2) + pad * 2
    cx = w / 2
    body = (mark(cx - 48, pad, s=1.5, **mark_kw)
            + f'<path transform="translate({cx - w1 / 2} {pad + 96 + 50})" d="{d1}" fill="{word}"/>'
            + f'<path transform="translate({cx - w2 / 2} {pad + 96 + 80})" d="{d2}" fill="{tag}"/>')
    return svg(round(w), round(pad * 2 + 96 + 84), body)


files = {
    "hampton-cv-logo.svg": horizontal(FOREST, {}),
    "hampton-cv-logo-reversed.svg": horizontal(PAPER, {}),
    "hampton-cv-logo-black.svg": horizontal("#000", dict(page="#000", fold="#555", letter="#fff")),
    "hampton-cv-logo-white.svg": horizontal("#fff", dict(page="#fff", fold="#bbb", letter="#000")),
    "hampton-cv-logo-stacked.svg": stacked(FOREST, AMBER_DK, {}),
    "hampton-cv-logo-stacked-reversed.svg": stacked(PAPER, AMBER, {}),
    "hampton-cv-mark.svg": svg(64, 64, mark()),
    # square avatar for social profiles and favicon
    "hampton-cv-avatar.svg": svg(512, 512, mark(82, 90, s=5.2), bg=FOREST),
}
for name, content in files.items():
    (OUT / name).write_text(content)
print("\n".join(files))
