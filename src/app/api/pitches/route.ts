import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { computeCompletenessScore } from "@/server/pitch-completeness";

function generateSlug(title: string): string {
  return title
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

async function uniqueSlug(base: string): Promise<string> {
  let slug = base;
  let i = 2;
  while (await prisma.creatorPitch.findUnique({ where: { slug } })) {
    slug = `${base}-${i++}`;
  }
  return slug;
}

export async function GET() {
  const user = await requireRole("INFLUENCER");
  const pitches = await prisma.creatorPitch.findMany({
    where: { creatorId: user.id },
    include: { categories: { include: { category: true } }, sponsorships: true },
    orderBy: { createdAt: "desc" },
  });
  return NextResponse.json({ pitches });
}

export async function POST(req: Request) {
  const user = await requireRole("INFLUENCER");
  const body = (await req.json().catch(() => null)) as {
    title?: string;
    type?: string;
    synopsis?: string;
    visibility?: string;
    budgetTarget?: number;
    categoryIds?: string[];
  } | null;

  if (!body?.title || !body.type || !body.budgetTarget || body.budgetTarget <= 0) {
    return NextResponse.json({ error: "title, type, budgetTarget requis" }, { status: 400 });
  }

  const slug = await uniqueSlug(generateSlug(body.title));

  const pitch = await prisma.creatorPitch.create({
    data: {
      creatorId: user.id,
      title: body.title,
      slug,
      type: body.type as any,
      synopsis: body.synopsis ?? "",
      budgetTarget: Math.round(body.budgetTarget),
      visibility: (body.visibility as any) ?? "PUBLIC",
      status: "DRAFT",
      categories: {
        create: (body.categoryIds ?? []).map((categoryId) => ({ categoryId })),
      },
    },
  });

  const { score } = computeCompletenessScore({
    synopsis: pitch.synopsis,
    coverImageUrl: pitch.coverImageUrl,
    platforms: pitch.platforms,
    targetAudience: pitch.targetAudience,
    timeline: pitch.timeline as any,
    teamDescription: pitch.teamDescription,
    storyboardUrls: pitch.storyboardUrls,
    pitchDocumentUrl: pitch.pitchDocumentUrl,
    pitchDeliverablesCount: 0,
  });

  const updated = await prisma.creatorPitch.update({
    where: { id: pitch.id },
    data: { completenessScore: score },
  });

  return NextResponse.json({ pitch: updated }, { status: 201 });
}
