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

export default function ServicesPage() {
  return (
    <div className="pt-20">
      <section className="py-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Per i proprietari</span>
          <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
            I nostri <span className="font-semibold">servizi</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Tutto quello che facciamo per i proprietari che ci affidano la
            gestione: rendita, operativita, adempimenti, reputazione. Tu firmi
            il mandato, noi ci occupiamo di tutto il resto.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {OWNER_SERVICES.map((s) => (
              <ServiceCard key={s.title} {...s} />
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
