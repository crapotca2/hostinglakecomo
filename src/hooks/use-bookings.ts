"use client";

import { useQuery } from "@tanstack/react-query";

export interface BookingFilters {
  propertyId?: string;
  status?: string;
  from?: string;
  to?: string;
}

export function useBookings(filters: BookingFilters = {}) {
  return useQuery({
    queryKey: ["bookings", filters],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.propertyId) params.set("propertyId", filters.propertyId);
      if (filters.status) params.set("status", filters.status);
      if (filters.from) params.set("from", filters.from);
      if (filters.to) params.set("to", filters.to);
      const res = await fetch(`/api/bookings?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch bookings");
      const data = await res.json();
      return data.bookings as Array<{
        _id: string;
        propertyId: string;
        checkIn: string;
        checkOut: string;
        nights: number;
        guests: number;
        status: string;
        source: string;
        guestInfo: { name: string; email: string; nationality?: string };
        pricing: { totalAmount: number; ownerPayout: number };
      }>;
    },
  });
}
