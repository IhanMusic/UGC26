import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";
import { computeCompletenessScore } from "@/server/pitch-completeness";

export async function GET(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireUser();

  const pitch = await prisma.creatorPitch.findUnique({
    where: { id },
    include: {
      sponsorships: {
        include: {
          brand: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
        },
      },
      pitchDeliverables: true,
      categories: { include: { category: true } },
      creator: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
    },
  });

  if (!pitch) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (user.role === "INFLUENCER" && pitch.creatorId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  if (user.role === "COMPANY" && pitch.status === "DRAFT")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  return NextResponse.json({ pitch });
}

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireUser();

  const pitch = await prisma.creatorPitch.findUnique({
    where: { id },
    include: { pitchDeliverables: true },
  });
  if (!pitch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pitch.creatorId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const body = (await req.json().catch(() => null)) as Record<string, unknown> | null;
  if (!body) return NextResponse.json({ error: "Invalid body" }, { status: 400 });

  if (body.action === "submit") {
    if (!["DRAFT", "REJECTED"].includes(pitch.status))
      return NextResponse.json({ error: "Cannot submit in current status" }, { status: 422 });
    const updated = await prisma.creatorPitch.update({
      where: { id },
      data: { status: "PENDING_REVIEW" },
    });
    return NextResponse.json({ pitch: updated });
  }

  if (body.action === "close") {
    const updated = await prisma.creatorPitch.update({
      where: { id },
      data: { status: "CLOSED" },
    });
    return NextResponse.json({ pitch: updated });
  }

  if (!["DRAFT", "REJECTED"].includes(pitch.status))
    return NextResponse.json({ error: "Cannot edit in current status" }, { status: 422 });

  const allowedFields = [
    "title", "synopsis", "targetAudience", "platforms", "ageRange", "country",
    "contentDuration", "timeline", "teamDescription", "references",
    "budgetTarget", "maxSponsors", "bonusSponsorSlots",
    "storyboardUrls", "pitchDocumentUrl", "coverImageUrl", "visibility", "type",
  ];

  const data: Record<string, unknown> = {};
  for (const key of allowedFields) {
    if (key in body) data[key] = body[key];
  }

  if (body.categoryIds && Array.isArray(body.categoryIds)) {
    await prisma.pitchCategory.deleteMany({ where: { pitchId: id } });
    await prisma.pitchCategory.createMany({
      data: (body.categoryIds as string[]).map((categoryId) => ({ pitchId: id, categoryId })),
    });
  }

  if (Object.keys(data).length > 0) {
    await prisma.creatorPitch.update({ where: { id }, data });
  }

  // Recalculate completeness
  const freshPitch = await prisma.creatorPitch.findUniqueOrThrow({
    where: { id },
    include: { pitchDeliverables: true },
  });

  const { score } = computeCompletenessScore({
    synopsis: freshPitch.synopsis,
    coverImageUrl: freshPitch.coverImageUrl,
    platforms: freshPitch.platforms,
    targetAudience: freshPitch.targetAudience,
    timeline: freshPitch.timeline as any,
    teamDescription: freshPitch.teamDescription,
    storyboardUrls: freshPitch.storyboardUrls,
    pitchDocumentUrl: freshPitch.pitchDocumentUrl,
    pitchDeliverablesCount: freshPitch.pitchDeliverables.length,
  });

  const final = await prisma.creatorPitch.update({
    where: { id },
    data: { completenessScore: score },
  });

  return NextResponse.json({ pitch: final });
}
