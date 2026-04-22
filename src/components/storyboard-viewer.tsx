"use client";

import { useState } from "react";

interface StoryboardViewerProps {
  urls: string[];
}

export function StoryboardViewer({ urls }: StoryboardViewerProps) {
  const [expanded, setExpanded] = useState<string | null>(null);

  if (urls.length === 0) return null;

  const pdfs = urls.filter((u) => u.toLowerCase().endsWith(".pdf"));
  const images = urls.filter((u) => !u.toLowerCase().endsWith(".pdf"));

  return (
    <div className="space-y-3">
      {pdfs.map((url, i) => (
        <div
          key={url}
          className="rounded-xl overflow-hidden"
          style={{ border: "1px solid var(--border)" }}
        >
          <div
            className="flex items-center justify-between px-3 py-2 text-xs"
            style={{ background: "var(--surface-mid)", color: "var(--foreground-muted)" }}
          >
            <span>PDF {i + 1}</span>
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium transition-colors"
              style={{ color: "var(--primary)" }}
            >
              Ouvrir
            </a>
          </div>
          <iframe
            src={url}
            title={`Storyboard PDF ${i + 1}`}
            className="w-full"
            style={{ height: "256px", border: "none" }}
          />
        </div>
      ))}

      {images.length > 0 && (
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
          {images.map((url, i) => (
            <button
              key={url}
              type="button"
              onClick={() => setExpanded(expanded === url ? null : url)}
              className="relative overflow-hidden rounded-xl transition-all"
              style={{
                border: `1px solid ${expanded === url ? "var(--primary)" : "var(--border)"}`,
                boxShadow: expanded === url ? "0 0 12px var(--primary-glow)" : undefined,
              }}
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={url}
                alt={`Storyboard ${i + 1}`}
                className="w-full object-cover"
                style={{ height: "120px" }}
              />
              <div
                className="absolute inset-0 flex items-center justify-center opacity-0 hover:opacity-100 transition-opacity"
                style={{ background: "rgba(0,0,0,0.5)" }}
              >
                <span className="text-xs font-medium" style={{ color: "var(--primary)" }}>
                  {expanded === url ? "Réduire" : "Agrandir"}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}

      {expanded && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          style={{ background: "rgba(0,0,0,0.85)" }}
          onClick={() => setExpanded(null)}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={expanded}
            alt="Storyboard agrandi"
            className="max-h-full max-w-full rounded-xl"
            style={{ border: "1px solid var(--border-hover)" }}
            onClick={(e) => e.stopPropagation()}
          />
          <button
            type="button"
            onClick={() => setExpanded(null)}
            className="absolute right-4 top-4 flex h-8 w-8 items-center justify-center rounded-full"
            style={{ background: "var(--surface-mid)", color: "var(--foreground)" }}
          >
            ×
          </button>
        </div>
      )}
    </div>
  );
}
