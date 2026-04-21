import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../_nav";
import AdminCategoriesClient from "./client";
import { getTranslations } from "next-intl/server";

export default async function AdminCategoriesPage() {
  await requireRole("ADMIN");
  const t = await getTranslations("nav");
  return (
    <AppShell title={t("categories")} nav={await getAdminNav()}>
      <AdminCategoriesClient />
    </AppShell>
  );
}
