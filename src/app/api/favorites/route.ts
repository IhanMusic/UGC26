import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { jsonError, ApiError } from "@/server/api-errors";

// POST – toggle favorite (add/remove)
export async function POST(req: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("UNAUTHENTICATED", "Login required", 401);

    const { campaignId } = (await req.json()) as { campaignId: string };
    if (!campaignId) throw new ApiError("BAD_REQUEST", "campaignId required", 400);

    const existing = await prisma.favorite.findUnique({
      where: { userId_campaignId: { userId: session.user.id, campaignId } },
    });

    if (existing) {
      await prisma.favorite.delete({ where: { id: existing.id } });
      return NextResponse.json({ favorited: false });
    }

    await prisma.favorite.create({
      data: { userId: session.user.id, campaignId },
    });
    return NextResponse.json({ favorited: true }, { status: 201 });
  } catch (e) {
    return jsonError(e);
  }
}

// GET – list user's favorites
export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user) throw new ApiError("UNAUTHENTICATED", "Login required", 401);

    const favorites = await prisma.favorite.findMany({
      where: { userId: session.user.id },
      orderBy: { createdAt: "desc" },
      include: {
        campaign: {
          include: {
            categories: { include: { category: true } },
            company: { select: { companyProfile: true, firstName: true, lastName: true } },
          },
        },
      },
    });

    return NextResponse.json({ favorites });
  } catch (e) {
    return jsonError(e);
  }
}
