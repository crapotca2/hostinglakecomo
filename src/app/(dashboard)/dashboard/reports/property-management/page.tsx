"use client";

import { useState } from "react";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowLeft, Percent, FileText, Wallet, Layers, Receipt } from "lucide-react";
import { ReportTable, type ReportColumn } from "@/components/reports/report-table";
import { ReportFilters, presetToDateRange } from "@/components/reports/report-filters";
import { StatCard } from "@/components/reports/stat-card";
import { downloadCSV } from "@/components/reports/csv-export";

type Tab = "commission-summary" | "commission-detail" | "owner-summary" | "owner-detail" | "booking-remittance";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export default function PropertyManagementPage() {
  const [tab, setTab] = useState<Tab>("commission-summary");
  const [preset, setPreset] = useState("ytd");
  const [{ from, to }, setRange] = useState(() => presetToDateRange("ytd"));

  function handlePreset(p: string) { setPreset(p); setRange(presetToDateRange(p)); }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Link href="/dashboard/reports" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> Tutti i report
      </Link>
      <div>
        <h1 className="text-2xl font-light"><span className="font-semibold">Property Management</span></h1>
        <p className="text-sm text-muted-foreground mt-1">Commissioni, owner remittance, statement dettagliati</p>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-border/50 w-fit flex-wrap">
        <TabBtn active={tab === "commission-summary"} onClick={() => setTab("commission-summary")} icon={Percent} label="Commission Summary" />
        <TabBtn active={tab === "commission-detail"} onClick={() => setTab("commission-detail")} icon={Receipt} label="Commission Detail" />
        <TabBtn active={tab === "owner-summary"} onClick={() => setTab("owner-summary")} icon={Wallet} label="Owner Remittance" />
        <TabBtn active={tab === "owner-detail"} onClick={() => setTab("owner-detail")} icon={Layers} label="Owner Detail" />
        <TabBtn active={tab === "booking-remittance"} onClick={() => setTab("booking-remittance")} icon={FileText} label="Booking Remittance" />
      </div>

      <ReportFilters from={from} to={to} onFromChange={(v) => setRange((r) => ({ ...r, from: v }))} onToChange={(v) => setRange((r) => ({ ...r, to: v }))} preset={preset} onPresetChange={handlePreset} />

      {tab === "commission-summary" && <CommissionSummaryView from={from} to={to} />}
      {tab === "commission-detail" && <CommissionDetailView from={from} to={to} />}
      {tab === "owner-summary" && <OwnerSummaryView />}
      {tab === "owner-detail" && <OwnerDetailView from={from} to={to} />}
      {tab === "booking-remittance" && <BookingRemittanceView from={from} to={to} />}
    </div>
  );
}

