import type { MetadataRoute } from "next";
import { prisma } from "@/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ugc26.dz";

  const campaigns = await prisma.campaign.findMany({
    where: { status: { in: ["UPCOMING", "ONGOING"] } },
    select: { id: true, updatedAt: true },
  });

  const influencerUsers = await prisma.user.findMany({
    where: {
      role: "INFLUENCER",
      isVerified: true,
      isDeleted: false,
      isBlocked: false,
    },
    select: { id: true, updatedAt: true },
  });

  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 1,
    },
    {
      url: `${baseUrl}/fr`,
      lastModified: new Date(),
      changeFrequency: "daily",
      priority: 0.9,
    },
    { url: `${baseUrl}/en`, lastModified: new Date() },
    { url: `${baseUrl}/ar`, lastModified: new Date() },
  ];

  const campaignPages: MetadataRoute.Sitemap = campaigns.map((c) => ({
    url: `${baseUrl}/fr/campaigns/${c.id}`,
    lastModified: c.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  const profilePages: MetadataRoute.Sitemap = influencerUsers.map((u) => ({
    url: `${baseUrl}/fr/influencer/${u.id}`,
    lastModified: u.updatedAt,
    changeFrequency: "weekly" as const,
    priority: 0.6,
  }));

  return [...staticPages, ...campaignPages, ...profilePages];
}
