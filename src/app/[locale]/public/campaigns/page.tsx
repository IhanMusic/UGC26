import { Link } from "@/i18n/navigation";
import { prisma } from "@/server/db";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export default async function PublicCampaignsPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q as string | undefined)?.trim() ?? "";
  const category = (sp.category as string | undefined)?.trim() ?? "";
  const country = (sp.country as string | undefined)?.trim() ?? "";
  const platform = (sp.platform as string | undefined)?.trim() ?? "";
  const minPrice = parseInt((sp.minPrice as string) ?? "0", 10) || 0;
  const maxPrice = parseInt((sp.maxPrice as string) ?? "0", 10) || 0;
  const sort = (sp.sort as string | undefined) ?? "newest";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {};

  if (q) where.title = { contains: q, mode: "insensitive" };
  if (country) where.country = { contains: country, mode: "insensitive" };
  if (platform) where.objectivePlatforms = { contains: platform, mode: "insensitive" };
  if (category) where.categories = { some: { category: { name: { contains: category, mode: "insensitive" } } } };
  if (minPrice > 0) where.priceDinar = { ...where.priceDinar, gte: minPrice };
  if (maxPrice > 0) where.priceDinar = { ...where.priceDinar, lte: maxPrice };

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  let orderBy: any = { createdAt: "desc" };
  if (sort === "price_asc") orderBy = { priceDinar: "asc" };
  if (sort === "price_desc") orderBy = { priceDinar: "desc" };
  if (sort === "oldest") orderBy = { createdAt: "asc" };

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const campaigns = await prisma.campaign.findMany({
    where,
    orderBy,
    take: 50,
    include: {
      categories: { include: { category: true } },
      company: { select: { id: true, companyProfile: true, firstName: true, lastName: true } },
    },
  });

  return (
    <main className="flex-1 bg-mesh">
      <div className="mx-auto max-w-6xl px-4 py-16">
        <div className="animate-fade-in-up">
          <h1 className="text-4xl font-bold tracking-tight">
            <span className="gradient-text">Campaigns</span>
          </h1>
          <p className="mt-2 text-[var(--foreground-muted)]">
            Browse the latest campaigns. Log in as influencer to apply.
          </p>
        </div>

        {/* Advanced Filters */}
        <form className="mt-8 flex flex-wrap items-end gap-3 animate-fade-in-up" action="">
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground-muted)]">Search</label>
            <input name="q" defaultValue={q} placeholder="Campaign title…" className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground-muted)]">Category</label>
            <select name="category" defaultValue={category} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
              <option value="">All</option>
              {categories.map((c) => (
                <option key={c.id} value={c.name}>{c.name}</option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground-muted)]">Country</label>
            <input name="country" defaultValue={country} placeholder="Country…" className="h-10 w-28 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground-muted)]">Platform</label>
            <input name="platform" defaultValue={platform} placeholder="Instagram…" className="h-10 w-28 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground-muted)]">Min price</label>
            <input name="minPrice" type="number" defaultValue={minPrice || ""} placeholder="0" className="h-10 w-24 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground-muted)]">Max price</label>
            <input name="maxPrice" type="number" defaultValue={maxPrice || ""} placeholder="999999" className="h-10 w-24 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-medium text-[var(--foreground-muted)]">Sort</label>
            <select name="sort" defaultValue={sort} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus:border-[var(--primary)] focus:outline-none focus:ring-2 focus:ring-[var(--primary)]">
              <option value="newest">Newest</option>
              <option value="oldest">Oldest</option>
              <option value="price_asc">Price ↑</option>
              <option value="price_desc">Price ↓</option>
            </select>
          </div>
          <button type="submit" className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-5 text-sm font-medium shadow-sm backdrop-blur-sm transition-all hover:bg-[var(--primary-dim)] hover:border-[var(--primary)] hover:text-[var(--primary)]">
            Filter
          </button>
        </form>

        <div className="mt-10 grid gap-5 md:grid-cols-3">
          {campaigns.length === 0 && (
            <div className="col-span-full text-center text-[var(--foreground-muted)] py-12">No campaigns found.</div>
          )}
          {campaigns.map((c, i) => (
            <Card key={c.id} className={`group overflow-hidden animate-fade-in-up ${i === 0 ? "md:col-span-2 md:row-span-2" : ""}`}>
              {c.photoUrl ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img
                  src={c.photoUrl}
                  alt={c.title}
                  className={`w-full object-cover transition-transform duration-500 group-hover:scale-105 ${i === 0 ? "h-64" : "h-40"}`}
                />
              ) : (
                <div className={`w-full bg-[var(--primary-dim)] ${i === 0 ? "h-32" : "h-20"}`} />
              )}
              <CardHeader>
                <CardTitle className={`line-clamp-1 ${i === 0 ? "text-2xl" : ""}`}>{c.title}</CardTitle>
                <CardDescription>
                  {c.priceDinar.toLocaleString()} DZD • {c.country ?? "—"}
                  {c.objectivePlatforms ? ` • ${c.objectivePlatforms}` : ""}
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex flex-wrap gap-2">
                  {c.categories.slice(0, 3).map((cc) => (
                    <Badge key={cc.categoryId} variant="secondary">
                      {cc.category.name}
                    </Badge>
                  ))}
                </div>
                <div className="flex items-center justify-between">
                  <Link
                    href={`/public/campaigns/${c.id}`}
                    className="inline-flex items-center gap-1 text-sm font-medium text-[var(--primary)] underline-offset-4 hover:underline"
                  >
                    View details →
                  </Link>
                  <Link
                    href={`/public/companies/${c.company.id}`}
                    className="text-xs text-[var(--foreground-muted)] hover:text-[var(--primary)] hover:underline"
                  >
                    {c.company.companyProfile?.companyName ?? `${c.company.firstName} ${c.company.lastName}`}
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </main>
  );
}
