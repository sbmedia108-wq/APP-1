"""Builds twenty.html: 20 one-off posters, each with a real fence and the owner shown waist up.

Usage: python3 build_twenty.py && node render.js twenty.html
"""
import pathlib

here = pathlib.Path(__file__).parent
RATIO = {"level": 916 / 1434, "nailgun": 941 / 1437}
SUB = "Fencing · Gates · Repairs · Southampton"


def me(pose, left, w, bottom=1200, z=4, show=0.64, top=None, extra=""):
    """Photo cropped above the belt; `bottom` is where something else covers the waist."""
    full = w / RATIO[pose]
    t = bottom - full * show if top is None else top
    return (f'<div class="me" style="left:{left}px;top:{t:.0f}px;width:{w}px;height:{full * .66:.0f}px;z-index:{z};{extra}">'
            f'<img src="assets/me-{pose}.png" style="width:{w}px"></div>')


def fence(left, top, w, h, z=2, extra="", cap=True):
    rail = (f'<div class="cap" style="left:{left}px;top:{top - 14}px;width:{w}px;z-index:{z}"></div>' if cap else "")
    return rail + f'<div class="fz" style="left:{left}px;top:{top}px;width:{w}px;height:{h}px;z-index:{z};{extra}"></div>'


def foot(cls, sub=SUB):
    return f'<div class="foot {cls}"><b>The Boundary Boys · 07542 666563</b><i>{sub}</i></div>'


def wm(style, dark=False):
    return f'<img class="wm" src="assets/sb-media.png" style="{style}{";filter:invert(1)" if dark else ""}">'


P = []

# 01 Monday: straighten up
P.append(("01-straighten-up", "background:#FFD84A;color:#0b0b0b", f"""
<div class="t" style="top:56px;font:700 32px Oswald;letter-spacing:8px">MONDAY MORNING</div>
<div class="t" style="top:100px;font:400 168px/1 Anton;white-space:nowrap">STRAIGHTEN UP.</div>
<div class="t" style="top:290px;font:500 46px Oswald;text-transform:uppercase">The fence. Not your posture.</div>
{me("level", 170, 760, bottom=1210)}
{fence(0, 900, 1080, 300, z=5)}
{wm("right:30px;top:30px", dark=True)}
{foot("fk")}"""))

# 02 Selling up
P.append(("02-selling-up", "background:linear-gradient(#7fb8f0,#d8ecff 60%)", f"""
<div class="t" style="top:50px;font:400 190px/1 Anton;color:#0d2a52">SELLING UP?</div>
<div class="t" style="top:250px;font:400 90px/1 Anton;color:#d81f2a">Nobody's buying<br>that fence.</div>
{fence(-40, 760, 1160, 460, z=2, extra="transform:rotate(-4deg);transform-origin:left bottom;filter:saturate(.6) brightness(.9)", cap=False)}
<div class="abs" style="left:190px;top:600px;width:26px;height:600px;background:#6b4a2b;z-index:5"></div>
<div class="abs" style="left:40px;top:560px;width:360px;height:250px;background:#fff;border:8px solid #0d2a52;border-top:60px solid #d81f2a;z-index:6;transform:rotate(-3deg);text-align:center;color:#0d2a52">
  <div style="position:absolute;left:0;right:0;top:-54px;font:700 32px Oswald;color:#fff;letter-spacing:4px">ESTATE AGENT</div>
  <div style="font:400 96px/1.1 Anton;color:#d81f2a;margin-top:6px">FOR SALE</div>
  <div style="font:600 26px/1.2 Oswald;text-transform:uppercase">Fence not included.<br>It fell over.</div></div>
{me("nailgun", 470, 600, z=4)}
{wm("right:30px;top:30px", dark=True)}
{foot("fy", "Get it sorted before the photos · Southampton")}"""))

# 03 Before / after
P.append(("03-before-after", "background:#1b1b1b", f"""
<div class="abs" style="left:0;top:0;width:540px;height:1200px;background:linear-gradient(#3a3a3a,#141414);overflow:hidden">
  {fence(-120, 760, 700, 520, z=2, extra="transform:rotate(-14deg);transform-origin:right bottom;filter:grayscale(.85) brightness(.75)", cap=False)}
  <svg viewBox="0 0 120 170" style="position:absolute;left:300px;top:930px;width:170px;z-index:3"><rect x="8" y="20" width="104" height="136" rx="8" fill="#2f6b3a"/><rect x="0" y="6" width="120" height="22" rx="6" fill="#245530"/><circle cx="26" cy="160" r="10" fill="#111"/><circle cx="94" cy="160" r="10" fill="#111"/></svg>
</div>
<div class="abs" style="left:540px;top:0;width:540px;height:1200px;background:radial-gradient(#3b3b3b,#151515);overflow:hidden">
  {fence(0, 760, 540, 440, z=2)}
  <div style="position:absolute;left:30px;top:0">{me("level", 0, 500, bottom=1200, z=4)}</div>
</div>
<div class="abs" style="left:536px;top:0;width:8px;height:1200px;background:#FFD84A;z-index:8"></div>
<div class="tag" style="left:40px;top:50px;background:#fff;color:#111">BEFORE</div>
<div class="tag" style="left:580px;top:50px;background:#FFD84A;color:#111">AFTER</div>
<div class="abs" style="left:40px;top:150px;width:470px;font:400 76px/1.05 Anton;text-transform:uppercase;z-index:8">Held up by the wheelie bin.</div>
<div class="abs" style="left:580px;top:150px;width:470px;font:400 76px/1.05 Anton;text-transform:uppercase;color:#FFD84A;z-index:8">Held up by concrete.</div>
{wm("left:24px;top:1080px")}
{foot("fk")}"""))

