// Uses Gemini 2.5 Flash Image ("nano banana") to generate 3 logo overlap styles.
// Reads the white h logo as reference image and asks Gemini to compose
// h + "como" wordmark with different overlap treatments.
//
// Run:
//   $env:GEMINI_API_KEY = "<key>"
//   node scripts/gemini-logo-overlap.mjs

import { readFileSync, writeFileSync, mkdirSync, existsSync } from "fs";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, "..");
const LOGO_FILE = path.join(PROJECT_ROOT, "public/images/logo/logo-white.png");
const DESKTOP = path.join(os.homedir(), "Desktop");
const OUT_DIR = path.join(DESKTOP, "como-stickers-ai");

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Set GEMINI_API_KEY env var first.");
  process.exit(1);
}

const MODEL = "gemini-2.5-flash-image";
const ENDPOINT = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent?key=${API_KEY}`;

if (!existsSync(OUT_DIR)) mkdirSync(OUT_DIR, { recursive: true });

const logoB64 = readFileSync(LOGO_FILE).toString("base64");

const styles = [
  {
    name: "01-bungee-cross",
    prompt: `You are a senior brand designer. Generate a square 1024x1024 logo image.
The provided reference image shows a white lowercase "h" letterform with a small square dot above its right shoulder. Reproduce this h EXACTLY as shown — same proportions, same color (pure white), same construction with the dot.
COMPOSITION:
- Place the h centered in the upper 60% of the square canvas.
- Below it and OVERLAPPING the bottom third of the h, write the word "COMO" in bold uppercase chunky retro typography (similar to Google Font "Bungee" — flat slab-like sans, very thick strokes, perfectly geometric).
- The COMO is solid white, same color as the h.
- The COMO is slightly WIDER than the h itself, extending past both left and right edges of the h.
- Where the COMO letters overlap the h's white silhouette, they MERGE seamlessly into one continuous white shape (no internal lines or borders).
BACKGROUND: solid teal color #119DB0 filling the whole 1024x1024 square. No gradients, no patterns, no shadows.
Output only the final design, vector-flat style.`
  },
  {
    name: "02-yolo-interlock",
    prompt: `You are a senior brand designer. Generate a square 1024x1024 logo image.
The provided reference image shows a white lowercase "h" letterform with a small dot. Use it as the central design element.
COMPOSITION (YOLO-style interlocking):
- The h is solid white, centered.
- The word "COMO" in heavy uppercase bold sans-serif (like Bungee), also white, crosses HORIZONTALLY through the MIDDLE of the h. The COMO baseline aligns roughly with the h's mid-line.
- KEY EFFECT: where the COMO letters cross over the h, cut clean RECTANGULAR NOTCHES through both shapes — creating the impression that the letters are weaving through each other (like a puzzle interlock or YOLO-style typographic crossing). The notches reveal the background color through both the h and the COMO at the intersection points.
- COMO is slightly wider than the h, extending past its sides.
BACKGROUND: solid teal color #119DB0. Pure vector flat style, sharp edges, no gradients, no shadows.
Output only the final design.`
  },
  {
    name: "03-knockout-inside-h",
    prompt: `You are a senior brand designer. Generate a square 1024x1024 logo image.
The provided reference shows a white lowercase "h" letterform with a square dot. Reproduce it large and centered, occupying most of the canvas height.
COMPOSITION (knockout inside the h):
- The h is solid white.
- The word "COMO" in bold uppercase compact sans-serif typography (like Bungee), is KNOCKED OUT (cut out, transparent / showing background through) of the h's lower belly area.
- The COMO sits horizontally within the bottom curve/arch of the h, cropped on left and right by the h's vertical strokes — so only the part of COMO that falls INSIDE the h's silhouette is visible (as background-color cut-outs).
- The h itself remains a continuous solid white shape except for the negative-space COMO letters.
BACKGROUND: solid navy color #1D3A62 filling the canvas. Flat vector style, no gradients, no shadows.
Output only the final design.`
  },
];

async function generateOne(style) {
  console.log(`→ ${style.name} ...`);
  const res = await fetch(ENDPOINT, {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({
      contents: [{
        parts: [
          { text: style.prompt },
          { inline_data: { mime_type: "image/png", data: logoB64 } }
        ]
      }]
    })
  });

  if (!res.ok) {
    const txt = await res.text();
    console.error(`  HTTP ${res.status}:`, txt.slice(0, 400));
    return;
  }

  const data = await res.json();
  const parts = data?.candidates?.[0]?.content?.parts ?? [];
  const imagePart = parts.find(p => p.inline_data || p.inlineData);
  if (!imagePart) {
    const textPart = parts.find(p => p.text);
    console.error(`  no image in response. Text:`, (textPart?.text ?? JSON.stringify(data)).slice(0, 400));
    return;
  }

  const inline = imagePart.inline_data || imagePart.inlineData;
  const buf = Buffer.from(inline.data, "base64");
  const out = path.join(OUT_DIR, `${style.name}.png`);
  writeFileSync(out, buf);
  console.log(`  OK ${out} (${Math.round(buf.length / 1024)} KB)`);
}

for (const s of styles) {
  try {
    await generateOne(s);
  } catch (err) {
    console.error(`  ${s.name} failed:`, err.message);
  }
}
