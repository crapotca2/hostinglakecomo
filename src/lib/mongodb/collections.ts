import type {
  UserDoc,
  PropertyDoc,
  BookingDoc,
  ServiceDoc,
  ReviewDoc,
  HolidayDoc,
  PaymentDoc,
  PayoutDoc,
  Beds24SyncLogDoc,
  ComplianceRecordDoc,
} from "@/types/database";

const USE_MEMORY =
  !process.env.MONGODB_URI || process.env.USE_MEMORY_STORE === "true";

async function getMongoCollection<T extends { _id?: any }>(name: string) {
  const clientPromise = (await import("./client")).default;
  const client = await clientPromise;
  const db = client.db(process.env.MONGODB_DB || "air_bibby");
  return db.collection<T>(name);
}

async function getMemoryCollection<T extends { _id?: any }>(name: string) {
  const { memoryStore } = await import("./memory-store");
  return memoryStore.getCollection<T>(name) as any;
}

function getCollection<T extends { _id?: any }>(name: string) {
  if (USE_MEMORY) return getMemoryCollection<T>(name);
  return getMongoCollection<T>(name);
}

export const collections = {
  users: () => getCollection<UserDoc>("users"),
  properties: () => getCollection<PropertyDoc>("properties"),
  bookings: () => getCollection<BookingDoc>("bookings"),
  services: () => getCollection<ServiceDoc>("services"),
  reviews: () => getCollection<ReviewDoc>("reviews"),
  holidays: () => getCollection<HolidayDoc>("holidays"),
  payments: () => getCollection<PaymentDoc>("payments"),
  payouts: () => getCollection<PayoutDoc>("payouts"),
  beds24SyncLog: () => getCollection<Beds24SyncLogDoc>("beds24_sync_log"),
  complianceRecords: () =>
    getCollection<ComplianceRecordDoc>("compliance_records"),
};
