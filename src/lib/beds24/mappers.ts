import { ObjectId } from "mongodb";
import type {
  Beds24Booking,
  Beds24CalendarDay,
  Beds24Property,
  Beds24PropertyDetail,
  Beds24PropertyText,
} from "./types";
import type {
  BookingDoc,
  BookingSource,
  BookingStatus,
  CalendarDayDoc,
  PropertyDoc,
} from "@/types/database";

// ── Booking source / status mapping ──

export function mapSource(referer: string | undefined | null): BookingSource {
  if (!referer) return "other";
  const lower = referer.toLowerCase();
  if (lower.includes("airbnb")) return "airbnb";
  if (lower.includes("booking")) return "booking";
  if (lower.includes("vrbo")) return "vrbo";
  if (lower.includes("expedia")) return "expedia";
  if (lower.includes("direct")) return "direct";
  return "other";
}

export function mapStatus(status: Beds24Booking["status"]): BookingStatus {
  switch (status) {
    case "request":
      return "pending";
    case "cancelled":
      return "cancelled";
    case "confirmed":
    case "new":
      return "confirmed";
    case "black":
      return "cancelled";
    default:
      return "pending";
  }
}

// ── Helpers ──

export function nightsBetween(arrival: string, departure: string): number {
  const a = new Date(arrival).getTime();
  const d = new Date(departure).getTime();
  return Math.max(1, Math.round((d - a) / (24 * 60 * 60 * 1000)));
}

export function slugify(input: string): string {
  return input
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 80);
}

// ── Booking pricing computation (business logic Host Como) ──

const HOST_COMO_COMMISSION_RATE = 0.10;
const DEFAULT_CLEANING_FEE = 60;
const TOURIST_TAX_PER_ADULT_PER_NIGHT = 3;
const TOURIST_TAX_MAX_NIGHTS = 5;

export interface ComputedBookingPricing {
  nightlyRate: number;
  cleaningFee: number;
  totalAmount: number;
  commissionRate: number;
  commissionAmount: number;
  ownerPayout: number;
  touristTax: number;
}

export function computeBookingPricing(
  b: Beds24Booking,
  opts: { touristTaxRate?: number; maxTouristTaxNights?: number } = {},
): ComputedBookingPricing {
  const nights = nightsBetween(b.arrival, b.departure);
  const nightlyRate = Math.round(b.price / nights);
  const cleaningFee = DEFAULT_CLEANING_FEE;
  const totalAmount = b.price + cleaningFee;

  const otaCommission = b.commission ?? 0;
  const commissionRate = b.price > 0 ? otaCommission / b.price : 0;
  const hostComoCommission = Math.round(b.price * HOST_COMO_COMMISSION_RATE);

  const taxRate = opts.touristTaxRate ?? TOURIST_TAX_PER_ADULT_PER_NIGHT;
  const taxNights = Math.min(opts.maxTouristTaxNights ?? TOURIST_TAX_MAX_NIGHTS, nights);
  const touristTax = taxNights * b.numAdult * taxRate;

  const ownerPayout = b.price - otaCommission - hostComoCommission - touristTax;

  return {
    nightlyRate,
    cleaningFee,
    totalAmount,
    commissionRate,
    commissionAmount: otaCommission,
    ownerPayout,
    touristTax,
  };
}

// ── Beds24Property → PropertyDoc (subset recuperabile) ──

/**
 * Mappa una property Beds24 ai SOLI campi recuperabili da Beds24.
 * Volutamente NON tocca: slug, zone, type, amenities, details.has*, cin,
 * touristTaxRate, tags — sono campi extra owned dalla UI interna.
 */
export interface PropertySyncFields {
  name: string;
  beds24PropertyId: string;
  beds24RoomId?: string;
  description?: string;
  descriptionEn?: string;
  address: {
    street: string;
    city: string;
    province: string;
    zip: string;
    lat?: number;
    lng?: number;
  };
  details: {
    bedrooms: number;
    maxGuests: number;
  };
}

export function mapBeds24PropertyToSyncFields(
  p: Beds24Property | Beds24PropertyDetail,
): PropertySyncFields {
  const detail = p as Beds24PropertyDetail;
  const textsByLang = new Map<string, Beds24PropertyText>();
  for (const t of detail.texts ?? []) textsByLang.set(t.language.toLowerCase(), t);
  const it = textsByLang.get("it") ?? textsByLang.get("en");
  const en = textsByLang.get("en");

  const rooms = detail.roomsList ?? [];
  const maxGuests = rooms.reduce((sum, r) => sum + (r.maxGuests ?? 0), 0) || 2;
  const bedrooms = rooms.length || 1;
  const firstRoom = rooms[0];

  return {
    name: p.name,
    beds24PropertyId: String(p.id),
    beds24RoomId: firstRoom ? String(firstRoom.id) : undefined,
    description: it?.description,
    descriptionEn: en?.description,
    address: {
      street: p.address ?? "",
      city: p.city ?? "Como",
      province: "CO",
      zip: detail.postcode ?? "22100",
      lat: detail.latitude,
      lng: detail.longitude,
    },
    details: {
      bedrooms,
      maxGuests,
    },
  };
}

