import { getTranslations } from "next-intl/server";

export async function getCompanyNav() {
  const t = await getTranslations("nav");
  return [
    { href: "/company", label: t("dashboard") },
    { href: "/company/profile", label: t("profile") },
    { href: "/company/request-campaign", label: t("requestCampaign") },
    { href: "/company/campaigns", label: t("myCampaigns") },
    { href: "/company/projets", label: "🎬 Projets créateurs" },
    { href: "/company/sponsorships", label: "💰 Mes Sponsorisations" },
    { href: "/company/completions", label: t("completions") },
    { href: "/company/expenses", label: t("expenses") },
    { href: "/public/influencers", label: t("browseInfluencers") },
    { href: "/messages", label: `💬 ${t("messages")}` },
    { href: "/notifications", label: `🔔 ${t("notifications")}` },
  ];
}
