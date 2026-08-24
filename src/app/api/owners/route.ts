import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { requireSession } from "@/lib/security/require-session";
import { collections } from "@/lib/mongodb/collections";
import { ensureSeeded } from "@/lib/seed/ensure-seeded";
import type { UserDoc, PropertyDoc } from "@/types/database";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/**
 * Elenco proprietari con i loro immobili — per la vista admin a sezioni separate.
 * Owner-scoped (guardrail #3): un admin vede TUTTI i proprietari; un owner vede
 * solo sé stesso. Ogni proprietario non vede mai gli altri.
 */
export async function GET() {
  const auth = await requireSession();
  if (!auth.ok) return auth.response;
  await ensureSeeded();

  const usersCol = await collections.users();
  const propsCol = await collections.properties();

  let owners: UserDoc[];
  if (auth.role === "owner") {
    if (!auth.ownerId) return NextResponse.json({ role: auth.role, owners: [] });
    const u = (await usersCol.findOne({ _id: new ObjectId(auth.ownerId) })) as UserDoc | null;
    owners = u ? [u] : [];
  } else {
    owners = (await usersCol.find({ role: "owner" }).toArray()) as UserDoc[];
  }

  const ownerIds = owners.map((o) => o._id).filter(Boolean) as ObjectId[];
  const props = ownerIds.length
    ? ((await propsCol.find({ ownerId: { $in: ownerIds } }).toArray()) as PropertyDoc[])
    : [];

  const byOwner = new Map<string, PropertyDoc[]>();
  for (const p of props) {
    const k = p.ownerId?.toString();
    if (!k) continue;
    const list = byOwner.get(k);
    if (list) list.push(p);
    else byOwner.set(k, [p]);
  }

  const result = owners.map((o) => {
    const id = o._id!.toString();
    const list = byOwner.get(id) ?? [];
    return {
      ownerId: id,
      name: o.name,
      email: o.email,
      propertiesCount: list.length,
      properties: list.map((p) => ({
        id: p._id!.toString(),
        name: p.name,
        slug: p.slug,
        zone: p.zone,
        status: p.status,
      })),
    };
  });

  result.sort((a, b) => a.name.localeCompare(b.name));
  return NextResponse.json({ role: auth.role, owners: result });
}
