import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../_nav";
import CompanyRequestCampaignClient from "./client";
import { getTranslations } from "next-intl/server";

export default async function CompanyRequestCampaignPage() {
  await requireRole("COMPANY");
  const t = await getTranslations("nav");
  return (
    <AppShell title={t("requestCampaign")} nav={await getCompanyNav()}>
      <CompanyRequestCampaignClient />
    </AppShell>
  );
}
