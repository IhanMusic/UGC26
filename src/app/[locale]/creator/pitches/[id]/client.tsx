"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { CompletenessScore } from "@/components/completeness-score";
import { FundingProgress } from "@/components/funding-progress";
import { SecretLinkCopier } from "@/components/secret-link-copier";

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

type SponsorshipStatus = "INTERESTED" | "COMMITTED" | "PAID" | "REFUNDED";

type Sponsorship = {
  id: string;
  brandId: string;
  amountDZD: number;
  status: SponsorshipStatus;
  brand: { id: string; firstName: string; lastName: string; imageUrl: string | null };
};

type PitchDeliverable = {
  id: string;
  type: string;
  description: string;
  minSponsorshipDZD: number | null;
};

type PitchDetail = {
  id: string;
  title: string;
  type: PitchType;
  status: PitchStatus;
  synopsis: string;
  completenessScore: number;
  budgetTarget: number;
  maxSponsors: number;
  bonusSponsorSlots: number;
  secretToken: string;
  coverImageUrl: string | null;
  platforms: string[];
  targetAudience: string | null;
  createdAt: Date | string;
  updatedAt: Date | string;
  sponsorships: Sponsorship[];
  pitchDeliverables: PitchDeliverable[];
  categories: Array<{ category: { id: string; name: string } }>;
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
    border: "var(--border)",
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
    border: "var(--accent-glow)",
  },
  IN_PRODUCTION: {
    label: "En production",
    color: "var(--secondary)",
    bg: "var(--secondary-dim)",
    border: "var(--border)",
  },
  COMPLETED: {
    label: "Terminé",
    color: "var(--accent)",
    bg: "var(--accent-dim)",
    border: "var(--accent-glow)",
  },
  CLOSED: {
    label: "Fermé",
    color: "var(--danger)",
    bg: "var(--danger-dim)",
    border: "var(--danger)",
  },
  REJECTED: {
    label: "Rejeté",
    color: "var(--danger)",
    bg: "var(--danger-dim)",
    border: "var(--danger)",
  },
};

const SPONSORSHIP_STATUS_LABELS: Record<SponsorshipStatus, string> = {
  INTERESTED: "Intéressé",
  COMMITTED: "Engagé",
  PAID: "Payé",
  REFUNDED: "Remboursé",
};

const DELIVERABLE_TYPE_LABELS: Record<string, string> = {
  MENTION: "Mention",
  LOGO_PLACEMENT: "Logo",
  PRODUCT_INTEGRATION: "Intégration produit",
  EXCLUSIVE_RIGHTS: "Droits exclusifs",
  CUSTOM: "Personnalisé",
};

