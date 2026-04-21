import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function CompanyCampaignsPage() {
  const user = await requireRole("COMPANY");
  const t = await getTranslations("nav");

  const [requests, campaigns] = await Promise.all([
    prisma.campaignRequest.findMany({
      where: { companyId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        priceDinar: true,
        status: true,
        createdAt: true,
      },
    }),
    prisma.campaign.findMany({
      where: { companyId: user.id },
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        title: true,
        priceDinar: true,
        status: true,
        createdAt: true,
      },
    }),
  ]);

  return (
    <AppShell title={t("myCampaigns")} nav={await getCompanyNav()}>
      <div className="space-y-8">
        <div>
          <div className="mb-2 text-sm font-medium text-slate-900">Requests</div>
          <Table>
            <THead>
              <TR>
                <TH>Title</TH>
                <TH>Price</TH>
                <TH>Status</TH>
              </TR>
            </THead>
            <TBody>
              {requests.map((r) => (
                <TR key={r.id}>
                  <TD className="font-medium">{r.title}</TD>
                  <TD className="text-slate-700">{r.priceDinar.toLocaleString()} DZD</TD>
                  <TD>
                    {r.status === "PENDING" ? (
                      <Badge variant="warning">Pending</Badge>
                    ) : r.status === "APPROVED" ? (
                      <Badge variant="success">Approved</Badge>
                    ) : (
                      <Badge variant="danger">Rejected</Badge>
                    )}
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>

        <div>
          <div className="mb-2 text-sm font-medium text-slate-900">Published campaigns</div>
          <Table>
            <THead>
              <TR>
                <TH>Title</TH>
                <TH>Price</TH>
                <TH>Status</TH>
                <TH></TH>
              </TR>
            </THead>
            <TBody>
              {campaigns.map((c) => (
                <TR key={c.id}>
                  <TD className="font-medium">{c.title}</TD>
                  <TD className="text-slate-700">{c.priceDinar.toLocaleString()} DZD</TD>
                  <TD>
                    <Badge variant={c.status === "PAID" ? "success" : "secondary"}>{c.status}</Badge>
                  </TD>
                  <TD>
                    <Link
                      href={`/company/campaigns/${c.id}`}
                      className="text-sm text-violet-400 hover:text-violet-300"
                    >
                      Voir →
                    </Link>
                  </TD>
                </TR>
              ))}
            </TBody>
          </Table>
        </div>
      </div>
    </AppShell>
  );
}
