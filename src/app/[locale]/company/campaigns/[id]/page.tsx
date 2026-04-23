import { requireRole } from "@/server/guards";
import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { CampaignDetailClient } from "./client";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../../_nav";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { title: true, description: true },
  });
  if (!campaign) return { title: "Campagne introuvable" };
  return {
    title: campaign.title,
    description: campaign.description?.slice(0, 160),
    openGraph: {
      title: campaign.title,
      description: campaign.description?.slice(0, 160),
    },
  };
}

export default async function CompanyCampaignDetailPage({ params }: Props) {
  const { id } = await params;
  const user = await requireRole("COMPANY");

  const campaign = await prisma.campaign.findUnique({
    where: { id, companyId: user.id },
    include: {
      participations: {
        include: {
          influencer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
              imageUrl: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
      deliverables: {
        include: {
          influencer: {
            select: {
              id: true,
              firstName: true,
              lastName: true,
              email: true,
            },
          },
        },
        orderBy: { createdAt: "desc" },
      },
    },
  });

  if (!campaign) notFound();

  // Find any existing conversation for this campaign (company side: any participant)
  const conversation = await prisma.conversation.findFirst({
    where: { campaignId: campaign.id },
    select: { id: true },
  });

  // Check if review banner should be shown (first CONFIRMED or PAID participation)
  const reviewableParticipation = campaign.participations.find(
    (p) => p.status === "CONFIRMED" || p.status === "PAID",
  );

  let hasReviewed = false;
  if (reviewableParticipation) {
    const existingReview = await prisma.review.findFirst({
      where: {
        reviewerId: user.id,
        campaignId: campaign.id,
      },
    });
    hasReviewed = !!existingReview;
  }

  return (
    <AppShell title={campaign.title} nav={await getCompanyNav()}>
      <div className="mb-4 flex justify-end">
        <Link
          href={`/company/campaigns/${campaign.id}/applicants`}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--primary)] px-4 py-2 text-sm font-medium text-[var(--background)] hover:bg-[var(--primary)]"
        >
          Voir les candidats
        </Link>
      </div>
      <CampaignDetailClient
        campaign={campaign}
        conversationId={conversation?.id ?? null}
        reviewBanner={
          reviewableParticipation
            ? {
                reviewedId: reviewableParticipation.influencer.id,
                reviewedName: `${reviewableParticipation.influencer.firstName} ${reviewableParticipation.influencer.lastName}`,
                hasReviewed,
              }
            : null
        }
      />
    </AppShell>
  );
}
