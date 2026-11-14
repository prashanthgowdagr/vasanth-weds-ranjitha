"""Generates the original flower artwork (SVG) used for the glass-garden background,
the side edges and the flower gate. Run: python3 tools/gen_flowers.py"""
import math, random, os
OUT = os.path.join(os.path.dirname(__file__), "..", "site", "img")

DEFS = '''<defs>
<filter id="paint" x="-10%" y="-10%" width="120%" height="120%"><feTurbulence type="fractalNoise" baseFrequency="0.025" numOctaves="2" seed="3" result="n"/><feDisplacementMap in="SourceGraphic" in2="n" scale="5"/><feGaussianBlur stdDeviation="0.5"/></filter>
<filter id="soft" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="16"/></filter>
<filter id="soft2" x="-20%" y="-20%" width="140%" height="140%"><feGaussianBlur stdDeviation="7"/></filter>
<linearGradient id="pg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#ec9bb1"/><stop offset=".55" stop-color="#f7cbd6"/><stop offset="1" stop-color="#fff2f4"/></linearGradient>
<linearGradient id="pg2" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#f3b0c1"/><stop offset=".6" stop-color="#fbd9e1"/><stop offset="1" stop-color="#fffafa"/></linearGradient>
<linearGradient id="wg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#efe0bd"/><stop offset=".5" stop-color="#fff9ec"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
<linearGradient id="l1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#2f6a45"/><stop offset="1" stop-color="#6aa15a"/></linearGradient>
<linearGradient id="l2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#4c8a58"/><stop offset="1" stop-color="#a6cf88"/></linearGradient>
<linearGradient id="l3" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#3b7f6a"/><stop offset="1" stop-color="#8dc0a0"/></linearGradient>
<linearGradient id="s1" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#7c9d68"/><stop offset="1" stop-color="#b8d09c"/></linearGradient>
<linearGradient id="s2" x1="0" y1="0" x2="1" y2="0"><stop offset="0" stop-color="#93b27c"/><stop offset="1" stop-color="#cfdfb3"/></linearGradient>
<linearGradient id="mg" x1="0" y1="1" x2="0" y2="0"><stop offset="0" stop-color="#efe4c4"/><stop offset=".45" stop-color="#fffaf0"/><stop offset="1" stop-color="#ffffff"/></linearGradient>
</defs>'''

def leaf(x, y, L, rot, g="l1", op=1):
    w = L * .26
    return (f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot:.1f})" opacity="{op}">'
            f'<path d="M0 0C{L*.2:.1f} {-w:.1f} {L*.75:.1f} {-w*.9:.1f} {L} 0C{L*.75:.1f} {w*.9:.1f} {L*.2:.1f} {w:.1f} 0 0Z" fill="url(#{g})"/>'
            f'<path d="M0 0Q{L*.5:.1f} {-w*.12:.1f} {L*.95:.1f} 0" stroke="#d9efd0" stroke-width="{max(.8, L*.012):.1f}" fill="none" opacity=".6"/></g>')

def petal(l, w, fill, op):
    return (f'<path d="M0 0C{-w:.1f} {-l*.2:.1f} {-w*1.15:.1f} {-l*.85:.1f} 0 {-l:.1f}C{w*1.15:.1f} {-l*.85:.1f} {w:.1f} {-l*.2:.1f} 0 0Z" fill="url(#{fill})" opacity="{op}" '
            f'stroke="#d97a98" stroke-opacity=".25" stroke-width=".8"/>')

def peony(x, y, R, rnd, white=False):
    rings = [(11, 1.0, "wg" if white else "pg", .95), (9, .74, "wg" if white else "pg2", .97), (7, .5, "wg" if white else "pg2", 1)]
    s = f'<g transform="translate({x:.1f} {y:.1f})">'
    for n, sc, g, op in rings:
        off = rnd.uniform(0, 360)
        for k in range(n):
            a = off + k * 360 / n + rnd.uniform(-6, 6)
            L = R * sc * rnd.uniform(.92, 1.06)
            s += f'<g transform="rotate({a:.1f})">{petal(L, L*.5, g, op)}</g>'
    s += f'<circle r="{R*.1:.1f}" fill="#f3d675" opacity=".95"/><circle r="{R*.2:.1f}" fill="none" stroke="#f3d675" stroke-opacity=".5" stroke-width="{R*.05:.1f}" stroke-dasharray="2 3"/></g>'
    return s

def jasmine(x, y, R, rnd):
    s = f'<g transform="translate({x:.1f} {y:.1f}) rotate({rnd.uniform(0,72):.1f})">'
    for k in range(5):
        s += f'<ellipse cx="0" cy="{-R*.5:.1f}" rx="{R*.3:.1f}" ry="{R*.52:.1f}" transform="rotate({k*72})" fill="#fff" stroke="#dfe8cf" stroke-width=".8"/>'
    s += f'<circle r="{R*.16:.1f}" fill="#e8e49a"/>' + ''.join(f'<circle cx="{math.cos(a)*R*.2:.1f}" cy="{math.sin(a)*R*.2:.1f}" r="{R*.04:.1f}" fill="#d6a93f"/>' for a in [0, 1.3, 2.6, 3.9, 5.2]) + '</g>'
    return s

