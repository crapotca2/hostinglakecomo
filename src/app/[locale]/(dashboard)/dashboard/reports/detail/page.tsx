"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, CalendarDays, Car, Receipt, Percent } from "lucide-react";
import { ReportTable, type ReportColumn } from "@/components/reports/report-table";
import { ReportFilters, presetToDateRange } from "@/components/reports/report-filters";
import { downloadCSV } from "@/components/reports/csv-export";

type Tab = "bookings" | "parking" | "taxes" | "listing-fees";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

function formatEuro2(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(amount);
}

export default function DetailReportsPage() {
  const t = useTranslations("dashboard.reports.detail");
  const tCommon = useTranslations("dashboard.reports.common");
  const [tab, setTab] = useState<Tab>("bookings");
  const [preset, setPreset] = useState("ytd");
  const [{ from, to }, setRange] = useState(() => presetToDateRange("ytd"));

  function handlePreset(p: string) {
    setPreset(p);
    setRange(presetToDateRange(p));
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <Link href="/dashboard/reports" className="text-xs text-muted-foreground hover:text-foreground inline-flex items-center gap-1">
        <ArrowLeft className="h-3 w-3" /> {tCommon("backToReports")}
      </Link>
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">{t("titleStrong")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-border/50 w-fit flex-wrap">
        <TabBtn active={tab === "bookings"} onClick={() => setTab("bookings")} icon={CalendarDays} label={t("tabs.bookings")} />
        <TabBtn active={tab === "parking"} onClick={() => setTab("parking")} icon={Car} label={t("tabs.parking")} />
        <TabBtn active={tab === "taxes"} onClick={() => setTab("taxes")} icon={Receipt} label={t("tabs.taxes")} />
        <TabBtn active={tab === "listing-fees"} onClick={() => setTab("listing-fees")} icon={Percent} label={t("tabs.listingFees")} />
      </div>

      <ReportFilters
        from={from}
        to={to}
        onFromChange={(v) => setRange((r) => ({ ...r, from: v }))}
        onToChange={(v) => setRange((r) => ({ ...r, to: v }))}
        preset={preset}
        onPresetChange={handlePreset}
      />

      {tab === "bookings" && <BookingsDetailView from={from} to={to} />}
      {tab === "parking" && <ParkingView from={from} to={to} />}
      {tab === "taxes" && <TaxesDetailView from={from} to={to} />}
      {tab === "listing-fees" && <ListingFeesView from={from} to={to} />}
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

function useReport(type: string, from: string, to: string) {
  return useQuery({
    queryKey: ["reports", "detail", type, from, to],
    queryFn: async () => {
      const res = await fetch(`/api/reports/detail?type=${type}&from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
}

function BookingsDetailView({ from, to }: { from: string; to: string }) {
  const t = useTranslations("dashboard.reports.detail.bookings");
  const { data, isLoading } = useReport("bookings", from, to);
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "checkIn", label: t("columns.checkIn") },
    { key: "checkOut", label: t("columns.checkOut") },
    { key: "propertyName", label: t("columns.property") },
    { key: "guestName", label: t("columns.guest") },
    { key: "guestEmail", label: t("columns.email") },
    { key: "guests", label: t("columns.guests"), align: "center", numeric: true },
    { key: "nights", label: t("columns.nights"), align: "center", numeric: true },
    { key: "source", label: t("columns.source") },
    { key: "status", label: t("columns.status") },
    { key: "totalAmount", label: t("columns.total"), align: "right", numeric: true, render: (r) => formatEuro(r.totalAmount) },
    { key: "commission", label: t("columns.commission"), align: "right", numeric: true, render: (r) => formatEuro(r.commission) },
    { key: "ownerPayout", label: t("columns.ownerNet"), align: "right", numeric: true, render: (r) => formatEuro(r.ownerPayout) },
  ];
  return (
    <ReportTable
      title={t("tableTitle", { count: rows.length })}
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("bookings-detail.csv", rows)}
    />
  );
}

interface ParkingRow {
  bookingId: string;
  checkIn: string;
  checkOut: string;
  guestName: string;
  nights: number;
  parking: number;
  ownerShare: number;
  hostShare: number;
}

function ParkingView({ from, to }: { from: string; to: string }) {
  const t = useTranslations("dashboard.reports.detail.parking");
  const { data, isLoading } = useReport("parking", from, to);
  const rows: ParkingRow[] = data?.rows || [];
  const totals = rows.reduce(
    (acc, r) => ({
      parking: acc.parking + r.parking,
      ownerShare: acc.ownerShare + r.ownerShare,
      hostShare: acc.hostShare + r.hostShare,
    }),
    { parking: 0, ownerShare: 0, hostShare: 0 }
  );
  const columns: ReportColumn<ParkingRow>[] = [
    { key: "checkIn", label: t("columns.checkIn") },
    { key: "checkOut", label: t("columns.checkOut") },
    { key: "guestName", label: t("columns.guest") },
    { key: "nights", label: t("columns.nights"), align: "center", numeric: true },
    { key: "parking", label: t("columns.parking"), align: "right", numeric: true, render: (r) => formatEuro2(r.parking) },
    { key: "ownerShare", label: t("columns.ownerShare"), align: "right", numeric: true, render: (r) => formatEuro2(r.ownerShare) },
    { key: "hostShare", label: t("columns.hostShare"), align: "right", numeric: true, render: (r) => formatEuro2(r.hostShare) },
  ];
  return (
    <div className="space-y-4">
      <ReportTable
        title={t("tableTitle", { count: rows.length })}
        subtitle={t("subtitle")}
        columns={columns}
        rows={rows}
        loading={isLoading}
        onExportCSV={() => downloadCSV("parking-detail.csv", rows as unknown as Record<string, unknown>[])}
        emptyMessage={t("empty")}
      />
      {rows.length > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <TotalCard label={`${t("totalLabel")} · ${t("columns.parking")}`} value={formatEuro2(totals.parking)} />
          <TotalCard label={t("columns.ownerShare")} value={formatEuro2(totals.ownerShare)} highlight />
          <TotalCard label={t("columns.hostShare")} value={formatEuro2(totals.hostShare)} />
        </div>
      )}
    </div>
  );
}

function TotalCard({ label, value, highlight }: { label: string; value: string; highlight?: boolean }) {
  return (
    <div className={`rounded-xl border p-4 ${highlight ? "border-primary/40 bg-primary/[0.04]" : "border-border/50 bg-white"}`}>
      <div className="text-xs text-muted-foreground">{label}</div>
      <div className={`text-lg font-semibold tabular-nums mt-1 ${highlight ? "text-primary" : ""}`}>{value}</div>
    </div>
  );
}

function TaxesDetailView({ from, to }: { from: string; to: string }) {
  const t = useTranslations("dashboard.reports.detail.taxes");
  const { data, isLoading } = useReport("taxes", from, to);
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "checkIn", label: t("columns.checkIn") },
    { key: "propertyName", label: t("columns.property") },
    { key: "guests", label: t("columns.guests"), align: "center", numeric: true },
    { key: "nights", label: t("columns.nights"), align: "center", numeric: true },
    { key: "revenue", label: t("columns.revenue"), align: "right", numeric: true, render: (r) => formatEuro(r.revenue) },
    { key: "touristTax", label: t("columns.tourist"), align: "right", numeric: true, render: (r) => formatEuro(r.touristTax) },
    { key: "cedolareSecca", label: t("columns.cedolare"), align: "right", numeric: true, render: (r) => formatEuro(r.cedolareSecca) },
  ];
  return (
    <ReportTable
      title={t("tableTitle")}
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("taxes-detail.csv", rows)}
    />
  );
}

function ListingFeesView({ from, to }: { from: string; to: string }) {
  const t = useTranslations("dashboard.reports.detail.listingFees");
  const { data, isLoading } = useReport("listing-fees", from, to);
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "source", label: t("columns.channel") },
    { key: "bookings", label: t("columns.bookings"), align: "center", numeric: true },
    { key: "commissionRate", label: t("columns.rate"), align: "center", numeric: true, render: (r) => `${r.commissionRate}%` },
    { key: "grossRevenue", label: t("columns.gross"), align: "right", numeric: true, render: (r) => formatEuro(r.grossRevenue) },
    { key: "totalFees", label: t("columns.fees"), align: "right", numeric: true, render: (r) => formatEuro(r.totalFees) },
    { key: "netRevenue", label: t("columns.net"), align: "right", numeric: true, render: (r) => formatEuro(r.netRevenue) },
  ];
  return (
    <ReportTable
      title={t("tableTitle")}
      subtitle={t("subtitle")}
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("listing-fees.csv", rows)}
    />
  );
}
