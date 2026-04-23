"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { Link } from "@/i18n/navigation";
import { CompletenessScore } from "@/components/completeness-score";
import { StoryboardViewer } from "@/components/storyboard-viewer";

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

const DELIVERABLE_TYPE_LABELS: Record<string, string> = {
  MENTION: "Mention",
  LOGO_PLACEMENT: "Logo",
  PRODUCT_INTEGRATION: "Intégration produit",
  EXCLUSIVE_RIGHTS: "Droits exclusifs",
  CUSTOM: "Personnalisé",
};

type Pitch = {
  id: string;
  title: string;
  type: string;
  status: string;
  synopsis: string;
  budgetTarget: number;
  maxSponsors: number;
  bonusSponsorSlots: number;
  coverImageUrl: string | null;
  platforms: string[];
  targetAudience: string | null;
  ageRange: string | null;
  country: string | null;
  timeline: unknown;
  teamDescription: string | null;
  references: string[];
  storyboardUrls: string[];
  pitchDocumentUrl: string | null;
  completenessScore: number;
  pitchDeliverables: { id: string; description: string; type: string; minSponsorshipDZD: number | null }[];
  categories: { category: { id: string; name: string } }[];
  creator: { id: string; firstName: string; lastName: string; email: string; imageUrl: string | null };
};

