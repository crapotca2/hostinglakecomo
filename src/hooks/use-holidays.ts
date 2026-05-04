"use client";

import { useQuery } from "@tanstack/react-query";

export interface Holiday {
  country: string;
  year: number;
  date: string;
  name: string;
  nameLocal: string;
  type: "national" | "regional" | "religious" | "observance";
}

export function useHolidays(country: string = "IT", year?: number) {
  const yr = year ?? new Date().getFullYear();
  return useQuery({
    queryKey: ["holidays", country, yr],
    queryFn: async () => {
      const res = await fetch(`/api/holidays?country=${country}&year=${yr}`);
      if (!res.ok) throw new Error("Failed to fetch holidays");
      const data = await res.json();
      return data.holidays as Holiday[];
    },
    staleTime: 1000 * 60 * 60 * 24, // 24h
  });
}
