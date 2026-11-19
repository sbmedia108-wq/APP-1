"""Two-year seasonal calendar for The Boundary Boys.

Year 1 (Nov 2026 - Nov 2027): one finished poster per seasonal moment, each with
the owner's photo and a suggested deal.  Year 2 (Nov 2027 - Nov 2028): the same
moments with fresh headlines and deals, ready to be built into posters.

Usage: python3 build_year.py && node render.js year.html
Writes year.html and ../content-calendar-2-years.md
"""
import datetime, pathlib

here = pathlib.Path(__file__).parent
SIZE = {"level": (916, 1434), "nailgun": (941, 1437), "bond": (809, 1430), "jungle": (736, 1030)}
WAIST = {"level": .6, "nailgun": .6, "bond": .62, "jungle": .92}   # fraction of photo height hidden by the fence
HEAD = {"level": (.49, .01), "nailgun": (.63, .01), "bond": (.52, .0), "jungle": (.52, .0)}
WIDTH = {"level": 640, "nailgun": 640, "bond": 560, "jungle": 500}

# date, slug, occasion, white line, accent line, deal (big), deal (detail), ends, theme, pose, caption
Y1 = [
 ("2026-11-27", "black-friday", "Black Friday", "Black Friday?", "Proper deals on proper fences.",
  "15% off", "new fencing booked this weekend", "Ends Mon 30 Nov", "gold", "nailgun",
  "No doorbusters, no countdown timers. Book a new fence this weekend and get 15% off. Ends Monday night."),
 ("2026-12-04", "christmas", "Christmas", "All I want for Christmas", "is a fence that stands up.",
  "Free removal", "of your old fence", "Book by 18 Dec", "xmas", "level",
  "Get it sorted before the family turn up. Book by the 18th and we'll take the old fence away for free."),
 ("2026-12-26", "boxing-day", "Boxing Day sale", "Boxing Day sale.", "Fences, not jumpers.",
  "10% off", "January installs", "Book by 3 Jan", "navy", "nailgun",
  "Everyone's in the sales today. Ours is better than another jumper. 10% off any fence fitted in January, book by the 3rd."),
 ("2027-01-01", "new-year", "New Year", "New year.", "New fence.",
  "Free gravel boards", "on any new fence", "Book in January", "fireworks", "bond",
  "Happy new year from the Boundary Boys. The one resolution someone else does for you. Free gravel boards on any fence booked in January."),
 ("2027-01-18", "blue-monday", "Blue Monday", "Blue Monday?", "Your fence is feeling it too.",
  "Free quote", "back to you within 48 hours", "All January", "blue", "level",
  "Most depressing day of the year, apparently. Cheer yourself up and tick one job off the list. Free quotes, back to you within 48 hours."),
 ("2027-02-12", "valentines", "Valentine's Day", "Love thy neighbour.", "Split the cost of the fence.",
  "10% off each", "when you and next door book together", "Book by 28 Feb", "hearts", "bond",
  "Nothing says romance like a shared boundary. Book your fence with next door and you both get 10% off."),
 ("2027-03-05", "mothers-day", "Mother's Day", "Your mum called.", "She wants a new fence.",
  "Free trellis", "topper on any new fence", "Book by 31 Mar", "purple", "level",
  "Mother's Day on Sunday. Flowers last a week, a fence lasts years. Free trellis topper on any fence booked this month."),
 ("2027-03-15", "spring", "Spring bookings", "Spring has sprung.", "So has your fence panel.",
  "10% off", "spring installs booked in March", "Ends 31 Mar", "spring", "nailgun",
  "Garden season's nearly here and the diary fills up fast. Book in March and get 10% off your spring install."),
 ("2027-03-26", "easter", "Easter weekend", "Egg hunt?", "Not through our fences.",
  "Free post caps", "on every new fence", "Book by 11 Apr", "easter", "level",
  "Happy Easter. Hide the eggs, not the gaps in your fence. Free post caps on every new fence booked over Easter."),
 ("2027-04-30", "may-bank-holiday", "Bank holiday weekend", "Long weekend?", "We'll do the hard bit.",
  "Weekend installs", "at no extra charge", "All of May", "sunny", "jungle",
  "Bank holiday Monday. You put the barbecue on, we'll put the fence up. Weekend installs at no extra charge all May."),
 ("2027-05-28", "bbq-season", "BBQ season", "BBQ season.", "Don't let next door watch.",
  "£50 off", "privacy fencing over 10 metres", "Book by 30 Jun", "warm", "nailgun",
  "Barbecue season is here. Burgers for you, not for next door's nosy dog. £50 off privacy fencing over 10 metres."),
 ("2027-06-18", "fathers-day", "Father's Day", "Dad said he'd fix it.", "In 2019.",
  "10% off", "give him the day off", "Book by 30 Jun", "dad", "level",
  "Father's Day on Sunday. He's been getting round to it for years. Let him off and give us a ring instead. 10% off this month."),
 ("2027-07-19", "summer-holidays", "Summer holidays", "Going away?", "Come back to a new fence.",
  "Free wood treatment", "on summer installs", "Book by 31 Aug", "turquoise", "jungle",
  "Off on holiday? Leave us the side gate key and come home to a brand new fence. Free wood treatment on all summer installs."),
 ("2027-08-27", "august-bank-holiday", "Late summer", "Last of the summer.", "Not the last of your fence.",
  "Free fence check", "posts, panels and gates", "All September", "sunset", "nailgun",
  "Last bank holiday of the summer. Before the weather turns, we'll come and check your posts, panels and gates for free."),
 ("2027-09-06", "back-to-school", "Back to school", "Kids back at school?", "Now sort the fence.",
  "10% off", "weekday installs", "Book by 30 Sep", "chalk", "level",
  "Peace and quiet at last. Get the fence done while the house is empty. 10% off weekday installs booked in September."),
 ("2027-10-04", "storm-season", "Storm season", "Winter is coming.", "Is your fence ready?",
  "15% off", "post replacements", "Book by 31 Oct", "storm", "nailgun",
  "If a post is wobbling now, it won't be standing in January. 15% off post replacements booked in October."),
 ("2027-10-29", "halloween", "Halloween", "Trick or treat?", "No tricks. Just good fences.",
  "Free removal", "of your old fence", "Book by 7 Nov", "halloween", "bond",
  "Happy Halloween. The scariest thing on your street shouldn't be your fence. We'll take the old one away for free."),
 ("2027-11-05", "bonfire-night", "Bonfire Night", "Remember, remember.", "Fix it before December.",
  "10% off", "gates fitted in November", "Ends 30 Nov", "fireworks", "level",
  "Remember, remember, to fix it by December. 10% off any gate fitted this month."),
]

