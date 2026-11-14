"""Single source for The Boundary Boys marketing pack.

Every post lives in POSTS below: date, headline, punchline, caption.
Running this writes:
  all.html                 every poster (render with: node render.js)
  ../content-calendar.md   the dated calendar with captions

Copy rule: one gag per poster. White line = the line everyone knows.
Yellow line = the fence punchline. Tape = name, number, plain service line.
"""
import datetime, pathlib

here = pathlib.Path(__file__).parent
css = (here / "base.css").read_text()

SVC = "Fencing · Gates · Repairs · Southampton"
STORM = "Storm damage repairs · Southampton"
QUOTE = "Free quotes · Southampton"

BG = lambda a, b: f"background:radial-gradient(115% 65% at 50% 24%,{a} 0%,{b} 72%)"
DARK = ""
RED, GREEN, NAVY = BG("#5a1016", "#12060a"), BG("#1f4a2a", "#07130a"), BG("#1d3557", "#060b14")
PURPLE, TEAL, SKY = BG("#4b2a7a", "#0d0716"), BG("#143a3a", "#050d0d"), BG("#3f86c9", "#0a1b2e")
PINK, ORANGE, SEA, STORMY = BG("#c2337a", "#2a0718"), BG("#7a2a08", "#120502"), BG("#14506e", "#040f17"), BG("#3a4450", "#0b0d10")

BOARDS = lambda n, gaps=(): "".join('<i class="x"></i>' if i in gaps else "<i></i>" for i in range(n))
PROPS = {
    "none": "",
    "new": f'<div class="fence" style="left:50px;bottom:170px;height:420px">{BOARDS(5)}</div>',
    "gaps": f'<div class="fence" style="left:0;bottom:170px;height:420px">{BOARDS(6, (1, 3, 4))}</div>',
    "lean": f'<div class="fence" style="left:60px;bottom:200px;height:400px;transform:rotate(-24deg);transform-origin:bottom left">{BOARDS(4)}</div>',
    "row": f'<div class="fence" style="left:0;bottom:150px;height:400px">{BOARDS(15)}</div>',
    "flat": f'<div class="fence" style="left:470px;bottom:120px;height:400px;transform:rotate(-90deg);transform-origin:bottom left">{BOARDS(5)}</div>',
    "heart": '<svg viewBox="0 0 100 90" style="position:absolute;left:70px;bottom:230px;width:340px;z-index:2"><path d="M50 88 L8 44 C-8 24 12 -4 36 6 C44 10 48 16 50 22 C52 16 56 10 64 6 C88 -4 108 24 92 44 Z" fill="#e0262f"/></svg>',
    "grass": '<div style="position:absolute;left:0;right:0;bottom:150px;height:120px;background:linear-gradient(#4f9a35,#2f6b20);z-index:2"></div>',
    "ball": f'<div class="fence" style="left:0;bottom:170px;height:420px">{BOARDS(6, (2,))}</div>'
            '<div style="position:absolute;left:170px;bottom:440px;width:110px;height:110px;border-radius:50%;background:#d7f04a;z-index:3;box-shadow:inset -10px -10px 0 rgba(0,0,0,.15)"></div>',
    "fin": '<svg viewBox="0 0 500 300" style="position:absolute;left:0;bottom:150px;width:520px;z-index:2">'
           '<path d="M190 210 C210 120 250 50 320 20 C300 90 310 160 340 210 Z" fill="#2b3640"/>'
           '<path d="M0 210 C40 190 80 230 120 210 C160 190 200 230 240 210 C280 190 320 230 360 210 C400 190 440 230 500 210 L500 300 L0 300 Z" fill="#0d3a5c"/></svg>',
}