# 04 Text messages
P.append(("04-the-text", "background:#111", f"""
{fence(0, 0, 1080, 1200, z=1, cap=False, extra="filter:brightness(.55)")}
<div class="t" style="top:40px;font:400 104px/1 Anton;color:#fff;text-shadow:0 6px 20px rgba(0,0,0,.6);z-index:6">WE'VE ALL HAD THIS TEXT.</div>
{me("nailgun", 560, 560, z=4)}
<div class="abs" style="left:50px;top:190px;width:600px;height:930px;background:#fff;border-radius:46px;box-shadow:0 24px 60px rgba(0,0,0,.6);z-index:6;overflow:hidden;font-family:Inter,sans-serif">
  <div style="height:110px;background:#f2f2f6;border-bottom:2px solid #ddd;text-align:center;padding-top:22px"><div style="width:52px;height:52px;border-radius:50%;background:#b8bcc8;margin:0 auto"></div><div style="font:600 24px Inter;color:#111;margin-top:4px">Next Door</div></div>
  <div style="padding:26px 26px 0;display:flex;flex-direction:column;gap:18px;font:500 31px/1.25 Inter">
    <div class="bub l">Is that your fence panel in my garden?</div>
    <div class="bub r">It was.</div>
    <div class="bub l">Do you want it back?</div>
    <div class="bub r">No. I've rung the Boundary Boys.</div>
    <div class="bub l">Can I have their number? Mine's not great either.</div>
    <div class="bub r">07542 666563</div>
  </div></div>
{wm("right:30px;top:160px")}
{foot("fy")}"""))

# 05 Road sign
P.append(("05-caution", "background:linear-gradient(#56636f,#22292f)", f"""
<svg viewBox="0 0 200 178" style="position:absolute;left:330px;top:36px;width:420px;z-index:5">
  <path d="M100 6 L194 170 H6 Z" fill="#fff" stroke="#d81f2a" stroke-width="14" stroke-linejoin="round"/>
  <g transform="translate(58 70) rotate(-22 40 80)" fill="#111"><rect x="0" y="20" width="16" height="70"/><rect x="22" y="12" width="16" height="78"/><rect x="44" y="18" width="16" height="72"/><rect x="66" y="10" width="16" height="80"/><rect x="-4" y="40" width="90" height="8"/><rect x="-4" y="68" width="90" height="8"/></g>
  <rect x="40" y="150" width="120" height="8" fill="#111"/></svg>
<div class="abs" style="left:150px;width:780px;top:420px;background:#fff;color:#111;border:6px solid #111;border-radius:10px;text-align:center;font:400 58px/1.05 Anton;padding:14px 0;z-index:5">FENCE MAY FALL ON NEIGHBOURS</div>
<div class="t" style="top:540px;font:400 72px/1 Anton;color:#FFD84A;z-index:5">UNLESS YOU RING US FIRST.</div>
{fence(0, 860, 1080, 340, z=2)}
{me("level", 290, 520, z=4)}
{wm("right:30px;top:30px")}
{foot("fk haz")}"""))

# 06 Fence facts (nutrition label)
P.append(("06-fence-facts", "background:#111", f"""
{fence(0, 0, 1080, 1200, z=1, cap=False, extra="filter:brightness(.8)")}
{me("nailgun", 520, 600, z=4)}
<div class="abs" style="left:50px;top:60px;width:560px;background:#fff;color:#111;border:6px solid #111;padding:18px 26px 22px;z-index:6;font-family:Arial,Helvetica,sans-serif;box-shadow:0 20px 50px rgba(0,0,0,.5)">
  <div style="font:900 78px/1 'Archivo Black'">Fence Facts</div>
  <div class="rl"></div>
  <div class="row"><span>Serving size</span><b>1 garden</b></div>
  <div class="row"><span>Servings</span><b>Years of them</b></div>
  <div class="rl" style="height:16px"></div>
  <div style="font:700 26px Arial;margin:6px 0">Amount per fence</div>
  <div class="row"><b>Posts concreted in</b><b>100%</b></div>
  <div class="row"><b>Privacy</b><b>100%</b></div>
  <div class="row"><b>Wobble</b><b>0g</b></div>
  <div class="row"><b>Nosy neighbours</b><b>0g</b></div>
  <div class="row"><b>Brews required</b><b>3</b></div>
  <div class="rl"></div>
  <div style="font:400 26px/1.3 Arial;margin-top:12px">Contains: timber, concrete and two lads from Southampton. May cause jealousy next door.</div>
</div>
{wm("right:30px;top:30px")}
{foot("fk")}"""))

