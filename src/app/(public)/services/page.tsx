import {
  TrendingUp,
  CalendarCheck,
  Shield,
  Sparkles,
  Home as HomeIcon,
  Camera,
  Paintbrush,
  Wrench,
  FileText,
  Compass,
  Car,
  Ship,
  Wifi,
  Zap,
  Star,
  LineChart,
  PackageCheck,
  ClipboardCheck,
  Calculator,
} from "lucide-react";
import { ServiceCard, type ServiceCardProps } from "@/components/public/service-card";

const OWNER_SERVICES: ServiceCardProps[] = [
  {
    icon: HomeIcon,
    title: "Consulenza Personalizzata",
    desc: "Audit della proprieta, analisi del potenziale di reddito, benchmark di zona e piano d'azione su misura. Erogata da un consulente senior Hosting Lake Como.",
    badge: "Su Preventivo",
    ctaLabel: "Richiedi Preventivo",
    ctaHref: "/contact?interest=consulenza",
  },
  {
    icon: Paintbrush,
    title: "Home Staging",
    desc: "Interventi mirati di restyling per aumentare tariffa media e recensioni. Progettiamo insieme al proprietario un intervento calibrato sul budget disponibile.",
    badge: "Budget Personalizzato",
    ctaLabel: "Richiedi Sopralluogo",
    ctaHref: "/contact?interest=home-staging",
  },
  {
    icon: TrendingUp,
    title: "Promozione Multi-Canale",
    desc: "Inserimento su Airbnb, Booking.com, Vrbo, Expedia e oltre 30 portali con descrizioni ottimizzate in 4 lingue e fotografie professionali.",
  },
  {
    icon: LineChart,
    title: "Revenue Management",
    desc: "Algoritmo di dynamic pricing proprietario con analisi competitor, eventi locali, stagionalita e storico della nostra rete sul Lago di Como.",
  },
  {
    icon: CalendarCheck,
    title: "Gestione Prenotazioni",
    desc: "Calendario unificato in tempo reale, gestione richieste, modifiche e cancellazioni. Un solo interlocutore, tutte le piattaforme.",
  },
  {
    icon: Sparkles,
    title: "Accoglienza Ospiti",
    desc: "Check-in professionale, self check-in con codice e video istruzioni. Ogni dettaglio curato per garantire recensioni a 5 stelle.",
  },
  {
    icon: Star,
    title: "Review & Reputation",
    desc: "Monitoraggio recensioni su tutte le piattaforme, risposta professionale, gestione proattiva dei feedback per mantenere score elevato.",
  },
  {
    icon: Shield,
    title: "Gestione Amministrativa",
    desc: "CIN, comunicazione Questura (Alloggiati Web), ISTAT, tassa di soggiorno, cedolare secca: gestiamo tutti gli adempimenti per te.",
  },
  {
    icon: Calculator,
    title: "Audit Fiscale Annuale",
    desc: "Report fiscale di fine anno, quadro RL, calcolo cedolare secca e documentazione pronta per il commercialista.",
    badge: "Costo Extra",
  },
  {
    icon: Wrench,
    title: "Pulizia & Biancheria",
    desc: "Servizio professionale con standard hotel, biancheria premium di proprieta, igienizzazione certificata tra un soggiorno e l'altro.",
  },
  {
    icon: PackageCheck,
    title: "Linen & Amenities Premium",
    desc: "Kit cortesia firmato, prodotti da bagno selezionati, cialde caffe, benvenuto con eccellenze locali.",
    badge: "Costo Amenities",
  },
  {
    icon: FileText,
    title: "Gestione Emergenze 24/7",
    desc: "Reperibilita continua con rete di professionisti per interventi idraulici, elettrici e manutenzione urgente.",
  },
  {
    icon: ClipboardCheck,
    title: "Manutenzione Programmata",
    desc: "Piano preventivo stagionale: climatizzazione, caldaia, piccoli interventi di riparazione, check quadrimestrale della proprieta.",
    badge: "A Consuntivo",
  },
  {
    icon: Camera,
    title: "Servizi Fotografici",
    desc: "Shooting professionale con fotografie in alta risoluzione, virtual tour 360 e contenuti video ottimizzati per le piattaforme.",
    badge: "A Progetto",
  },
  {
    icon: ClipboardCheck,
    title: "Onboarding Tecnico",
    desc: "Inventario dettagliato, checklist di conformita, setup della proprieta per la prima pubblicazione: sollevamo il proprietario da ogni incombenza.",
    badge: "Una Tantum",
  },
];

const GUEST_SERVICES: ServiceCardProps[] = [
  {
    icon: Sparkles,
    title: "Check-in Flessibile",
    desc: "Self check-in con codice numerico e video guida. Accesso dalle 14:30 alle 23:00 con materiale informativo completo.",
    variant: "accent",
  },
  {
    icon: Compass,
    title: "Tour Guidati",
    desc: "Itinerari personalizzati sul Lago di Como con guide locali abilitate. Tour in italiano e inglese.",
    variant: "accent",
  },
  {
    icon: Car,
    title: "NCC e Transfer",
    desc: "Servizio di noleggio con conducente per transfer aeroporto, escursioni e spostamenti in totale comfort.",
    variant: "accent",
  },
  {
    icon: Ship,
    title: "Noleggio Barche",
    desc: "Esplora il lago dalla prospettiva migliore. Barche a motore, gommoni e esperienze in barca a vela.",
    variant: "accent",
  },
  {
    icon: Wifi,
    title: "WiFi e Servizi",
    desc: "Connessione internet ad alta velocita in ogni proprieta, Smart TV e tutto il necessario per lavorare da remoto.",
    variant: "accent",
  },
  {
    icon: Zap,
    title: "Esperienze Locali",
    desc: "Ristoranti, eventi, sport acquatici e attivita culturali selezionate per vivere il Lago di Como come un locale.",
    variant: "accent",
  },
];

export default function ServicesPage() {
  return (
    <div className="pt-20">
      <section className="py-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Cosa facciamo</span>
          <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
            I Nostri <span className="font-semibold">Servizi</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Gestione completa per proprietari e un'esperienza indimenticabile per
            gli ospiti.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-label">Per i proprietari</span>
            <h2 className="text-3xl font-light mt-3 mb-4">
              Massimizza il <span className="font-semibold">rendimento</span>
            </h2>
            <p className="text-sm text-muted-foreground max-w-2xl mx-auto">
              Un unico partner per rendita, operativita, adempimenti e
              reputazione. Tu firmi il mandato, noi ci occupiamo di tutto il
              resto.
            </p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OWNER_SERVICES.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-label">Per gli ospiti</span>
            <h2 className="text-3xl font-light mt-3 mb-4">
              Un'esperienza <span className="font-semibold">a 5 stelle</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {GUEST_SERVICES.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