# (date, slug, white line, yellow line, tape line, background, prop, pose, extras, caption)
# pose: "level" / "nailgun" / "" (alternates).  extras: "hat", "snow", "rain", "check" (date to confirm)
POSTS = [
 ("2026-11-11", "on-the-level", "I'm on<br>the level.", "Your fence<br>isn't.", QUOTE, DARK, "lean", "level", "",
  "If your fence is leaning more than I am in this photo, give us a shout. Free quotes across Southampton. Call or message 07542 666563."),
 ("2026-11-13", "the-fence-and-the-furious", "The fence<br>and the furious.", "Fence down? Don't<br>get mad. Get us.", STORM, ORANGE, "row", "nailgun", "",
  "Fence gone over in the wind and you're fuming? Fair enough. Send us a photo and we'll tell you what it needs. 07542 666563."),
 ("2026-11-16", "im-a-fence", "I'm a fence…", "Get me out<br>of here!", "Old fences out. New ones in. Southampton.", GREEN, "lean", "", "",
  "Your fence has done its time. Vote it out. We take the old one away and put a proper one up. 07542 666563."),
 ("2026-11-20", "love-thy-neighbour", "Love thy<br>neighbour.", "From behind<br>a 6ft fence.", SVC, DARK, "new", "", "",
  "Lovely people, next door. You just don't need to see them every time you put the bins out. New fencing across Southampton. 07542 666563."),
 ("2026-11-23", "sitting-on-the-fence", "Sitting on<br>the fence?", "Get a quote.<br>It's free.", QUOTE, DARK, "row", "", "",
  "Been meaning to sort it for years? We'll come round, measure up and give you a price. No pressure. 07542 666563."),
 ("2026-11-27", "black-friday", "Black Friday:<br>50% off your fence.", "Cheers, wind.", STORM, "background:#000", "gaps", "", "",
  "Half your fence missing since the last storm? That's not a deal. We'll put the other half back. 07542 666563."),
 ("2026-11-30", "home-alone", "Home alone?", "Not with that<br>gate, you're not.", "Secure side gates · Southampton", GREEN, "new", "", "snow",
  "If your side gate doesn't shut, anyone can wander in. We fit gates that close, latch and lock. 07542 666563."),
 ("2026-12-07", "now-i-have-a-nail-gun", "Now I have<br>a nail gun.", "Ho. Ho. Ho.", "Get your fence done before Christmas", NAVY, "none", "nailgun", "hat",
  "Yes, it's a Christmas film. And yes, we've still got a few slots before Christmas. 07542 666563."),
 ("2026-12-14", "to-me-you-are-perfect", "To me, you<br>are perfect.", "Your fence,<br>not so much.", SVC, RED, "lean", "", "snow",
  "We think you're great. It's the fence we need to talk about. Now booking January. 07542 666563."),
 ("2026-12-21", "all-i-want-for-christmas", "All I want<br>for Christmas", "is a fence that<br>stands up.", "Now booking January · Southampton", RED, "none", "", "hat snow",
  "Merry Christmas from the Boundary Boys. If the wind gets your fence over the break, you know where we are. 07542 666563."),
 ("2026-12-28", "should-old-fence-posts-be-forgot", "Should old fence<br>posts be forgot?", "Yes. We take<br>them away.", "New year. New fence. Southampton.", DARK, "lean", "", "",
  "New year, new fence. We take the old one down, take it away and put up one that lasts. 07542 666563."),
 ("2027-01-04", "your-fence-post-is-a-traitor", "Your fence post<br>is a traitor.", "It let the whole<br>panel down.", "Rotten posts replaced · Southampton", TEAL, "lean", "", "",
  "It only takes one rotten post to bring the lot down. We find the traitor and replace it. 07542 666563."),
 ("2027-01-11", "you-shall-not-pass", "You shall<br>not pass.", "That's the whole<br>point of a fence.", SVC, DARK, "row", "", "",
  "Next door's dog. Stray footballs. The lad who cuts through your garden. None shall pass. 07542 666563."),
 ("2027-01-15", "unlike-your-ex", "Unlike<br>your ex,", "our posts<br>stay put.", "Concreted in. Built to stay.", DARK, "new", "", "",
  "Reliable. Solid. Still there in ten years. Every post concreted in properly. 07542 666563."),
 ("2027-01-18", "today-is-gonna-be-the-day", "Today is gonna<br>be the day", "you finally sort<br>that fence.", QUOTE, NAVY, "row", "", "",
  "Blue Monday. Cheer yourself up by getting one job off the list. Free quotes. 07542 666563."),
 ("2027-01-25", "mother-of-god", "Mother<br>of God.", "Look at the state<br>of that fence.", "Leaning fences fixed · Southampton", DARK, "lean", "level", "",
  "We're only interested in one thing, and that's catching bent fence posts. 07542 666563."),
 ("2027-02-01", "who-you-gonna-call", "Fence down?", "Who you<br>gonna call?", STORM, DARK, "lean", "nailgun", "",
  "Hint: it's us. Storm damage and fence repairs across Southampton. 07542 666563."),
 ("2027-02-05", "post-mortem", "Post-mortem.", "Cause of death:<br>no concrete.", "Posts set properly · Southampton", DARK, "lean", "", "",
  "When a post snaps at ground level, it was never set properly. Ours are concreted in. 07542 666563."),
 ("2027-02-09", "pancakes-should-be-flat", "Pancakes should<br>be flat.", "Fences<br>shouldn't.", STORM, DARK, "flat", "", "",
  "Happy Pancake Day. If your fence is flatter than your pancakes, give us a ring. 07542 666563."),
 ("2027-02-12", "roses-are-red", "Roses are red,<br>violets are blue,", "your fence fell over,<br>we'll fix it for you.", SVC, RED, "heart", "", "",
  "Who said romance was dead? Fence repairs and new fencing across Southampton. 07542 666563."),
 ("2027-02-15", "jurassic-park-had-fence-problems", "Jurassic Park had<br>fence problems.", "Don't be<br>Jurassic Park.", SVC, GREEN, "gaps", "", "",
  "They spared no expense. Except on the fencing. Get yours done properly. 07542 666563."),
 ("2027-02-22", "by-order-of-the-boundary-boys", "By order of the<br>Boundary Boys,", "that fence is<br>coming down.", "And a better one's going up", BG("#3a322a", "#0b0907"), "lean", "", "",
  "No fighting. Just fencing. Old one down, new one up. 07542 666563."),
 ("2027-03-01", "spring-has-sprung", "Spring has<br>sprung.", "So has your<br>fence panel.", "Spring bookings open · Southampton", SKY, "lean", "", "",
  "Garden season's coming. Get the fence sorted before the BBQ comes out. Spring slots go quickly. 07542 666563."),
 ("2027-03-05", "your-mum-called", "Your mum<br>called.", "She says sort<br>the fence.", QUOTE, BG("#4a1f4a", "#0e060e"), "lean", "", "",
  "Happy Mother's Day for Sunday. Do what your mum says. 07542 666563."),
 ("2027-03-15", "can-we-fix-it", "Can we<br>fix it?", "Yes we can.", "Fence repairs · Southampton", BG("#1d4f8a", "#060f1c"), "gaps", "", "",
  "Broken panel, wobbly post, gate that won't shut. Yes we can. 07542 666563."),
 ("2027-03-22", "clocks-go-forward", "The clocks<br>go forward.", "Your fence<br>shouldn't.", "Leaning fences fixed · Southampton", DARK, "lean", "level", "",
  "Clocks change this weekend. If your fence is already leaning forward, call us. 07542 666563."),
 ("2027-04-01", "the-invisible-fence", "New: the<br>invisible fence.", "Just kidding. Yours<br>blew down.", STORM, SKY, "grass", "", "",
  "April Fools. There's no such thing as an invisible fence, there's just the one that isn't there any more. 07542 666563."),
 ("2027-04-12", "its-not-going-to-happen", "Stop trying to make<br>that old fence happen.", "It's not going<br>to happen.", "New fencing · Southampton", PINK, "gaps", "", "",
  "You've patched it, propped it and tied it to the shed. It's time. 07542 666563."),
 ("2027-04-26", "in-my-swamp", "What are you doing<br>in my swamp?", "Get a fence.<br>Keep them out.", "Privacy fencing · Southampton", BG("#3d5a1a", "#0a1005"), "new", "", "",
  "Your garden, your rules. Privacy fencing across Southampton. 07542 666563."),
 ("2027-05-04", "may-the-fence-be-with-you", "May the fence<br>be with you.", "Ours will be.<br>For years.", SVC, "background:#000", "new", "", "snow",
  "Happy Star Wars Day. Built properly, so it stays with you. 07542 666563."),
 ("2027-05-10", "ill-never-let-go", "I'll never<br>let go.", "Every post we<br>concrete in.", "Concreted in. Built to stay.", SEA, "new", "", "",
  "Our posts don't let go. That's the concrete. 07542 666563."),
 ("2027-05-17", "nil-points", "Your fence:<br>nil points.", "Ours:<br>douze points.", SVC, PURPLE, "lean", "", "check",
  "Good evening Europe, this is Southampton calling. 07542 666563."),
 ("2027-05-24", "we-were-on-a-break", "We were<br>on a break!", "So is your<br>fence panel.", "Fence repairs · Southampton", PURPLE, "gaps", "", "",
  "Bank holiday BBQ this weekend and a broken panel? We'll get it fixed. 07542 666563."),
 ("2027-06-07", "ive-got-a-text", "I've got<br>a text!", "It says your<br>fence is down.", STORM, PINK, "lean", "", "check",
  "Send us a photo of your fence and we'll text you back a price. 07542 666563."),
 ("2027-06-18", "dad-said-hed-fix-it", "Dad said<br>he'd fix it.", "In 2019.", "Give him the day off. Call us.", DARK, "lean", "", "",
  "Happy Father's Day for Sunday. Let him off the hook. We'll do it. 07542 666563."),
 ("2027-06-28", "new-balls-please", "New balls,<br>please.", "And a fence that<br>keeps them in.", SVC, BG("#1f5a34", "#07140b"), "ball", "", "check",
  "Fed up of knocking next door to ask for the ball back? 07542 666563."),
 ("2027-07-12", "your-mission", "Your mission, should<br>you choose to accept it:", "stop ignoring<br>that fence.", QUOTE, DARK, "lean", "", "",
  "This message will not self-destruct. It'll just sit here until you ring us. 07542 666563."),
 ("2027-07-26", "a-bigger-fence", "You're gonna<br>need", "a bigger fence.", "6ft fencing fitted · Southampton", SEA, "fin", "", "",
  "Just when you thought it was safe to go back in the garden. Taller fencing for more privacy. 07542 666563."),
 ("2027-08-09", "to-the-boundary-and-beyond", "To the<br>boundary…", "and beyond!", SVC, SKY, "new", "", "",
  "From the front gate to the back fence and everything in between. 07542 666563."),
 ("2027-08-23", "no-soggy-bottoms", "No soggy<br>bottoms.", "Gravel boards<br>stop the rot.", "Ask us about gravel boards", BG("#1d5a5a", "#061414"), "new", "", "check",
  "Fences rot from the bottom up. A gravel board keeps the timber off the wet ground. 07542 666563."),
 ("2027-09-06", "kids-back-at-school", "Kids back<br>at school?", "Now sort<br>the fence.", QUOTE, DARK, "lean", "", "",
  "Peace and quiet at last. Time to get that job done. Free quotes. 07542 666563."),
 ("2027-09-20", "ours-get-a-ten", "That fence<br>gets a 2.", "Ours get<br>a 10.", SVC, BG("#5a1a6b", "#12051a"), "new", "", "check",
  "A disaster, darling. Let us show you a ten. 07542 666563."),
 ("2027-10-04", "the-names-post", "The name's<br>Post.", "Fence Post.", SVC, BG("#2a2f36", "#050607"), "new", "nailgun", "",
  "Licensed to drill. 07542 666563."),
 ("2027-10-18", "winter-is-coming", "Winter is<br>coming.", "Is your fence<br>ready?", "Book before the storms · Southampton", BG("#274a66", "#060d14"), "new", "", "snow",
  "Storm season starts now. If a post is wobbling in October, it won't be standing in January. 07542 666563."),
 ("2027-10-25", "the-scariest-thing", "This Halloween", "the scariest thing<br>is your fence.", SVC, BG("#2a1440", "#07030c"), "lean", "", "",
  "No costume needed. We'll make it less frightening. 07542 666563."),
 ("2027-11-05", "remember-remember", "Remember,<br>remember,", "to fix it by<br>December.", "Book now for winter · Southampton", DARK, "lean", "", "",
  "Old fence on the bonfire, new one up before the storms. 07542 666563."),
 ("storm", "blown-away", "Blown away?", "So was<br>your fence.", STORM, STORMY, "lean", "", "rain",
  "Last night's wind took a few fences with it. If yours is one of them, send us a photo. 07542 666563."),
]

