import { Info } from "lucide-react";

export function DisclaimerNote() {
  return (
    <div className="rounded-2xl border border-border/50 bg-primary/[0.03] px-5 py-4 flex items-start gap-3">
      <Info className="h-4 w-4 text-primary shrink-0 mt-0.5" />
      <p className="text-[11px] text-muted-foreground leading-relaxed">
        Stima indicativa basata su parametri pubblici. Il valore effettivo
        include storico prenotazioni dell&apos;area, analisi competitor,
        algoritmo di dynamic pricing proprietario e fattori stagionali locali:
        elementi che calcoliamo solo nella nostra analisi dedicata.
      </p>
    </div>
  );
}
