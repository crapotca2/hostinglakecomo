"use client";

import {
  TrendingUp,
  TrendingDown,
  Calendar,
  Users,
  Euro,
  Star,
  type LucideIcon,
} from "lucide-react";
import { useTranslations } from "next-intl";

const KPI_DEFS: {
  key: "revpar" | "occupancy" | "adr" | "rating";
  value: string;
  delta: string;
  up: boolean;
  icon: LucideIcon;
}[] = [
  { key: "revpar", value: "€187", delta: "+14%", up: true, icon: Euro },
  { key: "occupancy", value: "73%", delta: "+6 pt", up: true, icon: Calendar },
  { key: "adr", value: "€242", delta: "+3%", up: true, icon: TrendingUp },
  { key: "rating", value: "4,9", delta: "+0,1", up: true, icon: Star },
];

const STAY_DEFS: {
  name: string;
  channelKey: "airbnb" | "booking" | "direct";
  nights: number;
  total: string;
}[] = [
  { name: "S. Müller", channelKey: "airbnb", nights: 4, total: "€968" },
  { name: "M. Dubois", channelKey: "booking", nights: 3, total: "€726" },
  { name: "L. Rossi", channelKey: "direct", nights: 5, total: "€1.105" },
  { name: "J. Smith", channelKey: "airbnb", nights: 2, total: "€484" },
];

const CHANNEL_BAR_DEFS: {
  key: "airbnb" | "booking" | "direct";
  value: number;
  color: string;
}[] = [
  { key: "airbnb", value: 58, color: "bg-rose-500" },
  { key: "booking", value: 27, color: "bg-blue-500" },
  { key: "direct", value: 15, color: "bg-emerald-500" },
];

// Pre-built occupancy curve points (stylised, not real data)
const OCCUPANCY_POINTS = [
  20, 28, 24, 35, 42, 48, 55, 62, 70, 75, 82, 88, 92, 95, 90, 85, 78, 72, 68,
  64, 60, 55, 48, 40, 35, 32, 28, 25, 23, 22,
];

function OccupancyChart() {
  const max = 100;
  const w = 320;
  const h = 90;
  const stepX = w / (OCCUPANCY_POINTS.length - 1);
  const path = OCCUPANCY_POINTS.map((v, i) => {
    const x = i * stepX;
    const y = h - (v / max) * h;
    return `${i === 0 ? "M" : "L"} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(" ");
  const area = `${path} L ${w} ${h} L 0 ${h} Z`;
  return (
    <svg
      viewBox={`0 0 ${w} ${h}`}
      className="w-full h-24"
      preserveAspectRatio="none"
    >
      <defs>
        <linearGradient id="occ-grad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1D3A62" stopOpacity="0.25" />
          <stop offset="100%" stopColor="#1D3A62" stopOpacity="0.02" />
        </linearGradient>
      </defs>
      <path d={area} fill="url(#occ-grad)" />
      <path d={path} fill="none" stroke="#1D3A62" strokeWidth="1.5" />
    </svg>
  );
}

export function DashboardMockup() {
  const t = useTranslations("mockups.dashboard");
  return (
    <div className="rounded-2xl border border-border/60 bg-white shadow-2xl overflow-hidden select-none">
      <div className="p-5 sm:p-6 space-y-5">
        {/* Top bar: property + period */}
        <div className="flex items-center justify-between flex-wrap gap-3">
          <div>
            <div className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {t("propertyLabel")}
            </div>
            <div className="text-base font-semibold">{t("propertyName")}</div>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase tracking-wider text-muted-foreground font-semibold">
              {t("periodLabel")}
            </span>
            <span className="rounded-md border border-border/60 bg-white px-2.5 py-1 text-xs font-medium">
              {t("periodValue")}
            </span>
          </div>
        </div>

        {/* KPI tiles */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {KPI_DEFS.map((k) => (
            <div
              key={k.key}
              className="rounded-xl border border-border/60 bg-white p-3"
            >
              <div className="flex items-center justify-between mb-1.5">
                <k.icon className="h-3.5 w-3.5 text-primary" />
                <span
                  className={`inline-flex items-center gap-0.5 text-[10px] font-semibold ${
                    k.up ? "text-emerald-600" : "text-rose-600"
                  }`}
                >
                  {k.up ? (
                    <TrendingUp className="h-2.5 w-2.5" />
                  ) : (
                    <TrendingDown className="h-2.5 w-2.5" />
                  )}
                  {k.delta}
                </span>
              </div>
              <div className="text-lg font-bold tabular-nums leading-none">
                {k.value}
              </div>
              <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-1.5 font-medium">
                {t(`kpis.${k.key}`)}
              </div>
            </div>
          ))}
        </div>

        {/* Two columns: occupancy chart + channel mix */}
        <div className="grid sm:grid-cols-3 gap-3">
          <div className="sm:col-span-2 rounded-xl border border-border/60 p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="text-xs font-semibold">
                {t("occupancy.title")}
              </div>
              <span className="text-[10px] text-muted-foreground">
                {t("occupancy.range")}
              </span>
            </div>
            <OccupancyChart />
            <div className="flex justify-between text-[9px] text-muted-foreground mt-1 px-0.5">
              <span>{t("occupancy.axisStart")}</span>
              <span>{t("occupancy.axisMid")}</span>
              <span>{t("occupancy.axisEnd")}</span>
            </div>
          </div>

          <div className="rounded-xl border border-border/60 p-4">
            <div className="text-xs font-semibold mb-3">
              {t("channelsTitle")}
            </div>
            <div className="space-y-2.5">
              {CHANNEL_BAR_DEFS.map((c) => (
                <div key={c.key}>
                  <div className="flex items-center justify-between text-[11px] mb-1">
                    <span className="font-medium">{t(`channels.${c.key}`)}</span>
                    <span className="tabular-nums text-muted-foreground">
                      {c.value}%
                    </span>
                  </div>
                  <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                    <div
                      className={`h-full ${c.color} rounded-full`}
                      style={{ width: `${c.value}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Recent stays */}
        <div className="rounded-xl border border-border/60 overflow-hidden">
          <div className="flex items-center justify-between px-4 py-2.5 bg-muted/30 border-b border-border/50">
            <span className="text-xs font-semibold inline-flex items-center gap-1.5">
              <Users className="h-3.5 w-3.5 text-primary" />
              {t("stays.title")}
            </span>
            <span className="text-[10px] text-muted-foreground">
              {t("stays.count")}
            </span>
          </div>
          <table className="w-full text-xs">
            <thead className="text-[10px] uppercase tracking-wider text-muted-foreground">
              <tr className="border-b border-border/40">
                <th className="text-left font-semibold px-4 py-2">
                  {t("stays.guest")}
                </th>
                <th className="text-left font-semibold px-4 py-2">
                  {t("stays.channel")}
                </th>
                <th className="text-right font-semibold px-4 py-2">
                  {t("stays.nights")}
                </th>
                <th className="text-right font-semibold px-4 py-2">
                  {t("stays.total")}
                </th>
              </tr>
            </thead>
            <tbody>
              {STAY_DEFS.map((s, i) => (
                <tr
                  key={s.name}
                  className={i < STAY_DEFS.length - 1 ? "border-b border-border/30" : ""}
                >
                  <td className="px-4 py-2 font-medium">{s.name}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {s.channelKey === "direct"
                      ? t("stays.channelDirect")
                      : t(`channels.${s.channelKey}`)}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums">
                    {s.nights}
                  </td>
                  <td className="px-4 py-2 text-right tabular-nums font-medium">
                    {s.total}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
