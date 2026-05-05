import sharp from "sharp";
import fs from "node:fs/promises";
import path from "node:path";

const DIR = "public/images/listing/casa-di-miriam";
const MAX_W = 2000;
const JPEG_Q = 82;
const WEBP_Q = 80;

const files = (await fs.readdir(DIR))
  .filter((f) => /\.jpe?g$/i.test(f) && !f.includes(".min."))
  .sort();

let totalIn = 0;
let totalOut = 0;
const rows = [];

for (const file of files) {
  const inPath = path.join(DIR, file);
  const buf = await fs.readFile(inPath);
  totalIn += buf.length;

  const meta = await sharp(buf).metadata();
  const resize = meta.width > MAX_W ? { width: MAX_W } : null;

  const baseName = file.replace(/\.jpe?g$/i, "");
  const jpegOut = path.join(DIR, baseName + ".jpeg");
  const webpOut = path.join(DIR, baseName + ".webp");

  // Optimized JPEG (overwrite original)
  let jpegPipe = sharp(buf).rotate();
  if (resize) jpegPipe = jpegPipe.resize(resize);
  const jpegBuf = await jpegPipe
    .jpeg({ quality: JPEG_Q, mozjpeg: true, progressive: true })
    .toBuffer();
  await fs.writeFile(jpegOut, jpegBuf);

  // WebP variant
  let webpPipe = sharp(buf).rotate();
  if (resize) webpPipe = webpPipe.resize(resize);
  const webpBuf = await webpPipe.webp({ quality: WEBP_Q, effort: 5 }).toBuffer();
  await fs.writeFile(webpOut, webpBuf);

  totalOut += jpegBuf.length + webpBuf.length;
  rows.push({
    file,
    in: (buf.length / 1024).toFixed(0) + "K",
    jpeg: (jpegBuf.length / 1024).toFixed(0) + "K",
    webp: (webpBuf.length / 1024).toFixed(0) + "K",
    w: resize?.width ?? meta.width,
  });
}

console.table(rows);
console.log(
  `Total IN: ${(totalIn / 1024 / 1024).toFixed(2)} MB → OUT (jpeg+webp): ${(
    totalOut /
    1024 /
    1024
  ).toFixed(2)} MB`
);
