import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireRole("INFLUENCER");

  const pitch = await prisma.creatorPitch.findUnique({ where: { id } });
  if (!pitch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pitch.creatorId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["DRAFT", "REJECTED"].includes(pitch.status))
    return NextResponse.json({ error: "Cannot edit in current status" }, { status: 422 });

  const body = (await req.json().catch(() => null)) as {
    description?: string;
    type?: string;
    minSponsorshipDZD?: number;
  } | null;

  if (!body?.description || !body.type)
    return NextResponse.json({ error: "description and type required" }, { status: 400 });

  const deliverable = await prisma.pitchDeliverable.create({
    data: {
      pitchId: id,
      description: body.description,
      type: body.type as any,
      minSponsorshipDZD: body.minSponsorshipDZD ?? null,
    },
  });

  return NextResponse.json({ deliverable }, { status: 201 });
}

export async function DELETE(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: pitchId } = await params;
  const user = await requireRole("INFLUENCER");

  const body = (await req.json().catch(() => null)) as { deliverableId?: string } | null;
  if (!body?.deliverableId)
    return NextResponse.json({ error: "deliverableId required" }, { status: 400 });

  const pitch = await prisma.creatorPitch.findUnique({ where: { id: pitchId } });
  if (!pitch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pitch.creatorId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  if (!["DRAFT", "REJECTED"].includes(pitch.status))
    return NextResponse.json({ error: "Cannot edit in current status" }, { status: 422 });

  await prisma.pitchDeliverable.delete({ where: { id: body.deliverableId } });
  return NextResponse.json({ ok: true });
}
