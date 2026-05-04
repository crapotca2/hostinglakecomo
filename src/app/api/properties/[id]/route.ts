import { NextResponse } from "next/server";
import { ObjectId } from "mongodb";
import { collections } from "@/lib/mongodb/collections";

export async function GET(_req: Request, { params }: { params: { id: string } }) {
  const col = await collections.properties();
  const doc = await col.findOne({ _id: new ObjectId(params.id) });
  if (!doc) return NextResponse.json({ error: "Not found" }, { status: 404 });
  return NextResponse.json(doc);
}

export async function PUT(req: Request, { params }: { params: { id: string } }) {
  const body = await req.json();
  const col = await collections.properties();
  const { _id, ...update } = body;
  await col.updateOne(
    { _id: new ObjectId(params.id) },
    { $set: { ...update, updatedAt: new Date() } }
  );
  return NextResponse.json({ ok: true });
}

export async function DELETE(_req: Request, { params }: { params: { id: string } }) {
  const col = await collections.properties();
  await col.deleteOne({ _id: new ObjectId(params.id) });
  return NextResponse.json({ ok: true });
}
