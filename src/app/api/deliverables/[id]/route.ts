import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";

// PATCH /api/deliverables/[id] — company approves/rejects, or influencer updates file
export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser().catch(() => null);
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const { id } = await params;
  const body = await req.json();

  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
    include: { campaign: { select: { companyId: true } } },
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
