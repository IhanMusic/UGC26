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
    include: { pitchDeliverables: true },
  });
  if (!pitch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pitch.creatorId !== user.id && user.role !== "ADMIN")
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const { score, missing } = computeCompletenessScore({
    synopsis: pitch.synopsis,
    coverImageUrl: pitch.coverImageUrl,
    platforms: pitch.platforms,
    targetAudience: pitch.targetAudience,
    timeline: pitch.timeline as any,
    teamDescription: pitch.teamDescription,
    storyboardUrls: pitch.storyboardUrls,
    pitchDocumentUrl: pitch.pitchDocumentUrl,
    pitchDeliverablesCount: pitch.pitchDeliverables.length,
  });

  return NextResponse.json({ score, missing });
}
