"use client";

import {
  getMonthGrid,
  formatMonthLabel,
  isSameMonth,
  isSameDay,
  WEEKDAY_LABELS,
} from "@/lib/date-utils";
import { DayCell } from "./day-cell";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface Booking {
  _id: string;
  propertyId: string;
  checkIn: string;
  checkOut: string;
  status: string;
  source: string;
  guestInfo: { name: string; nationality?: string };
}

interface MonthGridProps {
  month: Date;
  onMonthChange: (date: Date) => void;
  bookings: Booking[];
}

export function MonthGrid({
  month,
  onMonthChange,
  bookings,
}: MonthGridProps) {
  const days = getMonthGrid(month);
  const today = new Date();

  return (
    <div className="bg-white rounded-2xl border border-border/50 overflow-hidden">
      <div className="flex items-center justify-between px-6 py-4 border-b border-border/40">
        <h2 className="text-sm font-semibold capitalize">
          {formatMonthLabel(month)}
        </h2>
        <div className="flex items-center gap-1">
          <button
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() - 1, 1)
              )
            }
            className="h-8 w-8 rounded-lg border border-border hover:bg-muted/50 transition-colors inline-flex items-center justify-center"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={() => onMonthChange(new Date())}
            className="h-8 px-3 rounded-lg border border-border hover:bg-muted/50 transition-colors text-xs font-medium"
          >
            Oggi
          </button>
          <button
            onClick={() =>
              onMonthChange(
                new Date(month.getFullYear(), month.getMonth() + 1, 1)
              )
            }
            className="h-8 w-8 rounded-lg border border-border hover:bg-muted/50 transition-colors inline-flex items-center justify-center"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 border-b border-border/40">
        {WEEKDAY_LABELS.map((label) => (
          <div
            key={label}
            className="px-2 py-2 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider text-center"
          >
            {label}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-7">
        {days.map((day) => (
          <DayCell
            key={day.toISOString()}
            date={day}
            inCurrentMonth={isSameMonth(day, month)}
            bookings={bookings}
            isToday={isSameDay(day, today)}
          />
        ))}
      </div>
    </div>
  );
}
