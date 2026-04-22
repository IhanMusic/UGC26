import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "../../../influencer/_nav";
import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import CreatorPitchDetailClient from "./client";

export default async function CreatorPitchDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const user = await requireRole("INFLUENCER");
  const { id } = await params;
  const nav = await getInfluencerNav();
  const pitch = await prisma.creatorPitch.findFirst({
    where: { id, creatorId: user.id },
    include: {
      sponsorships: {
        include: {
          brand: {
            select: { id: true, firstName: true, lastName: true, imageUrl: true },
          },
        },
      },
      pitchDeliverables: true,
      categories: { include: { category: true } },
      campaign: true,
    },
  });
  if (!pitch) notFound();
  return (
    <AppShell title={pitch.title} nav={nav}>
      <CreatorPitchDetailClient pitch={pitch} />
    </AppShell>
  );
}
