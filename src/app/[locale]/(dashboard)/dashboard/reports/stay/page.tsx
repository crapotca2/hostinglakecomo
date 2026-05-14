"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, CalendarCheck, LogIn, LogOut, Home as HomeIcon, Bed } from "lucide-react";
import { ReportTable, type ReportColumn } from "@/components/reports/report-table";
import { ReportFilters, presetToDateRange } from "@/components/reports/report-filters";
import { StatCard } from "@/components/reports/stat-card";
import { downloadCSV } from "@/components/reports/csv-export";

type Tab = "daily" | "range" | "available" | "empty";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

function localeTag(locale: string): string {
  return locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT";
}

export default function StayReportsPage() {
  const t = useTranslations("dashboard.reports.stay");
  const tCommon = useTranslations("dashboard.reports.common");
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
        <ArrowLeft className="h-3 w-3" /> {tCommon("backToReports")}
      </Link>

      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">{t("titleStrong")}</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
      </div>

      <div className="flex items-center gap-1 bg-white rounded-xl p-1 border border-border/50 w-fit">
        <TabButton active={tab === "daily"} onClick={() => setTab("daily")} icon={CalendarCheck} label={t("tabs.daily")} />
        <TabButton active={tab === "range"} onClick={() => setTab("range")} icon={Bed} label={t("tabs.range")} />
        <TabButton active={tab === "available"} onClick={() => setTab("available")} icon={HomeIcon} label={t("tabs.available")} />
        <TabButton active={tab === "empty"} onClick={() => setTab("empty")} icon={LogOut} label={t("tabs.empty")} />
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
  const t = useTranslations("dashboard.reports.stay.daily");
  const checkins = data.filter((d) => d.type === "checkin").length;
  const checkouts = data.filter((d) => d.type === "checkout").length;
  const inhouse = data.filter((d) => d.type === "inhouse").length;

  const columns: ReportColumn<any>[] = [
    { key: "type", label: t("columns.type"), render: (r) => <TypeBadge type={r.type} /> },
    { key: "propertyName", label: t("columns.property") },
    { key: "guestName", label: t("columns.guest") },
    { key: "guests", label: t("columns.guests"), align: "center", numeric: true },
    { key: "nights", label: t("columns.nights"), align: "center", numeric: true },
    { key: "source", label: t("columns.source") },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard icon={LogIn} label={t("stats.checkinsToday")} value={checkins} loading={loading} />
        <StatCard icon={LogOut} label={t("stats.checkoutsToday")} value={checkouts} loading={loading} />
        <StatCard icon={HomeIcon} label={t("stats.guestsInHouse")} value={inhouse} loading={loading} />
      </div>
      <ReportTable
        title={t("tableTitle")}
        columns={columns}
        rows={data}
        loading={loading}
        onExportCSV={() => downloadCSV("daily-checklist.csv", data)}
      />
    </>
  );
}

function RangeView({ data, loading }: { data: any[]; loading: boolean }) {
  const t = useTranslations("dashboard.reports.stay.range");
  const locale = useLocale();
  const tag = localeTag(locale);
  const totalRevenue = data.reduce((s, r) => s + r.amount, 0);
  const totalNights = data.reduce((s, r) => s + r.nights, 0);

  const columns: ReportColumn<any>[] = [
    { key: "date", label: t("columns.checkIn"), render: (r) => new Date(r.date).toLocaleDateString(tag) },
    { key: "propertyName", label: t("columns.property") },
    { key: "guestName", label: t("columns.guest") },
    { key: "source", label: t("columns.source") },
    { key: "nights", label: t("columns.nights"), align: "center", numeric: true },
    { key: "status", label: t("columns.status") },
    { key: "amount", label: t("columns.amount"), align: "right", numeric: true, render: (r) => formatEuro(r.amount) },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t("stats.bookings")} value={data.length} loading={loading} />
        <StatCard label={t("stats.totalNights")} value={totalNights} loading={loading} />
        <StatCard label={t("stats.revenue")} value={formatEuro(totalRevenue)} loading={loading} />
      </div>
      <ReportTable
        title={t("tableTitle")}
        columns={columns}
        rows={data}
        loading={loading}
        onExportCSV={() => downloadCSV("date-range.csv", data)}
      />
    </>
  );
}

function AvailableView({ data, loading }: { data: any[]; loading: boolean }) {
  const t = useTranslations("dashboard.reports.stay.available");
  const totalAvailable = data.reduce((s, r) => s + r.availableNights, 0);
  const avgOccupancy = data.length > 0 ? Math.round(data.reduce((s, r) => s + r.occupancyPct, 0) / data.length) : 0;

  const columns: ReportColumn<any>[] = [
    { key: "propertyName", label: t("columns.property") },
    { key: "totalNights", label: t("columns.total"), align: "center", numeric: true },
    { key: "bookedNights", label: t("columns.booked"), align: "center", numeric: true },
    { key: "availableNights", label: t("columns.available"), align: "center", numeric: true },
    { key: "occupancyPct", label: t("columns.occupancy"), align: "right", numeric: true, render: (r) => `${r.occupancyPct}%` },
  ];

  return (
    <>
      <div className="grid grid-cols-3 gap-4">
        <StatCard label={t("stats.activeProperties")} value={data.length} loading={loading} />
        <StatCard label={t("stats.totalAvailable")} value={totalAvailable} loading={loading} />
        <StatCard label={t("stats.avgOccupancy")} value={`${avgOccupancy}%`} loading={loading} />
      </div>
      <ReportTable
        title={t("tableTitle")}
        columns={columns}
        rows={data}
        loading={loading}
        onExportCSV={() => downloadCSV("available-nights.csv", data)}
      />
    </>
  );
}

function EmptyView({ data, loading }: { data: any[]; loading: boolean }) {
  const t = useTranslations("dashboard.reports.stay.empty");
  const columns: ReportColumn<any>[] = [
    { key: "propertyName", label: t("columns.property") },
    { key: "type", label: t("columns.type") },
    { key: "zone", label: t("columns.zone") },
    { key: "basePrice", label: t("columns.basePrice"), align: "right", numeric: true, render: (r) => formatEuro(r.basePrice) },
    { key: "daysEmpty", label: t("columns.daysEmpty"), align: "center", numeric: true, render: (r) => <span className={r.daysEmpty > 30 ? "text-red-600 font-semibold" : ""}>{r.daysEmpty}</span> },
  ];

  return (
    <>
      <div className="grid grid-cols-2 gap-4">
        <StatCard label={t("stats.emptyUnits")} value={data.length} loading={loading} />
        <StatCard label={t("stats.lostRevenue")} value={formatEuro(data.reduce((s, r) => s + r.basePrice, 0))} loading={loading} hint={t("stats.lostRevenueHint")} />
      </div>
      <ReportTable
        title={t("tableTitle")}
        columns={columns}
        rows={data}
        loading={loading}
        emptyMessage={t("emptyMessage")}
        onExportCSV={() => downloadCSV("empty-units.csv", data)}
      />
    </>
  );
}

function TypeBadge({ type }: { type: string }) {
  const t = useTranslations("dashboard.reports.stay.daily.badges");
  const cls: Record<string, string> = {
    checkin: "bg-emerald-50 text-emerald-700",
    checkout: "bg-amber-50 text-amber-700",
    inhouse: "bg-blue-50 text-blue-700",
  };
  const isKnown = type === "checkin" || type === "checkout" || type === "inhouse";
  const label = isKnown ? t(type as "checkin" | "checkout" | "inhouse") : type;
  const c = cls[type] || "bg-muted text-muted-foreground";
  return <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${c}`}>{label}</span>;
}
