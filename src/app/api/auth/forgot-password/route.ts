import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { randomToken, sha256 } from "@/server/security";
import { sendEmail } from "@/server/email";
import { enqueueEmail } from "@/server/queues/email-queue";
import { env } from "@/server/env";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as { email?: string } | null;
  const email = body?.email?.toLowerCase().trim();

  // Always return 200 to avoid account enumeration
  if (!email) return NextResponse.json({ ok: true });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || user.isDeleted) return NextResponse.json({ ok: true });

  const token = randomToken(32);
  const tokenHash = sha256(token);
  const expiresAt = new Date(Date.now() + 1000 * 60 * 30); // 30 min

  await prisma.passwordResetToken.create({
    data: {
      userId: user.id,
      tokenHash,
      expiresAt,
    },
  });

  const baseUrl = env.NEXTAUTH_URL ?? "http://localhost:3000";
  const resetUrl = `${baseUrl}/auth/reset-password?token=${token}`;

  const payload = {
    to: email,
    subject: "Reset your password",
    html: `Click to reset: <a href="${resetUrl}">${resetUrl}</a>`,
  };

  const enqueued = await enqueueEmail(payload);
  if (!enqueued) {
    await sendEmail(payload);
  }

  return NextResponse.json({ ok: true });
}
