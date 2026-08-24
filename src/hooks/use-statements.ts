"use client";

import { useQuery } from "@tanstack/react-query";

export interface MonthlyPayout {
  period: string;
  label: string;
  propertiesCount: number;
  grossRevenue: number;
  otaCommissions: number;
  airbibbyCommission: number;
  expenses: number;
  touristTax: number;
  netPayout: number;
  bookingCount: number;
  status: "paid" | "pending";
}

export function useStatements(
  year?: number,
  ownerId?: string | null,
  enabled = true,
) {
  const yr = year ?? new Date().getFullYear();
  return useQuery({
    queryKey: ["statements", yr, ownerId ?? null],
    enabled,
    queryFn: async () => {
      const qs = new URLSearchParams({ year: String(yr) });
      if (ownerId) qs.set("ownerId", ownerId);
      const res = await fetch(`/api/reports/statements?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch statements");
      return (await res.json()) as { year: number; payouts: MonthlyPayout[] };
    },
  });
}
