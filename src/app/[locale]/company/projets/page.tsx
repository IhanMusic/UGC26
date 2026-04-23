import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../_nav";
import { prisma } from "@/server/db";
import { Link } from "@/i18n/navigation";

const TYPE_LABELS: Record<string, string> = {
  MINI_FILM: "Mini-film",
  SERIE: "Série",
  SHOOTING: "Shooting",
  PODCAST: "Podcast",
  REPORTAGE: "Reportage",
  CLIP_MUSICAL: "Clip musical",
  DOCUMENTAIRE: "Documentaire",
  AUTRE: "Autre",
};

export default async function CompanyProjetsPage() {
  const user = await requireRole("COMPANY");
  const nav = await getCompanyNav();

  const pitches = await prisma.creatorPitch.findMany({
    where: { status: { in: ["PUBLISHED", "FUNDED"] }, visibility: "PUBLIC" },
    include: {
      creator: { select: { firstName: true, lastName: true, imageUrl: true } },
      sponsorships: { select: { amountDZD: true, brandId: true } },
      categories: { include: { category: true } },
    },
    orderBy: { updatedAt: "desc" },
  });

  return (
    <AppShell title="Projets créateurs" nav={nav}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Marketplace créateurs</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
            Découvrez et sponsorisez des projets artistiques créés par nos influenceurs.
          </p>
        </div>

        {pitches.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ border: "1px dashed var(--border)" }}
          >
            <div className="mb-3 text-4xl">🎬</div>
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>
              Aucun projet disponible pour le moment.
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
              Revenez bientôt pour découvrir les projets des créateurs.
            </p>
          </div>
        ) : (
          <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {pitches.map((pitch) => {
              const totalCommitted = pitch.sponsorships.reduce((s, sp) => s + sp.amountDZD, 0);
              const pct =
                pitch.budgetTarget > 0
                  ? Math.min(100, Math.round((totalCommitted / pitch.budgetTarget) * 100))
                  : 0;
              const isMySponsor = pitch.sponsorships.some((s) => s.brandId === user.id);

              return (
                <Link key={pitch.id} href={`/company/projets/${pitch.id}`} className="block">
                  <div
                    className="card-cyber h-full overflow-hidden transition-all hover:border-primary"
                    style={{ padding: 0 }}
                  >
                    {pitch.coverImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={pitch.coverImageUrl}
                        alt={pitch.title}
                        className="h-44 w-full object-cover"
                      />
                    ) : (
                      <div
                        className="flex h-32 w-full items-center justify-center"
                        style={{
                          background:
                            "linear-gradient(135deg, var(--primary-dim), var(--secondary-dim))",
                        }}
                      >
                        <span className="text-4xl">🎬</span>
                      </div>
                    )}

                    <div className="p-4 space-y-3">
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <p
                            className="truncate font-semibold"
                            style={{ color: "var(--foreground)" }}
                          >
                            {pitch.title}
                          </p>
                          <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                            {pitch.creator.firstName} {pitch.creator.lastName} ·{" "}
                            {TYPE_LABELS[pitch.type] ?? pitch.type}
                          </p>
                        </div>
                        {isMySponsor && (
                          <span
                            className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                            style={{
                              background: "var(--accent-dim)",
                              color: "var(--accent)",
                              border: "1px solid var(--accent-glow)",
                            }}
                          >
                            Sponsor
                          </span>
                        )}
                      </div>

                      {/* Funding bar */}
                      <div className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span style={{ color: "var(--foreground-muted)" }}>
                            {totalCommitted.toLocaleString("fr-DZ")} / {pitch.budgetTarget.toLocaleString("fr-DZ")} DZD
                          </span>
                          <span
                            className="font-bold font-mono"
                            style={{ color: pct >= 100 ? "var(--accent)" : "var(--primary)" }}
                          >
                            {pct}%
                          </span>
                        </div>
                        <div
                          className="h-1.5 w-full overflow-hidden rounded-full"
                          style={{ background: "var(--surface-mid)" }}
                        >
                          <div
                            className="h-full rounded-full"
                            style={{
                              width: `${pct}%`,
                              background:
                                pct >= 100
                                  ? "linear-gradient(90deg, var(--accent), var(--success))"
                                  : "linear-gradient(90deg, var(--primary), var(--secondary))",
                            }}
                          />
                        </div>
                        <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                          {pitch.sponsorships.length}/{pitch.maxSponsors} sponsors
                        </p>
                      </div>

                      {pitch.categories.length > 0 && (
                        <div className="flex flex-wrap gap-1">
                          {pitch.categories.slice(0, 3).map(({ category }) => (
                            <span key={category.id} className="tag-neon text-xs">
                              {category.name}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}
