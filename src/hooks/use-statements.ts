"use client";

import { useQuery } from "@tanstack/react-query";
import { useOwnerScope } from "@/components/owner-scope";

export interface MonthlyPayout {
  period: string;
  label: string;
  propertiesCount: number;
  grossRevenue: number;
  roomRevenue: number;
  otaCommissions: number;
  cedolare: number;
  airbibbyCommission: number;
  expenses: number;
  cleaning: number;
  touristTax: number;
  parkingOwner: number;
  netPayout: number;
  bookingCount: number;
  status: "paid" | "pending";
}

export function useStatements(year?: number) {
  const yr = year ?? new Date().getFullYear();
  const { ownerId, isAdmin } = useOwnerScope();
  return useQuery({
    queryKey: ["statements", yr, ownerId],
    enabled: !(isAdmin && !ownerId),
    queryFn: async () => {
      const qs = new URLSearchParams({ year: String(yr) });
      if (ownerId) qs.set("ownerId", ownerId);
      const res = await fetch(`/api/reports/statements?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch statements");
      return (await res.json()) as { year: number; payouts: MonthlyPayout[] };
    },
  });
}
