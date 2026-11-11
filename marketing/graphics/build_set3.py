"""Builds set3.html: pop-culture drafts 20-46 and the four Friday templates 47-50.

Usage: python3 build_set3.py && node render.js
Styles are taken from popculture.html so both sets stay in step.
"""
import re, pathlib

here = pathlib.Path(__file__).parent
css = re.search(r"<style>(.*?)</style>", (here / "popculture.html").read_text(), re.S).group(1)

EXTRA_CSS = """
h1 { white-space:nowrap; }
.p.yel { background:var(--y); color:var(--k); }
.p.yel .kicker { color:var(--k); }
.p.yel .foot { position:absolute; left:0; right:0; bottom:0; background:var(--k); color:var(--y); text-align:center; padding:34px 0 30px; }
.p.yel .foot b { display:block; font:400 70px/1.05 Anton; letter-spacing:1px; text-transform:uppercase; }
.p.yel .foot span { display:block; font:700 30px Oswald; letter-spacing:4px; text-transform:uppercase; margin-top:6px; color:#fff; }
.blank { position:absolute; background:#fff; border:8px solid var(--k); display:flex; align-items:center; justify-content:center;
         text-align:center; font:700 30px/1.3 Oswald; letter-spacing:3px; text-transform:uppercase; color:#999; }
body:not(.guide) .blank span { visibility:hidden; }
"""

BOARDS = lambda n, gaps=(): "".join('<i class="x"></i>' if i in gaps else "<i></i>" for i in range(n))
PROPS = {
    "none": "",
    "fence": f'<div class="fence" style="left:40px;bottom:170px;height:400px">{BOARDS(5)}</div>',
    "gaps": f'<div class="fence" style="left:0;bottom:170px;height:400px">{BOARDS(6, (1, 3, 4))}</div>',
    "lean": f'<div class="fence" style="left:60px;bottom:200px;height:380px;transform:rotate(-24deg);transform-origin:bottom left">{BOARDS(4)}</div>',
    "row": f'<div class="fence" style="left:-10px;bottom:150px;height:330px;z-index:4">{BOARDS(14)}</div>',
    "flat": '<div style="position:absolute;left:40px;bottom:175px;width:440px;z-index:2">'
            + '<div style="height:52px;margin-top:6px;background:linear-gradient(#8a6238,#5c3f24);border-radius:4px"></div>' * 3 + "</div>",
    "heart": '<svg viewBox="0 0 100 90" style="position:absolute;left:70px;bottom:230px;width:360px;z-index:2"><path d="M50 88 L8 44 C-8 24 12 -4 36 6 C44 10 48 16 50 22 C52 16 56 10 64 6 C88 -4 108 24 92 44 Z" fill="#e0262f"/></svg>',
    "grass": '<div style="position:absolute;left:0;right:0;bottom:150px;height:120px;background:linear-gradient(#4f9a35,#2f6b20);z-index:2"></div>',
    "ball": f'<div class="fence" style="left:0;bottom:170px;height:400px">{BOARDS(6, (2,))}</div>'
            '<div style="position:absolute;left:170px;bottom:420px;width:110px;height:110px;border-radius:50%;background:#d7f04a;z-index:3;box-shadow:inset -10px -10px 0 rgba(0,0,0,.15)"></div>',
    "fin": '<svg viewBox="0 0 500 300" style="position:absolute;left:0;bottom:150px;width:520px;z-index:2">'
           '<path d="M190 210 C210 120 250 50 320 20 C300 90 310 160 340 210 Z" fill="#2b3640"/>'
           '<path d="M0 210 C40 190 80 230 120 210 C160 190 200 230 240 210 C280 190 320 230 360 210 C400 190 440 230 500 210 L500 300 L0 300 Z" fill="#0d3a5c"/></svg>',
    "gravel": f'<div class="fence" style="left:40px;bottom:230px;height:340px">{BOARDS(5)}</div>'
              '<div style="position:absolute;left:40px;bottom:170px;width:394px;height:56px;background:#9a9a9a;border-radius:4px;z-index:2"></div>',
}
ZONES = {
    "R": "right:30px;bottom:170px;width:540px;height:520px",
    "C": "left:190px;bottom:170px;width:700px;height:540px",
    "B": "left:240px;bottom:310px;width:600px;height:340px",
}
BG = lambda a, b: f"background:radial-gradient(115% 65% at 50% 24%,{a} 0%,{b} 72%)"
DARK = ""  # default black/charcoal

