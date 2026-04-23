"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/utils";

const STATUS_COLORS: Record<string, string> = {
  PENDING: "bg-amber-500/20 text-amber-300",
  SUBMITTED: "bg-blue-500/20 text-blue-300",
  APPROVED: "bg-emerald-500/20 text-emerald-300",
  REJECTED: "bg-red-500/20 text-red-300",
};

interface Props {
  campaignId: string;
}

export function InfluencerDeliverablesTab({ campaignId }: Props) {
  const t = useTranslations("deliverables");

  const [deliverables, setDeliverables] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [links, setLinks] = useState<Record<string, string>>({}); // deliverable.id -> link input value
  const [submitting, setSubmitting] = useState<string | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const fetchDeliverables = async () => {
    try {
      const res = await fetch(`/api/influencer/campaigns/${campaignId}/deliverables`);
      if (res.ok) {
        const data = await res.json();
        setDeliverables(data);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void fetchDeliverables();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [campaignId]);

  const handleSubmit = async (deliverableId: string) => {
    const link = links[deliverableId]?.trim();
    if (!link) {
      setErrors((e) => ({ ...e, [deliverableId]: t("submitError") }));
      return;
    }
    setSubmitting(deliverableId);
    setErrors((e) => ({ ...e, [deliverableId]: "" }));
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", fileUrl: link }),
      });
      if (!res.ok) throw new Error("Erreur");
      setLinks((l) => ({ ...l, [deliverableId]: "" }));
      void fetchDeliverables();
    } catch {
      setErrors((e) => ({ ...e, [deliverableId]: t("submitError") }));
    } finally {
      setSubmitting(null);
    }
  };

  if (loading) return <div className="text-[#64748B] p-6">{t("loading")}</div>;

  const approved = deliverables.filter((d) => d.status === "APPROVED").length;
  const total = deliverables.length;

  return (
    <div className="space-y-6">
      {/* Progress bar */}
      {total > 0 && (
        <div className="glass rounded-xl p-4 space-y-2">
          <div className="flex justify-between text-sm">
            <span className="text-[#94A3B8]">{t("progressLabel")}</span>
            <span className="font-medium text-[#E2E8F0]">{t("approvedCount", { approved, total })}</span>
          </div>
          <div className="h-2 rounded-full bg-[var(--surface-mid)]">
            <div
              className="h-full rounded-full bg-gradient-to-r from-[var(--primary)] to-[var(--accent)] transition-all"
              style={{ width: total > 0 ? `${(approved / total) * 100}%` : "0%" }}
            />
          </div>
        </div>
      )}

      {/* Deliverable cards */}
      {deliverables.length === 0 ? (
        <div className="glass rounded-xl p-8 text-center text-[#64748B]">
          {t("noneAssigned")}
        </div>
      ) : (
        <div className="space-y-4">
          {deliverables.map((d) => (
            <div
              key={d.id}
              className={cn(
                "glass rounded-xl p-4 space-y-3",
                d.status === "APPROVED" && "border-emerald-500/30",
                d.status === "REJECTED" && "border-red-500/30"
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="space-y-1">
                  <p className="font-medium text-[#E2E8F0]">{t(`types.${d.type}`)}</p>
                  <p className="text-sm text-[#94A3B8]">{d.description}</p>
                </div>
                <span className={cn("shrink-0 rounded-full px-3 py-1 text-xs font-medium", STATUS_COLORS[d.status] ?? "bg-white/10 text-white/60")}>
                  {d.status === "PENDING" ? t("statusPending") :
                   d.status === "SUBMITTED" ? t("statusSubmitted") :
                   d.status === "APPROVED" ? t("statusApproved") : t("statusRejected")}
                </span>
              </div>

              {/* Rejection feedback */}
              {d.status === "REJECTED" && d.feedback && (
                <div className="rounded-lg border border-red-500/20 bg-red-500/10 px-3 py-2 space-y-1">
                  <p className="text-xs font-semibold text-red-400">{t("feedbackLabel")}</p>
                  <p className="text-sm text-red-300">{d.feedback}</p>
                </div>
              )}

              {/* Submit / resubmit form (PENDING or REJECTED) */}
              {(d.status === "PENDING" || d.status === "REJECTED") && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
                    {d.status === "REJECTED" ? t("newPublicationLinkLabel") : t("publicationLinkLabel")}
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      placeholder={t("linkPlaceholder")}
                      value={links[d.id] ?? ""}
                      onChange={(e) => setLinks((l) => ({ ...l, [d.id]: e.target.value }))}
                      className="flex-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
                    />
                    <button
                      onClick={() => void handleSubmit(d.id)}
                      disabled={submitting === d.id}
                      className="rounded-xl bg-[var(--primary)] px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
                    >
                      {submitting === d.id ? t("submitting") : t("submitButton")}
                    </button>
                  </div>
                  {errors[d.id] && <p className="text-xs text-[#F43F5E]">{errors[d.id]}</p>}
                </div>
              )}

              {/* Submitted state — locked */}
              {d.status === "SUBMITTED" && d.fileUrl && (
                <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-[var(--primary)] hover:underline">
                  {t("viewSubmission")}
                </a>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
