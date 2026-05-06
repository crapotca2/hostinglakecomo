"use client";

import { useState, useMemo } from "react";
import { Link } from "@/i18n/routing";
import { useTranslations } from "next-intl";
import { AirBibbyEstimateCard } from "@/components/strumenti/air-bibby-estimate-card";
import { DisclaimerNote } from "@/components/strumenti/disclaimer-note";
import { FullAnalysisCTA } from "@/components/strumenti/full-analysis-cta";
import { formatEuro, formatInteger } from "@/lib/format";

// Commissioni piattaforme — somma di service fee host + transaction fee.
// Cifre prudenti, lato medio-alto del range osservato sul mercato 2025.
const OTA_FEES = {
  airbnb: { color: "#FF5A5F", commission: 15 },
  booking: { color: "#003580", commission: 17 },
  vrbo: { color: "#3B5998", commission: 13 },
  expedia: { color: "#FFC72C", commission: 18 },
} as const;

type OtaKey = keyof typeof OTA_FEES;

export default function ProfitDirettoPage() {
  const t = useTranslations("strumenti.profitDiretto");
  const tStr = useTranslations("strumenti");
  const tFields = useTranslations("strumenti.profitDiretto.fields");
  const tCh = useTranslations("strumenti.profitDiretto.channels");
  const tRes = useTranslations("strumenti.profitDiretto.results");

  const [annualRevenue, setAnnualRevenue] = useState(50000);
  const [airbnbPct, setAirbnbPct] = useState(40);
  const [bookingPct, setBookingPct] = useState(30);
  const [vrboPct, setVrboPct] = useState(10);
  const [expediaPct, setExpediaPct] = useState(5);

  const result = useMemo(() => {
    const directPct = Math.max(0, 100 - airbnbPct - bookingPct - vrboPct - expediaPct);

    const airbnbRevenue = annualRevenue * (airbnbPct / 100);
    const bookingRevenue = annualRevenue * (bookingPct / 100);
    const vrboRevenue = annualRevenue * (vrboPct / 100);
    const expediaRevenue = annualRevenue * (expediaPct / 100);
    const directRevenue = annualRevenue * (directPct / 100);

    const airbnbFees = airbnbRevenue * (OTA_FEES.airbnb.commission / 100);
    const bookingFees = bookingRevenue * (OTA_FEES.booking.commission / 100);
    const vrboFees = vrboRevenue * (OTA_FEES.vrbo.commission / 100);
    const expediaFees = expediaRevenue * (OTA_FEES.expedia.commission / 100);
    const totalOtaFees = airbnbFees + bookingFees + vrboFees + expediaFees;

    // Direct bookings: Stripe fee 1.4% + €0.25 per transaction (assume ~€200 avg booking)
    const directFees = directRevenue * 0.017;

    const currentNet = annualRevenue - totalOtaFees - directFees;

    // Scenario: spostiamo il 25% delle prenotazioni dalle piattaforme alle
    // dirette grazie a sito proprio, riprenotazioni e ospiti ricorrenti.
    // Cifra prudente: 50% sarebbe irrealistica nei primi anni.
    const otaRevenue = airbnbRevenue + bookingRevenue + vrboRevenue + expediaRevenue;
    const shiftedAmount = otaRevenue * 0.25;
    const newDirectRevenue = directRevenue + shiftedAmount;

    // Recalculate fees under new mix (proportional reduction)
    const reduction = otaRevenue > 0 ? (otaRevenue - shiftedAmount) / otaRevenue : 1;
    const newOtaFees = totalOtaFees * reduction;
    const newDirectFees = newDirectRevenue * 0.017;
    const optimizedNet = annualRevenue - newOtaFees - newDirectFees;

    const savings = optimizedNet - currentNet;
    const fiveYearSavings = savings * 5;

    return {
      directPct,
      totalOtaFees,
      directFees,
      totalFees: totalOtaFees + directFees,
      currentNet,
      optimizedNet,
      savings,
      fiveYearSavings,
      breakdown: [
        { source: "airbnb" as const, revenue: airbnbRevenue, fees: airbnbFees },
        { source: "booking" as const, revenue: bookingRevenue, fees: bookingFees },
        { source: "vrbo" as const, revenue: vrboRevenue, fees: vrboFees },
        { source: "expedia" as const, revenue: expediaRevenue, fees: expediaFees },
        { source: "direct" as const, revenue: directRevenue, fees: directFees },
      ],
    };
  }, [annualRevenue, airbnbPct, bookingPct, vrboPct, expediaPct]);

  return (
    <div className="pt-20 pb-20 bg-muted/20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="pt-8 mb-6">
          <Link href="/strumenti" className="text-xs text-muted-foreground hover:text-foreground inline-block">
            {tStr("backToTools")}
          </Link>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-center">
          {/* Sinistra: titolo + form + disclaimer */}
          <div className="lg:col-span-2 space-y-4">
            <div>
              <h1 className="text-3xl font-light">
                {t("title1")} <span className="font-semibold">{t("title2")}</span>
              </h1>
              <p className="text-sm text-muted-foreground mt-1">
                {t("subtitle")}
              </p>
            </div>
            <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-5">
              <div>
                <label className="text-xs font-medium mb-1.5 block text-muted-foreground">{tFields("annualRevenue")}</label>
                <div className="relative">
                  <input
                    type="text"
                    inputMode="numeric"
                    value={formatInteger(annualRevenue)}
                    onChange={(e) => {
                      const raw = e.target.value.replace(/[^\d]/g, "");
                      setAnnualRevenue(raw === "" ? 0 : parseInt(raw, 10));
                    }}
                    className="w-full rounded-lg border border-border px-3 py-2.5 text-sm pr-10 tabular-nums"
                  />
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">€</span>
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h2 className="text-sm font-semibold mb-3">{tFields("channelMixTitle")}</h2>
                <div className="space-y-4">
                  <ChannelSlider label={tCh("airbnb")} value={airbnbPct} onChange={setAirbnbPct} color="#FF5A5F" />
                  <ChannelSlider label={tCh("booking")} value={bookingPct} onChange={setBookingPct} color="#003580" />
                  <ChannelSlider label={tCh("vrbo")} value={vrboPct} onChange={setVrboPct} color="#3B5998" />
                  <ChannelSlider label={tCh("expedia")} value={expediaPct} onChange={setExpediaPct} color="#FFC72C" />

                  <div className="pt-3 border-t border-border/50 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full bg-primary" />
                      <span className="text-sm font-medium">{tFields("directBookings")}</span>
                    </div>
                    <span className="text-sm font-bold text-primary">{result.directPct}%</span>
                  </div>
                  {airbnbPct + bookingPct + vrboPct + expediaPct > 100 && (
                    <p className="text-xs text-red-600">{tFields("overflowError")}</p>
                  )}
                </div>
              </div>
            </div>

            <DisclaimerNote />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <AirBibbyEstimateCard>
              <div className="space-y-4">
                <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
                  <div className="text-white/70 text-xs uppercase tracking-wider mb-2">{tRes("fiveYearTitle")}</div>
                  <div className="text-4xl font-bold mb-2">+{formatEuro(result.fiveYearSavings)}</div>
                  <div className="text-white/80 text-sm">
                    {tRes("fiveYearHint")}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl border border-border/40">
                  <div className="px-6 py-4 border-b border-border/40">
                    <h3 className="text-sm font-semibold">{tRes("currentFeesTitle")}</h3>
                  </div>
                  <div className="p-6 space-y-3">
                    {result.breakdown.filter((b) => b.revenue > 0).map((b) => {
                      const meta = b.source === "direct"
                        ? { label: tCh("direct"), color: "#1B3A6B" }
                        : { label: tCh(b.source), color: OTA_FEES[b.source as OtaKey].color };
                      return (
                        <div key={b.source}>
                          <div className="flex items-center justify-between mb-1.5">
                            <div className="flex items-center gap-2">
                              <div className="h-3 w-3 rounded-full" style={{ backgroundColor: meta.color }} />
                              <span className="text-sm font-medium">{meta.label}</span>
                            </div>
                            <div className="flex items-center gap-3">
                              <span className="text-sm text-muted-foreground tabular-nums">{formatEuro(b.revenue)}</span>
                              <span className="text-sm font-semibold text-red-500 tabular-nums">-{formatEuro(b.fees)}</span>
                            </div>
                          </div>
                          <div className="h-2 bg-muted rounded-full overflow-hidden">
                            <div className="h-full rounded-full transition-all" style={{ width: `${(b.revenue / annualRevenue) * 100}%`, backgroundColor: meta.color }} />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl border border-border/40">
                  <div className="px-6 py-4 border-b border-border/40">
                    <h3 className="text-sm font-semibold">{tRes("scenariosTitle")}</h3>
                    <p className="text-xs text-muted-foreground mt-1">
                      {tRes("scenariosSubtitle")}
                    </p>
                  </div>
                  <div className="grid grid-cols-2 divide-x divide-border/40">
                    <div className="p-5">
                      <div className="text-xs text-muted-foreground mb-1">{tRes("currentMix")}</div>
                      <div className="text-2xl font-bold">{formatEuro(result.currentNet)}</div>
                      <div className="text-[11px] text-muted-foreground mt-2">
                        {tRes("feesLine", { fees: formatEuro(result.totalFees) })}
                      </div>
                    </div>
                    <div className="p-5 bg-primary/[0.04]">
                      <div className="text-xs text-primary font-semibold mb-1">{tRes("withMoreDirect")}</div>
                      <div className="text-2xl font-bold text-primary">{formatEuro(result.optimizedNet)}</div>
                      <div className="text-[11px] text-emerald-600 font-medium mt-2">
                        {tRes("perYearSaving", { amount: formatEuro(result.savings) })}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </AirBibbyEstimateCard>
          </div>
        </div>

        <div className="mt-6">
          <FullAnalysisCTA slug="profit-diretto" />
        </div>
      </div>
    </div>
  );
}

function ChannelSlider({
  label,
  value,
  onChange,
  color,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  color: string;
}) {
  return (
    <div>
      <div className="flex items-center justify-between mb-1.5">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full" style={{ backgroundColor: color }} />
          <span className="text-sm font-medium">{label}</span>
        </div>
        <span className="text-sm font-bold">{value}%</span>
      </div>
      <input
        type="range"
        min={0}
        max={100}
        step={5}
        value={value}
        onChange={(e) => onChange(parseInt(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}
