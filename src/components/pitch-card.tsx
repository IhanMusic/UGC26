import { Link } from "@/i18n/navigation";
import { CompletenessScore } from "@/components/completeness-score";
import { FundingProgress } from "@/components/funding-progress";

type PitchStatus =
  | "DRAFT"
  | "PENDING_REVIEW"
  | "PUBLISHED"
  | "FUNDED"
  | "IN_PRODUCTION"
  | "COMPLETED"
  | "CLOSED"
  | "REJECTED";

type PitchType =
  | "MINI_FILM"
  | "SERIE"
  | "SHOOTING"
  | "PODCAST"
  | "REPORTAGE"
  | "CLIP_MUSICAL"
  | "DOCUMENTAIRE"
  | "AUTRE";

interface PitchCardProps {
  id: string;
  title: string;
  type: PitchType;
  status: PitchStatus;
  completenessScore: number;
  budgetTarget: number;
  totalCommitted: number;
  sponsorCount: number;
  maxSponsors: number;
  bonusSponsorSlots: number;
  createdAt: Date | string;
  secretToken: string;
}

const STATUS_CONFIG: Record<
  PitchStatus,
  { label: string; color: string; bg: string; border: string }
> = {
  DRAFT: {
    label: "Brouillon",
    color: "var(--foreground-muted)",
    bg: "var(--surface)",
    border: "var(--border)",
  },
  PENDING_REVIEW: {
    label: "En révision",
    color: "var(--gold)",
    bg: "var(--gold-dim)",
    border: "rgba(255,184,0,0.3)",
  },
  PUBLISHED: {
    label: "Publié",
    color: "var(--primary)",
    bg: "var(--primary-dim)",
    border: "var(--border-hover)",
  },
  FUNDED: {
    label: "Financé",
    color: "var(--accent)",
    bg: "var(--accent-dim)",
    border: "rgba(0,255,136,0.3)",
  },
  IN_PRODUCTION: {
    label: "En production",
    color: "var(--secondary)",
    bg: "var(--secondary-dim)",
    border: "rgba(255,45,120,0.3)",
  },
  COMPLETED: {
    label: "Terminé",
    color: "var(--accent)",
    bg: "var(--accent-dim)",
    border: "rgba(0,255,136,0.3)",
  },
  CLOSED: {
    label: "Fermé",
    color: "var(--danger)",
    bg: "rgba(255,59,92,0.1)",
    border: "rgba(255,59,92,0.3)",
  },
  REJECTED: {
    label: "Rejeté",
    color: "var(--danger)",
    bg: "rgba(255,59,92,0.1)",
    border: "rgba(255,59,92,0.3)",
  },
};

const TYPE_LABELS: Record<PitchType, string> = {
  MINI_FILM: "Mini-film",
  SERIE: "Série",
  SHOOTING: "Shooting",
  PODCAST: "Podcast",
  REPORTAGE: "Reportage",
  CLIP_MUSICAL: "Clip musical",
  DOCUMENTAIRE: "Documentaire",
  AUTRE: "Autre",
};

export function PitchCard({
  id,
  title,
  type,
  status,
  completenessScore,
  budgetTarget,
  totalCommitted,
  sponsorCount,
  maxSponsors,
  bonusSponsorSlots,
  createdAt,
  secretToken,
}: PitchCardProps) {
  const s = STATUS_CONFIG[status];
  const bonusSlotsRemaining = Math.max(
    0,
    bonusSponsorSlots - Math.max(0, sponsorCount - maxSponsors)
  );
  const canEdit = status === "DRAFT" || status === "REJECTED";

  return (
    <div className="card-cyber group p-5 space-y-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 flex-1">
          <Link
            href={`/creator/pitches/${id}`}
            className="block text-base font-semibold leading-tight transition-colors hover:text-[color:var(--primary)] truncate"
            style={{ color: "var(--foreground)" }}
          >
            {title}
          </Link>
          <div className="mt-1.5 flex items-center gap-2 flex-wrap">
            <span className="tag-neon-pink text-[10px]">{TYPE_LABELS[type]}</span>
            <span
              className="inline-flex items-center rounded-full px-2.5 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
              style={{
                color: s.color,
                background: s.bg,
                border: `1px solid ${s.border}`,
              }}
            >
              <span
                className="mr-1.5 h-1.5 w-1.5 rounded-full flex-shrink-0"
                style={{ background: s.color }}
              />
              {s.label}
            </span>
          </div>
        </div>
        <div className="text-[10px] flex-shrink-0" style={{ color: "var(--foreground-muted)" }}>
          {new Date(createdAt).toLocaleDateString("fr-DZ", {
            day: "2-digit",
            month: "short",
            year: "numeric",
          })}
        </div>
      </div>

      <CompletenessScore score={completenessScore} />

      <FundingProgress
        totalCommitted={totalCommitted}
        budgetTarget={budgetTarget}
        sponsorCount={sponsorCount}
        maxSponsors={maxSponsors}
        bonusSlotsRemaining={bonusSlotsRemaining}
      />

      <div className="section-line" />

      <div className="flex items-center gap-2 flex-wrap">
        <Link
          href={`/creator/pitches/${id}`}
          className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
          style={{
            color: "var(--primary)",
            background: "var(--primary-dim)",
            border: "1px solid var(--border-hover)",
          }}
        >
          Voir
        </Link>
        {canEdit && (
          <Link
            href={`/creator/pitches/${id}/edit`}
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              color: "var(--secondary)",
              background: "var(--secondary-dim)",
              border: "1px solid rgba(255,45,120,0.3)",
            }}
          >
            Modifier
          </Link>
        )}
        {status !== "DRAFT" && (
          <a
            href={`https://adwaa.dz/p/${secretToken}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs font-medium transition-all"
            style={{
              color: "var(--foreground-muted)",
              background: "var(--surface)",
              border: "1px solid var(--border)",
            }}
          >
            Lien public
          </a>
        )}
      </div>
    </div>
  );
}
