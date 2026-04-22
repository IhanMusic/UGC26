import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  await requireRole("ADMIN");

  const body = (await req.json().catch(() => null)) as {
    action: "approve" | "reject";
    reason?: string;
  } | null;

  if (!body?.action) return NextResponse.json({ error: "action requis" }, { status: 400 });

  const pitch = await prisma.creatorPitch.findUnique({ where: { id } });
  if (!pitch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pitch.status !== "PENDING_REVIEW")
    return NextResponse.json({ error: "Pitch not pending review" }, { status: 422 });

  if (body.action === "approve") {
    const updated = await prisma.creatorPitch.update({
      where: { id },
      data: { status: "PUBLISHED" },
    });
    await prisma.notification.create({
      data: {
        userId: pitch.creatorId,
        type: "PITCH_VALIDATED",
        title: "Projet approuvé !",
        message: `Votre projet "${pitch.title}" a été validé et est maintenant visible par les marques.`,
        link: `/creator/pitches/${pitch.id}`,
      },
    });
    return NextResponse.json({ pitch: updated });
  }

  const updated = await prisma.creatorPitch.update({
    where: { id },
    data: { status: "REJECTED" },
  });
  await prisma.notification.create({
    data: {
      userId: pitch.creatorId,
      type: "PITCH_REJECTED",
      title: "Projet refusé",
      message: `Votre projet "${pitch.title}" a été refusé. Raison : ${body.reason ?? "Non précisée"}. Vous pouvez le modifier et le resoumettre.`,
      link: `/creator/pitches/${pitch.id}/edit`,
    },
  });
  return NextResponse.json({ pitch: updated });
}
