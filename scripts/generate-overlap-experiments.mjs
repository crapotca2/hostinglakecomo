// Generates 3 advanced "h + COMO" overlap experiments using deterministic
// SVG masks / CSS knockout effects (no AI). Outputs 1024x1024 PNGs to
// ~/Desktop/como-overlap-styles/ for evaluation.

import { createRequire } from "module";
import Module from "module";
import { readFileSync, writeFileSync, mkdirSync, existsSync, readdirSync, unlinkSync } from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

process.env.NODE_PATH = "C:\\Program Files\\nodejs\\node_modules";
Module._initPaths();
const require = createRequire(import.meta.url);
const { chromium } = require("playwright");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const LOGO_FILE = path.join(PROJECT_ROOT, "public/images/logo/logo-white.png");
const DESKTOP = path.join(os.homedir(), "Desktop");
const OUT_DIR = path.join(DESKTOP, "como-overlap-styles");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) unlinkSync(path.join(OUT_DIR, f));

const LOGO_URL = `data:image/png;base64,${readFileSync(LOGO_FILE).toString("base64")}`;

const NAVY = "#1D3A62";
const TEAL = "#119DB0";

const SIZE = 1024;

// ─── Style 1: AGGRESSIVE FUSION ───────────────────────────────────────────
// h + COMO Bungee both white, COMO large crossing the lower half of the h.
// Where they touch they fuse into one continuous white shape.
const style1 = `
<div style="position:relative;width:${SIZE}px;height:${SIZE}px;background:${TEAL}">
  <img src="${LOGO_URL}" style="position:absolute;left:50%;top:100px;transform:translateX(-50%);height:740px"/>
  <span style="position:absolute;left:50%;bottom:140px;transform:translateX(-50%);font-family:Bungee,sans-serif;font-weight:400;font-size:260px;line-height:1;color:#ffffff;letter-spacing:0.005em;white-space:nowrap">COMO</span>
</div>`;

// ─── Style 2: KNOCKOUT INTERLOCK (SVG mask) ───────────────────────────────
// White h with COMO Bungee letters CUT OUT (transparent) right through the
// MIDDLE of the h's body. Teal background shows through the COMO letters
// where they intersect the h.
const style2 = `
<svg width="${SIZE}" height="${SIZE}" viewBox="0 0 ${SIZE} ${SIZE}" xmlns="http://www.w3.org/2000/svg">
  <defs>
    <mask id="cutCOMO" maskUnits="userSpaceOnUse" x="0" y="0" width="${SIZE}" height="${SIZE}">
      <rect width="100%" height="100%" fill="white"/>
      <text x="${SIZE / 2}" y="640"
            font-family="Bungee, sans-serif" font-weight="400" font-size="220"
            text-anchor="middle" fill="black"
            letter-spacing="3">COMO</text>
    </mask>
  </defs>
  <rect width="100%" height="100%" fill="${TEAL}"/>
  <image href="${LOGO_URL}" x="180" y="60" width="664" height="904"
         preserveAspectRatio="xMidYMid meet"
         mask="url(#cutCOMO)"/>
</svg>`;

// ─── Style 3: DIAGONAL DYNAMIC CROSS ──────────────────────────────────────
// h centered + COMO Bungee tilted -8° crossing the h's body, white on navy.
const style3 = `
<div style="position:relative;width:${SIZE}px;height:${SIZE}px;background:${NAVY}">
  <img src="${LOGO_URL}" style="position:absolute;left:50%;top:100px;transform:translateX(-50%);height:740px"/>
  <span style="position:absolute;left:50%;top:500px;transform:translate(-50%,-50%) rotate(-8deg);font-family:Bungee,sans-serif;font-weight:400;font-size:200px;line-height:1;color:#ffffff;letter-spacing:0.005em;white-space:nowrap">COMO</span>
</div>`;

const experiments = [
  { name: "01-aggressive-fusion", body: style1 },
  { name: "02-knockout-interlock", body: style2 },
  { name: "03-diagonal-cross", body: style3 },
];

function pageHtml(s) {
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bungee&display=swap" rel="stylesheet">
<style>
  html, body { margin:0; padding:0; background: transparent; }
  #stage { width:${SIZE}px; height:${SIZE}px; }
</style></head>
<body><div id="stage">${s.body}</div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();

  for (const e of experiments) {
    await page.setContent(pageHtml(e), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const out = path.join(OUT_DIR, `overlap-${e.name}.png`);
    await page.locator("#stage").screenshot({ path: out });
    console.log("OK", out);
  }

  await browser.close();
})();
