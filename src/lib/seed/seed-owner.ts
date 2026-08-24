import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";
import { holidaysClient } from "@/lib/holidays/client";
import type { HolidayDoc, UserDoc } from "@/types/database";

const OWNER_ID = new ObjectId("000000000000000000000001");

/**
 * Seed minimale e idempotente: solo l'admin user e le festività.
 * NON tocca properties né bookings — quelli vengono dalla sync Beds24.
 * Sicuro da chiamare ad ogni cold start.
 */
export async function seedOwner(): Promise<{ users: number; holidays: number }> {
  const usersCol = await collections.users();
  const holidaysCol = await collections.holidays();
  const now = new Date();

  const adminEmail = process.env.ADMIN_EMAIL ?? "actopark@gmail.com";
  const adminName = process.env.ADMIN_NAME ?? "Andrei";

  // L'account di login a password è il MASTER / property-manager del team:
  // role "admin" → vede tutti i proprietari (sezioni separate) e i loro immobili.
  // I singoli proprietari sono UserDoc distinti con role "owner".
  const existingAdmin = await usersCol.findOne({ email: adminEmail });
  if (!existingAdmin) {
    const admin: UserDoc = {
      _id: OWNER_ID,
      name: adminName,
      email: adminEmail,
      role: "admin",
      language: "it",
      createdAt: now,
      updatedAt: now,
    };
    await usersCol.insertOne(admin);
  } else if (existingAdmin.role !== "admin") {
    // Migra i doc legacy creati come "owner" al ruolo admin.
    await usersCol.updateOne(
      { email: adminEmail },
      { $set: { role: "admin", updatedAt: now } },
    );
  }

  const countries = ["IT", "DE", "FR", "GB", "NL", "CH", "US"];
  const year = new Date().getFullYear();
  let holidaysInserted = 0;
  for (const country of countries) {
    const list = holidaysClient.getHolidays(country, year);
    for (const h of list) {
      const exists = await holidaysCol.findOne({
        country: h.country,
        year: h.year,
        date: new Date(h.date),
      });
      if (exists) continue;
      const doc: HolidayDoc = {
        _id: new ObjectId(),
        country: h.country,
        year: h.year,
        date: new Date(h.date),
        name: h.name,
        nameLocal: h.nameLocal,
        type: h.type,
        createdAt: now,
        updatedAt: now,
      };
      await holidaysCol.insertOne(doc);
      holidaysInserted++;
    }
  }

  return { users: existingAdmin ? 0 : 1, holidays: holidaysInserted };
}
