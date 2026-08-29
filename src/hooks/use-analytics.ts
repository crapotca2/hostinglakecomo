"use client";

import { useQuery } from "@tanstack/react-query";
import { useOwnerScope } from "@/components/owner-scope";

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
  bookingPrices: Array<{
    bookingId: string; guest: string; source: string; checkIn: string; checkOut: string;
    nights: number; guests: number; price: number; cleaning: number; pricePerNight: number;
  }>;
  priceStats: { count: number; avg: number; median: number; min: number; max: number; avgPerNight: number };
}

export function useAnalytics(year?: number) {
  const yr = year ?? new Date().getFullYear();
  const { ownerId, isAdmin } = useOwnerScope();
  return useQuery({
    queryKey: ["analytics", yr, ownerId],
    enabled: !(isAdmin && !ownerId),
    queryFn: async () => {
      const qs = new URLSearchParams({ year: String(yr) });
      if (ownerId) qs.set("ownerId", ownerId);
      const res = await fetch(`/api/reports/analytics?${qs.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch analytics");
      return (await res.json()) as AnalyticsData;
    },
  });
}
