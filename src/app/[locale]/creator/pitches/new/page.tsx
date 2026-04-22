import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "../../../influencer/_nav";
import { prisma } from "@/server/db";
import CreatorPitchNewClient from "./client";

export default async function CreatorPitchNewPage() {
  await requireRole("INFLUENCER");
  const nav = await getInfluencerNav();
  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });
  return (
    <AppShell title="Nouveau Projet" nav={nav}>
      <CreatorPitchNewClient categories={categories} />
    </AppShell>
  );
}
