import { getTranslations } from "next-intl/server";
import type { NavItem } from "../influencer/_nav";

export async function getCompanyNav(): Promise<NavItem[]> {
  const t = await getTranslations("nav");
  return [
    { type: "link",    href: "/company",                 label: t("dashboard") },
    { type: "section", label: t("navSection.myCompany") },
    { type: "link",    href: "/company/profile",         label: t("profile") },
    { type: "section", label: t("navSection.campaigns") },
    { type: "link",    href: "/company/request-campaign", label: t("requestCampaign") },
    { type: "link",    href: "/company/campaigns",       label: t("myCampaigns") },
    { type: "link",    href: "/company/completions",     label: t("completions") },
    { type: "section", label: t("navSection.creatorsProjects") },
    { type: "link",    href: "/company/projets",         label: t("creatorProjects") },
    { type: "link",    href: "/company/sponsorships",    label: t("sponsorships") },
    { type: "link",    href: "/public/influencers",      label: t("browseInfluencers") },
    { type: "section", label: t("navSection.finance") },
    { type: "link",    href: "/company/expenses",        label: t("expenses") },
  ];
}
