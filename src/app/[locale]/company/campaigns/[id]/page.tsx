import { requireRole } from "@/server/guards";
import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { CampaignDetailClient } from "./client";

interface Props {
  params: Promise<{ id: string; locale: string }>;
}

export default async function CompanyCampaignDetailPage({ params }: Props) {
  const { id } = await params;
  await requireRole("COMPANY");

  const campaign = await prisma.campaign.findUnique({
    where: { id },
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

  return <CampaignDetailClient campaign={campaign} />;
}