# ---- Christmas run (added after the main list so existing posters keep their photo) ----
XMAS = "Book now for January · Southampton"
POSTS += [
 ("2026-12-02", "beginning-to-look-a-lot-like", "It's beginning to<br>look a lot like", "you need a<br>new fence.", QUOTE, GREEN, "lean", "level", "hat snow",
  "Everywhere you go, there's a panel hanging off. If it's yours, give us a ring. 07542 666563."),
 ("2026-12-04", "hes-making-a-list", "He's making<br>a list.", "Your fence<br>is on it.", "Get it fixed before Christmas", RED, "lean", "nailgun", "hat snow",
  "Naughty: the fence. Nice: us, fixing it before Christmas. A few slots left. 07542 666563."),
 ("2026-12-09", "elf-on-the-shelf", "Elf on<br>the shelf?", "Fence on<br>the floor.", STORM, GREEN, "flat", "level", "hat snow",
  "One of these is meant to be lying about the house. The other one isn't. 07542 666563."),
 ("2026-12-11", "last-christmas", "Last Christmas,<br>I gave you a quote.", "This year,<br>book it.", XMAS, RED, "new", "nailgun", "hat snow",
  "Still thinking about it from last year? Save yourself from tears. Now booking January. 07542 666563."),
 ("2026-12-16", "silent-night", "Silent night?", "Not with that<br>gate banging.", "Gates fixed and fitted · Southampton", NAVY, "new", "level", "hat snow",
  "All is calm, all is bright, apart from the side gate slamming at 3am. We'll sort it. 07542 666563."),
 ("2026-12-18", "santa-uses-the-chimney", "Santa uses<br>the chimney.", "Everyone else uses<br>your broken gate.", "Secure side gates · Southampton", RED, "gaps", "nailgun", "hat snow",
  "Only one visitor is welcome this Christmas. Keep the rest out with a gate that locks. 07542 666563."),
 ("2026-12-23", "driving-home-for-christmas", "Driving home<br>for Christmas?", "Come home to a<br>fence still standing.", XMAS, GREEN, "new", "level", "hat snow",
  "Top to toe in tailbacks, then a panel on the lawn. Not this year. 07542 666563."),
 ("2026-12-24", "merry-christmas", "Merry<br>Christmas", "from the<br>Boundary Boys.", "See you in the new year", RED, "none", "nailgun", "hat snow",
  "Thank you to everyone who had us round this year. Have a good one. If the wind gets your fence over Christmas, message us and we'll be round in January. 07542 666563."),
 ("storm", "the-grinch-stole-christmas", "The Grinch<br>stole Christmas.", "The wind stole<br>your fence.", STORM, GREEN, "gaps", "level", "hat snow",
  "One of them we can do something about. Send us a photo of the damage. 07542 666563."),
]


