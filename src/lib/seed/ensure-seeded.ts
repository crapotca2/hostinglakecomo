import { collections } from "@/lib/mongodb/collections";
import { seedOwner } from "./seed-owner";
import { seedFixtures } from "./seed-fixtures";
import { bootstrapBeds24 } from "@/lib/beds24/sync";

let seedingPromise: Promise<void> | null = null;

const USE_MOCK =
  process.env.USE_BEDS24_MOCK === "true" ||
  (!process.env.BEDS24_REFRESH_TOKEN && !process.env.BEDS24_LONG_LIFE_TOKEN);

/**
 * Bootstrap idempotente al primo cold start:
 *  - sempre: admin user + holidays
 *  - se ci sono credenziali Beds24 e DB vuoto: pull reale via bootstrapBeds24()
 *  - altrimenti (dev mock): usa seedFixtures legacy per popolare con dati finti
 */
export async function ensureSeeded(): Promise<void> {
  if (seedingPromise) {
    await seedingPromise;
    return;
  }

  seedingPromise = (async () => {
    try {
      await seedOwner();

      const propsCol = await collections.properties();
      const propCount = await propsCol.countDocuments({});
      if (propCount > 0) return;

      if (USE_MOCK) {
        await seedFixtures();
      } else {
        await bootstrapBeds24();
      }
    } finally {
      seedingPromise = null;
    }
  })();

  await seedingPromise;
}
