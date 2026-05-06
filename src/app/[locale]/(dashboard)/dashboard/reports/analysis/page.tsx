"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useQuery } from "@tanstack/react-query";
import { useTranslations } from "next-intl";
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
  const t = useTranslations("dashboard.reports.analysis");
  const tCommon = useTranslations("dashboard.reports.common");
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
        <ArrowLeft className="h-3 w-3" /> {tCommon("backToReports")}
      </Link>
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">{t("titleStrong")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-border/50 w-fit flex-wrap">
        <TabBtn active={tab === "overview"} onClick={() => setTab("overview")} icon={BarChart3} label={t("tabs.overview")} />
        <TabBtn active={tab === "days-in-advance"} onClick={() => setTab("days-in-advance")} icon={Clock} label={t("tabs.daysInAdvance")} />
        <TabBtn active={tab === "occupancy"} onClick={() => setTab("occupancy")} icon={TrendingUp} label={t("tabs.occupancy")} />
        <TabBtn active={tab === "gaps"} onClick={() => setTab("gaps")} icon={Layers} label={t("tabs.gaps")} />
        <TabBtn active={tab === "repeat-guests"} onClick={() => setTab("repeat-guests")} icon={Repeat} label={t("tabs.repeatGuests")} />
        <TabBtn active={tab === "site-performance"} onClick={() => setTab("site-performance")} icon={Globe} label={t("tabs.sitePerformance")} />
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
  const t = useTranslations("dashboard.reports.analysis.overview");
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "overview", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=overview&from=${from}&to=${to}`)).json(),
  });
  const s = data?.stats;

  return (
    <div className="grid md:grid-cols-3 lg:grid-cols-4 gap-4">
      <StatCard icon={CalendarDays} label={t("totalBookings")} value={s?.totalBookings ?? "—"} loading={isLoading} />
      <StatCard icon={Users} label={t("totalGuests")} value={s?.totalGuests ?? "—"} loading={isLoading} />
      <StatCard icon={CalendarDays} label={t("totalNights")} value={s?.totalNights ?? "—"} loading={isLoading} />
      <StatCard icon={Users} label={t("guestNights")} value={s?.totalGuestNights ?? "—"} loading={isLoading} />
      <StatCard icon={CalendarDays} label={t("nightsPerBooking")} value={s ? `${s.avgNightsPerBooking}` : "—"} loading={isLoading} />
      <StatCard icon={Users} label={t("guestsPerBooking")} value={s ? `${s.avgGuestsPerBooking}` : "—"} loading={isLoading} />
      <StatCard icon={Percent} label={t("occupancyPct")} value={s ? `${s.occupancyPct}%` : "—"} loading={isLoading} />
      <StatCard icon={Euro} label={t("totalRevenue")} value={s ? formatEuro(s.totalRevenue) : "—"} loading={isLoading} />
      <StatCard icon={Euro} label={t("adr")} value={s ? formatEuro(s.adr) : "—"} loading={isLoading} hint={t("adrHint")} />
      <StatCard icon={Euro} label={t("revPar")} value={s ? formatEuro(s.revPar) : "—"} loading={isLoading} hint={t("revParHint")} />
    </div>
  );
}

function DaysInAdvanceView({ from, to }: { from: string; to: string }) {
  const t = useTranslations("dashboard.reports.analysis.daysInAdvance");
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "dia", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=days-in-advance&from=${from}&to=${to}`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "bucket", label: t("columns.bucket") },
    { key: "bookings", label: t("columns.bookings"), align: "center", numeric: true },
    { key: "percentage", label: t("columns.distribution"), align: "center", numeric: true, render: (r) => `${r.percentage}%` },
    { key: "revenue", label: t("columns.revenue"), align: "right", numeric: true, render: (r) => formatEuro(r.revenue) },
  ];
  return (
    <ReportTable
      title={t("tableTitle")}
      subtitle={t("subtitle")}
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("days-in-advance.csv", rows)}
    />
  );
}

