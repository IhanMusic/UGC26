import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const { id } = await params;

  const application = await prisma.campaignApplication.findUnique({
    where: { id },
    include: {
      campaign: { include: { company: true } },
      influencer: true,
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (application.adminPreValidated) {
    return NextResponse.json({ ok: true }); // idempotent
  }

  await prisma.campaignApplication.update({
    where: { id },
    data: { adminPreValidated: true },
  });

  await createNotification({
    userId: application.campaign.companyId,
    type: "APPLICATION_PRE_VALIDATED",
    title: "Candidature pré-validée",
    message: `${application.influencer.firstName} ${application.influencer.lastName} a été pré-validé(e) pour votre campagne "${application.campaign.title}".`,
    link: `/company/campaigns/${application.campaignId}/applicants`,
  });

  return NextResponse.json({ ok: true });
}
