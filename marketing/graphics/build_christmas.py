"""Christmas 2026 hero post.  Usage: python3 build_christmas.py && node render.js christmas.html"""
import math, pathlib, random
here = pathlib.Path(__file__).parent
random.seed(7)

W, FENCE = 1080, 990
# photo: spirit-level pose, waist hidden by the fence
PW, PH = 916, 1434
pw = 560; ph = pw * PH / PW; ptop = FENCE - .6 * ph; pleft = W - pw - 50
hw = pw * .36; hat_left = pleft + pw * .49 - hw * .52; hat_top = ptop + ph * .044 - .8 * hw * 100 / 120

# fairy lights: sagging wire between hooks along the rail
hooks = list(range(-40, W + 200, 180))
wire, bulbs = [], []
cols = ["#ff3b3b", "#ffd84a", "#3bd16f", "#4aa8ff", "#ff8a1c"]
k = 0
for a, b in zip(hooks, hooks[1:]):
    y0, sag = FENCE + 14, 26
    cx, cy = (a + b) / 2, y0 + sag * 2
    wire.append(f"M{a} {y0} Q{cx} {cy} {b} {y0}")
    for t in (0.18, 0.5, 0.82):
        x = (1 - t) ** 2 * a + 2 * (1 - t) * t * cx + t ** 2 * b
        y = (1 - t) ** 2 * y0 + 2 * (1 - t) * t * cy + t ** 2 * y0
        bulbs.append((x, y, cols[k % len(cols)])); k += 1
lights = (f'<svg class="abs" viewBox="0 0 {W} 1350" style="left:0;top:0;width:{W}px;height:1350px;z-index:7;overflow:visible">'
          f'<defs><filter id="glow" x="-200%" y="-200%" width="500%" height="500%"><feGaussianBlur stdDeviation="9"/></filter></defs>'
          f'<path d="{" ".join(wire)}" stroke="#1d2a1d" stroke-width="3" fill="none"/>'
          + "".join(f'<circle cx="{x:.0f}" cy="{y + 14:.0f}" r="16" fill="{c}" opacity=".75" filter="url(#glow)"/>'
                    f'<rect x="{x - 4:.0f}" y="{y - 2:.0f}" width="8" height="8" fill="#2a2a2a"/>'
                    f'<ellipse cx="{x:.0f}" cy="{y + 14:.0f}" rx="7" ry="11" fill="{c}"/>'
                    f'<ellipse cx="{x - 2:.0f}" cy="{y + 10:.0f}" rx="2.5" ry="4" fill="#fff" opacity=".7"/>' for x, y, c in bulbs)
          + '</svg>')

# snow resting on the top rail
pts = [(x, FENCE - 22 - 7 * math.sin(x / 47) - 5 * math.sin(x / 19)) for x in range(0, W + 21, 20)]
snowcap = (f'<svg class="abs" viewBox="0 0 {W} 52" preserveAspectRatio="none" style="left:0;top:{FENCE - 40}px;width:{W}px;height:52px;z-index:6">'
           f'<path d="M0 52 L{" L".join(f"{x} {y - FENCE + 40:.0f}" for x, y in pts)} L{W} 52 Z" fill="#f4f8ff"/>'
           f'<path d="M0 52 L{" L".join(f"{x} {y - FENCE + 48:.0f}" for x, y in pts)} L{W} 52 Z" fill="#cfdcee" opacity=".7"/></svg>')

# falling snow, three depths
flakes = "".join(f'<div class="abs" style="left:{random.randint(0, W)}px;top:{random.randint(0, 980)}px;width:{s}px;height:{s}px;border-radius:50%;background:#fff;opacity:{o};filter:blur({b}px);z-index:{z}"></div>'
                 for s, o, b, z, n in ((5, .55, 0, 2, 70), (9, .7, 1, 2, 30), (16, .45, 3, 8, 10)) for _ in range(n))
