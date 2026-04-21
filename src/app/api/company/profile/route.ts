import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function PATCH(req: Request) {
  const user = await requireRole("COMPANY");
  const body = (await req.json().catch(() => null)) as
    | {
        firstName?: string;
        lastName?: string;
        phone?: string;
        position?: string;
        companyName?: string;
        companyDetails?: string;
      }
    | null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: body?.firstName ?? undefined,
      lastName: body?.lastName ?? undefined,
      phone: body?.phone ?? undefined,
      companyProfile: {
        upsert: {
          create: {
            position: body?.position,
            companyName: body?.companyName,
            companyDetails: body?.companyDetails,
          },
          update: {
            position: body?.position,
            companyName: body?.companyName,
            companyDetails: body?.companyDetails,
          },
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
