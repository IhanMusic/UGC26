import { requireRole } from "@/server/guards";
import { prisma } from "@/server/db";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "./_nav";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getTranslations } from "next-intl/server";

export default async function CompanyDashboardPage() {
  const user = await requireRole("COMPANY");
  const session = await getServerSession(authOptions);
  const t = await getTranslations("nav");

  const now = new Date();
  const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 5, 1);

  const [requests, campaignCount, totalSpent, pendingSpent, applicationsReceived, acceptedApps] = await Promise.all([
    prisma.campaignRequest.count({ where: { companyId: user.id } }),
    prisma.campaign.count({ where: { companyId: user.id } }),
    prisma.transaction.aggregate({
      where: { paidById: user.id, status: "PAID" },
      _sum: { grossAmountDinar: true },
    }),
    prisma.transaction.aggregate({
      where: { paidById: user.id, status: "PENDING" },
      _sum: { grossAmountDinar: true },
    }),
    prisma.campaignApplication.count({
      where: { campaign: { companyId: user.id } },
    }),
    prisma.campaignApplication.count({
      where: { campaign: { companyId: user.id }, status: "ACCEPTED" },
    }),
  ]);

  // Monthly spending
  const txns = await prisma.transaction.findMany({
    where: { paidById: user.id, status: "PAID", createdAt: { gte: sixMonthsAgo } },
    select: { createdAt: true, grossAmountDinar: true },
  });
  const monthlySpending: { month: string; amount: number }[] = [];
  for (let i = 5; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}`;
    const total = txns
      .filter(t => `${t.createdAt.getFullYear()}-${String(t.createdAt.getMonth() + 1).padStart(2, "0")}` === key)
      .reduce((s, t) => s + t.grossAmountDinar, 0);
    monthlySpending.push({ month: key, amount: total });
  }

  // Campaign status breakdown
  const statusCounts = await prisma.campaign.groupBy({
    by: ["status"],
    where: { companyId: user.id },
    _count: { id: true },
  });
  const statusMap: Record<string, number> = {};
  for (const s of statusCounts) {
    statusMap[s.status] = s._count.id;
  }

  const spent = totalSpent._sum?.grossAmountDinar || 0;
  const pending = pendingSpent._sum?.grossAmountDinar || 0;

  return (
    <AppShell title={t("companyDashboard")} nav={await getCompanyNav()}>
      <div className="grid gap-4 md:grid-cols-4">
        <Card className="md:col-span-2 group">
          <CardHeader>
            <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--secondary)] to-[var(--secondary)] text-xl font-bold text-[var(--background)] shadow-lg shadow-[var(--primary-glow)]">
              {session?.user?.email?.charAt(0).toUpperCase()}
            </div>
            <CardTitle>Welcome back</CardTitle>
            <CardDescription>{session?.user?.email}</CardDescription>
          </CardHeader>
          <CardContent className="text-sm text-[var(--foreground-muted)]">
            Request campaigns, review deliverables, and manage your influencer collaborations.
          </CardContent>
        </Card>

        <Card className="group">
          <CardHeader className="pb-2">
            <CardDescription>Total Spent</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-[var(--gold)]">{spent.toLocaleString()} DZD</div>
            <div className="text-xs text-[var(--foreground-muted)] mt-1">Pending: {pending.toLocaleString()} DZD</div>
          </CardContent>
        </Card>

        <Card className="group">
          <CardHeader className="pb-2">
            <CardDescription>Applications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-[var(--primary)]">{applicationsReceived}</div>
            <div className="text-xs text-[var(--foreground-muted)] mt-1">{acceptedApps} accepted</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-4 grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-2"><CardDescription>Requests</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold gradient-text">{requests}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Published Campaigns</CardDescription></CardHeader>
          <CardContent><div className="text-3xl font-bold text-[var(--success)]">{campaignCount}</div></CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2"><CardDescription>Campaign Status</CardDescription></CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-2 text-xs">
              {["UPCOMING", "ONGOING", "COMPLETED", "CONFIRMED", "PAID"].map(s => (
                <span key={s} className="rounded-full bg-[var(--surface-mid)] px-2 py-0.5">
                  {s}: <span className="font-bold">{statusMap[s] || 0}</span>
                </span>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-6">
        <Card>
          <CardHeader>
            <CardTitle className="text-base">Spending by month (DZD)</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-6 gap-3">
              {monthlySpending.map((m) => (
                <div key={m.month} className="text-center">
                  <div className="text-lg font-bold text-[var(--gold)]">{m.amount.toLocaleString()}</div>
                  <div className="text-[10px] text-[var(--foreground-muted)]">{m.month}</div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
