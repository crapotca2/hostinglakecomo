import { MapPin, Award, Users, Home as HomeIcon } from "lucide-react";

const STATS = [
  { icon: HomeIcon, value: "50+", label: "Proprieta Gestite" },
  { icon: Users, value: "10.000+", label: "Ospiti Accolti" },
  { icon: Award, value: "4,8", label: "Rating Medio" },
  { icon: MapPin, value: "15+", label: "Comuni Coperti" },
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      {/* Header */}
      <section className="py-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">La nostra storia</span>
          <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
            Chi <span className="font-semibold">Siamo</span>
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            La tua squadra di professionisti per gli affitti brevi sul Lago di
            Como.
          </p>
        </div>
      </section>

      {/* Story */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="prose prose-lg max-w-none">
            <p className="text-muted-foreground leading-relaxed text-lg">
              Hosting Lake Como nasce dalla passione per il Lago di Como e dalla
              convinzione che la gestione degli affitti brevi meriti un approccio
              professionale e tecnologico. Combiniamo la conoscenza profonda del
              territorio con strumenti digitali avanzati per offrire ai
              proprietari il massimo rendimento e agli ospiti un'esperienza
              indimenticabile.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg mt-6">
              Ogni proprieta nel nostro portfolio viene trattata come se fosse la
              nostra. Dal primo sopralluogo alla gestione quotidiana, ci
              occupiamo di ogni dettaglio: pricing dinamico basato su dati di
              mercato reali, promozione multi-canale su oltre 30 piattaforme,
              accoglienza professionale e compliance normativa completa.
            </p>
            <p className="text-muted-foreground leading-relaxed text-lg mt-6">
              La nostra missione e rendere semplice e redditizio affittare un
              immobile sul Lago di Como, trasformando ogni soggiorno in una
              recensione a 5 stelle.
            </p>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-20 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            {STATS.map((stat) => (
              <div
                key={stat.label}
                className="bg-white rounded-2xl p-6 text-center shadow-sm border border-border/50"
              >
                <stat.icon className="h-6 w-6 text-primary mx-auto mb-3" />
                <div className="text-3xl font-bold text-foreground mb-1">
                  {stat.value}
                </div>
                <div className="text-xs text-muted-foreground font-medium">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Zones */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <span className="section-label">Copertura</span>
            <h2 className="text-3xl font-light mt-3 mb-4">
              Le nostre <span className="font-semibold">zone</span>
            </h2>
          </div>
          <div className="grid md:grid-cols-3 gap-6">
            {[
              {
                name: "Centro Como",
                desc: "Il cuore della citta, a pochi passi dal Duomo e dal lungolago. Ideale per soggiorni brevi e turismo culturale.",
              },
              {
                name: "Primo Bacino",
                desc: "Da Cernobbio a Bellagio: le localita piu iconiche del Lago con ville storiche e viste mozzafiato.",
              },
              {
                name: "Alto Lago e Valle",
                desc: "Borghi emergenti con prezzi accessibili e grande potenziale di crescita per investitori lungimiranti.",
              },
            ].map((zone) => (
              <div
                key={zone.name}
                className="bg-white rounded-2xl p-7 border border-border/50 card-hover"
              >
                <div className="flex items-center gap-2 mb-3">
                  <MapPin className="h-4 w-4 text-primary" />
                  <h3 className="font-semibold">{zone.name}</h3>
                </div>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {zone.desc}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
