"""Christmas 2026 hero post.  Usage: python3 build_christmas.py && node render.js christmas.html"""
import math, pathlib, random
here = pathlib.Path(__file__).parent
random.seed(7)

W, FENCE = 1080, 990
# photo: spirit-level pose, waist hidden by the fence
PW, PH = 916, 1434
pw = 560; ph = pw * PH / PW; ptop = FENCE - .6 * ph; pleft = W - pw - 50
sc = pw / PW                                   # photo px -> canvas px
head_cx, head_w = pleft + 460 * sc, 225 * sc      # measured from me-level.png
brim_y = ptop + 84 * sc                           # just above the hairline
hw = head_w * 1.24 / .92; hh = hw * .85
hat_left = head_cx - hw / 2; hat_top = brim_y - hh * 130 / 170

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
def flake_spots():
    out = []
    for s_, o, b, n in ((5, .55, 0, 70), (9, .7, 1, 30), (16, .45, 3, 10)):
        while n:
            x, y = random.randint(0, W), random.randint(0, 980)
            if pleft - 30 < x < pleft + pw + 10 and y > ptop - 140:   # keep clear of the person and hat
                continue
            out.append(f'<div class="abs" style="left:{x}px;top:{y}px;width:{s_}px;height:{s_}px;border-radius:50%;background:#fff;opacity:{o};filter:blur({b}px);z-index:2"></div>')
            n -= 1
    return "".join(out)
flakes = flake_spots()
bokeh = "".join(f'<div class="abs" style="left:{x}px;top:{y}px;width:{r}px;height:{r}px;border-radius:50%;background:{c};opacity:.18;filter:blur(18px);z-index:1"></div>'
                for x, y, r, c in ((60, 380, 160, "#ffd84a"), (820, 300, 120, "#ff5a3c"), (380, 700, 180, "#ffd84a"), (960, 640, 140, "#3bd16f")))

# wreath on the fence
leaves = "".join(f'<ellipse cx="{60 + 46 * math.cos(a):.1f}" cy="{60 + 46 * math.sin(a):.1f}" rx="20" ry="11" transform="rotate({math.degrees(a) + 90:.0f} {60 + 46 * math.cos(a):.1f} {60 + 46 * math.sin(a):.1f})" fill="{["#1f6b33", "#2e8a45", "#185a2a"][i % 3]}"/>'
                 for i, a in enumerate(i * math.pi / 12 for i in range(24)))
berries = "".join(f'<circle cx="{60 + 44 * math.cos(a):.1f}" cy="{60 + 44 * math.sin(a):.1f}" r="5" fill="#d81f2a"/>' for a in (0.3, 1.4, 2.6, 3.5, 4.6, 5.6))
wreath = (f'<svg class="abs" viewBox="0 0 120 130" style="left:90px;top:{FENCE + 34}px;width:150px;z-index:6;filter:drop-shadow(0 6px 8px rgba(0,0,0,.45))">'
          f'{leaves}{berries}<path d="M60 96 l-20 22 l12 -2 l4 10 z M60 96 l20 22 l-12 -2 l-4 10 z" fill="#c0141f"/>'
          f'<path d="M60 96 c-20 -14 -30 4 -14 8 c6 1 10 -3 14 -8 c4 5 8 9 14 8 c16 -4 6 -22 -14 -8z" fill="#e0262f"/><circle cx="60" cy="97" r="5" fill="#9d0f18"/></svg>')