# ---------------------------------------------------------------------------
# Poster layout: real fence photo, owner waist up, tight two-line headline.
# ---------------------------------------------------------------------------
from build_twenty import me, fence, foot, wm, RATIO, CSS as TCSS

START = "2026-11-15"                      # first date still to post
POSTS = [p for p in POSTS if p[0] == "storm" or p[0] >= START]
OLD = "filter:grayscale(.55) sepia(.25) brightness(.72)"


def props(prop):
    band = fence(0, 900, 1080, 300)
    right = fence(470, 900, 610, 300)
    return {
        "none": band, "row": band, "new": band,
        "lean": fence(-60, 880, 330, 420, extra=f"transform:rotate(-16deg);transform-origin:right bottom;{OLD}", cap=False)
                + fence(250, 860, 230, 440, extra=f"transform:rotate(11deg);transform-origin:left bottom;{OLD}", cap=False) + right,
        "gaps": fence(0, 900, 150, 300, extra=OLD) + fence(230, 950, 110, 250, extra=f"transform:rotate(6deg);{OLD}", cap=False)
                + fence(420, 900, 660, 300, extra=OLD),
        "flat": fence(-20, 1060, 470, 140, extra=f"{OLD}", cap=False) + right,
        "grass": fence(-20, 1060, 470, 140, extra=f"{OLD}", cap=False) + right,
        "heart": band + '<svg viewBox="0 0 100 90" style="position:absolute;left:70px;top:610px;width:280px;z-index:3"><path d="M50 88 L8 44 C-8 24 12 -4 36 6 C44 10 48 16 50 22 C52 16 56 10 64 6 C88 -4 108 24 92 44 Z" fill="#e0262f"/></svg>',
        "ball": fence(0, 900, 180, 300) + fence(300, 900, 780, 300)
                + '<div class="abs" style="left:186px;top:760px;width:100px;height:100px;border-radius:50%;background:#d7f04a;z-index:3;box-shadow:inset -10px -10px 0 rgba(0,0,0,.15)"></div>',
        "fin": band + '<svg viewBox="0 0 500 300" style="position:absolute;left:0;top:640px;width:460px;z-index:1"><path d="M190 210 C210 120 250 50 320 20 C300 90 310 160 340 210 Z" fill="#2b3640"/><path d="M0 210 C40 190 80 230 120 210 C160 190 200 230 240 210 C280 190 320 230 360 210 C400 190 440 230 500 210 L500 300 L0 300 Z" fill="#0d3a5c"/></svg>',
    }[prop]


