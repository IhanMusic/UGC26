import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";
import { calcCommissions } from "@/lib/commissions";

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

  if (participation.status !== "ONGOING") {
    return NextResponse.json({ error: "Participation is not in ONGOING status" }, { status: 409 });
  }

  let grossAmountDinar: number, platformFeeCompany: number, platformFeeInfluencer: number, netAmountInfluencer: number;
  try {
    ({ grossAmountDinar, platformFeeCompany, platformFeeInfluencer, netAmountInfluencer } =
      calcCommissions(participation.campaign.priceDinar));
  } catch {
    return NextResponse.json({ error: "Invalid campaign price" }, { status: 422 });
  }

  // Check if a PENDING transaction already exists for this participation
  const existingPendingTx = await prisma.transaction.findFirst({
    where: { participationId, status: "PENDING" },
  });

  const transactionOps = existingPendingTx ? [] : [
    prisma.transaction.create({
      data: {
        paidById: user.id,
        paidToId: participation.influencerId,
        campaignId: participation.campaignId,
        participationId,
        grossAmountDinar,
        platformFeeCompany,
        platformFeeInfluencer,
        netAmountInfluencer,
        status: "PENDING",
        provider: "MANUAL",
      },
    }),
  ];

  await prisma.$transaction([
    prisma.campaignParticipation.update({
      where: { id: participationId },
      data: { status: "CONFIRMED" },
    }),
    prisma.campaign.update({
      where: { id: participation.campaignId },
      data: { status: "CONFIRMED" },
    }),
    ...transactionOps,
  ]);

  await createNotification({
    userId: participation.influencerId,
    type: "CAMPAIGN_CONFIRMED",
    title: "Campagne confirmée",
    message: `L'entreprise a confirmé l'achèvement de la campagne "${participation.campaign.title}". Vous recevrez ${netAmountInfluencer.toLocaleString()} DZD.`,
    link: "/influencer/campaigns",
  });

  return NextResponse.json({ ok: true });
}
