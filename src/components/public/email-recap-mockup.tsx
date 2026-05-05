import { Star, ArrowRight } from "lucide-react";

const HIGHLIGHTS = [
  { label: "Ricavi del mese", value: "€8.420", delta: "+12% vs marzo" },
  { label: "Notti vendute", value: "22", delta: "73% occupazione" },
  { label: "ADR medio", value: "€242", delta: "+€7 vs marzo" },
  { label: "Recensioni", value: "5,0", delta: "3 nuove" },
];

export function EmailRecapMockup() {
  return (
    <div className="rounded-2xl border border-border/60 bg-white text-foreground shadow-2xl overflow-hidden select-none max-w-md mx-auto">
      <div className="p-5 sm:p-6 space-y-5">
        <div>
          <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
            Riepilogo aprile 2026
          </div>
          <div className="text-base font-semibold">
            Casa di Miriam
          </div>
        </div>
        <p className="text-sm leading-relaxed">
          Ciao Miriam, aprile ha chiuso <strong>sopra il target</strong>:
          €8.420 di ricavi (+12% rispetto a marzo) e tre nuove recensioni
          a 5 stelle. Tutti gli indicatori in crescita.
        </p>

        <div className="grid grid-cols-2 gap-2.5">
          {HIGHLIGHTS.map((h) => (
            <div
              key={h.label}
              className="rounded-xl border border-border/50 p-3 bg-muted/10"
            >
              <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold mb-1">
                {h.label}
              </div>
              <div className="text-base font-bold tabular-nums leading-none">
                {h.value}
              </div>
              <div className="text-[10px] text-emerald-600 font-medium mt-1.5">
                {h.delta}
              </div>
            </div>
          ))}
        </div>

        <div className="rounded-xl border border-border/50 p-3.5 bg-amber-50/50">
          <div className="flex items-start gap-2">
            <Star className="h-3.5 w-3.5 text-amber-500 fill-amber-500 shrink-0 mt-0.5" />
            <div className="text-xs leading-relaxed">
              <strong>Recensione del mese:</strong> &ldquo;Posizione
              perfetta, terrazza sognante. Il team è stato super
              reattivo.&rdquo;
              <span className="text-muted-foreground"> — Sophie M.</span>
            </div>
          </div>
        </div>

        <div className="relative rounded-xl bg-[#1D3A62] text-white p-4 overflow-hidden">
          <div
            aria-hidden
            className="absolute inset-0 opacity-[0.1] bg-[url('/images/textures/como-trama.jpg')] bg-cover bg-center pointer-events-none"
          />
          <div className="relative text-[10px] uppercase tracking-wider opacity-80 font-semibold mb-1">
            Ottimizzazioni del mese
          </div>
          <p className="relative text-xs leading-relaxed mb-2">
            Tariffe rialzate del 7% sui weekend di Pasqua: +€620 sul
            mensile. Listing aggiornato con due nuove foto della terrazza
            ed è arrivata la prima prenotazione diretta.
          </p>
          <span className="relative inline-flex items-center gap-1 text-[11px] font-semibold">
            Vedi rendiconto completo
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>

        <div className="text-[10px] text-muted-foreground text-center pt-1">
          Hosting Lake Como · Riepilogo mensile · puoi disattivarlo dalle preferenze
        </div>
      </div>
    </div>
  );
}