# 07 Mugshot
lines = "".join(f'<div class="abs" style="left:0;right:0;top:{y}px;height:4px;background:rgba(255,255,255,.75);z-index:2"></div>'
                f'<div class="abs" style="left:18px;top:{y - 44}px;font:700 36px Oswald;color:#fff;z-index:2">{ft}FT</div>'
                f'<div class="abs" style="right:18px;top:{y - 44}px;font:700 36px Oswald;color:#fff;z-index:2">{ft}FT</div>'
                for y, ft in ((460, 7), (640, 6), (820, 5), (1000, 4)))
P.append(("07-guilty", "background:#111", f"""
{fence(0, 0, 1080, 1200, z=1, cap=False, extra="filter:brightness(.7) saturate(.8)")}
{lines}
<div class="t" style="top:40px;font:400 124px/1 Anton;white-space:nowrap;color:#fff;text-shadow:0 6px 20px rgba(0,0,0,.6);z-index:6">GUILTY AS CHARGED.</div>
<div class="t" style="top:180px;font:400 64px/1 Anton;color:#FFD84A;text-shadow:0 4px 14px rgba(0,0,0,.6);z-index:6">OF MAKING NEXT DOOR JEALOUS.</div>
{me("level", 220, 640, z=4)}
<div class="abs" style="left:290px;top:1010px;width:500px;height:160px;background:#0b0b0b;border:5px solid #fff;color:#fff;text-align:center;z-index:6;padding-top:16px">
  <div style="font:400 50px/1 Anton">BOUNDARY BOYS</div>
  <div style="font:700 25px/1.35 'Courier Prime',monospace;margin-top:8px">CHARGE: STRAIGHTENING FENCES<br>SOUTHAMPTON · REPEAT OFFENDER</div></div>
{wm("right:24px;top:1060px")}
{foot("fy")}"""))

# 08 Quiz
P.append(("08-quiz", "background:radial-gradient(80% 60% at 50% 30%,#1a2f8a,#050a24 75%)", f"""
<div class="abs" style="left:40px;right:40px;top:60px;height:160px;background:#0a1240;border:5px solid #c9a94a;clip-path:polygon(4% 0,96% 0,100% 50%,96% 100%,4% 100%,0 50%);display:flex;align-items:center;justify-content:center;font:600 60px Oswald;color:#fff;z-index:5">What's holding your fence up?</div>
<div class="ans" style="left:40px;top:250px;background:#1f9d4a;color:#fff"><b>A:</b> Concrete</div>
<div class="ans" style="left:550px;top:250px"><b>B:</b> Hope</div>
<div class="ans" style="left:40px;top:370px"><b>C:</b> Next door's shed</div>
<div class="ans" style="left:550px;top:370px"><b>D:</b> The wheelie bin</div>
<div class="t" style="top:500px;font:400 56px/1 Anton;color:#FFD84A;z-index:5">DIDN'T SAY A? PHONE A FRIEND.</div>
{fence(0, 860, 1080, 340, z=2)}
{me("nailgun", 260, 560, z=4)}
{wm("right:30px;top:1080px")}
{foot("fy", "Phone a friend · Fencing · Gates · Repairs")}"""))

# 09 Fight night
P.append(("09-fight-night", "background:radial-gradient(90% 60% at 50% 25%,#7a0d14,#0b0b0b 72%)", f"""
<div class="t" style="top:44px;font:700 34px Oswald;letter-spacing:14px;color:#FFD84A">TONIGHT · SOUTHAMPTON</div>
<div class="t" style="top:96px;font:400 118px/1 Anton;color:#fff">THE BOUNDARY BOYS</div>
<div class="t" style="top:222px;font:400 120px/1 'Bebas Neue';color:#e0262f">VS</div>
<div class="t" style="top:330px;font:400 118px/1 Anton;color:#fff">STORM SEASON</div>
<div class="t" style="top:458px;font:700 36px Oswald;letter-spacing:8px;color:#c9a94a">THE RUMBLE IN THE GARDEN</div>
{fence(0, 880, 1080, 320, z=2)}
<div class="abs" style="left:0;right:0;top:930px;height:12px;background:#d81f2a;z-index:3;box-shadow:0 70px 0 #fff,0 140px 0 #d81f2a"></div>
<svg viewBox="0 0 240 200" style="position:absolute;left:30px;top:600px;width:420px;z-index:3"><path d="M50 120 C10 120 10 70 50 66 C56 30 110 20 130 50 C150 26 210 36 206 80 C240 86 236 128 200 128 Z" fill="#4d5966"/><path d="M118 118 L96 160 H122 L104 200 L150 146 H124 L140 118 Z" fill="#FFD84A"/></svg>
<div class="abs" style="left:40px;top:560px;font:700 26px Oswald;letter-spacing:3px;color:#fff;z-index:5">THE CHALLENGER: 70MPH WINDS</div>
{me("nailgun", 490, 560, z=4)}
{wm("right:30px;top:40px")}
{foot("fk", "Ringside seats: free quotes · Southampton")}"""))