# Year 2: date, occasion, headline idea, deal idea
Y2 = [
 ("2027-11-26", "Black Friday", "Black Friday: our biggest deal of the year", "15% off fencing booked Black Friday weekend"),
 ("2027-12-03", "Christmas", "Santa's on the roof. We're on the fence.", "Free old-fence removal, book by 17 Dec"),
 ("2027-12-26", "Boxing Day", "Boxing Day: unwrap a new fence", "10% off January installs, book by 2 Jan"),
 ("2027-12-31", "New Year", "Out with the old fence, in with the new", "Free gravel boards on fences booked in January"),
 ("2028-01-17", "Blue Monday", "Feeling blue? Your fence is feeling green (with mould)", "Free quote within 48 hours, all January"),
 ("2028-02-11", "Valentine's Day", "Roses are red, your fence is grey", "Book with next door, 10% off each"),
 ("2028-03-24", "Mother's Day (Sun 26 Mar)", "Mum knows best. She says fix the fence", "Free trellis topper, book by 31 Mar"),
 ("2028-03-13", "Spring bookings", "Spring clean your garden, start with the fence", "10% off spring installs booked in March"),
 ("2028-04-14", "Easter (Sun 16 Apr)", "Easter egg hunt? Make sure the eggs stay in your garden", "Free post caps, book by 30 Apr"),
 ("2028-04-28", "May bank holiday (Mon 1 May)", "Bank holiday? Ours is a working holiday", "Weekend installs at no extra charge in May"),
 ("2028-05-26", "BBQ season (bank holiday Mon 29 May)", "Burgers on, nosy neighbours off", "£50 off privacy fencing over 10 metres"),
 ("2028-06-16", "Father's Day (Sun 18 Jun)", "Dad's day off. We've got the fence", "10% off, book by 30 Jun"),
 ("2028-07-17", "Summer holidays", "Holiday mode: on. Fence: sorted", "Free wood treatment on summer installs"),
 ("2028-08-25", "August bank holiday (Mon 28 Aug)", "Summer's ending. Your fence doesn't have to", "Free fence health check in September"),
 ("2028-09-04", "Back to school", "School's back. Lessons in proper fencing", "10% off weekday installs in September"),
 ("2028-10-02", "Storm season", "Batten down the panels", "15% off post replacements in October"),
 ("2028-10-27", "Halloween", "The fence that wouldn't die. Until now", "Free old-fence removal, book by 7 Nov"),
 ("2028-11-03", "Bonfire Night", "Your fence should go up, not up in smoke", "10% off gates fitted in November"),
 ("2028-11-24", "Black Friday", "Black Friday: fences, not tellies", "15% off fencing booked Black Friday weekend"),
]

