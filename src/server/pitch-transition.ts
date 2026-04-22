// src/server/pitch-transition.ts
import { prisma } from "@/server/db";

export async function transitionPitchToFunded(pitchId: string): Promise<void> {
  await prisma.$transaction(async (tx) => {
    const pitch = await tx.creatorPitch.findUniqueOrThrow({
      where: { id: pitchId },
      include: { sponsorships: true },
    });

    if (pitch.status !== "PUBLISHED") return;

    const totalCommitted = pitch.sponsorships
      .filter((s) => s.status === "COMMITTED" || s.status === "PAID")
      .reduce((sum, s) => sum + s.amountDZD, 0);

    if (totalCommitted < pitch.budgetTarget) return;

    // 1. Create the Campaign
    const campaign = await tx.campaign.create({
      data: {
        title: pitch.title,
        priceDinar: pitch.budgetTarget,
        description: pitch.synopsis,
        status: "UPCOMING",
        companyId: pitch.creatorId,
        createdById: pitch.creatorId,
      },
    });

    // 2. Update CreatorPitch: set campaignId and move to IN_PRODUCTION
    await tx.creatorPitch.update({
      where: { id: pitchId },
      data: {
        status: "IN_PRODUCTION",
        campaignId: campaign.id,
      },
    });

    // 3. Create first Transaction (50%)
    const firstPayment = Math.floor(pitch.budgetTarget * 0.5);
    await tx.transaction.create({
      data: {
        paidById: pitch.creatorId,
        paidToId: pitch.creatorId,
        pitchId: pitch.id,
        campaignId: campaign.id,
        grossAmountDinar: firstPayment,
        platformFeeCompany: 0,
        platformFeeInfluencer: 0,
        netAmountInfluencer: firstPayment,
        provider: "SATIM",
        status: "PENDING",
      },
    });

    // 4. Notify creator
    await tx.notification.create({
      data: {
        userId: pitch.creatorId,
        type: "PITCH_FUNDED",
        title: "🎉 Ton projet est financé !",
        message: `"${pitch.title}" a atteint son budget cible. Le 1er versement (50%) est en cours de traitement.`,
        link: `/creator/pitches/${pitch.id}`,
      },
    });

    // 5. Notify all sponsors
    await Promise.all(
      pitch.sponsorships.map((s) =>
        tx.notification.create({
          data: {
            userId: s.brandId,
            type: "PITCH_FUNDED",
            title: "Projet financé",
            message: `Le projet "${pitch.title}" que vous sponsorisez est maintenant financé à 100%. La production démarre.`,
            link: `/company/sponsorships/${pitch.id}`,
          },
        })
      )
    );
  });
}
