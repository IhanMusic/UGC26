"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";

interface Props {
  reviewedId: string;
  reviewedName: string;
  campaignId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function ReviewModal({ reviewedId, reviewedName, campaignId, onSuccess, onClose }: Props) {
  const t = useTranslations("reviews");
  const tc = useTranslations("common");
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!rating) {
      setError(t("selectRating"));
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewedId, campaignId, rating, comment }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || t("submitError"));
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : t("submitError"));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[var(--foreground)]">{t("leaveReview")}</h2>
          <p className="text-sm text-[var(--foreground-muted)]">{t("yourExperience", { name: reviewedName })}</p>
        </div>

        {/* Star rating */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--foreground-muted)]">
            {t("noteLabel")} <span className="text-[#F43F5E]">{t("required")}</span>
          </p>
          <div className="flex gap-1">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => setRating(star)}
                className="text-3xl transition-transform hover:scale-110"
              >
                <span className={(hovered || rating) >= star ? "text-[var(--gold)]" : "text-[var(--foreground-muted)]"}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[var(--foreground-muted)]">
            {t("commentLabel")} <span className="text-[#94A3B8]">{t("optional")}</span>
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder={t("commentPlaceholder")}
            className="w-full rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus:border-[var(--primary)] focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-[#F43F5E]">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-[var(--border)] px-4 py-2 text-sm text-[var(--foreground-muted)] hover:bg-[var(--surface-hover)]"
          >
            {tc("cancel")}
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="rounded-xl bg-gradient-to-r from-[var(--gold)] to-[var(--gold-light)] px-4 py-2 text-sm font-semibold text-[var(--background)] hover:opacity-90 disabled:opacity-50"
          >
            {loading ? t("publishing") : t("publishButton")}
          </button>
        </div>
      </div>
    </div>
  );
}
