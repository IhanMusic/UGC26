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
        firstName?: string;
        lastName?: string;
        email?: string;
        position?: string;
        companyName?: string;
        phone?: string;
        password?: string;
        acceptTos?: boolean;
      }
    | null;

  const email = body?.email?.toLowerCase().trim();
  if (!email || !body?.password || !body.firstName || !body.lastName) {
    return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
  }
  if (!body.acceptTos) {
    return NextResponse.json({ error: "TOS must be accepted" }, { status: 400 });
  }
  if (body.password.length < 8) {
    return NextResponse.json({ error: "Password too short" }, { status: 400 });
  }

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    return NextResponse.json({ error: "Email already registered" }, { status: 400 });
  }

  const passwordHash = await bcrypt.hash(body.password, 10);

  const createdUser = await prisma.user.create({
    data: {
      role: "COMPANY",
      firstName: body.firstName,
      lastName: body.lastName,
      email,
      phone: body.phone,
      passwordHash,
      companyProfile: {
        create: {
          position: body.position,
          companyName: body.companyName,
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