function OccupancyView({ from, to }: { from: string; to: string }) {
  const t = useTranslations("dashboard.reports.analysis.occupancy");
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "occupancy", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=occupancy&from=${from}&to=${to}`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "propertyName", label: t("columns.property") },
    { key: "nightsAvailable", label: t("columns.available"), align: "center", numeric: true },
    { key: "nightsBooked", label: t("columns.booked"), align: "center", numeric: true },
    { key: "occupancyPct", label: t("columns.occupancyPct"), align: "center", numeric: true, render: (r) => `${r.occupancyPct}%` },
    { key: "guestsHosted", label: t("columns.guests"), align: "center", numeric: true },
    { key: "guestNights", label: t("columns.guestNights"), align: "center", numeric: true },
  ];
  return (
    <ReportTable
      title={t("tableTitle")}
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("occupancy.csv", rows)}
    />
  );
}

function GapsView({ from, to }: { from: string; to: string }) {
  const t = useTranslations("dashboard.reports.analysis.gaps");
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "gaps", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=gaps&from=${from}&to=${to}`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "propertyName", label: t("columns.property") },
    { key: "gapStart", label: t("columns.from") },
    { key: "gapEnd", label: t("columns.to") },
    { key: "gapDays", label: t("columns.emptyDays"), align: "center", numeric: true },
    { key: "potentialRevenue", label: t("columns.lostRevenue"), align: "right", numeric: true, render: (r) => formatEuro(r.potentialRevenue) },
  ];
  return (
    <ReportTable
      title={t("tableTitle")}
      subtitle={t("subtitle")}
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("gaps.csv", rows)}
    />
  );
}

function RepeatGuestsView() {
  const t = useTranslations("dashboard.reports.analysis.repeatGuests");
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "repeat"],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=repeat-guests`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "guestName", label: t("columns.guest") },
    { key: "email", label: t("columns.email") },
    { key: "bookings", label: t("columns.stays"), align: "center", numeric: true },
    { key: "firstStay", label: t("columns.first") },
    { key: "lastStay", label: t("columns.last") },
    { key: "avgRate", label: t("columns.avgRate"), align: "right", numeric: true, render: (r) => formatEuro(r.avgRate) },
    { key: "totalSpent", label: t("columns.totalSpent"), align: "right", numeric: true, render: (r) => formatEuro(r.totalSpent) },
  ];
  return (
    <ReportTable
      title={t("tableTitle")}
      subtitle={t("subtitle")}
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("repeat-guests.csv", rows)}
    />
  );
}

function SitePerformanceView({ from, to }: { from: string; to: string }) {
  const t = useTranslations("dashboard.reports.analysis.sitePerformance");
  const { data, isLoading } = useQuery({
    queryKey: ["analysis", "site-perf", from, to],
    queryFn: async () => (await fetch(`/api/reports/analysis?type=site-performance&from=${from}&to=${to}`)).json(),
  });
  const rows = data?.rows || [];
  const columns: ReportColumn<(typeof rows)[0]>[] = [
    { key: "source", label: t("columns.channel") },
    { key: "bookings", label: t("columns.bookings"), align: "center", numeric: true },
    { key: "nights", label: t("columns.nights"), align: "center", numeric: true },
    { key: "guests", label: t("columns.guests"), align: "center", numeric: true },
    { key: "avgStay", label: t("columns.avgStay"), align: "center", numeric: true, render: (r) => t("columns.avgStayValue", { n: r.avgStay }) },
    { key: "avgRate", label: t("columns.adr"), align: "right", numeric: true, render: (r) => formatEuro(r.avgRate) },
    { key: "conversionValue", label: t("columns.valuePerBooking"), align: "right", numeric: true, render: (r) => formatEuro(r.conversionValue) },
    { key: "revenue", label: t("columns.revenue"), align: "right", numeric: true, render: (r) => formatEuro(r.revenue) },
  ];
  return (
    <ReportTable
      title={t("tableTitle")}
      subtitle={t("subtitle")}
      columns={columns}
      rows={rows}
      loading={isLoading}
      onExportCSV={() => downloadCSV("site-performance.csv", rows)}
    />
  );
}
