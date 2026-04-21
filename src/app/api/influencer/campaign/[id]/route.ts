import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const user = await requireRole("INFLUENCER");
  const { id } = await params;

  const [campaign, participation] = await Promise.all([
    prisma.campaign.findUnique({ where: { id } }),
    prisma.campaignParticipation.findUnique({
      where: { campaignId_influencerId: { campaignId: id, influencerId: user.id } },
    }),
  ]);

  return NextResponse.json({ campaign, participation });
}
