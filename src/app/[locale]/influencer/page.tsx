import { requireRole } from "@/server/guards";
import { prisma } from "@/server/db";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "./_nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getTranslations } from "next-intl/server";

export default async function InfluencerDashboardPage() {
  const user = await requireRole("INFLUENCER");
  const session = await getServerSession(authOptions);
  const t = await getTranslations("nav");

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [applied, accepted, completedCount, totalEarnings, pendingEarnings, favoriteCount] = await Promise.all([
    prisma.campaignApplication.count({ where: { influencerId: user.id, status: "APPLIED" } }),
    prisma.campaignApplication.count({ where: { influencerId: user.id, status: "ACCEPTED" } }),
    prisma.campaignParticipation.count({
      where: { influencerId: user.id, status: { in: ["COMPLETED", "CONFIRMED", "PAID"] } },
    }),
    prisma.transaction.aggregate({
      where: { paidToId: user.id, status: "PAID" },
      _sum: { amountDinar: true },
    }),
    prisma.transaction.aggregate({
      where: { paidToId: user.id, status: "PENDING" },
      _sum: { amountDinar: true },
    }),
    prisma.favorite.count({ where: { userId: user.id } }),
  ]);

  // Monthly earnings (last 6 months)
  const transactions = await prisma.transaction.findMany({
    where: { paidToId: user.id, status: "PAID", createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, amountDinar: true },
  });
  const monthlyEarnings: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const total = transactions
      .filter(t => `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, "0")}` === key)
      .reduce((s, t) => s + t.amountDinar, 0);
    monthlyEarnings.push({ month: key, amount: total });
  }

  // Campaigns by category
  const participations = await prisma.campaignParticipation.findMany({
    where: { influencerId: user.id },
    include: { campaign: { include: { categories: { include: { category: true } } } } },
  });
  const catMap: Record<string, number> = {};
  for (const p of participations) {
    for (const cc of p.campaign.categories) {
      catMap[cc.category.name] = (catMap[cc.category.name] || 0) + 1;
    }
  }
  const topCategories = Object.entries(catMap).sort((a, b) => b[1] - a[1]).slice(0, 5);

  const acceptanceRate = (applied + accepted) > 0 ? Math.round((accepted / (applied + accepted)) * 100) : 0;
  const earned = totalEarnings._sum.amountDinar || 0;
  const pending = pendingEarnings._sum.amountDinar || 0;

  return (
    <AppShell title={t("influencerDashboard")} nav={await getInfluencerNav()}>
      <div className="grid gap-4 md:grid-cols-4">
        {/* Welcome */}
        <Card className="md:col-span-2 group">
          <CardHeader>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 text-xl font-bold text-white shadow-lg shadow-violet-500/25">
              {session?.user?.email?.charAt(0).toUpperCase()}
            </div>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>{session?.user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-slate-500">
            Apply to campaigns, submit deliverables, and track your earnings.
          </CardContent>
        </Card>

        <Card className="group">
          <CardHeader className="pb-2">
            <CardDescription>Total Earnings</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-emerald-600">{earned.toLocaleString()} DZD</div>
            <div className="text-xs text-slate-400 mt-1">Pending: {pending.toLocaleString()} DZD</div>
          </CardContent>
        </Card>

        <Card className="group">
          <CardHeader className="pb-2">
            <CardDescription>Acceptance Rate</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-violet-600">{acceptanceRate}%</div>
            <div className="h-2 rounded-full bg-slate-100 mt-2 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500" style={{ width: `${acceptanceRate}%` }} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Stats Row */}
      <div className="mt-4 grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Pending Review</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold gradient-text">{applied}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Accepted</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold text-emerald-600">{accepted}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Completed</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold text-violet-600">{completedCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Favorites</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold text-rose-500">{favoriteCount}</div></CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Earnings by month (DZD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-3">
              {monthlyEarnings.map((m) => (
                <div key={m.month} className="text-center">
                  <div className="text-lg font-bold text-emerald-600">{m.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-slate-400">{m.month.slice(5)}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {topCategories.length > 0 && (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Campaigns by category</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {topCategories.map(([name, count]) => (
                  <div key={name} className="flex items-center justify-between">
                    <span className="text-sm text-slate-600">{name}</span>
                    <span className="text-sm font-bold text-violet-600">{count}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
