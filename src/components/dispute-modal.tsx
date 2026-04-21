"use client";

import { useState } from "react";

interface Props {
  campaignId: string;
  onSuccess: () => void;
  onClose: () => void;
}

export function DisputeModal({ campaignId, onSuccess, onClose }: Props) {
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleSubmit = async () => {
    if (reason.trim().length < 10) {
      setError("Veuillez décrire votre problème en au moins 10 caractères");
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
      <div className="glass w-full max-w-md rounded-2xl p-6 space-y-4">
        <h2 className="text-lg font-bold text-[#E2E8F0]">Ouvrir un dispute</h2>
        <p className="text-sm text-[#64748B]">
          Décrivez le problème rencontré. L&apos;équipe UGC26 interviendra sous 48h.
        </p>

        <div className="space-y-1">
          <label className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
            Raison du dispute <span className="text-[#F43F5E]">*</span>
          </label>
          <textarea
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={5}
            placeholder="Expliquez votre problème en détail..."
            className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:border-violet-500/40 focus:outline-none"
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
            className="rounded-xl bg-[#F43F5E] px-4 py-2 text-sm font-semibold text-white hover:bg-[#E11D48] disabled:opacity-50"
          >
            {loading ? "Envoi..." : "Soumettre"}
          </button>
        </div>
      </div>
    </div>
  );
}
