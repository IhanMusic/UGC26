import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function GET() {
  const user = await requireRole("COMPANY");
  const u = await prisma.user.findUnique({
    where: { id: user.id },
    include: { companyProfile: true },
  });
  return NextResponse.json({
    profile: {
      firstName: u?.firstName ?? "",
      lastName: u?.lastName ?? "",
      phone: u?.phone ?? "",
      position: u?.companyProfile?.position ?? "",
      companyName: u?.companyProfile?.companyName ?? "",
      companyDetails: u?.companyProfile?.companyDetails ?? "",
    },
  });
}
