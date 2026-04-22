import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "../../_nav";
import InfluencerCampaignClient from "./client";
import { prisma } from "@/server/db";
import { getTranslations } from "next-intl/server";

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

export default async function InfluencerCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("INFLUENCER");
  const { id } = await params;
  const t = await getTranslations("nav");

  // Find the conversation for this campaign where this influencer is a participant
  const [conversation, participation] = await Promise.all([
    prisma.conversation.findFirst({
      where: {
        campaignId: id,
        participants: { some: { userId: user.id } },
      },
      select: { id: true },
    }),
    prisma.campaignParticipation.findUnique({
      where: { campaignId_influencerId: { campaignId: id, influencerId: user.id } },
      include: {
        campaign: {
          select: {
            id: true,
            companyId: true,
            company: {
              select: { id: true, firstName: true, lastName: true },
            },
          },
        },
      },
    }),
  ]);

  // Check if review banner should be shown
  let reviewBanner: {
    reviewedId: string;
    reviewedName: string;
    hasReviewed: boolean;
  } | null = null;

  if (
    participation &&
    (participation.status === "CONFIRMED" || participation.status === "PAID")
  ) {
    const existingReview = await prisma.review.findFirst({
      where: { reviewerId: user.id, campaignId: id },
    });
    reviewBanner = {
      reviewedId: participation.campaign.companyId,
      reviewedName: `${participation.campaign.company.firstName} ${participation.campaign.company.lastName}`,
      hasReviewed: !!existingReview,
    };
  }

  return (
    <AppShell title={t("campaignDetail")} nav={await getInfluencerNav()}>
      <InfluencerCampaignClient
        campaignId={id}
        conversationId={conversation?.id ?? null}
        reviewBanner={reviewBanner}
      />
    </AppShell>
  );
}
