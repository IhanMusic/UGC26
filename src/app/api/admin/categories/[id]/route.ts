import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function PATCH(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const { id } = await params;
  const body = (await req.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });
  const category = await prisma.category.update({ where: { id }, data: { name } });
  return NextResponse.json({ ok: true, category });
}

export async function DELETE(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const { id } = await params;
  await prisma.category.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
