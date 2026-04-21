import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";

const createSchema = z.object({
  type: z.string().min(1),
  description: z.string().min(1),
  influencerId: z.string().optional(),
});

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { companyId: true },
  });
  if (!campaign || campaign.companyId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const deliverables = await prisma.deliverable.findMany({
    where: { campaignId: id },
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
  });

  return NextResponse.json(deliverables);
}

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: campaignId } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId },
    select: { companyId: true },
  });
  if (!campaign || campaign.companyId !== session.user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }

  const body = await req.json();
  const parsed = createSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten() }, { status: 400 });
  }

  const { type, description, influencerId } = parsed.data;

  if (influencerId) {
    const participation = await prisma.campaignParticipation.findFirst({
      where: {
        campaignId,
        influencerId,
        status: { in: ["ONGOING", "CONFIRMED", "COMPLETED", "PAID"] },
      },
    });
    if (!participation) {
      return NextResponse.json({ error: "Influencer is not an accepted participant" }, { status: 400 });
    }
    const deliverable = await prisma.deliverable.create({
      data: { campaignId, type, description, influencerId },
    });
    return NextResponse.json(deliverable, { status: 201 });
  } else {
    // Create for all accepted participants (ONGOING / CONFIRMED / COMPLETED / PAID)
    const participations = await prisma.campaignParticipation.findMany({
      where: {
        campaignId,
        status: { in: ["ONGOING", "CONFIRMED", "COMPLETED", "PAID"] },
      },
      select: { influencerId: true },
    });

    const deliverables = await Promise.all(
      participations.map((p) =>
        prisma.deliverable.create({
          data: { campaignId, type, description, influencerId: p.influencerId },
        }),
      ),
    );
    return NextResponse.json(deliverables, { status: 201 });
  }
}
