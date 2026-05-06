import { Link } from "@/i18n/routing";
import { Lock, ArrowRight, type LucideIcon } from "lucide-react";

interface LockedToolPreviewProps {
  icon?: LucideIcon;
  title: string;
  tagline: string;
  description: string;
  bullets: string[];
  backHref?: string;
}

export function LockedToolPreview({
  title,
  tagline,
  description,
  bullets,
  backHref = "/strumenti",
}: LockedToolPreviewProps) {
  return (
    <div className="pt-20 pb-20 bg-muted/20 min-h-screen">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 mb-6">
          <Link
            href={backHref}
            className="text-xs text-muted-foreground hover:text-foreground inline-block"
          >
            ← Tutti gli strumenti
          </Link>
        </div>
        <div className="mb-8">
          <h1 className="text-3xl font-light">{title}</h1>
          <p className="text-sm text-muted-foreground mt-1">{tagline}</p>
        </div>

        <div className="bg-white rounded-2xl border border-border/50 shadow-sm overflow-hidden">
          <div className="relative bg-gradient-to-br from-primary/[0.04] via-white to-primary/[0.02] p-12 text-center border-b border-border/40">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,rgba(12,116,137,0.08),transparent_60%)]" />
            <div className="relative">
              <div className="h-16 w-16 rounded-2xl bg-primary/[0.1] flex items-center justify-center mx-auto mb-5">
                <Lock className="h-7 w-7 text-primary" />
              </div>
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-wider text-primary bg-primary/[0.08] px-2.5 py-1 rounded-full mb-4">
                Area Clienti Hosting Lake Como
              </div>
              <h2 className="text-2xl font-semibold mb-3">
                Riservato ai proprietari in gestione
              </h2>
              <p className="text-muted-foreground max-w-xl mx-auto">
                {description}
              </p>
            </div>
          </div>

          <div className="p-8">
            <div className="text-xs uppercase tracking-wider text-muted-foreground font-semibold mb-4">
              Cosa include
            </div>
            <ul className="space-y-3 mb-8">
              {bullets.map((b) => (
                <li key={b} className="flex items-start gap-3 text-sm">
                  <div className="h-5 w-5 rounded-full bg-primary/[0.08] flex items-center justify-center shrink-0 mt-0.5">
                    <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                  </div>
                  <span className="text-foreground">{b}</span>
                </li>
              ))}
            </ul>

            <div className="bg-muted/40 rounded-2xl p-6 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div>
                <div className="text-sm font-semibold mb-1">
                  Accedi all'area clienti
                </div>
                <div className="text-xs text-muted-foreground">
                  Disponibile per i proprietari in gestione con Hosting Lake Como.
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <Link
                  href="/login"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl border border-border bg-white text-sm font-semibold hover:bg-muted/40 transition-colors"
                >
                  Accedi
                </Link>
                <Link
                  href="/contact?interest=gestione"
                  className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-sm font-semibold hover:bg-primary/90 transition-colors"
                >
                  Vuoi gestire con noi?
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
