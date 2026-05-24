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
  event: "webhook" | "polling" | "bootstrap" | "manual";
  type: "property" | "booking" | "calendar" | "auth" | string;
  beds24Id: string;
  localId?: ObjectId;
  status: "success" | "failed";
  payload: Record<string, unknown>;
  error?: string;
  durationMs?: number;
}

// ── CALENDAR (inventario per giorno/room) ──

export interface CalendarDayDoc extends BaseDoc {
  propertyId: ObjectId;
  beds24PropertyId: string;
  beds24RoomId: string;
  date: Date;
  price?: number;
  available: number;
  minStay?: number;
  maxStay?: number;
  syncedAt: Date;
}

// ── COMPETITOR INTEL (Airbnb scrape, market benchmarking) ──

export type CompetitorZone =
  | "argegno"
  | "cernobbio"
  | "bellagio"
  | "varenna"
  | "menaggio"
  | "tremezzo"
  | "como-centro"
  | "altro";

export interface CompetitorListingDoc extends BaseDoc {
  airbnbRoomId: string;
  zone: CompetitorZone;
  name: string;
  url: string;
  lat?: number;
  lng?: number;
  bedrooms?: number;
  bathrooms?: number;
  maxGuests?: number;
  amenities?: string[];
  isSuperhost?: boolean;
  firstSeenAt: Date;
  lastSeenAt: Date;
  isActive: boolean;
}

export interface CompetitorCalendarSnapshotDoc extends BaseDoc {
  competitorListingId: ObjectId;
  airbnbRoomId: string;
  date: Date;
  available: boolean;
  minNights?: number;
  maxNights?: number;
  scrapedAt: Date;
}

export interface CompetitorMonthlyStatsDoc extends BaseDoc {
  competitorListingId: ObjectId;
  airbnbRoomId: string;
  zone: CompetitorZone;
  monthKey: string;
  daysSeen: number;
  unavailableDays: number;
  occupancyRaw: number;
  occupancyCorrected: number;
  correctionFactor: number;
  computedAt: Date;
}

export interface CompetitorZoneStatsDoc extends BaseDoc {
  zone: CompetitorZone;
  monthKey: string;
  monthLabel: string;
  nCompetitorsCalendar: number;
  nListingsPriceSample?: number;
  occupancyMedian: number;
  occupancyP25: number;
  occupancyP75: number;
  occupancyRawMedian: number;
  adrMedian?: number;
  adrMeanClipped?: number;
  revpanMedian?: number;
  computedAt: Date;
}

// ── EVENTS (pricing modifier source) ──

export type EventCategory =
  | "luxury"          // Concorso d'Eleganza, Villa d'Este — moltiplicatore alto
  | "music"           // Bellagio Music Festival
  | "sport"           // Concorso nautico, regate
  | "cultural"        // Festa del Lago Bellagio, Festa di Sant'Abbondio
  | "trade-fair"      // Salone Nautico
  | "religious"       // Festa patronale
  | "season-bookend"  // Capodanno, Ferragosto
  | "other";

export interface EventDoc extends BaseDoc {
  name: string;
  category: EventCategory;
  startDate: Date;       // inclusiva
  endDate: Date;         // inclusiva
  // Geo anchor — il modificatore si applica solo a property entro radiusKm.
  // Se geo è null → applica a tutta la sponda Como (uso raro, solo nazionali).
  geo?: { lat: number; lng: number } | null;
  radiusKm?: number;
  // Modificatore moltiplicativo applicato a base_price.
  // 1.0 = neutro, 1.35 = +35%, 0.95 = -5%. Range raccomandato [0.85, 1.80].
  priceMultiplier: number;
  zones?: CompetitorZone[];      // opzionale: limit by zone
  source?: string;               // url o nota provenienza
  notes?: string;
  active: boolean;
}

// ── WEATHER FORECAST (short-term pricing modifier, <14gg) ──

export type WeatherBucket = "sunny" | "cloudy" | "rainy" | "stormy";

export interface WeatherForecastDoc extends BaseDoc {
  zone: CompetitorZone;
  date: Date;            // 1 doc per (zone, date)
  bucket: WeatherBucket;
  tempMaxC: number;
  tempMinC: number;
  precipMm: number;
  fetchedAt: Date;
  source: string;        // es. "openweathermap"
}

// ── PRICING RULES (overrides + per-property config) ──

export interface PricingRuleDoc extends BaseDoc {
  propertyId: ObjectId;
  // Floor del prezzo nudo (€/notte) per la coppia (2 ospiti baseline).
  // Tutto il pricing engine moltiplica/somma sopra questo.
  basePriceFloor: number;
  // Numero di ospiti incluso nel base_price (Lago Como default: 2).
  baseGuests: number;
  // Sovrapprezzo per ospite oltre baseGuests.
  extraPerGuest: number;
  // Override modulatori M1-M6 (es. per disabilitare meteo su una property).
  enabledModulators?: {
    season?: boolean;
    dayOfWeek?: boolean;
    competitorAnchor?: boolean;
    leadTime?: boolean;
    events?: boolean;
    weather?: boolean;
  };
  // Anchor target su competitor (es. 0.50 = mediana, 0.60 = p60 zona).
  competitorAnchorPercentile?: number;
  // Hard min stay (notti). Default applicato dall'engine: 3.
  hardMinStay?: number;
  // Counter-cyclical: massimo sconto applicabile quando zona alta e noi bassi.
  maxCounterCyclicalDiscount?: number;  // es. 0.15 = -15%
  active: boolean;
}

// ── PRICING DECISIONS (audit trail di ogni suggested price calcolato) ──

export interface PricingDecisionDoc extends BaseDoc {
  propertyId: ObjectId;
  targetDate: Date;        // notte oggetto del pricing
  guests: number;
  suggestedPrice: number;
  basePriceFloor: number;
  breakdown: {
    name: string;          // es. "season", "dow", "competitor-anchor"
    type: "multiplier" | "addend";
    value: number;         // multiplier es 1.6, addend es +40
    runningTotal: number;  // valore €/notte dopo applicare questo step
    reason: string;        // human-readable IT
  }[];
  appliedStrategicRules: {
    name: string;          // es. "counter-cyclical-discount", "last-minute-burn"
    delta: number;         // es. -25 (€/notte) o +10
    reason: string;
  }[];
  enforcedMinStay: number;
  signalsSnapshot: {
    competitorMedianADR?: number;
    competitorZoneOccupancy?: number;
    ourOccupancyForward30d?: number;
    leadTimeDays?: number;
    activeEventIds?: ObjectId[];
    weatherBucket?: WeatherBucket;
  };
  warnings: string[];
  computedAt: Date;
  // Quando l'owner approva/modifica il suggested price, qui registriamo
  // la sua scelta finale (per costruire dataset per future ML).
  ownerDecision?: {
    finalPrice: number;
    approvedAt: Date;
    overrideReason?: string;
  };
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
