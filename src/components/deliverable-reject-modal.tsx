"use client";

import { useState } from "react";

const REJECT_REASONS = [
  "Mauvaise qualité visuelle",
  "Ne respecte pas le brief",
  "Lien invalide",
  "Autre",
];

interface Props {
  deliverableId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function DeliverableRejectModal({ deliverableId, onSuccess, onClose }: Props) {
  const [reason, setReason] = useState(REJECT_REASONS[0]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (!feedback.trim()) {
      setError("Le message de débrief est obligatoire");
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
      setError("Erreur lors du rejet");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#E2E8F0]">Rejeter le livrable</h2>

        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">Raison</p>
          {REJECT_REASONS.map((r) => (
            <label key={r} className="flex items-center gap-2 cursor-pointer">
              <input
                type="radio"
                name="reason"
                value={r}
                checked={reason === r}
                onChange={() => setReason(r)}
                className="accent-violet-500"
              />
              <span className="text-sm text-[#E2E8F0]">{r}</span>
            </label>
          ))}
        </div>

        <div className="space-y-1">
          <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
            Message de débrief <span className="text-[#F43F5E]">*</span>
          </p>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={4}
            placeholder="Expliquez les modifications nécessaires..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:border-violet-500/40 focus:outline-none focus:ring-1 focus:ring-violet-500/20"
          />
          {error && <p className="text-xs text-[#F43F5E]">{error}</p>}
        </div>

        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-lg border border-white/[0.08] px-4 py-2 text-sm text-[#94A3B8] hover:bg-white/[0.05]"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading}
            className="rounded-lg bg-[#F43F5E] px-4 py-2 text-sm font-medium text-white hover:bg-[#E11D48] disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Confirmer le rejet"}
          </button>
        </div>
      </div>
    </div>
  );
}
