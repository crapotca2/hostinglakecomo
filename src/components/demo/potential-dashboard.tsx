"use client";

import {
  TrendingUp,
  Euro,
  Sparkles,
  AlertCircle,
  ExternalLink,
  BarChart3,
} from "lucide-react";

type MonthlyAdr = {
  m: string;
  adr: number;
  days: number;
};

// Prezzo medio per notte mese per mese, ricalibrato: ogni mese sopra €200
// è stato abbassato di 10€ rispetto alla prima proiezione, per allinearsi
// al pricing dei competitor 2BR Argegno (Casa Hygge / Olga House).
const MONTHLY: MonthlyAdr[] = [
  { m: "Gen", adr: 135, days: 31 },
  { m: "Feb", adr: 130, days: 28 },
  { m: "Mar", adr: 145, days: 31 },
  { m: "Apr", adr: 175, days: 30 },
  { m: "Mag", adr: 200, days: 31 },
  { m: "Giu", adr: 250, days: 30 },
  { m: "Lug", adr: 300, days: 31 },
  { m: "Ago", adr: 310, days: 31 },
  { m: "Set", adr: 230, days: 30 },
  { m: "Ott", adr: 175, days: 31 },
  { m: "Nov", adr: 130, days: 30 },
  { m: "Dic", adr: 145, days: 31 },
];

const MAX_ADR = Math.max(...MONTHLY.map((m) => m.adr));

// Annual revenue projection for 3 occupancy scenarios. We round nights up
// to the nearest whole night per month (booking discretisation).
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
    return { m: row.m, nights, revenue: nights * row.adr };
  });
  const totalNights = monthly.reduce((s, r) => s + r.nights, 0);
  const totalRevenue = monthly.reduce((s, r) => s + r.revenue, 0);
  return { occupancy: occ, monthly, totalNights, totalRevenue };
});

const BASE_SCENARIO = SCENARIOS.find((s) => s.occupancy === 60)!;
const BLENDED_ADR = Math.round(
  BASE_SCENARIO.totalRevenue / BASE_SCENARIO.totalNights,
);

type CompetitorRow = {
  name: string;
  url?: string;
  bedrooms: number;
  estimatedNightly: number;
  notes: string;
  argegnoLocation: string;
};

const COMPETITORS: CompetitorRow[] = [
  {
    name: "Casa Hygge",
    url: "https://www.airbnb.com/rooms/1282644095134922931",
    bedrooms: 2,
    estimatedNightly: 210,
    notes: "Sopra la piazza principale, vista lago da finestra, no fronte acqua",
    argegnoLocation: "Piazza Roma, Argegno",
  },
  {
    name: "Olga House",
    url: "https://www.airbnb.com/rooms/24907620",
    bedrooms: 2,
    estimatedNightly: 195,
    notes: "Top floor mini-palazzo centro storico, garage extra a pagamento",
    argegnoLocation: "Piazza Roma, Argegno",
  },
  {
    name: "Charming House w/ private dock I",
    url: "https://www.airbnb.com/rooms/25619757",
    bedrooms: 1,
    estimatedNightly: 175,
    notes: "1 camera, divani rossi, libreria DIY, accesso al lago condiviso",
    argegnoLocation: "17 Via Milano, Argegno",
  },
  {
    name: "Charming House w/ private dock II",
    url: "https://www.airbnb.com/rooms/23346865",
    bedrooms: 1,
    estimatedNightly: 165,
    notes: "Arredo vintage eclettico, 1 camera, stessa villa di Charming I",
    argegnoLocation: "17 Via Milano, Argegno",
  },
  {
    name: "Argegno Fronte Lago (ex Le Vele)",
    url: "https://www.booking.com/hotel/it/le-vele-argegno.html",
    bedrooms: 4,
    estimatedNightly: 480,
    notes: "New build di lusso 4BR/4BA, segmento luxury (out of band)",
    argegnoLocation: "Piazza Giovanni Grandi 8, Argegno",
  },
  {
    name: "Petza Apartment",
    url: "https://www.airbnb.com/rooms/27087120",
    bedrooms: 1,
    estimatedNightly: 129,
    notes: "Piano terra lungo il Telo, 15m dal lago e dal Lido",
    argegnoLocation: "Centro storico Argegno (Telo)",
  },
  {
    name: "My Heart in Argegno",
    url: "https://www.airbnb.com/rooms/1095446294980500595",
    bedrooms: 3,
    estimatedNightly: 240,
    notes: "Casa storica 4 livelli sul Ponte Vecchio del Telo",
    argegnoLocation: "Centro storico Argegno",
  },
];

