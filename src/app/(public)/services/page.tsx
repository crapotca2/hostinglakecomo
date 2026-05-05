import Link from "next/link";
import {
  ArrowRight,
  LayoutDashboard,
  Mail,
  ShieldCheck,
  Wrench,
} from "lucide-react";
import { DashboardMockup } from "@/components/public/dashboard-mockup";
import { EmailRecapMockup } from "@/components/public/email-recap-mockup";
import { ServicesCarousel } from "@/components/public/services-carousel";

const PILLARS = [
  {
    icon: Wrench,
    title: "Gestione operativa",
    desc: "Pulizia hotel, biancheria premium, manutenzione 24/7, accoglienza ospiti. Tu firmi il mandato, noi ci occupiamo del resto.",
  },
  {
    icon: ShieldCheck,
    title: "Compliance totale",
    desc: "CIN, Alloggiati Web, ISTAT, tassa di soggiorno, cedolare secca. Niente scadenze da inseguire, niente sanzioni a sorpresa.",
  },
  {
    icon: LayoutDashboard,
    title: "Dashboard personalizzata",
    desc: "Una cabina di regia in tempo reale: revenue, occupazione, prenotazioni, recensioni. Tutto a portata di click, sempre.",
    highlight: true,
  },
  {
    icon: Mail,
    title: "Recap mensile via email",
    desc: "Ogni mese ricevi nella casella un riassunto curato: numeri chiave, trend, recensioni, suggerimenti operativi.",
    highlight: true,
  },
];

