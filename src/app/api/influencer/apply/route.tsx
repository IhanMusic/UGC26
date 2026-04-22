import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { sendEmail } from "@/server/email";
import { enqueueEmail } from "@/server/queues/email-queue";
import { env } from "@/server/env";
import { NewApplicationTemplate } from "@/emails/new-application";
import React from "react";

export async function POST(req: Request) {
  const user = await requireRole("INFLUENCER");
  const body = (await req.json().catch(() => null)) as
    | { campaignId?: string }
    | null;

  const campaignId = body?.campaignId;
  if (!campaignId) {
    return NextResponse.json({ error: "Missing campaignId" }, { status: 400 });
  }

  const campaign = await prisma.campaign.findUnique({ where: { id: campaignId } });
  if (!campaign) {
    return NextResponse.json({ error: "Campaign not found" }, { status: 404 });
  }

  await prisma.campaignApplication.upsert({
    where: { campaignId_influencerId: { campaignId, influencerId: user.id } },
    update: { status: "APPLIED" },
    create: {
      campaignId,
      influencerId: user.id,
      status: "APPLIED",
    },
  });

  // Send notification email to the company
  const campaignWithCompany = await prisma.campaign.findUnique({
    where: { id: campaignId },
    include: { company: true },
  });
  if (campaignWithCompany?.company.email) {
    const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    const companyName = campaignWithCompany.company.firstName ?? "";
    const influencerName = user.name ?? "";
    const campaignTitle = campaignWithCompany.title;
    const applicantsUrl = `${base}/company/campaigns/${campaignId}/applicants`;
    const subject = `Nouvelle candidature pour "${campaignTitle}"`;

    const job = {
      type: "new-application" as const,
      to: campaignWithCompany.company.email,
      subject,
      companyName,
      influencerName,
      campaignTitle,
      applicantsUrl,
    };

    const enqueued = await enqueueEmail(job);
    if (!enqueued) {
      await sendEmail({
        to: campaignWithCompany.company.email,
        subject,
        react: React.createElement(NewApplicationTemplate, {
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
