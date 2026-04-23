import { getTranslations } from "next-intl/server";

export type NavItem =
  | { type: "link"; href: string; label: string }
  | { type: "section"; label: string };

export async function getInfluencerNav(): Promise<NavItem[]> {
  const t = await getTranslations("nav");
  return [
    { type: "link",    href: "/influencer",           label: t("dashboard") },
    { type: "section", label: t("navSection.mySpace") },
    { type: "link",    href: "/influencer/profile",   label: t("profile") },
    { type: "link",    href: "/influencer/categories", label: t("myCategories") },
    { type: "link",    href: "/influencer/payments",  label: t("paymentInfo") },
    { type: "section", label: t("navSection.activity") },
    { type: "link",    href: "/influencer/campaigns", label: t("myCampaigns") },
    { type: "link",    href: "/creator/pitches",      label: t("myPitches") },
    { type: "link",    href: "/influencer/favorites", label: t("favorites") },
    { type: "section", label: t("navSection.explore") },
    { type: "link",    href: "/public/campaigns",     label: t("browseCampaigns") },
    { type: "link",    href: "/public/influencers",   label: t("browseInfluencers") },
  ];
}
