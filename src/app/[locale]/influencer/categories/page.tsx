import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "../_nav";
import InfluencerCategoriesClient from "./client";
import { getTranslations } from "next-intl/server";

export default async function InfluencerCategoriesPage() {
  await requireRole("INFLUENCER");
  const t = await getTranslations("nav");
  return (
    <AppShell title={t("myCategoriesTitle")} nav={await getInfluencerNav()}>
      <InfluencerCategoriesClient />
    </AppShell>
  );
}
