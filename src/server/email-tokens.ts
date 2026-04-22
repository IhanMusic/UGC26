import { randomBytes, createHash } from "crypto";
import { prisma } from "@/server/db";
import { enqueueEmail } from "@/server/queues/email-queue";
import { sendEmail } from "@/server/email";
import { VerifyEmailTemplate } from "@/emails/verify-email";
import React from "react";

export function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export async function createEmailVerificationToken(userId: string): Promise<string> {
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const { raw, hash } = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash: hash, expiresAt },
  });

  return raw;
}

export async function sendVerificationEmail(
  email: string,
  token: string,
  baseUrl: string,
  firstName = "là"
) {
  const verifyUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  const subject = "Vérifiez votre email — UGC26";

  const job = {
    type: "verify-email" as const,
    to: email,
    subject,
    firstName,
    verifyUrl,
  };

  const queued = await enqueueEmail(job);
  if (!queued) {
    await sendEmail({
      to: email,
      subject,
      react: React.createElement(VerifyEmailTemplate, { firstName, verifyUrl }),
    });
  }
}
