import { getTranslations } from "next-intl/server";
import type { NavItem } from "../influencer/_nav";

export async function getAdminNav(): Promise<NavItem[]> {
  const t = await getTranslations("nav");
  return [
    { type: "link",    href: "/admin",              label: t("dashboard") },
    { type: "section", label: t("navSection.users") },
    { type: "link",    href: "/admin/influencers",  label: t("influencer") },
    { type: "link",    href: "/admin/companies",    label: t("company") },
    { type: "link",    href: "/admin/categories",   label: t("categories") },
    { type: "section", label: t("navSection.validation") },
    { type: "link",    href: "/admin/requests",     label: t("requestedCampaigns") },
    { type: "link",    href: "/admin/applications", label: t("preValidation") },
    { type: "link",    href: "/admin/pitches",      label: t("pitchQueue") },
    { type: "section", label: t("navSection.operations") },
    { type: "link",    href: "/admin/campaigns",    label: t("campaigns") },
    { type: "link",    href: "/admin/transactions", label: t("transactions") },
    { type: "link",    href: "/admin/disputes",     label: t("disputes") },
    { type: "section", label: t("navSection.system") },
    { type: "link",    href: "/admin/settings",     label: t("settings") },
  ];
}
