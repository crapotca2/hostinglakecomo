"use client";

import {
  TrendingUp,
  Euro,
  Calendar,
  Sparkles,
  AlertCircle,
  PiggyBank,
  ExternalLink,
  BarChart3,
} from "lucide-react";

type MonthlyRow = {
  m: string;
  adr: number;
  occupancy: number;
  nights: number;
};

const MONTHLY: MonthlyRow[] = [
  { m: "Gen", adr: 135, occupancy: 25, nights: 8 },
  { m: "Feb", adr: 130, occupancy: 25, nights: 7 },
  { m: "Mar", adr: 145, occupancy: 30, nights: 9 },
  { m: "Apr", adr: 175, occupancy: 50, nights: 15 },
  { m: "Mag", adr: 210, occupancy: 65, nights: 20 },
  { m: "Giu", adr: 260, occupancy: 75, nights: 22 },
  { m: "Lug", adr: 310, occupancy: 90, nights: 28 },
  { m: "Ago", adr: 320, occupancy: 90, nights: 28 },
  { m: "Set", adr: 240, occupancy: 75, nights: 22 },
  { m: "Ott", adr: 175, occupancy: 50, nights: 15 },
  { m: "Nov", adr: 130, occupancy: 25, nights: 7 },
  { m: "Dic", adr: 145, occupancy: 30, nights: 9 },
];

const MAX_ADR = Math.max(...MONTHLY.map((m) => m.adr));
const TOTAL_NIGHTS = MONTHLY.reduce((s, m) => s + m.nights, 0);
const TOTAL_REVENUE = MONTHLY.reduce((s, m) => s + m.adr * m.nights, 0);
const TOTAL_OCCUPANCY = Math.round((TOTAL_NIGHTS / 365) * 100);
const BLENDED_ADR = Math.round(TOTAL_REVENUE / TOTAL_NIGHTS);

type CompetitorRow = {
  name: string;
  url?: string;
  bedrooms: number;
  estimatedNightly: number;
  notes: string;
  /** Indirizzo / zona ad Argegno confermata (controllo distintivo). */
  argegnoLocation: string;
};

// Competitor Airbnb scrapeati nei mesi recenti, ognuno con la locazione
// Argegno verificata leggendo description.txt + foto del listing.
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

const COSTS = {
  cleanings: {
    count: Math.round(TOTAL_NIGHTS / 4.5),
    fee: 80,
  },
  management: { rate: 0.2 },
  otaCommission: { rate: 0.08 },
  maintenance: { rate: 0.05 },
  utilities: { fixed: 1800 },
};

const COSTS_TOTAL =
  COSTS.cleanings.count * COSTS.cleanings.fee +
  Math.round(TOTAL_REVENUE * COSTS.management.rate) +
  Math.round(TOTAL_REVENUE * COSTS.otaCommission.rate) +
  Math.round(TOTAL_REVENUE * COSTS.maintenance.rate) +
  COSTS.utilities.fixed;

