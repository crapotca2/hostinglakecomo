"use client";

import { Link } from "@/i18n/routing";
import {
  Home,
  CalendarDays,
  TrendingUp,
  Users,
  Euro,
  ArrowRight,
} from "lucide-react";
import { useTranslations, useLocale } from "next-intl";
import { useDashboardStats } from "@/hooks/use-dashboard-stats";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  checked_in: "bg-blue-50 text-blue-700",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-600",
};

const QUICK_ACTIONS = [
  { key: "properties", href: "/dashboard/properties", icon: Home },
  { key: "bookings", href: "/dashboard/bookings", icon: CalendarDays },
  { key: "calendar", href: "/dashboard/calendar", icon: CalendarDays },
  { key: "analytics", href: "/dashboard/analytics", icon: TrendingUp },
] as const;

function formatEuro(amount: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string, locale: string): string {
  return new Date(iso).toLocaleDateString(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT", {
    day: "numeric",
    month: "short",
  });
}

export default function DashboardPage() {
  const { data, isLoading } = useDashboardStats();
  const t = useTranslations("dashboard.overview");
  const locale = useLocale();

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            {t("greeting")} <span className="font-semibold">Andrei</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>
        <div className="text-xs text-muted-foreground hidden sm:block">
          {new Date().toLocaleDateString(locale === "en" ? "en-GB" : locale === "ru" ? "ru-RU" : "it-IT", {
            weekday: "long",
            day: "numeric",
            month: "long",
            year: "numeric",
          })}
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon={Euro}
          label={t("stats.monthRevenue")}
          value={data ? formatEuro(data.monthRevenue, locale) : "—"}
          loading={isLoading}
        />
        <StatCard
          icon={CalendarDays}
          label={t("stats.activeBookings")}
          value={data ? String(data.activeBookings) : "—"}
          loading={isLoading}
        />
        <StatCard
          icon={TrendingUp}
          label={t("stats.occupancyRate")}
          value={data ? `${data.occupancyRate}%` : "—"}
          loading={isLoading}
        />
        <StatCard
          icon={Home}
          label={t("stats.propertyCount")}
          value={data ? String(data.propertyCount) : "—"}
          loading={isLoading}
        />
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {QUICK_ACTIONS.map((action) => (
          <Link
            key={action.key}
            href={action.href}
            className="flex items-center gap-3 px-4 py-3 rounded-xl border border-border/50 bg-white hover:bg-muted/30 transition-colors group"
          >
            <action.icon className="h-4 w-4 text-primary" />
            <span className="text-sm font-medium flex-1">{t(`quickActions.${action.key}`)}</span>
            <ArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:text-foreground transition-colors" />
          </Link>
        ))}
      </div>

      {/* Recent Bookings */}
      <div className="bg-white rounded-2xl border border-border/50">
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between">
          <h2 className="text-sm font-semibold">{t("recent.title")}</h2>
          <Link
            href="/dashboard/bookings"
            className="text-xs text-primary font-medium hover:underline"
          >
            {t("recent.viewAll")}
          </Link>
        </div>
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {t("recent.loading")}
          </div>
        ) : !data || data.recentBookings.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            {t("recent.empty")}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/30">
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">{t("recent.headers.guest")}</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{t("recent.headers.dates")}</th>
                  <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{t("recent.headers.nights")}</th>
                  <th className="text-left text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{t("recent.headers.source")}</th>
                  <th className="text-right text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3">{t("recent.headers.amount")}</th>
                  <th className="text-center text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-6 py-3">{t("recent.headers.status")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.recentBookings.map((b) => (
                  <tr key={b._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-3.5">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/[0.08] flex items-center justify-center shrink-0">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{b.guestInfo.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(b.checkIn, locale)} → {formatDate(b.checkOut, locale)}
                    </td>
                    <td className="px-4 py-3.5 text-sm text-center">{b.nights}</td>
                    <td className="px-4 py-3.5 text-sm text-muted-foreground">
                      {t(`source.${b.source}` as `source.${"airbnb" | "booking" | "vrbo" | "direct" | "other"}`)}
                    </td>
                    <td className="px-4 py-3.5 text-sm font-semibold text-right tabular-nums">
                      {formatEuro(b.pricing.totalAmount, locale)}
                    </td>
                    <td className="px-6 py-3.5 text-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>
                        {t(`status.${b.status}` as `status.${"confirmed" | "checked_in" | "pending" | "cancelled"}`)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  loading,
}: {
  icon: typeof Home;
  label: string;
  value: string;
  loading: boolean;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {loading ? <span className="inline-block w-16 h-6 bg-muted rounded animate-pulse" /> : value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