HAT = '<svg viewBox="0 0 120 100" style="width:100%"><path d="M12 78 C20 30 60 6 96 30 C80 34 96 60 104 78 Z" fill="#d81f2a"/><rect x="4" y="72" width="108" height="22" rx="11" fill="#fff"/><circle cx="100" cy="30" r="13" fill="#fff"/></svg>'
HEADX = {"level": .49, "nailgun": .63}


def poster(i, date, slug, white, yellow, tape, bg, prop, pose, extra, caption):
    pose = pose or ("level" if i % 2 else "nailgun")
    centre = prop in ("none", "row", "new")
    w = 560
    left = 260 if centre else 490
    full = w / RATIO[pose]
    top = 1200 - full * .64
    hat = ""
    if "hat" in extra:
        hw = full * .2
        hat = (f'<div class="abs" style="left:{left + w * HEADX[pose] - hw / 2:.0f}px;top:{top + full * .012 - hw * .55:.0f}px;'
               f'width:{hw:.0f}px;transform:rotate(-8deg);z-index:5">{HAT}</div>')
    layers = "".join(f'<div class="{c}"></div>' for c in ("snow", "rain") if c in extra)
    return f"""
<div class="p" id="{date}-{slug}" style="{bg}">{layers}
  <div class="hd" data-max="{top - 90:.0f}" style="text-align:{'center' if centre else 'left'}"><h1>{white}</h1><h1 class="yl">{yellow}</h1></div>
  {props(prop)}
  {me(pose, left, w, z=4)}{hat}
  {wm("right:24px;top:1078px")}
  {foot("fy" if i % 2 else "fk", tape)}
</div>"""


