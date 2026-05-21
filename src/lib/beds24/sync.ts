import { ObjectId } from "mongodb";
import { beds24Client } from "./client";
import {
  mapBeds24BookingToSyncFields,
  mapBeds24CalendarToDoc,
  mapBeds24PropertyToSyncFields,
  newBookingDocFromBeds24,
  newPropertyDocFromBeds24,
} from "./mappers";
import { collections } from "@/lib/mongodb/collections";
import type { Beds24SyncLogDoc } from "@/types/database";

const DEFAULT_OWNER_ID = new ObjectId("000000000000000000000001");

export interface SyncResult {
  inserted: number;
  updated: number;
  skipped: number;
  errors: number;
  durationMs: number;
}

type SyncEvent = Beds24SyncLogDoc["event"];

async function logSync(
  event: SyncEvent,
  type: Beds24SyncLogDoc["type"],
  beds24Id: string,
  status: "success" | "failed",
  payload: Record<string, unknown>,
  opts: { localId?: ObjectId; error?: string; durationMs?: number } = {},
): Promise<void> {
  const logCol = await collections.beds24SyncLog();
  const now = new Date();
  await logCol.insertOne({
    event,
    type,
    beds24Id,
    localId: opts.localId,
    status,
    payload,
    error: opts.error,
    durationMs: opts.durationMs,
    createdAt: now,
    updatedAt: now,
  });
}

async function getOwnerId(): Promise<ObjectId> {
  const usersCol = await collections.users();
  const adminEmail = process.env.ADMIN_EMAIL ?? "actopark@gmail.com";
  const user = await usersCol.findOne({ email: adminEmail });
  if (user?._id) return user._id;
  return DEFAULT_OWNER_ID;
}

// ── Properties ──

export async function syncProperties(
  event: SyncEvent = "manual",
): Promise<SyncResult> {
  const start = Date.now();
  const ownerId = await getOwnerId();
  const propsCol = await collections.properties();

  let inserted = 0;
  let updated = 0;
  let errors = 0;
  const skipped = 0;

  const properties = await beds24Client.getProperties();

  for (const p of properties) {
    const beds24Id = String(p.id);
    const t0 = Date.now();
    try {
      const existing = await propsCol.findOne({ beds24PropertyId: beds24Id });
      if (existing) {
        const sync = mapBeds24PropertyToSyncFields(p);
        await propsCol.updateOne(
          { _id: existing._id! },
          {
            $set: {
              name: sync.name,
              "address.street": sync.address.street,
              "address.city": sync.address.city,
              "address.zip": sync.address.zip,
              "address.lat": sync.address.lat,
              "address.lng": sync.address.lng,
              ...(sync.description && { description: sync.description }),
              ...(sync.descriptionEn && { descriptionEn: sync.descriptionEn }),
              "details.bedrooms": sync.details.bedrooms,
              "details.maxGuests": sync.details.maxGuests,
              beds24RoomId: sync.beds24RoomId ?? existing.beds24RoomId,
              updatedAt: new Date(),
            },
          },
        );
        updated++;
        await logSync("polling", "property", beds24Id, "success", { name: p.name }, {
          localId: existing._id ?? undefined,
          durationMs: Date.now() - t0,
        });
      } else {
        const doc = newPropertyDocFromBeds24(p, ownerId);
        // Slug uniqueness pass: append id suffix if collision
        const slugExists = await propsCol.findOne({ slug: doc.slug });
        if (slugExists) doc.slug = `${doc.slug}-${beds24Id}`;
        await propsCol.insertOne(doc);
        inserted++;
        await logSync(event, "property", beds24Id, "success", { name: p.name, action: "insert" }, {
          localId: doc._id,
          durationMs: Date.now() - t0,
        });
      }
    } catch (err) {
      errors++;
      const msg = err instanceof Error ? err.message : String(err);
      await logSync(event, "property", beds24Id, "failed", { name: p.name }, {
        error: msg,
        durationMs: Date.now() - t0,
      });
    }
  }

  return { inserted, updated, skipped, errors, durationMs: Date.now() - start };
}

// ── Bookings ──

async function findLocalPropertyId(beds24PropertyId: string): Promise<ObjectId | null> {
  const propsCol = await collections.properties();
  const prop = await propsCol.findOne({ beds24PropertyId });
  return prop?._id ?? null;
}

