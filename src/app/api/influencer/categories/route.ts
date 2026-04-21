import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function PUT(req: Request) {
  const user = await requireRole("INFLUENCER");
  const body = (await req.json().catch(() => null)) as
    | { categoryIds?: string[] }
    | null;
  const categoryIds = body?.categoryIds ?? [];

  await prisma.influencerCategory.deleteMany({
    where: { influencerId: user.id },
  });

  if (categoryIds.length) {
    await prisma.influencerCategory.createMany({
      data: categoryIds.map((categoryId) => ({
        influencerId: user.id,
        categoryId,
      })),
      skipDuplicates: true,
    });
  }

  return NextResponse.json({ ok: true });
}