FOOT = '<div class="foot"><b>The Boundary Boys · 07542 666563</b><span>{}</span></div>'
SUB = '<div style="position:absolute;left:60px;right:60px;top:{}px;text-align:center;font:500 50px Oswald;text-transform:uppercase">{}</div>'
FRIDAY = f"""
<div class="p yel" id="friday-slots-left"><div class="head"><h1 style="font-size:200px">Slots left<br>this month:</h1></div>
  <div class="blank" style="left:290px;top:560px;width:500px;height:380px"></div>{SUB.format(990, "Message us today.")}{FOOT.format(QUOTE)}</div>
<div class="p yel" id="friday-review"><div class="head"><h1 style="font-size:200px">Don't take our<br>word for it.</h1></div>
  <div class="blank" style="left:90px;top:520px;width:900px;height:520px"></div>{FOOT.format(QUOTE)}</div>
<div class="p yel" id="friday-now-booking"><div class="head"><h1 style="font-size:200px">Now booking:</h1></div>
  <div class="blank" style="left:140px;top:420px;width:800px;height:300px"></div>{SUB.format(790, "Call or message for a free quote.")}{FOOT.format(SVC)}</div>
<div class="p yel" id="friday-christmas-dates"><div class="head"><h1 style="font-size:200px">Last day before<br>Christmas:</h1></div>
  <div class="blank" style="left:140px;top:500px;width:800px;height:200px"></div>
  <div style="position:absolute;left:60px;top:760px;font:400 150px/1 Anton;text-transform:uppercase">Back on:</div>
  <div class="blank" style="left:140px;top:940px;width:800px;height:200px"></div>{FOOT.format("Merry Christmas · Southampton")}</div>
<div class="p yel" id="friday-send-us-a-photo"><div class="head"><h1 style="font-size:200px">Send us a photo<br>of your fence.</h1>
  <h1 style="font-size:200px;margin-top:30px;color:#fff;-webkit-text-stroke:3px #0b0b0b">We'll send you<br>a price.</h1></div>{FOOT.format(QUOTE)}</div>"""


EXTRA_CSS = """
.hd{position:absolute;left:60px;right:60px;top:56px;z-index:6}
.hd h1{font:400 170px/.95 Anton;text-transform:uppercase;white-space:nowrap;letter-spacing:.5px;color:#fff}
.hd .yl{color:#FFD84A;margin-top:14px}
.yel .head{position:absolute;left:60px;right:60px;top:60px}
.yel .head h1{white-space:nowrap;line-height:.95}
"""
FIT = """<script>
document.fonts.ready.then(()=>{
  document.querySelectorAll('.hd, .yel .head').forEach(hd=>{
    const hs=[...hd.querySelectorAll('h1')], fs=h=>parseFloat(getComputedStyle(h).fontSize);
    hs.forEach(h=>{while(h.scrollWidth>hd.clientWidth+1&&fs(h)>40)h.style.fontSize=(fs(h)-2)+'px'});
    let g=0; while(hd.dataset.max&&hd.offsetHeight>+hd.dataset.max-56&&g++<80) hs.forEach(h=>h.style.fontSize=(fs(h)*.97)+'px');
  });
  document.body.dataset.ready='1';
});</script>"""

