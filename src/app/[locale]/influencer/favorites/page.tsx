import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getInfluencerNav } from "../_nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export default async function FavoritesPage() {
  const user = await requireRole("INFLUENCER");
  const t = await getTranslations("nav");

  const favorites = await prisma.favorite.findMany({
    where: { userId: user.id },
    orderBy: { createdAt: "desc" },
    include: {
      campaign: {
        include: {
          categories: { include: { category: true } },
          company: { select: { firstName: true, lastName: true, companyProfile: true } },
        },
      },
    },
  });

  return (
    <AppShell title={t("myFavorites")} nav={await getInfluencerNav()}>
      {favorites.length === 0 ? (
        <div className="text-center text-slate-400 py-12">
          No favorites yet. Browse campaigns and click the heart icon to save them.
        </div>
      ) : (
        <div className="grid gap-5 md:grid-cols-2">
          {favorites.map((f) => (
            <Card key={f.id} className="group overflow-hidden">
              {f.campaign.photoUrl && (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={f.campaign.photoUrl} alt={f.campaign.title} className="h-40 w-full object-cover transition-transform duration-500 group-hover:scale-105" />
              )}
              <CardHeader>
                <CardTitle className="text-base">
                  <Link href={`/public/campaigns/${f.campaign.id}`} className="hover:text-violet-700 hover:underline underline-offset-4">
                    {f.campaign.title}
                  </Link>
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div className="text-sm text-slate-500">
                  {f.campaign.priceDinar.toLocaleString()} DZD
                </div>
                <div className="text-xs text-slate-400">
                  {f.campaign.company.companyProfile?.companyName ?? `${f.campaign.company.firstName} ${f.campaign.company.lastName}`}
                </div>
                <div className="flex flex-wrap gap-1.5">
                  {f.campaign.categories.map((c) => (
                    <Badge key={c.categoryId} variant="secondary">{c.category.name}</Badge>
                  ))}
                </div>
                <Badge variant={f.campaign.status === "PAID" ? "success" : "secondary"}>{f.campaign.status}</Badge>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </AppShell>
  );
}
