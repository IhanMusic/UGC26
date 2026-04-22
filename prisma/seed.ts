import bcrypt from "bcryptjs";
import { prisma } from "../src/server/db";

async function main() {
  const passwordHash = await bcrypt.hash("Password123!", 10);

  const admin = await prisma.user.upsert({
    where: { email: "admin@ugc26.local" },
    update: {},
    create: {
      role: "ADMIN",
      firstName: "Admin",
      lastName: "UGC26",
      email: "admin@ugc26.local",
      passwordHash,
      isVerified: true,
    },
  });

  await prisma.user.upsert({
    where: { email: "influencer@ugc26.local" },
    update: {},
    create: {
      role: "INFLUENCER",
      firstName: "Mina",
      lastName: "Influencer",
      email: "influencer@ugc26.local",
      passwordHash,
      isVerified: true,
      influencerProfile: {
        create: {
          mainAccountLink: "https://instagram.com/mina",
          country: "Algeria",
          passion: "Fashion",
          socialNetworks: ["Instagram", "TikTok"],
          followersCountRange: "10k-50k",
        },
      },
    },
  });

  const company = await prisma.user.upsert({
    where: { email: "company@ugc26.local" },
    update: {},
    create: {
      role: "COMPANY",
      firstName: "Sarah",
      lastName: "Brand",
      email: "company@ugc26.local",
      passwordHash,
      isVerified: true,
      companyProfile: {
        create: {
          companyName: "Acme DZ",
          position: "Marketing",
          companyDetails: "D2C brand focused on sustainable essentials.",
        },
      },
    },
  });

  const categories = await Promise.all(
    ["Fashion", "Sports", "Food", "Tech", "Beauty"].map((name) =>
      prisma.category.upsert({
        where: { name },
        update: {},
        create: { name },
      })
    )
  );

  // Create a request from company and an approved campaign by admin
  const request = await prisma.campaignRequest.create({
    data: {
      companyId: company.id,
      status: "APPROVED",
      title: "Try our eco bottle",
      priceDinar: 15000,
      description:
        "Looking for creators to test our new eco bottle and share a short review.",
      objectivePlatforms: "Instagram, TikTok",
      minFollowers: 5000,
      ageRange: "18-35",
      country: "Algeria",
      categories: {
        create: categories
          .filter((c) => ["Fashion", "Tech"].includes(c.name))
          .map((c) => ({ categoryId: c.id })),
      },
    },
  });

  await prisma.campaign.upsert({
    where: { requestId: request.id },
    update: {},
    create: {
      requestId: request.id,
      companyId: company.id,
      createdById: admin.id,
      title: request.title,
      priceDinar: request.priceDinar,
      description: request.description,
      objectivePlatforms: request.objectivePlatforms,
      minFollowers: request.minFollowers,
      ageRange: request.ageRange,
      country: request.country,
      categories: {
        create: categories
          .filter((c) => ["Fashion", "Tech"].includes(c.name))
          .map((c) => ({ categoryId: c.id })),
      },
    },
  });

  console.log("Seed completed:");
  console.log("- Admin: admin@ugc26.local / Password123!");
  console.log("- Influencer: influencer@ugc26.local / Password123!");
  console.log("- Company: company@ugc26.local / Password123!");
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
