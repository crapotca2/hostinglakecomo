"use client";

import { useState } from "react";
import { MonthGrid } from "@/components/calendar/month-grid";
import { useBookings } from "@/hooks/use-bookings";
import { useHolidays } from "@/hooks/use-holidays";
import { CalendarDays } from "lucide-react";
import { useTranslations } from "next-intl";

const COUNTRY_CODES = ["IT", "DE", "FR", "GB", "NL", "CH", "US"] as const;
type CountryCode = (typeof COUNTRY_CODES)[number];

export default function CalendarPage() {
  const t = useTranslations("dashboard.calendar");
  const [month, setMonth] = useState(new Date());
  const [countries, setCountries] = useState<string[]>(["IT"]);
  const year = month.getFullYear();

  const { data: bookings, isLoading: bookingsLoading } = useBookings();

  // Always call all 7 hooks (stable count) to satisfy Rules of Hooks
  const itQuery = useHolidays("IT", year);
  const deQuery = useHolidays("DE", year);
  const frQuery = useHolidays("FR", year);
  const gbQuery = useHolidays("GB", year);
  const nlQuery = useHolidays("NL", year);
  const chQuery = useHolidays("CH", year);
  const usQuery = useHolidays("US", year);

  const queriesByCountry: Record<string, typeof itQuery> = {
    IT: itQuery,
    DE: deQuery,
    FR: frQuery,
    GB: gbQuery,
    NL: nlQuery,
    CH: chQuery,
    US: usQuery,
  };

  const allHolidays = countries.flatMap(
    (c) => queriesByCountry[c]?.data || []
  );

  function toggleCountry(code: string) {
    setCountries((prev) =>
      prev.includes(code) ? prev.filter((c) => c !== code) : [...prev, code]
    );
  }

  return (
    <div className="p-6 space-y-6 animate-fade-in">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light">
            <span className="font-semibold">{t("title")}</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            {t("subtitle")}
          </p>
        </div>
        <CalendarDays className="h-5 w-5 text-primary" />
      </div>

      <div className="bg-white rounded-2xl border border-border/50 p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          {t("holidaysTitle")}
        </div>
        <div className="flex flex-wrap gap-2">
          {COUNTRY_CODES.map((code) => (
            <button
              key={code}
              onClick={() => toggleCountry(code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                countries.includes(code)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:bg-muted/50"
              }`}
            >
              {code} {t(`countries.${code as CountryCode}`)}
            </button>
          ))}
        </div>
      </div>

      {bookingsLoading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-muted-foreground">
          {t("loadingCalendar")}
        </div>
      ) : (
        <MonthGrid
          month={month}
          onMonthChange={setMonth}
          bookings={bookings || []}
          holidays={allHolidays}
        />
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
