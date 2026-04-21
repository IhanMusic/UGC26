import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || "https://ugc26.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["fr", "en", "ar"];
  const staticPages = [
    "",
    "/about",
    "/contact",
    "/faq",
    "/privacy",
    "/terms",
    "/public/campaigns",
  ];

  const entries: MetadataRoute.Sitemap = [];

  for (const locale of locales) {
    for (const page of staticPages) {
      entries.push({
        url: `${BASE_URL}/${locale}${page}`,
        lastModified: new Date(),
        changeFrequency: page === "" ? "daily" : "weekly",
        priority: page === "" ? 1 : 0.8,
      });
    }
  }

  return entries;
}
