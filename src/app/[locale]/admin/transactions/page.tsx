import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Pagination } from "@/components/ui/pagination";
import { getTranslations } from "next-intl/server";

export default async function AdminTransactionsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN");
  const t = await getTranslations("nav");
  const sp = await searchParams;

  const from = (sp.from as string | undefined) ?? "";
  const to = (sp.to as string | undefined) ?? "";
  const fromDate = from ? new Date(from) : null;
  const toDate = to ? new Date(to) : null;

  const pageStr = (sp.page as string | undefined) ?? "1";
  const page = Math.max(1, parseInt(pageStr, 10));
  const LIMIT = 50;

  const whereClause = {
    ...(fromDate || toDate
      ? {
          createdAt: {
            ...(fromDate ? { gte: fromDate } : {}),
            ...(toDate ? { lte: new Date(toDate.getTime() + 24 * 3600 * 1000) } : {}),
          },
        }
      : {}),
  };

  const [txs, totalCount] = await Promise.all([
    prisma.transaction.findMany({
      where: whereClause,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * LIMIT,
      take: LIMIT,
      include: {
        paidBy: true,
        paidTo: true,
        campaign: true,
      },
    }),
    prisma.transaction.count({ where: whereClause }),
  ]);

  const toPay = await prisma.campaignParticipation.findMany({
    where: { status: "CONFIRMED" },
    include: { campaign: true, influencer: true },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppShell title={t("transactions")} nav={await getAdminNav()}>
      <div className="mb-8 space-y-3">
        <div className="text-sm font-medium text-slate-700">Filter</div>
        <form className="flex flex-wrap items-end gap-3" action="/admin/transactions">
          <label className="space-y-1.5 text-sm">
            <div className="text-xs font-medium text-slate-500">From</div>
            <input
              type="date"
              name="from"
              defaultValue={from}
              className="h-10 rounded-xl border border-slate-200/60 bg-white/50 px-4 shadow-sm backdrop-blur-sm transition-all focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
            />
          </label>
          <label className="space-y-1.5 text-sm">
            <div className="text-xs font-medium text-slate-500">To</div>
            <input
              type="date"
              name="to"
              defaultValue={to}
              className="h-10 rounded-xl border border-slate-200/60 bg-white/50 px-4 shadow-sm backdrop-blur-sm transition-all focus:border-violet-300 focus:outline-none focus:ring-2 focus:ring-violet-400/50"
            />
          </label>
          <button className="h-10 rounded-xl border border-slate-200/60 bg-white/50 px-5 text-sm font-medium shadow-sm backdrop-blur-sm transition-all hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700">
            Apply
          </button>
        </form>
      </div>

      <div className="mb-4 flex justify-end">
        <a
          href="/api/admin/transactions/export"
          className="rounded-xl border border-slate-200/60 bg-white/50 dark:bg-slate-900/50 dark:border-slate-700 px-4 py-2 text-sm font-medium shadow-sm hover:bg-violet-50 dark:hover:bg-violet-900/20 hover:border-violet-300 hover:text-violet-700 dark:hover:text-violet-300 transition-all"
        >
          Exporter CSV
        </a>
      </div>

      <div className="space-y-8">
        <div>
          <div className="mb-3 text-sm font-semibold text-slate-800">Ready to pay (manual)</div>
          <Table>
            <THead>
              <TR>
                <TH>Campaign</TH>
                <TH>Influencer</TH>
                <TH>Amount</TH>
                <TH className="text-right">Action</TH>
              </TR>
            </THead>
            <TBody>
              {toPay.length === 0 ? (
                <TR>
                  <TD colSpan={4} className="text-center text-slate-400">
                    Nothing to pay.
                  </TD>
                </TR>
              ) : (
                toPay.map((p) => (
                  <TR key={p.id}>
                    <TD className="font-medium text-slate-900">{p.campaign.title}</TD>
                    <TD>
                      {p.influencer.firstName} {p.influencer.lastName}
                    </TD>
                    <TD>{p.campaign.priceDinar.toLocaleString()} DZD</TD>
                    <TD className="text-right">
                      <ActionButton
                        size="sm"
                        url="/api/admin/transactions"
                        method="POST"
                        body={{ participationId: p.id }}
                      >
                        Mark paid
                      </ActionButton>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
          <div className="mt-2 text-xs text-slate-400">
            Stripe Connect payout will replace this action later.
          </div>
        </div>

        <div>
          <div className="mb-3 text-sm font-semibold text-slate-800">Transactions</div>
          <Table>
            <THead>
              <TR>
                <TH>Date</TH>
                <TH>Paid by</TH>
                <TH>Paid to</TH>
                <TH>Amount</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {txs.length === 0 ? (
                <TR>
                  <TD colSpan={5} className="text-center text-slate-400">
                    No transactions.
                  </TD>
                </TR>
              ) : (
                txs.map((t) => (
                  <TR key={t.id}>
                    <TD>
                      {t.createdAt.toLocaleString()}
                    </TD>
                    <TD>{t.paidBy.email}</TD>
                    <TD>{t.paidTo.email}</TD>
                    <TD>{t.grossAmountDinar.toLocaleString()} DZD</TD>
                    <TD>
                      <Badge variant={t.status === "PAID" ? "success" : t.status === "FAILED" ? "danger" : "warning"}>
                        {t.status}
                      </Badge>
                    </TD>
                  </TR>
                ))
              )}
            </TBody>
          </Table>
          <Pagination
            page={page}
            total={totalCount}
            limit={LIMIT}
            baseHref="/admin/transactions"
            existingParams={{ ...(from ? { from } : {}), ...(to ? { to } : {}) }}
          />
        </div>
      </div>
    </AppShell>
  );
}
