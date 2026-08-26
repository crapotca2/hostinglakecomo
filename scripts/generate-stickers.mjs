// Generates a WhatsApp-compliant sticker pack: 12 stickers, 512x512 WebP.
//   6 stickers = h + como wordmark variants (white on navy/teal card)
//   6 stickers = Lago di Como photos (cropped to 460x460 square in rounded card)
//
// WhatsApp specs respected:
//   - 512x512 px exact
//   - WebP format
//   - < 100 KB per sticker
//   - Transparent outer canvas
//
// Output: ~/Desktop/como-stickers/sticker-NN-slug.webp + tray.png + index.html

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
const PUBLIC = path.join(PROJECT_ROOT, "public");
const DESKTOP = path.join(os.homedir(), "Desktop");
const OUT_DIR = path.join(DESKTOP, "como-stickers");

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });
for (const f of readdirSync(OUT_DIR)) unlinkSync(path.join(OUT_DIR, f));

// Embed assets as data URLs so Playwright doesn't need a file-server context.
const dataUrl = (rel, mime = "image/png") =>
  `data:${mime};base64,${readFileSync(path.join(PUBLIC, rel)).toString("base64")}`;

const LOGO_WHITE = dataUrl("images/logo/logo-white.png", "image/png");
const PHOTO_AERIAL_BOAT = dataUrl("images/como-lake-boat-2048x1366.jpg", "image/jpeg");
const PHOTO_SUNSET = dataUrl("images/footer-sunset.jpg", "image/jpeg");
const PHOTO_VISTA = dataUrl("images/listing/casa-di-miriam/02-vista-lago.webp", "image/webp");
const PHOTO_VILLAGE = dataUrl("images/banners/more-info.jpg", "image/jpeg");
const PHOTO_CLASSIC_BOAT = dataUrl("images/charter/barca-legno/barca-legno-hero.jpg", "image/jpeg");
const PHOTO_SPEED_BOAT = dataUrl("images/charter/speed-boat/speed-boat-hero.jpg", "image/jpeg");

const NAVY = "#1D3A62";
const TEAL = "#119DB0";
const WHITE = "#ffffff";

const SIZE = 512;
const CARD = 460;
const RADIUS = 56;

// Helper: photo-only sticker body (image fills the card; corners clipped by overflow:hidden).
const photo = (src, objectPosition = "center") =>
  `<img src="${src}" style="width:100%;height:100%;object-fit:cover;object-position:${objectPosition};display:block"/>`;

// 12 stickers: 6 logo variants + 6 lake photos.
const stickers = [
  // ─── h + como variants (white on navy/teal) ───
  {
    slug: "01-h-mark",
    body: `<img src="${LOGO_WHITE}" style="width:300px;height:auto;display:block"/>`,
  },
  {
    slug: "02-h-como-side",
    body: `
      <div style="display:flex;align-items:center;gap:14px">
        <img src="${LOGO_WHITE}" style="height:140px;width:auto;display:block"/>
        <span style="font-family:Outfit,sans-serif;font-weight:700;font-size:100px;line-height:0.9;color:${WHITE};letter-spacing:-0.02em">como</span>
      </div>`,
  },
  {
    slug: "03-h-como-bungee-overlap",
    bg: TEAL,
    body: `
      <div style="position:relative;width:420px;height:320px">
        <img src="${LOGO_WHITE}" style="position:absolute;left:50%;top:0;transform:translateX(-50%);height:300px"/>
        <span style="position:absolute;left:50%;top:190px;transform:translateX(-50%);font-family:Bungee,sans-serif;font-weight:400;font-size:108px;line-height:1;color:${NAVY};letter-spacing:0.02em;text-shadow:0 0 0 ${NAVY}">COMO</span>
      </div>`,
  },
  {
    slug: "04-h-como-stacked",
    body: `
      <div style="display:flex;flex-direction:column;align-items:center;gap:14px">
        <img src="${LOGO_WHITE}" style="height:210px;width:auto;display:block"/>
        <span style="font-family:Outfit,sans-serif;font-weight:500;font-size:56px;line-height:1;color:${WHITE};letter-spacing:0.5em;text-transform:uppercase;padding-left:0.5em">como</span>
      </div>`,
  },
  {
    slug: "05-h-como-overlap",
    body: `
      <div style="position:relative;width:380px;height:340px">
        <img src="${LOGO_WHITE}" style="position:absolute;left:50%;top:0;transform:translateX(-50%);height:300px"/>
        <span style="position:absolute;left:50%;bottom:0;transform:translateX(-50%);font-family:Outfit,sans-serif;font-weight:800;font-size:130px;line-height:1;color:${WHITE};letter-spacing:-0.02em">como</span>
      </div>`,
  },
  {
    slug: "06-h-como-italic",
    bg: TEAL,
    body: `
      <div style="display:flex;align-items:center;gap:14px">
        <img src="${LOGO_WHITE}" style="height:160px;width:auto;display:block"/>
        <span style="font-family:'Playfair Display',serif;font-weight:500;font-style:italic;font-size:120px;line-height:0.9;color:${WHITE};letter-spacing:-0.01em">como</span>
      </div>`,
  },
  // ─── Lago di Como photos (transparent card replaced by photo fill) ───
  { slug: "07-lake-aerial-boat",   photoOnly: true, body: photo(PHOTO_AERIAL_BOAT, "70% center") },
  { slug: "08-lake-sunset",        photoOnly: true, body: photo(PHOTO_SUNSET, "center 50%") },
  { slug: "09-lake-vista-como",    photoOnly: true, body: photo(PHOTO_VISTA, "center 60%") },
  { slug: "10-lake-village",       photoOnly: true, body: photo(PHOTO_VILLAGE, "60% center") },
  { slug: "11-lake-classic-boat",  photoOnly: true, body: photo(PHOTO_CLASSIC_BOAT, "center 30%") },
  { slug: "12-lake-speed-boat",    photoOnly: true, body: photo(PHOTO_SPEED_BOAT, "center center") },
];

