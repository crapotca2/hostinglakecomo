"use client";

import { useMemo, useState } from "react";
import { MonthGrid } from "@/components/calendar/month-grid";
import { useBookings } from "@/hooks/use-bookings";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";
import { flagEmoji, countryName } from "@/lib/countries";

export default function CalendarPage() {
  const t = useTranslations("dashboard.calendar");
  const [month, setMonth] = useState(new Date());

  const { data: bookings, isLoading: bookingsLoading } = useBookings();

  // Provenienza ospiti: aggrega le nazionalità delle prenotazioni non cancellate.
  const provenance = useMemo(() => {
    const counts = new Map<string, number>();
    for (const b of bookings || []) {
      if (b.status === "cancelled") continue;
      const nat = b.guestInfo?.nationality;
      if (!nat) continue;
      counts.set(nat, (counts.get(nat) || 0) + 1);
    }
    return Array.from(counts.entries())
      .map(([code, count]) => ({ code, count }))
      .sort((a, b) => b.count - a.count);
  }, [bookings]);

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            <span className="font-semibold">{t("title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">{t("subtitle")}</p>
        </div>
        <CalendarDays className="h-5 w-5 text-primary" />
      </div>

      <div className="bg-white rounded-2xl border border-border/50 p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          {t("provenanceTitle")}
        </div>
        {provenance.length === 0 ? (
          <div className="text-xs text-muted-foreground">{t("provenanceEmpty")}</div>
        ) : (
          <div className="flex flex-wrap gap-2">
            {provenance.map((p) => (
              <div
                key={p.code}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-border bg-white"
              >
                <span className="text-base leading-none">{flagEmoji(p.code)}</span>
                <span>{countryName(p.code)}</span>
                <span className="text-muted-foreground">· {p.count}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {bookingsLoading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-muted-foreground">
          {t("loadingCalendar")}
        </div>
      ) : (
        <MonthGrid month={month} onMonthChange={setMonth} bookings={bookings || []} />
      )}

      <div className="bg-white rounded-2xl border border-border/50 p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-3 uppercase tracking-wider">
          {t("legendTitle")}
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#FF5A5F]" />
            {t("channels.airbnb")}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#003580]" />
            {t("channels.booking")}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#3B5998]" />
            {t("channels.vrbo")}
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary" />
            {t("channels.direct")}
          </div>
        </div>
      </div>
    </div>
  );
}
