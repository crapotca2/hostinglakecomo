"use client";

import { useQuery } from "@tanstack/react-query";

export interface Me {
  userId: string;
  role: "admin" | "owner" | "guest";
  ownerId: string | null;
}

export function useMe() {
  return useQuery({
    queryKey: ["me"],
    queryFn: async () => {
      const res = await fetch("/api/me");
      if (!res.ok) throw new Error("Failed to fetch session");
      return (await res.json()) as Me;
    },
    staleTime: 5 * 60_000,
  });
}