# 10 Employee of the month
P.append(("10-employee-of-the-month", "background:#111", f"""
{fence(0, 0, 1080, 1200, z=1, cap=False)}
<div class="abs" style="left:530px;top:40px;width:20px;height:20px;border-radius:50%;background:#555;z-index:3"></div>
<div class="abs" style="left:300px;top:52px;width:480px;height:4px;background:#333;transform:rotate(0deg);z-index:2"></div>
<div class="abs" style="left:180px;top:90px;width:720px;height:860px;padding:30px;background:linear-gradient(135deg,#e9c86a,#a8812c 40%,#f2d98c 60%,#8d6a22);box-shadow:0 24px 50px rgba(0,0,0,.55);z-index:3">
  <div style="position:relative;width:660px;height:800px;overflow:hidden;background:radial-gradient(#4a4a4a,#1d1d1d)">
    {me("level", 30, 600, bottom=800, z=1)}
  </div></div>
<div class="abs" style="left:250px;top:980px;width:580px;height:170px;background:linear-gradient(135deg,#d9b45a,#8d6a22);border-radius:8px;box-shadow:0 10px 24px rgba(0,0,0,.5);text-align:center;color:#2a1c06;z-index:3;padding-top:20px">
  <div style="font:900 44px/1 'Playfair Display'">EMPLOYEE OF THE MONTH</div>
  <div style="font:700 60px/1.1 'Playfair Display';font-style:italic">Again.</div></div>
{wm("right:24px;top:1080px")}
{foot("fk")}"""))

# 11 Pisa postcard
P.append(("11-pisa", "background:#f4ead2;color:#3a2410", f"""
<div class="abs" style="inset:22px 22px 172px;border:4px dashed #b48a52"></div>
<div class="abs" style="left:60px;top:60px;font:700 50px 'Playfair Display';font-style:italic">Greetings from</div>
<div class="abs" style="left:56px;top:110px;font:900 170px/1 'Playfair Display';color:#b5332e">PISA</div>
<div class="abs" style="right:60px;top:60px;width:170px;height:200px;border:8px dotted #b48a52;background:#fff;padding:8px;transform:rotate(4deg)"><div class="fz" style="position:relative;width:100%;height:100%"></div></div>
<div class="abs" style="left:60px;top:320px;width:960px;font:400 80px/1.05 Anton;text-transform:uppercase">Pisa has an excuse.<br><span style="color:#b5332e">Your fence doesn't.</span></div>
<svg viewBox="0 0 120 400" style="position:absolute;left:90px;top:560px;width:150px;transform:rotate(7deg);transform-origin:bottom center;z-index:2">
  <g fill="#efe6d0" stroke="#7a6a50" stroke-width="3"><rect x="20" y="40" width="80" height="350"/><rect x="28" y="10" width="64" height="34"/></g>
  <g stroke="#7a6a50" stroke-width="3">{"".join(f'<line x1="20" y1="{y}" x2="100" y2="{y}"/>' for y in range(80, 390, 48))}</g>
  <g fill="#7a6a50">{"".join(f'<rect x="{x}" y="{y}" width="8" height="26" rx="4"/>' for y in range(92, 390, 48) for x in (32, 50, 68, 86))}</g></svg>
{fence(260, 820, 330, 380, z=2, extra="transform:rotate(7deg);transform-origin:left bottom", cap=False)}
{me("nailgun", 560, 500, z=4)}
{wm("left:40px;top:1080px", dark=True)}
{foot("fy", "Wish you were here · Fencing · Gates · Repairs")}"""))

