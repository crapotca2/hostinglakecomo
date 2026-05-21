// Types mirroring Beds24 API V2 responses
// See https://api.beds24.com/v2/

export interface Beds24Property {
  id: string;
  name: string;
  address?: string;
  city?: string;
  country?: string;
  roomCount: number;
}

export interface Beds24Room {
  id: string;
  propertyId: string;
  name: string;
  maxGuests: number;
  qty: number;
}

export interface Beds24Booking {
  id: string;
  propertyId: string;
  roomId: string;
  status: "new" | "confirmed" | "cancelled" | "request" | "black";
  arrival: string; // YYYY-MM-DD
  departure: string; // YYYY-MM-DD
  numAdult: number;
  numChild: number;
  guestFirstName: string;
  guestName: string;
  guestEmail?: string;
  guestPhone?: string;
  guestCountry?: string;
  price: number;
  commission?: number;
  referer: string; // "Airbnb" | "Booking.com" | "Vrbo" | "Direct" | ...
  bookingTime: string; // ISO datetime
  modifiedTime: string;
}

export interface Beds24CalendarDay {
  date: string; // YYYY-MM-DD
  propertyId: string;
  roomId: string;
  price?: number;
  available: number; // 0 = not available, 1+ = available
  minStay?: number;
  maxStay?: number;
}

export interface Beds24Message {
  id: string;
  bookingId: string;
  source: "guest" | "host" | "system";
  message: string;
  timestamp: string;
  read: boolean;
}

export interface BookingFilters {
  propertyId?: string;
  from?: string;
  to?: string;
  status?: Beds24Booking["status"];
  modifiedSince?: string;
}

export interface Beds24PropertyText {
  language: string;
  description?: string;
  shortDescription?: string;
  location?: string;
}

export interface Beds24PropertyDetail extends Beds24Property {
  postcode?: string;
  latitude?: number;
  longitude?: number;
  currency?: string;
  checkInStart?: string;
  checkInEnd?: string;
  checkOutEnd?: string;
  texts?: Beds24PropertyText[];
  roomsList?: Beds24Room[];
}

export interface Beds24Image {
  id: string;
  propertyId: string;
  roomId?: string;
  url: string;
  largeUrl?: string;
  caption?: string;
  order: number;
}

export interface Beds24RatePlan {
  id: string;
  propertyId: string;
  roomId: string;
  name: string;
  basePrice: number;
  weekendMultiplier?: number;
  seasonal?: {
    name: string;
    from: string;
    to: string;
    multiplier: number;
  }[];
}

export type Beds24WebhookType =
  | "bookingCreated"
  | "bookingModified"
  | "bookingCancelled"
  | "messageReceived"
  | "calendarChanged";

export interface Beds24WebhookEvent {
  type: Beds24WebhookType;
  timestamp: string;
  bookingId?: string;
  propertyId?: string;
  roomId?: string;
  payload?: Record<string, unknown>;
}
