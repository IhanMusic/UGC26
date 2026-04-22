import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

// GET /api/admin/analytics — enriched admin dashboard data
export async function GET() {
  await requireRole("ADMIN");

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  // Monthly campaigns created (last 6 months)
  const campaigns = await prisma.campaign.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, priceDinar: true },
  });

  const monthlyMap: Record<string, { campaigns: number; revenue: number }> = {};
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    monthlyMap[key] = { campaigns: 0, revenue: 0 };
  }
  for (const c of campaigns) {
    const key = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
    if (monthlyMap[key]) {
      monthlyMap[key].campaigns++;
      monthlyMap[key].revenue += c.priceDinar;
    }
  }

  // Application conversion rate
  const [totalApps, acceptedApps] = await Promise.all([
    prisma.campaignApplication.count(),
    prisma.campaignApplication.count({ where: { status: "ACCEPTED" } }),
  ]);

  // Top influencers by completed campaigns
  const topInfluencers = await prisma.campaignParticipation.groupBy({
    by: ["influencerId"],
    where: { status: { in: ["COMPLETED", "CONFIRMED", "PAID"] } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });

  const topInfluencerDetails = await Promise.all(
    topInfluencers.map(async (t) => {
      const user = await prisma.user.findUnique({
        where: { id: t.influencerId },
        select: { firstName: true, lastName: true, email: true },
      });
      return { ...user, completedCampaigns: t._count.id };
    })
  );

  // Revenue from paid transactions
  const totalRevenue = await prisma.transaction.aggregate({
    where: { status: "PAID" },
    _sum: { grossAmountDinar: true },
  });

  // Disputes summary
  const [openDisputes, resolvedDisputes] = await Promise.all([
    prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    prisma.dispute.count({ where: { status: "RESOLVED" } }),
  ]);

  return NextResponse.json({
    monthly: Object.entries(monthlyMap).map(([month, data]) => ({ month, ...data })),
    conversionRate: totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0,
    totalApplications: totalApps,
    acceptedApplications: acceptedApps,
    topInfluencers: topInfluencerDetails,
    totalRevenue: totalRevenue._sum?.grossAmountDinar || 0,
    disputes: { open: openDisputes, resolved: resolvedDisputes },
  });
}