# id, bg, kicker, white headline, yellow headline, sub, tape line, zone, pose note, prop, extras
P = [
 ("20-flat-as-a-pancake", DARK, "Pancake Day", "Flat as a<br>pancake?", "That'll be<br>your fence.", "", "We do the flipping work", "R", "one with a frying pan", "flat", ""),
 ("21-roses-are-red", BG("#5a1016", "#12060a"), "Valentine's Day", "Roses are red,<br>violets are blue,", "your fence is knackered,<br>we'll build you a new one.", "It doesn't rhyme. It will stand up.", "Love thy neighbour. From behind a fence.", "R", "one holding a rose", "heart", ""),
 ("22-by-order-of", BG("#3a322a", "#0b0907"), "Small Heath? No. Southampton.", "By order of", "the Boundary<br>Boys.", "", "No fighting. Just fencing.", "C", "flat caps, walking at camera", "none", ""),
 ("23-winter-is-going", BG("#274a66", "#060d14"), "Spring bookings now open", "Winter is going.", "The wall<br>needs work.", "", "We are the watchers on your wall", "B", "furs, one sword", "row", "snow"),
 ("24-what-mum-really-wants", BG("#4a1f4a", "#0e060e"), "Mother's Day", "Get your mum what<br>she really wants.", "A fence next door<br>can't see over.", "", "Flowers last a week. Fences last longer.", "R", "holding flowers", "fence", ""),
 ("25-can-we-fix-it", BG("#1d4f8a", "#060f1c"), "Fences · Gates · Repairs", "Can we fix it?", "Yes. Obviously.<br>It's our job.", "", "Free quotes · Southampton", "C", "hard hats, thumbs up", "none", ""),
 ("26-clocks-spring-forward", DARK, "The clocks change this weekend", "Clocks spring<br>forward.", "Your fence<br>shouldn't.", "", "Leaning fences put right", "R", "one pointing at a watch", "lean", ""),
 ("27-the-invisible-fence", BG("#3f86c9", "#0a1b2e"), "New for 2027", "Introducing the", "invisible fence.", "Zero maintenance. Zero privacy. Zero fence.", "April Fools. We build real ones.", "C", "proudly presenting nothing", "grass", ""),
 ("28-on-wednesdays", BG("#c2337a", "#2a0718"), "You can't sit with us. There's a fence.", "On Wednesdays", "we wear hi-vis.", "", "Get in, loser. We're going fencing.", "C", "pink hi-vis", "none", ""),
 ("29-in-my-swamp", BG("#3d5a1a", "#0a1005"), "Privacy fencing", "What are you doing", "in my swamp?", "Fences have layers. Posts, rails, boards.", "Keep the neighbours out of your swamp", "R", "furious, in a paddling pool", "fence", ""),
 ("30-may-the-fence", "background:#000", "May the 4th", "May the fence", "be with you.", "These are the posts you're looking for.", "A long time ago, your fence was fine", "C", "dressing gowns, broom lightsabers", "none", "snow"),
 ("31-nil-points", BG("#3b1a6b", "#0a0514"), "Good evening, Southampton calling", "That fence:<br>nil points.", "Ours:<br>douze points.", "", "Making your mind up? Call us.", "R", "sequins", "lean", ""),
 ("32-on-a-break", BG("#4b2a7a", "#0d0716"), "The one with the fence", "We were<br>on a break!", "So was your<br>fence panel.", "", "We'll be there for you", "R", "guilty, on a sofa", "gaps", ""),
 ("33-not-my-type-on-paper", BG("#d6457a", "#3a0f24"), "I've got a text!", "Your fence is not", "my type on paper.", "Time to recouple with one that stands up.", "Straight. Tall. Solid. Our type.", "R", "swimwear over workwear, phone in hand", "lean", ""),
 ("34-dad-said-hed-fix-it", DARK, "Father's Day", "Dad said he'd<br>fix it in 2019.", "Let him off.", "", "Give him the day off. Give us a call.", "R", "one asleep in a deckchair", "lean", ""),
 ("35-ours-is-second", BG("#6a2f7a", "#150818"), "No ticket required", "Glastonbury has the<br>most famous fence<br>in Britain.", "Ours is second.", "", "Headlining a garden near you", "R", "wellies, bucket hats", "fence", ""),
 ("36-new-balls-please", BG("#1f5a34", "#07140b"), "Quiet, please", "New balls,<br>please.", "And new<br>panels.", "Yours has had forty footballs through it.", "Game, set, fence.", "R", "tennis whites, headbands", "ball", ""),
 ("37-hot-fence-summer", BG("#e0702a", "#3a1206"), "It's official", "Hot fence", "summer.", "", "Looking good from both sides", "C", "sunglasses, no explanation", "none", ""),
 ("38-a-bigger-fence", BG("#14506e", "#040f17"), "Just when you thought it was safe to go back in the garden", "You're gonna need", "a bigger fence.", "", "Ask us about taller panels", "R", "in a wheelbarrow, staring out to sea", "fin", ""),
 ("39-to-the-boundary", BG("#3f86c9", "#0a1b2e"), "You've got a friend in fencing", "To the boundary…", "and beyond!", "", "Reach for the sky. Then call us.", "C", "cardboard space helmet, arm up", "none", ""),
 ("40-no-soggy-bottoms", BG("#1d5a5a", "#061414"), "On your marks, get set…", "No soggy<br>bottoms.", "Ask us about<br>gravel boards.", "", "A proper showstopper", "R", "aprons, holding a cake", "gravel", ""),
 ("41-back-to-school", DARK, "School's back", "Kids are back<br>at school.", "Now sort<br>the fence.", "You've run out of excuses.", "Free quotes · Southampton", "R", "satchels, ties round heads", "lean", ""),
 ("42-ours-get-a-ten", BG("#5a1a6b", "#12051a"), "Seeeven!", "That fence<br>gets a four.", "Ours get a ten.", "", "Keeeep fencing!", "C", "sequins, dance hold", "none", "gold"),
 ("43-fence-post", BG("#2a2f36", "#050607"), "Licensed to drill", "The name's Post.", "Fence Post.", "", "Shaken by the wind? Not ours.", "C", "dinner jackets, one eyebrow up", "none", ""),
 ("44-the-upside-down", BG("#4a0c10", "#080102"), "Southampton, 1983", "Something from the<br>Upside Down came<br>through your fence.", "It was next<br>door's dog.", "", "Close the gap. Call us.", "R", "on bikes, with torches", "gaps", ""),
 ("45-nightmare-on-rotted-posts", BG("#2a1440", "#07030c"), "This Halloween", "A nightmare on", "rotted posts.", "One, two, the wind's coming for you.", "Don't let your fence become a horror story", "R", "your own monster, not one from a film", "lean", ""),
 ("46-fence-of-november", DARK, "5 November", "Remember,<br>remember,", "the fence of<br>November.", "Don't burn the old one till the new one's up.", "Storm season is here. Book now.", "R", "one holding a sparkler", "fence", "gold"),
]

