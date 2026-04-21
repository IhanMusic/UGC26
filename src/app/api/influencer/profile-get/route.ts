import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function GET() {
  const user = await requireRole("INFLUENCER");
  const u = await prisma.user.findUnique({
    where: { id: user.id },
    include: { influencerProfile: true },
  });

  return NextResponse.json({
    profile: {
      firstName: u?.firstName ?? "",
      lastName: u?.lastName ?? "",
      phone: u?.phone ?? "",
      dateOfBirth: u?.influencerProfile?.dateOfBirth
        ? u.influencerProfile.dateOfBirth.toISOString().slice(0, 10)
        : "",
      mainAccountLink: u?.influencerProfile?.mainAccountLink ?? "",
      address: u?.influencerProfile?.address ?? "",
      city: u?.influencerProfile?.city ?? "",
      country: u?.influencerProfile?.country ?? "",
    },
    selectedCategoryIds: await prisma.influencerCategory
      .findMany({
        where: { influencerId: user.id },
        select: { categoryId: true },
      })
      .then((rows) => rows.map((r) => r.categoryId)),
  });
}
