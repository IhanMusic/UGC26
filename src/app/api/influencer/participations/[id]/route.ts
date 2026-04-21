import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { saveBase64Image } from "@/server/uploads";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole("INFLUENCER");
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as
    | {
        action?: "schedule" | "start" | "complete";
        scheduledStartDate?: string;
        proofDataUrl?: string;
      }
    | null;

  const p = await prisma.campaignParticipation.findUnique({ where: { id } });
  if (!p || p.influencerId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const action = body?.action;
  if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

  if (action === "schedule") {
    if (!body.scheduledStartDate) {
      return NextResponse.json({ error: "Missing date" }, { status: 400 });
    }
    await prisma.campaignParticipation.update({
      where: { id },
      data: {
        scheduledStartDate: new Date(body.scheduledStartDate),
        status: "UPCOMING",
      },
    });
    return NextResponse.json({ ok: true });
  }

  if (!body.proofDataUrl) {
    return NextResponse.json({ error: "Missing proof" }, { status: 400 });
  }
  const proofUrl = await saveBase64Image(body.proofDataUrl);

  if (action === "start") {
    await prisma.$transaction([
      prisma.campaignParticipation.update({
        where: { id },
        data: {
          startProofUrl: proofUrl,
          status: "ONGOING",
        },
      }),
      prisma.campaign.update({
        where: { id: p.campaignId },
        data: { status: "ONGOING" },
      }),
    ]);
    return NextResponse.json({ ok: true });
  }

  // complete
  await prisma.$transaction([
    prisma.campaignParticipation.update({
      where: { id },
      data: {
        completionProofUrl: proofUrl,
        status: "COMPLETED",
      },
    }),
    prisma.campaign.update({
      where: { id: p.campaignId },
      data: { status: "COMPLETED" },
    }),
  ]);
  return NextResponse.json({ ok: true });
}
