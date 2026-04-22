import { getTranslations } from "next-intl/server";

export async function getAdminNav() {
  const t = await getTranslations("nav");
  return [
    { href: "/admin", label: t("dashboard") },
    { href: "/admin/influencers", label: t("influencer") },
    { href: "/admin/companies", label: t("company") },
    { href: "/admin/categories", label: t("categories") },
    { href: "/admin/requests", label: t("requestedCampaigns") },
    { href: "/admin/campaigns", label: t("campaigns") },
    { href: "/admin/transactions", label: t("transactions") },
    { href: "/admin/applications", label: t("preValidation") },
    { href: "/admin/pitches", label: "🎬 File de validation" },
    { href: "/admin/disputes", label: `⚖️ ${t("disputes")}` },
    { href: "/admin/settings", label: t("settings") },
    { href: "/messages", label: `💬 ${t("messages")}` },
    { href: "/notifications", label: `🔔 ${t("notifications")}` },
  ];
}
