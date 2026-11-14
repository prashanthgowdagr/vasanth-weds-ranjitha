# Vasanth & Ranjitha — Wedding Invitation (Lotus)

A static, mobile-first wedding invitation website with its own lotus artwork. No framework, no build step for the page.

Flow: **OPEN card** (floating petals) -> tap **Open** -> the invitation opens and the **music starts** -> opening page with the names and a photo in a notched frame.
Sections: Ceremony Info, Photo Gallery, Reception Info (countdown + calendar), Wedding Venue (map), Wedding Day Schedule, closing.
No RSVP, guestbook, dress code or gift box. One **Add to Calendar** and one **Get directions**.

## Run locally
```bash
npm install
npm run dev        # http://localhost:5173
```
Preview shortcuts: `?skipintro` skips the OPEN card, `?guest=Anita` greets a guest on the OPEN card.

## Edit the details
Everything (names, parents, events, venue, schedule, texts) is in **`site/config.js`**.
Parents: set `groomParents` / `brideParents` to `{ title, lines }` or `null` to hide.

## Music
Put your song at **`site/audio/music.mp3`**. It starts when the guest taps **Open** (browsers only allow sound after a tap) and loops.
A round button on the right lets guests pause or play it. Until the file exists, the button stays hidden.
Tip: keep it under ~3 MB (128 kbps) so the page stays fast.

## Photos
Drop originals into `photos/` and run `npm run photos`:

| File | Used for |
|---|---|
| `photos/hero.jpg` | Opening page photo (tall portrait works best) |
| `photos/og.jpg` | WhatsApp / link preview (optional; made from hero if missing) |
| `photos/gallery/*.jpg` | Photo Gallery carousel (any names, sorted alphabetically) |

Originals are never modified; optimised WebP copies are written to `site/img`. Until you add photos, the page shows sample placeholders.

## After the wedding
Set `postWedding: true` and `albumUrl` in `site/config.js` to link a full-resolution album (Google Photos / Drive / R2).

## Deploy (publish directory = `site`, no build command)
- **Cloudflare Pages:** connect the repo, build command empty, output directory `site`.
- **GitHub Pages:** deploy from a branch or a workflow that uploads `site/`.

## Artwork
All lotus illustrations in `site/img/decor/` are original SVGs made for this project.
