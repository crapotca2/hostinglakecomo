"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, CalendarCheck, LogIn, LogOut, Home as HomeIcon, Bed } from "lucide-react";
import { ReportTable, type ReportColumn } from "@/components/reports/report-table";
import { ReportFilters, presetToDateRange } from "@/components/reports/report-filters";
import { StatCard } from "@/components/reports/stat-card";
import { downloadCSV } from "@/components/reports/csv-export";

type Tab = "daily" | "range" | "available" | "empty";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export default function StayReportsPage() {
  const [tab, setTab] = useState<Tab>("daily");
  const [preset, setPreset] = useState("30d");
  const [{ from, to }, setRange] = useState(() => presetToDateRange("30d"));

  function handlePreset(p: string) {
    setPreset(p);
    setRange(presetToDateRange(p));
  }

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "stay", tab, from, to],
    queryFn: async () => {
      const res = await fetch(`/api/reports/stay?type=${tab}&from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Link href="/dashboard/reports" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Tutti i report
      </Link>

      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Stay Reports</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">Check-in, check-out, disponibilita&apos; e unita&apos; vuote</p>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-border/50 w-fit">
        <TabButton active={tab === "daily"} onClick={() => setTab("daily")} icon={CalendarCheck} label="Daily Checklist" />
        <TabButton active={tab === "range"} onClick={() => setTab("range")} icon={Bed} label="Date Range" />
        <TabButton active={tab === "available"} onClick={() => setTab("available")} icon={HomeIcon} label="Available Nights" />
        <TabButton active={tab === "empty"} onClick={() => setTab("empty")} icon={LogOut} label="Empty Units" />
      </div>

      <ReportFilters
        from={from}
        to={to}
        onFromChange={(v) => setRange((r) => ({ ...r, from: v }))}
        onToChange={(v) => setRange((r) => ({ ...r, to: v }))}
        preset={preset}
        onPresetChange={handlePreset}
      />

      {tab === "daily" && <DailyView data={data?.items || []} loading={isLoading} />}
      {tab === "range" && <RangeView data={data?.rows || []} loading={isLoading} />}
      {tab === "available" && <AvailableView data={data?.rows || []} loading={isLoading} />}
      {tab === "empty" && <EmptyView data={data?.rows || []} loading={isLoading} />}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof CalendarCheck; label: string }) {
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

function DailyView({ data, loading }: { data: any[]; loading: boolean }) {
  const checkins = data.filter((d) => d.type === "checkin").length;
  const checkouts = data.filter((d) => d.type === "checkout").length;
  const inhouse = data.filter((d) => d.type === "inhouse").length;

  const columns: ReportColumn<any>[] = [
    { key: "type", label: "Tipo", render: (r) => <TypeBadge type={r.type} /> },
    { key: "propertyName", label: "Proprieta'" },
    { key: "guestName", label: "Ospite" },
    { key: "guests", label: "Ospiti", align: "center", numeric: true },
    { key: "nights", label: "Notti", align: "center", numeric: true },
    { key: "source", label: "Fonte" },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={LogIn} label="Check-in oggi" value={checkins} loading={loading} />
        <StatCard icon={LogOut} label="Check-out oggi" value={checkouts} loading={loading} />
        <StatCard icon={HomeIcon} label="Ospiti in casa" value={inhouse} loading={loading} />
      </div>
      <ReportTable
        title="Attivita' del giorno"
        columns={columns}
        rows={data}
        loading={loading}
        onExportCSV={() => downloadCSV("daily-checklist.csv", data)}
      />
    </>
  );
}

function RangeView({ data, loading }: { data: any[]; loading: boolean }) {
  const totalRevenue = data.reduce((s, r) => s + r.amount, 0);
  const totalNights = data.reduce((s, r) => s + r.nights, 0);

  const columns: ReportColumn<any>[] = [
    { key: "date", label: "Check-in", render: (r) => new Date(r.date).toLocaleDateString("it-IT") },
    { key: "propertyName", label: "Proprieta'" },
    { key: "guestName", label: "Ospite" },
    { key: "source", label: "Fonte" },
    { key: "nights", label: "Notti", align: "center", numeric: true },
    { key: "status", label: "Stato" },
    { key: "amount", label: "Importo", align: "right", numeric: true, render: (r) => formatEuro(r.amount) },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Prenotazioni" value={data.length} loading={loading} />
        <StatCard label="Totale notti" value={totalNights} loading={loading} />
        <StatCard label="Revenue" value={formatEuro(totalRevenue)} loading={loading} />
      </div>
      <ReportTable
        title="Prenotazioni nel range"
        columns={columns}
        rows={data}
        loading={loading}
        onExportCSV={() => downloadCSV("date-range.csv", data)}
      />
    </>
  );
}

function AvailableView({ data, loading }: { data: any[]; loading: boolean }) {
  const totalAvailable = data.reduce((s, r) => s + r.availableNights, 0);
  const avgOccupancy = data.length > 0 ? Math.round(data.reduce((s, r) => s + r.occupancyPct, 0) / data.length) : 0;

  const columns: ReportColumn<any>[] = [
    { key: "propertyName", label: "Proprieta'" },
    { key: "totalNights", label: "Totale", align: "center", numeric: true },
    { key: "bookedNights", label: "Prenotate", align: "center", numeric: true },
    { key: "availableNights", label: "Disponibili", align: "center", numeric: true },
    { key: "occupancyPct", label: "Occupazione", align: "right", numeric: true, render: (r) => `${r.occupancyPct}%` },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label="Proprieta' attive" value={data.length} loading={loading} />
        <StatCard label="Notti disponibili totali" value={totalAvailable} loading={loading} />
        <StatCard label="Occupazione media" value={`${avgOccupancy}%`} loading={loading} />
      </div>
      <ReportTable
        title="Available nights"
        columns={columns}
        rows={data}
        loading={loading}
        onExportCSV={() => downloadCSV("available-nights.csv", data)}
      />
    </>
  );
}

function EmptyView({ data, loading }: { data: any[]; loading: boolean }) {
  const columns: ReportColumn<any>[] = [
    { key: "propertyName", label: "Proprieta'" },
    { key: "type", label: "Tipo" },
    { key: "zone", label: "Zona" },
    { key: "basePrice", label: "Tariffa base", align: "right", numeric: true, render: (r) => formatEuro(r.basePrice) },
    { key: "daysEmpty", label: "Giorni vuota", align: "center", numeric: true, render: (r) => <span className={r.daysEmpty > 30 ? "text-red-600 font-semibold" : ""}>{r.daysEmpty}</span> },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label="Unita' vuote" value={data.length} loading={loading} />
        <StatCard label="Revenue potenziale perso/giorno" value={formatEuro(data.reduce((s, r) => s + r.basePrice, 0))} loading={loading} hint="Se tutte occupate al prezzo base" />
      </div>
      <ReportTable
        title="Unita' attualmente vuote"
        columns={columns}
        rows={data}
        loading={loading}
        emptyMessage="Tutte le unita' sono occupate"
        onExportCSV={() => downloadCSV("empty-units.csv", data)}
      />
    </>
  );
}

function TypeBadge({ type }: { type: string }) {
  const meta: Record<string, { label: string; cls: string }> = {
    checkin: { label: "Check-in", cls: "bg-emerald-50 text-emerald-700" },
    checkout: { label: "Check-out", cls: "bg-amber-50 text-amber-700" },
    inhouse: { label: "In casa", cls: "bg-blue-50 text-blue-700" },
  };
  const m = meta[type] || { label: type, cls: "bg-muted text-muted-foreground" };
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${m.cls}`}>{m.label}</span>;
}
