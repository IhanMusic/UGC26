"use client";

import { useState } from "react";
import { PitchLandingPage, type PitchLandingData } from "@/components/pitch-landing-page";
import { useRouter } from "@/i18n/navigation";

type SponsorshipInput = {
  id: string;
  pitchId: string;
  amountDZD: number;
  percentageShare: number;
  isBonus: boolean;
  status: string;
  brandMessage: string | null;
};

type PitchInput = {
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
  pitchDeliverables: {
    id: string;
    description: string;
    type: string;
    minSponsorshipDZD: number | null;
  }[];
  creator: { id: string; firstName: string; lastName: string; imageUrl: string | null };
  sponsorships: { amountDZD: number; brandId: string; status: string }[];
};

const STATUS_LABELS: Record<string, string> = {
  INTERESTED: "Intéressé",
  COMMITTED: "Engagé",
  PAID: "Payé",
  REFUNDED: "Remboursé",
};

export default function SponsorshipDetailClient({
  pitch,
  sponsorship,
}: {
  pitch: PitchInput;
  sponsorship: SponsorshipInput;
}) {
  const router = useRouter();
  const [approving, setApproving] = useState(false);
  const [approveError, setApproveError] = useState<string | null>(null);
  const [approved, setApproved] = useState(sponsorship.brandMessage === "APPROVED");

  const landingData: PitchLandingData = {
    ...pitch,
    sponsorships: pitch.sponsorships.map((s) => ({ amountDZD: s.amountDZD })),
    alreadySponsored: true,
    backHref: "/company/sponsorships",
  };

  async function handleApprove() {
    setApproving(true);
    setApproveError(null);
    try {
      const res = await fetch(`/api/sponsorships/${sponsorship.id}/approve`, {
        method: "PATCH",
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setApproveError((data as { error?: string }).error ?? "Erreur.");
        return;
      }
      setApproved(true);
      router.refresh();
    } catch {
      setApproveError("Erreur réseau. Réessayez.");
    } finally {
      setApproving(false);
    }
  }

  return (
    <div className="space-y-6">
      {/* Sponsorship summary card */}
      <div className="card-cyber p-5 space-y-4">
        <h2 className="text-lg font-bold gradient-text">Votre sponsoring</h2>

        <div className="grid gap-3 sm:grid-cols-3">
          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "var(--surface-mid)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--foreground-muted)" }}>
              Montant engagé
            </p>
            <p className="text-xl font-bold font-mono" style={{ color: "var(--gold)" }}>
              {sponsorship.amountDZD.toLocaleString("fr-DZ")} DZD
            </p>
          </div>

          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "var(--surface-mid)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--foreground-muted)" }}>
              Part %
            </p>
            <p className="text-xl font-bold font-mono" style={{ color: "var(--primary)" }}>
              {sponsorship.percentageShare.toFixed(1)}%
            </p>
          </div>

          <div
            className="rounded-xl p-4 text-center"
            style={{ background: "var(--surface-mid)", border: "1px solid var(--border)" }}
          >
            <p className="text-xs font-semibold uppercase tracking-wider mb-1" style={{ color: "var(--foreground-muted)" }}>
              Statut
            </p>
            <p className="text-base font-semibold" style={{ color: sponsorship.status === "PAID" ? "var(--accent)" : "var(--foreground)" }}>
              {STATUS_LABELS[sponsorship.status] ?? sponsorship.status}
            </p>
            {sponsorship.isBonus && (
              <span className="text-xs" style={{ color: "var(--gold)" }}>Slot bonus</span>
            )}
          </div>
        </div>

        {/* Approve deliverables */}
        {(pitch.status === "IN_PRODUCTION" || pitch.status === "COMPLETED") && (
          <div
            className="rounded-xl p-4 space-y-3"
            style={{
              background: approved ? "var(--accent-dim)" : "var(--surface-mid)",
              border: `1px solid ${approved ? "rgba(0,255,136,0.3)" : "var(--border)"}`,
            }}
          >
            <p className="text-sm font-semibold" style={{ color: "var(--foreground)" }}>
              Approbation des livrables
            </p>
            <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
              Approuvez les livrables pour déclencher le 2ème versement (50%) au créateur.
            </p>

            {approved ? (
              <div className="flex items-center gap-2">
                <span className="text-lg">✅</span>
                <span className="text-sm font-semibold" style={{ color: "var(--accent)" }}>
                  Vous avez approuvé les livrables
                </span>
              </div>
            ) : (
              <>
                {approveError && (
                  <p className="text-xs rounded-lg p-2" style={{ background: "var(--danger-dim)", color: "var(--danger)" }}>
                    {approveError}
                  </p>
                )}
                <button
                  type="button"
                  onClick={handleApprove}
                  disabled={approving}
                  className="btn-neon disabled:opacity-40"
                >
                  {approving ? "Envoi…" : "✓ Approuver les livrables"}
                </button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Full pitch details */}
      <PitchLandingPage pitch={landingData} />
    </div>
  );
}
