"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, BarChart3, Clock, TrendingUp, Layers, Repeat, Globe, Euro, CalendarDays, Users, Percent } from "lucide-react";
import { ReportTable, type ReportColumn } from "@/components/reports/report-table";
import { ReportFilters, presetToDateRange } from "@/components/reports/report-filters";
import { StatCard } from "@/components/reports/stat-card";
import { downloadCSV } from "@/components/reports/csv-export";

type Tab = "overview" | "days-in-advance" | "occupancy" | "gaps" | "repeat-guests" | "site-performance";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export default function AnalysisReportsPage() {
  const [tab, setTab] = useState<Tab>("overview");
  const [preset, setPreset] = useState("ytd");
  const [{ from, to }, setRange] = useState(() => presetToDateRange("ytd"));

  function handlePreset(p: string) {
    setPreset(p);
    setRange(presetToDateRange(p));
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Link href="/dashboard/reports" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Tutti i report
      </Link>
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Analysis & Statistics</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Metriche aggregate, distribuzioni e performance</p>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-border/50 w-fit flex-wrap">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={BarChart3} label="Overview" />
        <TabBtn active={tab === "days-in-advance"} onClick={() => setTab("days-in-advance")} icon={Clock} label="Days in Advance" />
        <TabBtn active={tab === "occupancy"} onClick={() => setTab("occupancy")} icon={TrendingUp} label="Occupancy" />
        <TabBtn active={tab === "gaps"} onClick={() => setTab("gaps")} icon={Layers} label="Availability Gaps" />
        <TabBtn active={tab === "repeat-guests"} onClick={() => setTab("repeat-guests")} icon={Repeat} label="Repeat Guests" />
        <TabBtn active={tab === "site-performance"} onClick={() => setTab("site-performance")} icon={Globe} label="Site Performance" />
      </div>

      <ReportFilters
        from={from}
        to={to}
        onFromChange={(v) => setRange((r) => ({ ...r, from: v }))}
        onToChange={(v) => setRange((r) => ({ ...r, to: v }))}
        preset={preset}
        onPresetChange={handlePreset}
      />

      {tab === "overview" && <OverviewView from={from} to={to} />}
      {tab === "days-in-advance" && <DaysInAdvanceView from={from} to={to} />}
      {tab === "occupancy" && <OccupancyView from={from} to={to} />}
      {tab === "gaps" && <GapsView from={from} to={to} />}
      {tab === "repeat-guests" && <RepeatGuestsView />}
      {tab === "site-performance" && <SitePerformanceView from={from} to={to} />}
    </div>
  );
}

function TabBtn({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ElementType;
  label: string;
}) {
  return (
    <button
      onClick={onClick}
      className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
        active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/50"
      }`}
    >
      <Icon className="h-3.5 w-3.5" />
      {label}
    </button>
  );
}

function OverviewView({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "overview", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=overview&from=${from}&to=${to}`)).json(),
  });
  const s = data?.stats;

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
      <StatCard icon={CalendarDays} label="Prenotazioni totali" value={s?.totalBookings ?? "—"} loading={isLoading} />
      <StatCard icon={Users} label="Ospiti totali" value={s?.totalGuests ?? "—"} loading={isLoading} />
      <StatCard icon={CalendarDays} label="Notti vendute" value={s?.totalNights ?? "—"} loading={isLoading} />
      <StatCard icon={Users} label="Guest-nights" value={s?.totalGuestNights ?? "—"} loading={isLoading} />
      <StatCard icon={CalendarDays} label="Notti/booking" value={s ? `${s.avgNightsPerBooking}` : "—"} loading={isLoading} />
      <StatCard icon={Users} label="Ospiti/booking" value={s ? `${s.avgGuestsPerBooking}` : "—"} loading={isLoading} />
      <StatCard icon={Percent} label="% Occupato" value={s ? `${s.occupancyPct}%` : "—"} loading={isLoading} />
      <StatCard icon={Euro} label="Revenue totale" value={s ? formatEuro(s.totalRevenue) : "—"} loading={isLoading} />
      <StatCard icon={Euro} label="ADR (Average Daily Rate)" value={s ? formatEuro(s.adr) : "—"} loading={isLoading} hint="Revenue / notti vendute" />
      <StatCard icon={Euro} label="RevPAR" value={s ? formatEuro(s.revPar) : "—"} loading={isLoading} hint="Revenue / notti disponibili" />
    </div>
  );
}

