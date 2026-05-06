"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { TrendingUp, Euro, Calendar, Percent, Home } from "lucide-react";
import { AirBibbyEstimateCard } from "@/components/strumenti/air-bibby-estimate-card";
import { DisclaimerNote } from "@/components/strumenti/disclaimer-note";

function formatEuro(amount: number, decimals = 0): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(amount);
}

export default function InvestimentoPage() {
  const [purchasePrice, setPurchasePrice] = useState(400000);
  const [renovation, setRenovation] = useState(30000);
  const [downPaymentPct, setDownPaymentPct] = useState(30);
  const [mortgageRate, setMortgageRate] = useState(3.8);
  const [mortgageYears, setMortgageYears] = useState(25);
  const [annualRevenue, setAnnualRevenue] = useState(48000);
  const [operatingCostsPct, setOperatingCostsPct] = useState(25);

  const result = useMemo(() => {
    const totalInvestment = purchasePrice + renovation;
    const downPayment = totalInvestment * (downPaymentPct / 100);
    const mortgageAmount = totalInvestment - downPayment;

    // Monthly mortgage payment (French amortization)
    const monthlyRate = mortgageRate / 100 / 12;
    const months = mortgageYears * 12;
    const monthlyPayment = monthlyRate > 0
      ? (mortgageAmount * monthlyRate) / (1 - Math.pow(1 + monthlyRate, -months))
      : mortgageAmount / months;
    const annualMortgage = monthlyPayment * 12;

    // Operating expenses (property tax, insurance, utilities, maintenance, management)
    const annualOperatingCosts = annualRevenue * (operatingCostsPct / 100);

    // Net cash flow
    const annualCashFlow = annualRevenue - annualOperatingCosts - annualMortgage;
    const monthlyCashFlow = annualCashFlow / 12;

    // Cap Rate (no mortgage, pure property ROI)
    const noi = annualRevenue - annualOperatingCosts;
    const capRate = totalInvestment > 0 ? (noi / totalInvestment) * 100 : 0;

    // Cash-on-Cash Return (actual return on cash invested)
    const cashOnCash = downPayment > 0 ? (annualCashFlow / downPayment) * 100 : 0;

    // Payback period (years to recover down payment from cash flow)
    const paybackYears = annualCashFlow > 0 ? downPayment / annualCashFlow : Infinity;

    // Gross yield
    const grossYield = totalInvestment > 0 ? (annualRevenue / totalInvestment) * 100 : 0;

    return {
      totalInvestment,
      downPayment,
      mortgageAmount,
      annualMortgage,
      monthlyPayment,
      annualOperatingCosts,
      noi,
      annualCashFlow,
      monthlyCashFlow,
      capRate,
      cashOnCash,
      paybackYears,
      grossYield,
    };
  }, [purchasePrice, renovation, downPaymentPct, mortgageRate, mortgageYears, annualRevenue, operatingCostsPct]);

  return (
    <div className="pt-20 pb-20 bg-muted/20 min-h-screen">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-8 pt-8">
          <Link href="/strumenti" className="text-xs text-muted-foreground hover:text-foreground mb-3 inline-block">
            ← Tutti gli strumenti
          </Link>
          <h1 className="text-3xl font-light">
            Calcolatore <span className="font-semibold">Investimento</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            ROI, cash flow, cap rate e payback per investitori sul Lago di Como
          </p>
        </div>

        <div className="grid lg:grid-cols-5 gap-8 items-start">
          {/* Form */}
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-white rounded-2xl p-6 border border-border/50 space-y-5">
              <div>
                <h2 className="text-sm font-semibold mb-3">Investimento iniziale</h2>
                <div className="space-y-4">
                  <InputField
                    label="Prezzo d'acquisto"
                    value={purchasePrice}
                    onChange={setPurchasePrice}
                    step={10000}
                    suffix="€"
                  />
                  <InputField
                    label="Ristrutturazione"
                    value={renovation}
                    onChange={setRenovation}
                    step={5000}
                    suffix="€"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h2 className="text-sm font-semibold mb-3">Mutuo</h2>
                <div className="space-y-4">
                  <RangeField
                    label="Anticipo"
                    value={downPaymentPct}
                    onChange={setDownPaymentPct}
                    min={10} max={100} step={5}
                    suffix="%"
                  />
                  <RangeField
                    label="Tasso d'interesse"
                    value={mortgageRate}
                    onChange={setMortgageRate}
                    min={0} max={10} step={0.1}
                    suffix="%"
                    decimals={1}
                  />
                  <RangeField
                    label="Durata mutuo"
                    value={mortgageYears}
                    onChange={setMortgageYears}
                    min={5} max={30} step={5}
                    suffix=" anni"
                  />
                </div>
              </div>

              <div className="pt-4 border-t border-border/50">
                <h2 className="text-sm font-semibold mb-3">Rendimento atteso</h2>
                <div className="space-y-4">
                  <InputField
                    label="Revenue annuo lordo"
                    value={annualRevenue}
                    onChange={setAnnualRevenue}
                    step={1000}
                    suffix="€"
                  />
                  <RangeField
                    label="Costi operativi"
                    value={operatingCostsPct}
                    onChange={setOperatingCostsPct}
                    min={10} max={50} step={1}
                    suffix="% del revenue"
                  />
                </div>
              </div>
            </div>

            <DisclaimerNote />
          </div>

          {/* Results */}
          <div className="lg:col-span-3">
            <AirBibbyEstimateCard slug="investimento">
              <div className="space-y-4">
                <div className="grid sm:grid-cols-2 gap-4">
                  <div className="bg-gradient-to-br from-primary to-primary/80 rounded-2xl p-6 text-white shadow-lg">
                    <div className="text-white/70 text-xs uppercase tracking-wider mb-1">Cash-on-Cash Return</div>
                    <div className="text-4xl font-bold mb-1">{result.cashOnCash.toFixed(1)}%</div>
                    <div className="text-white/80 text-xs">Ritorno annuo sul capitale investito</div>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-6 border border-border/40">
                    <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Cap Rate</div>
                    <div className="text-4xl font-bold mb-1">{result.capRate.toFixed(1)}%</div>
                    <div className="text-xs text-muted-foreground">Rendimento puro dell'immobile</div>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-6 border border-border/40">
                    <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Payback Period</div>
                    <div className="text-4xl font-bold mb-1">
                      {isFinite(result.paybackYears) ? `${result.paybackYears.toFixed(1)} anni` : "—"}
                    </div>
                    <div className="text-xs text-muted-foreground">Tempo per recuperare l'anticipo</div>
                  </div>
                  <div className="bg-muted/30 rounded-2xl p-6 border border-border/40">
                    <div className="text-muted-foreground text-xs uppercase tracking-wider mb-1">Cash Flow Mensile</div>
                    <div className={`text-4xl font-bold mb-1 ${result.monthlyCashFlow >= 0 ? "text-emerald-600" : "text-red-500"}`}>
                      {result.monthlyCashFlow >= 0 ? "+" : ""}{formatEuro(result.monthlyCashFlow)}
                    </div>
                    <div className="text-xs text-muted-foreground">Dopo mutuo e spese</div>
                  </div>
                </div>

                <div className="bg-muted/30 rounded-2xl border border-border/40">
                  <div className="px-6 py-4 border-b border-border/40">
                    <h3 className="text-sm font-semibold">Dettaglio economico annuale</h3>
                  </div>
                  <div className="divide-y divide-border/30">
                    <Row label="Investimento totale" value={formatEuro(result.totalInvestment)} icon={Home} />
                    <Row label="Anticipo" value={formatEuro(result.downPayment)} icon={Euro} muted />
                    <Row label="Mutuo" value={formatEuro(result.mortgageAmount)} icon={Euro} muted />
                    <Row label="Rata mensile mutuo" value={formatEuro(result.monthlyPayment)} icon={Calendar} />
                    <Row label="Revenue annuo lordo" value={formatEuro(annualRevenue)} icon={TrendingUp} />
                    <Row label="Costi operativi" value={`-${formatEuro(result.annualOperatingCosts)}`} icon={Euro} negative />
                    <Row label="NOI (Net Operating Income)" value={formatEuro(result.noi)} icon={Euro} bold />
                    <Row label="Mutuo annuo" value={`-${formatEuro(result.annualMortgage)}`} icon={Euro} negative />
                    <Row label="Cash Flow Annuo" value={formatEuro(result.annualCashFlow)} icon={Percent} bold highlight={result.annualCashFlow >= 0} />
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

function InputField({
  label,
  value,
  onChange,
  step,
  suffix,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  step: number;
  suffix?: string;
}) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">{label}</label>
      <div className="relative">
        <input
          type="number"
          value={value}
          step={step}
          onChange={(e) => onChange(Math.max(0, parseFloat(e.target.value) || 0))}
          className="w-full rounded-lg border border-border px-3 py-2.5 text-sm pr-10"
        />
        {suffix && (
          <span className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-muted-foreground">
            {suffix}
          </span>
        )}
      </div>
    </div>
  );
}

