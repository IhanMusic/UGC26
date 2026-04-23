import { prisma } from "@/server/db";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignApplyButton } from "@/components/campaign-apply-button";

export default async function CampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    include: {
      categories: { include: { category: true } },
      company: {
        include: {
          companyProfile: true,
        },
      },
      applications: session?.user
        ? { where: { influencerId: session.user.id } }
        : false,
    },
  });

  if (!campaign) {
    return (
      <main className="flex-1 bg-mesh">
        <div className="mx-auto max-w-3xl px-4 py-16 text-[var(--foreground-muted)]">
          Campaign not found.
        </div>
      </main>
    );
  }

  const existing = Array.isArray(campaign.applications)
    ? campaign.applications[0]
    : null;

  return (
    <main className="flex-1 bg-mesh">
      <div className="mx-auto max-w-4xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-5">
          <div className="md:col-span-3">
            <Card className="overflow-hidden group">
              {campaign.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={campaign.photoUrl}
                  alt={campaign.title}
                  className="h-64 w-full object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
              <CardHeader>
                <CardTitle className="text-2xl">{campaign.title}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-sm text-[var(--foreground-muted)]">
                  Price: <span className="font-semibold text-[var(--foreground)]">{campaign.priceDinar.toLocaleString()} DZD</span>
                </div>
                <div className="flex flex-wrap gap-2">
                  {campaign.categories.map((c) => (
                    <Badge key={c.categoryId} variant="secondary">
                      {c.category.name}
                    </Badge>
                  ))}
                </div>
                <div className="text-sm text-[var(--foreground-muted)] whitespace-pre-wrap">
                  {campaign.description}
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="md:col-span-2 space-y-5">
            <Card>
              <CardHeader>
                <CardTitle>Qualifications</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm text-[var(--foreground-muted)]">
                <div className="flex justify-between"><span>Min followers</span><span className="font-medium text-[var(--foreground)]">{campaign.minFollowers ?? "—"}</span></div>
                <div className="flex justify-between"><span>Age range</span><span className="font-medium text-[var(--foreground)]">{campaign.ageRange ?? "—"}</span></div>
                <div className="flex justify-between"><span>Country</span><span className="font-medium text-[var(--foreground)]">{campaign.country ?? "—"}</span></div>
                <div className="flex justify-between"><span>Objective</span><span className="font-medium text-[var(--foreground)]">{campaign.objectivePlatforms ?? "—"}</span></div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Company</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="font-medium text-[var(--foreground)]">
                  {campaign.company.companyProfile?.companyName ??
                    `${campaign.company.firstName} ${campaign.company.lastName}`}
                </div>
                <div className="text-[var(--foreground-muted)]">
                  {campaign.company.companyProfile?.companyDetails ?? "—"}
                </div>
              </CardContent>
            </Card>

            <div className="space-y-2">
              {session?.user?.role === "INFLUENCER" ? (
                existing ? (
                  <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 py-3 text-sm text-[var(--foreground-muted)] backdrop-blur-xl">
                    You already applied: <span className="font-semibold text-[var(--primary)]">{existing.status}</span>
                  </div>
                ) : (
                  <CampaignApplyButton campaignId={campaign.id} />
                )
              ) : (
                <div className="rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 py-3 text-sm text-[var(--foreground-muted)] backdrop-blur-xl">
                  Login as influencer to apply.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
