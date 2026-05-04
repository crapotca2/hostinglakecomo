"use client";

import { useQuery } from "@tanstack/react-query";

export interface AnalyticsData {
  year: number;
  kpis: {
    totalRevenue: number;
    totalBookings: number;
    avgOccupancy: number;
    avgRate: number;
  };
  monthly: Array<{ month: string; label: string; revenue: number; bookings: number; nights: number }>;
  properties: Array<{ propertyId: string; name: string; revenue: number; bookings: number; nights: number; avgRate: number; occupancy: number }>;
  sources: Array<{ source: string; label: string; color: string; revenue: number; bookings: number; percentage: number }>;
}

export function useAnalytics(year?: number) {
  const yr = year ?? new Date().getFullYear();
  return useQuery({
    queryKey: ["analytics", yr],
    queryFn: async () => {
      const res = await fetch(`/api/reports/analytics?year=${yr}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return (await res.json()) as AnalyticsData;
    },
  });
}
