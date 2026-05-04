"use client";

import { useQuery } from "@tanstack/react-query";

export interface Payment {
  _id: string;
  type: string;
  bookingId?: string;
  stripePaymentIntentId: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  status: string;
  createdAt: string;
}

export function usePayments() {
  return useQuery({
    queryKey: ["payments"],
    queryFn: async () => {
      const res = await fetch("/api/payments");
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      return data.payments as Payment[];
    },
  });
}
