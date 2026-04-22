import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../../_nav";
import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import CompanyProjetDetailClient from "./client";

export default async function CompanyProjetDetailPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  const user = await requireRole("COMPANY");
  const { id } = await params;
  const nav = await getCompanyNav();

  const pitch = await prisma.creatorPitch.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
      sponsorships: {
        select: { amountDZD: true, brandId: true, status: true },
      },
      pitchDeliverables: true,
      categories: { include: { category: true } },
    },
  });

  if (!pitch) notFound();

  const mySponsorship = pitch.sponsorships.find((s) => s.brandId === user.id);

  // Gate: must be PUBLISHED/FUNDED, or if IN_PRODUCTION/COMPLETED — brand must be a sponsor
  const canView =
    (pitch.status === "PUBLISHED" || pitch.status === "FUNDED") ||
    (mySponsorship != null && ["IN_PRODUCTION", "COMPLETED"].includes(pitch.status));

  if (!canView) notFound();

  return (
    <AppShell title={pitch.title} nav={nav}>
      <CompanyProjetDetailClient pitch={pitch} alreadySponsored={mySponsorship != null} />
    </AppShell>
  );
}
