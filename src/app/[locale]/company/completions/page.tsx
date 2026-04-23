import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { ActionButton } from "@/components/action-button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import Image from "next/image";

export default async function CompanyCompletionsPage() {
  const user = await requireRole("COMPANY");
  const t = await getTranslations("nav");
  const tComp = await getTranslations("completions");

  const participations = await prisma.campaignParticipation.findMany({
    where: {
      campaign: { companyId: user.id },
      status: { in: ["COMPLETED", "CONFIRMED", "PAID"] },
    },
    include: {
      campaign: true,
      influencer: true,
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppShell title={t("completions")} nav={await getCompanyNav()}>
      <div className="space-y-6">
        {participations.map((p) => (
          <Card key={p.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between gap-3">
                <span>{p.campaign.title}</span>
                <Badge variant={p.status === "PAID" ? "success" : p.status === "CONFIRMED" ? "success" : "warning"}>
                  {p.status}
                </Badge>
              </CardTitle>
              <CardDescription>
                Influencer: {p.influencer.firstName} {p.influencer.lastName} ({p.influencer.email})
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {p.completionProofUrl ? (
                <div className="relative h-56 w-full overflow-hidden rounded-md">
                  <Image src={p.completionProofUrl} alt="completion proof" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
                </div>
              ) : (
                <div className="text-sm text-[var(--foreground-muted)]">{tComp("noProof")}</div>
              )}

              <div className="flex flex-wrap items-center gap-3">
                <ActionButton
                  url="/api/company/confirm-completion"
                  method="POST"
                  body={{ participationId: p.id }}
                  disabled={p.status !== "COMPLETED"}
                >
                  {tComp("confirmCompletion")}
                </ActionButton>

                <div className="text-xs text-[var(--foreground-muted)]">
                  {tComp("satimNote")}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </AppShell>
  );
}
