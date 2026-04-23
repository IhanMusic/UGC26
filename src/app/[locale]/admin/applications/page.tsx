import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { getTranslations } from "next-intl/server";

export default async function AdminApplicationsPage() {
  await requireRole("ADMIN");
  const t = await getTranslations("nav");

  const applications = await prisma.campaignApplication.findMany({
    where: {
      adminPreValidated: false,
      status: "APPLIED",
    },
    include: {
      campaign: {
        select: { id: true, title: true },
      },
      influencer: {
        select: {
          id: true,
          firstName: true,
          lastName: true,
          influencerProfile: {
            select: {
              socialNetworks: true,
              followersCountRange: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell title={t("preValidation")} nav={await getAdminNav()}>
      <Table>
        <THead>
          <TR>
            <TH>Campagne</TH>
            <TH>Influenceur</TH>
            <TH>Plateformes</TH>
            <TH>Abonnés</TH>
            <TH>Date candidature</TH>
            <TH className="text-right">Action</TH>
          </TR>
        </THead>
        <TBody>
          {applications.length === 0 ? (
            <TR>
              <TD colSpan={6} className="text-center text-[var(--foreground-muted)]">
                Aucune candidature en attente de pré-validation.
              </TD>
            </TR>
          ) : (
            applications.map((app) => (
              <TR key={app.id}>
                <TD className="font-medium text-[var(--foreground)]">
                  {app.campaign.title}
                </TD>
                <TD>
                  {app.influencer.firstName} {app.influencer.lastName}
                </TD>
                <TD>
                  <div className="flex flex-wrap gap-1">
                    {app.influencer.influencerProfile?.socialNetworks.length ? (
                      app.influencer.influencerProfile.socialNetworks.map(
                        (platform) => (
                          <Badge
                            key={platform}
                            variant="secondary"
                            className="text-xs"
                          >
                            {platform}
                          </Badge>
                        )
                      )
                    ) : (
                      <span className="text-[var(--foreground-muted)] text-xs">—</span>
                    )}
                  </div>
                </TD>
                <TD>
                  {app.influencer.influencerProfile?.followersCountRange ?? (
                    <span className="text-[var(--foreground-muted)]">—</span>
                  )}
                </TD>
                <TD>{app.createdAt.toLocaleDateString()}</TD>
                <TD className="text-right">
                  <ActionButton
                    size="sm"
                    url={`/api/admin/applications/${app.id}/pre-validate`}
                    method="POST"
                  >
                    Pré-valider
                  </ActionButton>
                </TD>
              </TR>
            ))
          )}
        </TBody>
      </Table>
    </AppShell>
  );
}
