import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";

export async function POST(req: Request) {
  await requireRole("ADMIN");
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
  if (!participation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) return NextResponse.json({ error: "Missing admin" }, { status: 500 });

  // Create transaction (manual) for influencer payout
  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        paidById: admin.id,
        paidToId: participation.influencerId,
        campaignId: participation.campaignId,
        amountDinar: participation.campaign.priceDinar,
        status: "PAID",
        provider: "MANUAL",
      },
    }),
    prisma.campaignParticipation.update({
      where: { id: participationId },
      data: { status: "PAID" },
    }),
    prisma.campaign.update({
      where: { id: participation.campaignId },
      data: { status: "PAID" },
    }),
  ]);

  await createNotification({
    userId: participation.influencerId,
    type: "PAYMENT_RECEIVED",
    title: "Paiement reçu !",
    message: `Vous avez reçu ${participation.campaign.priceDinar} DZD pour la campagne "${participation.campaign.title}".`,
    link: "/influencer/payments",
  });

  return NextResponse.json({ ok: true });
}
