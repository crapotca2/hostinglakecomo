"use client";

import {
  TrendingUp,
  Euro,
  Calendar,
  Sparkles,
  AlertCircle,
  PiggyBank,
  Star,
  ExternalLink,
} from "lucide-react";

type SeasonalRate = {
  label: string;
  monthsLabel: string;
  rate: number;
  occupancy: number;
  nights: number;
  revenue: number;
};

type CompetitorRow = {
  name: string;
  url?: string;
  bedrooms: number;
  rating?: number;
  reviews?: number;
  estimatedNightly: number;
  notes: string;
};

const SEASONAL: SeasonalRate[] = [
  {
    label: "Alta stagione",
    monthsLabel: "luglio–agosto",
    rate: 290,
    occupancy: 85,
    nights: 53,
    revenue: 15370,
  },
  {
    label: "Spalla alta",
    monthsLabel: "giugno, settembre",
    rate: 240,
    occupancy: 70,
    nights: 42,
    revenue: 10080,
  },
  {
    label: "Spalla bassa",
    monthsLabel: "maggio, ottobre",
    rate: 190,
    occupancy: 50,
    nights: 31,
    revenue: 5890,
  },
  {
    label: "Bassa stagione",
    monthsLabel: "novembre–aprile",
    rate: 140,
    occupancy: 22,
    nights: 40,
    revenue: 5600,
  },
];

const TOTAL_NIGHTS = SEASONAL.reduce((sum, s) => sum + s.nights, 0);
const TOTAL_REVENUE = SEASONAL.reduce((sum, s) => sum + s.revenue, 0);
const TOTAL_OCCUPANCY = Math.round((TOTAL_NIGHTS / 365) * 100);
const BLENDED_ADR = Math.round(TOTAL_REVENUE / TOTAL_NIGHTS);

const COMPETITORS: CompetitorRow[] = [
  {
    name: "Casa Hygge",
    url: "https://www.airbnb.com/rooms/1282644095134922931",
    bedrooms: 2,
    rating: undefined,
    reviews: undefined,
    estimatedNightly: 210,
    notes: "Piazza Roma, vista lago da finestra, no fronte acqua",
  },
  {
    name: "Olga House",
    url: "https://www.airbnb.com/rooms/24907620",
    bedrooms: 2,
    rating: undefined,
    estimatedNightly: 195,
    notes: "Centro storico, terzo piano sul lago, garage extra",
  },
  {
    name: "Charming House w/ private dock I",
    url: "https://www.airbnb.com/rooms/25619757",
    bedrooms: 1,
    estimatedNightly: 175,
    notes: "Stessa villa fronte lago di Via Milano, 1 camera, divani rossi",
  },
  {
    name: "Charming House w/ private dock II",
    url: "https://www.airbnb.com/rooms/23346865",
    bedrooms: 1,
    estimatedNightly: 165,
    notes: "Arredamento vintage eclettico, 1 camera",
  },
  {
    name: "Argegno Fronte Lago (ex Le Vele)",
    url: "https://www.booking.com/hotel/it/le-vele-argegno.html",
    bedrooms: 4,
    estimatedNightly: 480,
    notes: "New build di lusso 4BR/4BA, Piazza G. Grandi",
  },
  {
    name: "Petza Apartment",
    url: "https://www.airbnb.com/rooms/27087120",
    bedrooms: 1,
    estimatedNightly: 129,
    notes: "Piano terra sul Telo, 15m dal lago/lido",
  },
  {
    name: "My Heart in Argegno",
    url: "https://www.airbnb.com/rooms/1095446294980500595",
    bedrooms: 3,
    estimatedNightly: 240,
    notes: "Casa storica su 4 livelli sul ponte Telo, 3 camere",
  },
  {
    name: "Casa Argegno",
    url: "https://www.airbnb.com/rooms/900592195763141054",
    bedrooms: 1,
    estimatedNightly: 105,
    notes: "Interni datati, vista lago da terrazza ma non fronte acqua",
  },
];

const COMP_ADR_2BR = Math.round(
  COMPETITORS.filter((c) => c.bedrooms === 2).reduce(
    (s, c) => s + c.estimatedNightly,
    0,
  ) / COMPETITORS.filter((c) => c.bedrooms === 2).length,
);

const COMP_ADR_ALL = Math.round(
  COMPETITORS.reduce((s, c) => s + c.estimatedNightly, 0) / COMPETITORS.length,
);

const COSTS = {
  cleanings: { count: 30, fee: 80, total: 2400 },
  management: { rate: 0.2, total: Math.round(TOTAL_REVENUE * 0.2) },
  otaCommission: { rate: 0.08, total: Math.round(TOTAL_REVENUE * 0.08) },
  maintenance: { rate: 0.05, total: Math.round(TOTAL_REVENUE * 0.05) },
  utilities: { fixed: 1800 },
};

