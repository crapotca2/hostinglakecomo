import Link from "next/link";
import { ShieldCheck, Info, ArrowRight } from "lucide-react";

interface AirBibbyEstimateCardProps {
  children: React.ReactNode;
  slug: string;
  title?: string;
}

export function AirBibbyEstimateCard({
  children,
  slug,
  title = "Stima Hosting Lake Como",
}: AirBibbyEstimateCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-border/60 shadow-sm overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40 bg-gradient-to-r from-primary/[0.04] to-primary/[0.01]">
        <div className="flex items-center gap-3">
          <div
            className="h-9 w-9 rounded-lg flex items-center justify-center text-white font-bold text-xs"
            style={{
              background: "linear-gradient(135deg, #0C7489 0%, #119DB0 100%)",
            }}
          >
            AB
          </div>
          <div>
            <div className="text-xs uppercase tracking-wider text-primary font-semibold">
              {title}
            </div>
            <div className="text-[11px] text-muted-foreground">
              Elaborazione preliminare su parametri pubblici
            </div>
          </div>
        </div>
        <span className="hidden sm:inline-flex items-center gap-1.5 text-[11px] font-medium text-primary bg-primary/[0.08] px-2.5 py-1 rounded-full">
          <ShieldCheck className="h-3 w-3" />
          Firmato Hosting Lake Como
        </span>
      </div>

      <div className="p-6">{children}</div>

      <div className="px-6 py-4 bg-primary/[0.03] border-t border-border/40 flex items-start gap-3">
        <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Stima indicativa basata su parametri pubblici. Il valore effettivo
          include storico prenotazioni dell'area, analisi competitor, algoritmo
          di dynamic pricing proprietario e fattori stagionali locali: elementi
          che calcoliamo solo nella nostra analisi dedicata.
        </p>
      </div>

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
