import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../../_nav";
import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import AdminPitchReviewClient from "./client";

export default async function AdminPitchReviewPage({
  params,
}: {
  params: Promise<{ id: string; locale: string }>;
}) {
  await requireRole("ADMIN");
  const { id } = await params;
  const nav = await getAdminNav();

  const pitch = await prisma.creatorPitch.findUnique({
    where: { id },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, email: true, imageUrl: true } },
      pitchDeliverables: true,
      categories: { include: { category: true } },
      sponsorships: { select: { amountDZD: true } },
    },
  });

  if (!pitch) notFound();

  return (
    <AppShell title={`Validation — ${pitch.title}`} nav={nav}>
      <AdminPitchReviewClient pitch={pitch} />
    </AppShell>
  );
}