# 12 Recipe card
P.append(("12-recipe", "background:repeating-linear-gradient(0deg,rgba(200,30,40,.55) 0 40px,transparent 40px 80px),repeating-linear-gradient(90deg,rgba(200,30,40,.55) 0 40px,#fff 40px 80px)", f"""
<div class="abs" style="left:50px;top:50px;width:980px;height:1090px;background:#fffaf0 repeating-linear-gradient(transparent 0 58px,#cfe0f0 58px 60px);border-top:90px solid #fffaf0;box-shadow:0 20px 50px rgba(0,0,0,.4);transform:rotate(-1.5deg);color:#2a2a2a">
  <div style="position:absolute;left:40px;top:-74px;font:400 48px 'Permanent Marker';color:#555">Nan's recipe:</div>
  <div style="position:absolute;left:40px;top:-8px;font:400 100px/1 Anton;color:#9b1c1c">A FENCE THAT LASTS</div>
  <div style="position:absolute;left:44px;top:120px;width:470px;font:400 36px/60px 'Permanent Marker'"><u>Ingredients</u><br>6ft posts<br>Bags of concrete<br>Gravel boards<br>Good timber panels<br>2 Boundary Boys<br>1 brew (essential)</div>
  <div style="position:absolute;left:540px;top:110px;width:400px;height:480px;background:#fff;padding:16px 16px 60px;transform:rotate(3deg);box-shadow:0 10px 24px rgba(0,0,0,.35)">
    <div style="position:relative;width:368px;height:404px;overflow:hidden" class="fz">{me("level", 10, 350, bottom=404, z=1)}</div>
    <div style="position:absolute;left:130px;top:-22px;width:140px;height:40px;background:rgba(255,230,140,.85);transform:rotate(-4deg)"></div></div>
  <div style="position:absolute;left:44px;top:660px;width:900px;font:400 36px/60px 'Permanent Marker'"><u>Method</u><br>Dig deep. Concrete the posts in. Don't skimp.<br>Leave it to set while you have your brew.<br><b style="color:#9b1c1c">Serves: one garden, for years.</b></div>
</div>
{wm("right:60px;top:1070px", dark=True)}
{foot("fy")}"""))

# 13 School report
P.append(("13-school-report", "background:linear-gradient(135deg,#5a3a20,#2a1a0e)", f"""
{fence(560, 1000, 520, 200, z=5)}
{me("nailgun", 600, 500, bottom=1000, z=4)}
<div class="abs" style="left:50px;top:50px;width:640px;height:1090px;background:#fff;color:#1a1a1a;box-shadow:0 20px 50px rgba(0,0,0,.5);transform:rotate(-1deg);padding:40px 40px;z-index:6;font-family:Georgia,serif">
  <div style="font:400 64px/1 Anton;text-align:center">END OF TERM REPORT</div>
  <div style="font:400 30px Georgia;text-align:center;margin:10px 0 24px">Pupil: <b>Your Fence</b></div>
  <div class="rep"><span>Standing up</span><b>F</b></div>
  <div class="rep"><span>Keeping the dog in</span><b>E</b></div>
  <div class="rep"><span>Privacy</span><b>U</b></div>
  <div class="rep"><span>Attendance</span><b style="font-size:26px">Mostly next door</b></div>
  <div style="margin-top:34px;font:700 28px Georgia">Teacher's comment:</div>
  <div style="font:400 46px/1.25 'Permanent Marker';color:#c0261e;margin-top:10px">Easily blown off course. Needs the Boundary Boys.</div>
  <div style="position:absolute;right:30px;bottom:50px;border:8px solid #c0261e;color:#c0261e;font:400 54px/1 Anton;padding:12px 20px;transform:rotate(-12deg);opacity:.85">MUST TRY HARDER</div>
</div>
{wm("right:24px;top:40px")}
{foot("fk")}"""))

# 14 Storm bingo
cells = ["Panel down", "Post snapped", "Trampoline next door", "Bins everywhere", "FREE SPACE: call us",
         "Shed roof gone", "Gate won't shut", "Fence on the car", "Neighbour knocking"]
dab = {0, 1, 3, 4, 6}
grid = "".join(f'<div class="cell"><span>{c}</span>{"<i></i>" if i in dab else ""}</div>' for i, c in enumerate(cells))
P.append(("14-storm-bingo", "background:radial-gradient(90% 60% at 50% 20%,#a31f8a,#3a0832 75%)", f"""
<div class="t" style="top:36px;font:400 120px/1 Anton;color:#FFD84A;text-shadow:0 6px 0 #3a0832">STORM SEASON BINGO</div>
<div class="abs" style="left:60px;top:180px;width:960px;height:500px;display:grid;grid-template-columns:repeat(3,1fr);gap:10px;background:#fff;padding:10px;border-radius:16px;z-index:5">{grid}</div>
{fence(0, 880, 1080, 320, z=2)}
{me("level", 300, 520, z=4)}
<div class="abs" style="left:30px;top:930px;background:#FFD84A;color:#111;padding:16px 26px;transform:rotate(-5deg);z-index:6;box-shadow:0 10px 24px rgba(0,0,0,.4);text-align:center"><div style="font:400 64px/1 Anton">FULL HOUSE?</div><div style="font:700 34px Oswald">Call us.</div></div>
{wm("right:24px;top:1080px")}
{foot("fk")}"""))

# 15 Horoscope
signs = [("ARIES", "A tall, bearded stranger will fix your fence."), ("LEO", "Stop blaming the wind. It's the posts."),
         ("LIBRA", "Balance restored. Everything stands up straight.")]
