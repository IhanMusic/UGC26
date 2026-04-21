"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function VerificationBanner() {
  const { data: session } = useSession();
  const [resending, setResending] = useState(false);
  const [sent, setSent] = useState(false);
  const [error, setError] = useState<string | null>(null);

  if (!session?.user || session.user.isVerified) return null;

  const handleResend = async () => {
    setResending(true);
    setError(null);
    try {
      const res = await fetch("/api/auth/resend-verification", { method: "POST" });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Erreur");
      setSent(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="flex items-center justify-between gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm">
      <span className="text-amber-200">
        Verifiez votre email pour acceder a toutes les fonctionnalites.
      </span>
      {sent ? (
        <span className="text-emerald-400 text-xs">Email envoye</span>
      ) : (
        <button
          onClick={handleResend}
          disabled={resending}
          className="shrink-0 rounded-lg border border-amber-500/30 bg-amber-500/20 px-3 py-1 text-xs font-medium text-amber-200 transition-colors hover:bg-amber-500/30 disabled:opacity-50"
        >
          {resending ? "Envoi..." : "Renvoyer l'email"}
        </button>
      )}
      {error && <span className="text-xs text-[#F43F5E]">{error}</span>}
    </div>
  );
}
