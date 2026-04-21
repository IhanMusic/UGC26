import { getTranslations } from "next-intl/server";

export async function getInfluencerNav() {
  const t = await getTranslations("nav");
  return [
    { href: "/influencer", label: t("dashboard") },
    { href: "/influencer/profile", label: t("profile") },
    { href: "/influencer/categories", label: t("myCategories") },
    { href: "/influencer/campaigns", label: t("myCampaigns") },
    { href: "/public/campaigns", label: t("browseCampaigns") },
    { href: "/public/influencers", label: t("browseInfluencers") },
    { href: "/influencer/favorites", label: `❤️ ${t("favorites")}` },
    { href: "/influencer/payments", label: t("paymentInfo") },
    { href: "/messages", label: `💬 ${t("messages")}` },
    { href: "/notifications", label: `🔔 ${t("notifications")}` },
  ];
}
