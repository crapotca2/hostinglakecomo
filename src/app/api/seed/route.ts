import { NextResponse } from "next/server";
import { seedFixtures } from "@/lib/seed/seed-fixtures";

export async function POST() {
  if (process.env.NODE_ENV === "production" && process.env.ALLOW_SEED !== "true") {
    return NextResponse.json(
      { error: "Seeding disabled in production. Set ALLOW_SEED=true to enable." },
      { status: 403 }
    );
  }
  try {
    const result = await seedFixtures();
    return NextResponse.json({ success: true, counts: result });
  } catch (error) {
    const message = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