SNOW_GOLD = 'style="background-image:radial-gradient(#FFD84A 3px,transparent 4px),radial-gradient(#fff 2px,transparent 3px),radial-gradient(#FFD84A 4px,transparent 5px)"'

def poster(id, bg, kicker, white, yellow, sub, tape, zone, pose, prop, extra):
    centre = ' style="text-align:center"' if zone == "C" else ""
    snow = '<div class="snow"></div>' if extra == "snow" else f'<div class="snow" {SNOW_GOLD}></div>' if extra == "gold" else ""
    return f"""
<div class="p" id="{id}" style="{bg}">
  {snow}
  <div class="head"{centre}>
    <div class="kicker">{kicker}</div>
    <h1 style="font-size:190px">{white}</h1>
    <h1 class="y" style="font-size:190px;margin-top:10px">{yellow}</h1>
    {f'<div class="sub">{sub}</div>' if sub else ''}
  </div>
  {PROPS[prop]}
  <div class="zone" style="{ZONES[zone]}">You + Craig here<br>({pose})</div>
  <div class="under"></div>
  <div class="tape"><b>The Boundary Boys · 07542 666563</b><span>{tape}</span></div>
</div>"""

FOOT = '<div class="foot"><b>The Boundary Boys · 07542 666563</b><span>{}</span></div>'
FRIDAY = f"""
<div class="p yel" id="47-friday-slots-left">
  <div class="head"><div class="kicker">This month's diary</div>
    <h1 style="font-size:190px">Slots left:</h1></div>
  <div class="blank" style="left:290px;top:470px;width:500px;height:400px"><span>Type the number here</span></div>
  <div class="sub" style="position:absolute;left:60px;right:60px;top:920px;text-align:center;font-size:54px">When they're gone, they're gone.</div>
  {FOOT.format("Message us today")}
</div>
<div class="p yel" id="48-friday-review">
  <div class="head"><div class="kicker">Straight from a customer</div>
    <h1 style="font-size:190px">Don't take our<br>word for it.</h1></div>
  <div class="blank" style="left:90px;top:520px;width:900px;height:520px"><span>Paste a review screenshot here</span></div>
  {FOOT.format("Free quotes · Southampton")}
</div>
<div class="p yel" id="49-friday-now-booking">
  <div class="head"><div class="kicker">Get in the diary</div>
    <h1 style="font-size:190px">Now booking:</h1></div>
  <div class="blank" style="left:140px;top:470px;width:800px;height:300px"><span>Type the month here</span></div>
  <div class="sub" style="position:absolute;left:60px;right:60px;top:830px;text-align:center;font-size:54px">Good fences come to those who book.</div>
  {FOOT.format("Call or message for a free quote")}
</div>
<div class="p yel" id="50-friday-free-quote">
  <div class="head"><div class="kicker">Takes two minutes</div>
    <h1 style="font-size:190px">Send us a photo<br>of your fence.</h1>
    <h1 style="font-size:190px;margin-top:30px;color:#fff;-webkit-text-stroke:3px #0b0b0b">We'll send you<br>a price.</h1></div>
  <div class="sub" style="position:absolute;left:60px;right:60px;top:1000px;text-align:center;font-size:44px">No pressure. No hard sell. No judgement.</div>
  {FOOT.format("Free quotes · Southampton")}
</div>"""

# Shrink headlines until each line fits the width and the block clears the cut-out zone.
FIT = """
<script>
document.fonts.ready.then(() => {
  document.querySelectorAll('.p').forEach(p => {
    const head = p.querySelector('.head'); if (!head) return;
    const hs = [...head.querySelectorAll('h1')];
    const size = h => parseFloat(h.style.fontSize);
    hs.forEach(h => { while (h.scrollWidth > head.clientWidth && size(h) > 40) h.style.fontSize = (size(h) - 2) + 'px'; });
    const limit = p.classList.contains('yel') ? 9999 : 590;
    let guard = 0;
    while (head.offsetHeight > limit && guard++ < 60) hs.forEach(h => h.style.fontSize = (size(h) * 0.97) + 'px');
  });
  document.body.dataset.ready = '1';
});
</script>"""

html = f"""<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>The Boundary Boys – pop culture drafts, set 3</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;700&family=Permanent+Marker&display=swap" rel="stylesheet">
<style>{css}{EXTRA_CSS}</style>
</head>
<body>
{"".join(poster(*p) for p in P)}
{FRIDAY}
{FIT}
</body>
</html>
"""
(here / "set3.html").write_text(html)
print("wrote set3.html with", len(P) + 4, "designs")
