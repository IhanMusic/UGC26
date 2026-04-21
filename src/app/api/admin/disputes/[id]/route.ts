import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { jsonError, ApiError } from "@/server/api-errors";

// PATCH – admin resolves/dismisses a dispute
export async function PATCH(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user || session.user.role !== "ADMIN") {
      throw new ApiError("FORBIDDEN", "Admin only", 403);
    }

    const { id } = await params;
    const { action, resolution } = (await req.json()) as {
      action: "resolve" | "dismiss";
      resolution?: string;
    };

    if (!["resolve", "dismiss"].includes(action)) {
      throw new ApiError("BAD_REQUEST", "Invalid action", 400);
    }

    const dispute = await prisma.dispute.update({
      where: { id },
      data: {
        status: action === "resolve" ? "RESOLVED" : "DISMISSED",
        resolution: resolution?.trim() || null,
      },
    });

    return NextResponse.json(dispute);
  } catch (e) {
    return jsonError(e);
  }
}
