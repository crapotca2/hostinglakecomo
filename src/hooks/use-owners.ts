"use client";

import { useQuery } from "@tanstack/react-query";

export interface OwnerProperty {
  id: string;
  name: string;
  slug: string;
  zone: string;
  status: string;
}

export interface OwnerRow {
  ownerId: string;
  name: string;
  email: string;
  propertiesCount: number;
  properties: OwnerProperty[];
}

export function useOwners(enabled = true) {
  return useQuery({
    queryKey: ["owners"],
    enabled,
    queryFn: async () => {
      const res = await fetch("/api/owners");
      if (!res.ok) throw new Error("Failed to fetch owners");
      return (await res.json()) as { role: string; owners: OwnerRow[] };
    },
  });
}
