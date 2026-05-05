"use client";

import { useEffect, useRef, useState } from "react";
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CalendarCheck,
  ClipboardCheck,
  Camera,
  Star,
  PackageCheck,
  Calculator,
  FileText,
  Home as HomeIcon,
} from "lucide-react";

const SERVICE_GROUPS = [
  {
    title: "Avvio e configurazione",
    desc: "Tutto quello che serve per portare la proprietà online al massimo del suo potenziale.",
    items: [
      {
        icon: HomeIcon,
        title: "Analisi e consulenza",
        desc: "Sopralluogo, analisi del potenziale, confronto con la zona e piano d'azione su misura.",
      },
      {
        icon: Camera,
        title: "Servizio fotografico",
        desc: "Riprese professionali ad alta risoluzione, tour virtuale 360 e contenuti video per le piattaforme.",
      },
      {
        icon: Sparkles,
        title: "Allestimento casa",
        desc: "Interventi mirati di restyling per alzare tariffa media e qualità delle recensioni, calibrati sul budget.",
      },
      {
        icon: ClipboardCheck,
        title: "Avviamento tecnico",
        desc: "Inventario, lista controlli di conformità e configurazione completa per la prima pubblicazione.",
      },
    ],
  },
  {
    title: "Operazioni quotidiane",
    desc: "Il lavoro invisibile che fa la differenza fra una proprietà media e una a 5 stelle.",
    items: [
      {
        icon: Sparkles,
        title: "Pulizia e biancheria",
        desc: "Standard alberghiero, biancheria di alta gamma di proprietà, igienizzazione certificata fra un soggiorno e l'altro.",
      },
      {
        icon: CalendarCheck,
        title: "Gestione prenotazioni",
        desc: "Calendario unificato in tempo reale, gestione richieste, modifiche e cancellazioni — un solo interlocutore.",
      },
      {
        icon: HomeIcon,
        title: "Accoglienza ospiti",
        desc: "Accoglienza professionale, accesso autonomo con codice e video-istruzioni multilingua. Recensioni a 5 stelle garantite.",
      },
      {
        icon: ShieldCheck,
        title: "Emergenze 24/7",
        desc: "Reperibilità continua e rete di professionisti per interventi idraulici, elettrici e manutenzione urgente.",
      },
    ],
  },
  {
    title: "Ottimizzazione del valore",
    desc: "Tariffe dinamiche, distribuzione multi-canale e gestione attiva della reputazione per portare l'immobile al suo massimo.",
    items: [
      {
        icon: TrendingUp,
        title: "Promozione multi-canale",
        desc: "Inserimento su Airbnb, Booking, Expedia e altri portali con descrizioni ottimizzate in 4 lingue.",
      },
      {
        icon: TrendingUp,
        title: "Tariffazione dinamica",
        desc: "Algoritmo proprietario di prezzi dinamici basato su concorrenza, eventi locali e stagionalità del Lago di Como.",
      },
      {
        icon: Star,
        title: "Recensioni e reputazione",
        desc: "Monitoraggio recensioni multi-piattaforma, risposta professionale, gestione proattiva delle valutazioni.",
      },
      {
        icon: PackageCheck,
        title: "Biancheria e accoglienza premium",
        desc: "Kit cortesia firmato, prodotti bagno selezionati, cialde caffè e benvenuto con eccellenze locali.",
      },
    ],
  },
  {
    title: "Reportistica e adempimenti",
    desc: "Trasparenza totale e zero scadenze dimenticate: i tuoi numeri sempre alla mano, la burocrazia archiviata.",
    items: [
      {
        icon: ShieldCheck,
        title: "Gestione amministrativa",
        desc: "CIN, Questura (Alloggiati Web), ISTAT, tassa di soggiorno e cedolare secca: tutti gli adempimenti gestiti per te.",
      },
      {
        icon: Calculator,
        title: "Bilancio fiscale annuale",
        desc: "Riepilogo fiscale di fine anno, quadro RL, calcolo cedolare e documentazione pronta per il commercialista.",
      },
      {
        icon: FileText,
        title: "Rendiconto mensile",
        desc: "Prospetto economico per singola prenotazione, commissioni dettagliate e pagamenti trasparenti al proprietario.",
      },
      {
        icon: ClipboardCheck,
        title: "Manutenzione programmata",
        desc: "Piano preventivo stagionale: climatizzazione, caldaia, riparazioni e controllo quadrimestrale della proprietà.",
      },
    ],
  },
];

