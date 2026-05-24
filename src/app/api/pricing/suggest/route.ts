// GET /api/pricing/suggest
//
// Query params:
//   propertyId  — required, ObjectId di PropertyDoc (o slug, vedi sotto)
//   date        — required, YYYY-MM-DD (notte oggetto del pricing)
//   guests      — optional, default = property.maxGuests
//   persist     — optional ("true" | "false"), default false. Se true salva
//                 PricingDecisionDoc in mongo per audit trail.
//
// Auth: richiede sessione (owner/admin via NextAuth).

import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireSession } from "@/lib/security/require-session";
import { collections } from "@/lib/mongodb/collections";
import { getPropertyConfig, loadSignals, suggestPrice } from "@/lib/pricing";
import type { PricingDecisionDoc, PropertyDoc } from "@/types/database";

function parseDate(s: string | null): Date | null {
  if (!s) return null;
  // Format YYYY-MM-DD, treat as UTC midnight to avoid TZ surprises
  const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(s);
  if (!m) return null;
  const d = new Date(
    Number(m[1]),
    Number(m[2]) - 1,
    Number(m[3]),
  );
  return Number.isFinite(d.getTime()) ? d : null;
}

async function resolvePropertyId(idOrSlug: string): Promise<string | null> {
  // Try as ObjectId first
  try {
    const oid = new ObjectId(idOrSlug);
    return oid.toString();
  } catch {
    // not an ObjectId, try slug lookup
  }
  const propsCol = await collections.properties();
  const byProp = (await propsCol.findOne({ slug: idOrSlug })) as
    | PropertyDoc
    | null;
  if (byProp?._id) return byProp._id.toString();
  return null;
}

export async function GET(request: Request) {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;

  const url = new URL(request.url);
  const propertyIdOrSlug = url.searchParams.get("propertyId");
  const dateStr = url.searchParams.get("date");
  const guestsStr = url.searchParams.get("guests");
  const persist = url.searchParams.get("persist") === "true";

  if (!propertyIdOrSlug) {
    return NextResponse.json(
      { error: "missing propertyId" },
      { status: 400 },
    );
  }
  const targetDate = parseDate(dateStr);
  if (!targetDate) {
    return NextResponse.json(
      { error: "missing/invalid date (YYYY-MM-DD)" },
      { status: 400 },
    );
  }

  const propertyId = await resolvePropertyId(propertyIdOrSlug);
  if (!propertyId) {
    return NextResponse.json({ error: "property not found" }, { status: 404 });
  }

  const config = await getPropertyConfig(propertyId);
  if (!config) {
    return NextResponse.json({ error: "config not loadable" }, { status: 404 });
  }

  const guests = guestsStr ? Math.max(1, parseInt(guestsStr, 10)) : config.maxGuests;

  const signals = await loadSignals(config, targetDate);

  const decision = suggestPrice({
    property: config,
    targetDate,
    guests,
    asOf: new Date(),
    signals,
  });

  // Persist (opzionale) per audit trail / future ML training
  if (persist) {
    try {
      const decCol = await collections.pricingDecisions();
      const doc: Omit<PricingDecisionDoc, "_id"> = {
        propertyId: new ObjectId(propertyId),
        targetDate: decision.targetDate,
        guests: decision.guests,
        suggestedPrice: decision.suggestedPrice,
        basePriceFloor: decision.basePriceFloor,
        breakdown: decision.breakdown,
        appliedStrategicRules: decision.appliedStrategicRules,
        enforcedMinStay: decision.enforcedMinStay,
        signalsSnapshot: {
          competitorMedianADR: decision.signalsSnapshot.competitorMedianADR,
          competitorZoneOccupancy:
            decision.signalsSnapshot.competitorZoneOccupancy,
          ourOccupancyForward30d:
            decision.signalsSnapshot.ourOccupancyForward30d,
          leadTimeDays: decision.signalsSnapshot.leadTimeDays,
          activeEventIds: signals.activeEvents
            .map((e) => e._id)
            .filter((id): id is ObjectId => id != null),
          weatherBucket: decision.signalsSnapshot.weatherBucket,
        },
        warnings: decision.warnings,
        computedAt: decision.computedAt,
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      await decCol.insertOne(doc as PricingDecisionDoc);
    } catch (err) {
      // non bloccare la risposta su errore audit
      decision.warnings.push(
        `audit persist failed: ${err instanceof Error ? err.message : String(err)}`,
      );
    }
  }

  return NextResponse.json(decision);
}
