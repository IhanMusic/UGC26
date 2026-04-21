import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { jsonError, ApiError } from "@/server/api-errors";

// POST – create a review (after campaign PAID)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("UNAUTHENTICATED", "Login required", 401);

    const body = await req.json();
    const { campaignId, reviewedId, rating, comment } = body as {
      campaignId: string;
      reviewedId: string;
      rating: number;
      comment?: string;
    };

    if (!campaignId || !reviewedId || !rating) {
      throw new ApiError("BAD_REQUEST", "Missing fields", 400);
    }
    if (rating < 1 || rating > 5) {
      throw new ApiError("BAD_REQUEST", "Rating must be 1-5", 400);
    }
    if (session.user.id === reviewedId) {
      throw new ApiError("BAD_REQUEST", "Cannot review yourself", 400);
    }

    // Verify campaign is CONFIRMED or PAID and user participated
    const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
    if (!campaign) throw new ApiError("NOT_FOUND", "Campaign not found", 404);
    if (campaign.status !== "CONFIRMED" && campaign.status !== "PAID") {
      throw new ApiError("BAD_REQUEST", "Can only review after campaign is confirmed or paid", 400);
    }

    // Check reviewer is part of the campaign
    const isCompany = campaign.companyId === session.user.id;
    const isInfluencer = await prisma.campaignParticipation.findFirst({
      where: { campaignId, influencerId: session.user.id, status: "PAID" },
    });
    if (!isCompany && !isInfluencer) {
      throw new ApiError("FORBIDDEN", "Not part of this campaign", 403);
    }

    // Check for existing review (before create)
    const existing = await prisma.review.findFirst({
      where: { reviewerId: session.user.id, campaignId },
    });
    if (existing) {
      return NextResponse.json({ error: "Vous avez déjà laissé un avis pour cette campagne" }, { status: 409 });
    }

    const review = await prisma.review.create({
      data: {
        rating,
        comment: comment?.trim() || null,
        reviewerId: session.user.id,
        reviewedId,
        campaignId,
      },
    });

    return NextResponse.json(review, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

// GET – list reviews for a user (?userId=xxx) or campaign (?campaignId=xxx)
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");
    const campaignId = searchParams.get("campaignId");

    const where: Record<string, unknown> = {};
    if (userId) where.reviewedId = userId;
    if (campaignId) where.campaignId = campaignId;

    const reviews = await prisma.review.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: 50,
      include: {
        reviewer: { select: { id: true, firstName: true, lastName: true, imageUrl: true, role: true } },
        reviewed: { select: { id: true, firstName: true, lastName: true, role: true } },
        campaign: { select: { id: true, title: true } },
      },
    });

    // Compute average
    const avg =
      reviews.length > 0
        ? reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length
        : 0;

    return NextResponse.json({ reviews, averageRating: Math.round(avg * 10) / 10, count: reviews.length });
  } catch (e) {
    return jsonError(e);
  }
}
