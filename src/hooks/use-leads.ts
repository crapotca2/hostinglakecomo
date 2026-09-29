"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export type LeadStatus = "new" | "contacted" | "archived";

export interface Lead {
  id: string;
  nome: string;
  cognome: string;
  email: string;
  telefono: string;
  interesse: string;
  indirizzo: string;
  onPlatform: boolean;
  linkAnnuncio: string;
  messaggio: string;
  status: LeadStatus;
  emailSent: boolean;
  createdAt: string;
}

export function useLeads() {
  return useQuery({
    queryKey: ["leads"],
    queryFn: async () => {
      const res = await fetch("/api/leads");
      if (!res.ok) throw new Error("Failed to fetch leads");
      const data = await res.json();
      return data.leads as Lead[];
    },
  });
}

export function useUpdateLeadStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async ({ id, status }: { id: string; status: LeadStatus }) => {
      const res = await fetch("/api/leads", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!res.ok) throw new Error("Failed to update lead");
      return res.json();
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["leads"] }),
  });
}
