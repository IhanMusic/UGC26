"use client";

import { useState, useEffect, useCallback } from "react";
import { cn } from "@/components/ui/utils";
import { DeliverableRejectModal } from "./deliverable-reject-modal";

const DELIVERABLE_TYPES = [
  { value: "INSTAGRAM_POST", label: "Instagram Post" },
  { value: "STORY", label: "Story" },
  { value: "REEL", label: "Reel" },
  { value: "VIDEO", label: "Vidéo" },
  { value: "TIKTOK", label: "TikTok" },
  { value: "YOUTUBE", label: "YouTube" },
  { value: "OTHER", label: "Autre" },
];

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-300",
  SUBMITTED: "bg-blue-500/20 text-blue-300",
  APPROVED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-red-500/20 text-red-300",
};

type InfluencerInfo = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string | null;
};

type Participation = {
  id: string;
  status: string;
  influencer: InfluencerInfo;
};

type DeliverableItem = {
  id: string;
  type: string;
  description?: string | null;
  fileUrl?: string | null;
  status: string;
  feedback?: string | null;
  influencerId: string;
  influencer?: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
};

interface Props {
  campaignId: string;
  participations: Participation[];
}

export function CompanyDeliverablesTab({ campaignId, participations }: Props) {
  const [deliverables, setDeliverables] = useState<DeliverableItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState("INSTAGRAM_POST");
  const [description, setDescription] = useState("");
  const [influencerId, setInfluencerId] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [rejectingId, setRejectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fetchDeliverables = useCallback(async () => {
    try {
      const res = await fetch(`/api/company/campaigns/${campaignId}/deliverables`);
      if (res.ok) setDeliverables(await res.json());
    } finally {
      setLoading(false);
    }
  }, [campaignId]);

  useEffect(() => {
    fetchDeliverables();
  }, [fetchDeliverables]);

  const handleCreate = async () => {
    if (!description.trim()) {
      setError("La description est obligatoire");
      return;
    }
    setSubmitting(true);
    setError(null);
    try {
      const res = await fetch(`/api/company/campaigns/${campaignId}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          type,
          description,
          influencerId: influencerId || undefined,
        }),
      });
      if (!res.ok) throw new Error("Erreur");
      setDescription("");
      setInfluencerId("");
      fetchDeliverables();
    } catch {
      setError("Erreur lors de la création");
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/deliverables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    fetchDeliverables();
  };

  if (loading) return <div className="text-[#64748B] p-6">Chargement...</div>;

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-[#E2E8F0]">Nouveau livrable</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
              Type
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] focus:border-violet-500/40 focus:outline-none"
            >
              {DELIVERABLE_TYPES.map((t) => (
                <option key={t.value} value={t.value} className="bg-[#0D0F1C]">
                  {t.label}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
              Assigner à
            </label>
            <select
              value={influencerId}
              onChange={(e) => setInfluencerId(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] focus:border-violet-500/40 focus:outline-none"
            >
              <option value="" className="bg-[#0D0F1C]">
                Tous les influenceurs
              </option>
              {participations.map((p) => (
                <option key={p.influencer.id} value={p.influencer.id} className="bg-[#0D0F1C]">
                  {p.influencer.firstName} {p.influencer.lastName}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
            Brief / Description
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder="Décrivez le contenu attendu..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:border-violet-500/40 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-[#F43F5E]">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? "Création..." : "Créer le livrable"}
        </button>
      </div>

      {/* List */}
      {deliverables.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center text-[#64748B]">
          Aucun livrable créé.
        </div>
      ) : (
        <div className="space-y-3">
          {deliverables.map((d) => (
            <div key={d.id} className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-[#E2E8F0]">
                    {DELIVERABLE_TYPES.find((t) => t.value === d.type)?.label ?? d.type}
                  </p>
                  <p className="text-sm text-[#94A3B8]">{d.description}</p>
                  {d.influencer && (
                    <p className="text-xs text-[#64748B]">
                      {d.influencer.firstName} {d.influencer.lastName}
                    </p>
                  )}
                </div>
                <span
                  className={cn(
                    "shrink-0 rounded-full px-3 py-1 text-xs font-medium",
                    STATUS_COLORS[d.status] ?? "bg-white/10 text-white/60",
                  )}
                >
                  {d.status}
                </span>
              </div>

              {d.fileUrl && (
                <a
                  href={d.fileUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-xs text-violet-400 hover:underline"
                >
                  Voir le lien de publication →
                </a>
              )}

              {d.status === "SUBMITTED" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(d.id)}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30"
                  >
                    ✓ Approuver
                  </button>
                  <button
                    onClick={() => setRejectingId(d.id)}
                    className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/30"
                  >
                    ✗ Rejeter
                  </button>
                </div>
              )}

              {d.status === "REJECTED" && d.feedback && (
                <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-300">
                  Feedback : {d.feedback}
                </p>
              )}
            </div>
          ))}
        </div>
      )}

      {rejectingId && (
        <DeliverableRejectModal
          deliverableId={rejectingId}
          onSuccess={() => {
            setRejectingId(null);
            fetchDeliverables();
          }}
          onClose={() => setRejectingId(null)}
        />
      )}
    </div>
  );
}
