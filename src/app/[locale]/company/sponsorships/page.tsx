import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { getCompanyNav } from "../_nav";
import { prisma } from "@/server/db";
import { Link } from "@/i18n/navigation";

const STATUS_LABELS: Record<string, string> = {
  INTERESTED: "Intéressé",
  COMMITTED: "Engagé",
  PAID: "Payé",
  REFUNDED: "Remboursé",
};

const STATUS_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  INTERESTED: { bg: "var(--surface-mid)", text: "var(--foreground-muted)", border: "var(--border)" },
  COMMITTED: { bg: "var(--primary-dim)", text: "var(--primary)", border: "rgba(0,229,255,0.3)" },
  PAID: { bg: "var(--accent-dim)", text: "var(--accent)", border: "rgba(0,255,136,0.3)" },
  REFUNDED: { bg: "var(--danger-dim)", text: "var(--danger)", border: "rgba(255,59,92,0.3)" },
};

export default async function CompanySponsorshipsPage() {
  const user = await requireRole("COMPANY");
  const nav = await getCompanyNav();

  const sponsorships = await prisma.pitchSponsorship.findMany({
    where: { brandId: user.id },
    include: {
      pitch: {
        select: {
          id: true,
          title: true,
          type: true,
          status: true,
          coverImageUrl: true,
          budgetTarget: true,
          creator: { select: { firstName: true, lastName: true } },
        },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AppShell title="Mes sponsorisations" nav={nav}>
      <div className="space-y-6">
        <div>
          <h1 className="text-2xl font-bold gradient-text">Mes Sponsorisations</h1>
          <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
            Tous vos engagements de sponsoring sur des projets créateurs.
          </p>
        </div>

        {sponsorships.length === 0 ? (
          <div
            className="rounded-2xl p-12 text-center"
            style={{ border: "1px dashed var(--border)" }}
          >
            <div className="mb-3 text-4xl">💰</div>
            <p className="font-semibold" style={{ color: "var(--foreground)" }}>
              Vous n&apos;avez pas encore de sponsorisations.
            </p>
            <p className="mt-1 text-sm" style={{ color: "var(--foreground-muted)" }}>
              Explorez la marketplace pour soutenir des projets créateurs.
            </p>
            <Link
              href="/company/projets"
              className="mt-4 inline-block btn-neon"
            >
              Voir les projets
            </Link>
          </div>
        ) : (
          <div className="space-y-3">
            {sponsorships.map((s) => {
              const colors = STATUS_COLORS[s.status] ?? STATUS_COLORS.COMMITTED;
              return (
                <Link key={s.id} href={`/company/sponsorships/${s.pitchId}`} className="block">
                  <div className="card-cyber flex items-center gap-4 p-4 transition-all hover:border-primary">
                    {s.pitch.coverImageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={s.pitch.coverImageUrl}
                        alt={s.pitch.title}
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
                      <p
                        className="truncate font-semibold"
                        style={{ color: "var(--foreground)" }}
                      >
                        {s.pitch.title}
                      </p>
                      <p className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
                        {s.pitch.creator.firstName} {s.pitch.creator.lastName}
                      </p>
                    </div>

                    <div className="shrink-0 text-right space-y-1">
                      <p className="font-mono font-bold" style={{ color: "var(--gold)" }}>
                        {s.amountDZD.toLocaleString("fr-DZ")} DZD
                      </p>
                      <span
                        className="inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                        style={{ background: colors.bg, color: colors.text, border: `1px solid ${colors.border}` }}
                      >
                        {STATUS_LABELS[s.status] ?? s.status}
                      </span>
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
