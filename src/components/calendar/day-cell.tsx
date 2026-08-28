import { formatDayLabel, formatDateISO } from "@/lib/date-utils";
import { flagEmoji, countryName } from "@/lib/countries";
import { rainForDate, maintenanceForDate } from "@/lib/calendar-annotations";
import { CloudRain, Wrench } from "lucide-react";

interface Booking {
  _id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  source: string;
  guestInfo: { name: string; nationality?: string };
}

interface DayCellProps {
  date: Date;
  inCurrentMonth: boolean;
  bookings: Booking[];
  isToday: boolean;
}

// Colore badge per canale (bg + testo). Il diretto è giallo Host Como.
const SOURCE_COLORS: Record<string, string> = {
  airbnb: "bg-[#FF5A5F] text-white",
  booking: "bg-[#003580] text-white",
  vrbo: "bg-[#3B5998] text-white",
  direct: "bg-[#EAB308] text-black",
  other: "bg-gray-400 text-white",
};

// Intensità pioggia → colore icona.
const RAIN_COLOR = {
  light: "text-sky-400",
  moderate: "text-sky-500",
  heavy: "text-blue-600",
} as const;

export function DayCell({
  date,
  inCurrentMonth,
  bookings,
  isToday,
}: DayCellProps) {
  const dateIso = formatDateISO(date);
  const dayBookings = bookings.filter((b) => {
    const ci = b.checkIn.slice(0, 10);
    const co = b.checkOut.slice(0, 10);
    return dateIso >= ci && dateIso < co;
  });
  const rain = rainForDate(dateIso);
  const maintenance = maintenanceForDate(dateIso);

  return (
    <div
      className={`min-h-[90px] p-1.5 border border-border/40 ${
        maintenance ? "bg-amber-50" : inCurrentMonth ? "bg-white" : "bg-muted/20"
      } ${isToday ? "ring-2 ring-primary ring-inset" : ""}`}
    >
      <div className="flex items-start justify-between mb-1">
        <span
          className={`text-xs font-semibold ${
            inCurrentMonth ? "text-foreground" : "text-muted-foreground/50"
          } ${isToday ? "text-primary" : ""}`}
        >
          {formatDayLabel(date)}
        </span>
        <div className="flex items-center gap-1">
          {rain && (
            <span title={`Pioggia ${rain.mm.toLocaleString("it-IT")} mm`} className="inline-flex">
              <CloudRain className={`h-3.5 w-3.5 ${RAIN_COLOR[rain.level]}`} />
            </span>
          )}
          {maintenance && (
            <span title={maintenance.reason} className="inline-flex">
              <Wrench className="h-3.5 w-3.5 text-amber-600" />
            </span>
          )}
        </div>
      </div>
      <div className="space-y-0.5">
        {dayBookings.slice(0, 3).map((b) => {
          const flag = flagEmoji(b.guestInfo.nationality);
          return (
          <div
            key={b._id}
            title={`${b.guestInfo.name} · ${countryName(b.guestInfo.nationality) || "—"} (${b.source})`}
            className={`text-[10px] px-1.5 py-0.5 rounded truncate ${
              SOURCE_COLORS[b.source] || SOURCE_COLORS.other
            }`}
          >
            {flag ? `${flag} ` : ""}{b.guestInfo.name}
          </div>
          );
        })}
        {dayBookings.length > 3 && (
          <div className="text-[10px] text-muted-foreground">
            +{dayBookings.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}
