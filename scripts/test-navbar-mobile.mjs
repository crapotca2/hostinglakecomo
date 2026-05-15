#!/usr/bin/env node
/**
 * Header navbar QA — Playwright headless smoke test.
 *
 * Runs all interactive elements of the header on both mobile (iPhone SE)
 * and desktop (1280x800) viewports against a configurable base URL:
 *
 *   BASE_URL=http://localhost:3000 node scripts/test-navbar-mobile.mjs
 *   BASE_URL=https://hostcomo.com node scripts/test-navbar-mobile.mjs
 *
 * Writes pass/fail report to tmp/navbar-test-report.json. Screenshots of
 * any failure are saved alongside.
 */

import { chromium, devices } from "playwright";
import { writeFile, mkdir } from "node:fs/promises";
import { resolve, dirname } from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, "..");
const TMP = resolve(ROOT, "tmp");
const BASE = process.env.BASE_URL || "http://localhost:3000";

const NAV_ITEMS = [
  { label: "home", path: "/" },
  { label: "properties", path: "/properties" },
  { label: "services", path: "/services" },
  { label: "tools", path: "/strumenti" },
  { label: "about", path: "/about" },
  { label: "contact", path: "/contact" },
];

const LOCALES = ["it", "en", "ru"];

function localizedUrl(locale, path) {
  const prefix = locale === "it" ? "" : `/${locale}`;
  const clean = path === "/" ? "" : path;
  return `${BASE}${prefix}${clean || "/"}`;
}

function expectedPathPrefix(locale) {
  return locale === "it" ? "" : `/${locale}`;
}

const VIEWPORTS = {
  mobile: { ...devices["iPhone SE"], viewport: { width: 375, height: 667 } },
  desktop: { viewport: { width: 1280, height: 800 } },
};

const report = { base: BASE, startedAt: new Date().toISOString(), checks: [] };

function record(viewport, name, pass, detail = "") {
  const icon = pass ? "✓" : "✗";
  console.log(`  [${viewport}] ${icon} ${name}${detail ? ` — ${detail}` : ""}`);
  report.checks.push({ viewport, name, pass, detail });
}

async function snapFailure(page, viewport, slug) {
  const file = resolve(TMP, `fail-${viewport}-${slug}.png`);
  await page.screenshot({ path: file, fullPage: false });
  return file;
}

// Waits for full client-side hydration (next-intl + framer hydrate after the
// shell). Without this, click handlers on Radix buttons can be no-ops.
async function waitHydrated(page) {
  await page.waitForLoadState("networkidle");
  await page.waitForTimeout(300);
}

async function testHamburger(page, viewport) {
  if (viewport !== "mobile") return; // Hamburger only on <lg
  await page.goto(localizedUrl("it", "/"));
  await waitHydrated(page);

  const hamburger = page.locator('button[aria-label]').filter({
    has: page.locator("svg.lucide-menu"),
  }).first();

  const openVisible = await hamburger.isVisible();
  if (!openVisible) {
    record(viewport, "hamburger present", false);
    await snapFailure(page, viewport, "hamburger-missing");
    return;
  }

  await hamburger.click();
  await page.waitForTimeout(250);

  // Menu items should be visible after open
  const aboutItem = page.locator('a[href*="/about"]').first();
  const menuOpen = await aboutItem.isVisible();
  record(viewport, "hamburger opens mobile menu", menuOpen);
  if (!menuOpen) await snapFailure(page, viewport, "hamburger-open");

  // Click backdrop to close
  await page.locator('[aria-hidden="true"].fixed.inset-0').click({ force: true });
  await page.waitForTimeout(250);
  const stillVisible = await aboutItem.isVisible().catch(() => false);
  record(viewport, "hamburger closes via backdrop", !stillVisible);
}

async function testLogoLink(page, viewport) {
  await page.goto(localizedUrl("it", "/about"));
  await waitHydrated(page);

  const logo = page.locator('a[aria-label*="Como"]').first();
  await logo.click();
  await page.waitForURL((url) => url.pathname === "/", { timeout: 5000 });
  const pathname = new URL(page.url()).pathname;
  record(viewport, "logo navigates to home", pathname === "/", `pathname=${pathname}`);
}

async function testCtaButton(page, viewport) {
  await page.goto(localizedUrl("it", "/"));
  await waitHydrated(page);

  if (viewport === "mobile") {
    // Open hamburger first; CTA is inside mobile menu on <lg
    const hamburger = page.locator('button[aria-label]').filter({
      has: page.locator("svg.lucide-menu"),
    }).first();
    await hamburger.click();
    await page.waitForTimeout(250);
  }

  const cta = page.locator('a[href*="/contact?interest=consulenza"]').first();
  const visible = await cta.isVisible();
  if (!visible) {
    record(viewport, "CTA visible", false);
    await snapFailure(page, viewport, "cta-missing");
    return;
  }

  await cta.click();
  await page.waitForURL((url) => url.pathname.endsWith("/contact"), { timeout: 5000 });
  const u = new URL(page.url());
  record(
    viewport,
    "CTA navigates to /contact",
    u.pathname.endsWith("/contact") && u.search.includes("interest=consulenza"),
    `url=${u.pathname}${u.search}`,
  );
}

