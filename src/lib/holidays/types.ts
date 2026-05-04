export type HolidayType = "national" | "regional" | "religious" | "observance";

export interface Holiday {
  country: string;
  year: number;
  date: string; // ISO format YYYY-MM-DD
  name: string;
  nameLocal: string;
  type: HolidayType;
}

export const SUPPORTED_COUNTRIES = ["IT", "DE", "FR", "GB", "NL", "CH", "US"] as const;
export type SupportedCountry = (typeof SUPPORTED_COUNTRIES)[number];