def sprig(x, y, rnd, n=7, length=170, ang=-60, scale=1):
    """a jasmine sprig: curved stem with small leaves, buds and flowers"""
    ex, ey = x + math.cos(math.radians(ang)) * length, y + math.sin(math.radians(ang)) * length
    cx, cy = (x + ex) / 2 + rnd.uniform(-30, 30), (y + ey) / 2 + rnd.uniform(-30, 30)
    s = f'<path d="M{x:.1f} {y:.1f}Q{cx:.1f} {cy:.1f} {ex:.1f} {ey:.1f}" stroke="#6f9a58" stroke-width="2.4" fill="none"/>'
    for i in range(n):
        t = (i + 1) / (n + 1)
        px = (1-t)**2*x + 2*(1-t)*t*cx + t*t*ex; py = (1-t)**2*y + 2*(1-t)*t*cy + t*t*ey
        side = 1 if i % 2 else -1
        s += leaf(px, py, 26*scale, ang + side * rnd.uniform(40, 80), rnd.choice(["l2", "l3"]))
        if i % 2 == 0: s += jasmine(px + side * 8, py + side * 6, 11 * scale, rnd)
    s += jasmine(ex, ey, 13 * scale, rnd) + f'<ellipse cx="{ex+10:.1f}" cy="{ey-8:.1f}" rx="3.5" ry="6" fill="#fffbe8" stroke="#e5e8c8"/>'
    return s

def cluster(rnd, w, h, density=1.0, left_bias=True, white_ratio=.35):
    items = []
    n = int(10 * density)
    for _ in range(n * 2):
        items.append(("leaf", rnd.uniform(-60, w*.8), rnd.uniform(0, h), rnd.uniform(70, 150), rnd.uniform(0, 360)))
    parts = []
    for _, x, y, L, r in items:
        parts.append(leaf(x, y, L, r, rnd.choice(["l1", "l1", "l2", "l3"]), .96))
    for _ in range(int(7*density)):
        x = rnd.uniform(-60, w*.55) if left_bias else rnd.uniform(0, w); y = rnd.uniform(0, h)
        parts.append(sprig(x, y, rnd, ang=rnd.uniform(-170, -10), length=rnd.uniform(110, 200)))
    for _ in range(int(6*density)):
        x = rnd.uniform(-70, w*.5); y = rnd.uniform(20, h-20)
        parts.append(peony(x, y, rnd.uniform(48, 90), rnd, white=rnd.random() < white_ratio))
    for _ in range(int(9*density)):
        x = rnd.uniform(-30, w*.6); y = rnd.uniform(0, h)
        parts.append(jasmine(x, y, rnd.uniform(16, 26), rnd))
    return "".join(parts)

def write(path, w, h, body, extra=""):
    full = os.path.join(OUT, path); os.makedirs(os.path.dirname(full), exist_ok=True)
    open(full, "w").write(f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}">{DEFS}{extra}{body}</svg>')

# 1) blurred painterly garden background (portrait, covers screen)
r = random.Random(11); W, H = 900, 1600
b = '<defs><linearGradient id="base" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#a5c28d"/><stop offset=".5" stop-color="#c9ddb2"/><stop offset="1" stop-color="#9dbd88"/></linearGradient></defs>'
b += f'<rect width="{W}" height="{H}" fill="url(#base)"/><g filter="url(#soft)">'
for _ in range(26): b += leaf(r.uniform(-100, W), r.uniform(0, H), r.uniform(220, 420), r.uniform(0, 360), r.choice(["l1", "l2", "l3"]), .9)
for _ in range(15):
    x, y, R = r.uniform(0, W), r.uniform(0, H), r.uniform(120, 230)
    b += peony(x, y, R, r, white=r.random() < .5)
b += '</g>'
write("bg/garden.svg", W, H, b)

# 2) sharp edge clusters (left side; mirrored with CSS for the right)
r = random.Random(5)
write("decor/edge.svg", 420, 1100, f'<g filter="url(#paint)">{cluster(r, 420, 1100, 2.4)}</g>')

# 3) flower gate door (left door; the right one is mirrored). Dense and lush.
r = random.Random(23); Wd, Hd = 460, 1000
d = f'<defs><linearGradient id="dg" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#9fc08a"/><stop offset=".55" stop-color="#6f9f66"/><stop offset="1" stop-color="#4d7f55"/></linearGradient></defs><rect width="{Wd}" height="{Hd}" fill="url(#dg)"/>'
d += '<g opacity=".25">' + ''.join(f'<rect x="{x}" y="0" width="3" height="{Hd}" fill="#fff"/>' for x in range(30, Wd, 52)) + '</g>'
d += f'<g filter="url(#paint)">{cluster(r, Wd * 1.7, Hd, 2.6, left_bias=False, white_ratio=.5)}</g>'
d += f'<rect x="{Wd-6}" y="0" width="6" height="{Hd}" fill="#fff" opacity=".55"/>'
write("decor/door.svg", Wd, Hd, d)

