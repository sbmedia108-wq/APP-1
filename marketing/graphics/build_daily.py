"""One-off daily posts, reusing the helpers and styles from build_twenty.py.

Usage: python3 build_daily.py && node render.js daily.html
"""
import pathlib
from build_twenty import me, fence, foot, wm, CSS

here = pathlib.Path(__file__).parent
stars = "".join(f'<path d="M{x} {y} l6 14 15 2 -11 10 3 15 -13 -8 -13 8 3 -15 -11 -10 15 -2 z" fill="{c}" stroke="#111" stroke-width="3"/>'
                for x, y, c in ((40, 20, "#fff"), (120, 0, "#ff3d7f"), (200, 30, "#fff")))
P = [("2026-11-14-big-night", "background:repeating-conic-gradient(from 0deg at 50% 38%,#FFD84A 0 10deg,#ffc21a 10deg 20deg)", f"""
<div class="t" style="top:44px"><span style="background:#fff;color:#111;font:700 32px/1 Oswald;letter-spacing:6px;padding:12px 26px 12px 32px;border:4px solid #111;border-radius:40px;display:inline-block">SATURDAY MORNING</span></div>
<div class="t" style="top:126px;font:400 200px/.92 Anton;color:#fff;-webkit-text-stroke:7px #111;paint-order:stroke fill;text-shadow:10px 10px 0 #ff3d7f">BIG NIGHT?</div>
<div class="t" style="top:340px;z-index:6"><div style="display:inline-block;background:#111;color:#fff;transform:rotate(-3deg);padding:22px 44px 20px;box-shadow:10px 10px 0 #ff3d7f;font:400 66px/1 Anton;text-transform:uppercase;letter-spacing:.5px">Your fence looks like<br><span style="color:#FFD84A">it had one too.</span></div></div>
<svg viewBox="0 0 260 80" style="position:absolute;left:40px;top:690px;width:300px;z-index:6;transform:rotate(-8deg)">{stars}</svg>
{fence(-60, 860, 330, 400, z=2, extra="transform:rotate(-16deg);transform-origin:right bottom", cap=False)}
{fence(250, 830, 240, 420, z=2, extra="transform:rotate(11deg);transform-origin:left bottom", cap=False)}
{me("nailgun", 520, 540, bottom=1020, z=4)}
{fence(470, 1020, 610, 180, z=5)}
<div class="abs" style="left:560px;top:1060px;background:#fff;color:#111;border:4px solid #111;font:700 30px Oswald;padding:6px 18px;transform:rotate(3deg);z-index:6;letter-spacing:2px">STONE COLD SOBER</div>
{wm("right:24px;top:24px", dark=True)}
{foot("fk", "Hangover cure: a new fence · Southampton")}""")]

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>The Boundary Boys – daily posts</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
{"".join(f'<div class="p" id="{i}" style="{bg}">{body}</div>' for i, bg, body in P)}
<script>document.fonts.ready.then(()=>document.body.dataset.ready='1')</script>
</body></html>"""
(here / "daily.html").write_text(html)
print(len(P), "post(s)")
