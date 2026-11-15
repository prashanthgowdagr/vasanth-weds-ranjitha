"""Draws an ornamental calligraphic infinity monogram (original artwork) and writes it into site/index.html
between the <!--INF-->...<!--/INF--> markers. Run: python3 tools/gen_infinity.py [--preview out.svg]"""
import math, re, sys, os
ROOT = os.path.join(os.path.dirname(__file__), "..")

def taper_poly(pts, widths):
    """closed polygon outlining a variable-width stroke along pts"""
    L, R = [], []
    n = len(pts)
    for i, (x, y) in enumerate(pts):
        x0, y0 = pts[max(i - 1, 0)]; x1, y1 = pts[min(i + 1, n - 1)]
        dx, dy = x1 - x0, y1 - y0; d = math.hypot(dx, dy) or 1
        nx, ny = -dy / d, dx / d; h = widths[i] / 2
        L.append((x + nx * h, y + ny * h)); R.append((x - nx * h, y - ny * h))
    P = L + R[::-1]
    return "M" + "L".join(f"{x:.1f} {y:.1f}" for x, y in P) + "Z"

def lerp(a, b, t): return a + (b - a) * t

def bez(p0, p1, p2, p3, n=40):
    out = []
    for i in range(n + 1):
        t = i / n; u = 1 - t
        out.append((u**3*p0[0] + 3*u*u*t*p1[0] + 3*u*t*t*p2[0] + t**3*p3[0],
                    u**3*p0[1] + 3*u*u*t*p1[1] + 3*u*t*t*p2[1] + t**3*p3[1]))
    return out

def spiral(cx, cy, r0, turns, start, direction=1, n=60):
    pts = []
    for i in range(n + 1):
        t = i / n; a = start + direction * t * turns * 2 * math.pi; r = r0 * (1 - .93 * t)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return pts

def stroke(pts, w0, w1, shape=1.0):
    n = len(pts)
    ws = [lerp(w0, w1, (i / (n - 1)) ** shape) for i in range(n)]
    return taper_poly(pts, ws)

paths = []

# ---- main figure-eight: closed, heavy on the left loop / lower sweep, hairline on the right loop's top ----
CX, CY, A, B = 135, 82, 88, 150
def C(t):
    d = 1 + math.sin(t) ** 2
    return (CX + A * math.cos(t) / d, CY + B * math.sin(t) * math.cos(t) / d * .62)
T0 = 0.0
N = 480
ts = [lerp(T0, T0 + 2 * math.pi, i / N) for i in range(N + 1)]
pts = [C(t) for t in ts]
def width(t):
    u = (t - T0) / (2 * math.pi)
    heavy = (0.5 + 0.5 * math.cos((u - 0.66) * 2 * math.pi)) ** 1.5
    return 1.2 + 5.6 * heavy
wid = lambda t: width(t)
paths.append(taper_poly(pts, [wid(t) for t in ts]))
LC = [(CX - A * .52, CY), (CX + A * .52, CY)]

def attach(t, length, curl_r, curl_dir, lift=0, w0=None, turns=1.2, ball=False):
    """a stem leaves the line at parameter t, bends outward and ends in a scroll (or a ball)"""
    P = C(t); eps = 0.01
    Q = C(t + eps); tx, ty = Q[0] - P[0], Q[1] - P[1]; d = math.hypot(tx, ty); tx, ty = tx / d, ty / d
    lc = min(LC, key=lambda c: math.hypot(P[0] - c[0], P[1] - c[1]))
    ox, oy = P[0] - lc[0], P[1] - lc[1]; od = math.hypot(ox, oy); ox, oy = ox / od, oy / od
    w0 = w0 or width(t)
    e = (P[0] + ox * length + tx * length * .6, P[1] + oy * length + ty * length * .6 - lift)
    stem = bez(P, (P[0] + tx * length * .5, P[1] + ty * length * .5), (e[0] - ox * length * .45, e[1] - oy * length * .45 - lift * .3), e)
    paths.append(stroke(stem, w0, max(0.5, w0 * .35), 0.8))
    if ball:
        return f'<circle cx="{e[0]:.1f}" cy="{e[1]:.1f}" r="2.7"/>'
    ang = math.atan2(e[1] - stem[-4][1], e[0] - stem[-4][0]) + (-math.pi / 2) * curl_dir
    cx_, cy_ = e[0] + math.cos(ang) * curl_r, e[1] + math.sin(ang) * curl_r
    start = math.atan2(e[1] - cy_, e[0] - cx_)
    paths.append(stroke(spiral(cx_, cy_, curl_r, turns, start, curl_dir), max(0.9, w0 * .55), 0.4, 0.9))
    return ""

balls = ""
# ---- head flourish: the heavy stroke sweeps up and out to the left and ends in a big scroll ----
P = C(2.55); w_head = width(2.55)
e = (P[0] - 50, P[1] - 28)
stem = bez(P, (P[0] - 2, P[1] - 20), (P[0] - 30, P[1] - 40), e)
paths.append(stroke(stem, w_head, 1.6, 0.7))
ang0 = math.atan2(e[1] - stem[-5][1], e[0] - stem[-5][0])
ccx, ccy = e[0] + math.cos(ang0 + math.pi / 2) * 9.5, e[1] + math.sin(ang0 + math.pi / 2) * 9.5
paths.append(stroke(spiral(ccx, ccy, 9.5, 1.5, math.atan2(e[1] - ccy, e[0] - ccx), -1), 2.2, 0.4, 0.9))
# ---- hairline tail on the right loop (ball) and tiny scrolls hugging the line ----
balls += attach(5.90, 26, 0, 1, lift=-8, ball=True)
attach(5.45, 14, 4.2, 1, lift=-2, w0=1.1, turns=1.15)
attach(5.15, 15, 4.4, 1, lift=-4, w0=1.1, turns=1.15)
attach(3.95, 17, 5, 1, lift=-4, w0=1.5, turns=1.2)
attach(0.9, 15, 4.4, -1, lift=-4, w0=1.1, turns=1.15)

d_all = "".join(paths)
inf_svg = (f'<svg class="infinity" viewBox="-10 -4 290 160" aria-label="V and R" role="img">'
           f'<g class="inf-draw"><path class="inf-glow" d="{d_all}" fill="#e9c46a" opacity=".5" transform="translate(0 1.4)"/>'
           f'<path class="inf-ink" d="{d_all}" fill="#4a6b34"/>{balls.replace("<circle", "<circle fill=\'#4a6b34\'")}</g>'
           f'<text x="{CX-48}" y="{CY+13}" text-anchor="middle" class="inf-l">V</text>'
           f'<text x="{CX+48}" y="{CY+13}" text-anchor="middle" class="inf-l">R</text></svg>')

if "--preview" in sys.argv:
    open(sys.argv[sys.argv.index("--preview") + 1], "w").write(inf_svg.replace('<svg ', '<svg xmlns="http://www.w3.org/2000/svg" ', 1).replace('class="inf-l"', 'font-family="Georgia,serif" font-weight="700" font-size="30" fill="#3e5f26"'))
    print("preview written")
else:
    p = os.path.join(ROOT, "site", "index.html"); h = open(p).read()
    if "<!--INF-->" not in h:
        a = h.index('<svg class="infinity"'); b = h.index("</svg>", a) + 6
        h = h[:a] + "<!--INF-->" + inf_svg + "<!--/INF-->" + h[b:]
    else:
        h = re.sub(r"<!--INF-->.*?<!--/INF-->", lambda m: "<!--INF-->" + inf_svg + "<!--/INF-->", h, flags=re.S)
    open(p, "w").write(h); print("index.html updated")
