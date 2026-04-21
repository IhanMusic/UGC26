"use client";

import { useState } from "react";

interface Props {
  reviewedId: string;
  reviewedName: string;
  campaignId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function ReviewModal({ reviewedId, reviewedName, campaignId, onSuccess, onClose }: Props) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!rating) {
      setError("Veuillez sélectionner une note");
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
        throw new Error(data.error || "Erreur");
      }
      onSuccess();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6 space-y-5">
        <div>
          <h2 className="text-lg font-bold text-[#E2E8F0]">Laisser un avis</h2>
          <p className="text-sm text-[#64748B]">Votre expérience avec {reviewedName}</p>
        </div>

        {/* Star rating */}
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
            Note <span className="text-[#F43F5E]">*</span>
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
                <span className={(hovered || rating) >= star ? "text-[#FBBF24]" : "text-white/20"}>
                  ★
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* Comment */}
        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
            Commentaire <span className="text-[#94A3B8]">(optionnel)</span>
          </p>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            rows={3}
            placeholder="Partagez votre expérience..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:border-violet-500/40 focus:outline-none"
          />
        </div>

        {error && <p className="text-xs text-[#F43F5E]">{error}</p>}

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-[#94A3B8] hover:bg-white/[0.05]"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !rating}
            className="rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
          >
            {loading ? "Publication..." : "Publier l'avis ✓"}
          </button>
        </div>
      </div>
    </div>
  );
}
