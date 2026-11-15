(() => {
  const W = window.WEDDING;
  const $ = (id) => document.getElementById(id);
  const text = (id, v) => { $(id).textContent = v; };
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt != null) e.textContent = txt; return e; };
  const params = new URLSearchParams(location.search);

  // ---------- Date helpers (event strings are local venue time) ----------
  const MONTH = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];
  const DAY = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
  const parse = (s) => { const [d, t] = s.split("T"), [y, m, dd] = d.split("-").map(Number), [hh, mm] = t.split(":").map(Number); return { y, m, d: dd, hh, mm, t }; };
  const abs = (s) => new Date(`${s}:00${W.tz}`);
  const weekday = (p) => DAY[new Date(Date.UTC(p.y, p.m - 1, p.d)).getUTCDay()];
  const dateBlock = (e) => {
    const p = parse(e.start), w = el("div", "dateline");
    const a = el("div", "at"); a.append(el("span", null, `AT ${p.t}`), el("span", null, weekday(p)));
    const r = el("div", "row"), my = el("div", "my");
    my.append(el("div", null, MONTH[p.m - 1]), el("div", null, String(p.y)));
    r.append(el("span", "day", String(p.d).padStart(2, "0")), el("span", "rule"), my);
    w.append(a, r); return w;
  };
  const main = W.events[W.mainEvent], mp = parse(main.start);
  // ---------- Text ----------
  document.title = `${W.groom} & ${W.bride} — Wedding Invitation`;
  text("i-groom", W.groom); text("i-bride", W.bride);
  text("t-groom", W.groom); text("t-bride", W.bride);
  text("groom-full", W.groom); text("bride-full", W.bride);
  text("announcement", W.announcement);
  text("thanks-q", W.thanksQuote); text("thanks", W.thanks); text("presence", W.presence); text("mono", `${W.groom[0]} & ${W.bride[0]}`);

  // Parents (either side may be null)
  const par = $("parents"), sides = [W.groomParents, W.brideParents].filter(Boolean);
  if (!sides.length) par.hidden = true;
  sides.forEach((p, i) => {
    if (i) par.append(el("span", "vline"));
    const d = el("div"); d.append(el("div", null, p.title)); p.lines.forEach((l) => d.append(el("b", null, l))); par.append(d);
  });

  // ---------- Personalised guest (?guest=Anita) ----------
  const guest = params.get("guest");
  if (guest) { text("i-guest", `Dear ${guest.slice(0, 40)}`); $("i-guest").hidden = false; }

  // ---------- Images: real photo (webp) if present, else sample placeholder ----------
  document.querySelectorAll("[data-img]").forEach((node) => {
    const n = node.dataset.img, probe = new Image();
    probe.onload = () => (node.style.backgroundImage = `url(img/${n}.webp)`);
    probe.onerror = () => (node.style.backgroundImage = `url(img/placeholder/${n}.svg)`);
    probe.src = `img/${n}.webp`;
  });

  // ---------- Floating petals on the landing page ----------
  const pc = $("petals"), cols = ["#7f9e55", "#f2b7c2", "#9db77a", "#f6cdd5"];
  const petalSvg = '<svg viewBox="0 0 24 24">' + [0, 60, 120, 180, 240, 300].map((r) => `<ellipse cx="12" cy="6" rx="2.6" ry="5" transform="rotate(${r} 12 12)"/>`).join("") + "</svg>";
  for (let i = 0; i < 16; i++) {
    const p = el("i"); p.style.cssText = `left:${Math.random() * 100}%;--s:${10 + Math.random() * 16}px;--c:${cols[i % 4]};--d:${9 + Math.random() * 9}s;--dl:${-Math.random() * 14}s;--x:${(Math.random() - .5) * 120}px`;
    p.innerHTML = petalSvg; pc.append(p);
  }

  // ---------- Music: starts on OPEN (a tap is required by browsers) and repeats forever ----------
  const music = new Audio(W.music || "audio/music.mp3"), mbtn = $("music-btn");
  music.loop = true; music.volume = 0.6; music.preload = "auto";
  music.addEventListener("ended", () => { music.currentTime = 0; music.play().catch(() => {}); });   // safety net: restart if a browser ignores loop
  let hasAudio = false, wanted = false;
  music.addEventListener("canplay", () => { hasAudio = true; if (document.body.classList.contains("started")) mbtn.hidden = false; });
  const syncBtn = () => { mbtn.classList.toggle("off", music.paused); mbtn.dataset.state = music.paused ? "paused" : "playing"; };
  music.addEventListener("play", syncBtn); music.addEventListener("pause", syncBtn);
  mbtn.addEventListener("click", () => { wanted = music.paused; music.paused ? music.play().catch(() => {}) : music.pause(); });
  // If a browser refuses to start the song on the Open tap, start it on the very next touch / key / scroll.
  const retry = () => { if (wanted && music.paused) music.play().then(() => ["pointerdown", "touchstart", "keydown", "scroll"].forEach((t) => removeEventListener(t, retry))).catch(() => {}); };
  ["pointerdown", "touchstart", "keydown", "scroll"].forEach((t) => addEventListener(t, retry, { passive: true }));
  document.addEventListener("visibilitychange", () => {
    if (document.hidden && !music.paused) { music.pause(); music.dataset.resume = "1"; }
    else if (!document.hidden && music.dataset.resume) { delete music.dataset.resume; music.play().catch(() => {}); }
  });

  const openInvite = (withMusic) => {
    $("intro").classList.add("open"); document.body.classList.remove("locked"); document.body.classList.add("started");
    scrollTo(0, 0);
    if (withMusic) { wanted = true; music.play().catch(() => {}); }   // allowed: this runs inside the Open click
    if (hasAudio) mbtn.hidden = false;
  };
  if (params.has("skipintro")) openInvite(false);   // for previews/testing
  $("open-btn").addEventListener("click", () => openInvite(true));

  // ---------- The Celebration cards (info only, no extra buttons) ----------
  const ICON = { sparkle: '<g fill="none" stroke="currentColor" stroke-width="1.5" stroke-linejoin="round"><path d="M10 4l1.6 4.4L16 10l-4.4 1.6L10 16l-1.6-4.4L4 10l4.4-1.6z"/><path d="M18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8z"/></g>',
    heart: '<path d="M12 20.5s-8-4.8-8-10.6A4.4 4.4 0 0 1 12 7.6a4.4 4.4 0 0 1 8 2.3c0 5.8-8 10.6-8 10.6z" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round"/>' };
  const MON_UP = ["JAN", "FEB", "MAR", "APR", "MAY", "JUN", "JUL", "AUG", "SEP", "OCT", "NOV", "DEC"];
  const t12 = ({ hh, mm }) => `${((hh + 11) % 12) + 1}:${String(mm).padStart(2, "0")} ${hh < 12 ? "AM" : "PM"}`;
  W.events.forEach((e) => {
    const p = parse(e.start), c = el("article", "event reveal");
    const when = `${p.d} ${MON_UP[p.m - 1]} ${p.y} • ${t12(p)}${e.showEnd && e.end ? ` to ${t12(parse(e.end))}` : ""}`;
    const ring = el("span", "ev-ring"); ring.innerHTML = `<svg width="24" height="24" viewBox="0 0 24 24">${ICON[e.icon] || ICON.heart}</svg>`;
    c.append(ring, el("h3", null, e.title), el("p", "when", when), el("p", "d", e.desc || ""));
    $("event-list").append(c);
  });

  // ---------- Save the Date card + highlighted countdown ----------
  text("d-month", MONTH[mp.m - 1]); text("d-day", String(mp.d)); text("d-year", String(mp.y).split("").join(" "));
  const target = abs(main.start).getTime(), cd = $("countdown");
  const tick = () => {
    const s = Math.max(0, Math.floor((target - Date.now()) / 1000));
    const v = [[Math.floor(s / 86400), "Days"], [Math.floor(s / 3600) % 24, "Hours"], [Math.floor(s / 60) % 60, "Min"], [s % 60, "Sec"]];
    cd.replaceChildren(...v.map(([n, l]) => { const d = el("div"); d.append(el("b", null, String(n).padStart(2, "0")), el("small", null, l)); return d; }));
  };
  tick(); setInterval(tick, 1000);

  // ---------- Flower gate: doors open with scroll, petals burst when open ----------
  (() => {
    const track = $("track"), stage = $("stage"), box = $("confetti");
    if (matchMedia("(prefers-reduced-motion: reduce)").matches) return;
    const cols = ["#f7c6d2", "#ffffff", "#e7c86e", "#f2a9bd", "#cfe3b5", "#fbe3e8"];
    let fired = false;
    const burst = () => {
      box.replaceChildren();
      for (let i = 0; i < 90; i++) {
        const q = el("i"), a = Math.random() * Math.PI - Math.PI, r = 110 + Math.random() * 250, w = 6 + Math.random() * 7;
        q.style.cssText = `--x:${Math.cos(a) * r}px;--y:${Math.sin(a) * r * .9}px;--rot:${Math.random() * 720 - 360}deg;--w:${w}px;--h:${w * (Math.random() < .5 ? 1 : 2.2)}px;--c:${cols[i % cols.length]};--r:${Math.random() < .5 ? "50% 0 50% 0" : "2px"};animation-delay:${Math.random() * .25}s`;
        box.append(q);
      }
      setTimeout(() => box.replaceChildren(), 3400);
    };
    let ticking = false;
    const update = () => {
      ticking = false;
      const r = track.getBoundingClientRect(), sh = stage.offsetHeight, pin = Math.max(0, (innerHeight - sh) / 2);
      const total = track.offsetHeight - sh;
      const p = Math.min(1, Math.max(0, (pin - r.top) / total) / 0.8);
      stage.style.setProperty("--p", p.toFixed(3));
      if (p > 0.92 && !fired) { fired = true; burst(); }
      if (p < 0.3) fired = false;
    };
    addEventListener("scroll", () => { if (!ticking) { ticking = true; requestAnimationFrame(update); } }, { passive: true });
    addEventListener("resize", update); update();
  })();

  // ---------- Month calendar (every event day is a beating pink heart) ----------
  const cal = $("cal"), evDays = new Set(W.events.map((e) => parse(e.start)).filter((p) => p.m === mp.m && p.y === mp.y).map((p) => p.d));
  cal.append(el("h4", null, `${MONTH[mp.m - 1]} ${mp.y}`));
  const grid = el("div", "g");
  ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"].forEach((d) => grid.append(el("div", "h", d)));
  const lead = (new Date(Date.UTC(mp.y, mp.m - 1, 1)).getUTCDay() + 6) % 7, dim = new Date(Date.UTC(mp.y, mp.m, 0)).getUTCDate();
  for (let i = 0; i < lead; i++) grid.append(el("div"));
  for (let d = 1; d <= dim; d++) {
    const on = evDays.has(d), c = el("div", "d" + (on ? " on" : ""));
    if (on) { c.innerHTML = '<svg viewBox="0 0 24 24"><use href="#heart"/></svg>'; c.append(el("span", null, d)); } else c.textContent = d;
    grid.append(c);
  }
  cal.append(grid);

  // ---------- The single "Add to Calendar" (.ics containing every event) ----------
  const icsDate = (d) => new Date(d).toISOString().replace(/[-:]/g, "").replace(/\.\d{3}/, "");
  const esc = (s) => s.replace(/[\\;,]/g, "\\$&").replace(/\n/g, "\\n");
  $("cal-btn").addEventListener("click", () => {
    const where = `${W.venue.name}, ${W.venue.address}`;
    const ev = W.events.flatMap((e) => {
      const s = abs(e.start), en = e.end ? abs(e.end) : new Date(s.getTime() + 3 * 3600e3);
      return ["BEGIN:VEVENT", `UID:${icsDate(s)}-${e.title.replace(/\W/g, "")}@wedding-invite`, `DTSTAMP:${icsDate(Date.now())}`, `DTSTART:${icsDate(s)}`, `DTEND:${icsDate(en)}`,
        `SUMMARY:${esc(`${e.title} — ${W.groom} & ${W.bride}`)}`, `DESCRIPTION:${esc(e.desc || "")}`, `LOCATION:${esc(where)}`, "END:VEVENT"];
    });
    const ics = ["BEGIN:VCALENDAR", "VERSION:2.0", "PRODID:-//Wedding Invite//EN", ...ev, "END:VCALENDAR"].join("\r\n");
    const a = el("a"); a.href = URL.createObjectURL(new Blob([ics], { type: "text/calendar" })); a.download = "wedding.ics"; a.click(); URL.revokeObjectURL(a.href);
  });

  // ---------- Venue: map + the single "Get directions" ----------
  const q = encodeURIComponent(W.venue.mapQuery);
  text("venue-title", W.venue.title); text("venue-name", W.venue.name); text("venue-addr", W.venue.address);
  [["chip-area", W.venue.area], ["chip-note", W.venue.note]].forEach(([id, v]) => { $(id).hidden = !v; if (v) $(id).querySelector("span").textContent = v; });
  $("map").src = `https://maps.google.com/maps?q=${q}&output=embed`;
  $("dir-btn").href = `https://www.google.com/maps/dir/?api=1&destination=${q}`;

  // ---------- Post-wedding album ----------
  if (W.postWedding && W.albumUrl) { $("album").hidden = false; text("album-note", W.albumNote); $("album-link").href = W.albumUrl; }

  // ---------- Gallery coverflow (gallery.json is written by `npm run photos`) ----------
  fetch("gallery.json").then((r) => r.json()).then((items) => {
    if (!items.length) return ($("gallery").hidden = true);
    const flow = $("flow"); let cur = 0;
    const cards = items.map((it, i) => {
      const c = el("button", "card"); c.type = "button"; c.setAttribute("aria-label", `Photo ${i + 1}`);
      const img = el("img"); img.src = it.thumb; img.alt = it.alt || `Photo ${i + 1}`; img.loading = "lazy"; c.append(img);
      c.addEventListener("click", () => { if (i !== cur) go(i); });
      flow.append(c); return c;
    });
    const go = (n) => { cur = (n + items.length) % items.length; render(); };
    const render = () => {
      cards.forEach((c, i) => {
        let d = i - cur; if (d > items.length / 2) d -= items.length; if (d < -items.length / 2) d += items.length;
        const a = Math.abs(d), side = Math.sign(d);
        c.style.transform = a > 1 ? `translateX(${side * 45}%) scale(.7)` : `translateX(${side * 50}%) scale(${1 - a * .14}) rotateY(${-side * 20 * a}deg)`;
        c.style.opacity = a > 1 ? 0 : 1; c.style.zIndex = 10 - a; c.style.filter = a ? "brightness(.82)" : "none"; c.style.pointerEvents = a > 1 ? "none" : "auto";
      });
      text("counter", `${cur + 1} / ${items.length}`);
    };
    let x0 = null;
    flow.addEventListener("pointerdown", (e) => (x0 = e.clientX));
    flow.addEventListener("pointerup", (e) => { if (x0 != null && Math.abs(e.clientX - x0) > 40) go(cur + (e.clientX < x0 ? 1 : -1)); x0 = null; });
    document.addEventListener("keydown", (e) => { if (e.key === "ArrowRight") go(cur + 1); if (e.key === "ArrowLeft") go(cur - 1); });
    render();
  }).catch(() => ($("gallery").hidden = true));

  // ---------- Lotus decorations on every section ----------
  const lotus = (host, items) => {
    const layer = el("div", "lt-layer");
    items.forEach(([name, css, cls]) => { const i = el("img", "lt " + (cls || "")); i.src = `img/decor/${name}.svg`; i.alt = ""; i.setAttribute("aria-hidden", "true"); i.style.cssText = css; layer.append(i); });
    host.prepend(layer);
  };
  const divider = (host, before) => { const d = el("img", "divider-img"); d.src = "img/decor/divider.svg"; d.alt = ""; d.setAttribute("aria-hidden", "true"); host.insertBefore(d, before); };
  const R = (top, w = 150, rot = 0) => `top:${top};right:-${Math.round(w * .38)}px;width:${w}px;transform:rotate(${rot}deg)`;
  const L = (top, w = 150, rot = 0) => `top:${top};left:-${Math.round(w * .38)}px;width:${w}px;transform:scaleX(-1) rotate(${-rot}deg)`;
  lotus($("home"), [["corner", R("-28px", 150)], ["corner", L("66%", 110, 8)]]);
  lotus($("ceremony"), [["corner", R("6%", 110, 6)], ["corner", L("62%", 120, -6)]]);
  divider($("ceremony"), document.querySelector("#ceremony .cart"));
  lotus($("celebration"), [["corner", R("4%", 110, 6)], ["corner", L("62%", 120, -6)]]);
  lotus($("gallery"), [["corner", L("-2%", 120, 6)]]);
  lotus($("reception"), [["corner", R("12%", 120, 8)], ["corner", L("68%", 120, -6)]]);
  lotus($("venue"), [["corner", R("6%", 110, 8)]]);

  // ---------- Falling lotus petals (closing) ----------
  const fall = $("petals-fall");
  for (let i = 0; i < 14; i++) {
    const h = el("i"); h.style.cssText = `left:${Math.random() * 100}%;--d:${9 + Math.random() * 8}s;--dl:${-Math.random() * 12}s;--x:${(Math.random() - .5) * 90}px`;
    const im = el("img"); im.src = "img/decor/petal.svg"; im.alt = ""; im.style.width = `${Math.round(14 + Math.random() * 14)}px`; h.append(im); fall.append(h);
  }

  // ---------- Reveal on scroll ----------
  const io = new IntersectionObserver((es) => es.forEach((x) => x.isIntersecting && (x.target.classList.add("in"), io.unobserve(x.target))), { threshold: 0.12 });
  document.querySelectorAll(".reveal").forEach((n) => io.observe(n));
})();
