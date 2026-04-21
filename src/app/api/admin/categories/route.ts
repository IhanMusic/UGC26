import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function POST(req: Request) {
  await requireRole("ADMIN");
  const body = (await req.json().catch(() => null)) as { name?: string } | null;
  const name = body?.name?.trim();
  if (!name) return NextResponse.json({ error: "Missing name" }, { status: 400 });

  const category = await prisma.category.create({ data: { name } });
  return NextResponse.json({ ok: true, category });
}