sg = "".join(f'<div style="margin-bottom:34px"><div style="font:400 46px Anton;color:#e9c86a;letter-spacing:3px">{a}</div><div style="font:700 34px/1.25 \'Playfair Display\';font-style:italic">{b}</div></div>' for a, b in signs)
P.append(("15-fence-o-scope", "background:radial-gradient(90% 70% at 50% 20%,#3b1d6b,#0c0620 75%)", f"""
<div class="abs" style="inset:0;background-image:radial-gradient(#fff 2px,transparent 3px),radial-gradient(#e9c86a 3px,transparent 4px);background-size:120px 140px,210px 190px;background-position:20px 30px,90px 80px;opacity:.6"></div>
<div class="t" style="top:44px;font:900 120px/1 'Playfair Display';color:#e9c86a">Fence-o-scope</div>
<div class="t" style="top:186px;font:600 34px Oswald;letter-spacing:6px">WHAT THE STARS SAY ABOUT YOUR FENCE</div>
<div class="abs" style="left:60px;top:290px;width:480px;z-index:5;color:#fff">{sg}</div>
{fence(0, 900, 1080, 300, z=2, extra="filter:brightness(.8) saturate(.8)")}
{me("level", 540, 520, z=4)}
{wm("right:24px;top:40px")}
{foot("fy", "Written in the stars · Southampton")}"""))

# 16 Scratchcard
tiles = "".join(f'<div class="abs" style="left:{x}px;top:300px;width:280px;height:260px;border-radius:20px;overflow:hidden;border:6px solid #fff;box-shadow:0 10px 24px rgba(0,0,0,.35)">'
                f'<div class="fz" style="position:absolute;inset:0"></div>'
                f'<div style="position:absolute;inset:0;background:#b8b8b8;clip-path:polygon(0 0,100% 0,100% 18%,78% 22%,60% 14%,34% 24%,12% 16%,0 22%)"></div>'
                f'<div style="position:absolute;inset:0;background:#b8b8b8;clip-path:polygon(0 86%,22% 80%,48% 88%,70% 79%,100% 84%,100% 100%,0 100%)"></div>'
                f'<div style="position:absolute;left:0;right:0;top:96px;font:400 58px Bangers;color:#fff;text-shadow:3px 3px 0 #111">FENCE!</div></div>'
                for x in (60, 400, 740))
P.append(("16-scratch-and-win", "background:linear-gradient(135deg,#ff8a00,#ff2f7a)", f"""
<div class="t" style="top:40px;font:400 160px/1 Bangers;color:#fff;-webkit-text-stroke:6px #111;letter-spacing:4px">SCRATCH &amp; WIN</div>
<div class="t" style="top:210px;font:700 40px Oswald;color:#111;text-transform:uppercase">Match three to win a fence that stands up</div>
{tiles}
<div class="t" style="top:600px;font:400 70px/1 Anton;color:#fff;text-shadow:0 4px 0 #111">WINNER! (EVERYONE WINS.)</div>
{fence(0, 900, 1080, 300, z=2)}
{me("nailgun", 270, 540, z=4)}
{wm("right:24px;top:1080px")}
{foot("fk", "Claim your prize: free quotes · Southampton")}"""))

# 17 Instagram vs reality
P.append(("17-instagram-vs-reality", "background:#0b0b0b", f"""
<div class="abs" style="left:0;top:0;width:1080px;height:590px;overflow:hidden">
  <div class="fz" style="position:absolute;inset:0;filter:saturate(1.4) brightness(1.1) sepia(.15)"></div>
  <div class="abs" style="left:40px;top:40px;background:linear-gradient(45deg,#f9a825,#e91e63,#7b1fa2);color:#fff;font:700 40px Oswald;padding:10px 26px;border-radius:40px">YOUR FENCE ON INSTAGRAM</div>
  <div class="abs" style="right:40px;top:470px;font:700 60px Inter;color:#fff;text-shadow:0 4px 14px rgba(0,0,0,.6)">♥ 2,481</div></div>
<div class="abs" style="left:0;top:610px;width:1080px;height:590px;overflow:hidden;background:linear-gradient(#5d666f,#2a2f35)">
  {fence(-60, 160, 560, 470, z=1, extra="transform:rotate(-12deg);transform-origin:left bottom;filter:grayscale(.9) brightness(.7)", cap=False)}
  {fence(420, 260, 260, 380, z=1, extra="transform:rotate(18deg);transform-origin:left bottom;filter:grayscale(.9) brightness(.65)", cap=False)}
  <div class="abs" style="left:40px;top:40px;background:#fff;color:#111;font:700 40px Oswald;padding:10px 26px;border-radius:40px;z-index:3">YOUR FENCE IN REAL LIFE</div></div>
{me("nailgun", 600, 460, z=4)}
{wm("left:30px;top:1090px")}
{foot("fy", "We'll make them match · Southampton")}"""))