function TabBtn({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: React.ElementType; label: string }) {
  return (
    <button onClick={onClick} className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${active ? "bg-primary text-white" : "text-muted-foreground hover:bg-muted/50"}`}>
      <Icon className="h-3.5 w-3.5" />{label}
    </button>
  );
}

function useReport(type: string, params: Record<string, string>) {
  const qs = new URLSearchParams({ type, ...params }).toString();
  return useQuery({
    queryKey: ["reports", "pm", type, params],
    queryFn: async () => (await fetch(`/api/reports/property-management?${qs}`)).json(),
  });
}

function CommissionSummaryView({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useReport("commission-summary", { from, to });
  const rows = data?.rows || [];
  const totals = rows.reduce((s: { gross: number; ota: number; ab: number; payout: number }, r: { grossRevenue: number; otaCommission: number; airbibbyCommission: number; ownerPayout: number }) => ({
    gross: s.gross + r.grossRevenue,
    ota: s.ota + r.otaCommission,
    ab: s.ab + r.airbibbyCommission,
    payout: s.payout + r.ownerPayout,
  }), { gross: 0, ota: 0, ab: 0, payout: 0 });

  const columns: ReportColumn<{ source: string; bookings: number; grossRevenue: number; otaCommission: number; airbibbyCommission: number; totalCommission: number; ownerPayout: number }>[] = [
    { key: "source", label: "Canale" },
    { key: "bookings", label: "Prenotazioni", align: "center", numeric: true },
    { key: "grossRevenue", label: "Lordo", align: "right", numeric: true, render: (r) => formatEuro(r.grossRevenue) },
    { key: "otaCommission", label: "Comm. OTA", align: "right", numeric: true, render: (r) => formatEuro(r.otaCommission) },
    { key: "airbibbyCommission", label: "Comm. Hosting Lake Como", align: "right", numeric: true, render: (r) => formatEuro(r.airbibbyCommission) },
    { key: "totalCommission", label: "Totale commissioni", align: "right", numeric: true, render: (r) => formatEuro(r.totalCommission) },
    { key: "ownerPayout", label: "Netto owner", align: "right", numeric: true, render: (r) => formatEuro(r.ownerPayout) },
  ];

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label="Revenue lordo" value={formatEuro(totals.gross)} loading={isLoading} />
        <StatCard label="Commissioni OTA" value={formatEuro(totals.ota)} loading={isLoading} />
        <StatCard label="Commissione Hosting Lake Como" value={formatEuro(totals.ab)} loading={isLoading} />
        <StatCard label="Totale netto owner" value={formatEuro(totals.payout)} loading={isLoading} />
      </div>
      <ReportTable title="Commission Summary per canale" columns={columns} rows={rows} loading={isLoading} onExportCSV={() => downloadCSV("commission-summary.csv", rows)} />
    </>
  );
}

function CommissionDetailView({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useReport("commission-detail", { from, to });
  const rows = data?.rows || [];
  const columns: ReportColumn<{ bookingId: string; checkIn: string; propertyName: string; guestName: string; source: string; nights: number; grossRevenue: number; otaCommissionRate: number; otaCommission: number; airbibbyCommission: number; ownerPayout: number }>[] = [
    { key: "checkIn", label: "Check-in" },
    { key: "propertyName", label: "Proprieta'" },
    { key: "guestName", label: "Ospite" },
    { key: "source", label: "Fonte" },
    { key: "nights", label: "Notti", align: "center", numeric: true },
    { key: "grossRevenue", label: "Lordo", align: "right", numeric: true, render: (r) => formatEuro(r.grossRevenue) },
    { key: "otaCommissionRate", label: "Tasso OTA", align: "center", numeric: true, render: (r) => `${r.otaCommissionRate}%` },
    { key: "otaCommission", label: "Comm. OTA", align: "right", numeric: true, render: (r) => formatEuro(r.otaCommission) },
    { key: "airbibbyCommission", label: "Comm. AB", align: "right", numeric: true, render: (r) => formatEuro(r.airbibbyCommission) },
    { key: "ownerPayout", label: "Netto owner", align: "right", numeric: true, render: (r) => formatEuro(r.ownerPayout) },
  ];
  return <ReportTable title="Commission Detail per prenotazione" columns={columns} rows={rows} loading={isLoading} onExportCSV={() => downloadCSV("commission-detail.csv", rows)} />;
}

function OwnerSummaryView() {
  const year = new Date().getFullYear();
  const { data, isLoading } = useReport("owner-summary", { year: String(year) });
  const rows = data?.rows || [];
  const totals = rows.reduce((s: { gross: number; net: number }, r: { grossRevenue: number; netPayout: number }) => ({
    gross: s.gross + r.grossRevenue,
    net: s.net + r.netPayout,
  }), { gross: 0, net: 0 });

  const columns: ReportColumn<{ period: string; bookings: number; grossRevenue: number; otaCommissions: number; airbibbyCommission: number; operatingExpenses: number; touristTax: number; netPayout: number }>[] = [
    { key: "period", label: "Periodo" },
    { key: "bookings", label: "Bookings", align: "center", numeric: true },
    { key: "grossRevenue", label: "Lordo", align: "right", numeric: true, render: (r) => formatEuro(r.grossRevenue) },
    { key: "otaCommissions", label: "OTA", align: "right", numeric: true, render: (r) => `-${formatEuro(r.otaCommissions)}` },
    { key: "airbibbyCommission", label: "Hosting Lake Como", align: "right", numeric: true, render: (r) => `-${formatEuro(r.airbibbyCommission)}` },
    { key: "operatingExpenses", label: "Spese", align: "right", numeric: true, render: (r) => `-${formatEuro(r.operatingExpenses)}` },
    { key: "touristTax", label: "Tassa", align: "right", numeric: true, render: (r) => `-${formatEuro(r.touristTax)}` },
    { key: "netPayout", label: "Netto", align: "right", numeric: true, render: (r) => <span className="font-bold text-primary">{formatEuro(r.netPayout)}</span> },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label={`Revenue lordo ${year}`} value={formatEuro(totals.gross)} loading={isLoading} />
        <StatCard label={`Net payout ${year}`} value={formatEuro(totals.net)} loading={isLoading} />
      </div>
      <ReportTable title={`Owner Remittance Summary ${year}`} subtitle="Breakdown mensile del payout owner" columns={columns} rows={rows} loading={isLoading} onExportCSV={() => downloadCSV("owner-remittance-summary.csv", rows)} />
    </>
  );
}

function OwnerDetailView({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useReport("owner-detail", { from, to });
  const rows = data?.rows || [];
  const columns: ReportColumn<{ period: string; propertyName: string; bookings: number; nights: number; grossRevenue: number; otaCommissions: number; airbibbyCommission: number; expenses: number; touristTax: number; netPayout: number }>[] = [
    { key: "period", label: "Periodo" },
    { key: "propertyName", label: "Proprieta'" },
    { key: "bookings", label: "Bookings", align: "center", numeric: true },
    { key: "nights", label: "Notti", align: "center", numeric: true },
    { key: "grossRevenue", label: "Lordo", align: "right", numeric: true, render: (r) => formatEuro(r.grossRevenue) },
    { key: "otaCommissions", label: "OTA", align: "right", numeric: true, render: (r) => `-${formatEuro(r.otaCommissions)}` },
    { key: "airbibbyCommission", label: "Hosting Lake Como", align: "right", numeric: true, render: (r) => `-${formatEuro(r.airbibbyCommission)}` },
    { key: "expenses", label: "Spese", align: "right", numeric: true, render: (r) => `-${formatEuro(r.expenses)}` },
    { key: "touristTax", label: "Tassa", align: "right", numeric: true, render: (r) => `-${formatEuro(r.touristTax)}` },
    { key: "netPayout", label: "Netto", align: "right", numeric: true, render: (r) => <span className="font-bold text-primary">{formatEuro(r.netPayout)}</span> },
  ];
  return <ReportTable title="Owner Remittance Detail" subtitle="Breakdown per proprieta' per periodo" columns={columns} rows={rows} loading={isLoading} onExportCSV={() => downloadCSV("owner-remittance-detail.csv", rows)} />;
}

function BookingRemittanceView({ from, to }: { from: string; to: string }) {
  const { data, isLoading } = useReport("booking-remittance", { from, to });
  const rows = data?.rows || [];
  const columns: ReportColumn<{ checkIn: string; propertyName: string; guestName: string; source: string; nights: number; grossRevenue: number; otaCommission: number; airbibbyCommission: number; expenses: number; touristTax: number; netPayout: number }>[] = [
    { key: "checkIn", label: "Check-in" },
    { key: "propertyName", label: "Proprieta'" },
    { key: "guestName", label: "Ospite" },
    { key: "source", label: "Fonte" },
    { key: "nights", label: "Notti", align: "center", numeric: true },
    { key: "grossRevenue", label: "Lordo", align: "right", numeric: true, render: (r) => formatEuro(r.grossRevenue) },
    { key: "otaCommission", label: "OTA", align: "right", numeric: true, render: (r) => `-${formatEuro(r.otaCommission)}` },
    { key: "airbibbyCommission", label: "AB", align: "right", numeric: true, render: (r) => `-${formatEuro(r.airbibbyCommission)}` },
    { key: "expenses", label: "Spese", align: "right", numeric: true, render: (r) => `-${formatEuro(r.expenses)}` },
    { key: "touristTax", label: "Tassa", align: "right", numeric: true, render: (r) => `-${formatEuro(r.touristTax)}` },
    { key: "netPayout", label: "Netto", align: "right", numeric: true, render: (r) => <span className="font-bold text-primary">{formatEuro(r.netPayout)}</span> },
  ];
  return <ReportTable title="Owner Statement Bookings Remittance" subtitle="Ogni prenotazione con il payout owner calcolato" columns={columns} rows={rows} loading={isLoading} onExportCSV={() => downloadCSV("bookings-remittance.csv", rows)} />;
}
