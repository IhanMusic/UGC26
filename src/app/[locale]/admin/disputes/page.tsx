import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { DisputeActions } from "./client";
import { getTranslations } from "next-intl/server";

export default async function AdminDisputesPage() {
  await requireRole("ADMIN");
  const t = await getTranslations("nav");

  const disputes = await prisma.dispute.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      campaign: { select: { id: true, title: true } },
      raisedBy: { select: { id: true, firstName: true, lastName: true, email: true, role: true } },
    },
  });

  const statusVariant = (s: string) => {
    if (s === "OPEN") return "warning" as const;
    if (s === "UNDER_REVIEW") return "secondary" as const;
    if (s === "RESOLVED") return "success" as const;
    return "danger" as const;
  };

  return (
    <AppShell title={t("disputes")} nav={await getAdminNav()}>
      {disputes.length === 0 ? (
        <div className="text-center text-slate-400 py-12">No disputes.</div>
      ) : (
        <Table>
          <THead>
            <TR>
              <TH>Campaign</TH>
              <TH>Raised by</TH>
              <TH>Reason</TH>
              <TH>Status</TH>
              <TH>Resolution</TH>
              <TH>Actions</TH>
            </TR>
          </THead>
          <TBody>
            {disputes.map((d) => (
              <TR key={d.id}>
                <TD className="font-medium">{d.campaign.title}</TD>
                <TD className="text-sm text-slate-600">
                  {d.raisedBy.firstName} {d.raisedBy.lastName}
                  <div className="text-xs text-slate-400">{d.raisedBy.role}</div>
                </TD>
                <TD className="max-w-xs text-sm text-slate-600 truncate">{d.reason}</TD>
                <TD><Badge variant={statusVariant(d.status)}>{d.status}</Badge></TD>
                <TD className="max-w-xs text-sm text-slate-500 truncate">{d.resolution ?? "—"}</TD>
                <TD>
                  {(d.status === "OPEN" || d.status === "UNDER_REVIEW") ? (
                    <DisputeActions disputeId={d.id} />
                  ) : (
                    <span className="text-xs text-slate-400">Done</span>
                  )}
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      )}
    </AppShell>
  );
}
