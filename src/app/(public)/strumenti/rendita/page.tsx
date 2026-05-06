"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { MapPin, Bed, Users, Eye, TrendingUp, CalendarDays, Euro, Ruler, Home } from "lucide-react";
import { AirBibbyEstimateCard } from "@/components/strumenti/air-bibby-estimate-card";
import { DisclaimerNote } from "@/components/strumenti/disclaimer-note";
import { FullAnalysisCTA } from "@/components/strumenti/full-analysis-cta";
import { formatEuro } from "@/lib/format";

const FormSchema = z.object({
  zone: z.enum(["centro-como", "primo-bacino", "secondo-bacino", "alto-lago"]),
  propertyType: z.enum(["studio", "apartment", "house", "villa"]),
  bedrooms: z.coerce.number().int().min(1).max(6),
  surface: z.coerce.number().int().min(20).max(400),
  lakeView: z.boolean(),
  maxGuests: z.coerce.number().int().min(1).max(12),
});

type FormData = z.infer<typeof FormSchema>;
type Zone = FormData["zone"];
type PropertyType = FormData["propertyType"];

// Tariffe medie (EUR/notte) — calibrate per essere realistiche e prudenti.
// Riferimenti: AirDNA Lake Como, scrape competitor portafoglio HLC.
const BASE_RATES: Record<Zone, Record<PropertyType, number>> = {
  "centro-como":    { studio: 85,  apartment: 125, house: 175, villa: 270 },
  "primo-bacino":   { studio: 105, apartment: 155, house: 215, villa: 320 },
  "secondo-bacino": { studio: 115, apartment: 175, house: 250, villa: 380 },
  "alto-lago":      { studio: 70,  apartment: 110, house: 160, villa: 240 },
};

// Prezzo indicativo al m² (mercato residenziale) — fonti: Borsino Immobiliare,
// agenzie locali. Cifre prudenti, range medio.
const PRICE_PER_SQM: Record<Zone, number> = {
  "centro-como": 3800,
  "primo-bacino": 5200,
  "secondo-bacino": 6500,
  "alto-lago": 2400,
};

const ZONE_LABELS: Record<Zone, string> = {
  "centro-como": "Centro Como",
  "primo-bacino": "Primo Bacino (Cernobbio, Moltrasio, Nesso)",
  "secondo-bacino": "Secondo Bacino (Bellagio, Menaggio, Tremezzo)",
  "alto-lago": "Alto Lago (Colico, Gravedona)",
};

const TYPE_LABELS: Record<PropertyType, string> = {
  studio: "Studio",
  apartment: "Appartamento",
  house: "Casa",
  villa: "Villa",
};

// Tassi di occupazione annuali medi — mantenuti prudenti.
const OCCUPANCY: Record<Zone, number> = {
  "centro-como": 0.65,
  "primo-bacino": 0.62,
  "secondo-bacino": 0.63,
  "alto-lago": 0.50,
};

