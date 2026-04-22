-- CreateEnum
CREATE TYPE "PitchType" AS ENUM ('MINI_FILM', 'SERIE', 'SHOOTING', 'PODCAST', 'REPORTAGE', 'CLIP_MUSICAL', 'DOCUMENTAIRE', 'AUTRE');

-- CreateEnum
CREATE TYPE "PitchVisibility" AS ENUM ('PUBLIC', 'PRIVATE');

-- CreateEnum
CREATE TYPE "PitchStatus" AS ENUM ('DRAFT', 'PENDING_REVIEW', 'PUBLISHED', 'FUNDED', 'IN_PRODUCTION', 'COMPLETED', 'CLOSED', 'REJECTED');

-- CreateEnum
CREATE TYPE "SponsorshipStatus" AS ENUM ('INTERESTED', 'COMMITTED', 'PAID', 'REFUNDED');

-- CreateEnum
CREATE TYPE "PitchDeliverableType" AS ENUM ('MENTION', 'LOGO_PLACEMENT', 'PRODUCT_INTEGRATION', 'EXCLUSIVE_RIGHTS', 'CUSTOM');

-- AlterEnum
-- This migration adds more than one value to an enum.
-- With PostgreSQL versions 11 and earlier, this is not possible
-- in a single migration. This can be worked around by creating
-- multiple migrations, each migration adding only one value to
-- the enum.


ALTER TYPE "NotificationType" ADD VALUE 'PITCH_SUBMITTED';
ALTER TYPE "NotificationType" ADD VALUE 'PITCH_VALIDATED';
ALTER TYPE "NotificationType" ADD VALUE 'PITCH_REJECTED';
ALTER TYPE "NotificationType" ADD VALUE 'PITCH_FUNDED';
ALTER TYPE "NotificationType" ADD VALUE 'SPONSOR_JOINED';
ALTER TYPE "NotificationType" ADD VALUE 'PITCH_FIRST_PAYMENT';
ALTER TYPE "NotificationType" ADD VALUE 'PITCH_FINAL_PAYMENT';

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "pitchId" TEXT;

-- CreateTable
CREATE TABLE "CreatorPitch" (
    "id" TEXT NOT NULL,
    "creatorId" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "secretToken" TEXT NOT NULL,
    "type" "PitchType" NOT NULL,
    "synopsis" TEXT NOT NULL,
    "targetAudience" TEXT,
    "platforms" TEXT[],
    "ageRange" TEXT,
    "country" TEXT,
    "contentDuration" TEXT,
    "timeline" JSONB,
    "teamDescription" TEXT,
    "references" TEXT[],
    "budgetTarget" INTEGER NOT NULL,
    "maxSponsors" INTEGER NOT NULL DEFAULT 4,
    "bonusSponsorSlots" INTEGER NOT NULL DEFAULT 2,
    "storyboardUrls" TEXT[],
    "pitchDocumentUrl" TEXT,
    "coverImageUrl" TEXT,
    "visibility" "PitchVisibility" NOT NULL DEFAULT 'PUBLIC',
    "status" "PitchStatus" NOT NULL DEFAULT 'DRAFT',
    "completenessScore" INTEGER NOT NULL DEFAULT 0,
    "campaignId" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CreatorPitch_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PitchSponsorship" (
    "id" TEXT NOT NULL,
    "pitchId" TEXT NOT NULL,
    "brandId" TEXT NOT NULL,
    "amountDZD" INTEGER NOT NULL,
    "percentageShare" DOUBLE PRECISION NOT NULL DEFAULT 0,
    "isBonus" BOOLEAN NOT NULL DEFAULT false,
    "status" "SponsorshipStatus" NOT NULL DEFAULT 'COMMITTED',
    "satimIntentId" TEXT,
    "brandMessage" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PitchSponsorship_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PitchDeliverable" (
    "id" TEXT NOT NULL,
    "pitchId" TEXT NOT NULL,
    "description" TEXT NOT NULL,
    "type" "PitchDeliverableType" NOT NULL,
    "minSponsorshipDZD" INTEGER,

    CONSTRAINT "PitchDeliverable_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PitchCategory" (
    "pitchId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "PitchCategory_pkey" PRIMARY KEY ("pitchId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPitch_slug_key" ON "CreatorPitch"("slug");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPitch_secretToken_key" ON "CreatorPitch"("secretToken");

-- CreateIndex
CREATE UNIQUE INDEX "CreatorPitch_campaignId_key" ON "CreatorPitch"("campaignId");

-- CreateIndex
CREATE INDEX "CreatorPitch_creatorId_idx" ON "CreatorPitch"("creatorId");

-- CreateIndex
CREATE INDEX "CreatorPitch_status_idx" ON "CreatorPitch"("status");

-- CreateIndex
CREATE INDEX "PitchSponsorship_pitchId_idx" ON "PitchSponsorship"("pitchId");

-- CreateIndex
CREATE INDEX "PitchSponsorship_brandId_idx" ON "PitchSponsorship"("brandId");

-- CreateIndex
CREATE UNIQUE INDEX "PitchSponsorship_pitchId_brandId_key" ON "PitchSponsorship"("pitchId", "brandId");

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "CreatorPitch"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorPitch" ADD CONSTRAINT "CreatorPitch_creatorId_fkey" FOREIGN KEY ("creatorId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CreatorPitch" ADD CONSTRAINT "CreatorPitch_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PitchSponsorship" ADD CONSTRAINT "PitchSponsorship_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "CreatorPitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PitchSponsorship" ADD CONSTRAINT "PitchSponsorship_brandId_fkey" FOREIGN KEY ("brandId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PitchDeliverable" ADD CONSTRAINT "PitchDeliverable_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "CreatorPitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PitchCategory" ADD CONSTRAINT "PitchCategory_pitchId_fkey" FOREIGN KEY ("pitchId") REFERENCES "CreatorPitch"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PitchCategory" ADD CONSTRAINT "PitchCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
