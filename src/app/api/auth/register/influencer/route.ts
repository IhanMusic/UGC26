import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { prisma } from "@/server/db";
import {
  createEmailVerificationToken,
  sendVerificationEmail,
} from "@/server/email-tokens";

export async function POST(req: Request) {
  const body = (await req.json().catch(() => null)) as
    | {
        step1?: {
          firstName?: string;
          lastName?: string;
          email?: string;
          phone?: string;
          mainAccountLink?: string;
          password?: string;
          acceptTos?: boolean;
        };
        step2?: Record<string, unknown>;
      }
    | null;

  const step1 = body?.step1;
  const step2 = body?.step2;

  const step2Val = (key: string) => (step2 ? step2[key] : undefined);
  const step2Str = (key: string) => {
    const v = step2Val(key);
    return typeof v === "string" ? v : null;
  };
  const step2Bool = (key: string) => {
    const v = step2Val(key);
    return typeof v === "boolean" ? v : null;
  };

  const email = step1?.email?.toLowerCase().trim();
  if (!email || !step1?.password || !step1.firstName || !step1.lastName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!step1.acceptTos) {
    return NextResponse.json({ error: "TOS must be accepted" }, { status: 400 });
  }
  if (step1.password.length < 8) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(step1.password, 10);

  const createdUser = await prisma.user.create({
    data: {
      role: "INFLUENCER",
      firstName: step1.firstName,
      lastName: step1.lastName,
      email,
      phone: step1.phone,
      passwordHash,
      influencerProfile: {
        create: {
          mainAccountLink: step1.mainAccountLink,
          ownsComputer: step2Bool("ownsComputer"),
          emailCheckFrequency: step2Str("emailCheckFrequency"),
          internetHabits: step2Str("internetHabits"),
          socialNetworks: step2Str("socialNetworks"),
          passion: step2Str("passion"),
          followersCountRange: step2Str("followersCountRange"),
          postFrequency: step2Str("postFrequency"),
          goal: step2Str("goal"),
          ethicsImportant: step2Bool("ethicsImportant"),
          ethicsTop3Elements: step2Str("ethicsTop3Elements"),
          trustLevel: step2Str("trustLevel"),
          shareOpinionsImportant: step2Bool("shareOpinionsImportant"),
          brandCommitmentsImportant: step2Bool("brandCommitmentsImportant"),
        },
      },
    },
  });

  const baseUrl = process.env.NEXTAUTH_URL ?? "http://localhost:3000";
  const verifyToken = await createEmailVerificationToken(createdUser.id);
  try {
    await sendVerificationEmail(createdUser.email, verifyToken, baseUrl);
  } catch (err) {
    console.error("Verification email failed to send:", err);
    // User created successfully; they can resend via /api/auth/resend-verification
  }

  return NextResponse.json({ ok: true });
}
