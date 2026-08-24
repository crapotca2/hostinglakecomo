"use client";

import { useQuery } from "@tanstack/react-query";
import { useOwnerScope } from "@/components/owner-scope";

export function useDashboardStats() {
  const { ownerId, isAdmin } = useOwnerScope();
  return useQuery({
    queryKey: ["dashboard-stats", ownerId],
    enabled: !(isAdmin && !ownerId),
    queryFn: async () => {
      const res = await fetch(`/api/dashboard/stats${ownerId ? `?ownerId=${ownerId}` : ""}`);
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