function pageHtml(s) {
  const bg = s.photoOnly ? "transparent" : (s.bg ?? NAVY);
  return `<!doctype html>
<html><head>
<meta charset="utf-8" />
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Outfit:wght@500;700;800&family=Bungee&family=Playfair+Display:ital,wght@1,500&display=swap" rel="stylesheet">
<style>
  html, body { margin:0; padding:0; background: transparent; }
  #stage { width:${SIZE}px; height:${SIZE}px; display:flex; align-items:center; justify-content:center; }
  .card {
    width:${CARD}px; height:${CARD}px;
    background:${bg};
    border-radius:${RADIUS}px;
    display:flex; align-items:center; justify-content:center;
    text-align:center;
    overflow:hidden;
  }
</style></head>
<body><div id="stage"><div class="card">${s.body}</div></div></body></html>`;
}

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext({ deviceScaleFactor: 1 });
  const page = await context.newPage();

  const manifest = [];
  for (const s of stickers) {
    await page.setContent(pageHtml(s), { waitUntil: "networkidle" });
    await page.evaluate(() => document.fonts.ready);
    const pngBuf = await page.locator("#stage").screenshot({ omitBackground: true });

    const webpName = `sticker-${s.slug}.webp`;
    const webpPath = path.join(OUT_DIR, webpName);
    await sharp(pngBuf)
      .resize(SIZE, SIZE, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
      .webp({ quality: 85, effort: 6 })
      .toFile(webpPath);

    manifest.push({ slug: s.slug, file: webpName, photo: !!s.photoOnly });
    console.log("OK", webpName);
  }

  // Tray icon (96x96 PNG, < 50KB) — uses the h-mark sticker.
  await page.setContent(pageHtml(stickers[0]), { waitUntil: "networkidle" });
  await page.evaluate(() => document.fonts.ready);
  const trayBuf = await page.locator("#stage").screenshot({ omitBackground: true });
  await sharp(trayBuf)
    .resize(96, 96)
    .png({ compressionLevel: 9, palette: true })
    .toFile(path.join(OUT_DIR, "tray.png"));
  console.log("OK tray.png");

  // index.html preview grid.
  const previewHtml = `<!doctype html>
<html><head><meta charset="utf-8"><title>Como Host — Sticker Pack</title>
<style>
  body { margin:0; padding:40px; background:#e5e7eb; font-family:system-ui,sans-serif; }
  h1 { font-size:28px; margin:0 0 8px }
  p.sub { color:#6b7280; margin:0 0 32px; font-size:14px }
  .grid { display:grid; grid-template-columns:repeat(auto-fit,minmax(200px,1fr)); gap:16px }
  .card { background:#fff; border-radius:14px; padding:14px; box-shadow:0 1px 2px rgba(0,0,0,.06) }
  .card img { width:100%; height:auto; display:block; background:transparent }
  .card p { margin:10px 0 0; font-size:11px; color:#374151; text-align:center; font-family:ui-monospace,Menlo,monospace }
  .tag { display:inline-block; font-size:9px; padding:2px 6px; border-radius:4px; margin-left:4px }
  .tag.logo { background:#1D3A62; color:#fff }
  .tag.photo { background:#119DB0; color:#fff }
</style></head>
<body>
<h1>Como Host — Sticker Pack (12)</h1>
<p class="sub">512×512 WebP · WhatsApp-compliant · 6 logo variants + 6 Lago di Como photos</p>
<div class="grid">
${manifest.map((m) => `  <div class="card"><img src="${m.file}" alt="${m.slug}"/><p>${m.slug}<span class="tag ${m.photo ? "photo" : "logo"}">${m.photo ? "PHOTO" : "LOGO"}</span></p></div>`).join("\n")}
</div>
</body></html>`;
  writeFileSync(path.join(OUT_DIR, "index.html"), previewHtml);
  console.log("OK index.html");

  await browser.close();
})();