/**
 * Genera un PropertyDoc completo (per il caso "property nuova mai vista"):
 * applica i sync fields sopra i default sensati per i campi extra nostri.
 * Per property già esistenti usa direttamente mapBeds24PropertyToSyncFields
 * dentro un $set selettivo.
 */
export function newPropertyDocFromBeds24(
  p: Beds24Property | Beds24PropertyDetail,
  ownerId: ObjectId,
): PropertyDoc {
  const sync = mapBeds24PropertyToSyncFields(p);
  const now = new Date();
  return {
    _id: new ObjectId(),
    name: sync.name,
    slug: slugify(sync.name),
    ownerId,
    status: "active",
    type: "apartment",
    zone: "centro-como",
    description: sync.description ?? "",
    descriptionEn: sync.descriptionEn,
    address: sync.address,
    details: {
      bedrooms: sync.details.bedrooms,
      bathrooms: 1,
      maxGuests: sync.details.maxGuests,
    },
    amenities: [],
    images: [],
    pricing: {
      basePrice: 180,
      cleaningFee: DEFAULT_CLEANING_FEE,
      weekendMultiplier: 1.3,
    },
    beds24PropertyId: sync.beds24PropertyId,
    beds24RoomId: sync.beds24RoomId,
    touristTaxRate: TOURIST_TAX_PER_ADULT_PER_NIGHT,
    maxTouristTaxNights: TOURIST_TAX_MAX_NIGHTS,
    tags: ["source:beds24-sync"],
    createdAt: now,
    updatedAt: now,
  };
}

// ── Beds24Booking → BookingDoc (subset recuperabile) ──

/**
 * Campi che la sync ha il diritto di sovrascrivere su un booking esistente.
 * NON include: compliance (state nostro), notes, stripePaymentId, guestId.
 */
export interface BookingSyncFields {
  beds24Id: string;
  beds24LastSync: Date;
  propertyId: ObjectId;
  ownerId: ObjectId;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  status: BookingStatus;
  source: BookingSource;
  guestInfo: BookingDoc["guestInfo"];
  pricing: BookingDoc["pricing"];
}

export function mapBeds24BookingToSyncFields(
  b: Beds24Booking,
  ctx: {
    propertyId: ObjectId;
    ownerId: ObjectId;
    touristTaxRate?: number;
    maxTouristTaxNights?: number;
  },
): BookingSyncFields {
  const nights = nightsBetween(b.arrival, b.departure);
  const pricing = computeBookingPricing(b, {
    touristTaxRate: ctx.touristTaxRate,
    maxTouristTaxNights: ctx.maxTouristTaxNights,
  });

  return {
    beds24Id: String(b.id),
    beds24LastSync: new Date(),
    propertyId: ctx.propertyId,
    ownerId: ctx.ownerId,
    checkIn: new Date(b.arrival),
    checkOut: new Date(b.departure),
    nights,
    guests: b.numAdult + b.numChild,
    status: mapStatus(b.status),
    source: mapSource(b.referer),
    guestInfo: {
      name: `${b.guestFirstName ?? ""} ${b.guestName ?? ""}`.trim(),
      email: b.guestEmail ?? "",
      phone: b.guestPhone,
      nationality: b.guestCountry,
    },
    pricing,
  };
}

/**
 * Crea un BookingDoc completo per il primo insert (con default su compliance).
 */
export function newBookingDocFromBeds24(
  b: Beds24Booking,
  ctx: {
    propertyId: ObjectId;
    ownerId: ObjectId;
    touristTaxRate?: number;
    maxTouristTaxNights?: number;
  },
): BookingDoc {
  const sync = mapBeds24BookingToSyncFields(b, ctx);
  const created = b.bookingTime ? new Date(b.bookingTime) : new Date();
  return {
    _id: new ObjectId(),
    ...sync,
    compliance: {
      alloggiatiWebSubmitted: false,
      istatIncluded: false,
      touristTaxPaid: false,
    },
    createdAt: created,
    updatedAt: new Date(),
  };
}

// ── Beds24CalendarDay → CalendarDayDoc ──

export function mapBeds24CalendarToDoc(
  c: Beds24CalendarDay,
  ctx: { propertyId: ObjectId },
): Omit<CalendarDayDoc, "_id" | "createdAt"> {
  return {
    propertyId: ctx.propertyId,
    beds24PropertyId: String(c.propertyId),
    beds24RoomId: String(c.roomId),
    date: new Date(c.date),
    price: c.price,
    available: c.available,
    minStay: c.minStay,
    maxStay: c.maxStay,
    syncedAt: new Date(),
    updatedAt: new Date(),
  };
}

