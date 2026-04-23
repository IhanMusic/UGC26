import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../../../_nav";
import { ActionButton } from "@/components/action-button";

export default async function CampaignApplicantsPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const user = await requireRole("COMPANY");
  const { id: campaignId } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, companyId: user.id },
  });
  if (!campaign) return <div>Campagne introuvable.</div>;

  const applications = await prisma.campaignApplication.findMany({
    where: { campaignId, adminPreValidated: true },
    include: {
      influencer: {
        include: {
          influencerProfile: { select: { socialNetworks: true, followersCountRange: true } },
        },
      },
    },
    orderBy: { createdAt: "asc" },
  });

  const participations = await prisma.campaignParticipation.findMany({
    where: { campaignId },
    select: { influencerId: true },
  });
  const selectedIds = new Set(participations.map((p) => p.influencerId));

  return (
    <AppShell title={`Candidats — ${campaign.title}`} nav={await getCompanyNav()}>
      {applications.length === 0 ? (
        <div className="rounded-xl border border-dashed border-[var(--border)] p-12 text-center">
          <p className="text-[var(--foreground-muted)]">Aucun candidat validé par l&apos;admin pour l&apos;instant.</p>
          <p className="mt-1 text-xs text-[var(--foreground-muted)]">L&apos;admin doit d&apos;abord pré-valider les candidatures.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {applications.map((app) => {
            const isSelected = selectedIds.has(app.influencerId);
            return (
              <div key={app.id} className="rounded-xl border border-[var(--border)] bg-[var(--surface-high)] p-5 space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold text-[var(--foreground)]">
                      {app.influencer.firstName} {app.influencer.lastName}
                    </div>
                    <div className="text-xs text-[var(--foreground-muted)]">{app.influencer.email}</div>
                  </div>
                  {isSelected && (
                    <span className="rounded-full bg-[var(--surface-mid)] px-2 py-0.5 text-xs text-[var(--success)]">
                      Sélectionné
                    </span>
                  )}
                </div>

                {app.influencer.influencerProfile?.followersCountRange && (
                  <div className="text-sm text-[var(--foreground-muted)]">
                    Abonnés : {app.influencer.influencerProfile.followersCountRange}
                  </div>
                )}

                <div className="flex flex-wrap gap-1">
                  {(app.influencer.influencerProfile?.socialNetworks ?? []).map((p) => (
                    <span key={p} className="rounded-full bg-[var(--primary-dim)] px-2 py-0.5 text-xs text-[var(--primary)]">
                      {p}
                    </span>
                  ))}
                </div>

                {!isSelected && (
                  <ActionButton
                    url="/api/payments/satim/initiate"
                    method="POST"
                    body={{ applicationId: app.id }}
                    className="w-full"
                  >
                    Sélectionner &amp; Payer
                  </ActionButton>
                )}
              </div>
            );
          })}
        </div>
      )}
    </AppShell>
  );
}
