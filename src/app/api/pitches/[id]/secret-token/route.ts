import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { randomUUID } from "crypto";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireRole("INFLUENCER");

  const pitch = await prisma.creatorPitch.findUnique({ where: { id } });
  if (!pitch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pitch.creatorId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const newToken = randomUUID();
  const updated = await prisma.creatorPitch.update({
    where: { id },
    data: { secretToken: newToken },
  });

  return NextResponse.json({ secretToken: updated.secretToken });
}
