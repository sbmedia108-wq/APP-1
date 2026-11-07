import math, sys
INK="#0B1726"; AMB="#FFB020"; WHITE="#FFFFFF"
cx, cy = 512, 600
R, SW = 240, 134          # ring centreline radius, stroke width
ro, ri = R+SW/2, R-SW/2
def P(r, deg): a=math.radians(deg); return (cx+r*math.cos(a), cy+r*math.sin(a))
def f(p): return f"{p[0]:.1f} {p[1]:.1f}"
def mark(fg=WHITE, accent=AMB, cut=INK):
    a0, a1 = -38, 0      # opening between these angles (top-right)
    # G bowl as a filled annular sector (long way round from a0 to a1)
    o0,o1,i0,i1 = P(ro,a0),P(ro,a1),P(ri,a0),P(ri,a1)
    bowl = (f"M {f(o0)} A {ro} {ro} 0 1 0 {f(o1)} L {f(i1)} A {ri} {ri} 0 1 1 {f(i0)} Z")
    bar_h = 116
    cross = f'<rect x="{cx+92}" y="{cy-bar_h+2}" width="{ro-92}" height="{bar_h}" rx="0"/>'
    # speech tail, bottom-left
    t1, t2 = P(ro-40, 112), P(ro-40, 170)
    apex = (cx-ro+18, cy+ro+64)
    tail = f"M {f(t1)} L {f(apex)} L {f(t2)} Z"
    # voice bars
    bars=[]
    hs=[64,128,196,128,64]; w=28; gap=46; x0=cx-62-2*gap
    for k,h in enumerate(hs):
        x=x0+k*gap-w/2
        bars.append(f'<rect x="{x:.1f}" y="{cy-h/2:.1f}" width="{w}" height="{h}" rx="{w/2}"/>')
    # hard hat (local coords, then rotated)
    hb = int(cy - ro - 6)   # brim centre y, resting on the G
    dome = f"M {cx-246} {hb-14} A 246 196 0 0 1 {cx+246} {hb-14} Z"
    brim = (f"M {cx-268} {hb-18} H {cx+250} Q {cx+322} {hb-18} {cx+330} {hb+4} "
            f"Q {cx+332} {hb+18} {cx+300} {hb+18} H {cx-268} A 18 18 0 0 1 {cx-268} {hb-18} Z")
    hat = f'''
  <g transform="rotate(-9 {cx} {hb})">
    <clipPath id="dome"><path d="{dome}"/></clipPath>
    <path d="{dome}" fill="{accent}"/>
    <g clip-path="url(#dome)" fill="none" stroke="{cut}" stroke-width="24" stroke-linecap="round">
      <path d="M {cx-62} {hb-230} Q {cx-112} {hb-120} {cx-104} {hb-26}"/>
      <path d="M {cx+50} {hb-230} Q {cx+96} {hb-120} {cx+92} {hb-26}"/>
    </g>
    <path d="{brim}" fill="{accent}"/>
  </g>'''
    # gap under the brim cut out of the G
    gapcut = f'<rect x="0" y="0" width="1024" height="{hb+44}" transform="rotate(-9 {cx} {hb})"/>'
    return f'''<defs><mask id="m"><rect width="1024" height="1024" fill="#fff"/><g fill="#000">{gapcut}</g></mask></defs>
  <g fill="{fg}" mask="url(#m)"><path d="{bowl}"/>{cross}<path d="{tail}" stroke="{fg}" stroke-width="10" stroke-linejoin="round"/></g>
  <g fill="{accent}">{''.join(bars)}</g>{hat}'''
def svg(bg=INK, fg=WHITE, accent=AMB, cut=None, rounded=False, scale=1.0):
    cut = cut or (bg if bg!='none' else INK)
    bgel = '' if bg=='none' else (f'<rect width="1024" height="1024" rx="{230 if rounded else 0}" fill="{bg}"/>')
    t = '' if scale==1 else f' transform="translate({512*(1-scale):.1f} {512*(1-scale):.1f}) scale({scale})"'
    # vertical optical centring: art spans ~y 80..960 → shift up slightly
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  {bgel}<g{t}><g transform="translate(520 518) scale(0.84) translate(-540 -515)">{mark(fg,accent,cut)}</g></g>
</svg>'''
import os
out=os.path.dirname(os.path.abspath(__file__))+"/"
open(out+"graft-icon.svg","w").write(svg())                         # app icon, full-bleed
open(out+"graft-icon-rounded.svg","w").write(svg(rounded=True))     # for web/presentations
open(out+"graft-mark.svg","w").write(svg(bg='none', scale=1))       # transparent, for dark bgs (hat cut lines ink)
open(out+"graft-mark-light.svg","w").write(svg(bg='none', fg=INK, accent="#F5A300", cut="#FFFFFF"))
open(out+"graft-mark-mono.svg","w").write(svg(bg='none', fg="#000000", accent="#000000", cut="#FFFFFF"))
