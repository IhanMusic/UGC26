import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "INFLUENCER") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  const { id: campaignId } = await params;

  const deliverables = await prisma.deliverable.findMany({
    where: { campaignId, influencerId: session.user.id },
    orderBy: { createdAt: "asc" },
  });

  return NextResponse.json(deliverables);
}
