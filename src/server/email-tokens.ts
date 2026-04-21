import { randomBytes, createHash } from "crypto";
import { prisma } from "@/server/db";
import { enqueueEmail } from "@/server/queues/email-queue";
import { sendEmail } from "@/server/email";

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
  baseUrl: string
) {
  const url = `${baseUrl}/api/auth/verify-email?token=${token}`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h1 style="font-size:24px;font-weight:800;color:#080B18;">Vérifiez votre email</h1>
      <p style="color:#64748B;margin:16px 0;">Cliquez sur le lien ci-dessous pour activer votre compte UGC26. Ce lien expire dans 24h.</p>
      <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#4F46E5);color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;margin:16px 0;">
        Vérifier mon email →
      </a>
      <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>
  `;

  const job = { to: email, subject: "Vérifiez votre email — UGC26", html };
  const queued = await enqueueEmail(job);
  if (!queued) await sendEmail(job); // fallback if no Redis
}
