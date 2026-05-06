"use client";

import { Euro, TrendingUp, CalendarDays, Home } from "lucide-react";
import { useAnalytics } from "@/hooks/use-analytics";

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function AnalyticsPage() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading } = useAnalytics(currentYear);

  const maxMonthRevenue = data ? Math.max(...data.monthly.map((m) => m.revenue), 1) : 1;

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Analytics</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Performance del portfolio — Anno {currentYear}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <KpiCard icon={Euro} label="Revenue Annuale" value={data ? formatEuro(data.kpis.totalRevenue) : "—"} loading={isLoading} />
        <KpiCard icon={CalendarDays} label="Prenotazioni Totali" value={data ? String(data.kpis.totalBookings) : "—"} loading={isLoading} />
        <KpiCard icon={TrendingUp} label="Occupazione Media" value={data ? `${data.kpis.avgOccupancy}%` : "—"} loading={isLoading} />
        <KpiCard icon={Home} label="Tariffa Media" value={data ? formatEuro(data.kpis.avgRate) : "—"} loading={isLoading} />
      </div>

      <div className="bg-white rounded-2xl p-6 border border-border/50">
        <h2 className="text-sm font-semibold mb-6">Revenue Mensile</h2>
        {isLoading ? (
          <div className="h-48 bg-muted/20 animate-pulse rounded" />
        ) : (
          <div className="flex items-end gap-2 h-48">
            {(data?.monthly || []).map((d) => (
              <div key={d.month} className="flex-1 flex flex-col items-center gap-1">
                <div className="text-[10px] font-medium text-foreground">
                  {d.revenue > 0 ? `€${(d.revenue / 1000).toFixed(1)}k` : "—"}
                </div>
                <div
                  className="w-full rounded-t-md bg-primary/80 hover:bg-primary transition-colors min-h-[4px]"
                  style={{ height: `${Math.max(2, (d.revenue / maxMonthRevenue) * 100)}%` }}
                />
                <div className="text-[10px] text-muted-foreground">{d.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-border/50">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="text-sm font-semibold">Performance per Proprieta</h2>
          </div>
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Caricamento...</div>
          ) : !data || data.properties.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Nessun dato</div>
          ) : (
            <div className="divide-y divide-border/30">
              {data.properties.map((p) => (
                <div key={p.propertyId} className="px-6 py-4">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-sm font-medium">{p.name}</span>
                    <span className="text-sm font-bold">{formatEuro(p.revenue)}</span>
                  </div>
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span>Occupazione: {p.occupancy}%</span>
                    <span>Prenotazioni: {p.bookings}</span>
                    <span>Media: {formatEuro(p.avgRate)}/notte</span>
                  </div>
                  <div className="mt-2 h-1.5 bg-muted rounded-full overflow-hidden">
                    <div
                      className="h-full bg-primary rounded-full"
                      style={{ width: `${Math.min(100, p.occupancy)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="bg-white rounded-2xl border border-border/50">
          <div className="px-6 py-4 border-b border-border/40">
            <h2 className="text-sm font-semibold">Fonti di Prenotazione</h2>
          </div>
          {isLoading ? (
            <div className="p-6 text-sm text-muted-foreground">Caricamento...</div>
          ) : !data || data.sources.length === 0 ? (
            <div className="p-6 text-sm text-muted-foreground">Nessun dato</div>
          ) : (
            <div className="p-6 space-y-4">
              {data.sources.map((s) => (
                <div key={s.source}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center gap-2">
                      <div className="h-3 w-3 rounded-full" style={{ backgroundColor: s.color }} />
                      <span className="text-sm font-medium">{s.label}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-sm text-muted-foreground">{formatEuro(s.revenue)}</span>
                      <span className="text-sm font-semibold">{s.percentage}%</span>
                    </div>
                  </div>
                  <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div className="h-full rounded-full transition-all" style={{ width: `${s.percentage}%`, backgroundColor: s.color }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

function KpiCard({ icon: Icon, label, value, loading }: { icon: typeof Euro; label: string; value: string; loading: boolean }) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border/50">
      <div className="flex items-center justify-between mb-3">
        <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      </div>
      <div className="text-2xl font-bold text-foreground">
        {loading ? <span className="inline-block w-20 h-6 bg-muted rounded animate-pulse" /> : value}
      </div>
      <div className="text-xs text-muted-foreground mt-1">{label}</div>
    </div>
  );
}
