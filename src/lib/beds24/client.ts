import type {
  Beds24Property,
  Beds24Booking,
  Beds24CalendarDay,
  Beds24Message,
  BookingFilters,
} from "./types";
import {
  FIXTURE_PROPERTIES,
  FIXTURE_MESSAGES,
  generateFixtureBookings,
  generateFixtureCalendar,
} from "./fixtures";

const USE_MOCK =
  process.env.USE_BEDS24_MOCK === "true" ||
  (!process.env.BEDS24_REFRESH_TOKEN && !process.env.BEDS24_LONG_LIFE_TOKEN);

export class Beds24Client {
  private readonly baseUrl: string;
  private readonly refreshToken: string;
  private readonly longLifeToken: string;
  private accessToken: string | null = null;
  private accessTokenExpiry: number = 0;
  private cachedBookings: Beds24Booking[] | null = null;

  constructor() {
    this.baseUrl = process.env.BEDS24_API_URL || "https://api.beds24.com/v2";
    this.refreshToken = process.env.BEDS24_REFRESH_TOKEN || "";
    this.longLifeToken = process.env.BEDS24_LONG_LIFE_TOKEN || "";
  }

  private async getAccessToken(): Promise<string> {
    // Long-life token: nessun refresh, lo usiamo direttamente
    if (this.longLifeToken) return this.longLifeToken;

    if (this.accessToken && Date.now() < this.accessTokenExpiry) {
      return this.accessToken;
    }
    if (!this.refreshToken) {
      throw new Error(
        "Beds24 auth: né BEDS24_LONG_LIFE_TOKEN né BEDS24_REFRESH_TOKEN sono settati",
      );
    }
    const res = await fetch(`${this.baseUrl}/authentication/token`, {
      method: "GET",
      headers: { refreshToken: this.refreshToken },
    });
    if (!res.ok) throw new Error(`Beds24 auth failed: ${res.status}`);
    const data = await res.json();
    this.accessToken = data.token;
    this.accessTokenExpiry = Date.now() + (data.expiresIn - 60) * 1000;
    return this.accessToken!;
  }

  private async request<T>(path: string, options: RequestInit = {}): Promise<T> {
    const token = await this.getAccessToken();
    const res = await fetch(`${this.baseUrl}${path}`, {
      ...options,
      headers: {
        ...options.headers,
        token,
        "Content-Type": "application/json",
      },
    });
    if (!res.ok) {
      const errText = await res.text();
      throw new Error(`Beds24 API error ${res.status}: ${errText}`);
    }
    return (await res.json()) as T;
  }

  async getProperties(): Promise<Beds24Property[]> {
    if (USE_MOCK) return FIXTURE_PROPERTIES;
    const data = await this.request<{ data: Beds24Property[] }>("/properties");
    return data.data;
  }

  async getBookings(filters: BookingFilters = {}): Promise<Beds24Booking[]> {
    if (USE_MOCK) {
      if (!this.cachedBookings) this.cachedBookings = generateFixtureBookings(48);
      let results = this.cachedBookings;
      if (filters.propertyId) {
        results = results.filter((b) => b.propertyId === filters.propertyId);
      }
      if (filters.status) {
        results = results.filter((b) => b.status === filters.status);
      }
      return results;
    }
    const query = new URLSearchParams();
    if (filters.propertyId) query.set("propertyId", filters.propertyId);
    if (filters.from) query.set("arrival", filters.from);
    if (filters.to) query.set("departure", filters.to);
    if (filters.status) query.set("status", filters.status);
    const data = await this.request<{ data: Beds24Booking[] }>(
      `/bookings?${query.toString()}`
    );
    return data.data;
  }

  async getCalendar(
    propertyId: string,
    from: string,
    to: string
  ): Promise<Beds24CalendarDay[]> {
    if (USE_MOCK) {
      const daysBetween = Math.ceil(
        (new Date(to).getTime() - new Date(from).getTime()) / (24 * 60 * 60 * 1000)
      );
      return generateFixtureCalendar(propertyId, daysBetween || 90);
    }
    const query = new URLSearchParams({ propertyId, from, to });
    const data = await this.request<{ data: Beds24CalendarDay[] }>(
      `/inventory/rooms/calendar?${query.toString()}`
    );
    return data.data;
  }

  async getMessages(bookingId: string): Promise<Beds24Message[]> {
    if (USE_MOCK) {
      return FIXTURE_MESSAGES.filter((m) => m.bookingId === bookingId);
    }
    const data = await this.request<{ data: Beds24Message[] }>(
      `/bookings/messages?bookingId=${bookingId}`
    );
    return data.data;
  }

  isMockMode(): boolean {
    return USE_MOCK;
  }
}

export const beds24Client = new Beds24Client();
