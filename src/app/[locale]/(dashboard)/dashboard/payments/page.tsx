"use client";

import { CreditCard } from "lucide-react";
import { usePayments } from "@/hooks/use-payments";

const STATUS_STYLES: Record<string, string> = {
  succeeded: "bg-emerald-50 text-emerald-700",
  pending: "bg-amber-50 text-amber-700",
  failed: "bg-red-50 text-red-600",
  refunded: "bg-gray-100 text-gray-600",
};

const STATUS_LABELS: Record<string, string> = {
  succeeded: "Completato",
  pending: "In attesa",
  failed: "Fallito",
  refunded: "Rimborsato",
};

const TYPE_LABELS: Record<string, string> = {
  booking: "Prenotazione",
  deposit: "Caparra",
  service: "Servizio",
  refund: "Rimborso",
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatDateTime(iso: string): string {
  return new Date(iso).toLocaleString("it-IT", {
    day: "numeric",
    month: "short",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

export default function PaymentsPage() {
  const { data, isLoading } = usePayments();
  const total = (data || [])
    .filter((p) => p.status === "succeeded" && p.type !== "refund")
    .reduce((s, p) => s + p.amount, 0);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            <span className="font-semibold">Pagamenti</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Transazioni Stripe da prenotazioni dirette
          </p>
        </div>
        <CreditCard className="h-5 w-5 text-primary" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Totale Incassato</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : formatEuro(total)}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Transazioni</div>
          <div className="text-2xl font-bold">{isLoading ? "—" : data?.length || 0}</div>
        </div>
        <div className="bg-white rounded-2xl p-5 border border-border/50">
          <div className="text-xs text-muted-foreground mb-1">Media per Transazione</div>
          <div className="text-2xl font-bold">
            {isLoading || !data || data.length === 0 ? "—" : formatEuro(total / data.length)}
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Caricamento...</div>
        ) : !data || data.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">
            Nessuna transazione. Le prenotazioni dirette pagate via Stripe appariranno qui.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">Data</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Tipo</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Payment ID</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Importo</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-6 py-3.5">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {data.map((p) => (
                  <tr key={p._id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-6 py-4 text-sm whitespace-nowrap">{formatDateTime(p.createdAt)}</td>
                    <td className="px-4 py-4 text-sm">{TYPE_LABELS[p.type] || p.type}</td>
                    <td className="px-4 py-4 text-xs font-mono text-muted-foreground truncate max-w-xs">
                      {p.stripePaymentIntentId}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-right tabular-nums">
                      {formatEuro(p.amount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[p.status]}`}>
                        {STATUS_LABELS[p.status] || p.status}
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
