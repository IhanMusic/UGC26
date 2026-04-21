import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as
    | { action?: "approve" | "reject" }
    | null;

  const action = body?.action;
  if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

  const request = await prisma.campaignRequest.findUnique({
    where: { id },
    include: { categories: true },
  });
  if (!request) return NextResponse.json({ error: "Not found" }, { status: 404 });

  if (action === "reject") {
    await prisma.campaignRequest.update({
      where: { id },
      data: { status: "REJECTED" },
    });
    await createNotification({
      userId: request.companyId,
      type: "GENERAL",
      title: "Demande de campagne refusée",
      message: `Votre demande de campagne "${request.title}" a été refusée.`,
      link: "/company/campaigns",
    });
    return NextResponse.json({ ok: true });
  }

  // approve: publish campaign
  const admin = await prisma.user.findFirst({ where: { role: "ADMIN" } });
  if (!admin) return NextResponse.json({ error: "Missing admin" }, { status: 500 });

  await prisma.$transaction(async (tx) => {
    await tx.campaignRequest.update({
      where: { id },
      data: { status: "APPROVED" },
    });

    await tx.campaign.create({
      data: {
        requestId: request.id,
        companyId: request.companyId,
        createdById: admin.id,
        title: request.title,
        priceDinar: request.priceDinar,
        photoUrl: request.photoUrl ?? undefined,
        additionalPhotoUrls: request.additionalPhotoUrls,
        description: request.description,
        objectivePlatforms: request.objectivePlatforms,
        minFollowers: request.minFollowers,
        ageRange: request.ageRange,
        country: request.country,
        categories: {
          create: request.categories.map((c) => ({ categoryId: c.categoryId })),
        },
      },
    });
  });

  await createNotification({
    userId: request.companyId,
    type: "CAMPAIGN_PUBLISHED",
    title: "Campagne publiée !",
    message: `Votre campagne "${request.title}" a été approuvée et publiée.`,
    link: "/company/campaigns",
  });

  return NextResponse.json({ ok: true });
}
