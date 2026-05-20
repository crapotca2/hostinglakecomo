"use client";

import {
  TrendingUp,
  Euro,
  Sparkles,
  AlertCircle,
  BarChart3,
  Database,
} from "lucide-react";

type MonthlyRow = {
  m: string;
  /** Mediana Argegno scraped da pyairbnb (StaysSearch GraphQL Airbnb). */
  argegnoMedian: number;
  /** # listing Argegno con prezzo visibile per la finestra mid-month. */
  argegnoSampleN: number;
  /** Prezzo target Casa del Pozzo (= mediana Argegno × 1.15 premium). */
  targetAdr: number;
  /** Giorni del mese (per calcolo notti × occupancy). */
  days: number;
};

// Dataset reale: scraped 20 maggio 2026 con scrape_argegno_monthly.py.
// Bbox Argegno strict (lat 45.860–45.880, lon 9.110–9.135).
// Finestra mid-month sabato→sabato 7 notti per ogni mese.
// Casa del Pozzo target = mediana Argegno per mese (no premium): l'obiettivo
// è restare in linea col mercato standard del comune, non posizionarsi
// come premium tier. Coerente con un primo anno di operatività dove
// serve volume di booking per accumulare review.
const MONTHLY: MonthlyRow[] = [
  { m: "Gen", argegnoMedian: 192, argegnoSampleN: 63, targetAdr: 192, days: 31 },
  { m: "Feb", argegnoMedian: 207, argegnoSampleN: 50, targetAdr: 207, days: 28 },
  { m: "Mar", argegnoMedian: 208, argegnoSampleN: 49, targetAdr: 208, days: 31 },
  { m: "Apr", argegnoMedian: 212, argegnoSampleN: 61, targetAdr: 212, days: 30 },
  { m: "Mag", argegnoMedian: 220, argegnoSampleN: 38, targetAdr: 220, days: 31 },
  { m: "Giu", argegnoMedian: 249, argegnoSampleN: 31, targetAdr: 249, days: 30 },
  { m: "Lug", argegnoMedian: 256, argegnoSampleN: 31, targetAdr: 256, days: 31 },
  { m: "Ago", argegnoMedian: 267, argegnoSampleN: 29, targetAdr: 267, days: 31 },
  { m: "Set", argegnoMedian: 242, argegnoSampleN: 51, targetAdr: 242, days: 30 },
  { m: "Ott", argegnoMedian: 193, argegnoSampleN: 58, targetAdr: 193, days: 31 },
  { m: "Nov", argegnoMedian: 208, argegnoSampleN: 63, targetAdr: 208, days: 30 },
  { m: "Dic", argegnoMedian: 209, argegnoSampleN: 56, targetAdr: 209, days: 31 },
];

const MAX_ADR = Math.max(...MONTHLY.map((m) => m.targetAdr));
const TOTAL_SAMPLE = MONTHLY.reduce((s, m) => s + m.argegnoSampleN, 0);

// Annual revenue projection for 3 occupancy scenarios.
const OCCUPANCY_SCENARIOS = [50, 60, 70] as const;

type ScenarioRow = {
  occupancy: (typeof OCCUPANCY_SCENARIOS)[number];
  monthly: { m: string; nights: number; revenue: number }[];
  totalNights: number;
  totalRevenue: number;
};

const SCENARIOS: ScenarioRow[] = OCCUPANCY_SCENARIOS.map((occ) => {
  const monthly = MONTHLY.map((row) => {
    const nights = Math.round((row.days * occ) / 100);
    return { m: row.m, nights, revenue: nights * row.targetAdr };
  });
  const totalNights = monthly.reduce((s, r) => s + r.nights, 0);
  const totalRevenue = monthly.reduce((s, r) => s + r.revenue, 0);
  return { occupancy: occ, monthly, totalNights, totalRevenue };
});

const BASE_SCENARIO = SCENARIOS.find((s) => s.occupancy === 60)!;
const BLENDED_ADR = Math.round(
  BASE_SCENARIO.totalRevenue / BASE_SCENARIO.totalNights,
);

const ARGEGNO_BLENDED_MEDIAN = Math.round(
  MONTHLY.reduce((s, r) => s + r.argegnoMedian, 0) / MONTHLY.length,
);

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  accent,
}: {
  icon: typeof TrendingUp;
  label: string;
  value: string;
  sub?: string;
  accent?: boolean;
}) {
  return (
    <div
      className={`rounded-2xl p-5 border ${
        accent
          ? "bg-primary text-white border-primary"
          : "bg-white border-border/50"
      }`}
    >
      <div className="flex items-center gap-2 mb-3">
        <div
          className={`h-8 w-8 rounded-lg flex items-center justify-center ${
            accent ? "bg-white/15" : "bg-primary/[0.08]"
          }`}
        >
          <Icon
            className={`h-4 w-4 ${accent ? "text-white" : "text-primary"}`}
          />
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-white/85" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </div>
      <div
        className={`text-2xl sm:text-3xl font-bold mb-1 ${
          accent ? "" : "text-foreground"
        }`}
      >
        {value}
      </div>
      {sub && (
        <div
          className={`text-xs ${accent ? "text-white/85" : "text-muted-foreground"}`}
        >
          {sub}
        </div>
      )}
    </div>
  );
}

