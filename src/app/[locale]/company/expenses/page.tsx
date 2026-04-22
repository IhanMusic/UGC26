import { requireRole } from "@/server/guards";
import { prisma } from "@/server/db";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../_nav";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Table, THead, TBody, TR, TH, TD } from "@/components/ui/table";
import { getTranslations } from "next-intl/server";

export default async function CompanyExpensesPage() {
  const user = await requireRole("COMPANY");
  const t = await getTranslations("nav");

  const transactions = await prisma.transaction.findMany({
    where: { paidById: user.id },
    include: {
      paidTo: { select: { firstName: true, lastName: true } },
      campaign: { select: { title: true } },
    },
    orderBy: { createdAt: "desc" },
  });

  const totalPaid = transactions
    .filter((tx) => tx.status === "PAID")
    .reduce((sum, tx) => sum + tx.grossAmountDinar, 0);

  return (
    <AppShell title={t("expenses")} nav={await getCompanyNav()}>
      <div className="mb-6">
        <Card className="max-w-xs">
          <CardHeader className="pb-2">
            <CardDescription>Total payé (PAID)</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold tracking-tight text-amber-600">
              {totalPaid.toLocaleString()} DZD
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Détail des dépenses</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <THead>
              <TR>
                <TH>Date</TH>
                <TH>Campagne</TH>
                <TH>Influenceur</TH>
                <TH>Montant base</TH>
                <TH>Frais (10%)</TH>
                <TH>Total payé</TH>
                <TH>Statut</TH>
              </TR>
            </THead>
            <TBody>
              {transactions.length === 0 ? (
                <TR>
                  <TD colSpan={7} className="text-center text-slate-400">
                    Aucune dépense.
                  </TD>
                </TR>
              ) : (
                transactions.map((tx) => {
                  const base = tx.grossAmountDinar - tx.platformFeeCompany;
                  return (
                    <TR key={tx.id}>
                      <TD className="text-xs text-slate-500 whitespace-nowrap">
                        {tx.createdAt.toLocaleDateString("fr-DZ")}
                      </TD>
                      <TD className="font-medium text-slate-900">
                        {tx.campaign?.title ?? "—"}
                      </TD>
                      <TD>
                        {tx.paidTo.firstName} {tx.paidTo.lastName}
                      </TD>
                      <TD>{base.toLocaleString()} DZD</TD>
                      <TD className="text-amber-600">
                        {tx.platformFeeCompany.toLocaleString()} DZD
                      </TD>
                      <TD className="font-semibold">
                        {tx.grossAmountDinar.toLocaleString()} DZD
                      </TD>
                      <TD>
                        <Badge
                          variant={
                            tx.status === "PAID"
                              ? "success"
                              : tx.status === "FAILED"
                              ? "danger"
                              : "warning"
                          }
                        >
                          {tx.status}
                        </Badge>
                      </TD>
                    </TR>
                  );
                })
              )}
            </TBody>
          </Table>
        </CardContent>
      </Card>
    </AppShell>
  );
}
