import {
  Star,
  ExternalLink,
  CheckCircle2,
  Sparkles,
  LineChart,
  ShieldCheck,
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
          <div className="grid lg:grid-cols-[6fr_5fr] gap-10 lg:gap-14 items-center">
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
          <div className="text-center mb-12">
            <h2 className="text-3xl sm:text-4xl font-light mb-4">
              Dietro Hosting Lake <span className="font-semibold">Como</span>
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Siamo una squadra di tre specialisti. L&apos;esperienza diretta
              sul Lago la porta Angelo, Superhost di Airbnb dal 2017, che cura
              l&apos;accoglienza e il rapporto con gli ospiti. Al suo fianco
              lavorano due figure dedicate all&apos;operativita e agli
              adempimenti normativi e alla strategia di tariffe e canali.
            </p>
          </div>

          {/* Spotlight Angelo */}
          {(() => {
            const angelo = team.members.find((m) => m.id === "angelo");
            if (!angelo) return null;
            return (
              <div className="bg-white rounded-3xl border border-border/50 shadow-sm overflow-hidden grid md:grid-cols-[5fr_7fr] max-w-4xl mx-auto">
                <div className="aspect-square md:aspect-auto bg-muted relative overflow-hidden">
                  {angelo.profilePicture && (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={angelo.profilePicture}
                      alt={`${angelo.name} — ${angelo.role}`}
                      className="w-full h-full object-cover"
                    />
                  )}
                  {angelo.isSuperhost && (
                    <div className="absolute top-4 left-4 inline-flex items-center gap-1.5 bg-white/95 backdrop-blur-sm px-3 py-1.5 rounded-full border border-amber-200 shadow-sm">
                      <Star className="h-3 w-3 fill-amber-500 text-amber-500" />
                      <span className="text-[11px] font-semibold uppercase tracking-wider text-amber-700">
                        Superhost dal 2017
                      </span>
                    </div>
                  )}
                </div>
                <div className="p-8 md:p-10 flex flex-col justify-center">
                  <span className="text-xs font-semibold uppercase tracking-widest text-primary mb-2">
                    Esperienza diretta sul Lago
                  </span>
                  <h3 className="text-2xl font-semibold mb-1">{angelo.name}</h3>
                  <p className="text-sm text-muted-foreground mb-5">
                    {angelo.role}
                  </p>
                  <p className="text-foreground leading-relaxed mb-5">
                    {angelo.bio}
                  </p>
                  <ul className="space-y-2 mb-6">
                    {angelo.highlights.map((h) => (
                      <li
                        key={h}
                        className="flex items-start gap-2.5 text-sm"
                      >
                        <CheckCircle2 className="h-4 w-4 text-primary shrink-0 mt-0.5" />
                        {h}
                      </li>
                    ))}
                  </ul>
                  {angelo.airbnbProfileUrl && (
                    <a
                      href={angelo.airbnbProfileUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold hover:bg-muted/40 transition-colors w-fit"
                    >
                      Vedi profilo Airbnb
                      <ExternalLink className="h-3.5 w-3.5" />
                    </a>
                  )}
                </div>
              </div>
            );
          })()}
        </div>
      </section>

    </div>
  );
}
