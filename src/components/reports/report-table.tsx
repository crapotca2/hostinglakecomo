"use client";

import { Download } from "lucide-react";

export interface ReportColumn<T> {
  key: string;
  label: string;
  align?: "left" | "center" | "right";
  render?: (row: T) => React.ReactNode;
  width?: string;
  numeric?: boolean;
}

interface ReportTableProps<T> {
  title?: string;
  subtitle?: string;
  columns: ReportColumn<T>[];
  rows: T[];
  loading?: boolean;
  emptyMessage?: string;
  onExportCSV?: () => void;
}

export function ReportTable<T>({
  title,
  subtitle,
  columns,
  rows,
  loading = false,
  emptyMessage = "Nessun dato disponibile",
  onExportCSV,
}: ReportTableProps<T>) {
  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
      {(title || onExportCSV) && (
        <div className="px-6 py-4 border-b border-border/40 flex items-center justify-between gap-4">
          <div>
            {title && <h2 className="text-sm font-semibold">{title}</h2>}
            {subtitle && <p className="text-xs text-muted-foreground mt-0.5">{subtitle}</p>}
          </div>
          {onExportCSV && (
            <button
              onClick={onExportCSV}
              disabled={rows.length === 0}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-border text-xs font-medium hover:bg-muted/50 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Download className="h-3.5 w-3.5" />
              CSV
            </button>
          )}
        </div>
      )}
      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">Caricamento...</div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">{emptyMessage}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                {columns.map((c) => (
                  <th
                    key={c.key}
                    className={`text-${c.align || "left"} text-[11px] font-semibold text-muted-foreground uppercase tracking-wider px-4 py-3 whitespace-nowrap`}
                    style={c.width ? { width: c.width } : undefined}
                  >
                    {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-border/30">
              {rows.map((row, i) => (
                <tr key={i} className="hover:bg-muted/20 transition-colors">
                  {columns.map((c) => (
                    <td
                      key={c.key}
                      className={`px-4 py-3 text-sm text-${c.align || "left"} ${c.numeric ? "tabular-nums" : ""}`}
                    >
                      {c.render ? c.render(row) : (row as any)[c.key]}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
