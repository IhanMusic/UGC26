"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/utils";
import { DeliverableRejectModal } from "./deliverable-reject-modal";

const DELIVERABLE_TYPE_VALUES = [
  "INSTAGRAM_POST",
  "STORY",
  "REEL",
  "VIDEO",
  "TIKTOK",
  "YOUTUBE",
  "OTHER",
] as const;

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
  const t = useTranslations("deliverables");

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
      setError(t("createError"));
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
      setError(t("createError"));
    } finally {
      setSubmitting(false);
    }
  };

  const handleApprove = async (id: string) => {
    try {
      const res = await fetch(`/api/deliverables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "approve" }),
      });
      if (!res.ok) throw new Error("Erreur");
      fetchDeliverables();
    } catch {
      setError(t("approveError"));
    }
  };

  if (loading) return <div className="text-[#64748B] p-6">{t("loading")}</div>;

  return (
    <div className="space-y-6">
      {/* Create form */}
      <div className="glass rounded-xl p-6 space-y-4">
        <h3 className="font-semibold text-[#E2E8F0]">{t("newDeliverable")}</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
              {t("typeLabel")}
            </label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] focus:border-violet-500/40 focus:outline-none"
            >
              {DELIVERABLE_TYPE_VALUES.map((value) => (
                <option key={value} value={value} className="bg-[#0D0F1C]">
                  {t(`types.${value}`)}
                </option>
              ))}
            </select>
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
              {t("assignToLabel")}
            </label>
            <select
              value={influencerId}
              onChange={(e) => setInfluencerId(e.target.value)}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] focus:border-violet-500/40 focus:outline-none"
            >
              <option value="" className="bg-[#0D0F1C]">
                {t("allInfluencers")}
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
            {t("briefLabel")}
          </label>
          <textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            rows={3}
            placeholder={t("briefPlaceholder")}
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:border-violet-500/40 focus:outline-none"
          />
        </div>
        {error && <p className="text-xs text-[#F43F5E]">{error}</p>}
        <button
          onClick={handleCreate}
          disabled={submitting}
          className="rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
        >
          {submitting ? t("creating") : t("createButton")}
        </button>
      </div>

      {/* List */}
      {deliverables.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center text-[#64748B]">
          {t("noneCreated")}
        </div>
      ) : (
        <div className="space-y-3">
          {deliverables.map((d) => (
            <div key={d.id} className="glass rounded-xl p-4 space-y-3">
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-[#E2E8F0]">
                    {t(`types.${d.type}`)}
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
                  {t("viewPublicationLink")}
                </a>
              )}

              {d.status === "SUBMITTED" && (
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(d.id)}
                    className="rounded-lg bg-emerald-500/20 px-3 py-1.5 text-xs font-medium text-emerald-300 hover:bg-emerald-500/30"
                  >
                    {t("approve")}
                  </button>
                  <button
                    onClick={() => setRejectingId(d.id)}
                    className="rounded-lg bg-red-500/20 px-3 py-1.5 text-xs font-medium text-red-300 hover:bg-red-500/30"
                  >
                    {t("reject")}
                  </button>
                </div>
              )}

              {d.status === "REJECTED" && d.feedback && (
                <p className="rounded-lg bg-red-500/10 border border-red-500/20 px-3 py-2 text-xs text-red-300">
                  {t("feedbackLabel")} {d.feedback}
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
