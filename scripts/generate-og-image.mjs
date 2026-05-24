#!/usr/bin/env node
// Generates the global Open Graph image (preview shown on WhatsApp/Slack/
// Telegram/Facebook when someone shares a Host Como link).
//
// Output: public/images/og-default.png (1200×630 — standard OG format)
//
// Composition (same brand feel as the favicon):
//   - Background: public/images/textures/como-trama.jpg resized to 1200×630
//   - Overlay: navy #1D3A62 at ~85% opacity for readability + brand
//     coherence (matches favicon bg, manifest theme_color, footer accent)
//   - Logo: Assets/Logo/White.png centered, ~38% of canvas width
//
// Run: npm run og:generate
// Used by: src/lib/seo.ts → DEFAULT_OG_IMAGE
//
// Note on size: WhatsApp/Telegram show the OG at ~400px wide. The 1200×630
// source gives crisp render on retina + Facebook large preview without
// bloating the file (we target ~120-180 KB PNG).

import sharp from "sharp";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");

const TEXTURE = resolve(ROOT, "public/images/textures/como-trama.jpg");
const LOGO = resolve(ROOT, "Assets/Logo/White.png");
const OUT = resolve(ROOT, "public/images/og-default.png");

const WIDTH = 1200;
const HEIGHT = 630;
const NAVY = { r: 0x1d, g: 0x3a, b: 0x62, alpha: 0.85 };
// Logo size as fraction of canvas width. 0.38 = ~456 px, big enough to read
// at 400px WhatsApp preview but with breathing room top/bottom.
const LOGO_WIDTH_FRACTION = 0.38;

async function main() {
  const logoTargetWidth = Math.round(WIDTH * LOGO_WIDTH_FRACTION);

  // 1) Resize and fit-cover the texture to the OG canvas
  const textureBuffer = await sharp(TEXTURE)
    .resize(WIDTH, HEIGHT, { fit: "cover", position: "center" })
    .toBuffer();

  // 2) Build the navy overlay (full canvas, semi-transparent)
  const overlayBuffer = await sharp({
    create: {
      width: WIDTH,
      height: HEIGHT,
      channels: 4,
      background: NAVY,
    },
  })
    .png()
    .toBuffer();

  // 3) Resize the white logo to target width (keep aspect ratio)
  const logoMeta = await sharp(LOGO).metadata();
  const logoAspect = (logoMeta.height ?? 1) / (logoMeta.width ?? 1);
  const logoH = Math.round(logoTargetWidth * logoAspect);
  const logoBuffer = await sharp(LOGO)
    .resize(logoTargetWidth, logoH, {
      fit: "contain",
      background: { r: 0, g: 0, b: 0, alpha: 0 },
    })
    .png()
    .toBuffer();
  const logoLeft = Math.round((WIDTH - logoTargetWidth) / 2);
  const logoTop = Math.round((HEIGHT - logoH) / 2);

  // 4) Composite: texture → overlay → logo centered
  const out = await sharp(textureBuffer)
    .composite([
      { input: overlayBuffer, blend: "over" },
      { input: logoBuffer, top: logoTop, left: logoLeft },
    ])
    .png({ compressionLevel: 9 })
    .toFile(OUT);

  console.log(`Generated ${OUT}`);
  console.log(`  ${WIDTH}×${HEIGHT}  ${(out.size / 1024).toFixed(1)} KB`);
}

main().catch((err) => {
  console.error("[og:generate] failed:", err);
  process.exit(1);
});
