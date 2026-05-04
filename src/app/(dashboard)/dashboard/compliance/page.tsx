"use client";

import { useState } from "react";
import { Shield, Download, FileText, Users, Euro } from "lucide-react";

function downloadFile(url: string) {
  const a = document.createElement("a");
  a.href = url;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
}

export default function CompliancePage() {
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

  const [alloggiatiFrom, setAlloggiatiFrom] = useState(weekAgo.toISOString().slice(0, 10));
  const [alloggiatiTo, setAlloggiatiTo] = useState(now.toISOString().slice(0, 10));
  const [istatMonth, setIstatMonth] = useState(String(now.getMonth() + 1));
  const [istatYear, setIstatYear] = useState(String(now.getFullYear()));
  const [quarterFrom, setQuarterFrom] = useState(
    new Date(now.getFullYear(), Math.floor(now.getMonth() / 3) * 3, 1).toISOString().slice(0, 10)
  );
  const [quarterTo, setQuarterTo] = useState(now.toISOString().slice(0, 10));

  function downloadAlloggiati() {
    const url = `/api/compliance/alloggiati?from=${alloggiatiFrom}&to=${alloggiatiTo}&format=txt`;
    downloadFile(url);
  }

  function downloadIstat() {
    const url = `/api/compliance/istat?month=${istatMonth}&year=${istatYear}&format=csv`;
    downloadFile(url);
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in max-w-5xl">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            <span className="font-semibold">Compliance</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Adempimenti normativi italiani per affitti brevi
          </p>
        </div>
        <Shield className="h-5 w-5 text-primary" />
      </div>

      <div className="bg-white rounded-2xl border border-border/50 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
            <Users className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">Alloggiati Web (Questura)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Comunicazione dati ospiti alla Polizia di Stato entro 24h dall&apos;arrivo.
              Esporta il file TXT formato fisso e caricalo manualmente sul portale.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 mt-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Dal</label>
            <input
              type="date"
              value={alloggiatiFrom}
              onChange={(e) => setAlloggiatiFrom(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Al</label>
            <input
              type="date"
              value={alloggiatiTo}
              onChange={(e) => setAlloggiatiTo(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm"
            />
          </div>
          <button
            onClick={downloadAlloggiati}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Scarica TXT
          </button>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-border/50 p-6">
        <div className="flex items-start gap-4 mb-4">
          <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
            <FileText className="h-5 w-5 text-primary" />
          </div>
          <div className="flex-1">
            <h2 className="text-base font-semibold">ISTAT (Regione Lombardia)</h2>
            <p className="text-sm text-muted-foreground mt-1">
              Report mensile flussi turistici (arrivi, presenze, nazionalita&apos;) da
              inviare alla Regione Lombardia via portale turistico.
            </p>
          </div>
        </div>
        <div className="flex flex-wrap items-end gap-3 mt-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Mese</label>
            <select
              value={istatMonth}
              onChange={(e) => setIstatMonth(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm bg-white"
            >
              {["Gen", "Feb", "Mar", "Apr", "Mag", "Giu", "Lug", "Ago", "Set", "Ott", "Nov", "Dic"].map((m, i) => (
                <option key={i} value={i + 1}>
                  {m}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-1 block">Anno</label>
            <input
              type="number"
              value={istatYear}
              onChange={(e) => setIstatYear(e.target.value)}
              className="rounded-lg border border-border px-3 py-2 text-sm w-24"
            />
          </div>
          <button
            onClick={downloadIstat}
            className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
          >
            <Download className="h-4 w-4" />
            Scarica CSV
          </button>
        </div>
      </div>

      <TaxSection
        quarterFrom={quarterFrom}
        setQuarterFrom={setQuarterFrom}
        quarterTo={quarterTo}
        setQuarterTo={setQuarterTo}
      />
    </div>
  );
}

function TaxSection({
  quarterFrom,
  setQuarterFrom,
  quarterTo,
  setQuarterTo,
}: {
  quarterFrom: string;
  setQuarterFrom: (v: string) => void;
  quarterTo: string;
  setQuarterTo: (v: string) => void;
}) {
  const [data, setData] = useState<{
    rows: Array<{ propertyId: string; propertyName: string; bookingCount: number; totalNights: number; totalGuests: number; taxCollected: number; taxOwed: number }>;
    totalOwed: number;
  } | null>(null);
  const [loading, setLoading] = useState(false);

  async function loadTax() {
    setLoading(true);
    try {
      const res = await fetch(`/api/compliance/tassa-soggiorno?from=${quarterFrom}&to=${quarterTo}`);
      const json = await res.json();
      setData(json);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="bg-white rounded-2xl border border-border/50 p-6">
      <div className="flex items-start gap-4 mb-4">
        <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center shrink-0">
          <Euro className="h-5 w-5 text-primary" />
        </div>
        <div className="flex-1">
          <h2 className="text-base font-semibold">Tassa di soggiorno</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Calcolo trimestrale da versare al Comune. Le tariffe sono configurate
            per proprieta&apos; (tipicamente €2-4 per persona/notte, max 5 notti).
          </p>
        </div>
      </div>
      <div className="flex flex-wrap items-end gap-3 mt-4 mb-4">
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Dal</label>
          <input
            type="date"
            value={quarterFrom}
            onChange={(e) => setQuarterFrom(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <div>
          <label className="text-xs font-medium text-muted-foreground mb-1 block">Al</label>
          <input
            type="date"
            value={quarterTo}
            onChange={(e) => setQuarterTo(e.target.value)}
            className="rounded-lg border border-border px-3 py-2 text-sm"
          />
        </div>
        <button
          onClick={loadTax}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-white text-sm font-medium hover:bg-primary/90 transition-colors"
        >
          {loading ? "Caricamento..." : "Calcola"}
        </button>
      </div>

      {data && data.rows.length > 0 && (
        <div className="mt-4">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                <th className="text-left text-xs font-semibold text-muted-foreground py-2">Proprieta</th>
                <th className="text-center text-xs font-semibold text-muted-foreground py-2">Prenotaz.</th>
                <th className="text-center text-xs font-semibold text-muted-foreground py-2">Notti</th>
                <th className="text-center text-xs font-semibold text-muted-foreground py-2">Ospiti</th>
                <th className="text-right text-xs font-semibold text-muted-foreground py-2">Dovuto</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {data.rows.map((r) => (
                <tr key={r.propertyId}>
                  <td className="py-2 text-sm font-medium">{r.propertyName}</td>
                  <td className="py-2 text-sm text-center">{r.bookingCount}</td>
                  <td className="py-2 text-sm text-center">{r.totalNights}</td>
                  <td className="py-2 text-sm text-center">{r.totalGuests}</td>
                  <td className="py-2 text-sm text-right font-semibold tabular-nums">
                    {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(r.taxOwed)}
                  </td>
                </tr>
              ))}
              <tr className="border-t-2 border-primary/30">
                <td colSpan={4} className="py-3 text-sm font-bold">
                  Totale da versare al Comune
                </td>
                <td className="py-3 text-base font-bold text-primary text-right tabular-nums">
                  {new Intl.NumberFormat("it-IT", { style: "currency", currency: "EUR" }).format(data.totalOwed)}
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}
      {data && data.rows.length === 0 && (
        <div className="mt-4 p-4 bg-muted/20 rounded-lg text-center text-sm text-muted-foreground">
          Nessuna prenotazione nel periodo selezionato
        </div>
      )}
    </div>
  );
}
