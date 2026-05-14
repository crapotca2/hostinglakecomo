#!/usr/bin/env node
// Builds the complete favicon set from the master logo at Assets/Logo/White.png.
// Outputs:
//   src/app/icon.svg          (navy bg + base64-embedded white logo, vector container)
//   src/app/icon1.png         (512x512 navy + centered white logo, modern PNG fallback)
//   src/app/apple-icon.png    (180x180 navy + centered white logo, replaces apple-icon.tsx)
//   public/favicon.ico        (multi-resolution 16+32+48 from the SVG)
//
// Run: npm run favicon:generate

import { readFile, writeFile, unlink } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const SOURCE_LOGO = resolve(ROOT, "Assets/Logo/White.png");
const NAVY = "#1D3A62";

const SVG_OUT = resolve(ROOT, "src/app/icon.svg");
const PNG_512_OUT = resolve(ROOT, "src/app/icon1.png");
const APPLE_PNG_OUT = resolve(ROOT, "src/app/apple-icon.png");
const FAVICON_ICO_OUT = resolve(ROOT, "public/favicon.ico");
const APPLE_TSX_OUT = resolve(ROOT, "src/app/apple-icon.tsx");

const ICO_SIZES = [16, 32, 48];

// Padding around the logo as fraction of canvas (logo is then sized to 1 - 2*pad).
const LOGO_PAD = 0.14;

async function buildLogoOnNavy(canvasSize) {
  const logoSize = Math.round(canvasSize * (1 - 2 * LOGO_PAD));
  const offset = Math.round((canvasSize - logoSize) / 2);

  const logoBuffer = await sharp(SOURCE_LOGO)
    .resize(logoSize, logoSize, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png()
    .toBuffer();

  return sharp({
    create: {
      width: canvasSize,
      height: canvasSize,
      channels: 4,
      background: NAVY,
    },
  })
    .composite([{ input: logoBuffer, top: offset, left: offset }])
    .png({ compressionLevel: 9 })
    .toBuffer();
}

async function buildSvg() {
  // Embed a 128x128 PNG of the logo + navy bg, so the SVG renders crisply at any size.
  const png128 = await buildLogoOnNavy(128);
  const b64 = png128.toString("base64");
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 128 128" shape-rendering="geometricPrecision">
  <image width="128" height="128" href="data:image/png;base64,${b64}"/>
</svg>
`;
  await writeFile(SVG_OUT, svg);
  return Buffer.byteLength(svg, "utf8");
}

async function buildPngs() {
  const png512 = await buildLogoOnNavy(512);
  await writeFile(PNG_512_OUT, png512);

  const apple = await buildLogoOnNavy(180);
  await writeFile(APPLE_PNG_OUT, apple);

  return { png512: png512.length, apple: apple.length };
}

async function buildIco() {
  const pngs = await Promise.all(
    ICO_SIZES.map((size) => buildLogoOnNavy(size)),
  );
  const ico = await pngToIco(pngs);
  await writeFile(FAVICON_ICO_OUT, ico);
  return ico.length;
}

async function removeOldAppleTsx() {
  try {
    await unlink(APPLE_TSX_OUT);
    return true;
  } catch (err) {
    if (err.code === "ENOENT") return false;
    throw err;
  }
}

async function main() {
  const svgSize = await buildSvg();
  const { png512, apple } = await buildPngs();
  const icoSize = await buildIco();
  const removed = await removeOldAppleTsx();

  console.log("Generated favicon assets:");
  console.log(`  src/app/icon.svg          ${svgSize.toLocaleString()} bytes`);
  console.log(`  src/app/icon1.png         ${png512.toLocaleString()} bytes`);
  console.log(`  src/app/apple-icon.png    ${apple.toLocaleString()} bytes`);
  console.log(`  public/favicon.ico        ${icoSize.toLocaleString()} bytes (${ICO_SIZES.join("+")})`);
  if (removed) {
    console.log("  Removed obsolete src/app/apple-icon.tsx (Satori route no longer needed)");
  }
}

main().catch((err) => {
  console.error("[favicon:generate] failed:", err);
  process.exit(1);
});
