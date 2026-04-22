import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getAdminNav } from "../_nav";
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

export default async function AdminPitchesPage() {
  await requireRole("ADMIN");
  const nav = await getAdminNav();

  const pitches = await prisma.creatorPitch.findMany({
    where: { status: "PENDING_REVIEW" },
    include: {
      creator: { select: { firstName: true, lastName: true, email: true } },
      categories: { include: { category: true } },
    },
    orderBy: { updatedAt: "asc" },
  });

  return (
    <AppShell title="File de validation" nav={nav}>
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold gradient-text">File de validation</h1>
            <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
              Projets en attente de validation admin.
            </p>
          </div>
          <div
            className="rounded-full px-4 py-1.5 text-sm font-bold font-mono"
            style={{
              background: pitches.length > 0 ? "var(--gold-dim)" : "var(--surface-mid)",
              color: pitches.length > 0 ? "var(--gold)" : "var(--foreground-muted)",
              border: `1px solid ${pitches.length > 0 ? "rgba(255,184,0,0.3)" : "var(--border)"}`,
            }}
          >
            {pitches.length} en attente
          </div>
        </div>

        {pitches.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ border: "1px dashed var(--border)" }}
          >
            <div className="mb-3 text-4xl">✅</div>
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>
              Aucun projet en attente de validation.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {pitches.map((pitch) => (
              <Link key={pitch.id} href={`/admin/pitches/${pitch.id}`} className="block">
                <div className="card-cyber flex items-center gap-4 p-4 transition-all hover:border-primary">
                  {pitch.coverImageUrl ? (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img
                      src={pitch.coverImageUrl}
                      alt={pitch.title}
                      className="h-14 w-14 shrink-0 rounded-xl object-cover"
                    />
                  ) : (
                    <div
                      className="flex h-14 w-14 shrink-0 items-center justify-center rounded-xl text-2xl"
                      style={{ background: "var(--primary-dim)" }}
                    >
                      🎬
                    </div>
                  )}

                  <div className="min-w-0 flex-1">
                    <p className="truncate font-semibold" style={{ color: "var(--foreground)" }}>
                      {pitch.title}
                    </p>
                    <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                      {pitch.creator.firstName} {pitch.creator.lastName} ({pitch.creator.email}) ·{" "}
                      {TYPE_LABELS[pitch.type] ?? pitch.type}
                    </p>
                    {pitch.categories.length > 0 && (
                      <div className="mt-1 flex flex-wrap gap-1">
                        {pitch.categories.slice(0, 3).map(({ category }) => (
                          <span key={category.id} className="tag-neon text-xs">
                            {category.name}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="shrink-0 text-right space-y-1">
                    <p className="font-mono font-semibold text-sm" style={{ color: "var(--primary)" }}>
                      {pitch.budgetTarget.toLocaleString("fr-DZ")} DZD
                    </p>
                    <div
                      className="text-xs font-mono rounded-full px-2 py-0.5"
                      style={{
                        background: pitch.completenessScore >= 80 ? "var(--accent-dim)" : pitch.completenessScore >= 50 ? "var(--gold-dim)" : "var(--danger-dim)",
                        color: pitch.completenessScore >= 80 ? "var(--accent)" : pitch.completenessScore >= 50 ? "var(--gold)" : "var(--danger)",
                      }}
                    >
                      Score: {pitch.completenessScore}%
                    </div>
                    <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                      {new Date(pitch.updatedAt).toLocaleDateString("fr-FR")}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </AppShell>
  );
}
