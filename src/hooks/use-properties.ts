"use client";

import { useQuery } from "@tanstack/react-query";

export function useProperties(status?: string) {
  return useQuery({
    queryKey: ["properties", status],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (status) params.set("status", status);
      const res = await fetch(`/api/properties?${params.toString()}`);
      if (!res.ok) throw new Error("Failed to fetch properties");
      const data = await res.json();
      return data.properties as Array<{
        _id: string;
        name: string;
        slug: string;
        type: string;
        zone: string;
        status: string;
        address: { city: string };
        details: { bedrooms: number; bathrooms: number; maxGuests: number };
        pricing: { basePrice: number };
        images: { url: string }[];
      }>;
    },
  });
}
