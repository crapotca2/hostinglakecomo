import Link from "next/link";
import {
  Euro,
  Sparkles,
  FileText,
  Wand2,
  Lightbulb,
  BookOpen,
  PenTool,
  Lock,
  ArrowRight,
  Navigation,
  Map,
  CheckCircle2,
  MapPin,
  Mail,
} from "lucide-react";

type ToolStatus = "available" | "members-only" | "coming-soon";

interface Tool {
  slug: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  status: ToolStatus;
  category: "dashboard" | "advanced";
}

const TOOLS: Tool[] = [
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
  dashboard: {
    label: "Tool Area Clienti",
    desc: "Strumenti operativi riservati ai proprietari in gestione con Hosting Lake Como.",
  },
  advanced: {
    label: "In Arrivo",
    desc: "Funzionalita in sviluppo per la prossima release.",
  },
};

export default function StrumentiPage() {
  const advanced = TOOLS.filter((t) => t.category === "advanced");

  return (
    <div className="pt-20">
      {/* TOOL AREA CLIENTI — stacked mockups, white */}
      <section className="pt-24 pb-24 bg-white relative">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-[5fr_6fr] gap-12 lg:gap-16 items-center">
            {/* TEXT */}
            <div>
              <h2 className="text-3xl sm:text-4xl font-light text-foreground mb-4">
                Tool dedicati ai{" "}
                <span className="font-semibold">proprietari in gestione</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Una suite di strumenti operativi pensata per chi affida la
                gestione del proprio immobile a Hosting Lake Como. Risparmia
                tempo, alza la qualità dell&apos;esperienza ospite e mantieni
                il controllo della tua proprietà.
              </p>
              <ul className="space-y-3 mb-8">
                {[
                  "Generatore di nomi creativi per la tua casa vacanza",
                  "Welcome letter multilingua pronte all'uso",
                  "Link Google Maps ottimizzato con punti di riferimento",
                ].map((line) => (
                  <li
                    key={line}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    {line}
                  </li>
                ))}
              </ul>
              <Link
                href="/dashboard"
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#1D3A62] text-white text-sm font-semibold hover:bg-[#1D3A62]/90 transition-colors shadow-md"
              >
                Accedi all&apos;area clienti
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {/* STACKED MOCKUPS */}
            <div className="relative h-[460px] sm:h-[480px] lg:h-[420px] mt-8 lg:mt-0">
              {/* Map mockup — back card */}
              <div className="absolute right-0 bottom-0 w-[78%] sm:w-[70%] rounded-2xl bg-white shadow-[0_25px_60px_-12px_rgba(29,58,98,0.55)] border border-border/40 overflow-hidden rotate-[3deg] translate-y-2">
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                  <MapPin className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Percorso Google Maps
                  </span>
                </div>
                <div className="relative h-32 bg-gradient-to-br from-emerald-50 via-blue-50 to-emerald-100 overflow-hidden">
                  {/* Stylised roads */}
                  <svg
                    viewBox="0 0 200 120"
                    className="absolute inset-0 w-full h-full"
                    preserveAspectRatio="none"
                  >
                    <path
                      d="M-10 70 Q 60 60, 110 80 T 220 70"
                      stroke="#94a3b8"
                      strokeWidth="3"
                      fill="none"
                      opacity="0.6"
                    />
                    <path
                      d="M30 -10 L 80 90 L 130 130"
                      stroke="#94a3b8"
                      strokeWidth="2"
                      fill="none"
                      opacity="0.4"
                    />
                    <path
                      d="M40 60 L 90 75 L 140 60 L 175 50"
                      stroke="#1D3A62"
                      strokeWidth="2.5"
                      fill="none"
                      strokeDasharray="4 3"
                    />
                  </svg>
                  <div className="absolute" style={{ left: "44%", top: "55%" }}>
                    <MapPin className="h-5 w-5 text-rose-500 fill-rose-500 drop-shadow" />
                  </div>
                </div>
                <div className="px-4 py-2.5 text-[10px] text-muted-foreground border-t border-border/40">
                  Via Maurizio Monti 46, Como — 8 min dalla stazione
                </div>
              </div>

              {/* Welcome letter mockup — middle card */}
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-[72%] sm:w-[64%] rounded-2xl bg-white shadow-[0_25px_60px_-12px_rgba(29,58,98,0.55)] border border-border/40 overflow-hidden -rotate-[2deg] z-10">
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center justify-between">
                  <span className="text-xs font-semibold text-foreground inline-flex items-center gap-1.5">
                    <Mail className="h-3.5 w-3.5 text-primary" />
                    Welcome Letter
                  </span>
                  <span className="text-[9px] text-muted-foreground uppercase tracking-wider">
                    IT · EN · DE · FR
                  </span>
                </div>
                <div className="p-4 space-y-2 bg-white">
                  <div className="text-xs font-semibold text-foreground">
                    Benvenuti a Casa di Miriam
                  </div>
                  <div className="space-y-1">
                    <div className="h-1.5 rounded-full bg-muted/60 w-full" />
                    <div className="h-1.5 rounded-full bg-muted/60 w-[92%]" />
                    <div className="h-1.5 rounded-full bg-muted/60 w-[78%]" />
                  </div>
                  <div className="pt-1 space-y-1">
                    <div className="h-1.5 rounded-full bg-muted/60 w-[88%]" />
                    <div className="h-1.5 rounded-full bg-muted/60 w-[70%]" />
                  </div>
                </div>
              </div>

              {/* Nome proprieta mockup — front card */}
              <div className="absolute right-2 top-0 w-[74%] sm:w-[62%] rounded-2xl bg-white shadow-[0_25px_60px_-12px_rgba(29,58,98,0.55)] border border-border/40 overflow-hidden rotate-[2deg] z-20">
                <div className="px-4 py-3 border-b border-border/40 bg-muted/20 flex items-center gap-2">
                  <Sparkles className="h-3.5 w-3.5 text-primary" />
                  <span className="text-xs font-semibold text-foreground">
                    Nome Proprietà
                  </span>
                </div>
                <div className="p-4 space-y-2">
                  {[
                    "Casa di Miriam",
                    "Loft del Lago",
                    "Terrazza di Como",
                    "Vista Cattedrale",
                  ].map((name, i) => (
                    <div
                      key={name}
                      className={`flex items-center justify-between rounded-lg px-3 py-2 text-xs ${
                        i === 0
                          ? "bg-primary/[0.08] border border-primary/20 text-foreground font-semibold"
                          : "bg-muted/30 border border-border/40 text-muted-foreground"
                      }`}
                    >
                      <span>{name}</span>
                      {i === 0 && (
                        <CheckCircle2 className="h-3.5 w-3.5 text-primary" />
                      )}
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* IN ARRIVO */}
      <section className="py-20 bg-[#1D3A62] text-white relative overflow-hidden border-t border-white/10">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="mb-10">
            <h2 className="text-2xl sm:text-3xl font-light text-white">
              <span className="font-semibold">In Arrivo</span>
            </h2>
            <p className="mt-2 text-white/75">
              {CATEGORY_META.advanced.desc}
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {advanced.map((t) => (
              <div
                key={t.slug}
                className="bg-white text-foreground rounded-2xl p-7 border border-border/50"
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <h3 className="text-base font-semibold">{t.name}</h3>
                  <span className="shrink-0 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full whitespace-nowrap">
                    <Lock className="h-2.5 w-2.5" />
                    In arrivo
                  </span>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {t.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-20 border-t border-border/50">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl font-light mb-4">
            Vuoi accedere agli{" "}
            <span className="font-semibold">strumenti operativi</span>?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            La suite completa di strumenti — generatore nomi, welcome letter
            multilingua, percorsi Google Maps, dynamic pricing — e riservata
            ai proprietari in gestione con Hosting Lake Como.
          </p>
          <Link
            href="/contact?interest=consulenza&from=strumenti"
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
