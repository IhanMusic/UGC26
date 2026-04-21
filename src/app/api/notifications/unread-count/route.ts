import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";

export async function GET() {
  const user = await requireUser();
  const count = await prisma.notification.count({
    where: { userId: user.id, read: false },
  });
  return NextResponse.json({ count });
}
