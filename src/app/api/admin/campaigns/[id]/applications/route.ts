import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const { id: campaignId } = await params;
  const body = (await req.json().catch(() => null)) as
    | { influencerId?: string; action?: "accept" | "reject" }
    | null;

  const influencerId = body?.influencerId;
  const action = body?.action;
  if (!influencerId || !action) {
    return NextResponse.json({ error: "Missing influencerId/action" }, { status: 400 });
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId }, select: { title: true } });

  if (action === "reject") {
    await prisma.campaignApplication.update({
      where: { campaignId_influencerId: { campaignId, influencerId } },
      data: { status: "REJECTED" },
    });
    await createNotification({
      userId: influencerId,
      type: "APPLICATION_REJECTED",
      title: "Candidature refusée",
      message: `Votre candidature pour "${campaign?.title ?? "campagne"}" a été refusée.`,
      link: "/influencer/campaigns",
    });
    return NextResponse.json({ ok: true });
  }

  // accept
  await prisma.$transaction(async (tx) => {
    await tx.campaignApplication.update({
      where: { campaignId_influencerId: { campaignId, influencerId } },
      data: { status: "ACCEPTED" },
    });

    await tx.campaignParticipation.upsert({
      where: { campaignId_influencerId: { campaignId, influencerId } },
      update: { status: "UPCOMING" },
      create: { campaignId, influencerId, status: "UPCOMING" },
    });

    await tx.campaign.update({
      where: { id: campaignId },
      data: { status: "UPCOMING" },
    });
  });

  await createNotification({
    userId: influencerId,
    type: "APPLICATION_ACCEPTED",
    title: "Candidature acceptée !",
    message: `Votre candidature pour "${campaign?.title ?? "campagne"}" a été acceptée. Préparez-vous !`,
    link: "/influencer/campaigns",
  });

  return NextResponse.json({ ok: true });
}
