#!/usr/bin/env node
/**
 * Visit the EN deployment of hostinglakecomo.vercel.app and look for residual
 * Italian text. Patterns are intentionally biased toward function words and
 * marketing verbs that almost never appear in genuine UK English copy on this
 * site. Output is a Markdown report grouped by "OK" vs "needs review".
 *
 * Usage: node scripts/qa-i18n.mjs
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
// Resolve playwright from either a local install or the global Node modules dir.
let chromium;
try {
  ({ chromium } = require("playwright"));
} catch {
  const path = require("node:path");
  const fs = require("node:fs");
  const candidates = [
    process.env.PLAYWRIGHT_PATH,
    "C:/Program Files/nodejs/node_modules/playwright",
    path.join(process.env.APPDATA || "", "npm/node_modules/playwright"),
  ].filter(Boolean);
  let resolved = null;
  for (const c of candidates) {
    if (fs.existsSync(path.join(c, "package.json"))) {
      resolved = c;
      break;
    }
  }
  if (!resolved) {
    throw new Error(
      "playwright not found locally or globally. Install with: npm i -D playwright",
    );
  }
  ({ chromium } = require(resolved));
}

const BASE = process.env.QA_BASE_URL ?? "https://hostinglakecomo.vercel.app";

const PATHS = [
  "/en",
  "/en/about",
  "/en/services",
  "/en/contact",
  "/en/properties",
  "/en/properties/casa-di-miriam",
  "/en/strumenti",
  "/en/strumenti/rendita",
  "/en/strumenti/investimento",
  "/en/strumenti/profit-diretto",
  "/en/login",
  "/en/dashboard",
];

// Italian patterns. Word-boundary anchored where the form is also a valid EN
// substring (e.g. "anni" is in "manning" — we want \banni\b, not the substring).
const PATTERNS = [
  /\bproprieta\b/i,
  /\bproprietà\b/i,
  /\btutti gli\b/i,
  /\bservizi\b/i,
  /\brichiedi\b/i,
  /\bscopri\b/i,
  /\btariffa\b/i,
  /\btariffe\b/i,
  /\bricavi\b/i,
  /\banni\b/i,
  /\bospiti\b/i,
  /\bil tuo\b/i,
  /\bla tua\b/i,
  /\bil nostro\b/i,
  /\bvalutazione\b/i,
  /\bpulizia\b/i,
  /\baccoglienza\b/i,
  /\btassa di soggiorno\b/i,
  /\brendiconto\b/i,
  /\bgestiamo\b/i,
  /\bgestione\b/i,
  /\bclienti\b/i,
];

const PATTERN_LABELS = PATTERNS.map((re) =>
  re.source.replace(/\\b/g, "").replace(/\\/g, ""),
);

function snippet(text, idx, span = 50) {
  const start = Math.max(0, idx - span);
  const end = Math.min(text.length, idx + span);
  return (
    (start > 0 ? "..." : "") +
    text.slice(start, end).replace(/\s+/g, " ").trim() +
    (end < text.length ? "..." : "")
  );
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    userAgent:
      "Mozilla/5.0 (qa-i18n) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0 Safari/537.36",
    locale: "en-GB",
  });
  const page = await context.newPage();

  const results = [];

  for (const p of PATHS) {
    const url = `${BASE}${p}`;
    let body = "";
    let status = 0;
    let finalUrl = "";
    try {
      const resp = await page.goto(url, {
        waitUntil: "domcontentloaded",
        timeout: 45000,
      });
      // small idle wait for client-rendered content
      await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
      status = resp ? resp.status() : 0;
      finalUrl = page.url();
      body = (await page.evaluate(() => document.body?.innerText ?? "")) || "";
    } catch (err) {
      results.push({
        path: p,
        url,
        finalUrl,
        status,
        error: String(err.message || err),
        hits: [],
      });
      continue;
    }

    const hits = [];
    PATTERNS.forEach((re, i) => {
      const matches = [];
      const flags = re.flags.includes("g") ? re.flags : `${re.flags}g`;
      const reG = new RegExp(re.source, flags);
      let m;
      while ((m = reG.exec(body)) !== null) {
        matches.push({ index: m.index, match: m[0] });
        if (matches.length >= 3) break;
      }
      if (matches.length > 0) {
        hits.push({
          label: PATTERN_LABELS[i],
          count: matches.length,
          samples: matches.map((mm) => snippet(body, mm.index)),
        });
      }
    });

    results.push({ path: p, url, finalUrl, status, hits });
  }

  await browser.close();

  // -------- Report --------
  const ok = results.filter((r) => !r.error && r.hits.length === 0);
  const review = results.filter((r) => r.error || r.hits.length > 0);

  const lines = [];
  lines.push(`# QA i18n report`);
  lines.push(``);
  lines.push(`Base URL: \`${BASE}\``);
  lines.push(`Pages checked: ${results.length}`);
  lines.push(`OK: ${ok.length} — needs review: ${review.length}`);
  lines.push(``);

  lines.push(`## OK`);
  if (ok.length === 0) {
    lines.push(`(none)`);
  } else {
    for (const r of ok) {
      lines.push(`- \`${r.path}\` — status ${r.status}`);
    }
  }
  lines.push(``);

  lines.push(`## Needs review`);
  if (review.length === 0) {
    lines.push(`(none — all clear)`);
  } else {
    for (const r of review) {
      lines.push(`### \`${r.path}\``);
      lines.push(`- final URL: \`${r.finalUrl || r.url}\``);
      lines.push(`- HTTP: ${r.status}`);
      if (r.error) {
        lines.push(`- ERROR: ${r.error}`);
      }
      if (r.hits.length > 0) {
        for (const h of r.hits) {
          lines.push(`- **${h.label}** ×${h.count}`);
          for (const s of h.samples) {
            lines.push(`  - ${s}`);
          }
        }
      }
      lines.push(``);
    }
  }

  const report = lines.join("\n");
  console.log(report);

  // Exit non-zero if anything needs review (useful for CI)
  process.exitCode = review.length > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error("qa-i18n failed:", err);
  process.exit(2);
});
