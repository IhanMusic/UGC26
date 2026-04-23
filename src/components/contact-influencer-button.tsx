"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export function ContactInfluencerButton({ influencerId }: { influencerId: string }) {
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleClick = async () => {
    setLoading(true);
    const res = await fetch("/api/conversations", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ recipientId: influencerId }),
    });
    const data = await res.json();
    if (data.conversationId) {
      router.push(`/company/messages?conversationId=${data.conversationId}`);
    }
    setLoading(false);
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="rounded-xl bg-[var(--primary)] px-5 py-2.5 text-sm font-medium text-white hover:bg-[var(--surface-mid)] disabled:opacity-50 transition-colors"
    >
      {loading ? "..." : "Contacter"}
    </button>
  );
}
