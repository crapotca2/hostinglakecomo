#!/usr/bin/env node
/**
 * Visit the EN deployment of hostinglakecomo.vercel.app and look for residual
 * Italian text on PUBLIC pages and AUTH-PROTECTED dashboard pages.
 *
 * Usage:
 *   node scripts/qa-i18n.mjs
 *
 * Set DASHBOARD_PASSWORD env var to override the default value (AirBibby2026!).
 */
import { createRequire } from "node:module";
const require = createRequire(import.meta.url);
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
const PASSWORD = process.env.DASHBOARD_PASSWORD ?? "AirBibby2026!";

const PUBLIC_PATHS = [
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
  "/en/strumenti/nome-proprieta",
  "/en/strumenti/welcome-letter",
  "/en/strumenti/percorso-maps",
  "/en/login",
];

const DASHBOARD_PATHS = [
  "/en/dashboard",
  "/en/dashboard/properties",
  "/en/dashboard/bookings",
  "/en/dashboard/calendar",
  "/en/dashboard/analytics",
  "/en/dashboard/reports",
  "/en/dashboard/reports/summary",
  "/en/dashboard/reports/detail",
  "/en/dashboard/reports/analysis",
  "/en/dashboard/reports/property-management",
  "/en/dashboard/reports/stay",
  "/en/dashboard/statements",
  "/en/dashboard/payments",
  "/en/dashboard/compliance",
  "/en/dashboard/settings",
];

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
  /\brendiconti\b/i,
  /\bgestiamo\b/i,
  /\bgestione\b/i,
  /\bclienti\b/i,
  /\btorna al sito\b/i,
  /\besci\b/i,
  /\bbuongiorno\b/i,
  /\bbuonasera\b/i,
  /\bcerca\b/i,
  /\bprenotazione\b/i,
  /\bprenotazioni\b/i,
  /\bcalendario\b/i,
  /\bpagamenti\b/i,
  /\bimpostazioni\b/i,
  /\boccupazione\b/i,
  /\bin attesa\b/i,
  /\bconfermata\b/i,
  /\bconfermato\b/i,
  /\bdiretto\b/i,
  /\bcanale\b/i,
  /\bcanali\b/i,
  /\bnotti\b/i,
  /\bpanoramica\b/i,
  /\bsoggiorni\b/i,
  /\bvedi tutte\b/i,
  /\bvedi tutti\b/i,
  /\bappartamento\b/i,
  // "case" excluded: valid EN word ("in case of...")
  // "villa" excluded: valid EN word in real-estate context
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

async function checkPath(page, p) {
  const url = `${BASE}${p}`;
  let body = "";
  let status = 0;
  let finalUrl = "";
  try {
    const resp = await page.goto(url, {
      waitUntil: "domcontentloaded",
      timeout: 45000,
    });
    await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
    status = resp ? resp.status() : 0;
    finalUrl = page.url();
    body = (await page.evaluate(() => document.body?.innerText ?? "")) || "";
  } catch (err) {
    return { path: p, url, finalUrl, status, error: String(err.message || err), hits: [] };
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

  return { path: p, url, finalUrl, status, hits };
}

async function loginEN(page) {
  await page.goto(`${BASE}/en/login`, { waitUntil: "networkidle", timeout: 45000 });
  await page.fill('input[type="password"]', PASSWORD);
  await page.click('button[type="submit"]');
  // Wait for redirect to dashboard
  await page
    .waitForURL((u) => /\/dashboard/i.test(u.toString()), { timeout: 30000 })
    .catch(() => {});
  await page.waitForLoadState("networkidle", { timeout: 15000 }).catch(() => {});
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

  // 1) Public pages
  for (const p of PUBLIC_PATHS) {
    results.push(await checkPath(page, p));
  }

  // 2) Login then dashboard pages
  try {
    await loginEN(page);
  } catch (err) {
    console.error("Login failed:", err.message);
  }

  for (const p of DASHBOARD_PATHS) {
    results.push(await checkPath(page, p));
  }

  await browser.close();

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

  process.exitCode = review.length > 0 ? 1 : 0;
}

main().catch((err) => {
  console.error("qa-i18n failed:", err);
  process.exit(2);
});