async function testNavItems(page, viewport) {
  for (const item of NAV_ITEMS) {
    await page.goto(localizedUrl("it", "/"));
    await waitHydrated(page);

    if (viewport === "mobile") {
      const hamburger = page.locator('button[aria-label]').filter({
        has: page.locator("svg.lucide-menu"),
      }).first();
      await hamburger.click();
      await page.waitForTimeout(250);
    }

    // Match nav link by href, scoped to the visible navigation (mobile menu
    // or desktop nav). The CTA link also points to /contact but uses a
    // query string; nav links don't.
    const link = page
      .locator(`a[href$="${item.path}"], a[href$="${item.path}/"]`)
      .filter({ hasNot: page.locator("svg.lucide-arrow-right") })
      .first();
    const visible = await link.isVisible().catch(() => false);
    if (!visible) {
      record(viewport, `nav: ${item.label}`, false, "link not visible");
      continue;
    }

    await link.click();
    try {
      await page.waitForURL(
        (url) => url.pathname === item.path || url.pathname === `${item.path}/`,
        { timeout: 5000 },
      );
      record(viewport, `nav: ${item.label}`, true);
    } catch {
      const p = new URL(page.url()).pathname;
      record(viewport, `nav: ${item.label}`, false, `landed on ${p}`);
      await snapFailure(page, viewport, `nav-${item.label}`);
    }
  }
}

async function testLanguageSwitch(page, viewport, from, to) {
  await page.goto(localizedUrl(from, "/about"));
  await waitHydrated(page);

  if (viewport === "mobile") {
    // Mobile uses dropdown — click trigger first
    const trigger = page
      .locator('button[aria-label]')
      .filter({ hasText: from.toUpperCase() })
      .first();
    const visible = await trigger.isVisible();
    if (!visible) {
      record(viewport, `lang ${from}→${to}: trigger`, false);
      await snapFailure(page, viewport, `lang-trigger-${from}`);
      return;
    }
    await trigger.click();
    await page.waitForTimeout(200);

    // Dropdown items appear in a portal
    const item = page.locator('[role="menuitem"]').filter({ hasText: to.toUpperCase() }).first();
    await item.click();
  } else {
    // Desktop uses button group — click the locale button directly
    const btn = page
      .locator('button[aria-pressed]')
      .filter({ hasText: to.toUpperCase() })
      .first();
    await btn.click();
  }

  try {
    const expectedPrefix = expectedPathPrefix(to);
    await page.waitForURL(
      (url) => {
        if (to === "it") return url.pathname === "/about";
        return url.pathname === `${expectedPrefix}/about`;
      },
      { timeout: 5000 },
    );
    const htmlLang = await page.evaluate(() => document.documentElement.lang);
    const ok = htmlLang === to;
    record(viewport, `lang ${from}→${to}`, ok, `html[lang]=${htmlLang}`);
    if (!ok) await snapFailure(page, viewport, `lang-${from}-to-${to}`);
  } catch {
    const p = new URL(page.url()).pathname;
    record(viewport, `lang ${from}→${to}`, false, `landed on ${p}`);
    await snapFailure(page, viewport, `lang-${from}-to-${to}`);
  }
}

async function runViewport(browser, viewport) {
  console.log(`\n=== ${viewport.toUpperCase()} (${BASE}) ===`);
  const context = await browser.newContext(VIEWPORTS[viewport]);
  const page = await context.newPage();

  try {
    await testLogoLink(page, viewport);
    await testHamburger(page, viewport);
    await testCtaButton(page, viewport);
    await testNavItems(page, viewport);

    // All 6 locale switch combinations
    const combos = [];
    for (const from of LOCALES) {
      for (const to of LOCALES) {
        if (from !== to) combos.push([from, to]);
      }
    }
    for (const [from, to] of combos) {
      await testLanguageSwitch(page, viewport, from, to);
    }
  } finally {
    await context.close();
  }
}

async function main() {
  await mkdir(TMP, { recursive: true });
  const browser = await chromium.launch({ headless: true });

  try {
    await runViewport(browser, "mobile");
    await runViewport(browser, "desktop");
  } finally {
    await browser.close();
  }

  report.finishedAt = new Date().toISOString();
  const passed = report.checks.filter((c) => c.pass).length;
  const failed = report.checks.length - passed;
  report.summary = { total: report.checks.length, passed, failed };

  await writeFile(
    resolve(TMP, "navbar-test-report.json"),
    JSON.stringify(report, null, 2),
  );

  console.log(`\n=== SUMMARY ===`);
  console.log(`Total:  ${report.checks.length}`);
  console.log(`Passed: ${passed}`);
  console.log(`Failed: ${failed}`);
  if (failed > 0) {
    console.log("\nFailures:");
    for (const c of report.checks.filter((c) => !c.pass)) {
      console.log(`  [${c.viewport}] ${c.name}: ${c.detail}`);
    }
    process.exit(1);
  }
}

main().catch((err) => {
  console.error("[test-navbar-mobile] fatal:", err);
  process.exit(1);
});
