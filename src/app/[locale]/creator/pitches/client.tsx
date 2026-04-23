"use client";

import { Link } from "@/i18n/navigation";
import { PitchCard } from "@/components/pitch-card";

type Sponsorship = {
  amountDZD: number;
};

type PitchCategoryJoin = {
  category: { id: string; name: string };
};

type Pitch = {
  id: string;
  title: string;
  type: string;
  status: string;
  completenessScore: number;
  budgetTarget: number;
  maxSponsors: number;
  bonusSponsorSlots: number;
  secretToken: string;
  createdAt: Date | string;
  sponsorships: Sponsorship[];
  categories: PitchCategoryJoin[];
};

interface CreatorPitchesClientProps {
  pitches: Pitch[];
}

export default function CreatorPitchesClient({ pitches }: CreatorPitchesClientProps) {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold font-display gradient-text">Mes Projets</h2>
          <p className="text-sm mt-1" style={{ color: "var(--foreground-muted)" }}>
            {pitches.length} projet{pitches.length !== 1 ? "s" : ""}
          </p>
        </div>
        <Link
          href="/creator/pitches/new"
          className="btn-neon inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
        >
          + Nouveau projet
        </Link>
      </div>

      {pitches.length === 0 && (
        <div
          className="flex flex-col items-center justify-center rounded-2xl py-20 text-center"
          style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
        >
          <div
            className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl text-3xl"
            style={{
              background: "var(--secondary-dim)",
              border: "1px solid var(--border)",
            }}
          >
            🎬
          </div>
          <h3 className="text-lg font-semibold" style={{ color: "var(--foreground)" }}>
            Aucun projet pour l'instant
          </h3>
          <p className="mt-2 max-w-sm text-sm" style={{ color: "var(--foreground-muted)" }}>
            Créez votre premier pitch pour présenter votre projet créatif aux sponsors.
          </p>
          <div className="mt-6">
            <Link
              href="/creator/pitches/new"
              className="btn-neon inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold"
            >
              Créer un projet
            </Link>
          </div>
        </div>
      )}

      {pitches.length > 0 && (
        <div className="grid gap-4 sm:grid-cols-1 lg:grid-cols-2">
          {pitches.map((pitch) => {
            const totalCommitted = pitch.sponsorships.reduce((sum, s) => sum + s.amountDZD, 0);
            return (
              <PitchCard
                key={pitch.id}
                id={pitch.id}
                title={pitch.title}
                type={pitch.type as any}
                status={pitch.status as any}
                completenessScore={pitch.completenessScore}
                budgetTarget={pitch.budgetTarget}
                totalCommitted={totalCommitted}
                sponsorCount={pitch.sponsorships.length}
                maxSponsors={pitch.maxSponsors}
                bonusSponsorSlots={pitch.bonusSponsorSlots}
                createdAt={pitch.createdAt}
                secretToken={pitch.secretToken}
              />
            );
          })}
        </div>
      )}
    </div>
  );
}
