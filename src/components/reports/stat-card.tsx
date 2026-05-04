"use client";

import { ArrowUpRight, ArrowDownRight, LucideIcon } from "lucide-react";

interface StatCardProps {
  icon?: LucideIcon;
  label: string;
  value: string | number;
  change?: { value: string; positive: boolean };
  loading?: boolean;
  hint?: string;
}

export function StatCard({ icon: Icon, label, value, change, loading, hint }: StatCardProps) {
  return (
    <div className="bg-white rounded-2xl p-5 border border-border/50">
      {Icon && (
        <div className="h-10 w-10 rounded-xl bg-primary/[0.08] flex items-center justify-center mb-3">
          <Icon className="h-5 w-5 text-primary" />
        </div>
      )}
      <div className="text-xs text-muted-foreground mb-1">{label}</div>
      <div className="text-2xl font-bold text-foreground">
        {loading ? (
          <span className="inline-block w-20 h-6 bg-muted rounded animate-pulse" />
        ) : (
          value
        )}
      </div>
      {change && (
        <div
          className={`flex items-center gap-1 text-xs font-medium mt-1 ${
            change.positive ? "text-emerald-600" : "text-red-500"
          }`}
        >
          {change.positive ? (
            <ArrowUpRight className="h-3 w-3" />
          ) : (
            <ArrowDownRight className="h-3 w-3" />
          )}
          {change.value}
        </div>
      )}
      {hint && !change && <div className="text-xs text-muted-foreground mt-1">{hint}</div>}
    </div>
  );
}
