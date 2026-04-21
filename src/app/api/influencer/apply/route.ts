import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function POST(req: Request) {
  const user = await requireRole("INFLUENCER");
  const body = (await req.json().catch(() => null)) as
    | { campaignId?: string }
    | null;

  const campaignId = body?.campaignId;
  if (!campaignId) {
    return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  await prisma.campaignApplication.upsert({
    where: { campaignId_influencerId: { campaignId, influencerId: user.id } },
    update: { status: "APPLIED" },
    create: {
      campaignId,
      influencerId: user.id,
      status: "APPLIED",
    },
  });

  return NextResponse.json({ ok: true });
}
