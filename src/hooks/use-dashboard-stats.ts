"use client";

import { useQuery } from "@tanstack/react-query";

export function useDashboardStats() {
  return useQuery({
    queryKey: ["dashboard-stats"],
    queryFn: async () => {
      const res = await fetch("/api/dashboard/stats");
      if (!res.ok) throw new Error("Failed to fetch dashboard stats");
      return (await res.json()) as {
        monthRevenue: number;
        activeBookings: number;
        occupancyRate: number;
        propertyCount: number;
        recentBookings: Array<{
          _id: string;
          propertyId: string;
          checkIn: string;
          checkOut: string;
          nights: number;
          guests: number;
          status: string;
          source: string;
          guestInfo: { name: string };
          pricing: { totalAmount: number };
        }>;
      };
    },
  });
}
