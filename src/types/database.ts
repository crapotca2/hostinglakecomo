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
  /** Hash bcrypt della password per il login proprietari (email + password). */
  passwordHash?: string;
  /** Codice fiscale del proprietario (per le note spese intestate a lui). */
  fiscalCode?: string;
  image?: string;
  language?: "it" | "en" | "de" | "fr";
  stripeCustomerId?: string;
  stripeConnectedAccountId?: string;
  kycStatus?: "pending" | "verified" | "restricted";
}

// Codice OTP passwordless per il login owner. Un solo codice attivo per email
// (upsert). codeHash = sha256(codice:email); scadenza breve + attempts cap;
// one-time (cancellato dopo l'uso).
export interface OtpCodeDoc extends BaseDoc {
  email: string;
  codeHash: string;
  expiresAt: Date;
  attempts: number;
}

// ── PARTNER ADJUSTMENTS (rettifiche manuali payout soci) ──

/** Una rettifica manuale del payout di un socio in un periodo. `favore` si
 *  aggiunge al dovuto, `acconto` (contante del proprietario incassato in loco)
 *  si sottrae. Importo sempre positivo; il segno lo dà `kind`. */
export interface PartnerAdjustmentEntry {
  period: string; // "YYYY-MM" (ciclo 25→25) del payout a cui appartiene (per cassa)
  kind: "favore" | "acconto";
  partner: "angelo" | "andrei";
  amount: number; // sempre positivo
  note?: string; // es. nome ospite o descrizione ("check-in amici di Alessandro")
}

/** Rettifiche manuali per il payout interno dei soci Host Como (una per owner).
 *  Contiene i dati NON ricavabili dalle prenotazioni: favori una tantum e acconti
 *  incassati in loco, imputati per cassa al periodo di regolazione. */
export interface PartnerAdjustmentsDoc extends BaseDoc {
  ownerId: ObjectId;
  entries: PartnerAdjustmentEntry[];
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
  /** Aliquota commissione Host Como sui ricavi alloggio (varia per immobile, es. 0.15). */
  managementFeeRate?: number;
  /** Se false, la Nota spese dei soci NON aggiunge la rivalsa INPS 4% (default: true). */
  inpsRivalsa?: boolean;
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
    /** Ricavi alloggio (ex pulizie). Se assente = totalAmount − cleaningFee. */
    roomRevenue?: number;
    /** Cedolare secca 21% trattenuta dall'OTA. Se assente = 21% × totalAmount. */
    cedolare?: number;
    /** Notte extra diretta (fuori OTA). */
    extraNight?: number;
    /** Parcheggio incassato (partita 50/50). */
    parking?: number;
    /** Aliquota commissione Host Como denormalizzata sulla prenotazione. */
    managementFeeRate?: number;
  };
  /** Stato d'incasso della tassa di soggiorno (default: collected). */
  touristTaxStatus?: "collected" | "pending" | "uncollected";
  /** true = questo record è la CONTINUAZIONE fisica di un altro soggiorno (es.
   *  notte extra diretta agganciata a una prenotazione OTA): stesse persone, NON
   *  un nuovo arrivo. Conta le presenze ma è escluso dagli ARRIVI ISTAT/ROSS. */
  istatContinuation?: boolean;
  /** Provenienza per singolo ospite (per ISTAT/ROSS con gruppi misti).
   *  Se assente si usa guestInfo.nationality × guests. La somma dei count
   *  dovrebbe corrispondere a `guests`. */
  guestOrigins?: { code: string; count: number }[];
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

// ──────────────────────────────────────────────────────────────────────
// WELCOME BOOK + HOUSE GUIDE — guida ospiti + manuale operativo casa
// ──────────────────────────────────────────────────────────────────────
// Schema portato da host-como-agentic-web. Stesso shape dei documenti
// MongoDB per riutilizzo degli script di seed. createdAt/updatedAt sono
// ISO string (non Date) — è come il welcome book scrive nei doc.

export type SupportedLocale = "it" | "en" | "ru" | "de" | "pl" | "es" | "fr";
export const SUPPORTED_LOCALES: SupportedLocale[] = ["it", "en", "ru", "de", "pl", "es", "fr"];

export type LocalizedText = {
  it: string;
  en: string;
  ru: string;
  de: string;
  pl?: string;
  es?: string;
  fr?: string;
};
export type LocalizedTextOptional = Partial<Record<SupportedLocale, string>>;

export interface WelcomeBookPOI {
  name: string;
  type:
    | "bar"
    | "restaurant"
    | "supermarket"
    | "pharmacy"
    | "atm"
    | "post"
    | "newsstand"
    | "bakery"
    | "boat-rental"
    | "bike-rental"
    | "outdoor-activity"
    | "ferry-stop"
    | "bus-stop"
    | "funicular";
  address: string;
  coordinates?: { lat: number; lng: number };
  distanceMeters?: number;
  walkMinutes?: number;
  brandLogo?: string;
  directionsUrl?: string;
  phone?: string;
  whatsapp?: string;
  website?: string;
  hours?: {
    monday?: string;
    tuesday?: string;
    wednesday?: string;
    thursday?: string;
    friday?: string;
    saturday?: string;
    sunday?: string;
    notes?: LocalizedTextOptional;
  };
  notes?: LocalizedTextOptional;
  googleMapsUrl?: string;
  photoUrl?: string;
}

