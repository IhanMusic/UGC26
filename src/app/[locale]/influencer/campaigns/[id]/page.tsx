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
  const conversation = await prisma.conversation.findFirst({
    where: {
      campaignId: id,
      participants: { some: { userId: user.id } },
    },
    select: { id: true },
  });

  return (
    <AppShell title="Campaign" nav={influencerNav}>
      <InfluencerCampaignClient
        campaignId={id}
        conversationId={conversation?.id ?? null}
      />
    </AppShell>
  );
}
