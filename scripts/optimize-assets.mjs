// Ottimizzazione asset per PageSpeed mobile.
// Genera versioni WebP + PNG/JPG ottimizzate dei logo, texture e poster video.
// Esegui con: node scripts/optimize-assets.mjs

import sharp from "sharp";
import { execFileSync } from "node:child_process";
import { existsSync, statSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const pub = (p) => path.join(root, "public", p);

const fmt = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
const sizeOf = (p) => (existsSync(p) ? statSync(p).size : 0);

async function logoVariant(srcPath, outBase, size) {
  const before = sizeOf(srcPath);
  await sharp(srcPath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .webp({ quality: 88, effort: 6 })
    .toFile(`${outBase}.webp`);
  await sharp(srcPath)
    .resize(size, size, { fit: "contain", background: { r: 0, g: 0, b: 0, alpha: 0 } })
    .png({ compressionLevel: 9, palette: true })
    .toFile(`${outBase}.png`);
  const afterWebp = sizeOf(`${outBase}.webp`);
  const afterPng = sizeOf(`${outBase}.png`);
  console.log(
    `  ${path.basename(srcPath)}: ${fmt(before)} → webp ${fmt(afterWebp)} + png ${fmt(afterPng)}`,
  );
}

async function textureToWebp(srcPath, outWebp, quality = 78) {
  const before = sizeOf(srcPath);
  await sharp(srcPath).webp({ quality, effort: 6 }).toFile(outWebp);
  const after = sizeOf(outWebp);
  console.log(`  ${path.basename(srcPath)}: ${fmt(before)} → ${fmt(after)}`);
}

async function resizeAndWebp(srcPath, outWebp, width, height, quality = 82) {
  const before = sizeOf(srcPath);
  await sharp(srcPath)
    .resize(width, height, { fit: "inside", withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outWebp);
  const after = sizeOf(outWebp);
  console.log(`  ${path.basename(srcPath)}: ${fmt(before)} → ${fmt(after)} (${width}x${height})`);
}

async function recompressPoster(srcPath, outWebp, maxWidth = 1920, quality = 72) {
  const before = sizeOf(srcPath);
  await sharp(srcPath)
    .resize({ width: maxWidth, withoutEnlargement: true })
    .webp({ quality, effort: 6 })
    .toFile(outWebp);
  const after = sizeOf(outWebp);
  console.log(`  ${path.basename(srcPath)}: ${fmt(before)} → ${fmt(after)} (max ${maxWidth}px)`);
}

function compressVideo(srcPath, outPath, crf = 26, maxBitrate = "1800k") {
  if (!existsSync(srcPath)) {
    console.log(`  ${srcPath}: SKIP (non esiste)`);
    return;
  }
  const before = sizeOf(srcPath);
  try {
    execFileSync(
      "ffmpeg",
      [
        "-y",
        "-i",
        srcPath,
        "-c:v",
        "libx264",
        "-preset",
        "slow",
        "-crf",
        String(crf),
        "-maxrate",
        maxBitrate,
        "-bufsize",
        "3600k",
        "-vf",
        "scale='min(1280,iw)':-2",
        "-c:a",
        "aac",
        "-b:a",
        "96k",
        "-movflags",
        "+faststart",
        outPath,
      ],
      { stdio: ["ignore", "ignore", "ignore"] },
    );
    const after = sizeOf(outPath);
    console.log(`  ${path.basename(srcPath)}: ${fmt(before)} → ${fmt(after)} (CRF ${crf}, max ${maxBitrate})`);
  } catch (err) {
    console.error(`  ${path.basename(srcPath)}: ERRORE ffmpeg`, err.message);
  }
}

async function main() {
  console.log("\n— LOGO 256×256 (WebP + PNG fallback) —");
  await logoVariant(pub("images/logo/logo-marble.png"), pub("images/logo/logo-marble-256"), 256);
  await logoVariant(pub("images/logo/logo-white.png"), pub("images/logo/logo-white-256"), 256);

  console.log("\n— TEXTURE JPG → WebP —");
  await textureToWebp(pub("images/textures/como-trama.jpg"), pub("images/textures/como-trama.webp"));
  await textureToWebp(pub("images/textures/services-bg.jpg"), pub("images/textures/services-bg.webp"));

  console.log("\n— PARTNER lake-como-tourism (1024×690 → 290×196 WebP) —");
  await resizeAndWebp(
    pub("images/partners/lake-como-tourism.png"),
    pub("images/partners/lake-como-tourism.webp"),
    290,
    196,
    82,
  );

  console.log("\n— POSTER hero (479 KB → ~200 KB) —");
  await recompressPoster(
    pub("images/listing/casa-di-miriam/02-vista-lago.webp"),
    pub("images/listing/casa-di-miriam/02-vista-lago-1920w.webp"),
    1920,
    72,
  );

  console.log("\n— VIDEO hero (3.5 MB → ~1.8 MB) —");
  compressVideo(pub("hero-video.mp4"), pub("hero-video-compressed.mp4"), 26, "1800k");
  console.log(
    "  (output salvato come hero-video-compressed.mp4 — rinomina manualmente dopo verifica visiva)",
  );
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
