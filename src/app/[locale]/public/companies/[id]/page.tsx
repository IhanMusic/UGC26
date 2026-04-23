import { prisma } from "@/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Image from "next/image";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-[var(--gold)]">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`h-4 w-4 ${i <= Math.round(rating) ? "fill-current" : "text-[var(--border)]"}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export default async function CompanyPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id, role: "COMPANY", isDeleted: false, isBlocked: false },
    include: {
      companyProfile: true,
      campaignsOwned: {
        where: { status: { not: "UPCOMING" } },
        take: 20,
        orderBy: { createdAt: "desc" },
        include: { categories: { include: { category: true } } },
      },
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          reviewer: { select: { firstName: true, lastName: true, role: true } },
          campaign: { select: { title: true } },
        },
      },
    },
  });

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 bg-mesh"><div className="mx-auto max-w-3xl px-4 py-16 text-[var(--foreground-muted)]">Company not found.</div></main>
        <SiteFooter />
      </>
    );
  }

  const ratings = user.reviewsReceived;
  const avg = ratings.length > 0 ? ratings.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / ratings.length : 0;
  const companyName = user.companyProfile?.companyName ?? `${user.firstName} ${user.lastName}`;

  return (
    <>
      <SiteHeader />
      <main className="flex-1 bg-mesh">
        <div className="mx-auto max-w-4xl px-4 py-16">
          <div className="grid gap-6 md:grid-cols-5">
            <div className="md:col-span-3 space-y-6">
              <Card className="animate-fade-in-up">
                <CardHeader>
                  <div className="flex items-center gap-4">
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-[var(--secondary)] to-[var(--primary)] text-2xl font-bold text-[var(--background)] shadow-lg shadow-[var(--primary-glow)]">
                      {companyName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{companyName}</CardTitle>
                      {user.companyProfile?.position && (
                        <div className="text-sm text-[var(--foreground-muted)]">{user.companyProfile.position}</div>
                      )}
                      <div className="mt-1 flex items-center gap-2">
                        <Stars rating={avg} />
                        <span className="text-sm text-[var(--foreground-muted)]">{avg.toFixed(1)} ({ratings.length} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  {user.companyProfile?.companyDetails && (
                    <p className="text-sm text-[var(--foreground-muted)] whitespace-pre-wrap">{user.companyProfile.companyDetails}</p>
                  )}
                  <div className="text-xs text-[var(--foreground-muted)]">Member since {user.createdAt.toLocaleDateString()}</div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card className="animate-fade-in-up">
                <CardHeader><CardTitle>Reviews ({ratings.length})</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {ratings.length === 0 && <div className="text-sm text-[var(--foreground-muted)]">No reviews yet.</div>}
                  {ratings.map((r) => (
                    <div key={r.id} className="border-b border-[var(--border)] pb-3 last:border-0">
                      <div className="flex items-center gap-2">
                        <Stars rating={r.rating} />
                        <span className="text-xs text-[var(--foreground-muted)]">{r.reviewer.firstName} {r.reviewer.lastName}</span>
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-[var(--foreground-muted)]">{r.comment}</p>}
                      <div className="mt-1 text-xs text-[var(--foreground-muted)]">Campaign: {r.campaign.title}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              <Card className="animate-fade-in-up">
                <CardHeader><CardTitle>Campaigns ({user.campaignsOwned.length})</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {user.campaignsOwned.length === 0 && <div className="text-sm text-[var(--foreground-muted)]">No campaigns yet.</div>}
                  {user.campaignsOwned.map((c) => (
                    <Link key={c.id} href={`/public/campaigns/${c.id}`} className="flex items-center gap-3 rounded-lg border border-[var(--border)] p-2 transition-colors hover:bg-[var(--primary-dim)]">
                      {c.photoUrl ? (
                        <Image src={c.photoUrl} alt="" width={40} height={40} className="rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-[var(--surface-mid)]" />
                      )}
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium text-[var(--foreground)] truncate">{c.title}</div>
                        <div className="text-xs text-[var(--foreground-muted)]">{c.priceDinar.toLocaleString()} DZD</div>
                      </div>
                      <Badge variant={c.status === "PAID" ? "success" : "secondary"}>{c.status}</Badge>
                    </Link>
                  ))}
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
