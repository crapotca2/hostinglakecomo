// Default config per property che NON hanno ancora un PricingRuleDoc in DB.
// Usato come fallback dal loader.

import type { PricingPropertyConfig } from "./types";

export const DEFAULT_PROPERTY_CONFIG: Omit<
  PricingPropertyConfig,
  "propertyId" | "zone" | "bedrooms" | "maxGuests" | "hasLakeView" | "coordinates"
> = {
  basePriceFloor: 140,                  // partenza neutra
  baseGuests: 2,                        // decisione di prodotto: floor a 2
  extraPerGuest: 25,                    // +€25/ospite oltre la coppia
  competitorAnchorPercentile: 0.55,     // leggermente premium sulla mediana
  hardMinStay: 3,                       // decisione di prodotto: hard min 3
  maxCounterCyclicalDiscount: 0.15,     // sconto massimo -15%
  enabledModulators: {
    season: true,
    dayOfWeek: true,
    competitorAnchor: true,
    leadTime: true,
    events: true,
    weather: false,                     // off di default: serve fetch live
  },
};
