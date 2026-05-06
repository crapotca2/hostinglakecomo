"use client";

import { useState } from "react";
import { Link } from "@/i18n/routing";
import { useQuery } from "@tanstack/react-query";
import { useLocale, useTranslations } from "next-intl";
import { ArrowLeft, CalendarDays, Users, CreditCard, Receipt, Percent } from "lucide-react";
import { ReportTable, type ReportColumn } from "@/components/reports/report-table";
import { ReportFilters, presetToDateRange } from "@/components/reports/report-filters";
import { downloadCSV } from "@/components/reports/csv-export";

type Tab = "bookings" | "guests" | "transactions" | "taxes" | "listing-fees";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR", maximumFractionDigits: 0 }).format(amount);
}

function localeTag(locale: string): string {
  return locale === "en" ? "en-GB" : "it-IT";
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
        <TabBtn active={tab === "guests"} onClick={() => setTab("guests")} icon={Users} label={t("tabs.guests")} />
        <TabBtn active={tab === "transactions"} onClick={() => setTab("transactions")} icon={CreditCard} label={t("tabs.transactions")} />
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
      {tab === "guests" && <GuestsView />}
      {tab === "transactions" && <TransactionsView from={from} to={to} />}
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

function GuestsView() {
  const t = useTranslations("dashboard.reports.detail.guests");
  const crosscheck = useQuery({
    queryKey: ["detail", "ncc"],
    queryFn: async () => (await fetch(`/api/reports/detail?type=name-crosscheck`)).json(),
  });
  const emails = useQuery({
    queryKey: ["detail", "emails"],
    queryFn: async () => (await fetch(`/api/reports/detail?type=emails`)).json(),
  });
  const nccRows = crosscheck.data?.rows || [];
  const emailRows = emails.data?.rows || [];

  const nccCols: ReportColumn<(typeof nccRows)[0]>[] = [
    { key: "guestName", label: t("columns.name") },
    { key: "bookingCount", label: t("columns.bookings"), align: "center", numeric: true },
    { key: "emails", label: t("columns.emails"), render: (r) => r.emails.join(", ") },
    { key: "phones", label: t("columns.phones"), render: (r) => r.phones.join(", ") },
    { key: "totalSpent", label: t("columns.totalSpent"), align: "right", numeric: true, render: (r) => formatEuro(r.totalSpent) },
  ];
  const emailCols: ReportColumn<(typeof emailRows)[0]>[] = [
    { key: "email", label: t("columns.email") },
    { key: "guestName", label: t("columns.name") },
    { key: "country", label: t("columns.country"), align: "center" },
    { key: "lastBooking", label: t("columns.lastBooking") },
    { key: "totalBookings", label: t("columns.totalBookings"), align: "center", numeric: true },
    { key: "totalSpent", label: t("columns.total"), align: "right", numeric: true, render: (r) => formatEuro(r.totalSpent) },
  ];

  return (
    <div className="space-y-4">
      <ReportTable
        title={t("crosscheckTitle")}
        subtitle={t("crosscheckSubtitle")}
        columns={nccCols}
        rows={nccRows}
        loading={crosscheck.isLoading}
        onExportCSV={() =>
          downloadCSV(
            "name-crosscheck.csv",
            nccRows.map((r: { emails: string[]; phones: string[]; properties: string[] } & Record<string, unknown>) => ({
              ...r,
              emails: r.emails.join(";"),
              phones: r.phones.join(";"),
              properties: r.properties.join(";"),
            }))
          )
        }
        emptyMessage={t("crosscheckEmpty")}
      />
      <ReportTable
        title={t("emailListTitle")}
        subtitle={t("emailListSubtitle", { count: emailRows.length })}
        columns={emailCols}
        rows={emailRows}
        loading={emails.isLoading}
        onExportCSV={() => downloadCSV("email-list.csv", emailRows)}
      />
    </div>
  );
}

function TransactionsView({ from, to }: { from: string; to: string }) {
  const t = useTranslations("dashboard.reports.detail.transactions");
  const locale = useLocale();
  const tag = localeTag(locale);
  const payments = useReport("payments", from, to);
  const cc = useReport("cc-history", from, to);
  const paymentRows = payments.data?.rows || [];
  const ccRows = cc.data?.rows || [];

  const pCols: ReportColumn<(typeof paymentRows)[0]>[] = [
    {
      key: "createdAt",
      label: t("columns.date"),
      render: (r) => new Date(r.createdAt).toLocaleString(tag, { dateStyle: "short", timeStyle: "short" }),
    },
    { key: "type", label: t("columns.type") },
    { key: "status", label: t("columns.status") },
    { key: "stripePaymentIntentId", label: t("columns.paymentId") },
    { key: "amount", label: t("columns.amount"), align: "right", numeric: true, render: (r) => formatEuro(r.amount) },
  ];
  const ccCols: ReportColumn<(typeof ccRows)[0]>[] = [
    {
      key: "createdAt",
      label: t("columns.date"),
      render: (r) => new Date(r.createdAt).toLocaleString(tag, { dateStyle: "short", timeStyle: "short" }),
    },
    { key: "stripeIntent", label: t("columns.stripeIntent") },
    { key: "type", label: t("columns.type") },
    { key: "status", label: t("columns.status") },
    { key: "amount", label: t("columns.amount"), align: "right", numeric: true, render: (r) => formatEuro(r.amount) },
  ];

  return (
    <div className="space-y-4">
      <ReportTable
        title={t("paymentsTitle")}
        columns={pCols}
        rows={paymentRows}
        loading={payments.isLoading}
        onExportCSV={() => downloadCSV("payments-detail.csv", paymentRows)}
      />
      <ReportTable
        title={t("ccTitle")}
        subtitle={t("ccSubtitle")}
        columns={ccCols}
        rows={ccRows}
        loading={cc.isLoading}
        onExportCSV={() => downloadCSV("cc-history.csv", ccRows)}
      />
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
