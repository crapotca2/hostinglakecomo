import type { PropertyType, PropertyZone } from "@/types/database";
import portfolioJson from "@/data/properties.json";

export interface PortfolioImage {
  url: string;
  alt?: string;
  order: number;
  room?: string;
}

export interface PortfolioSections {
  space?: string;
  neighborhood?: string;
  gettingAround?: string;
  directions?: string;
  guestAccess?: string;
  services?: string;
  overview?: string;
}

export interface PortfolioExtra {
  title: string;
  content: string;
}

export interface PortfolioFacts {
  floor?: string;
  checkInHours?: string;
  checkOutHours?: string;
  touristTaxNote?: string;
  parkingNote?: string;
  petsNote?: string;
  smokingNote?: string;
  hasWashingMachine?: boolean;
  hasElevator?: boolean;
}

export interface PortfolioGeo {
  lat: number;
  lng: number;
  displayName?: string;
}

export interface PortfolioPoi {
  name: string;
  subtype: string;
  distance: number;
}

export interface PortfolioNearby {
  food: PortfolioPoi[];
  transport: PortfolioPoi[];
  shop: PortfolioPoi[];
  attraction: PortfolioPoi[];
}

export interface PortfolioDistances {
  comoDuomo?: number;
  piazzaCavour?: number;
  bellagio?: number;
  varenna?: number;
  menaggio?: number;
  cernobbio?: number;
  nearestFood?: number | null;
  nearestTransport?: number | null;
  nearestShop?: number | null;
  nearestAttraction?: number | null;
}

export interface PortfolioAirbnbMatch {
  id: string;
  url: string;
  title?: string | null;
  description?: string | null;
  rating?: number | null;
  reviewCount?: number | null;
  personCapacity?: number | null;
  bedrooms?: number | null;
  bathrooms?: number | null;
  nightlyPrice?: number | null;
  distanceFromOurGeo?: number;
  confidence: "high" | "medium" | "low";
}

export interface PortfolioAirbnbMarket {
  sampleSize: number;
  avgNightlyPrice?: number | null;
  minNightlyPrice?: number | null;
  maxNightlyPrice?: number | null;
  avgRating?: number | null;
}

export interface PortfolioAirbnb {
  bestMatch: PortfolioAirbnbMatch;
  marketContext: PortfolioAirbnbMarket;
  images: PortfolioImage[];
  enrichedAt: string;
}

export interface PortfolioAirbnbListing {
  id: string;
  url: string;
  rating?: number | null;
  reviewCount?: number | null;
  lovedByGuests?: boolean;
  categoryRatings?: {
    cleanliness?: number;
    accuracy?: number;
    checkIn?: number;
    communication?: number;
    location?: number;
    value?: number;
  };
}

export interface PortfolioEntry {
  slug: string;
  name: string;
  type: PropertyType;
  zone: PropertyZone;
  description: string;
  descriptionLong?: string;
  sections?: PortfolioSections;
  extras?: PortfolioExtra[];
  facts?: PortfolioFacts;
  geo?: PortfolioGeo;
  nearby?: PortfolioNearby;
  distances?: PortfolioDistances;
  enrichedAt?: string;
  airbnb?: PortfolioAirbnb;
  airbnbListing?: PortfolioAirbnbListing;
  address: {
    street: string;
    city: string;
    province: string;
    zip: string;
  };
  details: {
    bedrooms: number;
    bathrooms: number;
    maxGuests: number;
    hasLakeView?: boolean;
    hasWifi?: boolean;
    hasAC?: boolean;
    hasParking?: boolean;
    hasGarden?: boolean;
    hasPool?: boolean;
  };
  amenities: string[];
  images: PortfolioImage[];
  pricing: {
    basePrice: number;
    cleaningFee: number;
    weekendMultiplier: number;
  };
  touristTaxRate?: number;
  maxTouristTaxNights?: number;
  source?: {
    origin: string;
    url: string;
    scrapedAt: string;
  };
}

const PORTFOLIO: PortfolioEntry[] = portfolioJson as PortfolioEntry[];

const ZONE_LABELS: Record<PropertyZone, string> = {
  "centro-como": "Centro Como",
  "primo-bacino": "Primo Bacino",
  "secondo-bacino": "Secondo Bacino",
  "alto-lago": "Alto Lago",
  "valle-intelvi": "Valle Intelvi",
  lecco: "Lecco",
  altro: "Altro",
};

const TYPE_LABELS: Record<PropertyType, string> = {
  apartment: "Appartamento",
  villa: "Villa",
  studio: "Studio",
  house: "Casa",
  room: "Camera",
};

export function getPortfolio(): PortfolioEntry[] {
  return PORTFOLIO;
}

export function getPortfolioEntry(slug: string): PortfolioEntry | undefined {
  return PORTFOLIO.find((p) => p.slug === slug);
}

export function getZoneLabel(zone: PropertyZone): string {
  return ZONE_LABELS[zone] ?? zone;
}

export function getTypeLabel(type: PropertyType): string {
  return TYPE_LABELS[type] ?? type;
}

export function getPortfolioId(slug: string): string {
  return `cl_${slug.replace(/[^a-z0-9]+/gi, "_").toLowerCase()}`;
}
