import Link from "next/link";
import {
  Calculator,
  TrendingUp,
  Euro,
  Sparkles,
  FileText,
  Wand2,
  Lightbulb,
  BookOpen,
  PenTool,
  Lock,
  ArrowRight,
  Wrench,
  Navigation,
  Map,
} from "lucide-react";

type ToolStatus = "available" | "members-only" | "coming-soon";

interface Tool {
  slug: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  status: ToolStatus;
  category: "simulator" | "dashboard" | "advanced";
}

const TOOLS: Tool[] = [
  {
    slug: "rendita",
    name: "Simulatore Rendita",
    desc: "Stima preliminare del potenziale di reddito del tuo immobile sul Lago di Como in base a zona, tipologia e caratteristiche.",
    icon: Calculator,
    status: "available",
    category: "simulator",
  },
  {
    slug: "investimento",
    name: "Simulatore Investimento",
    desc: "Anteprima di ROI, cap rate e payback period per chi valuta l'acquisto di un immobile da reddito.",
    icon: TrendingUp,
    status: "available",
    category: "simulator",
  },
  {
    slug: "profit-diretto",
    name: "Profit Diretto vs OTA",
    desc: "Quanto puoi risparmiare sulle commissioni Airbnb, Booking ed Expedia con una strategia multi-canale equilibrata.",
    icon: Euro,
    status: "available",
    category: "simulator",
  },
  {
    slug: "nome-proprieta",
    name: "Nome Proprieta",
    desc: "Generatore di nomi creativi per la tua casa vacanza. Anteprima riservata ai proprietari in gestione.",
    icon: Sparkles,
    status: "members-only",
    category: "dashboard",
  },
  {
    slug: "welcome-letter",
    name: "Welcome Letter",
    desc: "Template professionali multilingua per accogliere gli ospiti. Disponibile nell'area clienti Hosting Lake Como.",
    icon: FileText,
    status: "members-only",
    category: "dashboard",
  },
  {
    slug: "percorso-maps",
    name: "Percorso Google Maps",
    desc: "Genera il link Google Maps ottimizzato per la tua proprieta: punti di riferimento, parcheggi e accessi alternativi pronti per gli ospiti.",
    icon: Map,
    status: "members-only",
    category: "dashboard",
  },
  {
    slug: "dynamic-pricing",
    name: "Dynamic Pricing",
    desc: "Algoritmo proprietario di tariffazione dinamica su domanda, competitor e stagionalita Lago di Como.",
    icon: Wand2,
    status: "coming-soon",
    category: "advanced",
  },
  {
    slug: "istruzioni-arrivo-video",
    name: "Istruzioni Arrivo con Video",
    desc: "Video-guida per raggiungere la proprieta nella lingua nativa dell'ospite: spiegazioni passo-passo con riprese reali del percorso.",
    icon: Navigation,
    status: "coming-soon",
    category: "advanced",
  },
  {
    slug: "listing-optimizer",
    name: "Listing Optimizer",
    desc: "Analisi AI della descrizione e delle foto con suggerimenti per aumentare le prenotazioni.",
    icon: Lightbulb,
    status: "coming-soon",
    category: "advanced",
  },
  {
    slug: "calcolatore-tasse",
    name: "Calcolatore Tasse IT",
    desc: "Cedolare secca 21%/26%, IMU e IRPEF: stima completa dell'impatto fiscale sul tuo reddito.",
    icon: Euro,
    status: "coming-soon",
    category: "advanced",
  },
  {
    slug: "welcome-book",
    name: "Welcome Book",
    desc: "Libro digitale completo con check-in, regole, consigli locali e numeri utili personalizzabili.",
    icon: BookOpen,
    status: "coming-soon",
    category: "advanced",
  },
  {
    slug: "logo",
    name: "Logo Creator",
    desc: "Genera un'identita visiva professionale per la tua casa vacanza in pochi passi.",
    icon: PenTool,
    status: "coming-soon",
    category: "advanced",
  },
];

const CATEGORY_META: Record<Tool["category"], { label: string; desc: string }> = {
  simulator: {
    label: "Simulatori Pubblici",
    desc: "Stime preliminari per farti un'idea. Il valore effettivo richiede i nostri dati interni.",
  },
  dashboard: {
    label: "Tool Area Clienti",
    desc: "Strumenti operativi riservati ai proprietari in gestione con Hosting Lake Como.",
  },
  advanced: {
    label: "In Arrivo",
    desc: "Funzionalita in sviluppo per la prossima release.",
  },
};