export interface WelcomeBookRestaurant extends WelcomeBookPOI {
  type: "restaurant";
  priceRange: "€" | "€€" | "€€€" | "€€€€";
  cuisine?: string[];
  tripadvisorRating?: number;
  tripadvisorReviewCount?: number;
  tripadvisorUrl?: string;
  signatureDishes?: LocalizedTextOptional[];
  bookingRecommended?: boolean;
  reservationPhone?: string;
}

export interface WelcomeBookContact {
  name: string;
  category: string;
  brandLogo?: string;
  heroImage?: string;
  isTopChoice?: boolean;
  phone?: string;
  whatsapp?: string;
  email?: string;
  website?: string;
  address?: string;
  notes?: LocalizedTextOptional;
}

export interface WelcomeBookDestination {
  name: string;
  type: "city" | "village" | "villa" | "natural" | "experience";
  description: LocalizedText;
  travelOptions: Array<{
    mode: "ferry" | "car" | "bus" | "walking" | "bike" | "funicular";
    durationMinutes: number;
    cost?: string;
    notes?: LocalizedTextOptional;
  }>;
  bestTime?: LocalizedTextOptional;
  highlights?: LocalizedText[];
  coordinates?: { lat: number; lng: number };
  address?: string;
  googleMapsUrl?: string;
  directionsUrl?: string;
  officialUrl?: string;
  photoUrl?: string;
  isFeatured?: boolean;
}

export interface ParkingSpot {
  name: string;
  type: "free" | "paid-blue-stripe" | "paid-private" | "garage";
  address: string;
  coordinates?: { lat: number; lng: number };
  distanceMeters?: number;
  walkMinutes?: number;
  pricing?: LocalizedTextOptional;
  hours?: LocalizedTextOptional;
  notes?: LocalizedTextOptional;
  googleMapsUrl?: string;
  hasEvCharging?: boolean;
}

export interface EvChargingStation {
  stationName: string;
  operator?: string;
  address: string;
  city: string;
  coordinates?: { lat: number; lng: number };
  distanceFromPropertyKm?: number;
  driveMinutesFromProperty?: number;
  connectors?: Array<{
    type: string;
    powerKw: number;
    pricePerKwhEur?: number;
  }>;
  accessHours?: LocalizedTextOptional;
  notes?: LocalizedTextOptional;
  googleMapsUrl?: string;
  appUrl?: string;
}

export interface ParkingAndCharging {
  localParking: ParkingSpot[];
  evChargingStations: EvChargingStation[];
  generalInfo: LocalizedText;
}

export interface PharmacyShift {
  pharmacyName: string;
  address: string;
  phone?: string;
  shiftStart: string;
  shiftEnd: string;
  shiftType: "diurno" | "notturno" | "h24" | "festivo";
  coordinates?: { lat: number; lng: number };
  googleMapsUrl?: string;
  distanceFromPropertyKm?: number;
}

export interface WelcomeBookTransport {
  ferry?: {
    pontileName: string;
    pontileAddress: string;
    walkMinutesFromHouse?: number;
    operator?: string;
    operatorUrl?: string;
    seasonalSchedule?: {
      highSeason?: LocalizedTextOptional;
      lowSeason?: LocalizedTextOptional;
    };
    keyDestinations?: Array<{
      name: string;
      minutes: number;
      priceAdultEur?: number;
      frequencyNotes?: LocalizedTextOptional;
    }>;
  };
  bus?: {
    stopName: string;
    stopAddress: string;
    walkMinutesFromHouse?: number;
    operator?: string;
    operatorUrl?: string;
    line?: string;
    frequency?: LocalizedTextOptional;
    keyDestinations?: Array<{
      name: string;
      minutes: number;
      priceAdultEur?: number;
    }>;
  };
  train?: {
    stationName: string;
    stationAddress: string;
    walkMinutesFromHouse?: number;
    operator?: string;
    operatorUrl?: string;
    line?: string;
    frequency?: LocalizedTextOptional;
    keyDestinations?: Array<{
      name: string;
      minutes: number;
      priceAdultEur?: number;
    }>;
  };
  funicular?: {
    name: string;
    address: string;
    walkMinutesFromHouse?: number;
    operatorUrl?: string;
    operatingMonths?: string;
    schedule?: LocalizedTextOptional;
    priceRoundTripEur?: number;
    notes?: LocalizedTextOptional;
  };
  taxi?: WelcomeBookContact[];
  parking?: {
    private?: LocalizedTextOptional;
    publicPaid?: Array<{
      name: string;
      address: string;
      hourlyRateEur?: number;
      notes?: LocalizedTextOptional;
    }>;
    freeAreas?: Array<{
      name: string;
      notes?: LocalizedTextOptional;
    }>;
  };
}