const NET_OWNER = TOTAL_REVENUE - COSTS_TOTAL;
const NET_YIELD_PCT = ((NET_OWNER / TOTAL_REVENUE) * 100).toFixed(0);

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
          Benchmark costruito sui listing pubblici di <strong>Argegno</strong> scaricati negli ultimi mesi da Airbnb e Booking, normalizzato per numero di camere, qualità di ristrutturazione e prossimità al lago. Le stime di occupancy e i prezzi mensili seguono il pattern stagionale del Lago di Como per case fronte acqua di fascia premium — picco luglio-agosto, alta da maggio a settembre, bassa da novembre a febbraio. Tutti i competitor riportati nella tabella sotto hanno indirizzo confermato ad Argegno (Piazza Roma, Via Milano, Piazza Giovanni Grandi, centro storico Telo).
        </p>
      </header>

      {/* KPI top row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={Euro}
          label="ADR medio annuo"
          value={`€${BLENDED_ADR}`}
          sub={`Range €130–320 mensile`}
          accent
        />
        <StatCard
          icon={Calendar}
          label="Notti prenotate stimate"
          value={`${TOTAL_NIGHTS}`}
          sub={`Occupancy media ~${TOTAL_OCCUPANCY}%`}
        />
        <StatCard
          icon={TrendingUp}
          label="Revenue lordo annuo"
          value={`€${TOTAL_REVENUE.toLocaleString("it-IT")}`}
          sub="Somma su 12 mesi"
        />
        <StatCard
          icon={PiggyBank}
          label="Netto stimato al proprietario"
          value={`€${NET_OWNER.toLocaleString("it-IT")}`}
          sub={`${NET_YIELD_PCT}% del lordo`}
        />
      </div>

      {/* Monthly histogram — ADR per notte mese per mese */}
      <div className="mb-8">
        <div className="flex items-center gap-2 mb-3">
          <BarChart3 className="h-4 w-4 text-primary" />
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary">
            Prezzo medio per notte — distribuzione mensile
          </h3>
        </div>
        <div className="rounded-xl border border-border/50 bg-gradient-to-b from-primary/[0.02] to-transparent p-5 sm:p-6">
          <div className="grid grid-cols-12 gap-1 sm:gap-2 items-end h-56">
            {MONTHLY.map((row) => {
              const heightPct = Math.round((row.adr / MAX_ADR) * 100);
              const isPeak = row.adr === MAX_ADR;
              return (
                <div
                  key={row.m}
                  className="flex flex-col items-center justify-end h-full gap-1.5 group"
                >
                  <span className="text-[10px] sm:text-xs font-semibold tabular-nums text-foreground opacity-0 group-hover:opacity-100 transition-opacity">
                    €{row.adr}
                  </span>
                  <div
                    className={`w-full rounded-t-md transition-all ${
                      isPeak
                        ? "bg-primary"
                        : "bg-primary/40 group-hover:bg-primary/70"
                    }`}
                    style={{ height: `${heightPct}%` }}
                    title={`${row.m}: €${row.adr}/notte · ${row.occupancy}% occupancy · ${row.nights} notti stimate`}
                  />
                  <span className="text-[10px] sm:text-xs font-medium text-muted-foreground">
                    {row.m}
                  </span>
                </div>
              );
            })}
          </div>
          <div className="mt-4 pt-4 border-t border-border/40 flex items-center justify-between flex-wrap gap-3 text-xs text-muted-foreground">
            <div className="flex items-center gap-4">
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary" />
                Picco stagionale (€{MAX_ADR}/notte · luglio-agosto)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="h-2.5 w-2.5 rounded-sm bg-primary/40" />
                Mesi standard
              </span>
            </div>
            <span>Hover sulle barre per dettagli mensili</span>
          </div>
        </div>
      </div>

      {/* Monthly table (revenue per month) */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          Breakdown mensile — notti, occupancy, revenue
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-3 py-3 font-semibold">Mese</th>
                <th className="px-3 py-3 font-semibold text-right">€/notte</th>
                <th className="px-3 py-3 font-semibold text-right">Occupancy</th>
                <th className="px-3 py-3 font-semibold text-right">Notti</th>
                <th className="px-3 py-3 font-semibold text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {MONTHLY.map((row) => (
                <tr key={row.m} className="hover:bg-muted/20">
                  <td className="px-3 py-3 font-medium">{row.m}</td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    €{row.adr}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {row.occupancy}%
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums">
                    {row.nights}
                  </td>
                  <td className="px-3 py-3 text-right tabular-nums font-semibold">
                    €{(row.adr * row.nights).toLocaleString("it-IT")}
                  </td>
                </tr>
              ))}
              <tr className="bg-primary/[0.04] font-semibold">
                <td className="px-3 py-3" colSpan={3}>
                  Totale annuo
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  {TOTAL_NIGHTS}
                </td>
                <td className="px-3 py-3 text-right tabular-nums text-primary">
                  €{TOTAL_REVENUE.toLocaleString("it-IT")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost breakdown + competitor positioning side by side on lg */}
      <div className="grid lg:grid-cols-2 gap-6 mb-8">
        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            Spese annue stimate
          </h3>
          <div className="rounded-xl border border-border/50 overflow-hidden">
            <table className="w-full text-sm">
              <tbody className="divide-y divide-border/50">
                <tr>
                  <td className="px-4 py-3">
                    <div className="font-medium">Pulizie</div>
                    <div className="text-xs text-muted-foreground">
                      {COSTS.cleanings.count} check-out × €{COSTS.cleanings.fee}{" "}
                      (pass-through al guest)
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    €
                    {(COSTS.cleanings.count * COSTS.cleanings.fee).toLocaleString(
                      "it-IT",
                    )}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <div className="font-medium">Gestione Host Como</div>
                    <div className="text-xs text-muted-foreground">
                      20% del lordo (full-service property management)
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    €
                    {Math.round(
                      TOTAL_REVENUE * COSTS.management.rate,
                    ).toLocaleString("it-IT")}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <div className="font-medium">Commissioni piattaforme</div>
                    <div className="text-xs text-muted-foreground">
                      ~8% media (Airbnb 3% + Booking 15% mix)
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    €
                    {Math.round(
                      TOTAL_REVENUE * COSTS.otaCommission.rate,
                    ).toLocaleString("it-IT")}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <div className="font-medium">Manutenzione + amenities</div>
                    <div className="text-xs text-muted-foreground">
                      5% del lordo (riparazioni, biancheria, kit cortesia)
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    €
                    {Math.round(
                      TOTAL_REVENUE * COSTS.maintenance.rate,
                    ).toLocaleString("it-IT")}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <div className="font-medium">
                      Utenze (luce, gas, WiFi, TARI)
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Stima fissa annua
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    €{COSTS.utilities.fixed.toLocaleString("it-IT")}
                  </td>
                </tr>
                <tr className="bg-muted/30 font-semibold">
                  <td className="px-4 py-3">Totale spese annue</td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    €{COSTS_TOTAL.toLocaleString("it-IT")}
                  </td>
                </tr>
                <tr className="bg-primary/[0.06] font-bold">
                  <td className="px-4 py-3 text-primary">
                    Netto stimato al proprietario
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums text-primary">
                    €{NET_OWNER.toLocaleString("it-IT")}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </div>

        <div>
          <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
            Posizionamento vs Argegno
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground mb-1">
                ADR medio 2BR Argegno
              </div>
              <div className="text-2xl font-bold tabular-nums">
                €{COMP_ADR_2BR}
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                {COMP_2BR.length} listing diretti confronto
              </div>
            </div>
            <div className="rounded-xl bg-primary/[0.08] p-4">
              <div className="text-xs text-primary mb-1">Casa del Pozzo</div>
              <div className="text-2xl font-bold text-primary tabular-nums">
                €{BLENDED_ADR}
              </div>
              <div className="text-xs text-primary/70 mt-1">
                +
                {Math.round(((BLENDED_ADR - COMP_ADR_2BR) / COMP_ADR_2BR) * 100)}
                % vs concorrenti 2BR
              </div>
            </div>
          </div>
          <p className="text-sm text-muted-foreground leading-relaxed">
            La concorrenza diretta 2BR è composta da{" "}
            <strong>Casa Hygge</strong> e <strong>Olga House</strong>, entrambe
            in centro Argegno ma non direttamente sul filo dell&apos;acqua. Il
            premium di Casa del Pozzo è giustificato da:{" "}
            <em>
              fronte lago vero (riflesso nell&apos;acqua), pontile galleggiante
              privato, doppio bagno privato, parcheggio personale automatizzato
            </em>{" "}
            e il pozzo rustico come elemento di differenziazione. ADR target
            sopra mercato locale ma in linea con il segmento &ldquo;waterfront
            premium&rdquo; del Lago di Como (€250–320/notte in alta stagione).
          </p>
        </div>
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
                <th className="px-3 py-3 font-semibold text-center">BR</th>
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
          su descrizione, foto, posizionamento e fascia. Occupancy proiettata
          su pattern stagionale tipico di Argegno fronte lago (estate ad alta
          intensità, inverno basso). Il totale di {TOTAL_NIGHTS} notti annue
          è coerente con un listing premium fronte lago al primo anno di
          operatività. Le proiezioni vanno ricalibrate dopo i primi 3-6 mesi
          di booking reali, quando avremo dati di pricing dinamico effettivi.
        </div>
      </div>
    </section>
  );
}