HAT = """<svg viewBox="0 0 200 170" style="width:100%;overflow:visible">
<defs>
 <radialGradient id="vel" cx="38%" cy="45%" r="70%"><stop offset="0" stop-color="#e8343c"/><stop offset=".55" stop-color="#b9141e"/><stop offset="1" stop-color="#6a0610"/></radialGradient>
 <linearGradient id="fur" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff8ee"/><stop offset=".55" stop-color="#efe3d0"/><stop offset="1" stop-color="#c7b496"/></linearGradient>
 <filter id="fluff" x="-20%" y="-30%" width="140%" height="160%"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" seed="3"/><feDisplacementMap in="SourceGraphic" scale="7"/></filter>
 <filter id="soft"><feGaussianBlur stdDeviation="3"/></filter>
</defs>
<path d="M22 126 C30 72 66 30 116 22 C146 18 170 30 180 54 C168 48 152 50 144 62 C152 84 162 106 180 128 Z" fill="url(#vel)"/>
<path d="M70 118 C76 86 96 58 128 44" stroke="#7d0912" stroke-width="7" fill="none" opacity=".45" filter="url(#soft)"/>
<path d="M120 120 C122 96 132 74 146 62" stroke="#7d0912" stroke-width="6" fill="none" opacity=".4" filter="url(#soft)"/>
<path d="M58 70 C78 46 104 34 130 32" stroke="#ff6a6a" stroke-width="5" fill="none" opacity=".35" filter="url(#soft)"/>
<path d="M8 110 Q100 132 192 110 Q198 128 190 142 Q100 166 10 142 Q2 128 8 110 Z" fill="url(#fur)" filter="url(#fluff)"/>
<path d="M14 138 Q100 160 186 138" stroke="#a8977c" stroke-width="5" fill="none" opacity=".55" filter="url(#soft)"/>
<circle cx="181" cy="56" r="16" fill="url(#fur)" filter="url(#fluff)"/>
<circle cx="186" cy="62" r="9" fill="#cfc8bd" opacity=".5" filter="url(#soft)"/>
</svg>"""

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>The Boundary Boys – Christmas</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&family=Mountains+of+Christmas:wght@700&family=Caveat:wght@600&display=swap" rel="stylesheet">
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
  <div class="abs" style="left:{head_cx - head_w * .62:.0f}px;top:{brim_y + 4:.0f}px;width:{head_w * 1.24:.0f}px;height:{head_w * .32:.0f}px;border-radius:50%;background:#2a0c06;opacity:.45;filter:blur(7px);z-index:5"></div>
  <div class="abs" style="left:{hat_left:.0f}px;top:{hat_top:.0f}px;width:{hw:.0f}px;transform:rotate(-5deg);transform-origin:50% 76%;z-index:5;filter:sepia(.12) drop-shadow(0 8px 10px rgba(0,0,0,.35))">{HAT}</div>
  <!-- gift tag: standing in the snow on the fence, tied on with twine -->
  <div class="abs" style="left:70px;top:{FENCE - 26}px;width:330px;height:40px;border-radius:50%;background:#000;opacity:.45;filter:blur(12px);z-index:5"></div>
  <div class="abs" style="left:74px;top:{FENCE + 6 - 500}px;width:330px;height:500px;z-index:5;transform:rotate(-4deg);transform-origin:50% 100%">
    <svg viewBox="0 0 330 500" width="330" height="500" style="position:absolute;inset:0;overflow:visible;filter:drop-shadow(0 10px 18px rgba(0,0,0,.45))">
      <defs>
        <linearGradient id="kraft" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#ead6ad"/><stop offset=".6" stop-color="#d9bd8a"/><stop offset="1" stop-color="#c4a26b"/></linearGradient>
        <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency=".85" numOctaves="3" seed="8"/><feColorMatrix values="0 0 0 0 .35  0 0 0 0 .25  0 0 0 0 .12  0 0 0 .22 0"/><feComposite in2="SourceGraphic" operator="in"/></filter>
        <radialGradient id="edge" cx="50%" cy="50%" r="75%"><stop offset=".7" stop-color="#000" stop-opacity="0"/><stop offset="1" stop-color="#5a3a12" stop-opacity=".35"/></radialGradient>
      </defs>
      <path d="M64 0 H266 L330 56 V500 H0 V56 Z" fill="url(#kraft)"/>
      <path d="M64 0 H266 L330 56 V500 H0 V56 Z" fill="#fff" filter="url(#grain)"/>
      <path d="M64 0 H266 L330 56 V500 H0 V56 Z" fill="url(#edge)"/>
      <path d="M165 44 C120 20 40 22 -6 48 C-22 140 -20 380 -26 540" stroke="#b08a52" stroke-width="4" fill="none" stroke-linecap="round"/>
      <path d="M165 44 C150 20 128 22 132 38 C136 52 156 50 165 44 C176 26 196 26 194 40 C192 54 172 52 165 44Z" fill="none" stroke="#b08a52" stroke-width="4"/>
      <circle cx="165" cy="44" r="17" fill="#b8925a"/><circle cx="165" cy="44" r="10" fill="#0c2219"/>
      <g transform="translate(250 70) rotate(18)">
        <path d="M0 0 C10 -18 34 -20 44 -6 C34 -10 30 0 36 8 C24 4 18 12 20 22 C10 14 2 10 0 0Z" fill="#1f6b33"/>
        <path d="M0 0 C-6 -20 4 -40 22 -44 C16 -34 22 -28 30 -28 C22 -18 26 -10 32 -6 C20 -4 8 -2 0 0Z" fill="#2e8a45"/>
        <circle cx="-2" cy="2" r="7" fill="#d81f2a"/><circle cx="9" cy="8" r="6" fill="#b8141e"/><circle cx="-8" cy="10" r="6" fill="#e0262f"/>
      </g>
    </svg>
    <div style="position:absolute;left:30px;right:30px;top:82px;color:#3a2410;text-align:left">
      <div style="font:600 32px/1.2 Caveat,cursive;white-space:nowrap"><span style="opacity:.7">To:</span> Southampton</div>
      <div style="font:600 32px/1.2 Caveat,cursive;white-space:nowrap"><span style="opacity:.7">From:</span> The Boundary Boys</div>
      <div style="border-top:3px dashed rgba(58,36,16,.35);margin:16px 0 14px"></div>
      <div style="font:700 21px Oswald;letter-spacing:5px;text-transform:uppercase;color:#9d0f18;text-align:center">Christmas deal</div>
      <div style="font:400 66px/.95 Anton;text-transform:uppercase;text-align:center;margin:8px 0 6px">Free removal</div>
      <div style="font:600 25px/1.2 Oswald;text-transform:uppercase;text-align:center">of your old fence</div>
      <div style="font:700 23px Oswald;letter-spacing:2px;text-transform:uppercase;color:#9d0f18;text-align:center;margin-top:12px">Book by 18 December</div>
    </div>
  </div>
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
