import math, sys
INK="#0B1726"; AMB="#FFB020"; WHITE="#FFFFFF"
cx, cy = 512, 600
R, SW = 240, 134          # ring centreline radius, stroke width
ro, ri = R+SW/2, R-SW/2
def P(r, deg): a=math.radians(deg); return (cx+r*math.cos(a), cy+r*math.sin(a))
def f(p): return f"{p[0]:.1f} {p[1]:.1f}"
def mark(fg=WHITE, accent=AMB, cut=INK):
    a0, a1 = -48, 0      # opening between these angles (top-right)
    # G bowl as a filled annular sector (long way round from a0 to a1)
    o0,o1,i0,i1 = P(ro,a0),P(ro,a1),P(ri,a0),P(ri,a1)
    bowl = (f"M {f(o0)} A {ro} {ro} 0 1 0 {f(o1)} L {f(i1)} A {ri} {ri} 0 1 1 {f(i0)} Z")
    bar_h = 96
    cross = f'<rect x="{cx+92}" y="{cy-80}" width="{ro-92}" height="{bar_h}" rx="0"/>'
    # speech tail, bottom-left
    t1, t2 = P(ro-40, 112), P(ro-40, 170)
    apex = (cx-ro+18, cy+ro+64)
    tail = f"M {f(t1)} L {f(apex)} L {f(t2)} Z"
    # voice bars
    bars=[]
    hs=[40,82,126,82,40]; w=22; gap=36; x0=cx-46-2*gap
    for k,h in enumerate(hs):
        x=x0+k*gap-w/2
        bars.append(f'<rect x="{x:.1f}" y="{cy-h/2:.1f}" width="{w}" height="{h}" rx="{w/2}"/>')
    # hard hat (local coords, then rotated)
    hb = int(cy - ro + 62)   # brim crosses the G's crown, like a hat on a head
    dome = f"M {cx-206} {hb-12} A 206 176 0 0 1 {cx+206} {hb-12} Z"
    brim = (f"M {cx-236} {hb-20} H {cx+214} Q {cx+292} {hb-20} {cx+300} {hb+4} "
            f"Q {cx+302} {hb+20} {cx+270} {hb+20} H {cx-236} A 20 20 0 0 1 {cx-236} {hb-20} Z")
    hat = f'''
  <g transform="rotate(-5 {cx} {hb})">
    <clipPath id="dome"><path d="{dome}"/></clipPath>
    <path d="{brim}" fill="{cut}" stroke="{cut}" stroke-width="40" stroke-linejoin="round"/>
    <path d="{dome}" fill="{accent}" stroke="{cut}" stroke-width="40" paint-order="stroke"/>
    <g clip-path="url(#dome)" fill="none" stroke="{cut}" stroke-width="24" stroke-linecap="round">
      <path d="M {cx-52} {hb-200} Q {cx-96} {hb-110} {cx-88} {hb-24}"/>
      <path d="M {cx+44} {hb-200} Q {cx+84} {hb-110} {cx+78} {hb-24}"/>
    </g>
    <path d="{brim}" fill="{accent}"/>
  </g>'''
    # gap under the brim cut out of the G
    return f'''<g fill="{fg}"><path d="{bowl}"/>{cross}<path d="{tail}" stroke="{fg}" stroke-width="10" stroke-linejoin="round"/></g>
  <g fill="{accent}">{''.join(bars)}</g>{hat}'''
def svg(bg=INK, fg=WHITE, accent=AMB, cut=None, rounded=False, scale=1.0):
    cut = cut or (bg if bg!='none' else INK)
    bgel = '' if bg=='none' else (f'<rect width="1024" height="1024" rx="{230 if rounded else 0}" fill="{bg}"/>')
    t = '' if scale==1 else f' transform="translate({512*(1-scale):.1f} {512*(1-scale):.1f}) scale({scale})"'
    # vertical optical centring: art spans ~y 80..960 → shift up slightly
    return f'''<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1024 1024" width="1024" height="1024">
  {bgel}<g{t}><g transform="translate(512 512) scale(0.9) translate(-528 -568)">{mark(fg,accent,cut)}</g></g>
</svg>'''
import os
out=os.path.dirname(os.path.abspath(__file__))+"/"
open(out+"graft-icon.svg","w").write(svg())                         # app icon, full-bleed
open(out+"graft-icon-rounded.svg","w").write(svg(rounded=True))     # for web/presentations
open(out+"graft-mark.svg","w").write(svg(bg='none', scale=1))       # transparent, for dark bgs (hat cut lines ink)
open(out+"graft-mark-light.svg","w").write(svg(bg='none', fg=INK, accent="#F5A300", cut="#FFFFFF"))
open(out+"graft-mark-mono.svg","w").write(svg(bg='none', fg="#000000", accent="#000000", cut="#FFFFFF"))
