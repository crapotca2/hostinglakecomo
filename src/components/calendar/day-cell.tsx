import { isSameDay, formatDayLabel, formatDateISO } from "@/lib/date-utils";
import { HolidayBadge } from "./holiday-badge";
import type { Holiday } from "@/hooks/use-holidays";

interface Booking {
  _id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  source: string;
  guestInfo: { name: string };
}

interface DayCellProps {
  date: Date;
  inCurrentMonth: boolean;
  bookings: Booking[];
  holidays: Holiday[];
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
  holidays,
  isToday,
}: DayCellProps) {
  const dateIso = formatDateISO(date);
  const dayBookings = bookings.filter((b) => {
    const ci = b.checkIn.slice(0, 10);
    const co = b.checkOut.slice(0, 10);
    return dateIso >= ci && dateIso < co;
  });
  const dayHolidays = holidays.filter((h) => h.date === dateIso);

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
        <div className="flex flex-wrap gap-0.5 justify-end">
          {dayHolidays.slice(0, 3).map((h, i) => (
            <HolidayBadge key={i} holiday={h} />
          ))}
        </div>
      </div>
      <div className="space-y-0.5">
        {dayBookings.slice(0, 3).map((b) => (
          <div
            key={b._id}
            title={`${b.guestInfo.name} (${b.source})`}
            className={`text-[10px] text-white px-1.5 py-0.5 rounded truncate ${
              SOURCE_COLORS[b.source] || SOURCE_COLORS.other
            }`}
          >
            {b.guestInfo.name}
          </div>
        ))}
        {dayBookings.length > 3 && (
          <div className="text-[10px] text-muted-foreground">
            +{dayBookings.length - 3}
          </div>
        )}
      </div>
    </div>
  );
}