export async function syncBookings(
  opts: { since?: Date; event?: SyncEvent } = {},
): Promise<SyncResult> {
  const start = Date.now();
  const event = opts.event ?? "polling";
  const ownerId = await getOwnerId();
  const bookingsCol = await collections.bookings();
  const propsCol = await collections.properties();

  let inserted = 0;
  let updated = 0;
  let skipped = 0;
  let errors = 0;

  const filters: { modifiedSince?: string } = {};
  if (opts.since) filters.modifiedSince = opts.since.toISOString();

  const bookings = await beds24Client.getBookings(filters);

  for (const b of bookings) {
    const beds24Id = String(b.id);
    const t0 = Date.now();
    try {
      const propertyId = await findLocalPropertyId(String(b.propertyId));
      if (!propertyId) {
        skipped++;
        await logSync(event, "booking", beds24Id, "failed", { propertyBeds24Id: b.propertyId }, {
          error: "no local property matches beds24PropertyId",
          durationMs: Date.now() - t0,
        });
        continue;
      }

      const property = await propsCol.findOne({ _id: propertyId });
      const taxOpts = {
        touristTaxRate: property?.touristTaxRate,
        maxTouristTaxNights: property?.maxTouristTaxNights,
      };

      const existing = await bookingsCol.findOne({ beds24Id });
      if (existing) {
        const sync = mapBeds24BookingToSyncFields(b, {
          propertyId,
          ownerId,
          ...taxOpts,
        });
        await bookingsCol.updateOne(
          { _id: existing._id! },
          {
            $set: {
              checkIn: sync.checkIn,
              checkOut: sync.checkOut,
              nights: sync.nights,
              guests: sync.guests,
              status: sync.status,
              source: sync.source,
              guestInfo: sync.guestInfo,
              pricing: sync.pricing,
              beds24LastSync: sync.beds24LastSync,
              updatedAt: new Date(),
            },
          },
        );
        updated++;
        await logSync(event, "booking", beds24Id, "success", { action: "update" }, {
          localId: existing._id ?? undefined,
          durationMs: Date.now() - t0,
        });
      } else {
        const doc = newBookingDocFromBeds24(b, { propertyId, ownerId, ...taxOpts });
        await bookingsCol.insertOne(doc);
        inserted++;
        await logSync(event, "booking", beds24Id, "success", { action: "insert" }, {
          localId: doc._id,
          durationMs: Date.now() - t0,
        });
      }
    } catch (err) {
      errors++;
      const msg = err instanceof Error ? err.message : String(err);
      await logSync(event, "booking", beds24Id, "failed", {}, {
        error: msg,
        durationMs: Date.now() - t0,
      });
    }
  }

  return { inserted, updated, skipped, errors, durationMs: Date.now() - start };
}

/**
 * Sync di un singolo booking (webhook handler).
 * Beds24 webhook ci dà bookingId — peschiamo il record completo via API.
 */
export async function syncBookingById(
  beds24BookingId: string,
  event: SyncEvent = "webhook",
): Promise<{ status: "ok" | "skipped" | "failed"; error?: string }> {
  const t0 = Date.now();
  try {
    const bookings = await beds24Client.getBookings({});
    const target = bookings.find((b) => String(b.id) === String(beds24BookingId));
    if (!target) {
      await logSync(event, "booking", beds24BookingId, "failed", {}, {
        error: "booking not found in Beds24 response",
        durationMs: Date.now() - t0,
      });
      return { status: "failed", error: "not found" };
    }
    const result = await syncBookings({ event });
    return { status: result.errors > 0 ? "failed" : "ok" };
  } catch (err) {
    const msg = err instanceof Error ? err.message : String(err);
    await logSync(event, "booking", beds24BookingId, "failed", {}, {
      error: msg,
      durationMs: Date.now() - t0,
    });
    return { status: "failed", error: msg };
  }
}

// ── Calendar ──

export async function syncCalendar(opts: {
  propertyId?: ObjectId;
  from: Date;
  to: Date;
  event?: SyncEvent;
}): Promise<SyncResult> {
  const start = Date.now();
  const event = opts.event ?? "polling";
  const propsCol = await collections.properties();
  const calCol = await collections.calendar();

  const propertiesQuery = opts.propertyId
    ? { _id: opts.propertyId }
    : { beds24PropertyId: { $exists: true } };
  const properties = await propsCol.find(propertiesQuery).toArray();

  const fromStr = opts.from.toISOString().slice(0, 10);
  const toStr = opts.to.toISOString().slice(0, 10);

  let inserted = 0;
  let updated = 0;
  let errors = 0;
  const skipped = 0;

  for (const property of properties) {
    if (!property.beds24PropertyId) continue;
    const t0 = Date.now();
    try {
      const days = await beds24Client.getCalendar(
        property.beds24PropertyId,
        fromStr,
        toStr,
      );
      for (const d of days) {
        const doc = mapBeds24CalendarToDoc(d, { propertyId: property._id! });
        const existing = await calCol.findOne({
          propertyId: property._id!,
          beds24RoomId: doc.beds24RoomId,
          date: doc.date,
        });
        if (existing) {
          await calCol.updateOne({ _id: existing._id! }, { $set: doc });
          updated++;
        } else {
          await calCol.insertOne({
            ...doc,
            _id: new ObjectId(),
            createdAt: new Date(),
          });
          inserted++;
        }
      }
      await logSync(event, "calendar", property.beds24PropertyId, "success",
        { from: fromStr, to: toStr, days: days.length },
        { localId: property._id ?? undefined, durationMs: Date.now() - t0 },
      );
    } catch (err) {
      errors++;
      const msg = err instanceof Error ? err.message : String(err);
      await logSync(event, "calendar", property.beds24PropertyId, "failed",
        { from: fromStr, to: toStr },
        { error: msg, durationMs: Date.now() - t0 },
      );
    }
  }

  return { inserted, updated, skipped, errors, durationMs: Date.now() - start };
}

// ── Bootstrap (one-shot full pull) ──

export async function bootstrapBeds24(): Promise<{
  properties: SyncResult;
  bookings: SyncResult;
  calendar: SyncResult;
}> {
  const propsResult = await syncProperties("bootstrap");
  const since = new Date();
  since.setMonth(since.getMonth() - 12);
  const bookingsResult = await syncBookings({ since, event: "bootstrap" });

  const from = new Date();
  const to = new Date();
  to.setDate(to.getDate() + 90);
  const calendarResult = await syncCalendar({ from, to, event: "bootstrap" });

  return {
    properties: propsResult,
    bookings: bookingsResult,
    calendar: calendarResult,
  };
}
