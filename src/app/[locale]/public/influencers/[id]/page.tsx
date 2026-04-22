import { prisma } from "@/server/db";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import Image from "next/image";

function Stars({ rating }: { rating: number }) {
  return (
    <span className="inline-flex gap-0.5 text-amber-400">
      {[1, 2, 3, 4, 5].map((i) => (
        <svg key={i} className={`h-4 w-4 ${i <= Math.round(rating) ? "fill-current" : "text-slate-200"}`} viewBox="0 0 20 20" fill="currentColor">
          <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
        </svg>
      ))}
    </span>
  );
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string; locale?: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { firstName: true, lastName: true },
  });
  if (!user) return { title: "Profil introuvable" };
  return {
    title: `${user.firstName} ${user.lastName} — UGC26`,
    description: `Découvrez le profil de ${user.firstName} ${user.lastName} sur UGC26.`,
  };
}

export default async function InfluencerPublicProfilePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;

  const user = await prisma.user.findUnique({
    where: { id, role: "INFLUENCER", isDeleted: false, isBlocked: false },
    include: {
      influencerProfile: {
        include: {
          categories: { include: { category: true } },
        },
      },
      reviewsReceived: {
        orderBy: { createdAt: "desc" },
        take: 20,
        include: {
          reviewer: { select: { firstName: true, lastName: true, role: true } },
          campaign: { select: { title: true } },
        },
      },
      participations: {
        where: { status: "PAID" },
        take: 10,
        orderBy: { createdAt: "desc" },
        include: { campaign: { select: { id: true, title: true, photoUrl: true } } },
      },
    },
  });

  if (!user) {
    return (
      <>
        <SiteHeader />
        <main className="flex-1 bg-mesh"><div className="mx-auto max-w-3xl px-4 py-16 text-slate-500">Influencer not found.</div></main>
        <SiteFooter />
      </>
    );
  }

  const ratings = user.reviewsReceived;
  const avg = ratings.length > 0 ? ratings.reduce((s: number, r: { rating: number }) => s + r.rating, 0) / ratings.length : 0;

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
                    <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-2xl font-bold text-white shadow-lg shadow-violet-500/25">
                      {user.firstName.charAt(0)}
                    </div>
                    <div>
                      <CardTitle className="text-2xl">{user.firstName} {user.lastName}</CardTitle>
                      <div className="text-sm text-slate-500">
                        {user.influencerProfile?.city ?? ""}{user.influencerProfile?.city && user.influencerProfile?.country ? ", " : ""}{user.influencerProfile?.country ?? ""}
                      </div>
                      <div className="mt-1 flex items-center gap-2">
                        <Stars rating={avg} />
                        <span className="text-sm text-slate-400">{avg.toFixed(1)} ({ratings.length} reviews)</span>
                      </div>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex flex-wrap gap-2">
                    {user.influencerProfile?.categories.map((c) => (
                      <Badge key={c.categoryId} variant="secondary">{c.category.name}</Badge>
                    ))}
                  </div>
                  {user.influencerProfile?.passion && (
                    <div className="text-sm"><span className="font-medium text-slate-700">Passion:</span> {user.influencerProfile.passion}</div>
                  )}
                  {user.influencerProfile?.followersCountRange && (
                    <div className="text-sm"><span className="font-medium text-slate-700">Followers:</span> {user.influencerProfile.followersCountRange}</div>
                  )}
                  {user.influencerProfile?.mainAccountLink && (
                    <div className="text-sm"><span className="font-medium text-slate-700">Main account:</span>{" "}
                      <a href={user.influencerProfile.mainAccountLink} target="_blank" rel="noopener noreferrer" className="text-violet-600 hover:underline">{user.influencerProfile.mainAccountLink}</a>
                    </div>
                  )}
                  {user.influencerProfile?.socialNetworks && (
                    <div className="text-sm"><span className="font-medium text-slate-700">Social networks:</span> {user.influencerProfile.socialNetworks}</div>
                  )}
                  <div className="text-xs text-slate-400">Member since {user.createdAt.toLocaleDateString()}</div>
                </CardContent>
              </Card>

              {/* Reviews */}
              <Card className="animate-fade-in-up">
                <CardHeader><CardTitle>Reviews ({ratings.length})</CardTitle></CardHeader>
                <CardContent className="space-y-4">
                  {ratings.length === 0 && <div className="text-sm text-slate-400">No reviews yet.</div>}
                  {ratings.map((r) => (
                    <div key={r.id} className="border-b border-slate-100 pb-3 last:border-0">
                      <div className="flex items-center gap-2">
                        <Stars rating={r.rating} />
                        <span className="text-xs text-slate-400">{r.reviewer.firstName} {r.reviewer.lastName} ({r.reviewer.role})</span>
                      </div>
                      {r.comment && <p className="mt-1 text-sm text-slate-600">{r.comment}</p>}
                      <div className="mt-1 text-xs text-slate-400">Campaign: {r.campaign.title}</div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>

            <div className="md:col-span-2 space-y-6">
              {/* Past campaigns */}
              <Card className="animate-fade-in-up">
                <CardHeader><CardTitle>Completed campaigns</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {user.participations.length === 0 && <div className="text-sm text-slate-400">No completed campaigns yet.</div>}
                  {user.participations.map((p) => (
                    <div key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-100 p-2">
                      {p.campaign.photoUrl ? (
                        <Image src={p.campaign.photoUrl} alt="" width={40} height={40} className="rounded-lg object-cover" />
                      ) : (
                        <div className="h-10 w-10 rounded-lg bg-slate-100" />
                      )}
                      <div className="text-sm font-medium text-slate-700">{p.campaign.title}</div>
                    </div>
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
