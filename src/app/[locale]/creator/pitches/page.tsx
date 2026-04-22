import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "../../influencer/_nav";
import { prisma } from "@/server/db";
import CreatorPitchesClient from "./client";

export default async function CreatorPitchesPage() {
  const user = await requireRole("INFLUENCER");
  const nav = await getInfluencerNav();
  const pitches = await prisma.creatorPitch.findMany({
    where: { creatorId: user.id },
    include: {
      sponsorships: true,
      categories: { include: { category: true } },
    },
    orderBy: { updatedAt: "desc" },
  });
  return (
    <AppShell title="Mes Projets" nav={nav}>
      <CreatorPitchesClient pitches={pitches} />
    </AppShell>
  );
}
