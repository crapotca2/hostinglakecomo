"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Calculator, MapPin, Bed, Users, Eye, TrendingUp, CalendarDays, Euro } from "lucide-react";
import { AirBibbyEstimateCard } from "@/components/strumenti/air-bibby-estimate-card";

const FormSchema = z.object({
  zone: z.enum(["centro-como", "primo-bacino", "secondo-bacino", "alto-lago"]),
  propertyType: z.enum(["studio", "apartment", "house", "villa"]),
  bedrooms: z.coerce.number().int().min(1).max(6),
  lakeView: z.boolean(),
  maxGuests: z.coerce.number().int().min(1).max(12),
});

type FormData = z.infer<typeof FormSchema>;
type Zone = FormData["zone"];
type PropertyType = FormData["propertyType"];

// Base rates (EUR/night) derived from Hosting Lake Como portfolio averages per zone + type
const BASE_RATES: Record<Zone, Record<PropertyType, number>> = {
  "centro-como":    { studio: 95,  apartment: 140, house: 200, villa: 310 },
  "primo-bacino":   { studio: 120, apartment: 175, house: 240, villa: 360 },
  "secondo-bacino": { studio: 130, apartment: 195, house: 280, villa: 420 },
  "alto-lago":      { studio: 80,  apartment: 125, house: 180, villa: 270 },
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

// Occupancy estimates per zone (annual average)
const OCCUPANCY: Record<Zone, number> = {
  "centro-como": 0.72,
  "primo-bacino": 0.68,
  "secondo-bacino": 0.70,
  "alto-lago": 0.55,
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function RenditaPage() {
  const { register, watch, setValue } = useForm<FormData>({
    resolver: zodResolver(FormSchema),
    defaultValues: {
      zone: "primo-bacino",
      propertyType: "apartment",
      bedrooms: 2,
      lakeView: true,
      maxGuests: 4,
    },
    mode: "onChange",
  });

  const zone = watch("zone");
  const propertyType = watch("propertyType");
  const bedrooms = Number(watch("bedrooms")) || 2;
  const lakeView = watch("lakeView");
  const maxGuests = Number(watch("maxGuests")) || 4;

  const result = useMemo(() => {
    const baseRate = BASE_RATES[zone][propertyType];
    // +30% for lake view, +€40/bedroom over 2
    const viewMultiplier = lakeView ? 1.3 : 1;
    const extraBedrooms = Math.max(0, bedrooms - 2);
    const nightlyRate = Math.round(baseRate * viewMultiplier + extraBedrooms * 40);

    const occupancy = OCCUPANCY[zone];
    const nightsSold = Math.round(365 * occupancy);

    const grossAnnual = nightlyRate * nightsSold;

    // Self-managed scenario (OTA commissions + no dynamic pricing)
    const selfOtaCommission = grossAnnual * 0.17; // avg across Airbnb/Booking/Vrbo
    const selfExpenses = grossAnnual * 0.12; // cleaning, utilities, supplies
    const selfTouristTax = nightsSold * Math.min(maxGuests, 4) * 3; // avg €3/person/night capped
    const selfNet = grossAnnual - selfOtaCommission - selfExpenses - selfTouristTax;

    // Hosting Lake Como scenario (optimized pricing +18%, higher occupancy +12%, commission 10%)
    const abGrossAnnual = Math.round(grossAnnual * 1.18 * 1.12);
    const abOtaCommission = abGrossAnnual * 0.12; // better channel mix
    const abAirbibbyFee = abGrossAnnual * 0.1;
    const abExpenses = abGrossAnnual * 0.08; // optimized ops
    const abTouristTax = selfTouristTax;
    const abNet = abGrossAnnual - abOtaCommission - abAirbibbyFee - abExpenses - abTouristTax;

    const delta = abNet - selfNet;
    const deltaPercent = selfNet > 0 ? Math.round((delta / selfNet) * 100) : 0;

    return {
      nightlyRate,
      occupancy: Math.round(occupancy * 100),
      nightsSold,
      grossAnnual,
      selfNet: Math.round(selfNet),
      abNet: Math.round(abNet),
      abGrossAnnual,
      delta: Math.round(delta),
      deltaPercent,
    };
  }, [zone, propertyType, bedrooms, lakeView, maxGuests]);

  return (
    <div className="pt-20 pb-20 bg-muted/20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 pt-8">
          <Link href="/strumenti" className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-block">
            ← Tutti gli strumenti
          </Link>
          <div className="flex items-center gap-3 mb-3">
            <div className="h-12 w-12 rounded-xl bg-primary/[0.08] flex items-center justify-center">
              <Calculator className="h-6 w-6 text-primary" />
            </div>
            <div>
              <h1 className="text-3xl font-light">
                Calcolatore <span className="font-semibold">Rendita</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                Stima quanto puo' guadagnare il tuo immobile sul Lago di Como
              </p>
            </div>
          </div>
        </div>

        <div className="grid lg:grid-cols-5 gap-8">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-5">
              <h2 className="text-sm font-semibold mb-2">Dettagli proprieta'</h2>

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
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">Tipo proprieta'</label>
                <div className="grid grid-cols-4 gap-2">
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
                  <span>Vista lago <span className="text-xs text-muted-foreground">(+30%)</span></span>
                </div>
              </label>
            </div>
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <AirBibbyEstimateCard slug="rendita" title="Stima Rendita Hosting Lake Como">
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-8 text-white shadow-lg">
                  <div className="text-white/70 text-xs uppercase tracking-wider mb-2">Revenue Annuo Stimato</div>
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
                        <div>• Commissioni OTA ~17%</div>
                        <div>• Spese operative ~12%</div>
                        <div>• No dynamic pricing</div>
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
                        <div>• Commissione all-inclusive</div>
                        <div>• Occupazione e pricing ottimizzati</div>
                        <div>• Compliance automatica</div>
                        <div>• Tempo richiesto: zero</div>
                      </div>
                    </div>
                  </div>
                  <div className="px-6 py-4 bg-primary/[0.05] border-t border-border/40">
                    <div className="text-xs text-muted-foreground">Guadagno extra indicativo all'anno</div>
                    <div className="text-xl font-bold text-primary">+{formatEuro(result.delta)}</div>
                  </div>
                </div>
              </div>
            </AirBibbyEstimateCard>
          </div>
        </div>
      </div>
    </div>
  );
}
