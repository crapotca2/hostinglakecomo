import { ObjectId } from "mongodb";

export interface BaseDoc {
  _id?: ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

// ── USERS ──

export type UserRole = "admin" | "owner" | "guest";

export interface UserDoc extends BaseDoc {
  name: string;
  email: string;
  phone?: string;
  role: UserRole;
  image?: string;
  language?: "it" | "en" | "de" | "fr";
  stripeCustomerId?: string;
  stripeConnectedAccountId?: string;
  kycStatus?: "pending" | "verified" | "restricted";
}

// ── PROPERTIES ──

export type PropertyStatus = "active" | "draft" | "inactive";
export type PropertyType = "apartment" | "villa" | "room" | "house" | "studio";

export type PropertyZone =
  | "centro-como"
  | "primo-bacino"
  | "secondo-bacino"
  | "alto-lago"
  | "valle-intelvi"
  | "lecco"
  | "altro";

export interface PropertyDoc extends BaseDoc {
  name: string;
  slug: string;
  ownerId: ObjectId;
  status: PropertyStatus;
  type: PropertyType;
  zone: PropertyZone;
  description: string;
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
    bathrooms: number;
    maxGuests: number;
    sqMeters?: number;
    floor?: number;
    hasLakeView?: boolean;
    hasParking?: boolean;
    hasWifi?: boolean;
    hasAC?: boolean;
    hasGarden?: boolean;
    hasPool?: boolean;
  };
  amenities: string[];
  images: { url: string; alt?: string; order: number }[];
  pricing: {
    basePrice: number;
    cleaningFee: number;
    weekendMultiplier: number;
    seasonalRates?: {
      name: string;
      startDate: string;
      endDate: string;
      multiplier: number;
    }[];
  };
  cin?: string;
  channelManagerId?: string;
  tags?: string[];
  beds24PropertyId?: string;
  beds24RoomId?: string;
  touristTaxRate?: number;
  maxTouristTaxNights?: number;
}

// ── BOOKINGS ──

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "checked_in"
  | "checked_out"
  | "cancelled";

export type BookingSource =
  | "direct"
  | "airbnb"
  | "booking"
  | "vrbo"
  | "expedia"
  | "other";

export interface BookingDoc extends BaseDoc {
  propertyId: ObjectId;
  guestId?: ObjectId;
  ownerId: ObjectId;
  checkIn: Date;
  checkOut: Date;
  nights: number;
  guests: number;
  status: BookingStatus;
  source: BookingSource;
  guestInfo: {
    name: string;
    email: string;
    phone?: string;
    nationality?: string;
    documentType?: string;
    documentNumber?: string;
  };
  pricing: {
    nightlyRate: number;
    cleaningFee: number;
    totalAmount: number;
    commissionRate: number;
    commissionAmount: number;
    ownerPayout: number;
    touristTax: number;
  };
  stripePaymentId?: string;
  beds24Id?: string;
  beds24LastSync?: Date;
  compliance?: {
    alloggiatiWebSubmitted: boolean;
    alloggiatiWebDate?: Date;
    istatIncluded: boolean;
    touristTaxPaid: boolean;
  };
  notes?: string;
}

// ── SERVICES ──

export type ServiceCategory = "owner" | "guest";

export interface ServiceDoc extends BaseDoc {
  name: string;
  slug: string;
  category: ServiceCategory;
  description: string;
  icon: string;
  price?: number;
  priceType?: "fixed" | "per_night" | "per_person" | "quote";
  active: boolean;
  order: number;
}

// ── REVIEWS ──

export interface ReviewDoc extends BaseDoc {
  propertyId: ObjectId;
  bookingId: ObjectId;
  guestName: string;
  rating: number;
  comment: string;
  source: BookingSource;
  response?: string;
}

// ── HOLIDAYS ──

export type HolidayType = "national" | "regional" | "religious" | "observance";

export interface HolidayDoc extends BaseDoc {
  country: string;
  year: number;
  date: Date;
  name: string;
  nameLocal: string;
  type: HolidayType;
}

// ── PAYMENTS ──

export type PaymentType = "booking" | "deposit" | "service" | "refund";
export type PaymentStatus = "pending" | "succeeded" | "failed" | "refunded";

export interface PaymentDoc extends BaseDoc {
  type: PaymentType;
  bookingId?: ObjectId;
  stripePaymentIntentId: string;
  stripeSessionId?: string;
  amount: number;
  currency: string;
  status: PaymentStatus;
}

// ── PAYOUTS ──

export type PayoutStatus = "calculated" | "scheduled" | "paid" | "failed";

export interface PayoutDoc extends BaseDoc {
  ownerId: ObjectId;
  period: { from: Date; to: Date };
  grossRevenue: number;
  airbibbyCommission: number;
  expenses: number;
  netPayout: number;
  stripeTransferId?: string;
  status: PayoutStatus;
  bookingIds: ObjectId[];
}

// ── BEDS24 SYNC LOG ──

export interface Beds24SyncLogDoc extends BaseDoc {
  event: "webhook" | "polling";
  type: string;
  beds24Id: string;
  localId?: ObjectId;
  status: "success" | "failed";
  payload: Record<string, unknown>;
  error?: string;
}

// ── COMPLIANCE RECORDS ──

export type ComplianceType = "alloggiati_web" | "istat" | "tassa_soggiorno";
export type ComplianceStatus = "draft" | "submitted" | "confirmed";

export interface ComplianceRecordDoc extends BaseDoc {
  type: ComplianceType;
  propertyId: ObjectId;
  period: { from: Date; to: Date };
  generatedAt: Date;
  status: ComplianceStatus;
  exportFormat: "csv" | "txt" | "pdf";
  fileUrl?: string;
  bookingIds: ObjectId[];
}
