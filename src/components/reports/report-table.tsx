"use client";

import { useState } from "react";
import { Download, ChevronRight } from "lucide-react";
import { useTranslations } from "next-intl";

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
  /**
   * Se presente, ogni riga diventa espandibile (dropdown): un clic mostra il
   * contenuto renderizzato qui sotto, occupando tutte le colonne. Usato per
   * mostrare le singole prenotazioni dentro un periodo del rendiconto.
   */
  expandable?: (row: T, index: number) => React.ReactNode;
}

export function ReportTable<T>({
  title,
  subtitle,
  columns,
  rows,
  loading = false,
  emptyMessage,
  onExportCSV,
  expandable,
}: ReportTableProps<T>) {
  const t = useTranslations("dashboard.reports.common");
  const resolvedEmpty = emptyMessage ?? t("noData");
  const [expanded, setExpanded] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(i)) next.delete(i);
      else next.add(i);
      return next;
    });

  const totalCols = columns.length + (expandable ? 1 : 0);

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
              aria-label={t("exportCSV")}
            >
              <Download className="h-3.5 w-3.5" />
              {t("csv")}
            </button>
          )}
        </div>
      )}
      {loading ? (
        <div className="p-12 text-center text-sm text-muted-foreground">{t("loading")}</div>
      ) : rows.length === 0 ? (
        <div className="p-12 text-center text-sm text-muted-foreground">{resolvedEmpty}</div>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-border/40">
                {expandable && <th className="w-8 px-2 py-3" aria-hidden />}
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
              {rows.map((row, i) => {
                const isOpen = expanded.has(i);
                return (
                  <FragmentRow
                    key={i}
                    index={i}
                    row={row}
                    columns={columns}
                    expandable={expandable}
                    isOpen={isOpen}
                    onToggle={() => toggle(i)}
                    totalCols={totalCols}
                  />
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

function FragmentRow<T>({
  index,
  row,
  columns,
  expandable,
  isOpen,
  onToggle,
  totalCols,
}: {
  index: number;
  row: T;
  columns: ReportColumn<T>[];
  expandable?: (row: T, index: number) => React.ReactNode;
  isOpen: boolean;
  onToggle: () => void;
  totalCols: number;
}) {
  return (
    <>
      <tr
        className={`transition-colors ${expandable ? "cursor-pointer hover:bg-primary/[0.04]" : "hover:bg-muted/20"} ${isOpen ? "bg-primary/[0.04]" : ""}`}
        onClick={expandable ? onToggle : undefined}
      >
        {expandable && (
          <td className="w-8 px-2 py-3 text-center">
            <ChevronRight
              className={`h-4 w-4 text-muted-foreground transition-transform ${isOpen ? "rotate-90 text-primary" : ""}`}
            />
          </td>
        )}
        {columns.map((c) => (
          <td
            key={c.key}
            className={`px-4 py-3 text-sm text-${c.align || "left"} ${c.numeric ? "tabular-nums" : ""}`}
          >
            {c.render ? c.render(row) : (row as Record<string, React.ReactNode>)[c.key]}
          </td>
        ))}
      </tr>
      {expandable && isOpen && (
        <tr className="bg-muted/[0.15]">
          <td colSpan={totalCols} className="px-4 py-3">
            {expandable(row, index)}
          </td>
        </tr>
      )}
    </>
  );
}