const COMP_2BR = COMPETITORS.filter((c) => c.bedrooms === 2);
const COMP_ADR_2BR = Math.round(
  COMP_2BR.reduce((s, c) => s + c.estimatedNightly, 0) / COMP_2BR.length,
);
const COMP_ADR_ALL = Math.round(
  COMPETITORS.reduce((s, c) => s + c.estimatedNightly, 0) / COMPETITORS.length,
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
          Benchmark costruito sui listing pubblici di <strong>Argegno</strong> scaricati negli ultimi mesi da Airbnb e Booking, normalizzato per numero di camere, qualità di ristrutturazione e prossimità al lago. I prezzi per notte mese per mese seguono il pattern stagionale del Lago di Como per case fronte acqua di fascia premium — picco luglio-agosto, alta da maggio a settembre, bassa da novembre a febbraio. Tutti i competitor riportati nella tabella in fondo hanno indirizzo confermato ad Argegno (Piazza Roma, Via Milano, Piazza Giovanni Grandi, centro storico Telo). Le pulizie sono fatturate al guest separatamente a <strong>€70 per prenotazione</strong> (pass-through, non riportate nei revenue lordi qui sotto).
        </p>
      </header>

      {/* KPI top row — only LORDO views, no net to owner */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={Euro}
          label="ADR medio annuo"
          value={`€${BLENDED_ADR}`}
          sub={`Range €130–310 mensile`}
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

      {/* Monthly ADR histogram — only the histogram, no breakdown table */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Prezzo medio per notte — distribuzione mensile
          </h3>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-b from-primary/[0.02] to-transparent p-5 sm:p-6">
          <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end h-64">
            {MONTHLY.map((row) => {
              const heightPct = Math.round((row.adr / MAX_ADR) * 100);
              const isPeak = row.adr === MAX_ADR;
              return (
                <div
                  key={row.m}
                  className="flex flex-col items-center justify-end h-full gap-1.5 group"
                >
                  <span className="text-[10px] sm:text-xs font-semibold tabular-nums text-foreground">
                    €{row.adr}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isPeak
                        ? "bg-primary"
                        : "bg-primary/40 group-hover:bg-primary/70"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${row.m}: €${row.adr}/notte`}
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
          </div>
        </div>
      </div>

      {/* Occupancy scenario table — revenue lordo per 50/60/70% */}
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
                    €{row.adr}
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

      {/* Positioning vs Argegno */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          Posizionamento vs Argegno
        </h3>
        <div className="grid sm:grid-cols-2 gap-3 mb-4">
          <div className="rounded-xl bg-muted/30 p-4">
            <div className="text-xs text-muted-foreground mb-1">
              ADR medio 2 camere Argegno
            </div>
            <div className="text-2xl font-bold tabular-nums">
              €{COMP_ADR_2BR}
            </div>
            <div className="text-xs text-muted-foreground mt-1">
              {COMP_2BR.length} listing diretti confronto (Casa Hygge, Olga House)
            </div>
          </div>
          <div className="rounded-xl bg-primary/[0.08] p-4">
            <div className="text-xs text-primary mb-1">
              Casa del Pozzo (ADR medio annuo)
            </div>
            <div className="text-2xl font-bold text-primary tabular-nums">
              €{BLENDED_ADR}
            </div>
            <div className="text-xs text-primary/70 mt-1">
              +
              {Math.round(((BLENDED_ADR - COMP_ADR_2BR) / COMP_ADR_2BR) * 100)}
              % vs concorrenti 2 camere
            </div>
          </div>
        </div>
        <p className="text-sm text-muted-foreground leading-relaxed">
          La concorrenza diretta a 2 camere è composta da{" "}
          <strong>Casa Hygge</strong> e <strong>Olga House</strong>, entrambe
          in centro Argegno ma non direttamente sul filo dell&apos;acqua. Il
          premium di Casa del Pozzo è giustificato da:{" "}
          <em>
            fronte lago vero (riflesso nell&apos;acqua), pontile galleggiante
            privato, doppio bagno privato, parcheggio personale automatizzato
          </em>{" "}
          e il pozzo rustico come elemento di differenziazione. ADR target
          sopra mercato locale ma in linea con il segmento &ldquo;waterfront
          premium&rdquo; del Lago di Como (€250–310/notte in alta stagione).
        </p>
      </div>

      {/* Competitor scrape table */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          Listing Argegno scrapeati (Airbnb · ultimi mesi)
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 font-semibold">Listing</th>
                <th className="px-3 py-3 font-semibold">Zona Argegno</th>
                <th className="px-3 py-3 font-semibold text-center">
                  Camere da letto
                </th>
                <th className="px-3 py-3 font-semibold text-right">€/notte</th>
                <th className="px-3 py-3 font-semibold">Note</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {COMPETITORS.map((c) => (
                <tr key={c.name} className="hover:bg-muted/20">
                  <td className="px-3 py-3">
                    {c.url ? (
                      <a
                        href={c.url}
                        target="_blank"
                        rel="noopener noreferrer nofollow"
                        className="font-medium hover:text-primary inline-flex items-center gap-1"
                      >
                        {c.name}
                        <ExternalLink className="h-3 w-3 opacity-60" />
                      </a>
                    ) : (
                      <span className="font-medium">{c.name}</span>
                    )}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {c.argegnoLocation}
                  </td>
                  <td className="px-3 py-3 text-center tabular-nums">
                    {c.bedrooms}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    €{c.estimatedNightly}
                  </td>
                  <td className="px-3 py-3 text-xs text-muted-foreground">
                    {c.notes}
                  </td>
                </tr>
              ))}
              <tr className="bg-muted/30 font-semibold">
                <td className="px-3 py-3" colSpan={3}>
                  Media campione ({COMPETITORS.length} listing Argegno)
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  €{COMP_ADR_ALL}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground italic">
                  range €129 – €480
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Disclaimer */}
      <div className="rounded-xl bg-amber-50 border border-amber-200 p-4 flex items-start gap-3 text-sm">
        <AlertCircle className="h-4 w-4 text-amber-600 shrink-0 mt-0.5" />
        <div className="text-amber-900 leading-relaxed">
          <strong>Note metodologiche.</strong> I prezzi competitor sono stimati
          dai listing pubblici Airbnb/Booking — non abbiamo accesso al pricing
          API real-time, quindi le stime per notte sono best-estimate basate
          su descrizione, foto, posizionamento e fascia. Le tre proiezioni
          (50%, 60%, 70% occupancy) coprono l&apos;intero range plausibile
          per un listing premium fronte lago: 50% è uno scenario conservativo
          tipico del primo anno operativo, 60% è la media di un listing ben
          gestito sul Lago di Como, 70% è il bersaglio raggiungibile dal
          secondo anno con review accumulate. Le proiezioni vanno ricalibrate
          dopo i primi 3-6 mesi di booking reali.
        </div>
      </div>
    </section>
  );
}
