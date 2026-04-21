-- CreateEnum
CREATE TYPE "UserRole" AS ENUM ('INFLUENCER', 'COMPANY', 'ADMIN');

-- CreateEnum
CREATE TYPE "CampaignRequestStatus" AS ENUM ('PENDING', 'APPROVED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CampaignApplicationStatus" AS ENUM ('APPLIED', 'ACCEPTED', 'REJECTED');

-- CreateEnum
CREATE TYPE "CampaignStatus" AS ENUM ('UPCOMING', 'ONGOING', 'COMPLETED', 'CONFIRMED', 'PAID');

-- CreateEnum
CREATE TYPE "TransactionStatus" AS ENUM ('PENDING', 'PAID', 'FAILED');

-- CreateTable
CREATE TABLE "User" (
    "id" TEXT NOT NULL,
    "role" "UserRole" NOT NULL,
    "firstName" TEXT NOT NULL,
    "lastName" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT,
    "passwordHash" TEXT NOT NULL,
    "imageUrl" TEXT,
    "isVerified" BOOLEAN NOT NULL DEFAULT false,
    "isBlocked" BOOLEAN NOT NULL DEFAULT false,
    "isDeleted" BOOLEAN NOT NULL DEFAULT false,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerProfile" (
    "userId" TEXT NOT NULL,
    "dateOfBirth" TIMESTAMP(3),
    "mainAccountLink" TEXT,
    "address" TEXT,
    "city" TEXT,
    "country" TEXT,
    "ownsComputer" BOOLEAN,
    "emailCheckFrequency" TEXT,
    "internetHabits" TEXT,
    "socialNetworks" TEXT,
    "passion" TEXT,
    "followersCountRange" TEXT,
    "postFrequency" TEXT,
    "goal" TEXT,
    "ethicsImportant" BOOLEAN,
    "ethicsTop3Elements" TEXT,
    "trustLevel" TEXT,
    "shareOpinionsImportant" BOOLEAN,
    "brandCommitmentsImportant" BOOLEAN,

    CONSTRAINT "InfluencerProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "CompanyProfile" (
    "userId" TEXT NOT NULL,
    "position" TEXT,
    "companyName" TEXT,
    "companyDetails" TEXT,

    CONSTRAINT "CompanyProfile_pkey" PRIMARY KEY ("userId")
);

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignRequest" (
    "id" TEXT NOT NULL,
    "companyId" TEXT NOT NULL,
    "status" "CampaignRequestStatus" NOT NULL DEFAULT 'PENDING',
    "title" TEXT NOT NULL,
    "priceDinar" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "description" TEXT NOT NULL,
    "objectivePlatforms" TEXT,
    "minFollowers" INTEGER,
    "ageRange" TEXT,
    "country" TEXT,
    "additionalPhotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignRequest_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Campaign" (
    "id" TEXT NOT NULL,
    "requestId" TEXT,
    "companyId" TEXT NOT NULL,
    "createdById" TEXT NOT NULL,
    "title" TEXT NOT NULL,
    "priceDinar" INTEGER NOT NULL,
    "photoUrl" TEXT,
    "description" TEXT NOT NULL,
    "objectivePlatforms" TEXT,
    "minFollowers" INTEGER,
    "ageRange" TEXT,
    "country" TEXT,
    "additionalPhotoUrls" TEXT[] DEFAULT ARRAY[]::TEXT[],
    "status" "CampaignStatus" NOT NULL DEFAULT 'UPCOMING',
    "scheduledStartDate" TIMESTAMP(3),
    "startProofUrl" TEXT,
    "completionProofUrl" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "Campaign_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CampaignApplication" (
    "id" TEXT NOT NULL,
    "campaignId" TEXT NOT NULL,
    "influencerId" TEXT NOT NULL,
    "status" "CampaignApplicationStatus" NOT NULL DEFAULT 'APPLIED',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CampaignApplication_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Transaction" (
    "id" TEXT NOT NULL,
    "paidById" TEXT NOT NULL,
    "paidToId" TEXT NOT NULL,
    "campaignId" TEXT,
    "amountDinar" INTEGER NOT NULL,
    "status" "TransactionStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Transaction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "SiteSetting" (
    "key" TEXT NOT NULL,
    "value" TEXT NOT NULL,

    CONSTRAINT "SiteSetting_pkey" PRIMARY KEY ("key")
);

-- CreateTable
CREATE TABLE "PasswordResetToken" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "tokenHash" TEXT NOT NULL,
    "expiresAt" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "PasswordResetToken_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "InfluencerCategory" (
    "influencerId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "InfluencerCategory_pkey" PRIMARY KEY ("influencerId","categoryId")
);

-- CreateTable
CREATE TABLE "CampaignCategory" (
    "campaignId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CampaignCategory_pkey" PRIMARY KEY ("campaignId","categoryId")
);

-- CreateTable
CREATE TABLE "CampaignRequestCategory" (
    "requestId" TEXT NOT NULL,
    "categoryId" TEXT NOT NULL,

    CONSTRAINT "CampaignRequestCategory_pkey" PRIMARY KEY ("requestId","categoryId")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Category_name_key" ON "Category"("name");

-- CreateIndex
CREATE UNIQUE INDEX "Campaign_requestId_key" ON "Campaign"("requestId");

-- CreateIndex
CREATE UNIQUE INDEX "CampaignApplication_campaignId_influencerId_key" ON "CampaignApplication"("campaignId", "influencerId");

-- CreateIndex
CREATE UNIQUE INDEX "PasswordResetToken_tokenHash_key" ON "PasswordResetToken"("tokenHash");

-- CreateIndex
CREATE INDEX "PasswordResetToken_userId_idx" ON "PasswordResetToken"("userId");

-- AddForeignKey
ALTER TABLE "InfluencerProfile" ADD CONSTRAINT "InfluencerProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CompanyProfile" ADD CONSTRAINT "CompanyProfile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRequest" ADD CONSTRAINT "CampaignRequest_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CampaignRequest"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_companyId_fkey" FOREIGN KEY ("companyId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Campaign" ADD CONSTRAINT "Campaign_createdById_fkey" FOREIGN KEY ("createdById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignApplication" ADD CONSTRAINT "CampaignApplication_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignApplication" ADD CONSTRAINT "CampaignApplication_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paidById_fkey" FOREIGN KEY ("paidById") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_paidToId_fkey" FOREIGN KEY ("paidToId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaction" ADD CONSTRAINT "Transaction_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PasswordResetToken" ADD CONSTRAINT "PasswordResetToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerCategory" ADD CONSTRAINT "InfluencerCategory_influencerId_fkey" FOREIGN KEY ("influencerId") REFERENCES "InfluencerProfile"("userId") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "InfluencerCategory" ADD CONSTRAINT "InfluencerCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignCategory" ADD CONSTRAINT "CampaignCategory_campaignId_fkey" FOREIGN KEY ("campaignId") REFERENCES "Campaign"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignCategory" ADD CONSTRAINT "CampaignCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRequestCategory" ADD CONSTRAINT "CampaignRequestCategory_requestId_fkey" FOREIGN KEY ("requestId") REFERENCES "CampaignRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CampaignRequestCategory" ADD CONSTRAINT "CampaignRequestCategory_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;
