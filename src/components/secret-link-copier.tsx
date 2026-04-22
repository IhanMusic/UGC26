"use client";

import { useState } from "react";

interface SecretLinkCopierProps {
  pitchId: string;
  secretToken: string;
}

export function SecretLinkCopier({ pitchId, secretToken: initialToken }: SecretLinkCopierProps) {
  const [token, setToken] = useState(initialToken);
  const [copied, setCopied] = useState(false);
  const [regenerating, setRegenerating] = useState(false);

  const url = `adwaa.dz/p/${token}`;
  const fullUrl = `https://adwaa.dz/p/${token}`;

  async function handleCopy() {
    await navigator.clipboard.writeText(fullUrl);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  async function handleRegenerate() {
    const confirmed = window.confirm(
      "Régénérer le lien secret ? L'ancien lien ne fonctionnera plus."
    );
    if (!confirmed) return;

    setRegenerating(true);
    try {
      const res = await fetch(`/api/pitches/${pitchId}/secret-token`, { method: "POST" });
      if (res.ok) {
        const data = await res.json();
        setToken(data.secretToken);
      }
    } finally {
      setRegenerating(false);
    }
  }

  return (
    <div
      className="rounded-xl p-4 space-y-3"
      style={{ background: "var(--surface)", border: "1px solid var(--border)" }}
    >
      <span
        className="text-xs font-semibold uppercase tracking-wider"
        style={{ color: "var(--foreground-muted)" }}
      >
        Lien de présentation privé
      </span>

      <div
        className="flex items-center gap-2 rounded-lg px-3 py-2 font-mono text-xs"
        style={{
          background: "var(--surface-mid)",
          border: "1px solid var(--border)",
          color: "var(--primary)",
        }}
      >
        <svg
          className="h-3.5 w-3.5 flex-shrink-0"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
          strokeWidth={2}
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1"
          />
        </svg>
        <span className="truncate">{url}</span>
      </div>

      <div className="flex gap-2">
        <button
          onClick={handleCopy}
          className="flex flex-1 items-center justify-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all"
          style={
            copied
              ? {
                  borderColor: "var(--accent)",
                  color: "var(--accent)",
                  background: "var(--accent-dim)",
                }
              : {
                  borderColor: "var(--border-hover)",
                  color: "var(--primary)",
                  background: "var(--primary-dim)",
                }
          }
        >
          {copied ? (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
              Copié !
            </>
          ) : (
            <>
              <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
              </svg>
              Copier le lien
            </>
          )}
        </button>

        <button
          onClick={handleRegenerate}
          disabled={regenerating}
          className="flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-medium transition-all disabled:opacity-50"
          style={{
            borderColor: "rgba(255,59,92,0.3)",
            color: "var(--danger)",
            background: "rgba(255,59,92,0.08)",
          }}
        >
          {regenerating ? (
            <svg className="h-3.5 w-3.5 animate-spin" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
            </svg>
          ) : (
            <svg className="h-3.5 w-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
            </svg>
          )}
          Régénérer
        </button>
      </div>
    </div>
  );
}
