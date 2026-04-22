-- AlterEnum
ALTER TYPE "NotificationType" ADD VALUE 'APPLICATION_PRE_VALIDATED';

-- AlterEnum
ALTER TYPE "PaymentProvider" ADD VALUE 'SATIM';

-- AlterTable
ALTER TABLE "CampaignApplication" ADD COLUMN     "adminPreValidated" BOOLEAN NOT NULL DEFAULT false;

-- AlterTable
ALTER TABLE "InfluencerProfile" DROP COLUMN "socialNetworks",
ADD COLUMN     "socialNetworks" TEXT[];

-- AlterTable
ALTER TABLE "Transaction" DROP COLUMN "amountDinar",
ADD COLUMN     "grossAmountDinar" INTEGER NOT NULL,
ADD COLUMN     "netAmountInfluencer" INTEGER NOT NULL,
ADD COLUMN     "participationId" TEXT,
ADD COLUMN     "platformFeeCompany" INTEGER NOT NULL,
ADD COLUMN     "platformFeeInfluencer" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_participationId_fkey" FOREIGN KEY ("participationId") REFERENCES "CampaignParticipation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