bokeh = "".join(f'<div class="abs" style="left:{x}px;top:{y}px;width:{r}px;height:{r}px;border-radius:50%;background:{c};opacity:.18;filter:blur(18px);z-index:1"></div>'
                for x, y, r, c in ((60, 380, 160, "#ffd84a"), (820, 300, 120, "#ff5a3c"), (380, 700, 180, "#ffd84a"), (960, 640, 140, "#3bd16f")))

# wreath on the fence
leaves = "".join(f'<ellipse cx="{60 + 46 * math.cos(a):.1f}" cy="{60 + 46 * math.sin(a):.1f}" rx="20" ry="11" transform="rotate({math.degrees(a) + 90:.0f} {60 + 46 * math.cos(a):.1f} {60 + 46 * math.sin(a):.1f})" fill="{["#1f6b33", "#2e8a45", "#185a2a"][i % 3]}"/>'
                 for i, a in enumerate(i * math.pi / 12 for i in range(24)))
berries = "".join(f'<circle cx="{60 + 44 * math.cos(a):.1f}" cy="{60 + 44 * math.sin(a):.1f}" r="5" fill="#d81f2a"/>' for a in (0.3, 1.4, 2.6, 3.5, 4.6, 5.6))
wreath = (f'<svg class="abs" viewBox="0 0 120 130" style="left:90px;top:{FENCE + 34}px;width:150px;z-index:6;filter:drop-shadow(0 6px 8px rgba(0,0,0,.45))">'
          f'{leaves}{berries}<path d="M60 96 l-20 22 l12 -2 l4 10 z M60 96 l20 22 l-12 -2 l-4 10 z" fill="#c0141f"/>'
          f'<path d="M60 96 c-20 -14 -30 4 -14 8 c6 1 10 -3 14 -8 c4 5 8 9 14 8 c16 -4 6 -22 -14 -8z" fill="#e0262f"/><circle cx="60" cy="97" r="5" fill="#9d0f18"/></svg>')

