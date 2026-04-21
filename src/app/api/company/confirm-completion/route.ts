import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";

export async function POST(req: Request) {
  const user = await requireRole("COMPANY");
  const body = (await req.json().catch(() => null)) as
    | { participationId?: string }
    | null;

  const participationId = body?.participationId;
  if (!participationId) {
    return NextResponse.json({ error: "Missing participationId" }, { status: 400 });
  }

  const participation = await prisma.campaignParticipation.findUnique({
    where: { id: participationId },
    include: { campaign: true },
  });
  if (!participation || participation.campaign.companyId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.campaignParticipation.update({
      where: { id: participationId },
      data: { status: "CONFIRMED" },
    }),
    prisma.campaign.update({
      where: { id: participation.campaignId },
      data: { status: "CONFIRMED" },
    }),
  ]);

  await createNotification({
    userId: participation.influencerId,
    type: "CAMPAIGN_CONFIRMED",
    title: "Campagne confirmée",
    message: `L'entreprise a confirmé l'achèvement de la campagne "${participation.campaign.title}". Paiement en cours de traitement.`,
    link: "/influencer/campaigns",
  });

  return NextResponse.json({ ok: true });
}
