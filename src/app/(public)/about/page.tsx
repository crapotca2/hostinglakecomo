import Link from "next/link";
import {
  Users,
  Star,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Briefcase,
  LineChart,
  ShieldCheck,
  UserCircle2,
  MessageCircle,
  Globe2,
} from "lucide-react";
import team from "@/data/team.json";

const STATS = [
  {
    icon: Users,
    value: `${team.members.length}`,
    label: "Property manager nel team",
  },
  {
    icon: Star,
    value: team.summary.experience.primaryRating
      ? team.summary.experience.primaryRating.toFixed(1).replace(".", ",")
      : "5,0",
    label: "Rating Airbnb sulla listing del direttore",
  },
  {
    icon: ShieldCheck,
    value: team.summary.experience.primarySuperhost ? "Superhost" : "Host",
    label: "Certificazione Airbnb del direttore",
  },
  {
    icon: MessageCircle,
    value: `${team.summary.experience.primaryResponseRate}%`,
    label: "Tasso di risposta del direttore",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="py-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Chi siamo</span>
          <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
            Un team{" "}
            <span className="font-semibold">giovane e dinamico</span>
            <br />
            per la tua casa sul Lago
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {team.summary.subline} Diretti da chi il mestiere lo fa da anni.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="max-w-3xl mx-auto space-y-6 text-foreground leading-relaxed">
            <p className="text-lg">
              Hosting Lake Como e un team giovane e dinamico di tre property
              manager. Ci occupiamo a 360 gradi della{" "}
              <strong>gestione, della pulizia e dell'organizzazione</strong>{" "}
              degli immobili dei nostri clienti, con un focus specifico sul{" "}
              <strong>mercato internazionale</strong> che frequenta il Lago di
              Como ogni anno.
            </p>
            <p className="text-muted-foreground">
              Il team e diretto da{" "}
              <strong>
                {team.members[0].name}, property manager con anni di esperienza
                diretta come host sul Lago
              </strong>
              , certificato Superhost di Airbnb dal 2017 e con oltre{" "}
              {team.summary.experience.primaryReviews} recensioni a 5 stelle
              sulla sua listing principale. Sotto la sua direzione, il team
              copre tutto il ciclo: hospitality, operations &amp; compliance,
              revenue &amp; channel management. Il proprietario ha un solo
              interlocutore — la divisione del lavoro la gestiamo noi.
            </p>
            <p className="text-muted-foreground">
              Lavoriamo solo sul Lago di Como: conosciamo le zone, i
              ristoranti, i battelli, i tempi del traghetto, le abitudini dei
              turisti che arrivano in primavera e quelli che restano fino a
              fine ottobre. Per noi gestire la tua casa significa portarla al
              massimo del suo potenziale — sui revenue, sull'esperienza ospite,
              sull'efficienza operativa.
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 pt-4">
              {[
                {
                  icon: Globe2,
                  text: "Comunicazione fluente in italiano e inglese, supporto a ospiti internazionali",
                },
                {
                  icon: Sparkles,
                  text: "Standard di pulizia e organizzazione paragonabili a quelli alberghieri",
                },
                {
                  icon: ShieldCheck,
                  text: "Compliance normativa garantita: CIN, Questura, ISTAT, tassa di soggiorno",
                },
                {
                  icon: LineChart,
                  text: "Reportistica trasparente e rendiconto mensile dettagliato",
                },
              ].map((item) => (
                <li
                  key={item.text}
                  className="flex items-start gap-3 text-sm text-foreground bg-white border border-border/50 rounded-xl p-4"
                >
                  <item.icon className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                  {item.text}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="section-label">Il team</span>
            <h2 className="text-3xl sm:text-4xl font-light mt-3 mb-4">
              Tre <span className="font-semibold">property manager</span>, una
              persona di riferimento
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Hospitality, operations e revenue management. Ogni proprieta che
              gestiamo passa per tutte e tre le competenze, ogni giorno.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {team.members.map((m) => {
              const Icon =
                m.id === "operations"
                  ? Briefcase
                  : m.id === "revenue"
                  ? LineChart
                  : Sparkles;
              return (
                <div
                  key={m.id}
                  className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm flex flex-col"
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {m.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.profilePicture}
                        alt={`${m.name} — ${m.role}`}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
                        <UserCircle2 className="h-20 w-20 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute top-3 left-3 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-2.5 py-1 rounded-full">
                      <Icon className="h-3 w-3 text-primary" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        {m.shortRole}
                      </span>
                    </div>
                    {m.isSuperhost && (
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        Superhost
                      </div>
                    )}
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-1">
                      {m.name ?? "In arrivo"}
                    </h3>
                    <p className="text-xs text-primary font-medium mb-3">
                      {m.role}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-4 flex-1">
                      {m.bio}
                    </p>
                    <ul className="space-y-1.5 mb-4">
                      {m.highlights.slice(0, 3).map((h) => (
                        <li
                          key={h}
                          className="flex items-start gap-2 text-xs text-foreground"
                        >
                          <CheckCircle2 className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
                          {h}
                        </li>
                      ))}
                    </ul>
                    {m.airbnbProfileUrl && (
                      <a
                        href={m.airbnbProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-auto"
                      >
                        Profilo Airbnb
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="py-20">
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
                <div className="text-xs text-muted-foreground font-medium leading-snug">
                  {stat.label}
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Co-hosting</span>
          <h2 className="text-3xl font-light mt-3 mb-4">
            Quello che facciamo per <span className="font-semibold">te</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pricing dinamico, accoglienza standard hotel, compliance completa,
            reportistica trasparente. Il team copre tutto il ciclo di gestione
            — tu hai un solo interlocutore e una proprieta che lavora al
            massimo delle sue capacita.
          </p>
          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl border border-border bg-white text-sm font-semibold hover:bg-muted/40 transition-colors"
            >
              Vedi i servizi
              <Users className="h-4 w-4" />
            </Link>
            <Link
              href="/contact?interest=consulenza&from=about"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors shadow-lg"
            >
              Vuoi che gestiamo la tua casa?
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}
