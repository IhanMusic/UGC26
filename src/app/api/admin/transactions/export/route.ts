import { requireRole } from "@/server/guards";
import { prisma } from "@/server/db";

export async function GET() {
  await requireRole("ADMIN");

  const txs = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      paidBy: { select: { email: true, firstName: true, lastName: true } },
      paidTo: { select: { email: true, firstName: true, lastName: true } },
      campaign: { select: { title: true } },
    },
  });

  const header =
    "Date,Entreprise (email),Influenceur (email),Campagne,Montant base (DZD),Frais company (DZD),Frais influenceur (DZD),Net influenceur (DZD),Montant brut (DZD),Statut\n";

  const rows = txs
    .map((tx) => {
      const priceDinar = tx.grossAmountDinar - tx.platformFeeCompany;
      return [
        tx.createdAt.toISOString(),
        tx.paidBy.email,
        tx.paidTo.email,
        `"${(tx.campaign?.title ?? "").replace(/"/g, '""')}"`,
        priceDinar,
        tx.platformFeeCompany,
        tx.platformFeeInfluencer,
        tx.netAmountInfluencer,
        tx.grossAmountDinar,
        tx.status,
      ].join(",");
    })
    .join("\n");

  const csv = "\uFEFF" + header + rows;

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
