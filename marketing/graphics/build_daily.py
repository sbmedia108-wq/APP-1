"""One-off daily posts, reusing the helpers and styles from build_twenty.py.

Usage: python3 build_daily.py && node render.js daily.html
"""
import pathlib
from build_twenty import me, fence, foot, wm, CSS, RATIO
RATIO["bond"] = 809 / 1430
RATIO["jungle"] = 736 / 1030

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

P.append(("2026-11-16-the-names-post", "background:radial-gradient(60% 45% at 50% 62%,#5a4518 0%,#1a1406 55%,#050403 100%)", f"""
<div class="abs" style="inset:22px 22px 172px;border:2px solid #c9a24a;z-index:3;pointer-events:none"></div>
<div class="t" style="top:52px;font:600 26px Oswald;letter-spacing:14px;color:#c9a24a">THE BOUNDARY BOYS PRESENT</div>
<div class="t" style="top:92px;font:900 104px/1 'Playfair Display';color:#fff;letter-spacing:1px">THE NAME'S POST.</div>
<div class="t" style="top:204px;font:900 142px/1 'Playfair Display';color:#e2b85a;letter-spacing:2px;text-shadow:0 4px 30px rgba(226,184,90,.35)">FENCE POST.</div>
<div class="t" style="top:368px;font:600 38px Oswald;letter-spacing:16px;color:#fff">LICENSED TO DRILL</div>
<div class="abs" style="left:390px;width:300px;top:428px;height:2px;background:#c9a24a;z-index:5"></div>
<div class="t" style="top:446px;font:700 34px 'Playfair Display';font-style:italic;color:#e2b85a">Shaken by the wind? Not ours.</div>
{fence(0, 900, 1080, 300, z=2, extra="filter:brightness(.62) sepia(.25)")}
{me("bond", 250, 580, bottom=1200, z=4, show=.66)}
{wm("right:40px;top:1060px")}
<div class="foot" style="background:#050403;color:#e2b85a;border-top:4px solid #c9a24a"><b>The Boundary Boys · 07542 666563</b><i style="color:#fff">Fencing · Gates · Repairs · Southampton</i></div>"""))

STAR = '<svg viewBox="0 0 24 24" style="width:64px"><path d="M12 2l3 6.6 7.2.8-5.4 4.9 1.5 7.1L12 17.8 5.7 21.4l1.5-7.1L1.8 9.4 9 8.6z" fill="none" stroke="#e8c45a" stroke-width="1.6" stroke-linejoin="round"/></svg>'
P.append(("2026-11-17-bushtucker-trial", "background:#0b1f12", f"""
<div class="abs" style="inset:0 0 150px;background:url(assets/jungle-bg.jpg) center/cover;filter:blur(7px) brightness(.5) saturate(1.15);transform:scale(1.05)"></div>
<div class="abs" style="left:0;right:0;top:0;height:520px;background:linear-gradient(rgba(5,18,9,.92),rgba(5,18,9,0));z-index:1"></div>
<div class="t" style="top:46px"><span style="display:inline-block;background:#e8c45a;color:#0b1f12;font:700 30px/1 Oswald;letter-spacing:6px;padding:12px 26px 12px 32px">BUSHTUCKER TRIAL</span></div>
<div class="t" style="top:108px;font:400 96px/.95 Anton;color:#fff;text-transform:uppercase">Your fence won</div>
<div class="t" style="top:200px;font:400 126px/.95 Anton;text-transform:uppercase;background:linear-gradient(#fff3b0,#e8c45a 45%,#b98a2a);-webkit-background-clip:text;background-clip:text;color:transparent;filter:drop-shadow(0 4px 0 #4a3608)">0 stars.</div>
<div class="abs" style="left:28px;top:370px;width:220px;background:rgba(5,18,9,.88);border:3px solid #e8c45a;padding:18px 0 16px;text-align:center;z-index:6;transform:rotate(-3deg)">
  <div style="font:700 24px Oswald;letter-spacing:4px;color:#e8c45a">STARS WON</div>
  <div style="font:400 120px/1 Anton;color:#fff">0</div>
  <div style="display:flex;justify-content:center;gap:2px;transform:scale(.62);margin:-14px 0 -14px">{STAR*5}</div>
  <div style="font:600 22px/1.2 Oswald;color:#fff;letter-spacing:1px;margin-top:6px">TRIAL: STAYING UPRIGHT</div></div>
{fence(-50, 990, 330, 300, z=2, extra="transform:rotate(-14deg);transform-origin:right bottom;filter:grayscale(.5) sepia(.25) brightness(.7)", cap=False)}
<div class="me" style="left:250px;top:345px;width:620px;height:720px;z-index:4"><img src="assets/me-jungle.png" style="width:620px"></div>
{fence(240, 1065, 840, 135, z=5)}
{wm("right:30px;top:40px")}
<div class="foot" style="background:#0b1f12;color:#e8c45a;border-top:4px solid #e8c45a"><b>The Boundary Boys · 07542 666563</b><i style="color:#fff">Vote it out. We'll build one that stays up · Southampton</i></div>"""))

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>The Boundary Boys – daily posts</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,900;1,700&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
{"".join(f'<div class="p" id="{i}" style="{bg}">{body}</div>' for i, bg, body in P)}
<script>document.fonts.ready.then(()=>document.body.dataset.ready='1')</script>
</body></html>"""
(here / "daily.html").write_text(html)
print(len(P), "post(s)")
