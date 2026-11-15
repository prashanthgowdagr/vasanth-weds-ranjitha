// Turns the originals in /photos into web-ready files in /site/img and writes site/gallery.json.
//
//   photos/hero.jpg      -> site/img/hero.webp   (1000x1594 portrait crop for the notched frame on the opening page)
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
  // several files can share a name (hero.jpg / hero.JPG): the most recently modified one wins
  const names = (await readdir(SRC).catch(() => [])).filter((x) => base(x) === name && EXT.test(x));
  const withTime = await Promise.all(names.map(async (x) => ({ f: path.join(SRC, x), t: (await stat(path.join(SRC, x))).mtimeMs })));
  withTime.sort((x, y) => y.t - x.t);
  return withTime[0] && withTime[0].f;
}
async function single(name, out, fn, fallback) {
  let file = await find(name);
  if (file && fallback) {
    const fb = await find(fallback);
    if (fb && (await stat(fb)).mtimeMs > (await stat(file)).mtimeMs) { console.log(`  - ${path.basename(file)} is older than ${path.basename(fb)}, using ${path.basename(fb)} instead`); file = fb; }
  }
  if (!file && fallback) file = await find(fallback);
  if (!file) return console.log(`  - ${name}: not found (sample placeholder stays)`);
  await fn(sharp(file).rotate()).toFile(path.join(OUT, out));
  console.log(`  ✓ ${path.basename(file)} -> img/${out}`);
}

await mkdir(path.join(OUT, "gallery"), { recursive: true });
console.log("Single photos:");
const crop = (w, h) => (s) => s.resize(w, h, { fit: "cover", position: "attention", withoutEnlargement: true });   // never upscale small photos
await single("hero", "hero.webp", (s) => s.flatten({ background: "#ffffff" }).resize({ width: 1000, height: 1594, fit: "cover", position: "attention", withoutEnlargement: true }).webp({ quality: 88 }));
// og.jpg (link preview) is designed separately: node tools/make_og.mjs . It is not touched here.

console.log("Gallery:");
const gdir = path.join(SRC, "gallery");
const files = ((await exists(gdir)) ? await readdir(gdir) : []).filter((f) => EXT.test(f)).sort((a, b) => a.localeCompare(b, undefined, { numeric: true }));
if (!files.length) {
  console.log("  - no photos in photos/gallery, keeping existing gallery.json (sample cards)");
} else {
  await rm(path.join(OUT, "gallery"), { recursive: true, force: true });   // drop stale outputs from earlier runs
  await mkdir(path.join(OUT, "gallery"), { recursive: true });
  const items = [];
  // Screenshots (PNG) often carry a 1-2px dark line along an edge: trim 3px off every side of PNG sources.
  // (Detected by file content, so a PNG saved with a .jpg name is handled too.)
  const load = async (file) => {
    const meta = await sharp(file).metadata();
    const img = sharp(file).rotate();
    if (meta.format === "png" && meta.width > 40 && meta.height > 40)
      return sharp(await img.extract({ left: 3, top: 3, width: meta.width - 6, height: meta.height - 6 }).toBuffer());
    return img;
  };
  for (const f of files) {
    const n = base(f).replace(/[^a-zA-Z0-9_-]+/g, "-"), input = path.join(gdir, f);
    const full = await (await load(input)).flatten({ background: "#ffffff" }).resize({ width: 1800, withoutEnlargement: true }).webp({ quality: 88 }).toFile(path.join(OUT, "gallery", `${n}.webp`));
    const thumb = await (await load(input)).flatten({ background: "#ffffff" }).resize({ width: 600, withoutEnlargement: true }).webp({ quality: 82 }).toFile(path.join(OUT, "gallery", `${n}-thumb.webp`));
    items.push({ thumb: `img/gallery/${n}-thumb.webp`, full: `img/gallery/${n}.webp`, w: thumb.width, h: thumb.height, alt: `Wedding photo ${items.length + 1}` });
    console.log(`  ✓ ${f} (${Math.round(full.size / 1024)} KB)`);
  }
  await writeFile(path.join(ROOT, "site", "gallery.json"), JSON.stringify(items, null, 2) + "\n");
  console.log(`  wrote gallery.json (${items.length} photos)`);
}
