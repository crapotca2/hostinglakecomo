// Generates 3 overlap styles ("como" + h logo) using SVG masks for true
// knockout effects, no AI image gen needed. Output: WhatsApp-compliant WebP.
//
// Style 1 — Pure merge       : white h + white COMO fused on teal card
// Style 2 — YOLO interlock   : both shapes have notches at crossings (bg shows through)
// Style 3 — COMO knockout    : COMO letters cut out of the h's lower body
//
// Output: ~/Desktop/como-overlap-svg/

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
const sharp = require("sharp");

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const LOGO_FILE = path.join(PROJECT_ROOT, "public/images/logo/logo-white.png");
const DESKTOP = path.join(os.homedir(), "Desktop");
const OUT_DIR = path.join(DESKTOP, "como-overlap-svg");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) unlinkSync(path.join(OUT_DIR, f));

// Pre-render a BLACK silhouette of the h (RGB→0, alpha preserved). Used inside
// SVG masks where SVG <filter> applied to <image> turns out to be flaky across
// engines. A real bitmap is rock-solid.
const { data: rgba, info: rawInfo } = await sharp(LOGO_FILE)
  .ensureAlpha()
  .raw()
  .toBuffer({ resolveWithObject: true });
for (let i = 0; i < rgba.length; i += 4) {
  rgba[i] = 0; rgba[i + 1] = 0; rgba[i + 2] = 0;
}
const blackHBuf = await sharp(rgba, {
  raw: { width: rawInfo.width, height: rawInfo.height, channels: 4 }
}).png().toBuffer();

const LOGO_WHITE = `data:image/png;base64,${readFileSync(LOGO_FILE).toString("base64")}`;
const LOGO_BLACK = `data:image/png;base64,${blackHBuf.toString("base64")}`;

const NAVY = "#1D3A62";
const TEAL = "#119DB0";

const SIZE = 512;
const CARD = 460;
const RADIUS = 56;

// h placement within the 460x460 card. Tweak these to control overlap geometry.
// NOTE: the white logo PNG has internal padding — the visible h occupies ~80% of the
// rendered area. We oversize H_H and place COMO baseline INSIDE the h's lower body.
const H_W = 280;
const H_H = 380;
const H_X = (CARD - H_W) / 2;       // 90
const H_Y = 20;                     // small top padding; visible h roughly y=50..360
const COMO_FONT = 116;
// SVG <text> y is the baseline. Put it deep in the h's belly so the cap height
// of COMO crosses the lower 40-50% of the h.
const COMO_BASELINE = 348;

// Style 1: pure merge — both white, fuse on overlap, no mask trickery.
function svgPureMerge() {
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD} ${CARD}" width="${CARD}" height="${CARD}">
  <rect width="${CARD}" height="${CARD}" fill="${TEAL}"/>
  <image href="${LOGO_WHITE}" x="${H_X}" y="${H_Y}" width="${H_W}" height="${H_H}"/>
  <text x="${CARD/2}" y="${COMO_BASELINE}"
        font-family="Bungee, Impact, sans-serif"
        font-weight="400" font-size="${COMO_FONT}"
        text-anchor="middle"
        fill="#ffffff">COMO</text>
