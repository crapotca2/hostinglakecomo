"use client";

import { useState } from "react";
import { MonthGrid } from "@/components/calendar/month-grid";
import { useBookings } from "@/hooks/use-bookings";
import { useHolidays } from "@/hooks/use-holidays";
import { CalendarDays } from "lucide-react";

const COUNTRY_OPTIONS = [
  { code: "IT", label: "Italia" },
  { code: "DE", label: "Germania" },
  { code: "FR", label: "Francia" },
  { code: "GB", label: "Regno Unito" },
  { code: "NL", label: "Paesi Bassi" },
  { code: "CH", label: "Svizzera" },
  { code: "US", label: "Stati Uniti" },
];

export default function CalendarPage() {
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
            <span className="font-semibold">Calendario</span>
          </h1>
          <p className="text-sm text-muted-foreground mt-1">
            Vista unificata delle prenotazioni con festivita&apos;
          </p>
        </div>
        <CalendarDays className="h-5 w-5 text-primary" />
      </div>

      <div className="bg-white rounded-2xl border border-border/50 p-4">
        <div className="text-xs font-semibold text-muted-foreground mb-2 uppercase tracking-wider">
          Festivita&apos; visualizzate
        </div>
        <div className="flex flex-wrap gap-2">
          {COUNTRY_OPTIONS.map((opt) => (
            <button
              key={opt.code}
              onClick={() => toggleCountry(opt.code)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors border ${
                countries.includes(opt.code)
                  ? "bg-primary text-white border-primary"
                  : "bg-white text-muted-foreground border-border hover:bg-muted/50"
              }`}
            >
              {opt.code} {opt.label}
            </button>
          ))}
        </div>
      </div>

      {bookingsLoading ? (
        <div className="bg-white rounded-2xl border border-border/50 p-12 text-center text-sm text-muted-foreground">
          Caricamento calendario...
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
          Legenda
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#FF5A5F]" />
            Airbnb
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#003580]" />
            Booking.com
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-[#3B5998]" />
            Vrbo
          </div>
          <div className="flex items-center gap-2">
            <div className="h-3 w-3 rounded bg-primary" />
            Diretto
          </div>
        </div>
      </div>
    </div>
  );
}