# 18 Flat-pack instructions
phone = '<svg viewBox="0 0 80 140" style="width:110px"><rect x="4" y="4" width="72" height="132" rx="12" fill="none" stroke="#111" stroke-width="6"/><circle cx="40" cy="120" r="6" fill="#111"/></svg>'
kettle = '<svg viewBox="0 0 140 120" style="width:170px"><path d="M30 110 H110 L100 40 H40 Z" fill="none" stroke="#111" stroke-width="6"/><path d="M110 60 C132 60 132 92 106 92" fill="none" stroke="#111" stroke-width="6"/><path d="M40 52 L14 30" stroke="#111" stroke-width="6"/><rect x="58" y="22" width="24" height="14" fill="#111"/><path d="M60 14 C56 6 66 2 62 -6 M80 14 C76 6 86 2 82 -6" stroke="#111" stroke-width="4" fill="none"/></svg>'
P.append(("18-instructions", "background:#fff;color:#111", f"""
<div class="t" style="top:44px;font:900 60px/1 'Archivo Black';white-space:nowrap">HOW TO GET A NEW FENCE</div>
<div class="t" style="top:130px;font:500 34px Inter">Tools required: none. Allen key: not included.</div>
<div class="step" style="left:50px;top:200px"><div class="n">1</div>{phone}<div class="cap2">Pick up your phone.</div></div>
<div class="step" style="left:560px;top:200px"><div class="n">2</div><div style="font:900 52px 'Archivo Black';margin:30px 0 20px">07542<br>666563</div><div class="cap2">Ring this.</div></div>
<div class="step" style="left:50px;top:640px"><div class="n">3</div>{kettle}<div class="cap2">Put the kettle on.</div></div>
<div class="step" style="left:560px;top:640px;padding:0;overflow:hidden"><div class="fz" style="position:absolute;inset:0"></div>{me("level", 70, 340, bottom=420, z=1)}<div class="n" style="z-index:3">4</div><div class="cap2" style="position:absolute;left:0;right:0;bottom:0;background:#fff;padding:10px 0;z-index:3">Admire your fence.</div></div>
{wm("left:24px;top:1100px", dark=True)}
{foot("fk")}"""))

# 19 Receipt
P.append(("19-receipt", "background:#111", f"""
{fence(0, 0, 1080, 1200, z=1, cap=False, extra="filter:brightness(.75)")}
{me("level", 480, 600, z=4)}
<div class="abs" style="left:46px;top:60px;width:520px;height:1080px;background:#fbfbf7;color:#222;transform:rotate(-2deg);box-shadow:0 20px 50px rgba(0,0,0,.55);z-index:6;font:400 29px/1.5 'Courier Prime',monospace;padding:40px 34px;clip-path:polygon(0 0,100% 0,100% 97%,95% 100%,90% 97%,85% 100%,80% 97%,75% 100%,70% 97%,65% 100%,60% 97%,55% 100%,50% 97%,45% 100%,40% 97%,35% 100%,30% 97%,25% 100%,20% 97%,15% 100%,10% 97%,5% 100%,0 97%)">
  <div style="text-align:center;font-weight:700;font-size:38px">THE BOUNDARY BOYS</div>
  <div style="text-align:center">SOUTHAMPTON<br>TEL 07542 666563</div>
  <div>----------------------</div>
  <div class="rc"><span>1 NEW FENCE</span><span>YES</span></div>
  <div class="rc"><span>1 PRIVACY</span><span>YES</span></div>
  <div class="rc"><span>1 OLD FENCE</span><span>GONE</span></div>
  <div class="rc"><span>1 NOSY NEIGHBOUR</span><span>BLOCKED</span></div>
  <div class="rc"><span>1 BREW</span><span>YOUR KETTLE</span></div>
  <div>----------------------</div>
  <div class="rc" style="font-weight:700;font-size:34px"><span>TOTAL</span><span>PEACE</span></div>
  <div class="rc" style="font-weight:700;font-size:34px"><span></span><span>&amp; QUIET</span></div>
  <div style="text-align:center;margin-top:30px">THANK YOU.<br>DON'T COME AGAIN.<br>(IT'LL LAST.)</div>
  <div style="height:90px;margin:30px 20px 0;background:repeating-linear-gradient(90deg,#222 0 4px,transparent 4px 7px,#222 7px 9px,transparent 9px 14px,#222 14px 20px,transparent 20px 23px)"></div>
</div>
{wm("right:24px;top:40px")}
{foot("fy")}"""))

# 20 Now playing
P.append(("20-now-playing", "background:linear-gradient(160deg,#5a1e3a,#1a0b16 60%)", f"""
<div class="t" style="top:36px;font:700 30px Inter;letter-spacing:8px;color:#e8c7d8">NOW PLAYING</div>
<div class="abs" style="left:170px;top:100px;width:740px;height:740px;border-radius:24px;overflow:hidden;box-shadow:0 30px 70px rgba(0,0,0,.6)">
  <div class="fz" style="position:absolute;inset:0"></div>{me("nailgun", 110, 560, bottom=740, z=1, show=0.62)}</div>
<div class="abs" style="left:170px;top:870px;width:740px;color:#fff;font-family:Inter">
  <div style="font:800 54px/1.1 Inter">Another Panel in the Wall</div>
  <div style="font:500 36px Inter;color:#d6b3c4;margin-top:6px">The Boundary Boys</div>
  <div style="height:8px;background:rgba(255,255,255,.25);border-radius:4px;margin-top:26px"><div style="width:70%;height:8px;background:#fff;border-radius:4px"></div></div>
  <div style="display:flex;justify-content:space-between;font:500 24px Inter;color:#d6b3c4;margin-top:8px"><span>2:47</span><span>-1:13</span></div>
</div>
<svg viewBox="0 0 300 60" style="position:absolute;left:390px;top:1080px;width:300px"><path d="M40 10 V50 M76 10 L46 30 L76 50 Z" fill="#fff" stroke="#fff" stroke-width="6"/><rect x="128" y="8" width="14" height="44" fill="#fff"/><rect x="156" y="8" width="14" height="44" fill="#fff"/><path d="M260 10 V50 M224 10 L254 30 L224 50 Z" fill="#fff" stroke="#fff" stroke-width="6"/></svg>
{wm("right:24px;top:40px")}
{foot("fk")}"""))

