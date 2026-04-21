import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  if (!token) {
    return NextResponse.redirect(new URL("/en/auth/verify-email?error=invalid", req.url));
  }

  const hash = createHash("sha256").update(token).digest("hex");
  const record = await prisma.emailVerificationToken.findUnique({
    where: { tokenHash: hash },
  });

  if (!record || record.expiresAt < new Date()) {
    if (record) await prisma.emailVerificationToken.delete({ where: { tokenHash: hash } });
    return NextResponse.redirect(new URL("/en/auth/verify-email?error=expired", req.url));
  }

  await prisma.user.update({
    where: { id: record.userId },
    data: { isVerified: true },
  });
  await prisma.emailVerificationToken.delete({ where: { tokenHash: hash } });

  return NextResponse.redirect(new URL("/en/dashboard?verified=1", req.url));
}
