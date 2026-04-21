import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

const KEY = "cancellation_tnc";

export async function GET() {
  await requireRole("ADMIN");
  const setting = await prisma.siteSetting.findUnique({ where: { key: KEY } });
  return NextResponse.json({ value: setting?.value ?? "" });
}

export async function PUT(req: Request) {
  await requireRole("ADMIN");
  const body = (await req.json().catch(() => null)) as { value?: string } | null;
  const value = body?.value ?? "";
  await prisma.siteSetting.upsert({
    where: { key: KEY },
    update: { value },
    create: { key: KEY, value },
  });
  return NextResponse.json({ ok: true });
}
