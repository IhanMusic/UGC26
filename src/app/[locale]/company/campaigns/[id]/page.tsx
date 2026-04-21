import { requireRole } from "@/server/guards";
import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { CampaignDetailClient } from "./client";

interface Props {
  params: Promise<{ id: string; locale: string }>;
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
  );
}
