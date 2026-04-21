import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { jsonError } from "@/server/api-errors";

// GET – public catalogue of influencers with filters
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const q = searchParams.get("q")?.trim() ?? "";
    const category = searchParams.get("category") ?? "";
    const city = searchParams.get("city") ?? "";
    const country = searchParams.get("country") ?? "";

    const where: Record<string, unknown> = {
      role: "INFLUENCER",
      isDeleted: false,
      isBlocked: false,
      isVerified: true,
    };

    if (q) {
      where.OR = [
        { firstName: { contains: q, mode: "insensitive" } },
        { lastName: { contains: q, mode: "insensitive" } },
      ];
    }

    const influencerWhere: Record<string, unknown> = {};
    if (city) influencerWhere.city = { contains: city, mode: "insensitive" };
    if (country) influencerWhere.country = { contains: country, mode: "insensitive" };
    if (category) {
      influencerWhere.categories = { some: { category: { name: { contains: category, mode: "insensitive" } } } };
    }
    if (Object.keys(influencerWhere).length > 0) {
      where.influencerProfile = influencerWhere;
    }

    const users = await prisma.user.findMany({
      where,
      take: 50,
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        firstName: true,
        lastName: true,
        imageUrl: true,
        influencerProfile: {
          select: {
            city: true,
            country: true,
            passion: true,
            followersCountRange: true,
            mainAccountLink: true,
            categories: { include: { category: true } },
          },
        },
        reviewsReceived: { select: { rating: true } },
      },
    });

    const result = users.map((u) => {
      const ratings = u.reviewsReceived;
      const avg = ratings.length > 0 ? ratings.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / ratings.length : 0;
      return {
        id: u.id,
        firstName: u.firstName,
        lastName: u.lastName,
        imageUrl: u.imageUrl,
        city: u.influencerProfile?.city,
        country: u.influencerProfile?.country,
        passion: u.influencerProfile?.passion,
        followersCountRange: u.influencerProfile?.followersCountRange,
        mainAccountLink: u.influencerProfile?.mainAccountLink,
        categories: u.influencerProfile?.categories.map((c) => c.category.name) ?? [],
        averageRating: Math.round(avg * 10) / 10,
        reviewCount: ratings.length,
      };
    });

    return NextResponse.json({ influencers: result });
  } catch (e) {
    return jsonError(e);
  }
}
