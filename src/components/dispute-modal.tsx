"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  campaignId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function DisputeModal({ campaignId, onSuccess, onClose }: Props) {
  const t = useTranslations("disputes");
  const tc = useTranslations("common");
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError(t("minLength"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/disputes", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, reason }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("successMessage"));
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("successMessage"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#E2E8F0]">{t("modalTitle")}</h2>
        <p className="text-sm text-[#64748B]">
          {t("modalDesc")}
        </p>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
            {t("reasonLabel")} <span className="text-[#F43F5E]">{t("required")}</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder={t("reasonPlaceholder")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
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
            className="rounded-xl bg-[#F43F5E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E11D48] disabled:opacity-50"
          >
            {loading ? t("submitting") : t("openButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