</svg>`;
}

// Style 2: YOLO interlock — h has COMO knocked out, COMO has h knocked out.
// COMO crosses the MIDDLE of the h for maximum visible interlock cuts.
function svgYoloInterlock() {
  const S2_COMO_FONT = 130;
  const S2_COMO_BASELINE = 280; // baseline ~mid h, top of caps at ~170
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD} ${CARD}" width="${CARD}" height="${CARD}">
  <defs>
    <mask id="cutH" maskUnits="userSpaceOnUse" x="0" y="0" width="${CARD}" height="${CARD}">
      <rect width="${CARD}" height="${CARD}" fill="white"/>
      <image href="${LOGO_BLACK}" x="${H_X}" y="${H_Y}" width="${H_W}" height="${H_H}"/>
    </mask>

    <mask id="cutComo" maskUnits="userSpaceOnUse" x="0" y="0" width="${CARD}" height="${CARD}">
      <rect width="${CARD}" height="${CARD}" fill="white"/>
      <text x="${CARD/2}" y="${S2_COMO_BASELINE}"
            font-family="Bungee, Impact, sans-serif"
            font-weight="400" font-size="${S2_COMO_FONT}"
            text-anchor="middle"
            fill="black">COMO</text>
    </mask>
  </defs>

  <rect width="${CARD}" height="${CARD}" fill="${TEAL}"/>

  <image href="${LOGO_WHITE}" x="${H_X}" y="${H_Y}" width="${H_W}" height="${H_H}"
         mask="url(#cutComo)"/>

  <text x="${CARD/2}" y="${S2_COMO_BASELINE}"
        font-family="Bungee, Impact, sans-serif"
        font-weight="400" font-size="${S2_COMO_FONT}"
        text-anchor="middle"
        fill="#ffffff"
        mask="url(#cutH)">COMO</text>
</svg>`;
}

// Style 3: BIG COMO with h knockout — large COMO wordmark with the h
// silhouette punched through it (h is a hole, not a shape). The h is NOT
// rendered as a separate element. This reverses the hierarchy: the wordmark
// dominates, the h becomes negative space.
function svgKnockoutInsideH() {
  const COMO_BIG = 180;
  const COMO_BIG_BASELINE = CARD / 2 + COMO_BIG * 0.34;
  // Place a smaller h precisely centered over the middle of the COMO word
  // so its silhouette punches through the M (roughly).
  const H3_HEIGHT = 260;
  const H3_WIDTH = H3_HEIGHT * (H_W / H_H);
  const H3_X = (CARD - H3_WIDTH) / 2;
  const H3_Y = (CARD - H3_HEIGHT) / 2;
  return `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${CARD} ${CARD}" width="${CARD}" height="${CARD}">
  <defs>
    <mask id="cutH3" maskUnits="userSpaceOnUse" x="0" y="0" width="${CARD}" height="${CARD}">
      <rect width="${CARD}" height="${CARD}" fill="white"/>
      <image href="${LOGO_BLACK}" x="${H3_X}" y="${H3_Y}" width="${H3_WIDTH}" height="${H3_HEIGHT}"/>
    </mask>
  </defs>
  <rect width="${CARD}" height="${CARD}" fill="${NAVY}"/>
  <text x="${CARD/2}" y="${COMO_BIG_BASELINE}"
        font-family="Bungee, Impact, sans-serif"
        font-weight="400" font-size="${COMO_BIG}"
        text-anchor="middle"
        fill="#ffffff"
        mask="url(#cutH3)">COMO</text>
</svg>`;
}

const styles = [
  { slug: "01-pure-merge",       svg: svgPureMerge() },
  { slug: "02-yolo-interlock",   svg: svgYoloInterlock() },
  { slug: "03-knockout-inside",  svg: svgKnockoutInsideH() },
];

function pageHtml(svgInner) {
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Bungee&display=swap" rel="stylesheet">
<style>
  html, body { margin:0; padding:0; background: transparent; }
  #stage { width:${SIZE}px; height:${SIZE}px; display:flex; align-items:center; justify-content:center; }
  .card { width:${CARD}px; height:${CARD}px; border-radius:${RADIUS}px; overflow:hidden; }
</style></head>
<body><div id="stage"><div class="card">${svgInner}</div></div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();

  for (const s of styles) {
    await page.setContent(pageHtml(s.svg), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const pngBuf = await page.locator("#stage").screenshot({ omitBackground: true });
    const out = path.join(OUT_DIR, `overlap-${s.slug}.webp`);
    await sharp(pngBuf)
      .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 88, effort: 6 })
      .toFile(out);
    console.log("OK", out);
  }

  await browser.close();
})();