export function ServicesCarousel() {
  const scrollerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const [active, setActive] = useState(0);

  useEffect(() => {
    const scroller = scrollerRef.current;
    if (!scroller) return;
    const obs = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
        if (visible[0]) {
          const idx = panelsRef.current.indexOf(
            visible[0].target as HTMLDivElement
          );
          if (idx >= 0) setActive(idx);
        }
      },
      { root: scroller, threshold: [0.4, 0.6, 0.8] }
    );
    panelsRef.current.forEach((p) => p && obs.observe(p));
    return () => obs.disconnect();
  }, []);

  const scrollTo = (idx: number) => {
    const panel = panelsRef.current[idx];
    if (panel && scrollerRef.current) {
      scrollerRef.current.scrollTo({
        left: panel.offsetLeft - scrollerRef.current.offsetLeft,
        behavior: "smooth",
      });
    }
  };

  return (
    <div className="relative">
      <div className="flex flex-wrap gap-2 mb-6 justify-center">
        {SERVICE_GROUPS.map((g, i) => (
          <button
            key={g.title}
            type="button"
            onClick={() => scrollTo(i)}
            className={`text-xs sm:text-sm font-semibold px-3.5 py-2 rounded-full border transition-colors ${
              i === active
                ? "bg-white text-[#1D3A62] border-white"
                : "bg-transparent text-white/85 border-white/30 hover:border-white/70 hover:text-white"
            }`}
          >
            {g.title}
          </button>
        ))}
      </div>

      <div
        ref={scrollerRef}
        className="overflow-x-auto snap-x snap-mandatory scrollbar-hide -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8 pb-2"
      >
        <div className="flex gap-6">
          {SERVICE_GROUPS.map((g, i) => (
            <div
              key={g.title}
              ref={(el) => {
                panelsRef.current[i] = el;
              }}
              className="snap-start shrink-0 w-full sm:w-[92%] lg:w-full"
            >
              <div className="rounded-2xl bg-white border border-border/50 p-6 sm:p-8 h-full">
                <div className="grid lg:grid-cols-[1fr_2fr] gap-6 lg:gap-10">
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.2em] text-primary font-semibold mb-2">
                      {String(i + 1).padStart(2, "0")} di{" "}
                      {String(SERVICE_GROUPS.length).padStart(2, "0")}
                    </div>
                    <h3 className="text-2xl font-light mb-3">
                      <span className="font-semibold">{g.title}</span>
                    </h3>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {g.desc}
                    </p>
                  </div>
                  <div className="grid sm:grid-cols-2 gap-3">
                    {g.items.map((item) => (
                      <div
                        key={item.title}
                        className="rounded-xl bg-muted/30 border border-border/40 p-4 flex gap-3"
                      >
                        <div className="h-9 w-9 rounded-lg bg-primary/[0.08] flex items-center justify-center shrink-0">
                          <item.icon className="h-4 w-4 text-primary" />
                        </div>
                        <div className="min-w-0">
                          <h4 className="text-sm font-semibold mb-1">
                            {item.title}
                          </h4>
                          <p className="text-xs text-muted-foreground leading-relaxed">
                            {item.desc}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="flex justify-center gap-2 mt-5">
        {SERVICE_GROUPS.map((g, i) => (
          <button
            key={g.title}
            type="button"
            onClick={() => scrollTo(i)}
            aria-label={`Vai a ${g.title}`}
            className={`h-1.5 rounded-full transition-all ${
              i === active ? "w-8 bg-white" : "w-1.5 bg-white/30"
            }`}
          />
        ))}
      </div>
    </div>
  );
}
