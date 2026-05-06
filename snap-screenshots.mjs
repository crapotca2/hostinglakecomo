import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const { chromium } = require('C:/Program Files/nodejs/node_modules/playwright');

const pages = [
  ['properties-listing', 'http://localhost:3000/properties'],
  ['properties-detail', 'http://localhost:3000/properties/casa-di-miriam'],
  ['services', 'http://localhost:3000/services'],
  ['strumenti', 'http://localhost:3000/strumenti'],
  ['report', 'http://localhost:3000/report'],
  ['about', 'http://localhost:3000/about'],
  ['contact', 'http://localhost:3000/contact'],
];

const viewports = [
  ['desktop', 1280, 800],
  ['mobile', 360, 740],
];

const browser = await chromium.launch();
for (const [vpName, w, h] of viewports) {
  const ctx = await browser.newContext({ viewport: { width: w, height: h } });
  const page = await ctx.newPage();
  for (const [name, url] of pages) {
    await page.goto(url, { waitUntil: 'networkidle', timeout: 30000 });
    await page.waitForTimeout(500);
    const out = `C:/Users/Andrei/AppData/Local/Temp/hlc-screens/${vpName}-${name}.png`;
    await page.screenshot({ path: out, fullPage: true });
    console.log(`OK ${vpName} ${name}`);
  }
  await ctx.close();
}
await browser.close();