THEMES = {  # background, accent colour, deal badge colour, decoration
 "gold": ("radial-gradient(90% 60% at 50% 35%,#2b2410,#050505 75%)", "#e8c45a", "#e8c45a", ""),
 "xmas": ("radial-gradient(90% 60% at 50% 30%,#7a1219,#1c0508 75%)", "#ffd84a", "#ffd84a", "snow"),
 "navy": ("radial-gradient(90% 60% at 50% 30%,#1d3a6e,#060d1c 75%)", "#ffd84a", "#d81f2a", "snow"),
 "fireworks": ("radial-gradient(90% 60% at 50% 30%,#1e1640,#05040e 75%)", "#e8c45a", "#e8c45a", "fireworks"),
 "blue": ("linear-gradient(#123a7a,#071833)", "#7fd0ff", "#7fd0ff", ""),
 "hearts": ("radial-gradient(90% 60% at 50% 30%,#a3123a,#2a0410 75%)", "#ffc2d6", "#ffffff", "hearts"),
 "purple": ("radial-gradient(90% 60% at 50% 30%,#5a2a7a,#170a22 75%)", "#ffd84a", "#ffd84a", ""),
 "spring": ("linear-gradient(#5fb3ef,#d6f0ff 70%)", "#1b6b2a", "#ffd84a", ""),
 "easter": ("linear-gradient(#fff2b8,#d9f2c6 70%)", "#7a3fb0", "#7a3fb0", "eggs"),
 "sunny": ("linear-gradient(#ffb43a,#ffe27a 70%)", "#b8261c", "#b8261c", "sun"),
 "warm": ("linear-gradient(#e2572a,#ffb24a 70%)", "#ffffff", "#1b1b1b", "sun"),
 "dad": ("radial-gradient(90% 60% at 50% 30%,#23384f,#0a121b 75%)", "#ffd84a", "#ffd84a", ""),
 "turquoise": ("linear-gradient(#17a3b8,#9fe6ef 70%)", "#ffffff", "#ff6b3c", "sun"),
 "sunset": ("linear-gradient(#3a1a5e,#c2337a 50%,#ffb24a 80%)", "#ffd84a", "#ffd84a", "sun"),
 "chalk": ("radial-gradient(90% 60% at 50% 30%,#2f4a3a,#132219 75%)", "#ffe27a", "#ffe27a", ""),
 "storm": ("linear-gradient(#4a5662,#141a20)", "#ffd84a", "#ffd84a", "rain"),
 "halloween": ("radial-gradient(90% 60% at 50% 30%,#4a1f6e,#0d0514 75%)", "#ff8a1c", "#ff8a1c", "halloween"),
}
DARK_TEXT = {"spring", "easter", "sunny"}   # light backgrounds get dark headline text


