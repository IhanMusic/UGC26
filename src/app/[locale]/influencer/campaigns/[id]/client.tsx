"use client";

import { useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import Image from "next/image";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fileToDataUrl } from "@/components/file-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import { InfluencerDeliverablesTab } from "@/components/influencer-deliverables-tab";
import { CampaignChat } from "@/components/campaign-chat";
import { ReviewBanner } from "@/components/review-banner";
import { DisputeModal } from "@/components/dispute-modal";

type CampaignDto = {
  id: string;
  title: string;
  description: string;
  priceDinar: number;
  objectivePlatforms?: string | null;
};

type ParticipationDto = {
  id: string;
  status: "UPCOMING" | "ONGOING" | "COMPLETED" | "CONFIRMED" | "PAID";
};

const TAB_KEYS = ["tabDetails", "tabExecution", "tabDeliverables", "tabMessages"] as const;
type TabKey = (typeof TAB_KEYS)[number];

type ReviewBannerProps = {
  reviewedId: string;
  reviewedName: string;
  hasReviewed: boolean;
};

export default function InfluencerCampaignClient({
  campaignId,
  conversationId,
  reviewBanner,
}: {
  campaignId: string;
  conversationId: string | null;
  reviewBanner: ReviewBannerProps | null;
}) {
  const t = useTranslations("campaignDetail");
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignDto | null>(null);
  const [participation, setParticipation] = useState<ParticipationDto | null>(null);
  const [proof, setProof] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [working, setWorking] = useState(false);
  const [activeTab, setActiveTab] = useState<TabKey>("tabDetails");
  const [showDispute, setShowDispute] = useState(false);
  const [disputeSubmitted, setDisputeSubmitted] = useState(false);

  useEffect(() => {
    fetch(`/api/influencer/campaign/${campaignId}`)
      .then((r) => r.json())
      .then((d) => {
        setCampaign(d.campaign);
        setParticipation(d.participation);
      })
      .finally(() => setLoading(false));
  }, [campaignId]);

  const status = participation?.status;

  const canSchedule = status === "UPCOMING";
  const canStart = status === "UPCOMING";
  const canComplete = status === "ONGOING";

  const statusBadge = useMemo(() => {
    if (!status) return <Badge variant="secondary">N/A</Badge>;
    if (status === "PAID") return <Badge variant="success">PAID</Badge>;
    if (status === "CONFIRMED") return <Badge variant="success">CONFIRMED</Badge>;
    if (status === "COMPLETED") return <Badge variant="warning">COMPLETED</Badge>;
    if (status === "ONGOING") return <Badge variant="warning">ONGOING</Badge>;
    return <Badge variant="secondary">{status}</Badge>;
  }, [status]);

  if (loading) {
    return <div className="text-sm text-[var(--foreground-muted)]">Loading…</div>;
  }
  if (!campaign || !participation) {
    return <div className="text-sm text-[var(--foreground-muted)]">Not available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === key
                ? "bg-[var(--primary-dim)] text-[var(--primary)]"
                : "text-[var(--foreground-muted)] hover:text-[var(--foreground-muted)]"
            )}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {/* tabDetails tab */}
      {activeTab === "tabDetails" && (
        <Card>
          <CardHeader>
            <CardTitle>{campaign.title}</CardTitle>
            <CardDescription>
              {campaign.priceDinar.toLocaleString()} DZD • status {statusBadge}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-[var(--foreground-muted)]">
            <div className="whitespace-pre-wrap">{campaign.description}</div>
            <div>Objective: {campaign.objectivePlatforms ?? "—"}</div>

            {/* Dispute button — visible for ONGOING or COMPLETED participations */}
            {(status === "ONGOING" || status === "COMPLETED") && (
              <div className="pt-2 border-t border-white/[0.06]">
                {disputeSubmitted ? (
                  <p className="text-xs text-[var(--success)] font-medium">
                    {t("disputeSubmitted")}
                  </p>
                ) : (
                  <button
                    onClick={() => setShowDispute(true)}
                    className="rounded-lg border border-[var(--danger)]/40 px-3 py-1.5 text-xs font-semibold text-[var(--danger)] hover:bg-[var(--danger-dim)] transition-colors"
                  >
                    {t("openDispute")}
                  </button>
                )}
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* tabExecution tab */}
      {activeTab === "tabExecution" && (
        <Card>
          <CardHeader>
            <CardTitle>Execution</CardTitle>
            <CardDescription>
              Schedule a start date OR start now with proof. Complete with final proof.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label>Schedule start date</Label>
                <Input type="date" value={date} onChange={(e) => setDate(e.target.value)} />
                <Button
                  variant="outline"
                  disabled={!canSchedule || !date || working}
                  onClick={async () => {
                    setWorking(true);
                    await fetch(`/api/influencer/participations/${participation.id}`, {
                      method: "PATCH",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify({ action: "schedule", scheduledStartDate: date }),
                    });
                    setWorking(false);
                    window.location.reload();
                  }}
                >
                  Save schedule
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Proof image</Label>
                <Input
                  type="file"
                  accept="image/*"
                  onChange={async (e) => {
                    const f = e.target.files?.[0];
                    if (!f) return;
                    setProof(await fileToDataUrl(f));
                  }}
                />
                {proof ? (
                  proof.startsWith("data:") ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={proof} alt="proof" className="mt-2 h-32 w-full rounded-md object-cover" />
                  ) : (
                    <div className="relative mt-2 h-32 w-full overflow-hidden rounded-md">
                      <Image src={proof} alt="proof" fill className="object-cover" sizes="(max-width: 768px) 100vw, 600px" />
                    </div>
                  )
                ) : null}
              </div>
            </div>

            <div className="flex flex-wrap gap-3">
              <Button
                disabled={!canStart || !proof || working}
                onClick={async () => {
                  setWorking(true);
                  await fetch(`/api/influencer/participations/${participation.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "start", proofDataUrl: proof }),
                  });
                  setWorking(false);
                  window.location.reload();
                }}
              >
                Start campaign
              </Button>

              <Button
                variant="outline"
                disabled={!canComplete || !proof || working}
                onClick={async () => {
                  setWorking(true);
                  await fetch(`/api/influencer/participations/${participation.id}`, {
                    method: "PATCH",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ action: "complete", proofDataUrl: proof }),
                  });
                  setWorking(false);
                  window.location.reload();
                }}
              >
                Mark completed
              </Button>
            </div>

            <div className="rounded-md border border-[var(--border)] bg-[var(--surface-high)] px-3 py-2 text-xs text-[var(--foreground-muted)]">
              Payments are mocked: after completion, company will confirm, then admin marks paid. Stripe placeholders are ready.
            </div>
          </CardContent>
        </Card>
      )}

      {/* tabDeliverables tab */}
      {activeTab === "tabDeliverables" && session?.user?.id && (
        <InfluencerDeliverablesTab
          campaignId={campaign.id}
        />
      )}

      {/* tabMessages tab */}
      {activeTab === "tabMessages" && (
        <CampaignChat
          conversationId={conversationId}
        />
      )}

      {/* Review banner */}
      {reviewBanner && (
        <ReviewBanner
          campaignId={campaignId}
          reviewedId={reviewBanner.reviewedId}
          reviewedName={reviewBanner.reviewedName}
          hasReviewed={reviewBanner.hasReviewed}
        />
      )}

      {/* Dispute modal */}
      {showDispute && campaign && (
        <DisputeModal
          campaignId={campaign.id}
          onClose={() => setShowDispute(false)}
          onSuccess={() => {
            setShowDispute(false);
            setDisputeSubmitted(true);
          }}
        />
      )}
    </div>
  );
}