export default function RenditaPage() {
  const { register, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      zone: "primo-bacino",
      propertyType: "apartment",
      bedrooms: 2,
      surface: 80,
      lakeView: true,
      maxGuests: 4,
    },
    mode: "onChange",
  });

  const zone = watch("zone");
  const propertyType = watch("propertyType");
  const bedrooms = Number(watch("bedrooms")) || 2;
  const surface = Number(watch("surface")) || 80;
  const lakeView = watch("lakeView");
  const maxGuests = Number(watch("maxGuests")) || 4;

  const result = useMemo(() => {
    const baseRate = BASE_RATES[zone][propertyType];
    // Vista lago: +25% (prima +30%, ricalibrato verso il basso)
    const viewMultiplier = lakeView ? 1.25 : 1;
    const extraBedrooms = Math.max(0, bedrooms - 2);
    const nightlyRate = Math.round(baseRate * viewMultiplier + extraBedrooms * 35);

    const occupancy = OCCUPANCY[zone];
    const nightsSold = Math.round(365 * occupancy);

    const grossAnnual = nightlyRate * nightsSold;

    const propertyValue = Math.round(surface * PRICE_PER_SQM[zone]);

    // Scenario gestione autonoma: commissioni piattaforme medie 18%, costi
    // operativi 15% (pulizia, utenze, manutenzione, ricambio biancheria,
    // forniture), tassa di soggiorno €3 a persona/notte (max 4 notti).
    const selfOtaCommission = grossAnnual * 0.18;
    const selfExpenses = grossAnnual * 0.15;
    const selfTouristTax = nightsSold * Math.min(maxGuests, 4) * 3;
    const selfNet = grossAnnual - selfOtaCommission - selfExpenses - selfTouristTax;

    // Scenario Hosting Lake Como: tariffazione dinamica +10% sul prezzo,
    // occupazione +6 punti grazie a multi-canale e ottimizzazione listing,
    // commissione gestione 12%, commissioni piattaforme 12% (mix piu' diretto),
    // costi operativi 10% (economie di scala).
    const abGrossAnnual = Math.round(grossAnnual * 1.10 * 1.06);
    const abOtaCommission = abGrossAnnual * 0.12;
    const abAirbibbyFee = abGrossAnnual * 0.12;
    const abExpenses = abGrossAnnual * 0.10;
    const abTouristTax = nightsSold * Math.min(maxGuests, 4) * 3;
    const abNet = abGrossAnnual - abOtaCommission - abAirbibbyFee - abExpenses - abTouristTax;

    const delta = abNet - selfNet;
    const deltaPercent = selfNet > 0 ? Math.round((delta / selfNet) * 100) : 0;

    const grossYieldOnValue = propertyValue > 0 ? (grossAnnual / propertyValue) * 100 : 0;

    return {
      nightlyRate,
      occupancy: Math.round(occupancy * 100),
      nightsSold,
      grossAnnual,
      propertyValue,
      grossYieldOnValue,
      selfNet: Math.round(selfNet),
      abNet: Math.round(abNet),
      abGrossAnnual,
      delta: Math.round(delta),
      deltaPercent,
    };
  }, [zone, propertyType, bedrooms, surface, lakeView, maxGuests]);

  return (
    <div className="pt-20 pb-20 bg-muted/20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pt-8">
          <Link href="/strumenti" className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-block">
            ← Tutti gli strumenti
          </Link>
          <div className="text-center mt-2">
            <h1 className="text-3xl font-light">
              Calcolatore <span className="font-semibold">Rendita</span>
            </h1>
            <p className="text-sm text-muted-foreground mt-1">
              Stima quanto puo guadagnare il tuo immobile sul Lago di Como
            </p>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-5">
              <h2 className="text-sm font-semibold mb-2">Dettagli proprieta</h2>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground flex items-center gap-1.5">
                  <MapPin className="h-3 w-3" /> Zona
                </label>
                <select
                  {...register("zone")}
                  className="w-full rounded-lg border border-border px-3 py-2.5 text-sm bg-white"
                >
                  {(Object.keys(ZONE_LABELS) as Zone[]).map((k) => (
                    <option key={k} value={k}>{ZONE_LABELS[k]}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Tipo proprieta</label>
                <div className="grid grid-cols-[1.1fr_1.7fr_0.9fr_0.9fr] gap-2">
                  {(Object.keys(TYPE_LABELS) as PropertyType[]).map((t) => (
                    <button
                      type="button"
                      key={t}
                      onClick={() => setValue("propertyType", t, { shouldValidate: true })}
                      className={`px-2 py-2 rounded-lg text-xs font-medium border transition-colors ${
                        propertyType === t
                          ? "bg-primary text-white border-primary"
                          : "bg-white text-muted-foreground border-border hover:bg-muted/50"
                      }`}
                    >
                      {TYPE_LABELS[t]}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground flex items-center gap-1.5">
                  <Ruler className="h-3 w-3" /> Superficie:{" "}
                  <span className="font-bold text-foreground">{surface} m²</span>
                </label>
                <input
                  type="range"
                  min={20}
                  max={400}
                  step={5}
                  {...register("surface", { valueAsNumber: true })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>20</span><span>100</span><span>200</span><span>300</span><span>400</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground flex items-center gap-1.5">
                  <Bed className="h-3 w-3" /> Camere da letto: <span className="font-bold text-foreground">{bedrooms}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={6}
                  {...register("bedrooms", { valueAsNumber: true })}
                  className="w-full accent-primary"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground mt-1">
                  <span>1</span><span>2</span><span>3</span><span>4</span><span>5</span><span>6+</span>
                </div>
              </div>

              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground flex items-center gap-1.5">
                  <Users className="h-3 w-3" /> Ospiti massimi: <span className="font-bold text-foreground">{maxGuests}</span>
                </label>
                <input
                  type="range"
                  min={1}
                  max={12}
                  {...register("maxGuests", { valueAsNumber: true })}
                  className="w-full accent-primary"
                />
              </div>

              <label className="flex items-center gap-3 cursor-pointer pt-2 border-t border-border/50">
                <input
                  type="checkbox"
                  {...register("lakeView")}
                  className="rounded border-border text-primary focus:ring-primary/30"
                />
                <div className="flex items-center gap-1.5 text-sm">
                  <Eye className="h-4 w-4 text-primary" />
                  <span>Vista lago <span className="text-xs text-muted-foreground">(+25%)</span></span>
                </div>
              </label>
            </div>

            <DisclaimerNote />
          </div>

          {/* Risultati */}
          <div className="lg:col-span-3">
            <AirBibbyEstimateCard>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white shadow-lg">
                  <div className="text-white/70 text-xs uppercase tracking-wider mb-2">Ricavi annui stimati</div>
                  <div className="text-5xl font-bold mb-2">{formatEuro(result.grossAnnual)}</div>
                  <div className="text-white/80 text-sm">
                    {formatEuro(result.nightlyRate)}/notte × {result.nightsSold} notti/anno ({result.occupancy}% occupazione)
                  </div>
                </div>

                <div className="grid sm:grid-cols-3 gap-3">
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/40">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Euro className="h-3 w-3" /> Tariffa notte
                    </div>
                    <div className="text-xl font-bold">{formatEuro(result.nightlyRate)}</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/40">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <TrendingUp className="h-3 w-3" /> Occupazione
                    </div>
                    <div className="text-xl font-bold">{result.occupancy}%</div>
                  </div>
                  <div className="bg-muted/30 rounded-xl p-4 border border-border/40">
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <CalendarDays className="h-3 w-3" /> Notti vendute
                    </div>
                    <div className="text-xl font-bold">{result.nightsSold}</div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl border border-border/40 p-6 flex items-center justify-between gap-4 flex-wrap">
                  <div>
                    <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                      <Home className="h-3 w-3" /> Valore stimato immobile
                    </div>
                    <div className="text-2xl font-bold">{formatEuro(result.propertyValue)}</div>
                    <div className="text-[11px] text-muted-foreground mt-1">
                      {surface} m² × {formatEuro(PRICE_PER_SQM[zone])}/m² ({ZONE_LABELS[zone].split(" (")[0]})
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
                      Rendimento lordo
                    </div>
                    <div className="text-2xl font-bold text-primary tabular-nums">
                      {result.grossYieldOnValue.toFixed(1)}%
                    </div>
                    <div className="text-[10px] text-muted-foreground">Ricavi / valore</div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl border border-border/40 overflow-hidden">
                  <div className="px-6 py-4 border-b border-border/40">
                    <h3 className="text-sm font-semibold">Gestione autonoma vs Hosting Lake Como</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      Confronto indicativo sui margini netti annui
                    </p>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border/40">
                    <div className="p-6">
                      <div className="text-xs text-muted-foreground mb-1">Gestione autonoma</div>
                      <div className="text-2xl font-bold text-foreground mb-3">{formatEuro(result.selfNet)}</div>
                      <div className="text-[11px] text-muted-foreground space-y-1">
                        <div>• Commissioni piattaforme ~18%</div>
                        <div>• Spese operative ~15%</div>
                        <div>• Senza tariffazione dinamica</div>
                        <div>• Tempo richiesto: alto</div>
                      </div>
                    </div>
                    <div className="p-6 bg-primary/[0.04]">
                      <div className="flex items-center gap-2 mb-1">
                        <div className="text-xs text-primary font-semibold">Con Hosting Lake Como</div>
                        <span className="text-[10px] bg-primary/10 text-primary font-bold px-2 py-0.5 rounded-full">
                          +{result.deltaPercent}%
                        </span>
                      </div>
                      <div className="text-2xl font-bold text-primary mb-3">{formatEuro(result.abNet)}</div>
                      <div className="text-[11px] text-muted-foreground space-y-1">
                        <div>• Commissione tutto compreso</div>
                        <div>• Tariffe e occupazione ottimizzate</div>
                        <div>• Adempimenti automatici</div>
                        <div>• Tempo richiesto: zero</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-primary/[0.05] border-t border-border/40">
                    <div className="text-xs text-muted-foreground">Guadagno extra indicativo all&apos;anno</div>
                    <div className="text-xl font-bold text-primary">+{formatEuro(result.delta)}</div>
                  </div>
                </div>
              </div>
            </AirBibbyEstimateCard>
          </div>
        </div>

        <div className="mt-6">
          <FullAnalysisCTA slug="rendita" />
        </div>
      </div>
    </div>
  );
}