html = f"""<!doctype html>
<html lang="en"><head><meta charset="utf-8"><title>The Boundary Boys – calendar posters</title>
<link href="https://fonts.googleapis.com/css2?family=Anton&family=Oswald:wght@400;500;600;700&display=swap" rel="stylesheet">
<style>{css}{TCSS}{EXTRA_CSS}</style></head>
<body>
{"".join(poster(i, *p) for i, p in enumerate(POSTS))}
{FRIDAY}
{FIT}
</body></html>
"""
(here / "all.html").write_text(html)

# ---------------------------------------------------------------------------
# Calendar: dated posts first, evergreen posts fill free Wednesdays and Fridays.
# ---------------------------------------------------------------------------
TWENTY = [
 ("01-straighten-up", "Straighten up", "Monday morning. Straighten up. The fence, not you, you're fine. If yours is leaning, give us a shout. 07542 666563"),
 ("02-selling-up", "Selling up?", "Selling the house? First thing buyers clock is a fence hanging off. Get it sorted before the photos go up. 07542 666563"),
 ("03-before-after", "Before and after", "Before: held up by the wheelie bin. After: held up by concrete. Bit of a difference. 07542 666563"),
 ("04-the-text", "The text from next door", "We've all had this text off next door. Save yourself the awkward chat and ring us first. 07542 666563"),
 ("05-caution", "Caution: fence may fall", "If your fence is one gust away from landing in next door's, now's the time to ring. 07542 666563"),
 ("06-fence-facts", "Fence facts", "All the good stuff, none of the wobble. Every post concreted in. 07542 666563"),
 ("07-guilty", "Guilty as charged", "Guilty. Every fence we put up makes next door jealous. Sorry, not sorry. 07542 666563"),
 ("08-quiz", "Quiz", "If you didn't say A, we need to talk. Phone a friend. Preferably us. 07542 666563"),
 ("09-fight-night", "Fight night", "Storm season is here and we're ready for it. Are your fence posts? 07542 666563"),
 ("10-employee-of-the-month", "Employee of the month", "Employee of the month. Again. Nobody else even got nominated. 07542 666563"),
 ("11-pisa", "Pisa", "Pisa's been leaning for 800 years and people pay to see it. Nobody's paying to see yours. 07542 666563"),
 ("12-recipe", "Nan's recipe", "Nan's recipe for a fence that lasts. Dig deep, concrete it in, don't skimp. Brew is not optional. 07542 666563"),
 ("13-school-report", "School report", "Your fence's school report is in and it's not good. Must try harder. Or ring us. 07542 666563"),
 ("14-storm-bingo", "Storm bingo", "How many have you ticked off this winter? Full house, give us a ring. 07542 666563"),
 ("15-fence-o-scope", "Fence-o-scope", "The stars say a tall bearded stranger is going to fix your fence. The stars are right. 07542 666563"),
 ("16-scratch-and-win", "Scratch and win", "Everyone's a winner. Match three, get a fence that stands up. 07542 666563"),
 ("17-instagram-vs-reality", "Instagram vs reality", "Your fence on Instagram vs your fence in real life. We'll make them match. 07542 666563"),
 ("18-instructions", "How to get a new fence", "Easiest flat pack you'll ever do. No Allen key, no swearing. 07542 666563"),
 ("19-receipt", "The receipt", "What you actually get when you ring us. Peace, quiet, and a fence that lasts. 07542 666563"),
 ("20-now-playing", "Now playing", "On repeat round Southampton this week. 07542 666563"),
]
STYLES = [
 ("01-wanted", "Wanted", "Wanted: your old fence, dead or leaning. Reward: a new one that actually stands up. 07542 666563"),
 ("02-fence-shocker", "Fence shocker", "Breaking news from Southampton. Local man can't walk past a wonky fence. Good news for you. 07542 666563"),
 ("03-signing-of-the-season", "Signing of the season", "Signing of the season. Zero wonky fences, plenty of tea breaks. 07542 666563"),
 ("04-missing", "Missing fence", "Missing: one garden fence. Last seen heading into next door's in the wind. If found, don't bother. Ring us. 07542 666563"),
 ("05-pow", "Pow!", "Pow. Another fence sorted in Southampton. Who's next? 07542 666563"),
 ("06-the-postfather", "The Postfather", "We're gonna make you a fence you can't refuse. 07542 666563"),
 ("07-never-gonna", "Never gonna give you up", "Never gonna give you up. Never gonna let your fence down. 07542 666563"),
 ("08-weather", "Fence weather", "Tonight: strong winds. Tomorrow: a 100% chance of us. If yours goes over, send us a photo. 07542 666563"),
 ("09-swipe-right", "Swipe right", "Looking for something long term? Swipe right. 07542 666563"),
 ("10-no-concrete-no-fence", "No concrete, no fence", "No pain, no gain. No concrete, no fence. Every post we put in is concreted. 07542 666563"),
]
QUEUE = []
for a, b in zip(TWENTY, STYLES + [None] * 10):
    QUEUE.append(("graphics/exports/twenty/" + a[0] + ".png", a[1], a[2]))
    if b:
        QUEUE.append(("graphics/exports/styles/" + b[0] + ".png", b[1], b[2]))

