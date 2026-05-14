// Importa le 22 foto da C:\Users\Andrei\Desktop\LakeComoCharter, le ridimensiona
// max 1600px lato lungo, genera WebP qualità 80 + JPG fallback compresso, e le
// suddivide per categoria in public/images/charter/{slug}/.
// La prima foto di ogni categoria diventa "hero" (usata nelle card della home),
// le altre vanno in /gallery/ per uso futuro.
// Esegui con: node scripts/import-charter-photos.mjs

import sharp from "sharp";
import { existsSync, mkdirSync, readdirSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");

const SRC_BASE = "C:\\Users\\Andrei\\Desktop\\LakeComoCharter";
const OUT_BASE = path.join(root, "public", "images", "charter");

const CATEGORIES = [
  { dir: "Barca Legno", slug: "barca-legno" },
  { dir: "Speed Boat", slug: "speed-boat" },
  { dir: "Taxi Boat", slug: "taxi-boat" },
];

const MAX_WIDTH_HERO = 1600;
const MAX_WIDTH_GALLERY = 1280;
const WEBP_QUALITY = 80;
const JPG_QUALITY = 78;

const fmt = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const sizeOf = (p) => (existsSync(p) ? statSync(p).size : 0);

function ensureDir(dir) {
  if (!existsSync(dir)) mkdirSync(dir, { recursive: true });
}

async function processOne(srcPath, outBase, maxWidth) {
  const before = sizeOf(srcPath);
  await sharp(srcPath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality: WEBP_QUALITY, effort: 6 })
    .toFile(`${outBase}.webp`);
  await sharp(srcPath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .jpeg({ quality: JPG_QUALITY, mozjpeg: true })
    .toFile(`${outBase}.jpg`);
  const webp = sizeOf(`${outBase}.webp`);
  const jpg = sizeOf(`${outBase}.jpg`);
  return { before, webp, jpg };
}

async function main() {
  if (!existsSync(SRC_BASE)) {
    console.error(`Cartella sorgente non trovata: ${SRC_BASE}`);
    process.exit(1);
  }

  for (const { dir, slug } of CATEGORIES) {
    const srcDir = path.join(SRC_BASE, dir);
    if (!existsSync(srcDir)) {
      console.warn(`Manca: ${srcDir} → skip`);
      continue;
    }

    const outDir = path.join(OUT_BASE, slug);
    const galleryDir = path.join(outDir, "gallery");
    ensureDir(outDir);
    ensureDir(galleryDir);

    const files = readdirSync(srcDir)
      .filter((f) => /\.(jpe?g|png|webp)$/i.test(f))
      .sort();

    console.log(`\n— ${dir} (${files.length} foto) → ${slug}/ —`);

    let totalBefore = 0;
    let totalAfter = 0;

    for (let i = 0; i < files.length; i++) {
      const srcPath = path.join(srcDir, files[i]);
      const isHero = i === 0;
      const outBase = isHero
        ? path.join(outDir, `${slug}-hero`)
        : path.join(galleryDir, `${slug}-${String(i).padStart(2, "0")}`);
      const maxWidth = isHero ? MAX_WIDTH_HERO : MAX_WIDTH_GALLERY;
      const { before, webp, jpg } = await processOne(srcPath, outBase, maxWidth);
      totalBefore += before;
      totalAfter += webp;
      console.log(
        `  ${isHero ? "[HERO]" : "      "} ${files[i].substring(0, 50).padEnd(50)} ${fmt(before).padStart(10)} → webp ${fmt(webp).padStart(10)} + jpg ${fmt(jpg).padStart(10)}`,
      );
    }

    console.log(`  Subtotale categoria: ${fmt(totalBefore)} → ${fmt(totalAfter)} WebP`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
