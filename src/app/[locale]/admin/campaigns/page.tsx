import { Link } from "@/i18n/navigation";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { pageCount } from "@/server/pagination";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AdminSearchInput } from "@/components/admin-search-input";
import { AdminStatusFilter } from "@/components/admin-status-filter";
import type { CampaignStatus } from "@/generated/prisma/enums";
import { getTranslations } from "next-intl/server";

const PAGE_SIZE = 20;

const CAMPAIGN_STATUSES: CampaignStatus[] = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CONFIRMED",
  "PAID",
];

export default async function AdminCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN");
  const t = await getTranslations("admin");
  const tNav = await getTranslations("nav");
  const sp = await searchParams;

  const q = (sp.q as string | undefined)?.trim() ?? "";
  const status = (sp.status as string | undefined)?.trim() ?? "";
  const focus = (sp.focus as string | undefined) ?? null;
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    ...(q ? { title: { contains: q, mode: "insensitive" as const } } : {}),
    ...(status && CAMPAIGN_STATUSES.includes(status as CampaignStatus)
      ? { status: status as CampaignStatus }
      : {}),
  };

  const [total, campaigns] = await Promise.all([
    prisma.campaign.count({ where }),
    prisma.campaign.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      include: {
        company: { include: { companyProfile: true } },
        applications: { select: { id: true } },
        participations: { select: { id: true } },
      },
    }),
  ]);

  const pages = pageCount(total, PAGE_SIZE);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (status) params.set("status", status);
    params.set("page", String(p));
    return `/admin/campaigns?${params.toString()}`;
  };

  return (
    <AppShell title={tNav("campaigns")} nav={await getAdminNav()}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-[var(--primary)] to-[var(--secondary)] shadow-md shadow-[var(--primary-glow)]">
            <span className="text-sm font-bold text-[var(--background)]">{total}</span>
          </div>
          <div className="text-sm text-[var(--foreground-muted)]">Total campaigns</div>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <AdminStatusFilter />
          <div className="w-64">
            <AdminSearchInput placeholder={t("searchCampaign")} />
          </div>
        </div>
      </div>

      <div className="mt-6">
        <Table>
          <THead>
            <TR>
              <TH>Title</TH>
              <TH>Company</TH>
              <TH>Status</TH>
              <TH>Applicants</TH>
              <TH className="text-right">Open</TH>
            </TR>
          </THead>
          <TBody>
            {campaigns.map((c) => (
              <TR
                key={c.id}
                className={
                  focus === c.id
                    ? "border-b border-[var(--border)] bg-[var(--primary-dim)]"
                    : undefined
                }
              >
                <TD className="font-medium text-[var(--foreground)]">{c.title}</TD>
                <TD>
                  {c.company.companyProfile?.companyName ?? c.company.email}
                </TD>
                <TD>
                  <Badge variant={c.status === "PAID" ? "success" : "secondary"}>
                    {c.status}
                  </Badge>
                </TD>
                <TD>{c.applications.length}</TD>
                <TD className="text-right">
                  <Link
                    href={`/admin/campaigns/${c.id}`}
                    className="text-sm font-medium text-[var(--primary)] underline underline-offset-4 hover:text-[var(--primary)]"
                  >
                    Manage
                  </Link>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>

        {campaigns.length === 0 && (
          <div className="glass rounded-xl p-8 text-center text-[var(--foreground-muted)]">
            {q ? t("noResultsFor", { query: q }) : t("noResultsEmpty")}
          </div>
        )}
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-[var(--foreground-muted)]">
        <div>
          {t("pageLabel")} {page} / {pages} &mdash; {t("totalCount", { count: total })}
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild disabled={page <= 1}>
            <Link href={buildHref(Math.max(1, page - 1))}>{t("previousPage")}</Link>
          </Button>
          <Button variant="outline" size="sm" asChild disabled={page >= pages}>
            <Link href={buildHref(Math.min(pages, page + 1))}>{t("nextPage")}</Link>
          </Button>
        </div>
      </div>
    </AppShell>
  );
}
