"use client";

import { useState } from "react";
import { cn } from "@/components/ui/utils";

interface CompletenessScoreProps {
  score: number;
  missing?: string[];
  className?: string;
}

export function CompletenessScore({ score, missing = [], className }: CompletenessScoreProps) {
  const [open, setOpen] = useState(false);

  const color =
    score >= 80
      ? "var(--accent)"
      : score >= 50
      ? "var(--gold)"
      : "var(--danger)";

  const label = score >= 80 ? "Complet" : score >= 50 ? "En cours" : "Incomplet";

  return (
    <div className={cn("space-y-2", className)}>
      <div className="flex items-center justify-between text-xs">
        <span className="font-medium" style={{ color: "var(--foreground-muted)" }}>
          Complétude du projet
        </span>
        <div className="flex items-center gap-2">
          <span className="font-mono font-bold" style={{ color }}>
            {score}%
          </span>
          <span
            className="rounded-full px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wider"
            style={{
              color,
              background: `color-mix(in srgb, ${color} 12%, transparent)`,
              border: `1px solid color-mix(in srgb, ${color} 30%, transparent)`,
            }}
          >
            {label}
          </span>
        </div>
      </div>

      <div
        className="relative h-1.5 w-full overflow-hidden rounded-full"
        style={{ background: "var(--surface-mid)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${score}%`,
            background: `linear-gradient(90deg, ${color}, color-mix(in srgb, ${color} 70%, white))`,
            boxShadow: `0 0 8px color-mix(in srgb, ${color} 40%, transparent)`,
          }}
        />
      </div>

      {missing.length > 0 && (
        <div>
          <button
            onClick={() => setOpen((v) => !v)}
            className="flex items-center gap-1.5 text-[11px] transition-colors"
            style={{ color: "var(--foreground-muted)" }}
          >
            <svg
              className={cn("h-3 w-3 transition-transform", open && "rotate-90")}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth={2.5}
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
            </svg>
            {open ? "Masquer" : `Voir les ${missing.length} éléments manquants`}
          </button>

          {open && (
            <ul className="mt-2 space-y-1">
              {missing.map((item) => (
                <li
                  key={item}
                  className="flex items-center gap-2 text-[11px]"
                  style={{ color: "var(--foreground-muted)" }}
                >
                  <span
                    className="h-1 w-1 rounded-full flex-shrink-0"
                    style={{ background: "var(--danger)" }}
                  />
                  {item}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
