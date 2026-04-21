import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { influencerNav } from "../../_nav";
import InfluencerCampaignClient from "./client";
import { prisma } from "@/server/db";

export default async function InfluencerCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("INFLUENCER");
  const { id } = await params;

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
    <AppShell title="Campaign" nav={influencerNav}>
      <InfluencerCampaignClient
        campaignId={id}
        conversationId={conversation?.id ?? null}
        reviewBanner={reviewBanner}
      />
    </AppShell>
  );
}
