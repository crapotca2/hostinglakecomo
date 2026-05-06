"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
import { ArrowLeft, CalendarDays, CreditCard, Receipt } from "lucide-react";
import { ReportTable, type ReportColumn } from "@/components/reports/report-table";
import { ReportFilters, presetToDateRange } from "@/components/reports/report-filters";
import { StatCard } from "@/components/reports/stat-card";
import { downloadCSV } from "@/components/reports/csv-export";

type Tab = "bookings" | "payments" | "taxes";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

export default function SummaryReportsPage() {
  const t = useTranslations("dashboard.reports.summary");
  const tCommon = useTranslations("dashboard.reports.common");
  const [tab, setTab] = useState<Tab>("bookings");
  const [preset, setPreset] = useState("ytd");
  const [{ from, to }, setRange] = useState(() => presetToDateRange("ytd"));

  function handlePreset(p: string) {
    setPreset(p);
    setRange(presetToDateRange(p));
  }

  const { data, isLoading } = useQuery({
    queryKey: ["reports", "summary", tab, from, to],
    queryFn: async () => {
      const res = await fetch(`/api/reports/summary?type=${tab}&from=${from}&to=${to}`);
      if (!res.ok) throw new Error("Failed");
      return res.json();
    },
  });
  const rows = data?.rows || [];

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

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-border/50 w-fit">
        <TabButton active={tab === "bookings"} onClick={() => setTab("bookings")} icon={CalendarDays} label={t("tabs.bookings")} />
        <TabButton active={tab === "payments"} onClick={() => setTab("payments")} icon={CreditCard} label={t("tabs.payments")} />
        <TabButton active={tab === "taxes"} onClick={() => setTab("taxes")} icon={Receipt} label={t("tabs.taxes")} />
      </div>

      <ReportFilters
        from={from}
        to={to}
        onFromChange={(v) => setRange((r) => ({ ...r, from: v }))}
        onToChange={(v) => setRange((r) => ({ ...r, to: v }))}
        preset={preset}
        onPresetChange={handlePreset}
      />

      {tab === "bookings" && <BookingsView rows={rows} loading={isLoading} />}
      {tab === "payments" && <PaymentsView rows={rows} loading={isLoading} />}
      {tab === "taxes" && <TaxesView rows={rows} loading={isLoading} />}
    </div>
  );
}

function TabButton({ active, onClick, icon: Icon, label }: { active: boolean; onClick: () => void; icon: typeof CalendarDays; label: string }) {
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

function BookingsView({ rows, loading }: { rows: any[]; loading: boolean }) {
  const t = useTranslations("dashboard.reports.summary.bookings");
  const totals = rows.reduce((s, r) => ({
    bookings: s.bookings + r.bookings,
    nights: s.nights + r.nights,
    revenue: s.revenue + r.revenue,
  }), { bookings: 0, nights: 0, revenue: 0 });

  const columns: ReportColumn<any>[] = [
    { key: "period", label: t("columns.period") },
    { key: "bookings", label: t("columns.bookings"), align: "center", numeric: true },
    { key: "nights", label: t("columns.nights"), align: "center", numeric: true },
    { key: "guests", label: t("columns.guests"), align: "center", numeric: true },
    { key: "avgStay", label: t("columns.avgStay"), align: "center", numeric: true, render: (r) => t("columns.avgStayValue", { n: r.avgStay }) },
    { key: "avgRate", label: t("columns.adr"), align: "right", numeric: true, render: (r) => formatEuro(r.avgRate) },
    { key: "revenue", label: t("columns.revenue"), align: "right", numeric: true, render: (r) => formatEuro(r.revenue) },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t("stats.bookings")} value={totals.bookings} loading={loading} />
        <StatCard label={t("stats.nightsSold")} value={totals.nights} loading={loading} />
        <StatCard label={t("stats.totalRevenue")} value={formatEuro(totals.revenue)} loading={loading} />
      </div>
      <ReportTable title={t("tableTitle")} columns={columns} rows={rows} loading={loading} onExportCSV={() => downloadCSV("bookings-summary.csv", rows)} />
    </>
  );
}

function PaymentsView({ rows, loading }: { rows: any[]; loading: boolean }) {
  const t = useTranslations("dashboard.reports.summary.payments");
  const totals = rows.reduce((s, r) => ({
    count: s.count + r.count,
    succeeded: s.succeeded + r.succeeded,
    amount: s.amount + r.totalAmount,
    net: s.net + r.netAmount,
  }), { count: 0, succeeded: 0, amount: 0, net: 0 });

  const columns: ReportColumn<any>[] = [
    { key: "period", label: t("columns.period") },
    { key: "count", label: t("columns.count"), align: "center", numeric: true },
    { key: "succeeded", label: t("columns.succeeded"), align: "center", numeric: true },
    { key: "failed", label: t("columns.failed"), align: "center", numeric: true },
    { key: "refunded", label: t("columns.refunded"), align: "center", numeric: true },
    { key: "totalAmount", label: t("columns.gross"), align: "right", numeric: true, render: (r) => formatEuro(r.totalAmount) },
    { key: "netAmount", label: t("columns.net"), align: "right", numeric: true, render: (r) => formatEuro(r.netAmount) },
  ];

  return (
    <>
      <div className="grid grid-cols-4 gap-4">
        <StatCard label={t("stats.transactions")} value={totals.count} loading={loading} />
        <StatCard label={t("stats.successful")} value={totals.succeeded} loading={loading} />
        <StatCard label={t("stats.gross")} value={formatEuro(totals.amount)} loading={loading} />
        <StatCard label={t("stats.net")} value={formatEuro(totals.net)} loading={loading} hint={t("stats.netHint")} />
      </div>
      <ReportTable title={t("tableTitle")} columns={columns} rows={rows} loading={loading} onExportCSV={() => downloadCSV("payments-summary.csv", rows)} />
    </>
  );
}

function TaxesView({ rows, loading }: { rows: any[]; loading: boolean }) {
  const t = useTranslations("dashboard.reports.summary.taxes");
  const totals = rows.reduce((s, r) => ({
    tourist: s.tourist + r.touristTax,
    cedolare: s.cedolare + r.cedolareSeccaEstimate,
    revenue: s.revenue + r.grossRevenue,
  }), { tourist: 0, cedolare: 0, revenue: 0 });

  const columns: ReportColumn<any>[] = [
    { key: "propertyName", label: t("columns.property") },
    { key: "bookings", label: t("columns.bookings"), align: "center", numeric: true },
    { key: "guestNights", label: t("columns.guestNights"), align: "center", numeric: true },
    { key: "grossRevenue", label: t("columns.revenue"), align: "right", numeric: true, render: (r) => formatEuro(r.grossRevenue) },
    { key: "touristTax", label: t("columns.tourist"), align: "right", numeric: true, render: (r) => formatEuro(r.touristTax) },
    { key: "cedolareSeccaEstimate", label: t("columns.cedolare"), align: "right", numeric: true, render: (r) => formatEuro(r.cedolareSeccaEstimate) },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t("stats.tourist")} value={formatEuro(totals.tourist)} loading={loading} />
        <StatCard label={t("stats.cedolare")} value={formatEuro(totals.cedolare)} loading={loading} hint={t("stats.cedolareHint")} />
        <StatCard label={t("stats.taxableRevenue")} value={formatEuro(totals.revenue)} loading={loading} />
      </div>
      <ReportTable title={t("tableTitle")} columns={columns} rows={rows} loading={loading} onExportCSV={() => downloadCSV("taxes-summary.csv", rows)} />
    </>
  );
}
