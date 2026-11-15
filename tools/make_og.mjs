// Renders tools/og.html to site/img/og.jpg (1200x630 link-preview card).
// Needs puppeteer-core and a Chrome:  CHROME_PATH=/path/to/chrome node tools/make_og.mjs
import puppeteer from "puppeteer-core";
import path from "node:path";
import { fileURLToPath } from "node:url";
const ROOT = process.env.ROOT || path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const b = await puppeteer.launch({ executablePath: process.env.CHROME_PATH, args: ["--no-sandbox", "--allow-file-access-from-files"], headless: "shell" });
const p = await b.newPage(); await p.setViewport({ width: 1200, height: 630 });
await p.goto("file://" + path.join(ROOT, "tools/og.html"), { waitUntil: "networkidle0" }); await new Promise((r) => setTimeout(r, 800));
await p.screenshot({ path: path.join(ROOT, "site/img/og.jpg"), type: "jpeg", quality: 90 }); await b.close(); console.log("wrote site/img/og.jpg");
