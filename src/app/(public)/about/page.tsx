import {
  Star,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Briefcase,
  LineChart,
  ShieldCheck,
  UserCircle2,
  Globe2,
} from "lucide-react";
import team from "@/data/team.json";

export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="py-20 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Chi siamo</span>
          <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
            Property manager{" "}
            <span className="font-semibold">specializzati</span>
            <br />
            sul Lago di Como
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {team.summary.subline} Una sola realta dedicata, con
            esperienza certificata Superhost dal 2017.
          </p>
        </div>
      </section>

      <section className="py-20">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="space-y-6 text-foreground leading-relaxed">
            <p className="text-lg">
              Hosting Lake Como e una realta specializzata di tre property
              manager dedicati alla{" "}
              <strong>gestione, alla pulizia e all&apos;organizzazione</strong>{" "}
              degli immobili dei nostri clienti, con focus specifico sul{" "}
              <strong>mercato internazionale</strong> che frequenta il Lago di
              Como ogni anno.
            </p>
            <p>
              Il nostro lavoro poggia su <strong>oltre nove anni di hosting
              diretto sul Lago</strong> e sulla certificazione{" "}
              <strong>Superhost di Airbnb dal 2017</strong>, con tasso di
              risposta del 100% e oltre{" "}
              {team.summary.experience.primaryReviews} recensioni a 5 stelle
              sulla listing principale. Le competenze sono distribuite su tre
              aree complementari — hospitality, operations &amp; compliance,
              revenue &amp; channel management — in modo che ogni proprieta
              riceva l&apos;attenzione dello specialista giusto in ogni
              momento, mentre il proprietario mantiene un solo interlocutore.
            </p>
            <p>
              Lavoriamo esclusivamente sul Lago di Como: conosciamo le zone, i
              ristoranti, i battelli, i tempi del traghetto, le abitudini dei
              turisti che arrivano in primavera e di quelli che restano fino a
              fine ottobre. Per noi gestire la tua casa significa portarla al
              massimo del suo potenziale, dal pricing alla qualita
              dell&apos;esperienza ospite fino all&apos;efficienza operativa.
            </p>
            <ul className="grid sm:grid-cols-2 gap-3 pt-4">
              {[
                {
                  icon: Globe2,
                  text: "Comunicazione fluente in italiano e inglese, supporto a ospiti internazionali",
                },
                {
                  icon: ShieldCheck,
                  text: "Compliance normativa garantita: CIN, Questura, ISTAT, tassa di soggiorno",
                },
                {
                  icon: Sparkles,
                  text: "Standard di pulizia e organizzazione paragonabili a quelli alberghieri",
                },
                {
                  icon: LineChart,
                  text: "Reportistica trasparente e rendiconto mensile dettagliato",
                },
              ].map((item) => (
                <li
                  key={item.text}
                  className="flex items-center gap-3 text-sm text-white bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center rounded-xl p-4 shadow-sm min-h-[4.5rem]"
                >
                  <item.icon className="h-5 w-5 text-white shrink-0" />
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

    </div>
  );
}
