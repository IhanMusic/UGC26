import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { influencerNav } from "../../_nav";
import InfluencerCampaignClient from "./client";

export default async function InfluencerCampaignPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await requireRole("INFLUENCER");
  const { id } = await params;
  return (
    <AppShell title="Campaign" nav={influencerNav}>
      <InfluencerCampaignClient campaignId={id} />
    </AppShell>
  );
}
