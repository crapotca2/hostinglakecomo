"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Home,
  CalendarDays,
  BarChart3,
  FileText,
  CreditCard,
  Shield,
  Settings,
  LogOut,
} from "lucide-react";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, label: "Overview" },
  { href: "/dashboard/properties", icon: Home, label: "Proprieta" },
  { href: "/dashboard/bookings", icon: CalendarDays, label: "Prenotazioni" },
  { href: "/dashboard/calendar", icon: CalendarDays, label: "Calendario" },
  { href: "/dashboard/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/dashboard/reports", icon: FileText, label: "Reports" },
  { href: "/dashboard/statements", icon: FileText, label: "Rendiconti" },
  { href: "/dashboard/payments", icon: CreditCard, label: "Pagamenti" },
  { href: "/dashboard/compliance", icon: Shield, label: "Compliance" },
  { href: "/dashboard/settings", icon: Settings, label: "Impostazioni" },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-[260px] shrink-0 bg-white h-screen sticky top-0 flex flex-col border-r border-border/60">
      {/* Logo */}
      <Link href="/" className="px-5 py-5 flex items-center gap-3 hover:bg-muted/30 transition-colors">
        <div
          className="h-9 w-9 rounded-xl flex items-center justify-center text-white font-bold text-sm shadow-sm"
          style={{ background: "linear-gradient(135deg, #0C7489 0%, #119DB0 100%)" }}
        >
          HLC
        </div>
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">Hosting Lake Como</div>
          <div className="text-[10px] text-muted-foreground">Dashboard Proprietario</div>
        </div>
      </Link>

      <Separator className="opacity-60" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pt-5">
        <span className="section-label px-3">Gestione</span>
        <nav className="space-y-1 mt-3">
          {NAV_ITEMS.map((item) => {
            const active = pathname === item.href || (item.href !== "/dashboard" && pathname.startsWith(item.href));
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "sidebar-item text-[13px] font-medium",
                  active ? "sidebar-item-active text-foreground" : "text-muted-foreground"
                )}
              >
                <item.icon className={cn("h-4 w-4", active && "text-primary")} />
                {item.label}
              </Link>
            );
          })}
        </nav>
      </div>

      <Separator className="opacity-60" />

      {/* Bottom */}
      <div className="px-3 py-3 space-y-1">
        <Link
          href="/"
          className="sidebar-item text-[13px] font-medium text-muted-foreground"
        >
          <Home className="h-4 w-4" />
          Torna al Sito
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-item text-[13px] font-medium text-muted-foreground w-full"
        >
          <LogOut className="h-4 w-4" />
          Esci
        </button>
      </div>
    </aside>
  );
}
