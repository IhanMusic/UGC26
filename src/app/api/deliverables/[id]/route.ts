import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";
import { sendEmail } from "@/server/email";
import { enqueueEmail } from "@/server/queues/email-queue";
import { env } from "@/server/env";
import { DeliverableSubmittedTemplate } from "@/emails/deliverable-submitted";
import React from "react";

async function sendDeliverableSubmittedEmail(deliverable: {
  campaign: { title: string; company: { email: string | null; firstName: string | null; id: string } };
  influencer: { firstName: string | null; lastName: string | null } | null;
  campaignId: string;
}) {
  const { campaign, influencer } = deliverable;
  if (!campaign.company.email) return;
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const companyName = campaign.company.firstName ?? "";
  const influencerName = influencer
    ? `${influencer.firstName ?? ""} ${influencer.lastName ?? ""}`.trim()
    : "";
  const campaignTitle = campaign.title;
  const deliverablesUrl = `${base}/company/campaigns/${deliverable.campaignId}/deliverables`;
  const subject = `Nouveau livrable soumis pour "${campaignTitle}"`;

  const job = {
    type: "deliverable-submitted" as const,
    to: campaign.company.email,
    subject,
    companyName,
    influencerName,
    campaignTitle,
    deliverablesUrl,
  };

  const enqueued = await enqueueEmail(job);
  if (!enqueued) {
    await sendEmail({
      to: campaign.company.email,
      subject,
      react: React.createElement(DeliverableSubmittedTemplate, {
        companyName,
        influencerName,
        campaignTitle,
        deliverablesUrl,
      }),
    });
  }
}

// PATCH /api/deliverables/[id] — company approves/rejects, or influencer updates file
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
    include: {
      campaign: { include: { company: true } },
      influencer: { select: { firstName: true, lastName: true } },
    },
  });
  if (!deliverable) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  // Company can approve/reject
  if (user.role === "COMPANY" && deliverable.campaign.companyId === user.id) {
    // Support both { action: "approve"|"reject", feedback? } and legacy { status, feedback }
    let resolvedStatus: string;
    let resolvedFeedback: string | null = null;

    if (body.action === "approve") {
      resolvedStatus = "APPROVED";
    } else if (body.action === "reject") {
      resolvedStatus = "REJECTED";
      resolvedFeedback = body.feedback || null;
    } else {
      // Legacy format: { status, feedback }
      const { status, feedback } = body;
      if (!["APPROVED", "REJECTED"].includes(status)) {
        return NextResponse.json(
          { error: "Status must be APPROVED or REJECTED" },
          { status: 400 },
        );
      }
      resolvedStatus = status;
      resolvedFeedback = feedback || null;
    }

    const updated = await prisma.deliverable.update({
      where: { id },
      data: { status: resolvedStatus as "APPROVED" | "REJECTED", feedback: resolvedFeedback },
    });
    return NextResponse.json(updated);
  }

  // Influencer can submit/update file
  if (user.role === "INFLUENCER") {
    if (deliverable.influencerId !== user.id) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }

    // Explicit submit action: { action: "submit", fileUrl: string }
    if (body.action === "submit") {
      const { fileUrl } = body as { fileUrl?: string };
      if (!fileUrl || typeof fileUrl !== "string") {
        return NextResponse.json({ error: "fileUrl is required" }, { status: 400 });
      }
      const updated = await prisma.deliverable.update({
        where: { id },
        data: { fileUrl, status: "SUBMITTED" as const },
      });
      await sendDeliverableSubmittedEmail(deliverable);
      return NextResponse.json(updated);
    }

    // Legacy: { fileUrl?, description? }
    const { fileUrl, description } = body;
    const updated = await prisma.deliverable.update({
      where: { id },
      data: {
        ...(fileUrl !== undefined && { fileUrl, status: "SUBMITTED" as const }),
        ...(description !== undefined && { description }),
      },
    });
    if (fileUrl !== undefined) {
      await sendDeliverableSubmittedEmail(deliverable);
    }
    return NextResponse.json(updated);
  }

  // Admin can also approve/reject
  if (user.role === "ADMIN") {
    const { status, feedback } = body;
    const updated = await prisma.deliverable.update({
      where: { id },
      data: {
        ...(status && { status }),
        ...(feedback !== undefined && { feedback }),
      },
    });
    return NextResponse.json(updated);
  }

  return NextResponse.json({ error: "Forbidden" }, { status: 403 });
}
