# Vasanth & Ranjitha — Wedding Invitation (Lotus)

A static, mobile-first wedding invitation website with its own lotus artwork. No framework, no build step for the page.

Flow: **OPEN card** (floating petals) -> tap **Open** -> the invitation opens and the **music starts** -> opening page with the names and a photo in a notched frame.
Look: frosted-glass column over a soft floral garden background. Sections: Ceremony Info, **Save the Date** (28 Nov, countdown) (a flower gate opens as you scroll, petals burst, highlighted countdown), Photo Gallery, Reception Info (calendar with beating hearts on the event days), Wedding Venue (map), closing thank-you with falling petals.
No RSVP, guestbook, dress code or gift box. One **Add to Calendar** and one **Get directions**.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
```
Preview shortcuts: `?skipintro` skips the OPEN card, `?guest=Anita` greets a guest on the OPEN card.

## Edit the details
Everything (names, parents, events, venue, texts) is in **`site/config.js`**.
Parents: set `groomParents` / `brideParents` to `{ title, lines }` or `null` to hide.

## Music
Put your song in **`site/audio/`** and set its path in `site/config.js` (`music: "audio/Parichayavade.mp3"`). It starts when the guest taps **Open** (browsers only allow sound after a tap) and loops.
A round button on the right lets guests pause or play it. Until the file exists, the button stays hidden.
Tip: keep it under ~3 MB (128 kbps) so the page stays fast.

## Photos
Drop originals into `photos/` and run `npm run photos`:

| File | Used for |
|---|---|
| `photos/hero.jpg` | Opening page photo (tall portrait works best) |
| `photos/og.jpg` | WhatsApp / link preview (optional; made from hero if missing) |
| `photos/gallery/*.jpg` | Photo Gallery carousel. Named `1.jpg`, `2.jpg`, ... and shown in that order (rename files to reorder) |

Originals are never modified; optimised WebP copies are written to `site/img` (old gallery outputs are cleaned each run).
The `photos/` folder currently holds **SAMPLE images** (made by `node tools/make_samples.mjs`). Replace them with the real photos and run `npm run photos`.

## After the wedding
Set `postWedding: true` and `albumUrl` in `site/config.js` to link a full-resolution album (Google Photos / Drive / R2).

## Deploy (GitHub Pages + custom domain)
A workflow (`.github/workflows/pages.yml`) publishes the `site/` folder on every push to `main`.
- Live address: https://vasanth-weds-ranjitha.q21.in
- DNS: add a **CNAME** record `vasanth-weds-ranjitha` -> `prashanthgowdagr.github.io` at the `q21.in` DNS provider (DNS only if using Cloudflare).
- In Settings -> Pages, once the DNS check passes, tick **Enforce HTTPS**.
- The project also works on Cloudflare Pages (build command empty, output directory `site`).
