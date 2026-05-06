import Link from "next/link";
import { ArrowRight } from "lucide-react";

interface AirBibbyEstimateCardProps {
  children: React.ReactNode;
  slug: string;
}

export function AirBibbyEstimateCard({
  children,
  slug,
}: AirBibbyEstimateCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div className="p-6">{children}</div>

      <div className="px-6 py-4 bg-white border-t border-border/40 flex items-center justify-between gap-4 flex-wrap">
        <div className="text-xs text-muted-foreground">
          Vuoi il calcolo completo sul tuo immobile?
        </div>
        <Link
          href={`/contact?interest=consulenza&from=${slug}`}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary text-white text-xs font-semibold hover:bg-primary/90 transition-colors"
        >
          Ottieni Analisi Completa Firmata
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </div>
  );
}