export interface LocalStory {
  title: LocalizedText;
  body: LocalizedText;
  icon?: string;
  source?: string;
}

export interface WelcomeBookSections {
  welcome: LocalizedText;
  walkable: WelcomeBookPOI[];
  transport: WelcomeBookTransport;
  parkingAndCharging?: ParkingAndCharging;
  shopping: WelcomeBookPOI[];
  atmBanking?: WelcomeBookPOI[];
  boatRentals: WelcomeBookContact[];
  boatTours?: WelcomeBookContact[];
  bikeRentals: WelcomeBookContact[];
  dayTrips: WelcomeBookDestination[];
  drivingTrips: WelcomeBookDestination[];
  activeOutdoor: WelcomeBookPOI[];
  eatingDrinking: WelcomeBookRestaurant[];
  emergencyPharmacies: PharmacyShift[];
  emergencies: WelcomeBookContact[];
  waste: LocalizedText;
  localStories?: LocalStory[];
}

export interface WelcomeBookDoc {
  _id?: ObjectId | string;
  propertySlug: string;
  version: number;
  status: "draft" | "published";
  publishedAt?: string;
  sections: WelcomeBookSections;
  qrPayloads?: {
    mainGuide?: string;
    houseGuide?: string;
    hostContact?: string;
  };
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}

// ── HOUSE GUIDE ──

export interface HouseGuideAppliance {
  name: LocalizedText;
  instructions: LocalizedText;
  manualUrl?: string;
  brand?: string;
}

export interface HouseGuideBedroom {
  name: LocalizedText;
  surfaceSqm?: number;
  bedType: string;
  view?: LocalizedTextOptional;
  bathroomAttached?: boolean;
  amenities?: LocalizedText[];
}

export interface HouseGuideBathroom {
  name: LocalizedText;
  features: string[];
  notes?: LocalizedTextOptional;
}

export type HouseGuidePhotos = Partial<Record<string, string[]>>;

export interface HouseGuideSections {
  welcome: LocalizedText;
  photos?: HouseGuidePhotos;
  wifi: {
    ssid: string;
    password: string;
    qrPayload?: string;
    notes?: LocalizedTextOptional;
    routerLocation?: LocalizedTextOptional;
  };
  bedrooms: HouseGuideBedroom[];
  livingRoom: LocalizedText;
  diningArea?: LocalizedText;
  diningArea_chips?: Array<{ icon?: "utensils" | "baby" | "ruler"; label: LocalizedText }>;
  kitchen: {
    description: LocalizedText;
    appliances: HouseGuideAppliance[];
    historicElements?: LocalizedTextOptional;
  };
  bathrooms: HouseGuideBathroom[];
  outdoor: {
    courtyard: LocalizedText;
    beach?: LocalizedText;
    safety?: LocalizedText;
  };
  parking: {
    description: LocalizedText;
    liftInstructions?: LocalizedText;
    maxDimensions?: {
      heightM: number;
      lengthM: number;
      widthM: number;
      wheelStopLengthM?: number;
    };
    evChargingAllowed: boolean;
    /**
     * Whether the property has its own reserved/private parking spot. Defaults
     * to true (back-compat with Aqua Vista). When false, the Parking tab hides
     * the private-spot card and presents the nearby public paid parking as the
     * main option (e.g. city-centre apartments with no on-site parking).
     */
    hasPrivateSpot?: boolean;
  };
  climate: {
    ac?: LocalizedText;
    heating?: LocalizedText;
  };
  waste: LocalizedText;
  babyEquipment?: LocalizedText;
  ringCameraDisclosure?: LocalizedText;
  rules: LocalizedText;
  touristTax: {
    eurPerPersonPerNight: number;
    classification?: string;
    exemptions?: LocalizedText;
    paymentMethod?: LocalizedText;
    maxConsecutiveNights?: number;
    seasonPeriod?: LocalizedTextOptional;
  };
  emergencies: WelcomeBookContact[];
  checkin?: LocalizedText;
  checkout: LocalizedText;
  feedback?: LocalizedText;
  legal: {
    cin: string;
    cir?: string;
  };
}

export interface HouseGuideDoc {
  _id?: ObjectId | string;
  propertySlug: string;
  version: number;
  status: "draft" | "published";
  publishedAt?: string;
  hero: {
    tagline: LocalizedText;
    spaceDescription: LocalizedText;
  };
  sections: HouseGuideSections;
  qrPayloads?: {
    wifi?: string;
    welcomeBookLink?: string;
    hostContact?: string;
  };
  generatedAt: string;
  createdAt: string;
  updatedAt: string;
}
