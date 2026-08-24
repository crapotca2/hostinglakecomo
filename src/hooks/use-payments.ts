"use client";

import { useQuery } from "@tanstack/react-query";
import { useOwnerScope } from "@/components/owner-scope";

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
  const { ownerId, isAdmin } = useOwnerScope();
  return useQuery({
    queryKey: ["payments", ownerId],
    enabled: !(isAdmin && !ownerId),
    queryFn: async () => {
      const res = await fetch(`/api/payments${ownerId ? `?ownerId=${ownerId}` : ""}`);
      if (!res.ok) throw new Error("Failed to fetch payments");
      const data = await res.json();
      return data.payments as Payment[];
    },
  });
}
