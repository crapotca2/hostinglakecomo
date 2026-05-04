import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { beds24Client } from "@/lib/beds24/client";
import { holidaysClient } from "@/lib/holidays/client";
import { getPortfolio, getPortfolioId } from "@/lib/portfolio";
import type { PropertyDoc, BookingDoc, UserDoc, HolidayDoc } from "@/types/database";

const OWNER_ID = new ObjectId("000000000000000000000001");

function mapSource(referer: string): BookingDoc["source"] {
  const lower = referer.toLowerCase();
  if (lower.includes("airbnb")) return "airbnb";
  if (lower.includes("booking")) return "booking";
  if (lower.includes("vrbo")) return "vrbo";
  if (lower.includes("expedia")) return "expedia";
  if (lower.includes("direct")) return "direct";
  return "other";
}

function mapStatus(status: string): BookingDoc["status"] {
  if (status === "request") return "pending";
  if (status === "cancelled") return "cancelled";
  if (status === "confirmed") return "confirmed";
  return "pending";
}

export async function seedFixtures() {
  const usersCol = await collections.users();
  const propsCol = await collections.properties();
  const bookingsCol = await collections.bookings();
  const holidaysCol = await collections.holidays();

  await usersCol.deleteMany({});
  await propsCol.deleteMany({});
  await bookingsCol.deleteMany({});
  await holidaysCol.deleteMany({});

  const now = new Date();

  const owner: UserDoc = {
    _id: OWNER_ID,
    name: "Andrei Crapotca",
    email: "actopark@gmail.com",
    role: "owner",
    language: "it",
    createdAt: now,
    updatedAt: now,
  };
  await usersCol.insertOne(owner);

  const portfolio = getPortfolio();
  const propertyIdMap = new Map<string, ObjectId>();

  for (const entry of portfolio) {
    const beds24Id = getPortfolioId(entry.slug);
    const doc: PropertyDoc = {
      _id: new ObjectId(),
      name: entry.name,
      slug: entry.slug,
      ownerId: OWNER_ID,
      status: "active",
      type: entry.type,
      zone: entry.zone,
      description: entry.description,
      address: {
        street: entry.address.street || "",
        city: entry.address.city || "Como",
        province: entry.address.province || "CO",
        zip: entry.address.zip || "22100",
      },
      details: {
        bedrooms: entry.details.bedrooms,
        bathrooms: entry.details.bathrooms,
        maxGuests: entry.details.maxGuests,
        hasLakeView: entry.details.hasLakeView,
        hasWifi: entry.details.hasWifi,
        hasAC: entry.details.hasAC,
        hasParking: entry.details.hasParking,
        hasGarden: entry.details.hasGarden,
        hasPool: entry.details.hasPool,
      },
      amenities: entry.amenities,
      images: entry.images,
      pricing: {
        basePrice: entry.pricing.basePrice,
        cleaningFee: entry.pricing.cleaningFee,
        weekendMultiplier: entry.pricing.weekendMultiplier,
      },
      beds24PropertyId: beds24Id,
      beds24RoomId: `${beds24Id}_r1`,
      touristTaxRate: entry.touristTaxRate,
      maxTouristTaxNights: entry.maxTouristTaxNights,
      tags: ["portfolio:imported", "source:comolakehost"],
      createdAt: now,
      updatedAt: now,
    };
    await propsCol.insertOne(doc);
    propertyIdMap.set(beds24Id, doc._id!);
  }

  const b24Bookings = await beds24Client.getBookings();
  for (const b of b24Bookings) {
    const propertyId = propertyIdMap.get(b.propertyId);
    if (!propertyId) continue;
    const nights = Math.max(
      1,
      Math.ceil(
        (new Date(b.departure).getTime() - new Date(b.arrival).getTime()) /
          (24 * 60 * 60 * 1000)
      )
    );
    const nightlyRate = Math.round(b.price / nights);
    const cleaningFee = 60;
    const totalAmount = b.price + cleaningFee;
    const commissionRate = b.referer === "Direct" ? 0 : 0.15;
    const commissionAmount = Math.round(b.price * commissionRate);
    const airBibbyCommission = Math.round(b.price * 0.1);
    const touristTax = Math.min(5, nights) * b.numAdult * 3;
    const ownerPayout = b.price - commissionAmount - airBibbyCommission - touristTax;

    const doc: BookingDoc = {
      _id: new ObjectId(),
      propertyId,
      ownerId: OWNER_ID,
      checkIn: new Date(b.arrival),
      checkOut: new Date(b.departure),
      nights,
      guests: b.numAdult + b.numChild,
      status: mapStatus(b.status),
      source: mapSource(b.referer),
      guestInfo: {
        name: `${b.guestFirstName} ${b.guestName}`.trim(),
        email: b.guestEmail || "",
        phone: b.guestPhone,
        nationality: b.guestCountry,
      },
      pricing: {
        nightlyRate,
        cleaningFee,
        totalAmount,
        commissionRate,
        commissionAmount,
        ownerPayout,
        touristTax,
      },
      beds24Id: b.id,
      beds24LastSync: now,
      compliance: {
        alloggiatiWebSubmitted: false,
        istatIncluded: false,
        touristTaxPaid: false,
      },
      createdAt: new Date(b.bookingTime),
      updatedAt: now,
    };
    await bookingsCol.insertOne(doc);
  }

  const countries = ["IT", "DE", "FR", "GB", "NL", "CH", "US"];
  const holidayDocs: HolidayDoc[] = [];
  for (const country of countries) {
    const list = holidaysClient.getHolidays(country, 2026);
    for (const h of list) {
      holidayDocs.push({
        _id: new ObjectId(),
        country: h.country,
        year: h.year,
        date: new Date(h.date),
        name: h.name,
        nameLocal: h.nameLocal,
        type: h.type,
        createdAt: now,
        updatedAt: now,
      });
    }
  }
  if (holidayDocs.length > 0) {
    for (const h of holidayDocs) {
      await holidaysCol.insertOne(h);
    }
  }

  return {
    users: 1,
    properties: propertyIdMap.size,
    bookings: b24Bookings.length,
    holidays: holidayDocs.length,
  };
}