def deco(kind):
    if kind == "snow":
        return '<div class="snow"></div>'
    if kind == "rain":
        return '<div class="rain"></div>'
    if kind == "sun":
        return '<div class="abs" style="right:-120px;top:300px;width:520px;height:520px;border-radius:50%;background:radial-gradient(#fff6c2,#ffd84a 60%,rgba(255,216,74,0) 72%);opacity:.75;z-index:0"></div>'
    if kind == "hearts":
        spots = [(60, 470, 110, -12), (900, 330, 90, 14), (840, 760, 70, -8), (130, 780, 60, 10), (980, 560, 50, 0)]
        return "".join(f'<div class="abs" style="left:{x}px;top:{y}px;font-size:{s}px;color:#ff5f8f;opacity:.35;transform:rotate({r}deg);z-index:0">&#9829;</div>' for x, y, s, r in spots)
    if kind == "eggs":
        eggs = [(60, 500, "#ff9fc4", "#ffd84a"), (880, 360, "#8fd3ff", "#ffffff"), (950, 700, "#c79bff", "#ffd84a"), (150, 820, "#9fe39f", "#ff9fc4")]
        return "".join(f'<svg class="abs" viewBox="0 0 60 80" style="left:{x}px;top:{y}px;width:90px;z-index:0;opacity:.8"><ellipse cx="30" cy="42" rx="26" ry="36" fill="{a}"/><path d="M5 40 Q15 32 30 40 T55 40" stroke="{b}" stroke-width="5" fill="none"/><path d="M6 54 Q16 46 30 54 T54 54" stroke="{b}" stroke-width="4" fill="none"/></svg>' for x, y, a, b in eggs)
    if kind == "fireworks":
        def burst(x, y, r, c):
            rays = "".join(f'<line x1="0" y1="{r*.3:.0f}" x2="0" y2="{r}" transform="rotate({a})" stroke="{c}" stroke-width="5" stroke-linecap="round"/>' for a in range(0, 360, 30))
            return f'<svg class="abs" viewBox="{-r} {-r} {2*r} {2*r}" style="left:{x-r}px;top:{y-r}px;width:{2*r}px;z-index:0;opacity:.6"><g>{rays}</g></svg>'
        return burst(140, 560, 100, "#e8c45a") + burst(950, 420, 80, "#ff5f8f") + burst(900, 760, 60, "#7fd0ff")
    if kind == "halloween":
        pumpkin = '<svg class="abs" viewBox="0 0 100 90" style="left:{}px;top:{}px;width:{}px;z-index:0"><rect x="46" y="2" width="8" height="16" rx="3" fill="#3a5a1a"/><ellipse cx="30" cy="52" rx="24" ry="34" fill="#e2681a"/><ellipse cx="70" cy="52" rx="24" ry="34" fill="#e2681a"/><ellipse cx="50" cy="52" rx="26" ry="36" fill="#ff8a1c"/><path d="M34 42 l8 10 h-16z M66 42 l8 10 h-16z" fill="#1a0a05"/><path d="M30 64 q20 14 40 0 l-6 6 -6-4 -6 6 -6-6 -6 4z" fill="#1a0a05"/></svg>'
        bat = '<svg class="abs" viewBox="0 0 100 40" style="left:{}px;top:{}px;width:{}px;z-index:0;opacity:.8"><path d="M50 14 c4-8 10-8 12-4 c8-10 22-8 30 2 c-8-2-14 2-16 8 c-6-4-12-2-14 4 c-4-4-8-4-12 0 c-4-4-8-4-12 0 c-2-6-8-8-14-4 c-2-6-8-10-16-8 c8-10 22-12 30-2 c2-4 8-4 12 4z" fill="#000"/></svg>'
        return pumpkin.format(30, 890, 120) + bat.format(860, 360, 150) + bat.format(780, 470, 90)
    return ""


HAT = '<svg viewBox="0 0 120 100" style="width:100%"><path d="M12 78 C20 30 60 6 96 30 C80 34 96 60 104 78 Z" fill="#d81f2a"/><rect x="4" y="72" width="108" height="22" rx="11" fill="#fff"/><circle cx="100" cy="30" r="13" fill="#fff"/></svg>'


def photo(pose, hat=False):
    w = WIDTH[pose]
    pw, ph = SIZE[pose]
    h = w * ph / pw
    top = 1000 - WAIST[pose] * h
    left = 1080 - w - 30 if pose != "jungle" else 1080 - w - 60
    out = (f'<div class="abs" style="left:{left:.0f}px;top:{top:.0f}px;width:{w}px;height:{1000 - top:.0f}px;overflow:hidden;z-index:4">'
           f'<img src="assets/me-{pose}.png" style="position:absolute;left:0;top:0;width:{w}px;filter:drop-shadow(0 12px 26px rgba(0,0,0,.45))"></div>')
    if hat:
        hx, hy = HEAD[pose]
        hw = w * .3
        out += (f'<div class="abs" style="left:{left + w * hx - hw * .5:.0f}px;top:{top + h * hy - hw * .55:.0f}px;'
                f'width:{hw:.0f}px;transform:rotate(-8deg);z-index:5">{HAT}</div>')
    return out, top


def fence():
    return ('<div class="cap" style="left:0;top:986px;width:1080px;z-index:5"></div>'
            '<div class="fz" style="left:0;top:1000px;width:1080px;height:200px;z-index:5"></div>')


