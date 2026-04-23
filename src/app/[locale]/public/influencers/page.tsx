import { prisma } from "@/server/db";
import { Link } from "@/i18n/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`h-4 w-4 ${i <= Math.round(rating) ? "fill-current" : "text-[var(--border)]"}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default async function PublicInfluencersPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const sp = await searchParams;
  const q = (sp.q as string | undefined)?.trim() ?? "";
  const category = (sp.category as string | undefined)?.trim() ?? "";
  const city = (sp.city as string | undefined)?.trim() ?? "";
  const country = (sp.country as string | undefined)?.trim() ?? "";

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const where: any = {
    role: "INFLUENCER",
    isDeleted: false,
    isBlocked: false,
    isVerified: true,
  };

  if (q) {
    where.OR = [
      { firstName: { contains: q, mode: "insensitive" } },
      { lastName: { contains: q, mode: "insensitive" } },
    ];
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const ipWhere: any = {};
  if (city) ipWhere.city = { contains: city, mode: "insensitive" };
  if (country) ipWhere.country = { contains: country, mode: "insensitive" };
  if (category) ipWhere.categories = { some: { category: { name: { contains: category, mode: "insensitive" } } } };
  if (Object.keys(ipWhere).length > 0) where.influencerProfile = ipWhere;

  const categories = await prisma.category.findMany({ orderBy: { name: "asc" } });

  const users = await prisma.user.findMany({
    where,
    take: 50,
    orderBy: { createdAt: "desc" },
    include: {
      influencerProfile: {
        include: {
          categories: { include: { category: true } },
        },
      },
      reviewsReceived: { select: { rating: true } },
    },
  });

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-mesh">
        <div className="mx-auto max-w-6xl px-4 py-16">
          <div className="animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight">
              <span className="gradient-text">Influencers</span>
            </h1>
            <p className="mt-2 text-[var(--foreground-muted)]">Discover talented creators for your campaigns.</p>
          </div>

          {/* Filters */}
          <form className="mt-8 flex flex-wrap items-end gap-3" action="">
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground-muted)]">Search</label>
              <input name="q" defaultValue={q} placeholder="Name…" className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground-muted)]">Category</label>
              <select name="category" defaultValue={category} className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]">
                <option value="">All</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground-muted)]">City</label>
              <input name="city" defaultValue={city} placeholder="City…" className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" />
            </div>
            <div className="space-y-1">
              <label className="text-xs font-medium text-[var(--foreground-muted)]">Country</label>
              <input name="country" defaultValue={country} placeholder="Country…" className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-4 text-sm shadow-sm backdrop-blur-sm focus-visible:border-[var(--primary)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)]" />
            </div>
            <button type="submit" className="h-10 rounded-xl border border-[var(--border)] bg-[var(--surface-high)] px-5 text-sm font-medium shadow-sm backdrop-blur-sm transition-all hover:bg-[var(--primary-dim)] hover:border-[var(--primary)] hover:text-[var(--primary)]">
              Filter
            </button>
          </form>

          <div className="mt-10 grid gap-5 md:grid-cols-3">
            {users.length === 0 && (
              <div className="col-span-full text-center text-[var(--foreground-muted)] py-12">No influencers found.</div>
            )}
            {users.map((u) => {
              const ratings = u.reviewsReceived;
              const avg = ratings.length > 0 ? ratings.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / ratings.length : 0;
              return (
                <Card key={u.id} className="group overflow-hidden animate-fade-in-up">
                  <CardHeader>
                    <div className="flex items-center gap-3">
                      <div className="flex h-12 w-12 items-center justify-center rounded-full bg-[var(--primary)] text-lg font-bold text-[var(--background)] shadow-lg shadow-[var(--primary-glow)]">
                        {u.firstName.charAt(0)}
                      </div>
                      <div>
                        <CardTitle className="text-base">
                          <Link href={`/public/influencers/${u.id}`} className="hover:text-[var(--primary)] hover:underline underline-offset-4">
                            {u.firstName} {u.lastName}
                          </Link>
                        </CardTitle>
                        <div className="text-xs text-[var(--foreground-muted)]">
                          {u.influencerProfile?.city ?? ""}{u.influencerProfile?.city && u.influencerProfile?.country ? ", " : ""}{u.influencerProfile?.country ?? ""}
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex flex-wrap gap-1.5">
                      {u.influencerProfile?.categories.slice(0, 4).map((c) => (
                        <Badge key={c.categoryId} variant="secondary">{c.category.name}</Badge>
                      ))}
                    </div>
                    {u.influencerProfile?.passion && (
                      <div className="text-xs text-[var(--foreground-muted)]">Passion: {u.influencerProfile.passion}</div>
                    )}
                    <div className="flex items-center gap-2">
                      <Stars rating={avg} />
                      <span className="text-xs text-[var(--foreground-muted)]">({ratings.length})</span>
                    </div>
                    {u.influencerProfile?.followersCountRange && (
                      <div className="text-xs text-[var(--foreground-muted)]">Followers: {u.influencerProfile.followersCountRange}</div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
