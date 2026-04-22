import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { calcCommissions } from "@/lib/commissions";
import { createNotification } from "@/server/notifications";
import { env } from "@/server/env";

export async function GET(req: NextRequest) {
  if (env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId"); // this is participationId
  const success = searchParams.get("success") === "true";

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const participation = await prisma.campaignParticipation.findUnique({
    where: { id: orderId },
    include: { campaign: true },
  });

  if (!participation) {
    return NextResponse.json({ error: "Participation not found" }, { status: 404 });
  }

  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  if (!success) {
    return NextResponse.redirect(
      `${base}/company/campaigns/${participation.campaignId}?paymentFailed=true`,
    );
  }

  const { grossAmountDinar, platformFeeCompany, platformFeeInfluencer, netAmountInfluencer } =
    calcCommissions(participation.campaign.priceDinar);

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        paidById: participation.campaign.companyId,
        paidToId: participation.influencerId,
        campaignId: participation.campaignId,
        participationId: orderId,
        grossAmountDinar,
        platformFeeCompany,
        platformFeeInfluencer,
        netAmountInfluencer,
        status: "PENDING",
        provider: "SATIM",
      },
    }),
    prisma.campaignParticipation.update({
      where: { id: orderId },
      data: { status: "ONGOING" },
    }),
  ]);

  await createNotification({
    userId: participation.influencerId,
    type: "APPLICATION_ACCEPTED",
    title: "Paiement reçu — campagne démarrée",
    message: `La campagne "${participation.campaign.title}" a démarré. Paiement de ${netAmountInfluencer.toLocaleString()} DZD en attente.`,
    link: "/influencer/campaigns",
  });

  return NextResponse.redirect(`${base}/company/campaigns/${participation.campaignId}`);
}
