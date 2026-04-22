import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";
import { sendEmail } from "@/server/email";
import { enqueueEmail } from "@/server/queues/email-queue";
import { env } from "@/server/env";
import { ApplicationPrevalidatedTemplate } from "@/emails/application-prevalidated";
import React from "react";

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
      influencer: { select: { firstName: true, lastName: true } },
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

  // Send email to company
  if (application.campaign.company.email) {
    const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const companyName = application.campaign.company.firstName ?? "";
    const influencerName = `${application.influencer.firstName} ${application.influencer.lastName}`;
    const campaignTitle = application.campaign.title;
    const applicantsUrl = `${base}/company/campaigns/${application.campaignId}/applicants`;
    const subject = `Candidature pré-validée pour "${campaignTitle}"`;

    const job = {
      type: "application-prevalidated" as const,
      to: application.campaign.company.email,
      subject,
      companyName,
      influencerName,
      campaignTitle,
      applicantsUrl,
    };

    const enqueued = await enqueueEmail(job);
    if (!enqueued) {
      await sendEmail({
        to: application.campaign.company.email,
        subject,
        react: React.createElement(ApplicationPrevalidatedTemplate, {
          companyName,
          influencerName,
          campaignTitle,
          applicantsUrl,
        }),
      });
    }
  }

  return NextResponse.json({ ok: true });
}
