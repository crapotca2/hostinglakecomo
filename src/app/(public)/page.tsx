import Link from "next/link";
import {
  TrendingUp,
  Shield,
  CalendarCheck,
  Sparkles,
  Home,
  Users,
  ArrowRight,
  MapPin,
  Bed,
  Bath,
  ChevronRight,
  CheckCircle2,
} from "lucide-react";
import { getPortfolio, getZoneLabel, getTypeLabel } from "@/lib/portfolio";

const FEATURED_PROPERTIES = (() => {
  const all = getPortfolio();
  return all.filter((p) => p.images.length > 0).slice(0, 3);
})();

const SERVICES_OWNER = [
  {
    icon: TrendingUp,
    title: "Dynamic Pricing",
    desc: "Algoritmo di pricing che ottimizza le tariffe in base a stagionalita, domanda e concorrenza per massimizzare i tuoi ricavi.",
  },
  {
    icon: CalendarCheck,
    title: "Gestione Prenotazioni",
    desc: "Calendario unificato sincronizzato con Airbnb, Booking.com e Vrbo. Zero doppie prenotazioni, zero stress.",
  },
  {
    icon: Shield,
    title: "Compliance Totale",
    desc: "CIN, Questura, ISTAT, tassa di soggiorno: gestiamo tutti gli adempimenti normativi in automatico.",
  },
  {
    icon: Sparkles,
    title: "Accoglienza 5 Stelle",
    desc: "Check-in professionale, pulizia certificata, biancheria di qualita. Ogni ospite vive un'esperienza premium.",
  },
  {
    icon: Home,
    title: "Promozione Multi-Canale",
    desc: "Il tuo immobile su oltre 30 piattaforme con foto professionali, descrizioni ottimizzate e visibilita massima.",
  },
  {
    icon: Users,
    title: "Dashboard Proprietario",
    desc: "Monitora revenue, occupazione e performance in tempo reale. Report mensili automatici con payout trasparenti.",
  },
];

const STATS = [
  { value: "+32%", label: "Revenue medio vs gestione autonoma" },
  { value: "30+", label: "Canali di distribuzione" },
  { value: "24/7", label: "Reperibilita per ospiti e proprietari" },
  { value: "100%", label: "Compliance normativa garantita" },
];

const WHY_US = [
  "Pricing dinamico e ottimizzazione listing su 30+ canali",
  "Pulizie professionali standard hotel e supporto 24/7",
  "Compliance normativa garantita: CIN, Questura, ISTAT, tassa di soggiorno",
  "Reportistica trasparente con rendiconto mensile dettagliato",
];

