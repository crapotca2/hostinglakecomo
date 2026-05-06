"use client";

import { useTranslations } from "next-intl";

interface ReportFiltersProps {
  from: string;
  to: string;
  onFromChange: (v: string) => void;
  onToChange: (v: string) => void;
  preset?: string;
  onPresetChange?: (preset: string) => void;
  extra?: React.ReactNode;
}

const PRESET_IDS = ["7d", "30d", "mtd", "ytd", "all"] as const;

export function ReportFilters({
  from,
  to,
  onFromChange,
  onToChange,
  preset,
  onPresetChange,
  extra,
}: ReportFiltersProps) {
  const t = useTranslations("dashboard.reports.common");
  return (
    <div className="bg-white rounded-2xl p-4 border border-border/50 flex flex-wrap items-end gap-3">
      {onPresetChange && (
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            {t("period")}
          </label>
          <div className="flex rounded-lg border border-border overflow-hidden">
            {PRESET_IDS.map((id) => (
              <button
                key={id}
                onClick={() => onPresetChange(id)}
                className={`px-3 py-1.5 text-xs font-medium transition-colors ${
                  preset === id
                    ? "bg-primary text-white"
                    : "bg-white text-muted-foreground hover:bg-muted/50"
                }`}
              >
                {t(`presets.${id}`)}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="flex items-end gap-2">
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            {t("from")}
          </label>
          <div className="relative">
            <input
              type="date"
              value={from}
              onChange={(e) => onFromChange(e.target.value)}
              className="rounded-lg border border-border px-3 py-1.5 text-xs"
            />
          </div>
        </div>
        <div>
          <label className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider block mb-1.5">
            {t("to")}
          </label>
          <input
            type="date"
            value={to}
            onChange={(e) => onToChange(e.target.value)}
            className="rounded-lg border border-border px-3 py-1.5 text-xs"
          />
        </div>
      </div>

      {extra && <div className="flex items-end gap-3 ml-auto">{extra}</div>}
    </div>
  );
}

export function presetToDateRange(preset: string): { from: string; to: string } {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  let from: Date;
  const to = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 23, 59, 59);

  if (preset === "7d") from = new Date(today.getTime() - 7 * 86400000);
  else if (preset === "30d") from = new Date(today.getTime() - 30 * 86400000);
  else if (preset === "mtd") from = new Date(now.getFullYear(), now.getMonth(), 1);
  else if (preset === "ytd") from = new Date(now.getFullYear(), 0, 1);
  else from = new Date(2020, 0, 1);

  return {
    from: from.toISOString().slice(0, 10),
    to: to.toISOString().slice(0, 10),
  };
}
