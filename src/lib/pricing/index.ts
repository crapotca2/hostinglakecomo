// Pricing engine — public API.
//
// Uso tipico (lato API route o cron):
//
//   import { suggestPrice, loadSignals, getPropertyConfig } from "@/lib/pricing";
//
//   const config = await getPropertyConfig(propertyId);
//   const signals = await loadSignals(config, targetDate);
//   const decision = suggestPrice({ property: config, targetDate, guests, asOf: new Date(), signals });
//
// La separazione `loadSignals` ↔ `suggestPrice` è voluta:
//   - `loadSignals` fa I/O (Mongo, eventuale HTTP weather)
//   - `suggestPrice` è pure function (deterministica, testabile, AI-friendly)

export { suggestPrice } from "./engine";
export type {
  PricingContext,
  PricingDecision,
  PricingPropertyConfig,
  PricingSignals,
  BreakdownStep,
  StrategicRuleApplication,
} from "./types";
export { leadTimeDays } from "./modulators/lead-time";
export { DEFAULT_PROPERTY_CONFIG } from "./defaults";
export { loadSignals, getPropertyConfig } from "./loader";
