import { requireRole } from "@/server/guards";
import { prisma } from "@/server/db";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "@/app/[locale]/influencer/_nav";
import { BankDetailsForm } from "./bank-details-form";
import { getTranslations } from "next-intl/server";

export const metadata = { title: "Paiements" };

export default async function PaymentsPage() {
  const user = await requireRole("INFLUENCER");
  const t = await getTranslations("payments");
  const tNav = await getTranslations("nav");

  const transactions = await prisma.transaction.findMany({
    where: { paidToId: user.id },
    orderBy: { createdAt: "desc" },
  });

  const totalEarned = transactions
    .filter((t) => t.status === "PAID")
    .reduce((sum, t) => sum + t.netAmountInfluencer, 0);

  const pendingAmount = transactions
    .filter((t) => t.status === "PENDING")
    .reduce((sum, t) => sum + t.netAmountInfluencer, 0);

  return (
    <AppShell title={tNav("paymentInfo")} nav={await getInfluencerNav()}>
      <div className="space-y-8">
        <div>
          <h1 className="text-2xl font-bold text-[#E2E8F0]">{t("title")}</h1>
          <p className="text-[#64748B]">{t("subtitle")}</p>
        </div>

        {/* Summary cards */}
        <div className="grid grid-cols-2 gap-4">
          <div className="glass rounded-xl p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">{t("totalEarned")}</p>
            <p className="text-2xl font-bold text-[#FBBF24]">{totalEarned.toLocaleString("fr-DZ")} DZD</p>
          </div>
          <div className="glass rounded-xl p-5 space-y-1">
            <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">{t("pendingAmount")}</p>
            <p className="text-2xl font-bold text-[#94A3B8]">{pendingAmount.toLocaleString("fr-DZ")} DZD</p>
          </div>
        </div>

        {/* Transaction history */}
        <div className="glass rounded-xl overflow-hidden">
          <div className="border-b border-white/[0.08] px-5 py-3">
            <h2 className="font-semibold text-[#E2E8F0]">{t("historyTitle")}</h2>
          </div>
          {transactions.length === 0 ? (
            <div className="p-8 text-center text-[#64748B]">{t("noTransactions")}</div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-white/[0.08] text-left text-xs text-[#475569]">
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider">{t("colDate")}</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider">{t("colAmount")}</th>
                  <th className="px-5 py-3 font-semibold uppercase tracking-wider">{t("colStatus")}</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="px-5 py-3 text-sm text-[#94A3B8]">
                      {new Date(t.createdAt).toLocaleDateString("fr-FR")}
                    </td>
                    <td className="px-5 py-3 text-sm font-medium text-[#E2E8F0]">
                      {t.netAmountInfluencer.toLocaleString("fr-DZ")} DZD
                    </td>
                    <td className="px-5 py-3">
                      <span
                        className={`rounded-full px-2.5 py-1 text-xs font-medium ${
                          t.status === "PAID"
                            ? "bg-emerald-500/20 text-emerald-300"
                            : t.status === "PENDING"
                              ? "bg-amber-500/20 text-amber-300"
                              : "bg-white/10 text-white/60"
                        }`}
                      >
                        {t.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
        <p className="mt-2 text-xs text-slate-500">* Montant après déduction des frais de service (5%)</p>

        {/* Bank details form */}
        <BankDetailsForm />
      </div>
    </AppShell>
  );
}