HAT = '<svg viewBox="0 0 120 100" style="width:100%"><path d="M12 78 C20 30 60 6 96 30 C80 34 96 60 104 78 Z" fill="#d81f2a"/><path d="M40 40 C56 26 76 24 92 32" stroke="#a3121c" stroke-width="5" fill="none" opacity=".6"/><rect x="4" y="72" width="108" height="22" rx="11" fill="#fff"/><circle cx="100" cy="30" r="13" fill="#fff"/></svg>'

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>The Boundary Boys – Christmas</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&family=Mountains+of+Christmas:wght@700&display=swap" rel="stylesheet">
<style>
*{{box-sizing:border-box;margin:0;padding:0}}
body{{background:#333;padding:40px}}
.p{{position:relative;width:{W}px;height:1350px;overflow:hidden;background:radial-gradient(85% 60% at 50% 38%,#1d4a3a 0%,#0c2219 55%,#04100b 100%)}}
.abs{{position:absolute}}
</style></head><body>
<div class="p" id="2026-12-04-deck-the-halls">
  {bokeh}{flakes}
  <div class="abs" style="left:60px;top:54px;font:700 54px/1 'Mountains of Christmas',cursive;color:#ffd84a;z-index:5;text-shadow:0 3px 0 #04100b">Merry Christmas from the Boundary Boys</div>
  <div class="abs hd" style="left:60px;right:60px;top:132px;z-index:5;font:400 130px/.94 Anton;text-transform:uppercase;white-space:nowrap">
    <div style="color:#fff;text-shadow:0 6px 24px rgba(0,0,0,.5)">Deck the halls.</div>
    <div style="color:#ff4d4d;text-shadow:0 6px 24px rgba(0,0,0,.5);margin-top:10px">We'll do the fence.</div></div>
  <div class="abs" style="left:{pleft:.0f}px;top:{ptop:.0f}px;width:{pw}px;height:{FENCE - ptop:.0f}px;overflow:hidden;z-index:4">
    <img src="assets/me-level.png" style="position:absolute;left:0;top:0;width:{pw}px;filter:drop-shadow(0 0 40px rgba(255,216,74,.25)) drop-shadow(0 12px 24px rgba(0,0,0,.5))"></div>
  <div class="abs" style="left:{hat_left:.0f}px;top:{hat_top:.0f}px;width:{hw:.0f}px;transform:rotate(-10deg);transform-origin:50% 85%;z-index:5">{HAT}</div>
  <!-- gift tag with the deal -->
  <div class="abs" style="left:66px;top:540px;z-index:6;transform:rotate(-7deg);transform-origin:50% 0">
    <svg viewBox="0 0 90 50" style="position:absolute;left:115px;top:-14px;width:90px;z-index:2"><path d="M45 26 C20 0 0 14 14 26 C24 34 38 30 45 26 C52 30 66 34 76 26 C90 14 70 0 45 26Z" fill="#c0141f"/><path d="M45 26 l-16 24 l10 -3 l4 8z M45 26 l16 24 l-10 -3 l-4 8z" fill="#9d0f18"/><circle cx="45" cy="26" r="7" fill="#e0262f"/></svg>
    <div style="position:relative;width:320px;padding:56px 26px 30px;background:linear-gradient(160deg,#e9d3a8,#cfb07a);clip-path:polygon(18% 0,82% 0,100% 12%,100% 100%,0 100%,0 12%);text-align:center;color:#3a2410;box-shadow:0 14px 30px rgba(0,0,0,.5)">
      <div style="position:absolute;left:146px;top:18px;width:28px;height:28px;border-radius:50%;background:#0c2219;box-shadow:inset 0 0 0 5px #b8925a"></div>
      <div style="font:700 22px Oswald;letter-spacing:6px;text-transform:uppercase;color:#9d0f18">Christmas deal</div>
      <div style="font:400 64px/1 Anton;text-transform:uppercase;margin:12px 0 6px">Free removal</div>
      <div style="font:600 26px/1.2 Oswald;text-transform:uppercase">of your old fence</div>
      <div style="height:2px;background:#3a2410;opacity:.3;margin:16px 30px"></div>
      <div style="font:700 24px Oswald;letter-spacing:2px;text-transform:uppercase;color:#9d0f18">Book by 18 December</div>
    </div></div>
  <div class="abs" style="left:0;top:{FENCE - 14}px;width:{W}px;height:22px;background:linear-gradient(#e8c48c,#b98a4e);z-index:5"></div>
  <div class="abs" style="left:0;top:{FENCE}px;width:{W}px;height:210px;background:url(assets/real-fence.jpg) left top/1152px 752px repeat;filter:brightness(.82) saturate(1.05);z-index:5"></div>
  {snowcap}{wreath}{lights}
  <img class="abs" src="assets/sb-media.png" style="right:34px;top:1120px;width:104px;opacity:.85;z-index:9">
  <div class="abs" style="left:0;right:0;bottom:0;height:150px;background:linear-gradient(#8a121c,#5e0a12);z-index:8;display:flex;flex-direction:column;justify-content:center;text-align:center;border-top:4px solid #ffd84a">
    <div style="font:400 66px/1.05 Anton;color:#ffd84a;text-transform:uppercase;letter-spacing:1px">The Boundary Boys · 07542 666563</div>
    <div style="font:700 24px Oswald;color:#fff;letter-spacing:5px;text-transform:uppercase;margin-top:4px">Fencing · Gates · Repairs · Southampton</div></div>
</div>
<script>
document.fonts.ready.then(()=>{{
  const hd=document.querySelector('.hd'), max={hat_top - 24:.0f};
  let s=130; while((hd.scrollWidth>hd.clientWidth+1||hd.offsetTop+hd.offsetHeight>max)&&s>60){{s-=2;hd.style.fontSize=s+'px'}}
  document.body.dataset.ready='1';
}});
</script>
</body></html>"""
(here / "christmas.html").write_text(html)
print("photo top", round(ptop), "hat top", round(hat_top))
