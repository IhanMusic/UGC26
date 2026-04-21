"use client";

import { useEffect, useMemo, useState } from "react";
import { useSession } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fileToDataUrl } from "@/components/file-utils";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/components/ui/utils";
import { InfluencerDeliverablesTab } from "@/components/influencer-deliverables-tab";

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

const TABS = ["Détails", "Exécution", "Livrables"] as const;
type Tab = (typeof TABS)[number];

export default function InfluencerCampaignClient({ campaignId }: { campaignId: string }) {
  const { data: session } = useSession();
  const [loading, setLoading] = useState(true);
  const [campaign, setCampaign] = useState<CampaignDto | null>(null);
  const [participation, setParticipation] = useState<ParticipationDto | null>(null);
  const [proof, setProof] = useState<string | null>(null);
  const [date, setDate] = useState<string>("");
  const [working, setWorking] = useState(false);
  const [activeTab, setActiveTab] = useState<Tab>("Détails");

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
    return <div className="text-sm text-slate-600">Loading…</div>;
  }
  if (!campaign || !participation) {
    return <div className="text-sm text-slate-700">Not available.</div>;
  }

  return (
    <div className="space-y-6">
      {/* Tab bar */}
      <div className="flex gap-1 rounded-xl border border-white/[0.06] bg-white/[0.03] p-1">
        {TABS.map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-colors",
              activeTab === tab
                ? "bg-violet-600/20 text-violet-300"
                : "text-[#64748B] hover:text-[#94A3B8]"
            )}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Détails tab */}
      {activeTab === "Détails" && (
        <Card>
          <CardHeader>
            <CardTitle>{campaign.title}</CardTitle>
            <CardDescription>
              {campaign.priceDinar.toLocaleString()} DZD • status {statusBadge}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3 text-sm text-slate-700">
            <div className="whitespace-pre-wrap">{campaign.description}</div>
            <div>Objective: {campaign.objectivePlatforms ?? "—"}</div>
          </CardContent>
        </Card>
      )}

      {/* Exécution tab */}
      {activeTab === "Exécution" && (
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
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={proof} alt="proof" className="mt-2 h-32 w-full rounded-md object-cover" />
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

            <div className="rounded-md border border-slate-200 bg-white px-3 py-2 text-xs text-slate-600">
              Payments are mocked: after completion, company will confirm, then admin marks paid. Stripe placeholders are ready.
            </div>
          </CardContent>
        </Card>
      )}

      {/* Livrables tab */}
      {activeTab === "Livrables" && session?.user?.id && (
        <InfluencerDeliverablesTab
          campaignId={campaign.id}
        />
      )}
    </div>
  );
}
