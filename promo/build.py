"""Build promo HTML pages: injects the real app screens from mockups/mockups.html."""
import re, pathlib
here = pathlib.Path(__file__).parent
mock = (here.parent / "mockups" / "mockups.html").read_text()
css = mock.split("<style>", 1)[1].split("</style>", 1)[0]
css = re.sub(r"^body\{.*?\}\n", "", css, flags=re.M)
css = re.sub(r"^\.shot\{.*?\}\n|^\.caption.*?\}\n", "", css, flags=re.M)
chunks = mock.split("<!-- ============ ")[1:]
phones = []
for c in chunks:
    p = c[c.index('<div class="phone">'): c.index('<div class="caption">')].rstrip()
    assert p.endswith("</div>")
    phones.append(p)
def tag(html, pid, show):
    return html.replace('<div class="phone">', f'<div class="phone" id="{pid}" data-show="{show}">', 1)
P = {
    "P1": tag(phones[0], "p1", "8-10"),
    "P2": tag(phones[1], "p2", "10-12"),
    "P3A": tag(phones[2].replace('class="opt sel"', 'class="opt"'), "p3a", "12-13.85"),
    "P3": tag(phones[2], "p3", "13.85-15"),
    "P4": tag(phones[3], "p4", "15-18"),
}
for name in ("v1", "v2"):
    src = here / f"{name}.tpl.html"
    if not src.exists():
        continue
    out = src.read_text().replace("{{MOCKCSS}}", css)
    for k, v in P.items():
        out = out.replace("{{" + k + "}}", v)
    (here / f"{name}.html").write_text(out)
    print("built", name)
