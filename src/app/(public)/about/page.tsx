import {
  Star,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  Briefcase,
  LineChart,
  ShieldCheck,
  UserCircle2,
} from "lucide-react";
import team from "@/data/team.json";

export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="py-20 border-b border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h1 className="text-4xl sm:text-5xl font-light mb-4">
            Gestori <span className="font-semibold">specialisti</span>
            <br />
            sul Lago di Como
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            {team.summary.subline} Una sola realta dedicata, con
            esperienza certificata Superhost dal 2017.
          </p>
        </div>
      </section>

      <section className="py-20 bg-[#1D3A62] text-white relative overflow-hidden">
        <div
          aria-hidden
          className="absolute inset-0 opacity-[0.08] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center"
        />
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="grid lg:grid-cols-[6fr_5fr] gap-10 lg:gap-14">
            <div className="space-y-5 leading-relaxed">
              <p className="text-lg">
                Hosting Lake Como e una realta specializzata di tre gestori
                dedicati alla{" "}
                <strong>gestione, alla pulizia e all&apos;organizzazione</strong>{" "}
                degli immobili dei nostri clienti, con focus specifico sul{" "}
                <strong>mercato internazionale</strong> che frequenta il Lago di
                Como ogni anno.
              </p>
              <p className="text-white/85">
                Il nostro lavoro poggia su{" "}
                <strong className="text-white">
                  oltre nove anni di ospitalita diretta sul Lago
                </strong>{" "}
                e sulla certificazione{" "}
                <strong className="text-white">Superhost di Airbnb dal 2017</strong>.
                Le competenze sono distribuite su tre aree complementari, in
                modo che ogni proprieta riceva l&apos;attenzione dello
                specialista giusto in ogni momento, mentre il proprietario
                mantiene un solo interlocutore.
              </p>
              <p className="text-white/85">
                Lavoriamo esclusivamente sul Lago di Como: conosciamo le zone,
                i ristoranti, i battelli, i tempi del traghetto, le abitudini
                dei turisti che arrivano in primavera e di quelli che restano
                fino a fine ottobre.
              </p>
            </div>

            {/* Tre aree di specializzazione */}
            <div className="space-y-3">
              <div className="text-[11px] uppercase tracking-widest text-white/60 font-semibold mb-1">
                Tre aree, una squadra
              </div>
              {[
                {
                  icon: Sparkles,
                  title: "Accoglienza",
                  desc: "Esperienza ospite, comunicazione multilingua, gestione recensioni.",
                },
                {
                  icon: ShieldCheck,
                  title: "Operativita e adempimenti",
                  desc: "Pulizie alberghiere, manutenzione, adempimenti normativi completi.",
                },
                {
                  icon: LineChart,
                  title: "Tariffe e canali",
                  desc: "Tariffe dinamiche, distribuzione su piu canali, reportistica trasparente.",
                },
              ].map((c) => (
                <div
                  key={c.title}
                  className="bg-white/[0.06] border border-white/15 rounded-xl px-5 py-4 flex items-start gap-3 backdrop-blur-sm"
                >
                  <div className="h-9 w-9 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0">
                    <c.icon className="h-4 w-4 text-white" />
                  </div>
                  <div className="min-w-0">
                    <div className="text-sm font-semibold text-white">
                      {c.title}
                    </div>
                    <div className="text-[12px] text-white/75 leading-relaxed mt-0.5">
                      {c.desc}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/20 border-y border-border/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <span className="text-xs font-semibold uppercase tracking-widest text-primary">
              Il team
            </span>
            <h2 className="text-3xl sm:text-4xl font-light mt-3 mb-4">
              Tre <span className="font-semibold">gestori</span>,
              una persona di riferimento
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Accoglienza, operativita e tariffe. Ogni proprieta che gestiamo
              passa per tutte e tre le competenze, ogni giorno.
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
              const accent =
                m.id === "operations"
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : m.id === "revenue"
                  ? "bg-violet-50 text-violet-700 border-violet-200"
                  : "bg-primary/[0.08] text-primary border-primary/20";
              return (
                <div
                  key={m.id}
                  className="group bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm hover:shadow-lg hover:border-primary/30 transition-all flex flex-col"
                >
                  <div className="aspect-[4/3] bg-muted relative overflow-hidden">
                    {m.profilePicture ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={m.profilePicture}
                        alt={`${m.name} — ${m.role}`}
                        className="w-full h-full object-cover group-hover:scale-[1.03] transition-transform duration-500"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/[0.08] to-primary/[0.02]">
                        <UserCircle2 className="h-20 w-20 text-primary/30" />
                      </div>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/30 via-transparent to-transparent pointer-events-none" />
                    <div
                      className={`absolute top-3 left-3 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full border backdrop-blur-sm ${accent}`}
                    >
                      <Icon className="h-3 w-3" />
                      <span className="text-[10px] font-semibold uppercase tracking-wider">
                        {m.shortRole}
                      </span>
                    </div>
                    {m.isSuperhost && (
                      <div className="absolute top-3 right-3 inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-white/95 border border-amber-200 px-2 py-0.5 rounded-full backdrop-blur-sm">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        Superhost
                      </div>
                    )}
                  </div>
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-lg font-semibold mb-1">
                      {m.name ?? "In arrivo"}
                    </h3>
                    <p className="text-xs text-muted-foreground font-medium mb-4">
                      {m.role}
                    </p>
                    <p className="text-sm text-muted-foreground leading-relaxed mb-5 flex-1">
                      {m.bio}
                    </p>
                    <ul className="space-y-2 mb-5">
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
                    {m.airbnbProfileUrl ? (
                      <a
                        href={m.airbnbProfileUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline mt-auto"
                      >
                        Profilo Airbnb
                        <ExternalLink className="h-3 w-3" />
                      </a>
                    ) : (
                      <div className="text-[11px] text-muted-foreground italic mt-auto">
                        Bio dettagliata in arrivo
                      </div>
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
