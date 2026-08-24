// Genera il PDF del rendiconto owner + stampa i KPI della pagina Rendiconti,
// usando il CODICE REALE del portale (getStatementData + renderStatementPdf +
// getMonthlyPayouts) sui dati seed di Alessandro Splendore.
//
// USO (tsx da agentic-web, tsconfig override per JSX):
//   MONGODB_URI="…" MONGODB_DB=air_bibby \
//     node <agentic>/node_modules/tsx/dist/cli.mjs \
//       --tsconfig scripts/tsconfig.render.json scripts/render-splendore-july.mts

import { writeFileSync } from "node:fs";
import { getStatementData } from "../src/lib/reports/pdf/statement-data";
import { renderStatementPdf } from "../src/lib/reports/pdf/statement";
import { getMonthlyPayouts } from "../src/lib/reports/payout";

const OWNER = "000000000000000000000010";
const PERIOD = "2026-07";

async function main() {
  const data = await getStatementData(OWNER, PERIOD, new Date().toISOString());
  if (!data) {
    console.error("nessun dato per", OWNER, PERIOD);
    process.exit(1);
  }
  const pdf = await renderStatementPdf(data);
  const out = process.env.OUT || "./rendiconto-splendore-2026-07.pdf";
  writeFileSync(out, pdf);
  console.log("✅ PDF:", out, `(${pdf.length} bytes)`);
  console.log("\nTotali rendiconto (PDF):", JSON.stringify(data.totals));
  const kpi = await getMonthlyPayouts(2026, OWNER);
  console.log("\nKPI pagina Rendiconti:", JSON.stringify(kpi, null, 2));
  process.exit(0);
}

main().catch((e) => {
  console.error("ERR", e);
  process.exit(1);
});
