import { getPortfolio, getPortfolioId } from "@/lib/portfolio";
import type {
  Beds24Property,
  Beds24Booking,
  Beds24CalendarDay,
  Beds24Message,
} from "./types";

export const FIXTURE_PROPERTIES: Beds24Property[] = getPortfolio().map((p) => ({
  id: getPortfolioId(p.slug),
  name: p.name,
  address: p.address.street,
  city: p.address.city,
  country: "IT",
  roomCount: 1,
}));

const SOURCES: Beds24Booking["referer"][] = ["Airbnb", "Booking.com", "Vrbo", "Direct"];
const COUNTRIES = ["IT", "DE", "FR", "GB", "US", "NL", "CH"];
const FIRST_NAMES = ["Marco", "Sarah", "Thomas", "Giulia", "Pierre", "Emma", "Luca", "Anna", "Klaus", "Maria"];
const LAST_NAMES = ["Rossi", "Mitchell", "Berger", "Ferretti", "Dupont", "Williams", "Bianchi", "Schmidt", "Mueller", "Gonzalez"];

function randomDate(start: Date, daysOffset: number): string {
  const d = new Date(start);
  d.setDate(d.getDate() + daysOffset);
  return d.toISOString().slice(0, 10);
}

export function generateFixtureBookings(count = 20): Beds24Booking[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const bookings: Beds24Booking[] = [];

  if (FIXTURE_PROPERTIES.length === 0) return bookings;

  for (let i = 0; i < count; i++) {
    const property = FIXTURE_PROPERTIES[i % FIXTURE_PROPERTIES.length];
    const nightsCount = 2 + Math.floor(Math.random() * 6);
    const offsetDays = -30 + Math.floor(Math.random() * 120);
    const arrival = randomDate(today, offsetDays);
    const departure = randomDate(today, offsetDays + nightsCount);
    const guests = 1 + Math.floor(Math.random() * 5);
    const nightlyRate = 90 + Math.floor(Math.random() * 350);
    const total = nightlyRate * nightsCount;
    const source = SOURCES[i % SOURCES.length];
    const isPast = offsetDays + nightsCount < 0;

    bookings.push({
      id: `b24_b${i + 1}`,
      propertyId: property.id,
      roomId: `${property.id}_r1`,
      status: isPast ? "confirmed" : i % 7 === 0 ? "request" : "confirmed",
      arrival,
      departure,
      numAdult: guests,
      numChild: 0,
      guestFirstName: FIRST_NAMES[i % FIRST_NAMES.length],
      guestName: LAST_NAMES[i % LAST_NAMES.length],
      guestEmail: `guest${i + 1}@example.com`,
      guestPhone: `+39 333 ${1000000 + i}`,
      guestCountry: COUNTRIES[i % COUNTRIES.length],
      price: total,
      commission: Math.round(total * (source === "Direct" ? 0 : 0.15)),
      referer: source,
      bookingTime: new Date(today.getTime() - (30 - (offsetDays < 0 ? 0 : offsetDays)) * 24 * 60 * 60 * 1000).toISOString(),
      modifiedTime: new Date().toISOString(),
    });
  }

  return bookings;
}

export function generateFixtureCalendar(
  propertyId: string,
  daysAhead = 90
): Beds24CalendarDay[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const days: Beds24CalendarDay[] = [];

  for (let i = 0; i < daysAhead; i++) {
    const d = new Date(today);
    d.setDate(d.getDate() + i);
    const dayOfWeek = d.getDay();
    const isWeekend = dayOfWeek === 5 || dayOfWeek === 6;
    const basePrice = 180;
    days.push({
      date: d.toISOString().slice(0, 10),
      propertyId,
      roomId: `${propertyId}_r1`,
      price: Math.round(basePrice * (isWeekend ? 1.3 : 1)),
      available: 1,
      minStay: isWeekend ? 2 : 1,
    });
  }

  return days;
}

export const FIXTURE_MESSAGES: Beds24Message[] = [
  {
    id: "b24_m1",
    bookingId: "b24_b1",
    source: "guest",
    message: "Hi, what time is check-in available?",
    timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    read: false,
  },
  {
    id: "b24_m2",
    bookingId: "b24_b1",
    source: "host",
    message: "Hello! Check-in is available from 3 PM. Please let me know your ETA.",
    timestamp: new Date(Date.now() - 1 * 60 * 60 * 1000).toISOString(),
    read: true,
  },
];
