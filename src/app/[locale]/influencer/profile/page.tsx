import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "../_nav";
import InfluencerProfileClient from "./client";
import { getTranslations } from "next-intl/server";

export default async function InfluencerProfilePage() {
  await requireRole("INFLUENCER");
  const t = await getTranslations("nav");
  return (
    <AppShell title={t("influencerProfile")} nav={await getInfluencerNav()}>
      <InfluencerProfileClient />
    </AppShell>
  );
}
