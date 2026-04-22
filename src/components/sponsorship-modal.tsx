"use client";

import { useState } from "react";
import { cn } from "@/components/ui/utils";
import { useRouter } from "@/i18n/navigation";

const SUGGESTED_AMOUNTS = [10_000, 50_000, 100_000, 250_000];

interface SponsorshipModalProps {
  pitchId: string;
  pitchTitle: string;
  open: boolean;
  onClose: () => void;
}

export function SponsorshipModal({ pitchId, pitchTitle, open, onClose }: SponsorshipModalProps) {
  const router = useRouter();
  const [amount, setAmount] = useState<number>(50_000);
  const [customAmount, setCustomAmount] = useState("");
  const [useCustom, setUseCustom] = useState(false);
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const effectiveAmount = useCustom ? (parseInt(customAmount, 10) || 0) : amount;
  const fee = Math.round(effectiveAmount * 0.05);
  const total = effectiveAmount + fee;

  async function handleSubmit() {
    if (effectiveAmount <= 0) {
      setError("Veuillez saisir un montant valide.");
      return;
    }
    setLoading(true);
    setError(null);
    try {
      const res = await fetch(`/api/pitches/${pitchId}/sponsor`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amountDZD: effectiveAmount, brandMessage: message || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        setError((data as { error?: string }).error ?? "Erreur lors du sponsoring.");
        return;
      }
      router.refresh();
      onClose();
    } catch {
      setError("Erreur réseau. Réessayez.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center"
      style={{ background: "rgba(0,0,0,0.8)" }}
      onClick={onClose}
    >
      <div
        className="glass w-full max-w-md rounded-2xl p-6 space-y-5"
        style={{ border: "1px solid var(--border-hover)" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div>
          <h2 className="text-lg font-bold gradient-text">Sponsoriser ce projet</h2>
          <p className="text-sm mt-0.5 line-clamp-1" style={{ color: "var(--foreground-muted)" }}>
            {pitchTitle}
          </p>
        </div>

        {/* Amount presets */}
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
            Montant de sponsoring
          </p>
          <div className="grid grid-cols-2 gap-2">
            {SUGGESTED_AMOUNTS.map((a) => (
              <button
                key={a}
                type="button"
                onClick={() => { setAmount(a); setUseCustom(false); }}
                className={cn(
                  "rounded-xl px-3 py-2 text-sm font-mono font-semibold transition-all",
                  !useCustom && amount === a ? "" : "opacity-60 hover:opacity-90"
                )}
                style={
                  !useCustom && amount === a
                    ? { background: "var(--primary-dim)", color: "var(--primary)", border: "1px solid var(--primary)" }
                    : { background: "var(--surface-mid)", color: "var(--foreground)", border: "1px solid var(--border)" }
                }
              >
                {a.toLocaleString("fr-DZ")} DZD
              </button>
            ))}
          </div>

          <div className="mt-3">
            <button
              type="button"
              onClick={() => setUseCustom((v) => !v)}
              className="text-xs font-medium transition-colors hover:underline"
              style={{ color: useCustom ? "var(--primary)" : "var(--foreground-muted)" }}
            >
              {useCustom ? "▾" : "▸"} Montant personnalisé
            </button>
            {useCustom && (
              <div className="mt-2 flex items-center gap-2">
                <input
                  type="number"
                  min={1000}
                  step={1000}
                  value={customAmount}
                  onChange={(e) => setCustomAmount(e.target.value)}
                  placeholder="Ex: 75000"
                  className="input-cyber flex-1"
                />
                <span className="text-sm font-mono" style={{ color: "var(--foreground-muted)" }}>DZD</span>
              </div>
            )}
          </div>
        </div>

        {/* Fee breakdown */}
        {effectiveAmount > 0 && (
          <div
            className="rounded-xl p-4 space-y-2 text-sm"
            style={{ background: "var(--surface-mid)", border: "1px solid var(--border)" }}
          >
            <div className="flex justify-between">
              <span style={{ color: "var(--foreground-muted)" }}>Sponsoring</span>
              <span className="font-mono" style={{ color: "var(--foreground)" }}>
                {effectiveAmount.toLocaleString("fr-DZ")} DZD
              </span>
            </div>
            <div className="flex justify-between">
              <span style={{ color: "var(--foreground-muted)" }}>Frais plateforme (5%)</span>
              <span className="font-mono" style={{ color: "var(--foreground-muted)" }}>
                {fee.toLocaleString("fr-DZ")} DZD
              </span>
            </div>
            <div
              className="flex justify-between border-t pt-2 font-bold"
              style={{ borderColor: "var(--border)" }}
            >
              <span style={{ color: "var(--foreground)" }}>Total</span>
              <span className="font-mono" style={{ color: "var(--gold)" }}>
                {total.toLocaleString("fr-DZ")} DZD
              </span>
            </div>
          </div>
        )}

        {/* Message */}
        <div>
          <label className="mb-1 block text-xs font-semibold uppercase tracking-wider" style={{ color: "var(--foreground-muted)" }}>
            Message au créateur (optionnel)
          </label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={2}
            placeholder="Pourquoi ce projet vous intéresse..."
            className="input-cyber w-full resize-none"
          />
        </div>

        {error && (
          <p className="rounded-lg p-3 text-sm" style={{ background: "var(--danger-dim)", color: "var(--danger)" }}>
            {error}
          </p>
        )}

        <div className="flex gap-3">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 rounded-xl py-2.5 text-sm font-medium transition-opacity hover:opacity-70"
            style={{ background: "var(--surface-mid)", color: "var(--foreground)", border: "1px solid var(--border)" }}
          >
            Annuler
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={loading || effectiveAmount <= 0}
            className="btn-neon flex-1 disabled:opacity-40"
          >
            {loading ? "Envoi…" : "Confirmer"}
          </button>
        </div>
      </div>
    </div>
  );
}
