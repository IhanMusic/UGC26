import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getAdminNav } from "./_nav";
import { getTranslations } from "next-intl/server";

export default async function AdminDashboardPage() {
  await requireRole("ADMIN");
  const t = await getTranslations("nav");

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [influencers, companies, campaigns, active, blocked, deleted, totalApps, acceptedApps, paidRevenue, openDisputes] =
    await Promise.all([
      prisma.user.count({ where: { role: "INFLUENCER" } }),
      prisma.user.count({ where: { role: "COMPANY" } }),
      prisma.campaign.count(),
      prisma.user.count({ where: { isDeleted: false, isBlocked: false } }),
      prisma.user.count({ where: { isBlocked: true } }),
      prisma.user.count({ where: { isDeleted: true } }),
      prisma.campaignApplication.count(),
      prisma.campaignApplication.count({ where: { status: "ACCEPTED" } }),
      prisma.transaction.aggregate({ where: { status: "PAID" }, _sum: { grossAmountDinar: true } }),
      prisma.dispute.count({ where: { status: { in: ["OPEN", "UNDER_REVIEW"] } } }),
    ]);

  // Monthly campaigns (last 6 months)
  const campaignsByMonth = await prisma.campaign.findMany({
    where: { createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, priceDinar: true },
  });
  const monthlyData: { month: string; campaigns: number; revenue: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const matching = campaignsByMonth.filter(c => {
      const k = `${c.createdAt.getFullYear()}-${String(c.createdAt.getMonth() + 1).padStart(2, "0")}`;
      return k === key;
    });
    monthlyData.push({
      month: key,
      campaigns: matching.length,
      revenue: matching.reduce((s, c) => s + c.priceDinar, 0),
    });
  }

  // Top influencers
  const topInfluencersRaw = await prisma.campaignParticipation.groupBy({
    by: ["influencerId"],
    where: { status: { in: ["COMPLETED", "CONFIRMED", "PAID"] } },
    _count: { id: true },
    orderBy: { _count: { id: "desc" } },
    take: 5,
  });
  const topInfluencers = await Promise.all(
    topInfluencersRaw.map(async (t) => {
      const u = await prisma.user.findUnique({
        where: { id: t.influencerId },
        select: { firstName: true, lastName: true },
      });
      return { name: `${u?.firstName} ${u?.lastName}`, count: t._count.id };
    })
  );

  const recentUsers = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    take: 5,
    select: { id: true, firstName: true, lastName: true, email: true, role: true, createdAt: true },
  });

  const conversionRate = totalApps > 0 ? Math.round((acceptedApps / totalApps) * 100) : 0;
  const revenue = paidRevenue._sum?.grossAmountDinar || 0;
  const maxCampaigns = Math.max(...monthlyData.map(m => m.campaigns), 1);

  return (
    <AppShell title={t("adminDashboard")} nav={await getAdminNav()}>
      {/* Top Stats Row */}
      <div className="grid gap-4 md:grid-cols-5">
        <Card className="group">
          <CardHeader className="pb-2">
            <CardDescription>Influencers</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-[var(--primary)]">{influencers}</div>
          </CardContent>
        </Card>
        <Card className="group">
          <CardHeader className="pb-2">
            <CardDescription>Companies</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-[var(--success)]">{companies}</div>
          </CardContent>
        </Card>
        <Card className="group">
          <CardHeader className="pb-2">
            <CardDescription>Campaigns</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight gradient-text">{campaigns}</div>
          </CardContent>
        </Card>
        <Card className="group">
          <CardHeader className="pb-2">
            <CardDescription>Total Revenue</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-[var(--gold)]">{revenue.toLocaleString()} DZD</div>
          </CardContent>
        </Card>
        <Card className="group">
          <CardHeader className="pb-2">
            <CardDescription>Open Disputes</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-[var(--danger)]">{openDisputes}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts Row */}
      <div className="mt-6 grid gap-5 md:grid-cols-2">
        {/* Monthly Campaigns Bar Chart */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Campaigns per month</CardTitle>
            <CardDescription>Last 6 months</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-end gap-2 h-40">
              {monthlyData.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1">
                  <span className="text-xs font-semibold text-[var(--foreground-muted)]">{m.campaigns}</span>
                  <div
                    className="w-full rounded-t-md bg-gradient-to-t from-[var(--primary)] to-[var(--secondary)] transition-all"
                    style={{ height: `${Math.max((m.campaigns / maxCampaigns) * 100, 4)}%` }}
                  />
                  <span className="text-[10px] text-[var(--foreground-muted)]">{m.month.slice(5)}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Conversion & Health */}
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Key Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--foreground-muted)]">Application Conversion Rate</span>
                <span className="font-bold text-[var(--primary)]">{conversionRate}%</span>
              </div>
              <div className="h-2.5 rounded-full bg-[var(--surface-mid)] overflow-hidden">
                <div className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)]" style={{ width: `${conversionRate}%` }} />
              </div>
              <div className="text-xs text-[var(--foreground-muted)] mt-1">{acceptedApps} accepted / {totalApps} total</div>
            </div>
            <div>
              <div className="flex justify-between text-sm mb-1">
                <span className="text-[var(--foreground-muted)]">Account Health</span>
              </div>
              <div className="flex items-center gap-4">
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[var(--success)]" />
                  <span className="text-xs text-[var(--foreground-muted)]">Active: {active}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[var(--gold)]" />
                  <span className="text-xs text-[var(--foreground-muted)]">Blocked: {blocked}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <div className="h-3 w-3 rounded-full bg-[var(--danger)]" />
                  <span className="text-xs text-[var(--foreground-muted)]">Deleted: {deleted}</span>
                </div>
              </div>
            </div>
            {topInfluencers.length > 0 && (
              <div>
                <div className="text-sm font-medium text-[var(--foreground)] mb-2">Top Influencers</div>
                <div className="space-y-1.5">
                  {topInfluencers.map((t, i) => (
                    <div key={i} className="flex items-center justify-between text-xs">
                      <span className="text-[var(--foreground-muted)]">{t.name}</span>
                      <span className="font-semibold text-[var(--primary)]">{t.count} campaigns</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Revenue by Month */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Revenue by month (DZD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-3">
              {monthlyData.map((m) => (
                <div key={m.month} className="text-center">
                  <div className="text-lg font-bold text-[var(--success)]">{m.revenue.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--foreground-muted)]">{m.month}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Users */}
      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle>Recently added users</CardTitle>
            <CardDescription>Last 5 registrations</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers.map((u) => (
                <div key={u.id} className="flex items-center gap-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-3 backdrop-blur-sm transition-colors hover:bg-[var(--surface-hover)]">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] text-xs font-bold text-[var(--background)] shadow-sm">
                    {u.firstName?.charAt(0)}{u.lastName?.charAt(0)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-medium text-[var(--foreground)]">{u.firstName} {u.lastName}</div>
                    <div className="truncate text-xs text-[var(--foreground-muted)]">{u.email}</div>
                  </div>
                  <div className="rounded-full border border-[var(--border)] bg-[var(--primary-dim)] px-2.5 py-0.5 text-[10px] font-medium text-[var(--primary)]">
                    {u.role}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