def poster(d, slug, occasion, white, accent, big, small, ends, theme, pose, caption):
    bg, acc, badge, kind = THEMES[theme]
    ink = "#121212" if theme in DARK_TEXT else "#ffffff"
    badge_ink = "#121212" if badge in ("#ffd84a", "#e8c45a", "#ffffff", "#7fd0ff", "#ffe27a", "#ffc2d6", "#ff8a1c") else "#ffffff"
    pic, top = photo(pose, hat=(theme == "xmas"))
    return f"""
<div class="p" id="{d}-{slug}" style="background:{bg}">
  {deco(kind)}
  <div class="kick" style="background:{acc};color:{'#121212' if acc not in ('#7a3fb0','#1b6b2a','#b8261c') else '#fff'}">{occasion}</div>
  <div class="hd" data-max="{top - 40:.0f}"><h1 style="color:{ink}">{white}</h1><h1 style="color:{acc}">{accent}</h1></div>
  <div class="badge" style="background:{badge};color:{badge_ink}">
    <div class="b1">Deal</div><div class="b2">{big}</div><div class="b3">{small}</div><div class="b4">{ends}</div></div>
  {pic}
  {fence()}
  <img class="wm" src="assets/sb-media.png" style="left:30px;top:1090px">
  <div class="foot"><b>The Boundary Boys · 07542 666563</b><i>Mention this post to claim · Southampton</i></div>
</div>"""


CSS = (here / "base.css").read_text() + """
*{box-sizing:border-box;margin:0;padding:0}
body{background:#333;display:flex;flex-wrap:wrap;gap:40px;padding:40px}
.p{position:relative;width:1080px;height:1350px;overflow:hidden;flex:none}
.abs{position:absolute}
.fz{position:absolute;background:url(assets/real-fence.jpg) left top/1152px 752px repeat}
.cap{position:absolute;height:22px;background:linear-gradient(#e8c48c,#b98a4e);box-shadow:0 6px 10px rgba(0,0,0,.4)}
.kick{position:absolute;left:60px;top:52px;font:700 28px/1 Oswald;letter-spacing:6px;text-transform:uppercase;padding:12px 22px 12px 26px;z-index:6}
.hd{position:absolute;left:60px;right:60px;top:118px;z-index:6}
.hd h1{font:400 150px/.95 Anton;text-transform:uppercase;white-space:nowrap;letter-spacing:.5px}
.hd h1+h1{margin-top:10px}
.badge{position:absolute;left:46px;top:560px;width:330px;height:330px;border-radius:50%;z-index:7;display:flex;flex-direction:column;align-items:center;justify-content:center;text-align:center;padding:0 34px;transform:rotate(-8deg);box-shadow:0 14px 30px rgba(0,0,0,.4);border:6px solid rgba(255,255,255,.85)}
.b1{font:700 22px Oswald;letter-spacing:6px;text-transform:uppercase;opacity:.85}
.b2{font:400 64px/1 Anton;text-transform:uppercase;margin:6px 0}
.b3{font:600 23px/1.2 Oswald;text-transform:uppercase}
.b4{font:700 20px Oswald;letter-spacing:2px;text-transform:uppercase;margin-top:10px;opacity:.85}
.wm{position:absolute;width:110px;opacity:.85;z-index:20}
.foot{position:absolute;left:0;right:0;bottom:0;height:150px;z-index:15;display:flex;flex-direction:column;justify-content:center;text-align:center;background:#0b0b0b;color:#FFD84A}
.foot b{font:400 66px/1.05 Anton;text-transform:uppercase;letter-spacing:1px}
.foot i{font:700 24px Oswald;font-style:normal;letter-spacing:5px;text-transform:uppercase;margin-top:4px;color:#fff}
"""
FIT = """<script>
document.fonts.ready.then(()=>{
  document.querySelectorAll('.hd').forEach(hd=>{
    const hs=[...hd.querySelectorAll('h1')], fs=h=>parseFloat(getComputedStyle(h).fontSize);
    hs.forEach(h=>{while(h.scrollWidth>hd.clientWidth+1&&fs(h)>40)h.style.fontSize=(fs(h)-2)+'px'});
    let g=0; while(hd.offsetTop+hd.offsetHeight>+hd.dataset.max&&g++<80) hs.forEach(h=>h.style.fontSize=(fs(h)*.97)+'px');
  });
  document.querySelectorAll('.badge').forEach(bd=>{const b=bd.querySelector('.b2');let s=64;
    const tall=()=>[...bd.children].reduce((t,c)=>t+c.offsetHeight,0)+30;
    while((b.scrollWidth>bd.clientWidth-68||tall()>bd.clientHeight-70)&&s>30){s-=2;b.style.fontSize=s+'px'}});
  document.body.dataset.ready='1';
});</script>"""

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>The Boundary Boys – seasonal year</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{CSS}</style></head><body>
{"".join(poster(*p) for p in Y1)}
{FIT}
</body></html>"""
(here / "year.html").write_text(html)

# ---------------------------------------------------------------------------
D = datetime.date.fromisoformat
fmt = lambda d: D(d).strftime("%a %-d %b %Y")
rows1 = "\n".join(f"| {fmt(d)} | {occ} | **{w} {a}** | {big} {small}. {ends}. | {cap} 07542 666563 | `graphics/exports/year/{d}-{slug}.png` |"
                  for d, slug, occ, w, a, big, small, ends, theme, pose, cap in Y1)
rows2 = "\n".join(f"| {fmt(d)} | {occ} | {head} | {deal} |" for d, occ, head, deal in sorted(Y2))

MONTHS = [
 ("November", "Black Friday deals, storm repairs, I'm a Celeb", "Storm repairs, getting fences up before Christmas"),
 ("December", "Christmas, then Boxing Day sale", "Book before Christmas, book January"),
 ("January", "New year, Blue Monday", "Fresh start, free quotes, planning spring"),
 ("February", "Valentine's, Pancake Day", "Neighbour deals, privacy"),
 ("March", "Mother's Day, spring bookings, Easter (some years)", "Spring installs, diary filling up"),
 ("April", "Easter (some years), April Fools", "Garden season starts"),
 ("May", "Two bank holidays, BBQ season", "Privacy for summer, weekend installs"),
 ("June", "Father's Day, summer sport", "Privacy, gates, getting it done before summer"),
 ("July", "Summer holidays", "Installs while you're away, wood treatment"),
 ("August", "Bank holiday, end of summer", "Fence health checks before autumn"),
 ("September", "Back to school", "Weekday installs, autumn prep"),
 ("October", "Storm season, Halloween", "Post replacements, storm-proofing"),
]
months = "\n".join(f"| {m} | {a} | {b} |" for m, a, b in MONTHS)

md = f"""# The Boundary Boys – 2-year marketing calendar

