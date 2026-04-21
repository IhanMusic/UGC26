import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getTranslations } from "next-intl/server";

export default async function AdminRequestsPage() {
  await requireRole("ADMIN");
  const t = await getTranslations("nav");

  const requests = await prisma.campaignRequest.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      company: { include: { companyProfile: true } },
      categories: { include: { category: true } },
      approvedCampaign: { select: { id: true } },
    },
  });

  return (
    <AppShell title={t("requestedCampaigns")} nav={await getAdminNav()}>
      <Table>
        <THead>
          <TR>
            <TH>Title</TH>
            <TH>Company</TH>
            <TH>Price</TH>
            <TH>Status</TH>
            <TH className="text-right">Actions</TH>
          </TR>
        </THead>
        <TBody>
          {requests.map((r) => (
            <TR key={r.id}>
              <TD className="font-medium text-slate-900">{r.title}</TD>
              <TD>
                {r.company.companyProfile?.companyName ?? r.company.email}
              </TD>
              <TD>{r.priceDinar.toLocaleString()} DZD</TD>
              <TD>
                {r.status === "PENDING" ? (
                  <Badge variant="warning">Pending</Badge>
                ) : r.status === "APPROVED" ? (
                  <Badge variant="success">Approved</Badge>
                ) : (
                  <Badge variant="danger">Rejected</Badge>
                )}
              </TD>
              <TD className="text-right">
                <div className="inline-flex gap-2">
                  {r.status === "PENDING" ? (
                    <>
                      <ActionButton
                        size="sm"
                        url={`/api/admin/requests/${r.id}`}
                        method="PATCH"
                        body={{ action: "approve" }}
                      >
                        Approve & publish
                      </ActionButton>
                      <ActionButton
                        size="sm"
                        variant="destructive"
                        url={`/api/admin/requests/${r.id}`}
                        method="PATCH"
                        body={{ action: "reject" }}
                        confirm="Reject this request?"
                      >
                        Reject
                      </ActionButton>
                    </>
                  ) : r.status === "APPROVED" && r.approvedCampaign ? (
                    <a
                      href={`/admin/campaigns?focus=${r.approvedCampaign.id}`}
                      className="text-sm font-medium text-violet-600 underline underline-offset-4 hover:text-violet-700"
                    >
                      View campaign
                    </a>
                  ) : null}
                </div>
              </TD>
            </TR>
          ))}
        </TBody>
      </Table>
    </AppShell>
  );
}
