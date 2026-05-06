"use client";

import { FileText, ArrowUpRight } from "lucide-react";
import { useStatements } from "@/hooks/use-statements";

const STATUS_STYLES: Record<string, string> = {
  paid: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
};

const STATUS_LABELS: Record<string, string> = {
  paid: "Pagato",
  pending: "In elaborazione",
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

export default function StatementsPage() {
  const currentYear = new Date().getFullYear();
  const { data, isLoading } = useStatements(currentYear);

  const payouts = data?.payouts || [];
  const ytdGross = payouts.reduce((s, p) => s + p.grossRevenue, 0);
  const ytdCommissions = payouts.reduce((s, p) => s + p.otaCommissions + p.airbibbyCommission, 0);
  const ytdExpenses = payouts.reduce((s, p) => s + p.expenses + p.touristTax, 0);
  const ytdNet = payouts.reduce((s, p) => s + p.netPayout, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Rendiconti</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          Riepilogo mensile dei payout — Anno {currentYear}
        </p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Revenue Lordo YTD</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(ytdGross)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Commissioni Totali</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(ytdCommissions)}</div>
          <div className="text-xs text-muted-foreground mt-1">OTA + Hosting Lake Como</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Spese Operative</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(ytdExpenses)}</div>
          <div className="text-xs text-muted-foreground mt-1">Pulizie + tassa soggiorno</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Net Payout YTD</div>
          <div className="text-2xl font-bold text-primary">{isLoading ? "—" : formatEuro(ytdNet)}</div>
          <div className="flex items-center gap-1 text-xs text-emerald-600 mt-1">
            <ArrowUpRight className="h-3 w-3" /> Il tuo guadagno netto
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Caricamento...</div>
        ) : payouts.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Nessun rendiconto disponibile</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">Periodo</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3.5">Prenotaz.</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Lordo</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Commissioni</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Spese</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Netto</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3.5">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {payouts.map((s) => (
                  <tr key={s.period} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                          <FileText className="h-4 w-4 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{s.label}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-center">{s.bookingCount}</td>
                    <td className="px-4 py-4 text-sm text-right font-medium tabular-nums">{formatEuro(s.grossRevenue)}</td>
                    <td className="px-4 py-4 text-sm text-right text-muted-foreground tabular-nums">
                      -{formatEuro(s.otaCommissions + s.airbibbyCommission)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right text-muted-foreground tabular-nums">
                      -{formatEuro(s.expenses + s.touristTax)}
                    </td>
                    <td className="px-4 py-4 text-sm text-right font-bold text-primary tabular-nums">{formatEuro(s.netPayout)}</td>
                    <td className="px-4 py-4 text-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[s.status]}`}>
                        {STATUS_LABELS[s.status]}
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