export default function HomePage() {
  return (
    <>
      {/* ═══ VIDEO HERO ═══ */}
      <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
        {/* Video background */}
        <video
          autoPlay
          muted
          loop
          playsInline
          className="absolute inset-0 w-full h-full object-cover"
        >
          <source src="/hero-video.mp4" type="video/mp4" />
        </video>
        {/* Overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/40 to-transparent" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full">
          <div className="max-w-2xl animate-fade-in-up">
            <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/10 text-white/90 text-xs font-medium mb-6 backdrop-blur-sm border border-white/20">
              <MapPin className="h-3.5 w-3.5" />
              Lago di Como, Italia
            </div>
            <h1 className="text-4xl sm:text-5xl lg:text-6xl xl:text-7xl font-light text-white leading-[1.05] mb-6">
              Hosting the best
              <br />
              <span className="font-semibold italic">experiences</span>
              <br />
              on Lake Como
            </h1>
            <p className="text-lg sm:text-xl text-white/70 leading-relaxed mb-10 max-w-lg">
              Gestione professionale di case vacanza e appartamenti sul Lago
              di Como. Massimizza i tuoi guadagni con la nostra esperienza.
            </p>
            <div className="flex flex-col sm:flex-row gap-3">
              <Link
                href="/contact?interest=consulenza"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white text-foreground text-sm font-semibold hover:bg-white/90 transition-all shadow-lg"
              >
                Richiedi Consulenza
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/services"
                className="inline-flex items-center justify-center gap-2 px-7 py-4 rounded-xl bg-white/10 text-white text-sm font-medium hover:bg-white/20 transition-all border border-white/20 backdrop-blur-sm"
              >
                <Sparkles className="h-4 w-4" />
                Scopri i servizi
              </Link>
            </div>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2">
          <div className="w-5 h-8 rounded-full border-2 border-white/30 flex items-start justify-center p-1">
            <div className="w-1 h-2 rounded-full bg-white/60 animate-bounce" />
          </div>
        </div>
      </section>

      {/* ═══ STATS ═══ */}
      <section className="py-20 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-8 lg:gap-12">
            {STATS.map((stat) => (
              <div key={stat.label} className="text-center">
                <div className="text-4xl sm:text-5xl font-bold text-primary mb-2">
                  {stat.value}
                </div>
                <div className="text-sm text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══ PERCHE AIR BIBBY ═══ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div>
              <span className="section-label">Perche sceglierci</span>
              <h2 className="text-3xl sm:text-4xl font-light text-foreground mt-3 mb-6">
                Risultati concreti,{" "}
                <span className="font-semibold">zero pensieri</span>
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-8">
                Gestiamo il tuo immobile come fosse il nostro. Dalla promozione
                alla manutenzione, ci occupiamo di ogni aspetto con tecnologia
                avanzata e attenzione ai dettagli. Tu incassi, noi facciamo il
                resto.
              </p>
              <ul className="space-y-4 mb-8">
                {WHY_US.map((item) => (
                  <li
                    key={item}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    {item}
                  </li>
                ))}
              </ul>
              <Link
                href="/about"
                className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
              >
                Scopri chi siamo
                <ChevronRight className="h-4 w-4" />
              </Link>
            </div>
            <div className="relative">
              <img
                src="/images/como-lake-boat-2048x1366.jpg"
                alt="Lago di Como — vista panoramica con barca"
                className="rounded-2xl shadow-2xl w-full object-cover aspect-[4/3]"
              />
              <div className="absolute -bottom-6 -left-6 bg-white rounded-2xl p-5 shadow-xl border border-border/50 hidden lg:block">
                <div className="text-2xl font-bold text-primary">+32%</div>
                <div className="text-xs text-muted-foreground">
                  Revenue medio
                  <br />
                  rispetto alla gestione autonoma
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ═══ SERVIZI PER PROPRIETARI ═══ */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-label">I nostri servizi</span>
            <h2 className="text-3xl sm:text-4xl font-light text-foreground mt-3 mb-4">
              Tutto cio che serve per{" "}
              <span className="font-semibold">guadagnare di piu</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Dalla promozione alla gestione quotidiana, ci occupiamo di ogni
              aspetto del tuo immobile con tecnologia avanzata e attenzione ai
              dettagli.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {SERVICES_OWNER.map((s) => (
              <div
                key={s.title}
                className="group bg-white rounded-2xl p-7 border border-border/50 card-hover"
              >
                <div className="h-12 w-12 rounded-xl bg-primary/[0.08] flex items-center justify-center mb-5 group-hover:bg-primary/[0.12] transition-colors">
                  <s.icon className="h-5 w-5 text-primary" />
                </div>
                <h3 className="text-base font-semibold text-foreground mb-2">
                  {s.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {s.desc}
                </p>
              </div>
            ))}
          </div>

          <div className="text-center mt-10">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 text-sm font-medium text-primary hover:text-primary/80 transition-colors"
            >
              Scopri tutti i servizi
              <ChevronRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>

      {/* ═══ PROPRIETA IN EVIDENZA ═══ */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-end justify-between mb-12">
            <div>
              <span className="section-label">Portfolio</span>
              <h2 className="text-3xl sm:text-4xl font-light text-foreground mt-3">
                La proprieta che <span className="font-semibold">gestiamo oggi</span>
              </h2>
            </div>
            <Link
              href="/properties"
              className="hidden sm:inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border text-sm font-medium hover:bg-muted/50 transition-colors"
            >
              Vedi tutte
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURED_PROPERTIES.map((p) => (
              <Link
                key={p.slug}
                href={`/properties/${p.slug}`}
                className="group bg-white rounded-2xl overflow-hidden border border-border/50 card-hover"
              >
                <div className="relative h-56 overflow-hidden bg-muted">
                  {p.images[0]?.url ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={p.images[0].url}
                      alt={p.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
                      <Home className="h-10 w-10 text-primary/40" />
                    </div>
                  )}
                  {p.details.hasLakeView && (
                    <span className="absolute top-3 left-3 px-2.5 py-1 rounded-full bg-primary/90 text-white text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                      Vista Lago
                    </span>
                  )}
                  <span className="absolute top-3 right-3 px-2.5 py-1 rounded-full bg-white/90 text-foreground text-[10px] font-semibold uppercase tracking-wider backdrop-blur-sm">
                    {getTypeLabel(p.type)}
                  </span>
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1.5">
                    <MapPin className="h-3 w-3" />
                    {p.address.city} — {getZoneLabel(p.zone)}
                  </div>
                  <h3 className="text-base font-semibold text-foreground mb-3">
                    {p.name}
                  </h3>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground mb-4">
                    <span className="flex items-center gap-1">
                      <Bed className="h-3.5 w-3.5" /> {p.details.bedrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Bath className="h-3.5 w-3.5" /> {p.details.bathrooms}
                    </span>
                    <span className="flex items-center gap-1">
                      <Users className="h-3.5 w-3.5" /> {p.details.maxGuests}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-primary inline-flex items-center gap-1">
                      Scopri di piu
                      <ArrowRight className="h-3 w-3" />
                    </span>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted/60 px-2 py-0.5 rounded-full">
                      Gestita
                    </span>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
