import { formatDayLabel, formatDateISO } from "@/lib/date-utils";
import { flagEmoji, countryName } from "@/lib/countries";

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

const SOURCE_COLORS: Record<string, string> = {
  airbnb: "bg-[#FF5A5F]",
  booking: "bg-[#003580]",
  vrbo: "bg-[#3B5998]",
  direct: "bg-primary",
  other: "bg-gray-400",
};

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

  return (
    <div
      className={`min-h-[90px] p-1.5 border border-border/40 ${
        inCurrentMonth ? "bg-white" : "bg-muted/20"
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
      </div>
      <div className="space-y-0.5">
        {dayBookings.slice(0, 3).map((b) => {
          const flag = flagEmoji(b.guestInfo.nationality);
          return (
          <div
            key={b._id}
            title={`${b.guestInfo.name} · ${countryName(b.guestInfo.nationality) || "—"} (${b.source})`}
            className={`text-[10px] text-white px-1.5 py-0.5 rounded truncate ${
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
