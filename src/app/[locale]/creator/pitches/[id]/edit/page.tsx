import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "../../../../influencer/_nav";
import { prisma } from "@/server/db";
import { notFound, redirect } from "next/navigation";
import CreatorPitchEditClient from "./client";

export default async function CreatorPitchEditPage({
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
      pitchDeliverables: true,
      categories: { include: { category: true } },
    },
  });
  if (!pitch) notFound();
  if (pitch.status !== "DRAFT" && pitch.status !== "REJECTED") {
    redirect(`/creator/pitches/${id}`);
  }
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <AppShell title={`Modifier — ${pitch.title}`} nav={nav}>
      <CreatorPitchEditClient pitch={pitch} categories={categories} />
    </AppShell>
  );
}
