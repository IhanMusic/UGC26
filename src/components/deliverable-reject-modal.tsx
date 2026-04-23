"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  deliverableId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function DeliverableRejectModal({ deliverableId, onSuccess, onClose }: Props) {
  const t = useTranslations("deliverables");
  const tc = useTranslations("common");

  const REJECT_REASONS = [
    t("reasons.badQuality"),
    t("reasons.doesntMatchBrief"),
    t("reasons.invalidLink"),
    t("reasons.other"),
  ];

  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError(t("debriefMissing"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/deliverables/${deliverableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", feedback: `${reason}: ${feedback}` }),
      });
      if (!res.ok) throw new Error("Erreur");
      onSuccess();
    } catch {
      setError(t("rejectError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#E2E8F0]">{t("rejectTitle")}</h2>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">{t("reasonLabel")}</p>
          {REJECT_REASONS.map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-[var(--primary)]"
              />
              <span className="text-sm text-[#E2E8F0]">{r}</span>
            </label>
          ))}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
            {t("debriefLabel")} <span className="text-[#F43F5E]">*</span>
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder={t("debriefPlaceholder")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none focus:ring-1 focus:ring-[var(--primary)]"
          />
          {error && <p className="text-xs text-[#F43F5E]">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
          >
            {tc("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-[#F43F5E] px-4 py-2 text-sm font-medium text-white hover:bg-[#E11D48] disabled:opacity-50"
          >
            {loading ? t("rejecting") : t("confirmReject")}
          </button>
        </div>
      </div>
    </div>
  );
}
