import Link from "next/link";
import {
  Users,
  Star,
  Calendar,
  ArrowRight,
  ExternalLink,
  CheckCircle2,
  MessageCircle,
  ShieldCheck,
} from "lucide-react";
import host from "@/data/host.json";

const STATS = [
  { icon: Calendar, value: `${host.yearsHosting}`, label: "Anni di hosting" },
  {
    icon: Star,
    value: host.primaryListing.rating
      ? host.primaryListing.rating.toFixed(1)
      : "5",
    label: "Rating Airbnb",
  },
  {
    icon: MessageCircle,
    value: `${host.responseRate}%`,
    label: "Tasso di risposta",
  },
  {
    icon: ShieldCheck,
    value: host.isSuperhost ? "Superhost" : "Host",
    label: "Status Airbnb",
  },
];

export default function AboutPage() {
  return (
    <div className="pt-20">
      <section className="py-20 border-b border-border/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">La nostra storia</span>
          <h1 className="text-4xl sm:text-5xl font-light mt-3 mb-4">
            {host.yearsHosting} anni di{" "}
            <span className="font-semibold">ospitalita</span> sul Lago di Como
          </h1>
          <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
            Hosting Lake Como nasce dall'esperienza di {host.name}, host del
            Lago di Como dal {host.joinedYear}. Co-hosting professionale con
            know-how vero, non improvvisato.
          </p>
        </div>
      </section>

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid md:grid-cols-3 gap-10 items-start">
            <div className="md:col-span-1">
              <div className="bg-white rounded-2xl border border-border/50 overflow-hidden shadow-sm">
                <div className="aspect-square bg-muted relative">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={host.profilePicture}
                    alt={host.name}
                    className="w-full h-full object-cover"
                  />
                </div>
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-2">
                    <h3 className="text-lg font-semibold">{host.name}</h3>
                    {host.isSuperhost && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                        <Star className="h-2.5 w-2.5 fill-amber-500 text-amber-500" />
                        Superhost
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-muted-foreground mb-4">
                    {host.yearsHosting} anni da host · {host.responseTime}
                  </p>
                  <a
                    href={host.profileUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-primary hover:underline"
                  >
                    Profilo Airbnb
                    <ExternalLink className="h-3 w-3" />
                  </a>
                </div>
              </div>
            </div>

            <div className="md:col-span-2 space-y-6">
              <p className="text-foreground leading-relaxed text-lg">
                Tutto e iniziato nel <strong>{host.joinedYear}</strong>, quando{" "}
                {host.name} ha aperto la sua prima casa agli ospiti del Lago di
                Como. Da li,{" "}
                <strong>{host.primaryListing.reviewCount}+</strong> recensioni
                e una media di{" "}
                <strong>{host.primaryListing.rating}/5</strong> sulla sua
                listing principale, con il riconoscimento Superhost di Airbnb.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Il Lago non e una destinazione standard. Ogni borgo ha il suo
                carattere, ogni ospite arriva con aspettative diverse. Negli
                anni {host.name} ha imparato a leggerle prima dell'arrivo, a
                costruire un'accoglienza che si adatta — e a tirar fuori il
                meglio da ogni proprieta.
              </p>
              <p className="text-muted-foreground leading-relaxed">
                Hosting Lake Como nasce per portare quel know-how ai proprietari
                del Lago. Non parliamo di teoria: ti affianchiamo applicando lo
                stesso metodo che ha generato un Superhost con{" "}
                {host.primaryListing.reviewCount}+ recensioni a 5 stelle sulla
                nostra prima proprieta.
              </p>
              <ul className="space-y-3 pt-4">
                {host.highlights.map((h) => (
                  <li
                    key={h}
                    className="flex items-start gap-3 text-sm text-foreground"
                  >
                    <CheckCircle2 className="h-5 w-5 text-primary shrink-0 mt-0.5" />
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </section>

      <section className="py-20 bg-muted/30 border-y border-border/50">
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

      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <span className="section-label">Co-hosting</span>
          <h2 className="text-3xl font-light mt-3 mb-4">
            Quello che facciamo per <span className="font-semibold">te</span>
          </h2>
          <p className="text-muted-foreground max-w-2xl mx-auto">
            Pricing dinamico, accoglienza standard hotel, compliance completa,
            reportistica trasparente. Tutto quello che serve per trasformare la
            tua proprieta in una listing che genera Superhost-grade reviews.
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
