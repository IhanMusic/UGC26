import type { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ugc26.dz";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/"],
        disallow: [
          "/api/",
          "/fr/admin/",
          "/en/admin/",
          "/ar/admin/",
          "/fr/company/",
          "/en/company/",
          "/ar/company/",
          "/fr/influencer/",
          "/en/influencer/",
          "/ar/influencer/",
        ],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
