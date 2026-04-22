import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";

export async function PATCH(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const user = await requireRole("COMPANY");

  const sponsorship = await prisma.pitchSponsorship.findUnique({
    where: { id },
    include: {
      pitch: {
        include: { sponsorships: true },
      },
    },
  });

  if (!sponsorship) return NextResponse.json({ error: "Not found" }, { status: 404 });
  if (sponsorship.brandId !== user.id)
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });

  const pitch = sponsorship.pitch;
  const paidSponsors = pitch.sponsorships.filter(
    (s) => s.status === "PAID" || s.status === "COMMITTED"
  );

  // Count how many have approved (using brandMessage as a flag — stores "APPROVED")
  // This brand's approval is counted as +1 (they haven't set it yet)
  const alreadyApproved = paidSponsors.filter(
    (s) => s.brandMessage === "APPROVED" && s.id !== id
  ).length;
  const approvedCount = alreadyApproved + 1;
  const majority = approvedCount > paidSponsors.length / 2;

  // Mark this sponsorship as having approved
  await prisma.pitchSponsorship.update({
    where: { id },
    data: { brandMessage: "APPROVED" },
  });

  if (majority) {
    await prisma.notification.create({
      data: {
        userId: pitch.creatorId,
        type: "PITCH_FINAL_PAYMENT",
        title: "Livrables approuvés !",
        message: `La majorité des sponsors a approuvé vos livrables pour "${pitch.title}". Le 2ème versement (50%) va être déclenché.`,
        link: `/creator/pitches/${pitch.id}`,
      },
    });
  }

  return NextResponse.json({ ok: true, majority });
}
