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
    include: {
      campaign: true,
      transactions: {
        where: { status: "PENDING" },
        take: 1,
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!participation) {
    return NextResponse.json({ error: "Participation not found" }, { status: 404 });
  }

  const pendingTx = participation.transactions[0];
  if (!pendingTx) {
    return NextResponse.json({ error: "No pending transaction found for this participation" }, { status: 404 });
  }

  if (participation.status === "PAID") {
    return NextResponse.json({ error: "Already paid" }, { status: 409 });
  }

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: pendingTx.id },
      data: { status: "PAID" },
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
    message: `Vous avez reçu ${pendingTx.netAmountInfluencer.toLocaleString()} DZD pour la campagne "${participation.campaign.title}".`,
    link: "/influencer/payments",
  });

  return NextResponse.json({ ok: true });
}