CSS = """
*{box-sizing:border-box;margin:0;padding:0}
body{background:#333;display:flex;flex-wrap:wrap;gap:40px;padding:40px;font-family:Oswald,sans-serif}
.p{position:relative;width:1080px;height:1350px;overflow:hidden;flex:none;color:#fff}
.abs{position:absolute}
.t{position:absolute;left:0;right:0;text-align:center;z-index:5}
.me{position:absolute;overflow:hidden;filter:drop-shadow(0 12px 26px rgba(0,0,0,.5))}
.me img{position:absolute;left:0;top:0}
.fz{position:absolute;background:url(assets/real-fence.jpg) left top/1152px 752px repeat}
.cap{position:absolute;height:22px;background:linear-gradient(#e8c48c,#b98a4e);box-shadow:0 6px 10px rgba(0,0,0,.4)}
.wm{position:absolute;width:110px;opacity:.88;z-index:20}
.foot{position:absolute;left:0;right:0;bottom:0;height:150px;z-index:15;display:flex;flex-direction:column;justify-content:center;text-align:center}
.foot b{font:400 66px/1.05 Anton;text-transform:uppercase;letter-spacing:1px}
.foot i{font:700 24px Oswald;font-style:normal;letter-spacing:5px;text-transform:uppercase;margin-top:4px}
.fk{background:#0b0b0b;color:#FFD84A}.fk i{color:#fff}
.fy{background:#FFD84A;color:#0b0b0b}
.haz{border-top:22px solid transparent;border-image:repeating-linear-gradient(-45deg,#FFD84A 0 22px,#0b0b0b 22px 44px) 22;height:172px}
.tag{position:absolute;font:400 54px/1 Anton;padding:12px 26px;z-index:8;letter-spacing:2px}
.bub{max-width:78%;padding:16px 22px;border-radius:30px}
.bub.l{background:#e9e9eb;color:#111;align-self:flex-start}
.bub.r{background:#0b84ff;color:#fff;align-self:flex-end}
.rl{height:10px;background:#111;margin:8px 0}
.row{display:flex;justify-content:space-between;font:400 30px/1.6 Arial;border-bottom:2px solid #111}
.ans{position:absolute;width:490px;height:96px;background:#0a1240;border:4px solid #c9a94a;border-radius:48px;display:flex;align-items:center;padding-left:40px;font:500 42px Oswald;color:#fff;z-index:5}
.ans b{color:#FFD84A;margin-right:14px}
.rep{display:flex;justify-content:space-between;align-items:center;border-bottom:2px solid #ccc;padding:14px 0;font:400 36px Georgia}
.rep b{font:400 60px 'Permanent Marker';color:#c0261e}
.cell{position:relative;background:#fff;border:3px solid #a31f8a;display:flex;align-items:center;justify-content:center;text-align:center;font:600 34px/1.15 Oswald;color:#3a0832;text-transform:uppercase;padding:10px}
.cell span{position:relative;z-index:2}.cell i{position:absolute;width:130px;height:130px;border-radius:50%;background:rgba(255,47,122,.35);border:6px solid rgba(255,47,122,.8);z-index:1}
.step{position:absolute;width:470px;height:420px;border:4px solid #111;border-radius:20px;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:20px}
.step .n{position:absolute;left:18px;top:18px;width:64px;height:64px;border-radius:50%;background:#111;color:#fff;font:900 38px/64px 'Archivo Black'}
.cap2{font:700 36px Inter;margin-top:16px;color:#111}
.rc{display:flex;justify-content:space-between}
"""

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>The Boundary Boys – twenty posts</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&family=Bebas+Neue&family=Bangers&family=Playfair+Display:ital,wght@0,700;0,900;1,700&family=Permanent+Marker&family=Courier+Prime:wght@400;700&family=Inter:wght@500;600;700;800&family=Archivo+Black&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
{"".join(f'<div class="p" id="{i}" style="{bg}">{body}</div>' for i, bg, body in P)}
<script>document.fonts.ready.then(()=>document.body.dataset.ready='1')</script>
</body></html>"""
(here / "twenty.html").write_text(html)
print(len(P), "posters")
