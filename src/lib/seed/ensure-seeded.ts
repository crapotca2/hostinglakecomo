import { collections } from "@/lib/mongodb/collections";
import { seedFixtures } from "./seed-fixtures";

let seedingPromise: Promise<void> | null = null;

/**
 * Ensures the in-memory store is populated with test fixtures.
 * On Vercel serverless, each function instance starts with an empty
 * memory store — this function auto-seeds on first access so demo
 * data is always available without needing MongoDB Atlas.
 *
 * Idempotent: checks if properties exist before seeding. Also guards
 * against concurrent calls during a single cold start with a shared
 * promise.
 */
export async function ensureSeeded(): Promise<void> {
  const propsCol = await collections.properties();
  const count = await propsCol.countDocuments({});
  if (count > 0) return;

  if (seedingPromise) {
    await seedingPromise;
    return;
  }

  seedingPromise = (async () => {
    try {
      await seedFixtures();
    } finally {
      seedingPromise = null;
    }
  })();

  await seedingPromise;
}