November 2026 to November 2028. Every seasonal moment has a theme and a suggested deal. Year 1 has a finished graphic with you in it for each one.

## How it works

- **Seasonal posts** (below) are the big moments: Black Friday, Christmas, Easter, Halloween and the rest. Each one comes with a deal.
- **Every other week** keep using the main calendar (`content-calendar.md`) and the post library: three posts a week, Monday, Wednesday and Friday.
- **Wednesdays** are your own job photos: before and after, posts going in, a gate shutting.
- **Post on the Boundary Boys page**, then share to your personal profile. Hashtags: `#TheBoundaryBoys #Southampton #Fencing` plus one for the occasion.
- **Boost the deal posts.** Put £20–30 behind each seasonal post for 3–4 days, targeted within 10 miles of Southampton. These are the ones that bring in work.

## The deals are suggestions

I've written every deal so it's simple and believable, but **you set the prices**. Before each one goes out, check:

- You can afford it on a typical job.
- It has an end date (each graphic shows one).
- People claim it by mentioning the post, so you can track which posts bring in work.

To change a deal, edit the line in `graphics/build_year.py` and re-render, or change the text on the graphic in Canva.

## Monthly themes (both years)

| Month | Moments | What to push |
|---|---|---|
{months}

## Year 1 – November 2026 to November 2027 (graphics done)

| Post date | Occasion | Headline | Deal | Caption | Graphic |
|---|---|---|---|---|---|
{rows1}

## Year 2 – November 2027 to November 2028 (themes and deals planned)

Graphics for year 2 can be built the same way once year 1 is running. By then you'll have real job photos to use too.

| Post date | Occasion | Headline idea | Deal idea |
|---|---|---|---|
{rows2}

## Dates worth knowing

- **Easter** moves every year: Sunday 28 March 2027, Sunday 16 April 2028.
- **Mother's Day (UK)**: Sunday 7 March 2027, Sunday 26 March 2028.
- **Father's Day**: Sunday 20 June 2027, Sunday 18 June 2028.
- **Bank holidays 2027**: 3 May, 31 May, 30 August. **2028**: 1 May, 29 May, 28 August.
- **Clocks go forward**: 28 March 2027, 26 March 2028.
"""
(here.parent / "content-calendar-2-years.md").write_text(md)
print(len(Y1), "year-1 posters;", len(Y2), "year-2 moments")
