#!/usr/bin/env node
// Converte tutti i .jpeg/.jpg di una cartella in .webp affiancati (mantenendo l'originale).
// Usage: node scripts/jpeg-to-webp.mjs <directory>
import sharp from "sharp";
import { readdir, stat } from "node:fs/promises";
import path from "node:path";

const dir = process.argv[2];
if (!dir) {
  console.error("Usage: node scripts/jpeg-to-webp.mjs <directory>");
  process.exit(1);
}

const files = await readdir(dir);
const jpegs = files.filter((f) => /\.jpe?g$/i.test(f));

let converted = 0;
let skipped = 0;

for (const f of jpegs) {
  const inPath = path.join(dir, f);
  const outPath = path.join(dir, f.replace(/\.jpe?g$/i, ".webp"));
  try {
    await stat(outPath);
    console.log(`SKIP  ${path.basename(outPath)} (already exists)`);
    skipped++;
    continue;
  } catch {
    // does not exist yet
  }
  await sharp(inPath).webp({ quality: 82, effort: 6 }).toFile(outPath);
  console.log(`OK    ${path.basename(outPath)}`);
  converted++;
}

console.log(`---\nConverted: ${converted} · Skipped: ${skipped} · Total jpegs: ${jpegs.length}`);