# 4) white-flower footer strip (spirea/jasmine clusters, buds, magnolias, sage leaves)
def magnolia(x, y, sc, rnd, rot=0):
    g = f'<g transform="translate({x:.1f} {y:.1f}) rotate({rot}) scale({sc})">'
    for k, (a, sx) in enumerate([(-75, .8), (75, .8), (-48, .92), (48, .92), (-22, 1), (22, 1), (0, 1.05)]):
        g += f'<ellipse cx="0" cy="-30" rx="20" ry="36" transform="rotate({a}) scale({sx})" fill="url(#mg)" stroke="#e5dcc0" stroke-width=".9"/>'
    g += '<circle cy="-10" r="9" fill="#f1dc8a"/>' + ''.join(f'<path d="M0 -10L{math.cos(t)*16:.1f} {-10+math.sin(t)*16:.1f}" stroke="#e3b43e" stroke-width="1.4"/><circle cx="{math.cos(t)*17:.1f}" cy="{-10+math.sin(t)*17:.1f}" r="1.9" fill="#e9bd42"/>' for t in [i*math.pi/6 for i in range(12)]) + '</g>'
    return g

def bud(x, y, r, rnd):
    return (f'<g transform="translate({x:.1f} {y:.1f}) rotate({rnd.uniform(-20,20):.0f})"><ellipse rx="{r}" ry="{r*1.1:.1f}" fill="#fbfae9" stroke="#d6dcb8" stroke-width=".9"/>'
            f'<path d="M{-r*.6:.1f} {r*.9:.1f}Q0 {r*1.5:.1f} {r*.6:.1f} {r*.9:.1f}" fill="#a9c58a"/></g>')

def bud_sprig(x, y, ang, L, rnd):
    ex, ey = x + math.cos(math.radians(ang)) * L, y + math.sin(math.radians(ang)) * L
    cx, cy = (x + ex) / 2 + rnd.uniform(-22, 22), (y + ey) / 2 + rnd.uniform(-10, 10)
    out = f'<path d="M{x:.1f} {y:.1f}Q{cx:.1f} {cy:.1f} {ex:.1f} {ey:.1f}" stroke="#86a56f" stroke-width="2.2" fill="none"/>'
    for t in (.35, .55, .75):
        px = (1-t)**2*x + 2*(1-t)*t*cx + t*t*ex; py = (1-t)**2*y + 2*(1-t)*t*cy + t*t*ey
        out += f'<path d="M{px:.1f} {py:.1f}L{px+rnd.uniform(-26,26):.1f} {py-rnd.uniform(6,22):.1f}" stroke="#86a56f" stroke-width="1.6"/>' + bud(px + rnd.uniform(-26,26), py - rnd.uniform(8,24), rnd.uniform(5.5, 8), rnd)
    out += bud(ex, ey, 8, rnd) + bud(ex + 12, ey + 8, 6, rnd)
    return out

def dome(cx, cy, rx, ry, n, rnd):
    out = ''
    for _ in range(n):
        a = rnd.uniform(math.pi, 2 * math.pi); rr = math.sqrt(rnd.random())
        out += jasmine(cx + math.cos(a) * rx * rr, cy + math.sin(a) * ry * rr + ry * .3, rnd.uniform(8, 13), rnd)
    return out

r = random.Random(41); Wf, Hf = 800, 290
f = '<g filter="url(#paint)">'
for x, y, L, rot, g in [(40,250,120,-70,"s1"),(180,262,140,-110,"s2"),(300,266,110,-60,"s1"),(430,268,150,-115,"s2"),(560,262,130,-65,"s1"),(700,250,130,-105,"s2"),(780,262,100,-75,"s1"),(110,270,110,-130,"s1")]:
    f += leaf(x, y, L, rot, g, .97)
for x, y, a, L in [(25,260,-80,200),(150,255,-70,185),(255,262,-100,170),(520,262,-75,190),(610,258,-105,200),(715,262,-80,185),(790,255,-100,150)]:
    f += bud_sprig(x, y, a, L, r)
for cx, cy, rx, ry, n in [(80,262,100,95,75),(330,268,120,100,85),(560,268,115,90,80),(745,262,90,85,60)]:
    f += dome(cx, cy, rx, ry, n, r)
f += magnolia(650, 222, .95, r, 12) + magnolia(205, 205, .5, r, -10)
f += f'<g transform="translate(215 118) rotate(10)"><ellipse rx="23" ry="32" fill="#e9eecb" stroke="#cdd7a9"/><path d="M-14 -4Q0 18 14 -4" fill="none" stroke="#b9c78f"/></g>'
for x, y, L, rot, g in [(10,285,90,-20,"s2"),(260,288,100,-160,"s1"),(480,288,90,-30,"s2"),(790,288,100,-165,"s1")]:
    f += leaf(x, y, L, rot, g, .98)
f += '</g>'
write("decor/footer-white.svg", Wf, Hf, f)
print("ok")