const COSTS_TOTAL =
  COSTS.cleanings.total +
  COSTS.management.total +
  COSTS.otaCommission.total +
  COSTS.maintenance.total +
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
          <Icon className={`h-4 w-4 ${accent ? "text-white" : "text-primary"}`} />
        </div>
        <span
          className={`text-xs font-semibold uppercase tracking-wider ${
            accent ? "text-white/85" : "text-muted-foreground"
          }`}
        >
          {label}
        </span>
      </div>
      <div className={`text-2xl sm:text-3xl font-bold mb-1 ${accent ? "" : "text-foreground"}`}>
        {value}
      </div>
      {sub && (
        <div className={`text-xs ${accent ? "text-white/85" : "text-muted-foreground"}`}>
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
        <h2 className="text-2xl sm:text-3xl font-semibold text-foreground mb-2">
          Casa del Pozzo — proiezione annua
        </h2>
        <p className="text-sm text-muted-foreground max-w-2xl">
          Benchmark basato sui listing pubblici Airbnb/Booking di Argegno
          scaricati negli ultimi mesi, normalizzato per numero di camere,
          qualità di ristrutturazione e prossimità al lago. Le stime di
          occupancy seguono il pattern stagionale del Lago di Como per case
          fronte acqua di tier premium.
        </p>
      </header>

      {/* KPI top row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 mb-8">
        <StatCard
          icon={Euro}
          label="ADR medio annuo"
          value={`€${BLENDED_ADR}`}
          sub={`Range €140–290 stagionale`}
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

      {/* Seasonal table */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-primary mb-3">
          Breakdown stagionale (12 mesi)
        </h3>
        <div className="overflow-x-auto rounded-xl border border-border/50">
          <table className="w-full text-sm">
            <thead className="bg-muted/40">
              <tr className="text-left text-xs uppercase tracking-wider text-muted-foreground">
                <th className="px-4 py-3 font-semibold">Periodo</th>
                <th className="px-4 py-3 font-semibold">Mesi</th>
                <th className="px-4 py-3 font-semibold text-right">€/notte</th>
                <th className="px-4 py-3 font-semibold text-right">Occupancy</th>
                <th className="px-4 py-3 font-semibold text-right">Notti</th>
                <th className="px-4 py-3 font-semibold text-right">Revenue</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/50">
              {SEASONAL.map((s) => (
                <tr key={s.label} className="hover:bg-muted/20">
                  <td className="px-4 py-3 font-medium">{s.label}</td>
                  <td className="px-4 py-3 text-muted-foreground">
                    {s.monthsLabel}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    €{s.rate}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {s.occupancy}%
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums">
                    {s.nights}
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    €{s.revenue.toLocaleString("it-IT")}
                  </td>
                </tr>
              ))}
              <tr className="bg-primary/[0.04] font-semibold">
                <td className="px-4 py-3" colSpan={4}>
                  Totale annuo
                </td>
                <td className="px-4 py-3 text-right tabular-nums">
                  {TOTAL_NIGHTS}
                </td>
                <td className="px-4 py-3 text-right tabular-nums text-primary">
                  €{TOTAL_REVENUE.toLocaleString("it-IT")}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Cost breakdown + competitor benchmark side by side on lg */}
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
                      (pass-through, fatturate al guest)
                    </div>
                  </td>
                  <td className="px-4 py-3 text-right tabular-nums font-semibold">
                    €{COSTS.cleanings.total.toLocaleString("it-IT")}
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
                    €{COSTS.management.total.toLocaleString("it-IT")}
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
                    €{COSTS.otaCommission.total.toLocaleString("it-IT")}
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
                    €{COSTS.maintenance.total.toLocaleString("it-IT")}
                  </td>
                </tr>
                <tr>
                  <td className="px-4 py-3">
                    <div className="font-medium">Utenze (luce, gas, WiFi, TARI)</div>
                    <div className="text-xs text-muted-foreground">Stima fissa annua</div>
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
            Posizionamento vs Argegno (ultimi mesi)
          </h3>
          <div className="grid grid-cols-2 gap-3 mb-3">
            <div className="rounded-xl bg-muted/30 p-4">
              <div className="text-xs text-muted-foreground mb-1">
                ADR medio 2BR Argegno
              </div>
              <div className="text-2xl font-bold tabular-nums">
                €{COMP_ADR_2BR}
              </div>
            </div>
            <div className="rounded-xl bg-primary/[0.08] p-4">
              <div className="text-xs text-primary mb-1">Casa del Pozzo</div>
              <div className="text-2xl font-bold text-primary tabular-nums">
                €{BLENDED_ADR}
              </div>
              <div className="text-xs text-primary/70 mt-1">
                +{Math.round(((BLENDED_ADR - COMP_ADR_2BR) / COMP_ADR_2BR) * 100)}%
                vs concorrenti 2BR
              </div>
            </div>
          </div>
          <p className="text-xs text-muted-foreground leading-relaxed">
            La concorrenza diretta 2BR è composta da{" "}
            <strong>Casa Hygge</strong> e <strong>Olga House</strong>, entrambe
            in zona centro Argegno ma non direttamente sul filo dell'acqua. Il
            premium di Casa del Pozzo è giustificato da: <em>fronte lago vero
            (riflesso nell'acqua), pontile galleggiante privato, doppio bagno
            privato, parcheggio automatico personale</em> e il pozzo rustico
            come elemento di differenziazione. ADR target leggermente sopra
            mercato locale ma in linea con segmento "waterfront premium" Lago di
            Como (€250–320/notte).
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
                <td className="px-3 py-3" colSpan={2}>
                  Media campione ({COMPETITORS.length} listing)
                </td>
                <td className="px-3 py-3 text-right tabular-nums">
                  €{COMP_ADR_ALL}
                </td>
                <td className="px-3 py-3 text-xs text-muted-foreground italic">
                  range €105 – €480
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
          dai listing pubblici Airbnb/Booking (no accesso API di pricing
          real-time). Occupancy proiettata su pattern stagionale Argegno
          (estate ad alta intensità, inverno basso). Il numero di notti
          prenotate annue (~{TOTAL_NIGHTS}) è coerente con un listing premium
          fronte lago al primo anno di operatività. Le proiezioni vanno
          ricalibrate dopo i primi 3-6 mesi di booking reali.
        </div>
      </div>
    </section>
  );
}
