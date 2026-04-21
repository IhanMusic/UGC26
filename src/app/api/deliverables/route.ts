import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";

// GET /api/deliverables?campaignId=xxx — list deliverables for a campaign
export async function GET(req: NextRequest) {
  const user = await requireUser();
  const campaignId = req.nextUrl.searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const where: Record<string, unknown> = { campaignId };
  if (user.role === "INFLUENCER") where.influencerId = user.id;

  const deliverables = await prisma.deliverable.findMany({
    where,
    orderBy: { createdAt: "desc" },
    include: { influencer: { select: { id: true, firstName: true, lastName: true } } },
  });
  return NextResponse.json(deliverables);
}

// POST /api/deliverables — influencer submits a deliverable
export async function POST(req: NextRequest) {
  const user = await requireUser();
  if (user.role !== "INFLUENCER") {
    return NextResponse.json({ error: "Only influencers can submit deliverables" }, { status: 403 });
  }

  const body = await req.json();
  const { campaignId, type, description, fileUrl } = body;
  if (!campaignId || !type) {
    return NextResponse.json({ error: "campaignId and type required" }, { status: 400 });
  }

  const participation = await prisma.campaignParticipation.findUnique({
    where: { campaignId_influencerId: { campaignId, influencerId: user.id } },
  });
  if (!participation) {
    return NextResponse.json({ error: "Not a participant of this campaign" }, { status: 403 });
  }

  const deliverable = await prisma.deliverable.create({
    data: {
      campaignId,
      influencerId: user.id,
      type,
      description: description || null,
      fileUrl: fileUrl || null,
      status: fileUrl ? "SUBMITTED" : "PENDING",
    },
  });
  return NextResponse.json(deliverable, { status: 201 });
}
