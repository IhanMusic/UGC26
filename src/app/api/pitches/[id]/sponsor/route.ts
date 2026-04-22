import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { transitionPitchToFunded } from "@/server/pitch-transition";

export async function POST(
  req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireRole("COMPANY");

  const body = (await req.json().catch(() => null)) as {
    amountDZD?: number;
    brandMessage?: string;
  } | null;

  if (!body?.amountDZD || body.amountDZD <= 0)
    return NextResponse.json({ error: "amountDZD requis" }, { status: 400 });

  const pitch = await prisma.creatorPitch.findUnique({
    where: { id },
    include: { sponsorships: true },
  });
  if (!pitch) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (pitch.status !== "PUBLISHED" && pitch.status !== "FUNDED")
    return NextResponse.json({ error: "Pitch not open for sponsorship" }, { status: 422 });

  const existing = pitch.sponsorships.find((s) => s.brandId === user.id);
  if (existing)
    return NextResponse.json({ error: "Vous sponsorisez déjà ce projet" }, { status: 409 });

  const totalSponsors = pitch.sponsorships.length;
  const maxAllowed = pitch.maxSponsors + pitch.bonusSponsorSlots;
  if (totalSponsors >= maxAllowed)
    return NextResponse.json({ error: "Slots sponsors complets" }, { status: 422 });

  const totalCommitted = pitch.sponsorships
    .filter((s) => ["COMMITTED", "PAID"].includes(s.status))
    .reduce((sum, s) => sum + s.amountDZD, 0);

  const isBonus = totalCommitted >= pitch.budgetTarget;
  const percentageShare = (body.amountDZD / pitch.budgetTarget) * 100;

  await prisma.pitchSponsorship.create({
    data: {
      pitchId: id,
      brandId: user.id,
      amountDZD: Math.round(body.amountDZD),
      percentageShare: Math.round(percentageShare * 100) / 100,
      isBonus,
      status: "COMMITTED",
      brandMessage: body.brandMessage,
    },
  });

  await prisma.notification.create({
    data: {
      userId: pitch.creatorId,
      type: "SPONSOR_JOINED",
      title: "Nouveau sponsor !",
      message: `Une marque a rejoint votre projet "${pitch.title}" avec ${body.amountDZD.toLocaleString()} DZD.`,
      link: `/creator/pitches/${pitch.id}`,
    },
  });

  // Re-fetch sponsorship to return it
  const freshPitch = await prisma.creatorPitch.findUniqueOrThrow({
    where: { id },
    include: { sponsorships: true },
  });

  const newTotalCommitted = freshPitch.sponsorships
    .filter((s) => ["COMMITTED", "PAID"].includes(s.status))
    .reduce((sum, s) => sum + s.amountDZD, 0);

  if (newTotalCommitted >= pitch.budgetTarget && !isBonus) {
    await transitionPitchToFunded(id);
  }

  return NextResponse.json({ ok: true }, { status: 201 });
}
