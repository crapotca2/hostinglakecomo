import Link from "next/link";
import {
  BarChart3,
  CalendarRange,
  FileBarChart,
  PieChart,
  Building2,
  ArrowRight,
  CheckCircle2,
  TrendingUp,
} from "lucide-react";

type ReportCategory = {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  tagline: string;
  sample: string;
  items: string[];
};

const REPORT_CATEGORIES: ReportCategory[] = [
  {
    icon: BarChart3,
    title: "Panoramica & KPI",
    tagline: "10 indicatori chiave aggiornati ogni giorno",
    sample: "RevPAR +14% rispetto al mese precedente, ADR 187 EUR, Occupazione 73%",
    items: [
      "RevPAR, ADR, Tasso di occupazione",
      "Ricavi lordi e netto al proprietario",
      "Canali di provenienza (Airbnb, Booking, Dirette)",
      "Anticipo medio delle prenotazioni",
      "Tasso di ospiti ricorrenti",
    ],
  },
  {
    icon: CalendarRange,
    title: "Soggiorni",
    tagline: "Vista operativa su soggiorni e disponibilita",
    sample: "Check-in di oggi: 3 | Notti disponibili prossimi 30 giorni: 12",
    items: [
      "Checklist giornaliera check-in/check-out",
      "Calendario disponibilita per periodo",
      "Notti disponibili per proprieta",
      "Proprieta vuote e suggerimenti di riposizionamento",
    ],
  },
  {
    icon: FileBarChart,
    title: "Riepiloghi",
    tagline: "Aggregati economici per periodo",
    sample: "Primo trimestre 2026: 47 prenotazioni, 38.450 EUR ricavi, 1.880 EUR tasse",
    items: [
      "Prenotazioni per periodo e canale",
      "Pagamenti incassati e in attesa",
      "Tasse di soggiorno raccolte",
      "Confronto anno su anno",
    ],
  },
  {
    icon: PieChart,
    title: "Dettaglio",
    tagline: "Dati nominativi e di dettaglio",
    sample: "Esportazione CSV per commercialista, elenco contatti ospiti, dettaglio commissioni",
    items: [
      "Elenco prenotazioni con dati ospiti",
      "Registro pagamenti con riferimenti Stripe",
      "Commissioni OTA per singola prenotazione",
      "Cronologia carte e rimborsi",
    ],
  },
  {
    icon: TrendingUp,
    title: "Analisi",
    tagline: "Analisi avanzate per decisioni strategiche",
    sample: "Anticipo medio prenotazioni: 27 giorni | Ospiti ricorrenti: 18%",
    items: [
      "Anticipo prenotazioni e tempi di decisione",
      "Curve di occupazione settimanali",
      "Giorni di disponibilita non sfruttati",
      "Ospiti ricorrenti e valore nel tempo",
      "Performance comparata dei canali",
    ],
  },
  {
    icon: Building2,
    title: "Gestione Proprieta",
    tagline: "Rendiconto economico completo per proprietario",
    sample: "Rendiconto mensile: ricavi, commissioni, tasse, netto dovuto",
    items: [
      "Riepilogo e dettaglio commissioni Hosting Lake Como",
      "Rendiconto mensile al proprietario",
      "Prospetto economico per singola prenotazione",
      "Documentazione pronta per il commercialista",
    ],
  },
];

export default function ReportPage() {
  return (
    <div className="pt-20">
      <section className="py-24 border-b border-border/50 bg-gradient-to-b from-primary/[0.04] via-white to-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Centro di controllo</span>
          <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
            Dietro ogni proprieta, <span className="font-semibold">un centro di controllo</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Piu di 30 report aggiornati quotidianamente. Ecco cosa ricevi ogni
            mese affidando a noi la gestione del tuo immobile sul Lago di Como.
          </p>
          <div className="mt-8 flex items-center justify-center gap-6 text-xs text-muted-foreground flex-wrap">
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Dashboard dedicata
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Aggiornamenti in tempo reale
            </div>
            <div className="flex items-center gap-1.5">
              <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
              Esportazione CSV per il commercialista
            </div>
          </div>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mb-12 text-center">
            <span className="section-label">Sei aree di reportistica</span>
            <h2 className="text-3xl font-light mt-3 mb-3">
              Tutto quello che <span className="font-semibold">devi sapere</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Una panoramica delle sei aree che compongono il tuo cruscotto
              proprietario. Ogni report e incluso nella gestione Hosting Lake Como.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {REPORT_CATEGORIES.map((c) => (
              <div
                key={c.title}
                className="bg-white rounded-2xl p-7 border border-border/50 card-hover flex flex-col"
              >
                <div className="flex items-start justify-between mb-5">
                  <div className="h-12 w-12 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                    <c.icon className="h-5 w-5 text-primary" />
                  </div>
                  <span className="inline-flex items-center text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/[0.08] px-2 py-1 rounded-full">
                    Incluso
                  </span>
                </div>
                <h3 className="text-base font-semibold mb-1">{c.title}</h3>
                <p className="text-xs text-muted-foreground mb-4">{c.tagline}</p>
                <div className="bg-muted/40 rounded-lg px-3 py-2.5 mb-4 border border-border/30">
                  <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                    Esempio
                  </div>
                  <div className="text-xs font-mono text-foreground/80 leading-relaxed">
                    {c.sample}
                  </div>
                </div>
                <ul className="space-y-1.5 flex-1">
                  {c.items.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-xs text-muted-foreground"
                    >
                      <div className="h-1 w-1 rounded-full bg-primary mt-1.5 shrink-0" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 border-t border-border/50 bg-muted/30">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-4">
            Vuoi questi report per il <span className="font-semibold">tuo immobile</span>?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Prenota una consulenza con il nostro team. Valutiamo insieme il
            potenziale della proprieta e ti mostriamo in anteprima la dashboard
            dedicata.
          </p>
          <Link
            href="/contact?interest=consulenza&from=report"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Richiedi Consulenza
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
