import {
  startOfMonth,
  endOfMonth,
  eachDayOfInterval,
  startOfWeek,
  endOfWeek,
  format,
  isSameDay,
  isSameMonth,
} from "date-fns";
import { it } from "date-fns/locale";

export function getMonthGrid(date: Date): Date[] {
  const monthStart = startOfMonth(date);
  const monthEnd = endOfMonth(date);
  const gridStart = startOfWeek(monthStart, { weekStartsOn: 1 });
  const gridEnd = endOfWeek(monthEnd, { weekStartsOn: 1 });
  return eachDayOfInterval({ start: gridStart, end: gridEnd });
}

export function formatMonthLabel(date: Date): string {
  return format(date, "MMMM yyyy", { locale: it });
}

export function formatDayLabel(date: Date): string {
  return format(date, "d");
}

export function formatDateISO(date: Date): string {
  return format(date, "yyyy-MM-dd");
}

export { isSameDay, isSameMonth };

export const WEEKDAY_LABELS = ["Lun", "Mar", "Mer", "Gio", "Ven", "Sab", "Dom"];