const DASHBOARD_BLOCKS = [
  {
    title: "Panoramica & KPI",
    desc: "RevPAR, ADR, occupazione, anticipo prenotazioni, ospiti ricorrenti — i 10 indicatori chiave aggiornati ogni giorno.",
  },
  {
    title: "Soggiorni & calendario",
    desc: "Vista operativa su check-in/check-out, disponibilità futura per periodo, segnalazioni sulle proprietà vuote.",
  },
  {
    title: "Riepiloghi economici",
    desc: "Prenotazioni per periodo e canale, pagamenti, tasse di soggiorno raccolte, confronto YoY.",
  },
  {
    title: "Dettaglio nominativo",
    desc: "Elenco prenotazioni con dati ospiti, registro pagamenti con rif. Stripe, commissioni OTA per singola prenotazione.",
  },
  {
    title: "Analisi avanzate",
    desc: "Anticipo prenotazioni, curve di occupazione, ospiti ricorrenti, performance comparata dei canali.",
  },
  {
    title: "Rendiconto proprietario",
    desc: "Riepilogo commissioni, rendiconto mensile, prospetto per prenotazione, documentazione per il commercialista.",
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-20">
      {/* HERO */}
      <section className="relative py-24 sm:py-28 overflow-hidden bg-gradient-to-b from-primary/[0.04] via-white to-white border-b border-border/50">
        <div className="absolute inset-0 -z-10 opacity-[0.03] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center" />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Per i proprietari</span>
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-light mt-3 mb-5 tracking-tight">
            Semplifichiamo la <span className="font-semibold">gestione</span>{" "}
            del tuo immobile
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-base sm:text-lg leading-relaxed">
            Tu mantieni la proprietà, noi ci occupiamo di tutto il resto:
            operazioni, compliance, revenue, accoglienza. Il risultato lo
            vedi in tempo reale dalla tua{" "}
            <strong className="text-foreground">dashboard personale</strong>{" "}
            e ogni mese arriva un{" "}
            <strong className="text-foreground">recap dedicato</strong> nella
            tua casella email.
          </p>
        </div>
      </section>

      {/* PILLARS */}
      <section id="pillars" className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {PILLARS.map((p) => (
              <div
                key={p.title}
                className={`rounded-2xl p-6 flex flex-col ${
                  p.highlight
                    ? "bg-[#1D3A62] text-white shadow-xl"
                    : "bg-white border border-border/50 border-t-[3px] border-t-[#1D3A62]"
                }`}
              >
                <div className="flex items-center gap-1">
                  <div
                    className={`h-11 w-11 rounded-xl flex items-center justify-center mb-4 ${
                      p.highlight ? "bg-white/10" : "bg-primary/[0.08]"
                    }`}
                  >
                    <p.icon
                      className={`h-5 w-5 ${
                        p.highlight ? "text-white" : "text-primary"
                      }`}
                    />
                  </div>
                  <h3 className="text-base font-semibold mb-2">{p.title}</h3>
                </div>
                <p
                  className={`text-sm leading-relaxed ${
                    p.highlight ? "text-white/80" : "text-muted-foreground"
                  }`}
                >
                  {p.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* SERVICE GROUPS */}
      <section id="services" className="py-20 bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14 max-w-2xl mx-auto">
            <span className="section-label">Cosa facciamo per te</span>
            <h2 className="text-3xl sm:text-4xl font-light mt-3 mb-3">
              Quattro aree, <span className="font-semibold">un solo interlocutore</span>
            </h2>
            <p className="text-muted-foreground">
              I nostri servizi sono pensati per togliere lavoro al
              proprietario e alzare il rendimento dell&apos;immobile. Ogni
              area è coperta da uno specialista del team.
            </p>
          </div>

          <ServicesCarousel />
        </div>
      </section>

      {/* DASHBOARD */}
      <section id="dashboard" className="py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid lg:grid-cols-[5fr_6fr] gap-10 lg:gap-14 items-center">
            <div>
              <span className="section-label">La tua cabina di regia</span>
              <h2 className="text-3xl sm:text-4xl font-light mt-3 mb-4">
                Una <span className="font-semibold">dashboard personale</span>{" "}
                per ogni proprietà
              </h2>
              <p className="text-muted-foreground leading-relaxed mb-6">
                Accedi quando vuoi, da qualsiasi dispositivo. Dati aggiornati
                ogni giorno, niente fogli Excel da incrociare, niente attese
                per i numeri di fine mese. Più di trenta report già pronti,
                organizzati in sei aree.
              </p>
              <ul className="space-y-3">
                {DASHBOARD_BLOCKS.map((b) => (
                  <li
                    key={b.title}
                    className="flex items-start gap-3 text-sm"
                  >
                    <div className="h-6 w-6 rounded-md bg-primary/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                      <ArrowRight className="h-3 w-3 text-primary" />
                    </div>
                    <div>
                      <strong className="font-semibold">{b.title}</strong>
                      <span className="text-muted-foreground">
                        {" "}
                        — {b.desc}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            </div>

            <div className="lg:sticky lg:top-24">
              <DashboardMockup />
            </div>
          </div>
        </div>
      </section>

      {/* EMAIL RECAP */}
      <section
        id="email"
        className="py-24 bg-[#1D3A62] text-white relative overflow-hidden"
      >
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-[6fr_5fr] gap-10 lg:gap-14 items-center">
            <div className="order-2 lg:order-1">
              <EmailRecapMockup />
            </div>
            <div className="order-1 lg:order-2">
              <span className="text-[10px] uppercase tracking-[0.18em] text-white/70 font-semibold">
                Direttamente in casella
              </span>
              <h2 className="text-3xl sm:text-4xl font-light mt-3 mb-4 text-white">
                Un <span className="font-semibold">recap mensile</span> che
                puoi leggere in due minuti
              </h2>
              <p className="text-white/80 leading-relaxed mb-5">
                Il primo del mese ricevi nella tua casella un riassunto
                curato: numeri chiave, recensione del mese, segnalazioni
                operative su cosa sta per succedere. Niente file da scaricare,
                niente login obbligatorio — basta aprire la mail.
              </p>
              <ul className="space-y-2 text-sm text-white/90">
                {[
                  "I 4 numeri chiave del mese, già confrontati con il precedente",
                  "Trend di occupazione e revenue commentati dal team",
                  "La recensione del mese e i feedback più rilevanti",
                  "Suggerimenti operativi e flag su festività e prezzi",
                ].map((line) => (
                  <li key={line} className="flex items-start gap-2.5">
                    <ArrowRight className="h-3.5 w-3.5 text-white/70 shrink-0 mt-0.5" />
                    <span>{line}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-24">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl sm:text-4xl font-light mb-4">
            Vuoi che gestiamo anche{" "}
            <span className="font-semibold">la tua proprietà</span>?
          </h2>
          <p className="text-muted-foreground mb-8 max-w-2xl mx-auto">
            Una sola conversazione per capire se Hosting Lake Como fa al caso
            tuo. Valutazione gratuita, nessun impegno. Ti rispondiamo entro
            48 ore.
          </p>
          <Link
            href="/contact?interest=consulenza&from=services"
            className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg"
          >
            Richiedi una valutazione
            <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>
    </div>
  );
}