const CATEGORIES: Tool["category"][] = ["simulator", "dashboard", "advanced"];

export default function StrumentiPage() {
  return (
    <div className="pt-20">
      <section className="py-20 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-primary/[0.08] text-primary text-xs font-medium mb-4">
            <Wrench className="h-3.5 w-3.5" />
            Simulatori Hosting Lake Como
          </div>
          <h1 className="text-4xl sm:text-5xl font-light mb-4">
            I nostri <span className="font-semibold">strumenti</span> per i proprietari
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Stime preliminari basate sul nostro database storico del Lago di Como.
            Il valore reale del tuo immobile richiede un'analisi con i nostri dati
            interni e l'algoritmo di pricing proprietario.
          </p>
        </div>
      </section>

      {CATEGORIES.map((cat) => {
        const tools = TOOLS.filter((t) => t.category === cat);
        const meta = CATEGORY_META[cat];
        const isDark = cat !== "dashboard";
        return (
          <section
            key={cat}
            className={
              isDark
                ? "py-20 bg-[#1D3A62] text-white relative overflow-hidden border-t border-white/10"
                : "py-20 bg-white relative"
            }
          >
            {isDark && (
              <div
                aria-hidden
                className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center"
              />
            )}
            <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
              <div className="mb-10">
                <h2
                  className={`text-2xl sm:text-3xl font-light ${
                    isDark ? "text-white" : "text-foreground"
                  }`}
                >
                  <span className="font-semibold">{meta.label}</span>
                </h2>
                <p
                  className={`mt-2 ${
                    isDark ? "text-white/75" : "text-muted-foreground"
                  }`}
                >
                  {meta.desc}
                </p>
              </div>
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {tools.map((t) => {
                  const isAvailable = t.status === "available";
                  const isMembersOnly = t.status === "members-only";
                  const content = (
                    <>
                      <div className="flex items-start justify-between gap-3 mb-2">
                        <h3 className="text-base font-semibold">{t.name}</h3>
                        {isMembersOnly && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-primary bg-primary/[0.08] px-2 py-0.5 rounded-full whitespace-nowrap">
                            <Lock className="h-2.5 w-2.5" />
                            Area Clienti
                          </span>
                        )}
                        {t.status === "coming-soon" && (
                          <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                            <Lock className="h-2.5 w-2.5" />
                            In arrivo
                          </span>
                        )}
                      </div>
                      <p className="text-sm text-muted-foreground leading-relaxed mb-4">
                        {t.desc}
                      </p>
                      {isAvailable && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                          Prova il simulatore
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      )}
                      {isMembersOnly && (
                        <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary">
                          Accedi all'area clienti
                          <ArrowRight className="h-3.5 w-3.5" />
                        </div>
                      )}
                    </>
                  );

                  const cardClass = `bg-white text-foreground rounded-2xl p-7 border border-border/50 ${
                    isDark
                      ? ""
                      : "border-t-[3px] border-t-[#1D3A62] shadow-md hover:shadow-xl"
                  }`;
                  if (isAvailable) {
                    return (
                      <Link
                        key={t.slug}
                        href={`/strumenti/${t.slug}`}
                        className={`${cardClass} group card-hover block`}
                      >
                        {content}
                      </Link>
                    );
                  }
                  if (isMembersOnly) {
                    return (
                      <Link
                        key={t.slug}
                        href={`/strumenti/${t.slug}`}
                        className={`${cardClass} group card-hover block`}
                      >
                        {content}
                      </Link>
                    );
                  }
                  return (
                    <div key={t.slug} className={cardClass}>
                      {content}
                    </div>
                  );
                })}
              </div>
            </div>
          </section>
        );
      })}

      <section className="py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-4">
            Vuoi un'<span className="font-semibold">analisi completa</span> del tuo immobile?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            I simulatori danno un'indicazione di massima. Il valore effettivo
            dipende da storico prenotazioni area, dati competitor, pricing
            dinamico e stagionalita locale: tutti elementi che calcoliamo solo
            nella nostra analisi dedicata.
          </p>
          <Link
            href="/contact?interest=consulenza&from=strumenti"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Richiedi Analisi Completa
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
