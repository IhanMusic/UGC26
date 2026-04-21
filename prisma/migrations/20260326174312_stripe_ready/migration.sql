-- CreateEnum
CREATE TYPE "PaymentProvider" AS ENUM ('MANUAL', 'STRIPE');

-- AlterTable
ALTER TABLE "Transaction" ADD COLUMN     "currency" TEXT NOT NULL DEFAULT 'DZD',
ADD COLUMN     "provider" "PaymentProvider" NOT NULL DEFAULT 'MANUAL',
ADD COLUMN     "providerChargeId" TEXT,
ADD COLUMN     "providerIntentId" TEXT,
ADD COLUMN     "rawPayload" JSONB;
