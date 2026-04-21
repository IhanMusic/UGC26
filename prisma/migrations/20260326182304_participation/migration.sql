-- CreateEnum
CREATE TYPE "ParticipationStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CONFIRMED', 'PAID');

-- CreateTable
CREATE TABLE "CampaignParticipation" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "status" "ParticipationStatus" NOT NULL DEFAULT 'UPCOMING',
    "scheduledStartDate" TIMESTAMP(3),
    "startProofUrl" TEXT,
    "completionProofUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignParticipation_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "CampaignParticipation_campaignId_influencerId_key" ON "CampaignParticipation"("campaignId", "influencerId");

-- AddForeignKey
ALTER TABLE "CampaignParticipation" ADD CONSTRAINT "CampaignParticipation_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignParticipation" ADD CONSTRAINT "CampaignParticipation_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