export default function AdminPitchReviewClient({ pitch }: { pitch: Pitch }) {
  const router = useRouter();
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState<"approve" | "reject" | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isPending = pitch.status === "PENDING_REVIEW";
  const timeline = pitch.timeline as Record<string, string> | null;

  async function handleAction(action: "approve" | "reject") {
    if (action === "reject" && !reason.trim()) {
      setError("Une raison est requise pour refuser un projet.");
      return;
    }
    setLoading(action);
    setError(null);
    try {
      const res = await fetch(`/api/pitches/${pitch.id}/review`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, reason: reason.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Erreur.");
        return;
      }
      router.push("/admin/pitches");
      router.refresh();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
        <Link href="/admin/pitches" className="hover:underline" style={{ color: "var(--primary)" }}>
          ← File de validation
        </Link>
      </div>

      {/* Header */}
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold" style={{ color: "var(--foreground)" }}>
            {pitch.title}
          </h1>
          <div className="mt-1 flex flex-wrap items-center gap-2 text-sm">
            <span style={{ color: "var(--foreground-muted)" }}>
              {TYPE_LABELS[pitch.type] ?? pitch.type}
            </span>
            <span style={{ color: "var(--border)" }}>·</span>
            <span style={{ color: "var(--foreground-muted)" }}>
              {pitch.creator.firstName} {pitch.creator.lastName} ({pitch.creator.email})
            </span>
          </div>
        </div>
        <div
          className="rounded-full px-3 py-1 text-sm font-semibold"
          style={{
            background: pitch.status === "PENDING_REVIEW" ? "var(--gold-dim)" : "var(--surface-mid)",
            color: pitch.status === "PENDING_REVIEW" ? "var(--gold)" : "var(--foreground-muted)",
            border: `1px solid ${pitch.status === "PENDING_REVIEW" ? "rgba(255,184,0,0.3)" : "var(--border)"}`,
          }}
        >
          {pitch.status === "PENDING_REVIEW" ? "En attente" : pitch.status}
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-3">
        {/* Main content */}
        <div className="space-y-5 lg:col-span-2">
          {pitch.coverImageUrl && (
            /* eslint-disable-next-line @next/next/no-img-element */
            <img
              src={pitch.coverImageUrl}
              alt={pitch.title}
              className="w-full rounded-2xl object-cover"
              style={{ maxHeight: "320px", border: "1px solid var(--border)" }}
            />
          )}

          <div className="card-cyber p-5">
            <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
              Synopsis
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed text-sm" style={{ color: "var(--foreground)" }}>
              {pitch.synopsis}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pitch.targetAudience && (
              <div className="card-cyber p-4">
                <h3 className="mb-1 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                  Audience cible
                </h3>
                <p className="text-sm" style={{ color: "var(--foreground)" }}>{pitch.targetAudience}</p>
                <div className="mt-2 flex flex-wrap gap-1">
                  {pitch.ageRange && <span className="tag-neon text-xs">{pitch.ageRange}</span>}
                  {pitch.country && <span className="tag-neon-pink text-xs">{pitch.country}</span>}
                </div>
              </div>
            )}

            {timeline && Object.keys(timeline).length > 0 && (
              <div className="card-cyber p-4">
                <h3 className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                  Planning
                </h3>
                <div className="space-y-1">
                  {Object.entries(timeline).map(([phase, date]) => (
                    <div key={phase} className="flex items-center justify-between">
                      <span className="text-xs capitalize" style={{ color: "var(--foreground)" }}>{phase}</span>
                      <span className="text-xs font-mono" style={{ color: "var(--primary)" }}>{date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {pitch.teamDescription && (
            <div className="card-cyber p-5">
              <h2 className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                Équipe
              </h2>
              <p className="whitespace-pre-wrap text-sm leading-relaxed" style={{ color: "var(--foreground)" }}>
                {pitch.teamDescription}
              </p>
            </div>
          )}

          {pitch.storyboardUrls.length > 0 && (
            <div className="card-cyber p-5">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                Storyboard
              </h2>
              <StoryboardViewer urls={pitch.storyboardUrls} />
            </div>
          )}

          {pitch.pitchDocumentUrl && (
            <div className="card-cyber p-4">
              <a
                href={pitch.pitchDocumentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 text-sm font-medium hover:underline"
                style={{ color: "var(--primary)" }}
              >
                📄 Télécharger le dossier de présentation
              </a>
            </div>
          )}

          {pitch.pitchDeliverables.length > 0 && (
            <div className="card-cyber overflow-hidden p-0">
              <div className="p-4" style={{ borderBottom: "1px solid var(--border)" }}>
                <h2 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                  Livrables
                </h2>
              </div>
              {pitch.pitchDeliverables.map((d) => (
                <div
                  key={d.id}
                  className="flex items-start justify-between gap-4 p-4"
                  style={{ borderBottom: "1px solid var(--border)" }}
                >
                  <div>
                    <span
                      className="mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                      style={{
                        background: "var(--secondary-dim)",
                        color: "var(--secondary)",
                        border: "1px solid rgba(255,45,120,0.3)",
                      }}
                    >
                      {DELIVERABLE_TYPE_LABELS[d.type] ?? d.type}
                    </span>
                    <p className="text-sm" style={{ color: "var(--foreground)" }}>
                      {d.description}
                    </p>
                  </div>
                  {d.minSponsorshipDZD != null && (
                    <span
                      className="shrink-0 rounded-lg px-2 py-1 text-xs font-mono"
                      style={{
                        background: "var(--gold-dim)",
                        color: "var(--gold)",
                        border: "1px solid rgba(255,184,0,0.3)",
                      }}
                    >
                      min {d.minSponsorshipDZD.toLocaleString("fr-DZ")} DZD
                    </span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-5">
          {/* Completeness */}
          <div className="card-cyber p-5">
            <CompletenessScore score={pitch.completenessScore} />
          </div>

          {/* Key metrics */}
          <div className="card-cyber p-5 space-y-3">
            <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
              Informations clés
            </h3>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span style={{ color: "var(--foreground-muted)" }}>Budget cible</span>
                <span className="font-mono font-semibold" style={{ color: "var(--primary)" }}>
                  {pitch.budgetTarget.toLocaleString("fr-DZ")} DZD
                </span>
              </div>
              <div className="flex justify-between">
                <span style={{ color: "var(--foreground-muted)" }}>Max sponsors</span>
                <span className="font-mono" style={{ color: "var(--foreground)" }}>
                  {pitch.maxSponsors} (+{pitch.bonusSponsorSlots} bonus)
                </span>
              </div>
              {pitch.platforms.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  {pitch.platforms.map((p) => (
                    <span key={p} className="tag-neon text-xs">{p}</span>
                  ))}
                </div>
              )}
              {pitch.categories.length > 0 && (
                <div className="flex flex-wrap gap-1">
                  {pitch.categories.map(({ category }) => (
                    <span key={category.id} className="tag-neon-pink text-xs">{category.name}</span>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Review actions */}
          {isPending && (
            <div className="card-cyber p-5 space-y-4">
              <h3 className="text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                Décision de validation
              </h3>

              <div>
                <label
                  className="mb-1 block text-xs font-semibold uppercase tracking-wider"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  Raison (obligatoire si refus)
                </label>
                <textarea
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  rows={3}
                  placeholder="Motif de refus ou commentaire..."
                  className="input-cyber w-full resize-none"
                />
              </div>

              {error && (
                <p
                  className="rounded-lg p-3 text-xs"
                  style={{ background: "var(--danger-dim)", color: "var(--danger)" }}
                >
                  {error}
                </p>
              )}

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => handleAction("reject")}
                  disabled={loading !== null}
                  className="flex-1 rounded-xl py-2.5 text-sm font-semibold transition-all disabled:opacity-40"
                  style={{
                    background: "var(--danger-dim)",
                    color: "var(--danger)",
                    border: "1px solid rgba(255,59,92,0.4)",
                  }}
                >
                  {loading === "reject" ? "Refus…" : "✕ Refuser"}
                </button>
                <button
                  type="button"
                  onClick={() => handleAction("approve")}
                  disabled={loading !== null}
                  className="btn-neon flex-1 disabled:opacity-40"
                >
                  {loading === "approve" ? "Validation…" : "✓ Valider"}
                </button>
              </div>
            </div>
          )}

          {!isPending && (
            <div
              className="rounded-xl p-4 text-center text-sm"
              style={{
                background: pitch.status === "PUBLISHED" ? "var(--accent-dim)" : "var(--danger-dim)",
                color: pitch.status === "PUBLISHED" ? "var(--accent)" : "var(--danger)",
                border: `1px solid ${pitch.status === "PUBLISHED" ? "rgba(0,255,136,0.3)" : "rgba(255,59,92,0.3)"}`,
              }}
            >
              {pitch.status === "PUBLISHED" ? "✓ Projet validé et publié" : "✕ Projet refusé"}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
