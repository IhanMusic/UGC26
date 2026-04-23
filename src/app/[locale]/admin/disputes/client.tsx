"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";

export function DisputeActions({ disputeId }: { disputeId: string }) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [resolution, setResolution] = useState("");

  async function handle(action: "resolve" | "dismiss") {
    setLoading(true);
    try {
      await fetch(`/api/admin/disputes/${disputeId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action, resolution: resolution.trim() || undefined }),
      });
      router.refresh();
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex flex-col gap-2">
      <input
        value={resolution}
        onChange={(e) => setResolution(e.target.value)}
        placeholder="Resolution note…"
        className="h-8 rounded-lg border border-[var(--border)] px-2 text-xs"
      />
      <div className="flex gap-1">
        <Button type="button" size="sm" onClick={() => handle("resolve")} disabled={loading}>
          {loading ? "…" : "Resolve"}
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={() => handle("dismiss")} disabled={loading}>
          {loading ? "…" : "Dismiss"}
        </Button>
      </div>
    </div>
  );
}
