// src/app/api/payments/satim/initiate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { calcCommissions } from "@/lib/commissions";
import { initiateSatimPayment } from "@/server/satim";
import { env } from "@/server/env";

export async function POST(req: Request) {
  const user = await requireRole("COMPANY");
  const body = (await req.json().catch(() => null)) as { applicationId?: string } | null;

  const applicationId = body?.applicationId;
  if (!applicationId) {
    return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });
  }

  const application = await prisma.campaignApplication.findUnique({
    where: { id: applicationId },
    include: { campaign: true },
  });

  if (!application || application.campaign.companyId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!application.adminPreValidated) {
    return NextResponse.json({ error: "Application not pre-validated" }, { status: 403 });
  }

  // Create participation if it doesn't exist yet
  const participation = await prisma.campaignParticipation.upsert({
    where: {
      campaignId_influencerId: {
        campaignId: application.campaignId,
        influencerId: application.influencerId,
      },
    },
    update: {},
    create: {
      campaignId: application.campaignId,
      influencerId: application.influencerId,
      status: "UPCOMING",
    },
  });

  if (participation.status !== "UPCOMING") {
    return NextResponse.json({ error: "Payment already initiated for this influencer" }, { status: 409 });
  }

  const { grossAmountDinar } = calcCommissions(application.campaign.priceDinar);
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const result = await initiateSatimPayment({
    orderId: participation.id,
    grossAmountDinar,
    returnUrl: `${base}/company/campaigns/${application.campaignId}`,
    failUrl: `${base}/company/campaigns/${application.campaignId}?paymentFailed=true`,
  });

  return NextResponse.json({ redirectUrl: result.redirectUrl });
}
