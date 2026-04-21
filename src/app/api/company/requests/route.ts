import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { saveBase64Image } from "@/server/uploads";

export async function POST(req: Request) {
  const user = await requireRole("COMPANY");
  const body = (await req.json().catch(() => null)) as
    | {
        title?: string;
        priceDinar?: number;
        description?: string;
        objectivePlatforms?: string;
        minFollowers?: number;
        ageRange?: string;
        country?: string;
        categoryIds?: string[];
        photoDataUrl?: string;
        additionalPhotoDataUrls?: string[];
      }
    | null;

  if (!body?.title || !body.priceDinar || !body.description) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }

  const additional = (body.additionalPhotoDataUrls ?? []).slice(0, 5);

  const [photoUrl, additionalPhotoUrls] = await Promise.all([
    body.photoDataUrl ? saveBase64Image(body.photoDataUrl) : Promise.resolve(null),
    Promise.all(additional.map((d) => saveBase64Image(d))),
  ]);

  const request = await prisma.campaignRequest.create({
    data: {
      companyId: user.id,
      title: body.title,
      priceDinar: Math.round(Number(body.priceDinar)),
      description: body.description,
      objectivePlatforms: body.objectivePlatforms,
      minFollowers: body.minFollowers ? Math.round(Number(body.minFollowers)) : null,
      ageRange: body.ageRange,
      country: body.country,
      photoUrl: photoUrl ?? undefined,
      additionalPhotoUrls,
      categories: {
        create: (body.categoryIds ?? []).map((categoryId) => ({ categoryId })),
      },
    },
  });

  return NextResponse.json({ ok: true, request });
}
