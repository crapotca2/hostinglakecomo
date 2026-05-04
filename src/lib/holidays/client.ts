import type { Holiday, SupportedCountry } from "./types";
import { ITALY_HOLIDAYS_2026 } from "./data/it-2026";
import { EU_HOLIDAYS_2026 } from "./data/eu-2026";
import { US_HOLIDAYS_2026 } from "./data/us-2026";

const ALL_HOLIDAYS: Holiday[] = [
  ...ITALY_HOLIDAYS_2026,
  ...EU_HOLIDAYS_2026,
  ...US_HOLIDAYS_2026,
];

export class HolidaysClient {
  getHolidays(country: string, year: number): Holiday[] {
    return ALL_HOLIDAYS.filter(
      (h) => h.country === country && h.year === year
    );
  }

  getHolidaysForMonth(country: string, year: number, month: number): Holiday[] {
    // month is 1-indexed (1 = January)
    return this.getHolidays(country, year).filter((h) => {
      const date = new Date(h.date);
      return date.getUTCMonth() === month - 1;
    });
  }

  isHoliday(date: Date, country: string): Holiday | null {
    const year = date.getUTCFullYear();
    const dateStr = date.toISOString().slice(0, 10);
    const match = this.getHolidays(country, year).find(
      (h) => h.date === dateStr
    );
    return match || null;
  }

  getUpcomingHolidays(country: string, daysAhead: number): Holiday[] {
    const now = new Date();
    const future = new Date(now.getTime() + daysAhead * 24 * 60 * 60 * 1000);
    const year = now.getUTCFullYear();
    return this.getHolidays(country, year)
      .filter((h) => {
        const d = new Date(h.date);
        return d >= now && d <= future;
      })
      .sort((a, b) => a.date.localeCompare(b.date));
  }
}

export const holidaysClient = new HolidaysClient();
