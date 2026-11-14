// Turns the originals in /photos into web-ready files in /site/img and writes site/gallery.json.
//
//   photos/hero.jpg      -> site/img/hero.webp   (1000x1594 portrait crop for the notched frame on the opening page)
//   photos/og.jpg        -> site/img/og.jpg      (1200x630 link preview; made from hero if missing)
//   photos/gallery/*     -> site/img/gallery/<name>.webp (1800px) + <name>-thumb.webp (600px), listed in gallery.json
//
// Originals are never modified. Run:  npm run photos
import sharp from "sharp";
import { readdir, mkdir, writeFile, stat, rm } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const SRC = path.join(ROOT, "photos");
const OUT = path.join(ROOT, "site", "img");
const EXT = /\.(jpe?g|png|webp|heic|tiff?)$/i;
const base = (f) => path.parse(f).name;
const exists = async (p) => !!(await stat(p).catch(() => null));

async function find(name) {
  const f = (await readdir(SRC).catch(() => [])).find((x) => base(x) === name && EXT.test(x));
  return f && path.join(SRC, f);
}
async function single(name, out, fn, fallback) {
  const file = (await find(name)) || (fallback && (await find(fallback)));
  if (!file) return console.log(`  - ${name}: not found (sample placeholder stays)`);
  await fn(sharp(file).rotate()).toFile(path.join(OUT, out));
  console.log(`  ✓ ${path.basename(file)} -> img/${out}`);
}

await mkdir(path.join(OUT, "gallery"), { recursive: true });
console.log("Single photos:");
const crop = (w, h) => (s) => s.resize(w, h, { fit: "cover", position: "attention" });
await single("hero", "hero.webp", (s) => crop(1000, 1594)(s).webp({ quality: 82 }));
await single("og", "og.jpg", (s) => crop(1200, 630)(s).jpeg({ quality: 82 }), "hero");

console.log("Gallery:");
const gdir = path.join(SRC, "gallery");
const files = ((await exists(gdir)) ? await readdir(gdir) : []).filter((f) => EXT.test(f)).sort();
if (!files.length) {
  console.log("  - no photos in photos/gallery, keeping existing gallery.json (sample cards)");
} else {
  await rm(path.join(OUT, "gallery"), { recursive: true, force: true });   // drop stale outputs from earlier runs
  await mkdir(path.join(OUT, "gallery"), { recursive: true });
  const items = [];
  for (const f of files) {
    const n = base(f).replace(/[^a-zA-Z0-9_-]+/g, "-"), input = path.join(gdir, f);
    const full = await sharp(input).rotate().resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, "gallery", `${n}.webp`));
    const thumb = await sharp(input).rotate().resize({ width: 600, withoutEnlargement: true }).webp({ quality: 75 }).toFile(path.join(OUT, "gallery", `${n}-thumb.webp`));
    items.push({ thumb: `img/gallery/${n}-thumb.webp`, full: `img/gallery/${n}.webp`, w: thumb.width, h: thumb.height, alt: n.replace(/[-_]+/g, " ") });
    console.log(`  ✓ ${f} (${Math.round(full.size / 1024)} KB)`);
  }
  await writeFile(path.join(ROOT, "site", "gallery.json"), JSON.stringify(items, null, 2) + "\n");
  console.log(`  wrote gallery.json (${items.length} photos)`);
}
