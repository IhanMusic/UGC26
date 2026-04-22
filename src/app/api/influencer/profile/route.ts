import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function PATCH(req: Request) {
  const user = await requireRole("INFLUENCER");
  const body = (await req.json().catch(() => null)) as
    | {
        firstName?: string;
        lastName?: string;
        phone?: string;
        dateOfBirth?: string;
        mainAccountLink?: string;
        address?: string;
        city?: string;
        country?: string;
        socialNetworks?: string[];
      }
    | null;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      firstName: body?.firstName ?? undefined,
      lastName: body?.lastName ?? undefined,
      phone: body?.phone ?? undefined,
      influencerProfile: {
        upsert: {
          create: {
            dateOfBirth: body?.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
            mainAccountLink: body?.mainAccountLink,
            address: body?.address,
            city: body?.city,
            country: body?.country,
            socialNetworks: body?.socialNetworks ?? [],
          },
          update: {
            dateOfBirth: body?.dateOfBirth ? new Date(body.dateOfBirth) : undefined,
            mainAccountLink: body?.mainAccountLink,
            address: body?.address,
            city: body?.city,
            country: body?.country,
            socialNetworks: body?.socialNetworks ?? [],
          },
        },
      },
    },
  });

  return NextResponse.json({ ok: true });
}
