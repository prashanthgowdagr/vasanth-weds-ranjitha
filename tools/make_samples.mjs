// Creates SAMPLE images in /photos so the layout can be previewed. Replace them with the real photos
// (same file names for hero/og; any names for the gallery), then run:  npm run photos
import sharp from "sharp";
import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const make = async (file, w, h, c1, c2, title, sub) => {
  const fs = Math.round(Math.min(w, h) * 0.07);
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}">
    <defs><linearGradient id="g" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="${c1}"/><stop offset="1" stop-color="${c2}"/></linearGradient>
    <radialGradient id="r" cx=".3" cy=".25" r=".6"><stop offset="0" stop-color="#fff" stop-opacity=".35"/><stop offset="1" stop-color="#fff" stop-opacity="0"/></radialGradient></defs>
    <rect width="100%" height="100%" fill="url(#g)"/><rect width="100%" height="100%" fill="url(#r)"/>
    <circle cx="${w * .82}" cy="${h * .78}" r="${Math.min(w, h) * .28}" fill="#fff" opacity=".12"/>
    <circle cx="${w * .18}" cy="${h * .85}" r="${Math.min(w, h) * .16}" fill="#fff" opacity=".1"/>
    <text x="50%" y="46%" fill="#fff" font-family="DejaVu Serif,Georgia,serif" font-size="${fs * 1.5}" text-anchor="middle" opacity=".95">${title}</text>
    <text x="50%" y="${46 + 7}%" fill="#fff" font-family="DejaVu Sans,Arial,sans-serif" font-size="${fs * .62}" text-anchor="middle" opacity=".85">${sub}</text></svg>`;
  await mkdir(path.dirname(path.join(ROOT, file)), { recursive: true });
  await sharp(Buffer.from(svg)).jpeg({ quality: 88 }).toFile(path.join(ROOT, file));
  console.log("  ✓", file);
};

await make("photos/hero.jpg", 1000, 1594, "#d9e4c4", "#4d6e3a", "SAMPLE", "Replace photos/hero.jpg (tall portrait)");
await make("photos/og.jpg", 1200, 630, "#e9c9d3", "#6f9444", "SAMPLE", "Replace photos/og.jpg (link preview, optional)");
const pal = [["#3b6b57", "#a7c9b4"], ["#b9a05e", "#efe3b8"], ["#8d6e8a", "#e9d3e6"], ["#5d8a4a", "#cde0b8"], ["#c98a96", "#f6d6dc"], ["#6f9a8a", "#cfe5dc"], ["#9c8a4e", "#efe6bf"], ["#4a7a63", "#c9dccf"]];
const dims = [[1200, 1500], [1500, 1000], [1200, 1500], [1200, 1200], [1200, 1500], [1500, 1000], [1200, 1500], [1200, 1200]];
for (let i = 0; i < 8; i++) await make(`photos/gallery/${String(i + 1).padStart(2, "0")}.jpg`, dims[i][0], dims[i][1], pal[i][0], pal[i][1], `Sample ${i + 1}`, "Replace with a gallery photo");
