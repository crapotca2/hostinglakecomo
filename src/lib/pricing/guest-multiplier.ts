// Guest multiplier: formula richiesta dal product owner.
//   final = base + extra * max(0, guests - baseGuests)
//
// baseGuests = 2 (floor): final(1g) = final(2g) = base.
// guests > maxGuests → caller errore prima di arrivare qui.

import type { BreakdownStep, PricingPropertyConfig } from "./types";

export function applyGuestMultiplier(
  runningTotal: number,
  property: PricingPropertyConfig,
  guests: number,
): BreakdownStep | null {
  const extraGuests = Math.max(0, guests - property.baseGuests);
  if (extraGuests === 0) return null;
  const addend = extraGuests * property.extraPerGuest;
  const newTotal = runningTotal + addend;
  return {
    name: "guest-multiplier",
    type: "addend",
    value: addend,
    runningTotal: newTotal,
    reason: `+${extraGuests} ospite/i oltre ${property.baseGuests} (+€${addend.toFixed(0)})`,
  };
}
