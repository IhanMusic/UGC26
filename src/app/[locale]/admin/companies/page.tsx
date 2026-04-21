import { Link } from "@/i18n/navigation";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { pageCount } from "@/server/pagination";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../_nav";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ActionButton } from "@/components/action-button";
import { Table, TBody, TD, TH, THead, TR } from "@/components/ui/table";
import { AdminSearchInput } from "@/components/admin-search-input";
import { getTranslations } from "next-intl/server";

const PAGE_SIZE = 20;

export default async function AdminCompaniesPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  await requireRole("ADMIN");
  const t = await getTranslations("admin");
  const tNav = await getTranslations("nav");
  const sp = await searchParams;
  const q = (sp.q as string | undefined)?.trim() ?? "";
  const page = Math.max(1, Number(sp.page ?? 1) || 1);
  const skip = (page - 1) * PAGE_SIZE;

  const where = {
    role: "COMPANY" as const,
    ...(q
      ? {
          OR: [
            { email: { contains: q, mode: "insensitive" as const } },
            { firstName: { contains: q, mode: "insensitive" as const } },
            { lastName: { contains: q, mode: "insensitive" as const } },
            {
              companyProfile: {
                companyName: { contains: q, mode: "insensitive" as const },
              },
            },
          ],
        }
      : {}),
  };

  const [total, users] = await Promise.all([
    prisma.user.count({ where }),
    prisma.user.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: PAGE_SIZE,
      select: {
        id: true,
        firstName: true,
        lastName: true,
        email: true,
        isVerified: true,
        isBlocked: true,
        isDeleted: true,
        companyProfile: { select: { companyName: true } },
      },
    }),
  ]);

  const pages = pageCount(total, PAGE_SIZE);

  const buildHref = (p: number) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    params.set("page", String(p));
    return `/admin/companies?${params.toString()}`;
  };

  return (
    <AppShell title={tNav("company")} nav={await getAdminNav()}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-md shadow-emerald-500/25">
            <span className="text-sm font-bold text-white">{total}</span>
          </div>
          <div className="text-sm text-slate-500">Total companies</div>
        </div>
        <div className="w-72">
          <AdminSearchInput placeholder={t("searchCompany")} />
        </div>
      </div>

      <div className="mt-6">
        {users.length === 0 && (
          <div className="glass rounded-xl p-8 text-center text-[#64748B]">
            {q ? t("noResultsFor", { query: q }) : t("noResultsEmpty")}
          </div>
        )}
        <Table>
          <THead>
            <TR>
              <TH>Name</TH>
              <TH>Company</TH>
              <TH>Email</TH>
              <TH>Status</TH>
              <TH className="text-right">Actions</TH>
            </TR>
          </THead>
          <TBody>
            {users.map((u) => (
              <TR key={u.id}>
                <TD>
                  <Link
                    href={`/admin/companies/${u.id}`}
                    className="font-medium text-slate-900 hover:text-violet-700 hover:underline"
                  >
                    {u.firstName} {u.lastName}
                  </Link>
                </TD>
                <TD className="text-slate-500">
                  {u.companyProfile?.companyName ?? "—"}
                </TD>
                <TD>{u.email}</TD>
                <TD className="flex flex-wrap gap-2">
                  {u.isDeleted ? <Badge variant="danger">Deleted</Badge> : null}
                  {u.isBlocked ? <Badge variant="warning">Blocked</Badge> : null}
                  {u.isVerified ? (
                    <Badge variant="success">Verified</Badge>
                  ) : (
                    <Badge variant="secondary">Unverified</Badge>
                  )}
                </TD>
                <TD className="text-right">
                  <div className="inline-flex flex-wrap justify-end gap-2">
                    {!u.isVerified ? (
                      <ActionButton
                        size="sm"
                        variant="outline"
                        url={`/api/admin/users/${u.id}`}
                        method="PATCH"
                        body={{ action: "verify" }}
                      >
                        Verify
                      </ActionButton>
                    ) : null}

                    {u.isBlocked ? (
                      <ActionButton
                        size="sm"
                        variant="outline"
                        url={`/api/admin/users/${u.id}`}
                        method="PATCH"
                        body={{ action: "unblock" }}
                      >
                        Unblock
                      </ActionButton>
                    ) : (
                      <ActionButton
                        size="sm"
                        variant="outline"
                        url={`/api/admin/users/${u.id}`}
                        method="PATCH"
                        body={{ action: "block" }}
                        confirm="Block this user?"
                      >
                        Block
                      </ActionButton>
                    )}

                    {u.isDeleted ? (
                      <ActionButton
                        size="sm"
                        variant="outline"
                        url={`/api/admin/users/${u.id}`}
                        method="PATCH"
                        body={{ action: "restore" }}
                      >
                        Restore
                      </ActionButton>
                    ) : (
                      <ActionButton
                        size="sm"
                        variant="destructive"
                        url={`/api/admin/users/${u.id}`}
                        method="PATCH"
                        body={{ action: "delete" }}
                        confirm="Soft-delete this user?"
                      >
                        Delete
                      </ActionButton>
                    )}
                  </div>
                </TD>
              </TR>
            ))}
          </TBody>
        </Table>
      </div>

      <div className="mt-6 flex items-center justify-between text-sm text-slate-500">
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
