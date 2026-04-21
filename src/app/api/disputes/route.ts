import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { jsonError, ApiError } from "@/server/api-errors";

// POST – open a dispute
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("UNAUTHENTICATED", "Login required", 401);

    const { campaignId, reason } = (await req.json()) as { campaignId: string; reason: string };
    if (!campaignId || !reason?.trim()) throw new ApiError("BAD_REQUEST", "campaignId and reason required", 400);

    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new ApiError("NOT_FOUND", "Campaign not found", 404);

    // Only company owner or participating influencer can raise dispute
    const isCompany = campaign.companyId === session.user.id;
    const isInfluencer = await prisma.campaignParticipation.findFirst({
      where: { campaignId, influencerId: session.user.id },
    });
    if (!isCompany && !isInfluencer) {
      throw new ApiError("FORBIDDEN", "Not part of this campaign", 403);
    }

    const dispute = await prisma.dispute.create({
      data: {
        campaignId,
        raisedById: session.user.id,
        reason: reason.trim(),
      },
    });

    return NextResponse.json(dispute, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

// GET – list disputes (admin sees all, others see their own)
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("UNAUTHENTICATED", "Login required", 401);

    const where = session.user.role === "ADMIN" ? {} : { raisedById: session.user.id };

    const disputes = await prisma.dispute.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 100,
      include: {
        campaign: { select: { id: true, title: true } },
        raisedBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
      },
    });

    return NextResponse.json({ disputes });
  } catch (e) {
    return jsonError(e);
  }
}
