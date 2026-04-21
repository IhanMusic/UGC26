import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ user: null }, { status: 401 });
  }

  const id = session.user.id;
  const user = await prisma.user.findUnique({
    where: { id },
    select: {
      id: true,
      role: true,
      firstName: true,
      lastName: true,
      email: true,
      isVerified: true,
      isBlocked: true,
      isDeleted: true,
    },
  });

  return NextResponse.json({ user });
}
