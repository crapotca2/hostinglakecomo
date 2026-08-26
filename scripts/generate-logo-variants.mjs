// Generates 10 logo variants: 5 with blue marble "h" on light bg + 5 with
// white "h" on navy bg. Output: Desktop\como-logo-versions\.

import { createRequire } from "module";
import Module from "module";
import { readFileSync, mkdirSync, existsSync, unlinkSync, readdirSync } from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

process.env.NODE_PATH = "C:\\Program Files\\nodejs\\node_modules";
Module._initPaths();
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const LOGO_BLUE_FILE = path.join(PROJECT_ROOT, "public/images/logo/logo-marble.png");
const LOGO_WHITE_FILE = path.join(PROJECT_ROOT, "public/images/logo/logo-white.png");
const DESKTOP = path.join(os.homedir(), "Desktop");
const OUT_DIR = path.join(DESKTOP, "como-logo-versions");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
// Wipe stale outputs so the folder always shows the current set.
for (const f of readdirSync(OUT_DIR)) {
  if (f.startsWith("como-logo-") && f.endsWith(".png")) unlinkSync(path.join(OUT_DIR, f));
}

const dataUrl = (file) =>
  `data:image/png;base64,${readFileSync(file).toString("base64")}`;
const LOGO_BLUE = dataUrl(LOGO_BLUE_FILE);
const LOGO_WHITE = dataUrl(LOGO_WHITE_FILE);

const NAVY = "#1D3A62";
const TEAL = "#119DB0";

// Per-variant config drives a single template:
//   theme:   "blue" | "white"  → which h asset + bg/text color defaults
//   layout:  "side" | "overlap" | "stacked"
//   font:    "outfit" | "bungee" | "playfair"
//   accent?: override text color
const variants = [
  // ─── BLUE H (marble) — light/transparent background ───
  { name: "v01-blue-side-outfit",      theme: "blue",  layout: "side",    font: "outfit" },
  { name: "v02-blue-side-bungee",      theme: "blue",  layout: "side",    font: "bungee",   accent: TEAL },
  { name: "v03-blue-overlap-outfit",   theme: "blue",  layout: "overlap", font: "outfit" },
  { name: "v04-blue-overlap-bungee",   theme: "blue",  layout: "overlap", font: "bungee" },
  { name: "v05-blue-stacked",          theme: "blue",  layout: "stacked", font: "outfit" },

  // ─── WHITE H — navy background ───
  { name: "v06-white-side-outfit",     theme: "white", layout: "side",    font: "outfit" },
  { name: "v07-white-side-bungee",     theme: "white", layout: "side",    font: "bungee" },
  { name: "v08-white-overlap-outfit",  theme: "white", layout: "overlap", font: "outfit" },
  { name: "v09-white-overlap-bungee",  theme: "white", layout: "overlap", font: "bungee" },
  { name: "v10-white-stacked",         theme: "white", layout: "stacked", font: "outfit" },
];

const FONT_QUERY = {
  outfit: "Outfit:wght@500;700;800",
  bungee: "Bungee",
  playfair: "Playfair+Display:ital,wght@1,500",
};

function textColor(v) {
  if (v.accent) return v.accent;
  return v.theme === "white" ? "#ffffff" : NAVY;
}

function bgColor(v) {
  return v.theme === "white" ? NAVY : "transparent";
}

function logoUrl(v) {
  return v.theme === "white" ? LOGO_WHITE : LOGO_BLUE;
}

// Stage box sizing per layout.
function stageDims(v) {
  if (v.layout === "stacked") return { w: 700, h: 600 };
  if (v.layout === "overlap") return { w: 1200, h: 420 };
  return { w: 1200, h: 360 };
}

function bodyHtml(v) {
  const url = logoUrl(v);
  const color = textColor(v);

  if (v.layout === "side") {
    let style = `color:${color};line-height:0.9;`;
    if (v.font === "outfit")
      style += `font-family:Outfit,sans-serif;font-weight:700;font-size:220px;letter-spacing:-0.02em;`;
    if (v.font === "bungee")
      style += `font-family:Bungee,sans-serif;font-weight:400;font-size:170px;letter-spacing:0.01em;margin-top:6px;`;
    const word = v.font === "bungee" ? "COMO" : "como";
    const ml = v.font === "bungee" ? 36 : 24;
    return `
      <div class="row">
        <img src="${url}" alt="" class="logo" />
        <span style="${style};margin-left:${ml}px">${word}</span>
      </div>`;
  }

  if (v.layout === "stacked") {
    return `
      <div class="col">
        <img src="${url}" alt="" class="logo-mid" />
        <span style="font-family:Outfit,sans-serif;font-weight:500;font-size:72px;line-height:1;color:${color};letter-spacing:0.5em;margin-top:20px;text-transform:uppercase;padding-left:0.5em">como</span>
      </div>`;
  }

  // overlap
  const H_LEFT = 280;
  const H_TOP = 50;
  const H_HEIGHT = 320;
  if (v.font === "outfit") {
    return `
      <img src="${url}" style="position:absolute;left:${H_LEFT}px;top:${H_TOP}px;height:${H_HEIGHT}px;width:auto;"/>
      <span style="position:absolute;left:${H_LEFT + 15}px;bottom:30px;font-family:Outfit,sans-serif;font-weight:800;font-size:165px;line-height:1;color:${color};letter-spacing:-0.02em;">como</span>`;
  }
  // bungee overlap
  return `
    <img src="${url}" style="position:absolute;left:${H_LEFT}px;top:${H_TOP}px;height:${H_HEIGHT}px;width:auto;"/>
    <span style="position:absolute;left:${H_LEFT + 10}px;bottom:55px;font-family:Bungee,sans-serif;font-weight:400;font-size:130px;line-height:1;color:${color};letter-spacing:0.01em;">COMO</span>`;
}

function pageHtml(v) {
  const { w, h } = stageDims(v);
  const bg = bgColor(v);
  const isOverlap = v.layout === "overlap";
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=${FONT_QUERY[v.font]}&display=swap" rel="stylesheet">
<style>
  html, body { margin:0; padding:0; background: transparent; }
  #stage {
    width:${w}px; height:${h}px;
    background:${bg};
    ${isOverlap ? "position:relative;" : "display:flex;align-items:center;justify-content:center;padding:0 40px;box-sizing:border-box;"}
  }
  .row { display:flex; align-items:center; }
  .col { display:flex; flex-direction:column; align-items:center; }
  .logo { height: 280px; width: auto; display:block; }
  .logo-mid { height: 280px; width: auto; display:block; }
</style></head>
<body><div id="stage">${bodyHtml(v)}</div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 2 });
  const page = await context.newPage();

  for (const v of variants) {
    await page.setContent(pageHtml(v), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(OUT_DIR, `como-logo-${v.name}.png`);
    // For white-on-navy, KEEP the background (don't omit) so navy renders.
    const omit = v.theme !== "white";
    await page.locator("#stage").screenshot({ path: out, omitBackground: omit });
    console.log("OK", v.name);
  }

  await browser.close();

  // Clean up legacy standalone PNGs on Desktop root from previous runs.
  for (const f of readdirSync(DESKTOP)) {
    if (f.startsWith("como-logo-v") && f.endsWith(".png")) {
      unlinkSync(path.join(DESKTOP, f));
      console.log("REMOVED legacy", f);
    }
  }
})();
