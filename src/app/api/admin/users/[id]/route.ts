import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const { id } = await params;
  const body = (await _req.json().catch(() => null)) as
    | { action?: "verify" | "block" | "unblock" | "delete" | "restore" }
    | null;

  const action = body?.action;
  if (!action) return NextResponse.json({ error: "Missing action" }, { status: 400 });

  const data: Record<string, unknown> = {};
  if (action === "verify") data.isVerified = true;
  if (action === "block") data.isBlocked = true;
  if (action === "unblock") data.isBlocked = false;
  if (action === "delete") data.isDeleted = true;
  if (action === "restore") data.isDeleted = false;

  const user = await prisma.user.update({
    where: { id },
    data,
    select: {
      id: true,
      email: true,
      role: true,
      isVerified: true,
      isBlocked: true,
      isDeleted: true,
    },
  });

  return NextResponse.json({ ok: true, user });
}
