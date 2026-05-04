"use client";

import Link from "next/link";
import {
  CalendarCheck,
  FileText,
  TableProperties,
  BarChart3,
  Wallet,
  ArrowRight,
} from "lucide-react";

interface Category {
  slug: string;
  name: string;
  desc: string;
  icon: React.ComponentType<{ className?: string }>;
  count: number;
}

const CATEGORIES: Category[] = [
  {
    slug: "stay",
    name: "Stay Reports",
    desc: "Daily checklist, date range, available nights, unita vuote.",
    icon: CalendarCheck,
    count: 4,
  },
  {
    slug: "summary",
    name: "Summary Reports",
    desc: "Riepiloghi aggregati di prenotazioni, pagamenti e tasse.",
    icon: FileText,
    count: 3,
  },
  {
    slug: "detail",
    name: "Detail Reports",
    desc: "Prenotazioni, name crosscheck, email list, listing site fees.",
    icon: TableProperties,
    count: 7,
  },
  {
    slug: "analysis",
    name: "Analysis & Statistics",
    desc: "Occupazione, gap, days in advance, ospiti ripetuti, performance.",
    icon: BarChart3,
    count: 12,
  },
  {
    slug: "property-management",
    name: "Property Management",
    desc: "Commissioni, owner remittance, statements per proprietario.",
    icon: Wallet,
    count: 5,
  },
];

export default function ReportsPage() {
  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div>
        <h1 className="text-2xl font-light">
          <span className="font-semibold">Reports</span>
        </h1>
        <p className="text-sm text-muted-foreground mt-1">
          31 report disponibili per analizzare ogni aspetto del tuo portfolio
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
        {CATEGORIES.map((c) => (
          <Link
            key={c.slug}
            href={`/dashboard/reports/${c.slug}`}
            className="group bg-white rounded-2xl p-6 border border-border/50 card-hover"
          >
            <div className="flex items-start justify-between mb-4">
              <div className="h-11 w-11 rounded-xl bg-primary/[0.08] flex items-center justify-center">
                <c.icon className="h-5 w-5 text-primary" />
              </div>
              <span className="text-[10px] font-semibold uppercase tracking-wider text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
                {c.count} report
              </span>
            </div>
            <h3 className="text-base font-semibold mb-2">{c.name}</h3>
            <p className="text-sm text-muted-foreground leading-relaxed mb-4">
              {c.desc}
            </p>
            <div className="inline-flex items-center gap-1.5 text-xs font-medium text-primary">
              Apri categoria
              <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
            </div>
          </Link>
        ))}
      </div>

      <div className="bg-muted/30 rounded-2xl p-5 border border-border/50">
        <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
          Report in arrivo
        </div>
        <p className="text-sm text-muted-foreground">
          Line Items, Expense Detail, Insurance, Conversion Speed, Inquiries, Quotes — richiedono estensioni schema e arriveranno in versioni future.
        </p>
      </div>
    </div>
  );
}
