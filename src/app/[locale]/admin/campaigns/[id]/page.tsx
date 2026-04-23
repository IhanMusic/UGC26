import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../../_nav";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getTranslations } from "next-intl/server";

export default async function AdminCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const t = await getTranslations("nav");

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      company: { include: { companyProfile: true } },
      applications: {
        include: {
          influencer: {
            include: { influencerProfile: true },
          },
        },
      },
      participations: true,
    },
  });

  if (!campaign) {
    return (
      <AppShell title={t("campaignDetail")} nav={await getAdminNav()}>
        <div className="text-[var(--foreground-muted)]">Not found</div>
      </AppShell>
    );
  }

  return (
    <AppShell title={t("campaignDetail")} nav={await getAdminNav()}>
      <div className="grid gap-6 md:grid-cols-3">
        <Card className="md:col-span-2">
          <CardHeader>
            <CardTitle>{campaign.title}</CardTitle>
            <CardDescription>
              {campaign.priceDinar.toLocaleString()} DZD •{" "}
              {campaign.company.companyProfile?.companyName ?? campaign.company.email}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Badge variant={campaign.status === "PAID" ? "success" : "secondary"}>
                {campaign.status}
              </Badge>
            </div>
            <div className="text-sm text-[var(--foreground-muted)] whitespace-pre-wrap">
              {campaign.description}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Lifecycle</CardTitle>
            <CardDescription>Stripe future-ready</CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--foreground-muted)]">
            <div>
              Company payment: <Badge variant="secondary">Stripe (coming soon)</Badge>
            </div>
            <div>
              Influencer payout: <Badge variant="secondary">Stripe Connect (coming soon)</Badge>
            </div>
            <div className="text-xs text-[var(--foreground-muted)]">
              For now, use Transactions screen to mark as paid manually.
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <Card>
          <CardHeader>
            <CardTitle>Applicants</CardTitle>
            <CardDescription>Accept or reject influencer applications.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <THead>
                <TR>
                  <TH>Influencer</TH>
                  <TH>Email</TH>
                  <TH>Status</TH>
                  <TH className="text-right">Actions</TH>
                </TR>
              </THead>
              <TBody>
                {campaign.applications.map((a) => (
                  <TR key={a.id}>
                    <TD className="font-medium">
                      {a.influencer.firstName} {a.influencer.lastName}
                    </TD>
                    <TD className="text-[var(--foreground-muted)]">{a.influencer.email}</TD>
                    <TD>
                      <Badge
                        variant={
                          a.status === "ACCEPTED"
                            ? "success"
                            : a.status === "REJECTED"
                              ? "danger"
                              : "warning"
                        }
                      >
                        {a.status}
                      </Badge>
                    </TD>
                    <TD className="text-right">
                      <div className="inline-flex gap-2">
                        <ActionButton
                          size="sm"
                          variant="outline"
                          url={`/api/admin/campaigns/${campaign.id}/applications`}
                          method="PATCH"
                          body={{ influencerId: a.influencerId, action: "accept" }}
                          disabled={a.status === "ACCEPTED"}
                        >
                          Accept
                        </ActionButton>
                        <ActionButton
                          size="sm"
                          variant="destructive"
                          url={`/api/admin/campaigns/${campaign.id}/applications`}
                          method="PATCH"
                          body={{ influencerId: a.influencerId, action: "reject" }}
                          disabled={a.status === "REJECTED"}
                        >
                          Reject
                        </ActionButton>
                      </div>
                    </TD>
                  </TR>
                ))}
              </TBody>
            </Table>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