export default function CreatorPitchDetailClient({
  pitch: initialPitch,
}: {
  pitch: PitchDetail;
}) {
  const [pitch, setPitch] = useState(initialPitch);
  const [working, setWorking] = useState(false);

  const s = STATUS_CONFIG[pitch.status];
  const totalCommitted = pitch.sponsorships.reduce((sum, sp) => sum + sp.amountDZD, 0);
  const sponsorCount = pitch.sponsorships.length;
  const bonusSlotsRemaining = Math.max(
    0,
    pitch.bonusSponsorSlots - Math.max(0, sponsorCount - pitch.maxSponsors)
  );

  const canEdit = pitch.status === "DRAFT" || pitch.status === "REJECTED";
  const canSubmit = pitch.status === "DRAFT" || pitch.status === "REJECTED";
  const canClose = pitch.status === "PUBLISHED" || pitch.status === "FUNDED";

  async function handleAction(action: "submit" | "close") {
    const confirmMsg =
      action === "submit"
        ? "Soumettre ce projet pour révision ?"
        : "Fermer ce projet ? Cette action est irréversible.";
    if (!window.confirm(confirmMsg)) return;

    setWorking(true);
    try {
      const res = await fetch(`/api/pitches/${pitch.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action }),
      });
      if (res.ok) {
        const data = await res.json();
        setPitch((prev) => ({ ...prev, status: data.pitch.status }));
      }
    } finally {
      setWorking(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Hero */}
      <div
        className="rounded-2xl p-6 space-y-4"
        style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
      >
        <Link
          href="/creator/pitches"
          className="inline-flex items-center gap-1.5 text-xs transition-colors"
          style={{ color: "var(--foreground-muted)" }}
        >
          <svg
            className="h-3.5 w-3.5"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
            strokeWidth={2.5}
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Mes Projets
        </Link>

        <div className="flex items-start gap-3 flex-wrap">
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold font-display gradient-text leading-tight">
              {pitch.title}
            </h1>
            <div className="mt-2 flex items-center gap-2 flex-wrap">
              <span className="tag-neon-pink">{TYPE_LABELS[pitch.type]}</span>
              <span
                className="inline-flex items-center rounded-full px-3 py-1 text-xs font-semibold"
                style={{
                  color: s.color,
                  background: s.bg,
                  border: `1px solid ${s.border}`,
                }}
              >
                <span
                  className="mr-1.5 h-1.5 w-1.5 rounded-full"
                  style={{ background: s.color }}
                />
                {s.label}
              </span>
              {pitch.categories.map(({ category }) => (
                <span key={category.id} className="tag-neon text-[10px]">
                  {category.name}
                </span>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            {canEdit && (
              <Link
                href={`/creator/pitches/${pitch.id}/edit`}
                className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
                style={{
                  borderColor: "var(--border-hover)",
                  color: "var(--primary)",
                  background: "var(--primary-dim)",
                }}
              >
                Modifier
              </Link>
            )}
            {canSubmit && (
              <button
                type="button"
                onClick={() => handleAction("submit")}
                disabled={working}
                className="inline-flex items-center rounded-lg px-3 py-1.5 text-xs font-semibold transition-all disabled:opacity-50 btn-neon"
              >
                Soumettre
              </button>
            )}
            {canClose && (
              <button
                type="button"
                onClick={() => handleAction("close")}
                disabled={working}
                className="inline-flex items-center rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50"
                style={{
                  borderColor: "var(--danger)",
                  color: "var(--danger)",
                  background: "var(--danger-dim)",
                }}
              >
                Fermer le projet
              </button>
            )}
          </div>
        </div>

        {pitch.synopsis && (
          <p className="text-sm leading-relaxed" style={{ color: "var(--foreground-muted)" }}>
            {pitch.synopsis}
          </p>
        )}

        {pitch.platforms.length > 0 && (
          <div className="flex items-center gap-2 flex-wrap">
            {pitch.platforms.map((p) => (
              <span
                key={p}
                className="rounded-lg px-2 py-1 text-[11px] font-medium"
                style={{
                  color: "var(--foreground-muted)",
                  background: "var(--surface-mid)",
                  border: "1px solid var(--border)",
                }}
              >
                {p}
              </span>
            ))}
          </div>
        )}
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--foreground-muted)" }}
          >
            Financement
          </h3>
          <FundingProgress
            totalCommitted={totalCommitted}
            budgetTarget={pitch.budgetTarget}
            sponsorCount={sponsorCount}
            maxSponsors={pitch.maxSponsors}
            bonusSlotsRemaining={bonusSlotsRemaining}
          />
        </div>

        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--foreground-muted)" }}
          >
            Complétude du dossier
          </h3>
          <CompletenessScore score={pitch.completenessScore} />
        </div>
      </div>

      <SecretLinkCopier pitchId={pitch.id} secretToken={pitch.secretToken} />

      {pitch.sponsorships.length > 0 && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--foreground-muted)" }}
          >
            Sponsors ({pitch.sponsorships.length})
          </h3>
          <div className="space-y-2">
            {pitch.sponsorships.map((sp) => {
              const spStatus = SPONSORSHIP_STATUS_LABELS[sp.status] ?? sp.status;
              const spColor =
                sp.status === "PAID"
                  ? "var(--accent)"
                  : sp.status === "COMMITTED"
                  ? "var(--primary)"
                  : sp.status === "REFUNDED"
                  ? "var(--danger)"
                  : "var(--foreground-muted)";
              return (
                <div
                  key={sp.id}
                  className="flex items-center justify-between gap-3 rounded-xl px-3 py-2"
                  style={{
                    background: "var(--surface-mid)",
                    border: "1px solid var(--border)",
                  }}
                >
                  <div className="flex items-center gap-2.5">
                    <div
                      className="flex h-8 w-8 items-center justify-center rounded-full text-xs font-bold flex-shrink-0"
                      style={{
                        background: "var(--secondary-dim)",
                        color: "var(--secondary)",
                        border: "1px solid var(--border)",
                      }}
                    >
                      {sp.brand.firstName.charAt(0)}
                      {sp.brand.lastName.charAt(0)}
                    </div>
                    <span className="text-sm font-medium" style={{ color: "var(--foreground)" }}>
                      {sp.brand.firstName} {sp.brand.lastName}
                    </span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span
                      className="font-mono text-sm font-bold"
                      style={{ color: "var(--primary)" }}
                    >
                      {sp.amountDZD.toLocaleString("fr-DZ")} DZD
                    </span>
                    <span
                      className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase"
                      style={{
                        color: spColor,
                        background: `color-mix(in srgb, ${spColor} 12%, transparent)`,
                        border: `1px solid color-mix(in srgb, ${spColor} 30%, transparent)`,
                      }}
                    >
                      {spStatus}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {pitch.pitchDeliverables.length > 0 && (
        <div
          className="rounded-2xl p-5 space-y-4"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <h3
            className="text-xs font-semibold uppercase tracking-wider"
            style={{ color: "var(--foreground-muted)" }}
          >
            Avantages sponsors ({pitch.pitchDeliverables.length})
          </h3>
          <div className="space-y-2">
            {pitch.pitchDeliverables.map((d) => (
              <div
                key={d.id}
                className="flex items-start justify-between gap-3 rounded-xl px-3 py-2.5"
                style={{
                  background: "var(--surface-mid)",
                  border: "1px solid var(--border)",
                }}
              >
                <div className="space-y-0.5">
                  <span
                    className="text-xs font-semibold uppercase tracking-wider"
                    style={{ color: "var(--secondary)" }}
                  >
                    {DELIVERABLE_TYPE_LABELS[d.type] ?? d.type}
                  </span>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>
                    {d.description}
                  </p>
                </div>
                {d.minSponsorshipDZD != null && (
                  <span
                    className="flex-shrink-0 font-mono text-xs"
                    style={{ color: "var(--gold)" }}
                  >
                    min. {d.minSponsorshipDZD.toLocaleString("fr-DZ")} DZD
                  </span>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
