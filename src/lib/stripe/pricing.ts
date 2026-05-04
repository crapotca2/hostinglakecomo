import type { PropertyDoc } from "@/types/database";

export interface BookingQuote {
  nights: number;
  nightlyRate: number;
  subtotal: number;
  cleaningFee: number;
  touristTax: number;
  totalAmount: number;
  totalCents: number;
}

export function computeQuote(
  property: PropertyDoc,
  checkIn: Date,
  checkOut: Date,
  guests: number
): BookingQuote {
  const msPerDay = 24 * 60 * 60 * 1000;
  const nights = Math.max(
    1,
    Math.round((checkOut.getTime() - checkIn.getTime()) / msPerDay)
  );

  let subtotal = 0;
  for (let i = 0; i < nights; i++) {
    const d = new Date(checkIn.getTime() + i * msPerDay);
    const dow = d.getDay();
    const isWeekend = dow === 5 || dow === 6;
    const rate = property.pricing.basePrice * (isWeekend ? property.pricing.weekendMultiplier : 1);
    subtotal += Math.round(rate);
  }

  const nightlyRate = Math.round(subtotal / nights);
  const cleaningFee = property.pricing.cleaningFee;
  const maxTaxNights = property.maxTouristTaxNights || 5;
  const taxRate = property.touristTaxRate || 0;
  const touristTax = Math.min(nights, maxTaxNights) * guests * taxRate;
  const totalAmount = subtotal + cleaningFee + touristTax;
  const totalCents = Math.round(totalAmount * 100);

  return {
    nights,
    nightlyRate,
    subtotal,
    cleaningFee,
    touristTax,
    totalAmount,
    totalCents,
  };
}