function RangeField({
  label,
  value,
  onChange,
  min,
  max,
  step,
  suffix,
  decimals = 0,
}: {
  label: string;
  value: number;
  onChange: (v: number) => void;
  min: number;
  max: number;
  step: number;
  suffix?: string;
  decimals?: number;
}) {
  return (
    <div>
      <label className="text-xs font-medium mb-1.5 block text-muted-foreground">
        {label}: <span className="font-bold text-foreground">{value.toFixed(decimals)}{suffix}</span>
      </label>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="w-full accent-primary"
      />
    </div>
  );
}

function Row({
  label,
  value,
  icon: Icon,
  muted = false,
  negative = false,
  bold = false,
  highlight = false,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  muted?: boolean;
  negative?: boolean;
  bold?: boolean;
  highlight?: boolean;
}) {
  return (
    <div className="flex items-center justify-between px-6 py-3">
      <div className="flex items-center gap-2">
        <Icon className={`h-3.5 w-3.5 ${muted ? "text-muted-foreground/60" : "text-muted-foreground"}`} />
        <span className={`text-sm ${muted ? "text-muted-foreground" : "text-foreground"}`}>{label}</span>
      </div>
      <span className={`text-sm tabular-nums ${bold ? "font-bold" : "font-medium"} ${
        negative ? "text-red-500" : highlight ? "text-emerald-600" : muted ? "text-muted-foreground" : "text-foreground"
      }`}>
        {value}
      </span>
    </div>
  );
}
