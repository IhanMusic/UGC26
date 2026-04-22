"use client";

import { useState } from "react";
import { cn } from "@/components/ui/utils";
import { FundingProgress } from "@/components/funding-progress";
import { StoryboardViewer } from "@/components/storyboard-viewer";
import { SponsorshipModal } from "@/components/sponsorship-modal";
import { Link } from "@/i18n/navigation";

const PITCH_TYPE_LABELS: Record<string, string> = {
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

export type PitchLandingData = {
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
  pitchDeliverables: { id: string; description: string; type: string; minSponsorshipDZD: number | null }[];
  creator: { id: string; firstName: string; lastName: string; imageUrl: string | null };
  sponsorships: { amountDZD: number }[];
  alreadySponsored: boolean;
  backHref: string;
  readOnly?: boolean;
};

const TABS = [
  { key: "dossier", label: "Dossier" },
  { key: "storyboard", label: "Storyboard" },
  { key: "livrables", label: "Livrables" },
  { key: "equipe", label: "Équipe" },
] as const;

type Tab = (typeof TABS)[number]["key"];

export function PitchLandingPage({ pitch }: { pitch: PitchLandingData }) {
  const [tab, setTab] = useState<Tab>("dossier");
  const [sponsorOpen, setSponsorOpen] = useState(false);

  const totalCommitted = pitch.sponsorships.reduce((s, sp) => s + sp.amountDZD, 0);
  const bonusSlotsRemaining = Math.max(
    0,
    pitch.maxSponsors + pitch.bonusSponsorSlots - pitch.sponsorships.length
  );
  const canSponsor =
    !pitch.readOnly &&
    !pitch.alreadySponsored &&
    (pitch.status === "PUBLISHED" || pitch.status === "FUNDED") &&
    pitch.sponsorships.length < pitch.maxSponsors + pitch.bonusSponsorSlots;

  const timeline = pitch.timeline as Record<string, string> | null;

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 text-sm" style={{ color: "var(--foreground-muted)" }}>
        <Link href={pitch.backHref} className="hover:underline" style={{ color: "var(--primary)" }}>
          ← Retour
        </Link>
      </div>

      {/* Hero */}
      <div
        className="relative overflow-hidden rounded-2xl"
        style={{ border: "1px solid var(--border)" }}
      >
        {pitch.coverImageUrl ? (
          /* eslint-disable-next-line @next/next/no-img-element */
          <img
            src={pitch.coverImageUrl}
            alt={pitch.title}
            className="h-64 w-full object-cover sm:h-80"
          />
        ) : (
          <div
            className="flex h-48 w-full items-center justify-center sm:h-64"
            style={{
              background: "linear-gradient(135deg, var(--primary-dim), var(--secondary-dim))",
            }}
          >
            <span className="text-5xl">🎬</span>
          </div>
        )}

        <div
          className="absolute inset-0"
          style={{
            background:
              "linear-gradient(to top, rgba(0,0,0,0.85) 30%, rgba(0,0,0,0.2) 70%, transparent)",
          }}
        />

        <div className="absolute bottom-0 left-0 right-0 p-6">
          <div className="flex flex-wrap items-end justify-between gap-4">
            <div>
              <div className="mb-2 flex flex-wrap items-center gap-2">
                <span
                  className="rounded-full px-3 py-1 text-xs font-semibold"
                  style={{
                    background: "var(--primary-dim)",
                    color: "var(--primary)",
                    border: "1px solid var(--border-hover)",
                  }}
                >
                  {PITCH_TYPE_LABELS[pitch.type] ?? pitch.type}
                </span>
                {pitch.platforms.map((p) => (
                  <span key={p} className="tag-neon text-xs">
                    {p}
                  </span>
                ))}
              </div>
              <h1 className="text-2xl font-bold text-white sm:text-3xl">{pitch.title}</h1>
              <p className="mt-1 text-sm" style={{ color: "rgba(255,255,255,0.7)" }}>
                par {pitch.creator.firstName} {pitch.creator.lastName}
              </p>
            </div>

            {canSponsor && (
              <button
                type="button"
                className="btn-neon shrink-0"
                onClick={() => setSponsorOpen(true)}
              >
                💰 Sponsoriser ce projet
              </button>
            )}
            {pitch.alreadySponsored && !pitch.readOnly && (
              <span
                className="shrink-0 rounded-full px-4 py-2 text-sm font-semibold"
                style={{
                  background: "var(--accent-dim)",
                  color: "var(--accent)",
                  border: "1px solid rgba(0,255,136,0.3)",
                }}
              >
                ✓ Vous sponsorisez ce projet
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Funding */}
      <div className="card-cyber p-5">
        <FundingProgress
          totalCommitted={totalCommitted}
          budgetTarget={pitch.budgetTarget}
          sponsorCount={pitch.sponsorships.length}
          maxSponsors={pitch.maxSponsors}
          bonusSlotsRemaining={bonusSlotsRemaining}
        />
      </div>

      {/* Tabs */}
      <div
        className="flex gap-1 overflow-x-auto rounded-xl p-1"
        style={{ background: "var(--surface-mid)" }}
      >
        {TABS.map((t) => (
          <button
            key={t.key}
            type="button"
            onClick={() => setTab(t.key)}
            className={cn(
              "shrink-0 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              tab === t.key
                ? "text-white"
                : "hover:opacity-80"
            )}
            style={
              tab === t.key
                ? { background: "var(--primary)", color: "var(--background)" }
                : { color: "var(--foreground-muted)" }
            }
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Tab content */}
      {tab === "dossier" && (
        <div className="space-y-4">
          <div className="card-cyber p-5">
            <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
              Synopsis
            </h2>
            <p className="whitespace-pre-wrap leading-relaxed" style={{ color: "var(--foreground)" }}>
              {pitch.synopsis}
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            {pitch.targetAudience && (
              <div className="card-cyber p-5">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                  Audience cible
                </h3>
                <p style={{ color: "var(--foreground)" }}>{pitch.targetAudience}</p>
                {(pitch.ageRange || pitch.country) && (
                  <div className="mt-2 flex flex-wrap gap-2">
                    {pitch.ageRange && <span className="tag-neon text-xs">{pitch.ageRange}</span>}
                    {pitch.country && <span className="tag-neon-purple text-xs">{pitch.country}</span>}
                  </div>
                )}
              </div>
            )}

            {timeline && Object.keys(timeline).length > 0 && (
              <div className="card-cyber p-5">
                <h3 className="mb-2 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                  Planning
                </h3>
                <div className="space-y-1">
                  {Object.entries(timeline).map(([phase, date]) => (
                    <div key={phase} className="flex items-center justify-between gap-2">
                      <span className="text-sm capitalize" style={{ color: "var(--foreground)" }}>{phase}</span>
                      <span className="text-sm font-mono" style={{ color: "var(--primary)" }}>{date}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {pitch.references.length > 0 && (
            <div className="card-cyber p-5">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
                Références
              </h3>
              <div className="space-y-2">
                {pitch.references.map((ref, i) => (
                  <a
                    key={i}
                    href={ref}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate text-sm hover:underline"
                    style={{ color: "var(--primary)" }}
                  >
                    {ref}
                  </a>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {tab === "storyboard" && (
        <div className="card-cyber p-5">
          {pitch.storyboardUrls.length > 0 ? (
            <StoryboardViewer urls={pitch.storyboardUrls} />
          ) : (
            <p className="text-center text-sm" style={{ color: "var(--foreground-muted)" }}>
              Aucun storyboard partagé.
            </p>
          )}
        </div>
      )}

      {tab === "livrables" && (
        <div className="card-cyber divide-y p-0 overflow-hidden" style={{ borderColor: "var(--border)" }}>
          {pitch.pitchDeliverables.length === 0 ? (
            <p className="p-5 text-center text-sm" style={{ color: "var(--foreground-muted)" }}>
              Aucun livrable défini.
            </p>
          ) : (
            pitch.pitchDeliverables.map((d) => (
              <div key={d.id} className="flex items-start justify-between gap-4 p-4">
                <div>
                  <span
                    className="mb-1 inline-block rounded-full px-2 py-0.5 text-xs font-semibold"
                    style={{
                      background: "var(--secondary-dim)",
                      color: "var(--secondary)",
                      border: "1px solid rgba(139,92,246,0.3)",
                    }}
                  >
                    {DELIVERABLE_TYPE_LABELS[d.type] ?? d.type}
                  </span>
                  <p className="text-sm" style={{ color: "var(--foreground)" }}>
                    {d.description}
                  </p>
                </div>
                {d.minSponsorshipDZD != null && (
                  <div
                    className="shrink-0 rounded-lg px-3 py-1 text-right text-xs font-mono"
                    style={{
                      background: "var(--gold-dim)",
                      color: "var(--gold)",
                      border: "1px solid rgba(255,184,0,0.3)",
                    }}
                  >
                    min {d.minSponsorshipDZD.toLocaleString("fr-DZ")} DZD
                  </div>
                )}
              </div>
            ))
          )}
        </div>
      )}

      {tab === "equipe" && (
        <div className="card-cyber p-5">
          <div className="mb-4 flex items-center gap-3">
            {pitch.creator.imageUrl ? (
              /* eslint-disable-next-line @next/next/no-img-element */
              <img
                src={pitch.creator.imageUrl}
                alt={`${pitch.creator.firstName} ${pitch.creator.lastName}`}
                className="h-12 w-12 rounded-full object-cover"
                style={{ border: "2px solid var(--primary)" }}
              />
            ) : (
              <div
                className="flex h-12 w-12 items-center justify-center rounded-full text-lg font-bold"
                style={{ background: "var(--primary-dim)", color: "var(--primary)" }}
              >
                {pitch.creator.firstName[0]}
                {pitch.creator.lastName[0]}
              </div>
            )}
            <div>
              <p className="font-semibold" style={{ color: "var(--foreground)" }}>
                {pitch.creator.firstName} {pitch.creator.lastName}
              </p>
              <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
                Créateur du projet
              </p>
            </div>
          </div>

          {pitch.teamDescription ? (
            <p
              className="whitespace-pre-wrap text-sm leading-relaxed"
              style={{ color: "var(--foreground)" }}
            >
              {pitch.teamDescription}
            </p>
          ) : (
            <p className="text-sm" style={{ color: "var(--foreground-muted)" }}>
              Aucune description d&apos;équipe.
            </p>
          )}
        </div>
      )}

      {canSponsor && (
        <SponsorshipModal
          pitchId={pitch.id}
          pitchTitle={pitch.title}
          open={sponsorOpen}
          onClose={() => setSponsorOpen(false)}
        />
      )}
    </div>
  );
}
