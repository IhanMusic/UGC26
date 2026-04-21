import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import { sha256 } from "@/server/security";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | { token?: string; password?: string }
    | null;

  const token = body?.token ?? "";
  const password = body?.password ?? "";

  if (!token || password.length < 8) {
    return NextResponse.json(
      { error: "Invalid token or password too short" },
      { status: 400 }
    );
  }

  const tokenHash = sha256(token);
  const prt = await prisma.passwordResetToken.findUnique({
    where: { tokenHash },
    include: { user: true },
  });

  if (!prt || prt.expiresAt < new Date()) {
    return NextResponse.json({ error: "Token expired" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(password, 10);

  await prisma.$transaction([
    prisma.user.update({
      where: { id: prt.userId },
      data: { passwordHash },
    }),
    prisma.passwordResetToken.delete({ where: { tokenHash } }),
  ]);

  return NextResponse.json({ ok: true });
}
