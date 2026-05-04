"use client";

import { useState } from "react";
import { Users, Search } from "lucide-react";
import { useBookings } from "@/hooks/use-bookings";
import { useProperties } from "@/hooks/use-properties";

const STATUS_STYLES: Record<string, string> = {
  confirmed: "bg-emerald-50 text-emerald-700",
  checked_in: "bg-blue-50 text-blue-700",
  checked_out: "bg-gray-100 text-gray-600",
  pending: "bg-amber-50 text-amber-700",
  cancelled: "bg-red-50 text-red-600",
};

const STATUS_LABELS: Record<string, string> = {
  confirmed: "Confermata",
  checked_in: "In corso",
  checked_out: "Completata",
  pending: "In attesa",
  cancelled: "Cancellata",
};

const SOURCE_LABELS: Record<string, string> = {
  airbnb: "Airbnb",
  booking: "Booking.com",
  vrbo: "Vrbo",
  direct: "Diretto",
  other: "Altro",
};

const SOURCE_COLORS: Record<string, string> = {
  airbnb: "text-[#FF5A5F]",
  booking: "text-[#003580]",
  vrbo: "text-[#3B5998]",
  direct: "text-primary",
  other: "text-muted-foreground",
};

function formatEuro(amount: number): string {
  return new Intl.NumberFormat("it-IT", {
    style: "currency",
    currency: "EUR",
    maximumFractionDigits: 0,
  }).format(amount);
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("it-IT", {
    day: "numeric",
    month: "short",
  });
}

export default function BookingsPage() {
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [sourceFilter, setSourceFilter] = useState<string>("");

  const { data: bookings, isLoading } = useBookings({
    status: statusFilter || undefined,
  });
  const { data: properties } = useProperties();

  const propertyMap = new Map(
    (properties || []).map((p) => [p._id, p.name])
  );

  const filtered = (bookings || []).filter((b) => {
    if (sourceFilter && b.source !== sourceFilter) return false;
    if (search) {
      const term = search.toLowerCase();
      const propertyName = propertyMap.get(b.propertyId) || "";
      return (
        b.guestInfo.name.toLowerCase().includes(term) ||
        propertyName.toLowerCase().includes(term)
      );
    }
    return true;
  });

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Prenotazioni</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          {isLoading ? "Caricamento..." : `${filtered.length} prenotazioni`}
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 bg-white rounded-lg px-3 py-2 border border-border/50 flex-1 max-w-sm">
          <Search className="h-4 w-4 text-muted-foreground" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Cerca ospite o proprieta..."
            className="text-sm bg-transparent border-none outline-none flex-1"
          />
        </div>
        <select
          value={statusFilter}
          onChange={(e) => setStatusFilter(e.target.value)}
          className="rounded-lg border border-border/50 px-3 py-2 text-sm bg-white"
        >
          <option value="">Tutti gli stati</option>
          <option value="confirmed">Confermata</option>
          <option value="checked_in">In corso</option>
          <option value="pending">In attesa</option>
          <option value="checked_out">Completata</option>
          <option value="cancelled">Cancellata</option>
        </select>
        <select
          value={sourceFilter}
          onChange={(e) => setSourceFilter(e.target.value)}
          className="rounded-lg border border-border/50 px-3 py-2 text-sm bg-white"
        >
          <option value="">Tutte le fonti</option>
          <option value="airbnb">Airbnb</option>
          <option value="booking">Booking.com</option>
          <option value="vrbo">Vrbo</option>
          <option value="direct">Diretto</option>
        </select>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
        {isLoading ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Caricamento...</div>
        ) : filtered.length === 0 ? (
          <div className="p-12 text-center text-sm text-muted-foreground">Nessuna prenotazione trovata</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-border/40">
                  <th className="text-left text-xs font-semibold text-muted-foreground px-6 py-3.5">Ospite</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Proprieta</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Date</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-4 py-3.5">Notti</th>
                  <th className="text-left text-xs font-semibold text-muted-foreground px-4 py-3.5">Fonte</th>
                  <th className="text-right text-xs font-semibold text-muted-foreground px-4 py-3.5">Importo</th>
                  <th className="text-center text-xs font-semibold text-muted-foreground px-6 py-3.5">Stato</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/30">
                {filtered.map((b) => (
                  <tr key={b._id} className="hover:bg-muted/20 transition-colors cursor-pointer">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="h-8 w-8 rounded-full bg-primary/[0.08] flex items-center justify-center shrink-0">
                          <Users className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <span className="text-sm font-medium">{b.guestInfo.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 text-sm text-muted-foreground">
                      {propertyMap.get(b.propertyId) || "—"}
                    </td>
                    <td className="px-4 py-4 text-sm whitespace-nowrap">
                      {formatDate(b.checkIn)} → {formatDate(b.checkOut)}
                    </td>
                    <td className="px-4 py-4 text-sm text-center">{b.nights}</td>
                    <td className={`px-4 py-4 text-sm font-medium ${SOURCE_COLORS[b.source]}`}>
                      {SOURCE_LABELS[b.source] || b.source}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-right tabular-nums">
                      {formatEuro(b.pricing.totalAmount)}
                    </td>
                    <td className="px-6 py-4 text-center">
                      <span className={`text-[10px] font-semibold px-2.5 py-1 rounded-full ${STATUS_STYLES[b.status]}`}>
                        {STATUS_LABELS[b.status]}
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
