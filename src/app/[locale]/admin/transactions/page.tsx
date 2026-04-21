import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
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

  const txs = await prisma.transaction.findMany({
    where: {
      ...(fromDate || toDate
        ? {
            createdAt: {
              ...(fromDate ? { gte: fromDate } : {}),
              ...(toDate ? { lte: new Date(toDate.getTime() + 24 * 3600 * 1000) } : {}),
            },
          }
        : {}),
    },
    orderBy: { createdAt: "desc" },
    include: {
      paidBy: true,
      paidTo: true,
      campaign: true,
    },
  });

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
                    <TD>{t.amountDinar.toLocaleString()} DZD</TD>
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
        </div>
      </div>
    </AppShell>
  );
}
