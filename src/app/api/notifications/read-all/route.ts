import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireUser } from "@/server/guards";

export async function PATCH() {
  const user = await requireUser();
  await prisma.notification.updateMany({
    where: { userId: user.id, read: false },
    data: { read: true },
  });
  return NextResponse.json({ ok: true });
}