plain = lambda s: s.replace("<br>", " ")
D = datetime.date.fromisoformat
slots = {}
slots[D(START)] = ("graphics/exports/2026-11-15-sunday-roast.png", "Sunday roast? Your fence is toast.",
                   "Sunday roast? Lovely. Shame about the fence, that's toast. Have a look out the window while the spuds are in. If it's leaning, give us a shout tomorrow. 07542 666563", "")
for d, slug, w, y, tape, bg, prop, pose, extra, cap in POSTS:
    if d != "storm":
        slots[D(d)] = (f"graphics/exports/{d}-{slug}.png", f"{plain(w)} {plain(y)}", cap, " *(check date)*" if "check" in extra else "")
# "Straighten up" says Monday morning, so it goes on a free Monday rather than a Wednesday.
mon = next(q for q in QUEUE if "straighten-up" in q[0]); QUEUE.remove(mon)
slots[D("2027-03-08")] = (*mon, "")
skip = {D("2026-12-25"), D("2026-12-26"), D("2027-01-01")}
day = D(START)
while QUEUE:
    if day.weekday() in (2, 4) and day not in slots and day not in skip:
        f, t, c = QUEUE.pop(0)
        slots[day] = (f, t, c, "")
    day += datetime.timedelta(days=1)
last_evergreen = day

rows = "\n".join(f"| {d.strftime('%a %-d %b %Y')}{n} | **{t}** | {c} | `{f}` |" for d, (f, t, c, n) in sorted(slots.items()))
CAPS = {p[1]: p[9] for p in POSTS}
md = f"""# The Boundary Boys – content calendar

15 November 2026 to 5 November 2027. Every post below has a finished graphic and a caption, ready to go.

## How to use it

- **Post on the Boundary Boys page**, then share it to your personal profile.
- **Every graphic** has a real fence, you from the waist up, the name, the number and the SB Media watermark.
- **Hashtags for every post:** `#TheBoundaryBoys #Southampton #Fencing #FenceRepair`
- **Files** are in the `marketing` folder. The path for each post is in the last column.

## The week

- **Up to {last_evergreen.strftime('%-d %B %Y')}:** a finished post every Monday, Wednesday and Friday, plus the odd extra on a special day.
- **After that:** the Monday post is still ready every week or two. Wednesdays are for your own job photos, and Fridays use the yellow templates in `graphics/exports/` (`friday-*.png`), which you fill in Canva.

## After a storm

The morning after a named storm, swap that day's post for:

- **Most of the year:** `graphics/exports/storm-blown-away.png`. Caption: "{CAPS['blown-away']}"
- **In December:** `graphics/exports/storm-the-grinch-stole-christmas.png`. Caption: "{CAPS['the-grinch-stole-christmas']}"

Put £10–20 behind it for 48 hours.

## Christmas dates

Fill in `graphics/exports/friday-christmas-dates.png` with your last working day and your first day back, and post it around 14 December.

## Every post

| Date | Post | Caption | File |
|---|---|---|---|
{rows}

## Before you post

- **Dates marked "check date"** follow TV shows whose 2027 dates aren't announced yet (Eurovision, Love Island, Wimbledon, Bake Off, Strictly). Move them to match.
- **Claims to confirm:** free quotes, old fence taken away, every post concreted in, 6ft fencing, gravel boards, lockable side gates. Change any line that isn't true for you.
- **When your real photos arrive**, broken fences and finished jobs will replace the fence texture on every graphic.
"""
(here.parent / "content-calendar.md").write_text(md)
print(len(POSTS), "dated posters;", len(slots), "calendar rows; evergreen runs to", last_evergreen)