export function PotentialDashboard() {
  return (
    <section className="bg-white rounded-2xl border border-border/50 p-5 sm:p-8 mt-8">
      <header className="mb-6">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-primary/[0.08] text-primary text-xs font-semibold mb-3">
          <Sparkles className="h-3.5 w-3.5" />
          Demo · Valutazione potenziale di rendita
        </div>
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-3">
          Casa del Pozzo — proiezione annua
        </h2>
        <p className="text-sm sm:text-base text-muted-foreground leading-relaxed">
          Benchmark costruito su <strong>{TOTAL_SAMPLE} listing reali di Argegno</strong> scaricati direttamente dall&apos;API GraphQL StaysSearch di Airbnb (script <code className="bg-muted/60 px-1 rounded text-xs">pyairbnb</code>), una finestra settimanale mid-month per ogni mese da giugno 2026 a maggio 2027. Per ogni mese calcoliamo la <strong>mediana €/notte di Argegno</strong> e la usiamo come prezzo target per Casa del Pozzo: l&apos;obiettivo è restare <strong>in linea col mercato standard del comune</strong>, non posizionarsi come premium tier — coerente con un primo anno di operatività dove serve volume di booking per accumulare review e reputazione su Airbnb e Booking. Le pulizie sono fatturate al guest separatamente a <strong>€70 per prenotazione</strong> (pass-through, non riportate nei revenue lordi qui sotto).
        </p>
      </header>

      {/* KPI top row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={Euro}
          label="ADR medio annuo target"
          value={`€${BLENDED_ADR}`}
          sub={`In linea con mediana mercato Argegno`}
          accent
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue lordo @ 50%"
          value={`€${SCENARIOS[0].totalRevenue.toLocaleString("it-IT")}`}
          sub={`${SCENARIOS[0].totalNights} notti · scenario conservativo`}
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue lordo @ 60%"
          value={`€${SCENARIOS[1].totalRevenue.toLocaleString("it-IT")}`}
          sub={`${SCENARIOS[1].totalNights} notti · scenario base`}
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue lordo @ 70%"
          value={`€${SCENARIOS[2].totalRevenue.toLocaleString("it-IT")}`}
          sub={`${SCENARIOS[2].totalNights} notti · scenario premium`}
        />
      </div>

      {/* Monthly ADR histogram */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Prezzo target Casa del Pozzo — distribuzione mensile
          </h3>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-b from-primary/[0.02] to-transparent p-5 sm:p-6">
          <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end h-64">
            {MONTHLY.map((row) => {
              const heightPct = Math.round((row.targetAdr / MAX_ADR) * 100);
              const isPeak = row.targetAdr === MAX_ADR;
              return (
                <div
                  key={row.m}
                  className="flex flex-col items-center justify-end h-full gap-1.5 group"
                >
                  <span className="text-[10px] sm:text-xs font-semibold tabular-nums text-foreground">
                    €{row.targetAdr}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isPeak
                        ? "bg-primary"
                        : "bg-primary/40 group-hover:bg-primary/70"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${row.m}: target €${row.targetAdr}/notte (mediana Argegno €${row.argegnoMedian}, n=${row.argegnoSampleN})`}
                  />
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {row.m}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border/40 flex items-center gap-4 flex-wrap text-xs text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
              Picco stagionale (€{MAX_ADR}/notte · agosto)
            </span>
            <span className="flex items-center gap-1.5">
              <span className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
              Mesi standard
            </span>
            <span className="ml-auto">
              Tooltip su ogni barra mostra mediana Argegno + sample size
            </span>
          </div>
        </div>
      </div>

      {/* Occupancy scenario table */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          Revenue lordo per scenario di occupancy
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 font-semibold">Mese</th>
                <th className="px-3 py-3 font-semibold text-right">€/notte</th>
                <th
                  className="px-3 py-3 font-semibold text-right border-l border-border/30"
                  colSpan={2}
                >
                  Scenario 50%
                </th>
                <th
                  className="px-3 py-3 font-semibold text-right border-l border-border/30"
                  colSpan={2}
                >
                  Scenario 60%
                </th>
                <th
                  className="px-3 py-3 font-semibold text-right border-l border-border/30"
                  colSpan={2}
                >
                  Scenario 70%
                </th>
              </tr>
              <tr className="text-[10px] uppercase tracking-wider text-muted-foreground/70 border-t border-border/30">
                <th />
                <th />
                <th className="px-3 py-2 text-right border-l border-border/30">
                  Notti
                </th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-right border-l border-border/30">
                  Notti
                </th>
                <th className="px-3 py-2 text-right">Revenue</th>
                <th className="px-3 py-2 text-right border-l border-border/30">
                  Notti
                </th>
                <th className="px-3 py-2 text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {MONTHLY.map((row, idx) => (
                <tr key={row.m} className="hover:bg-muted/20">
                  <td className="px-3 py-3 font-medium">{row.m}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    €{row.targetAdr}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums border-l border-border/30 text-muted-foreground">
                    {SCENARIOS[0].monthly[idx].nights}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    €
                    {SCENARIOS[0].monthly[idx].revenue.toLocaleString("it-IT")}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums border-l border-border/30 text-muted-foreground">
                    {SCENARIOS[1].monthly[idx].nights}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    €
                    {SCENARIOS[1].monthly[idx].revenue.toLocaleString("it-IT")}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums border-l border-border/30 text-muted-foreground">
                    {SCENARIOS[2].monthly[idx].nights}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    €
                    {SCENARIOS[2].monthly[idx].revenue.toLocaleString("it-IT")}
                  </td>
                </tr>
              ))}
              <tr className="bg-primary/[0.04] font-semibold">
                <td className="px-3 py-3" colSpan={2}>
                  Totale annuo
                </td>
                <td className="px-3 py-3 text-right tabular-nums border-l border-border/30">
                  {SCENARIOS[0].totalNights}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  €{SCENARIOS[0].totalRevenue.toLocaleString("it-IT")}
                </td>
                <td className="px-3 py-3 text-right tabular-nums border-l border-border/30">
                  {SCENARIOS[1].totalNights}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-primary">
                  €{SCENARIOS[1].totalRevenue.toLocaleString("it-IT")}
                </td>
                <td className="px-3 py-3 text-right tabular-nums border-l border-border/30">
                  {SCENARIOS[2].totalNights}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-primary">
                  €{SCENARIOS[2].totalRevenue.toLocaleString("it-IT")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Real Argegno scraped data table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <Database className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Mediana €/notte Argegno — dati Airbnb reali (scrape pyairbnb)
          </h3>
        </div>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 font-semibold">Mese</th>
                <th className="px-3 py-3 font-semibold text-right">
                  # listing Argegno
                </th>
                <th className="px-3 py-3 font-semibold text-right">
                  Mediana €/notte Argegno
                </th>
                <th className="px-3 py-3 font-semibold text-right">
                  Target Casa del Pozzo
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {MONTHLY.map((row) => (
                <tr key={row.m} className="hover:bg-muted/20">
                  <td className="px-3 py-3 font-medium">{row.m}</td>
                  <td className="px-3 py-3 text-right tabular-nums text-muted-foreground">
                    {row.argegnoSampleN}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    €{row.argegnoMedian}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold text-primary">
                    €{row.targetAdr}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-semibold">
                <td className="px-3 py-3">Media campione</td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {Math.round(TOTAL_SAMPLE / MONTHLY.length)}
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  €{ARGEGNO_BLENDED_MEDIAN}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-primary">
                  €{BLENDED_ADR}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Methodology note */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-amber-900 leading-relaxed space-y-3">
          <p>
            <strong>Come abbiamo ricavato il prezzo medio per notte.</strong>{" "}
            Per ogni mese da giugno 2026 a maggio 2027 abbiamo lanciato lo
            script <code className="bg-amber-100 px-1 rounded text-xs">scrape_argegno_monthly.py</code>{" "}
            (basato su <code className="bg-amber-100 px-1 rounded text-xs">pyairbnb</code>, che
            interroga direttamente l&apos;endpoint GraphQL StaysSearch di Airbnb)
            su una finestra settimanale mid-month (sabato → sabato), bbox stretto
            del comune di Argegno (lat 45.860–45.880, lon 9.110–9.135).
            Abbiamo raccolto <strong>{TOTAL_SAMPLE} prezzi/notte reali</strong>{" "}
            distribuiti sui 12 mesi, calcolato la mediana per mese (più robusta
            della media perché smussa gli outlier delle ville di lusso), e
            l&apos;abbiamo usata direttamente come prezzo target per Casa del
            Pozzo. Nessun premium sopra mercato: la scelta è di entrare al primo
            anno in linea col mercato standard di Argegno per spingere il
            volume di booking e accumulare review (fattore #1 per la rank
            Airbnb nei mesi successivi).
          </p>
          <p>
            <strong>Caveat.</strong> I prezzi Airbnb sono dinamici e cambiano
            ogni giorno: questo è uno snapshot al 20 maggio 2026 e va rifatto
            ogni 60-90 giorni per restare allineato. La mediana Argegno include
            anche listing 1-camera e 3-camere, quindi il riferimento non è
            puro 2-camere — è un benchmark di comune.{" "}
            Le tre proiezioni di occupancy (50/60/70%) coprono l&apos;intero
            range plausibile: 50% conservativo (primo anno), 60% target di un
            listing ben gestito sul lago, 70% premium raggiungibile dal secondo
            anno con review accumulate. Da ricalibrare dopo i primi 3-6 mesi
            di booking reali.
          </p>
        </div>
      </div>
    </section>
  );
}
