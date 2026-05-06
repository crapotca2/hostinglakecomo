"use client";

import { Link, usePathname } from "@/i18n/routing";
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
import { useTranslations } from "next-intl";
import { cn } from "@/lib/utils";
import { Separator } from "@/components/ui/separator";

const NAV_ITEMS = [
  { href: "/dashboard", icon: LayoutDashboard, key: "overview" },
  { href: "/dashboard/properties", icon: Home, key: "properties" },
  { href: "/dashboard/bookings", icon: CalendarDays, key: "bookings" },
  { href: "/dashboard/calendar", icon: CalendarDays, key: "calendar" },
  { href: "/dashboard/analytics", icon: BarChart3, key: "analytics" },
  { href: "/dashboard/reports", icon: FileText, key: "reports" },
  { href: "/dashboard/statements", icon: FileText, key: "statements" },
  { href: "/dashboard/payments", icon: CreditCard, key: "payments" },
  { href: "/dashboard/compliance", icon: Shield, key: "compliance" },
  { href: "/dashboard/settings", icon: Settings, key: "settings" },
] as const;

export function Sidebar() {
  const pathname = usePathname();
  const t = useTranslations("dashboard.sidebar");

  return (
    <aside className="w-[260px] shrink-0 bg-white h-screen sticky top-0 flex flex-col border-r border-border/60">
      {/* Logo */}
      <Link href="/" className="px-5 py-5 flex items-center gap-3 hover:bg-muted/30 transition-colors">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src="/images/logo/logo-marble.png"
          alt={t("brand")}
          className="h-9 w-9 object-contain"
        />
        <div className="flex-1 min-w-0">
          <div className="text-sm font-semibold text-foreground">{t("brand")}</div>
          <div className="text-[10px] text-muted-foreground">{t("tagline")}</div>
        </div>
      </Link>

      <Separator className="opacity-60" />

      {/* Navigation */}
      <div className="flex-1 overflow-y-auto scrollbar-thin px-3 pt-5">
        <span className="section-label px-3">{t("section")}</span>
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
                {t(`items.${item.key}`)}
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
          {t("backToSite")}
        </Link>
        <button
          onClick={() => signOut({ callbackUrl: "/login" })}
          className="sidebar-item text-[13px] font-medium text-muted-foreground w-full"
        >
          <LogOut className="h-4 w-4" />
          {t("logout")}
        </button>
      </div>
    </aside>
  );
}
