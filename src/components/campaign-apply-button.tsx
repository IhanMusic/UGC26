"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";

export function CampaignApplyButton({
  campaignId,
  disabled,
}: {
  campaignId: string;
  disabled?: boolean;
}) {
  const [loading, setLoading] = useState(false);

  return (
    <Button
      className="w-full"
      disabled={disabled || loading}
      onClick={async () => {
        setLoading(true);
        const res = await fetch("/api/influencer/apply", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ campaignId }),
        }).catch(() => null);
        setLoading(false);

        if (!res || !res.ok) {
          alert("Could not apply. Make sure you are logged in as an influencer.");
          return;
        }

        window.location.reload();
      }}
    >
      {loading ? "Applying…" : "Apply to this campaign"}
    </Button>
  );
}
