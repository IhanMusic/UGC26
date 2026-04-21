import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../_nav";
import CompanyProfileClient from "./client";
import { getTranslations } from "next-intl/server";

export default async function CompanyProfilePage() {
  await requireRole("COMPANY");
  const t = await getTranslations("nav");
  return (
    <AppShell title={t("companyProfile")} nav={await getCompanyNav()}>
      <CompanyProfileClient />
    </AppShell>
  );
}
