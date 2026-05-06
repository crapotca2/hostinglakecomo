import Link from "next/link";
import { ArrowRight } from "lucide-react";

export function FullAnalysisCTA({ slug }: { slug: string }) {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/[0.04] px-6 py-5 flex flex-wrap items-center justify-between gap-4">
      <div className="text-sm text-foreground">
        <span className="font-semibold">Vuoi il calcolo completo sul tuo immobile?</span>{" "}
        <span className="text-muted-foreground">
          Analisi dedicata con i nostri dati interni e l&apos;algoritmo di
          tariffazione proprietario.
        </span>
      </div>
      <Link
        href={`/contact?interest=consulenza&from=${slug}`}
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors shadow-sm shrink-0"
      >
        Richiedi Analisi Dedicata
        <ArrowRight className="h-3.5 w-3.5" />
      </Link>
    </div>
  );
}
