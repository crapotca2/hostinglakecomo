#!/usr/bin/env node
// Generates public/favicon.ico (multi-resolution 16+32+48) from src/app/icon.svg.
// Required because Google Favicons crawler looks for /favicon.ico first.
// Run: npm run favicon:generate

import { readFile, writeFile } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";
import sharp from "sharp";
import pngToIco from "png-to-ico";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const SVG_PATH = resolve(ROOT, "src/app/icon.svg");
const ICO_PATH = resolve(ROOT, "public/favicon.ico");

const SIZES = [16, 32, 48];

async function main() {
  const svg = await readFile(SVG_PATH);
  const pngs = await Promise.all(
    SIZES.map((size) =>
      sharp(svg, { density: 384 })
        .resize(size, size, { kernel: "lanczos3" })
        .png()
        .toBuffer(),
    ),
  );
  const ico = await pngToIco(pngs);
  await writeFile(ICO_PATH, ico);
  console.log(
    `Wrote ${ICO_PATH} (${ico.length.toLocaleString()} bytes, sizes ${SIZES.join("+")})`,
  );
}

main().catch((err) => {
  console.error("[favicon:generate] failed:", err);
  process.exit(1);
});
