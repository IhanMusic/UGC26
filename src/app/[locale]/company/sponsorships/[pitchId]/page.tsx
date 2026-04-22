import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../../_nav";
import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import SponsorshipDetailClient from "./client";

export default async function CompanySponsorshipDetailPage({
  params,
}: {
  params: Promise<{ pitchId: string; locale: string }>;
}) {
  const user = await requireRole("COMPANY");
  const { pitchId } = await params;
  const nav = await getCompanyNav();

  const sponsorship = await prisma.pitchSponsorship.findUnique({
    where: { pitchId_brandId: { pitchId, brandId: user.id } },
  });
  if (!sponsorship) notFound();

  const pitch = await prisma.creatorPitch.findUnique({
    where: { id: pitchId },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
      sponsorships: { select: { amountDZD: true, brandId: true, status: true } },
      pitchDeliverables: true,
      categories: { include: { category: true } },
    },
  });
  if (!pitch) notFound();

  return (
    <AppShell title={pitch.title} nav={nav}>
      <SponsorshipDetailClient pitch={pitch} sponsorship={sponsorship} />
    </AppShell>
  );
}