function DaysInAdvanceView({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "dia", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=days-in-advance&from=${from}&to=${to}`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "bucket", label: "Anticipo" },
    { key: "bookings", label: "Prenotazioni", align: "center", numeric: true },
    { key: "percentage", label: "Distribuzione", align: "center", numeric: true, render: (r) => `${r.percentage}%` },
    { key: "revenue", label: "Revenue", align: "right", numeric: true, render: (r) => formatEuro(r.revenue) },
  ];
  return (
    <ReportTable
      title="Days in Advance"
      subtitle="Quanti giorni prima del check-in prenotano gli ospiti"
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("days-in-advance.csv", rows)}
    />
  );
}

function OccupancyView({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "occupancy", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=occupancy&from=${from}&to=${to}`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "propertyName", label: "Proprieta'" },
    { key: "nightsAvailable", label: "Notti disp.", align: "center", numeric: true },
    { key: "nightsBooked", label: "Notti prenot.", align: "center", numeric: true },
    { key: "occupancyPct", label: "% Occupato", align: "center", numeric: true, render: (r) => `${r.occupancyPct}%` },
    { key: "guestsHosted", label: "Ospiti", align: "center", numeric: true },
    { key: "guestNights", label: "Guest-nights", align: "center", numeric: true },
  ];
  return (
    <ReportTable
      title="Occupancy per proprieta'"
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("occupancy.csv", rows)}
    />
  );
}

function GapsView({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "gaps", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=gaps&from=${from}&to=${to}`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "propertyName", label: "Proprieta'" },
    { key: "gapStart", label: "Dal" },
    { key: "gapEnd", label: "Al" },
    { key: "gapDays", label: "Giorni vuoti", align: "center", numeric: true },
    { key: "potentialRevenue", label: "Revenue perso", align: "right", numeric: true, render: (r) => formatEuro(r.potentialRevenue) },
  ];
  return (
    <ReportTable
      title="Availability Gaps"
      subtitle="Notti vuote tra prenotazioni consecutive — opportunita' di last minute"
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("gaps.csv", rows)}
    />
  );
}

function RepeatGuestsView() {
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "repeat"],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=repeat-guests`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "guestName", label: "Ospite" },
    { key: "email", label: "Email" },
    { key: "bookings", label: "Soggiorni", align: "center", numeric: true },
    { key: "firstStay", label: "Primo" },
    { key: "lastStay", label: "Ultimo" },
    { key: "avgRate", label: "Tariffa media", align: "right", numeric: true, render: (r) => formatEuro(r.avgRate) },
    { key: "totalSpent", label: "Totale", align: "right", numeric: true, render: (r) => formatEuro(r.totalSpent) },
  ];
  return (
    <ReportTable
      title="Repeat Guests"
      subtitle="Ospiti con 2 o piu' soggiorni — sono i tuoi clienti piu' preziosi"
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("repeat-guests.csv", rows)}
    />
  );
}

function SitePerformanceView({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "site-perf", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=site-performance&from=${from}&to=${to}`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "source", label: "Canale" },
    { key: "bookings", label: "Prenotazioni", align: "center", numeric: true },
    { key: "nights", label: "Notti", align: "center", numeric: true },
    { key: "guests", label: "Ospiti", align: "center", numeric: true },
    { key: "avgStay", label: "Soggiorno medio", align: "center", numeric: true, render: (r) => `${r.avgStay} notti` },
    { key: "avgRate", label: "ADR", align: "right", numeric: true, render: (r) => formatEuro(r.avgRate) },
    { key: "conversionValue", label: "Valore/booking", align: "right", numeric: true, render: (r) => formatEuro(r.conversionValue) },
    { key: "revenue", label: "Revenue", align: "right", numeric: true, render: (r) => formatEuro(r.revenue) },
  ];
  return (
    <ReportTable
      title="Listing Site Performance"
      subtitle="Performance per canale"
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("site-performance.csv", rows)}
    />
  );
}
