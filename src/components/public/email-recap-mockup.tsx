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
      {/* Mail header */}
      <div className="px-5 py-4 border-b border-border/50 bg-muted/20">
        <div className="flex items-center justify-between text-[10px] text-muted-foreground uppercase tracking-wider font-semibold mb-2.5">
          <span>Posta in arrivo</span>
          <span>05 maggio · 09:14</span>
        </div>
        <div className="flex items-start gap-3">
          <div className="h-9 w-9 rounded-full bg-[#1D3A62] text-white text-xs font-bold flex items-center justify-center shrink-0">
            HLC
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs text-muted-foreground">
              Hosting Lake Como{" "}
              <span className="text-muted-foreground/60">
                &lt;report@hostinglakecomo.com&gt;
              </span>
            </div>
            <div className="text-sm font-semibold mt-0.5 truncate">
              Casa di Miriam — Recap aprile 2026
            </div>
          </div>
        </div>
      </div>

      {/* Mail body */}
      <div className="p-5 space-y-5">
        <p className="text-sm leading-relaxed">
          Ciao Andrei, ecco il recap del mese: aprile è andato{" "}
          <strong>sopra il target</strong> grazie al weekend di Pasqua e a
          due dirette ricevute dal tuo profilo Instagram.
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
              <strong>Recensione del mese:</strong> &ldquo;Posizione perfetta,
              terrazza sognante. Andrei e il team super reattivi.&rdquo;
              <span className="text-muted-foreground"> — Sophie M.</span>
            </div>
          </div>
        </div>

        <div className="rounded-xl bg-[#1D3A62] text-white p-4">
          <div className="text-[10px] uppercase tracking-wider opacity-80 font-semibold mb-1">
            Da segnalare
          </div>
          <p className="text-xs leading-relaxed mb-2">
            Maggio si sta riempiendo veloce: già 14 notti prenotate.
            Suggeriamo +€20 sul weekend di Pentecoste (24–26 maggio).
          </p>
          <span className="inline-flex items-center gap-1 text-[11px] font-semibold">
            Vedi report completo
            <ArrowRight className="h-3 w-3" />
          </span>
        </div>

        <div className="text-[10px] text-muted-foreground text-center pt-1">
          Hosting Lake Como · Recap mensile · puoi disattivarlo dalle preferenze
        </div>
      </div>
    </div>
  );
}
