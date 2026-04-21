import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import {
  createEmailVerificationToken,
  sendVerificationEmail,
} from "@/server/email-tokens";

const rateLimit = new Map<string, number>(); // simple in-memory rate limit

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const userId = session.user.id;
  const lastSent = rateLimit.get(userId);
  if (lastSent && Date.now() - lastSent < 60_000) {
    return NextResponse.json(
      { error: "Veuillez attendre 1 minute avant de renvoyer" },
      { status: 429 }
    );
  }
  rateLimit.set(userId, Date.now());

  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { email: true, isVerified: true },
  });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });

  if (user.isVerified) {
    return NextResponse.json({ error: "Already verified" }, { status: 400 });
  }

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const token = await createEmailVerificationToken(userId);
  await sendVerificationEmail(user.email, token, baseUrl);

  return NextResponse.json({ ok: true });
}
