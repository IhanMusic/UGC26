"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { cn } from "@/components/ui/utils";
import { CompanyDeliverablesTab } from "@/components/company-deliverables-tab";
import { CampaignChat } from "@/components/campaign-chat";
import { ReviewBanner } from "@/components/review-banner";

// Prisma-shaped types inferred from schema
type InfluencerUser = {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  imageUrl?: string | null;
};

type Participation = {
  id: string;
  status: string;
  createdAt: Date;
  influencer: InfluencerUser;
};

type Deliverable = {
  id: string;
  type: string;
  description?: string | null;
  fileUrl?: string | null;
  status: string;
  feedback?: string | null;
  createdAt: Date;
  influencer: { id: string; firstName: string; lastName: string; email: string };
};

type Campaign = {
  id: string;
  title: string;
  description: string;
  status: string;
  priceDinar: number;
  objectivePlatforms?: string | null;
  minFollowers?: number | null;
  ageRange?: string | null;
  country?: string | null;
  scheduledStartDate?: Date | null;
  createdAt: Date;
  participations: Participation[];
  deliverables: Deliverable[];
};

const TAB_KEYS = ["tabInfos", "tabApplicants", "tabDeliverables", "tabMessages"] as const;
type TabKey = (typeof TAB_KEYS)[number];

type ReviewBannerProps = {
  reviewedId: string;
  reviewedName: string;
  hasReviewed: boolean;
};

export function CampaignDetailClient({
  campaign,
  conversationId,
  reviewBanner,
}: {
  campaign: Campaign;
  conversationId: string | null;
  reviewBanner: ReviewBannerProps | null;
}) {
  const t = useTranslations("campaignDetail");
  const [activeTab, setActiveTab] = useState<TabKey>("tabInfos");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold text-[#E2E8F0]">{campaign.title}</h1>
        <p className="mt-1 text-[#64748B]">{campaign.description}</p>
      </div>

      {/* Tabs */}
      <div className="flex gap-1 rounded-xl border border-white/[0.08] bg-white/[0.03] p-1">
        {TAB_KEYS.map((key) => (
          <button
            key={key}
            onClick={() => setActiveTab(key)}
            className={cn(
              "flex-1 rounded-lg px-4 py-2 text-sm font-medium transition-all",
              activeTab === key
                ? "bg-violet-600 text-white shadow-sm"
                : "text-[#64748B] hover:text-[#E2E8F0]",
            )}
          >
            {t(key)}
          </button>
        ))}
      </div>

      {/* Tab content */}
      <div>
        {activeTab === "tabInfos" && <InfosTab campaign={campaign} t={t} />}
        {activeTab === "tabApplicants" && (
          <ApplicantsTab participations={campaign.participations} t={t} />
        )}
        {activeTab === "tabDeliverables" && (
          <CompanyDeliverablesTab
            campaignId={campaign.id}
            participations={campaign.participations}
          />
        )}
        {activeTab === "tabMessages" && (
          <CampaignChat
            conversationId={conversationId}
          />
        )}
      </div>

      {/* Review banner */}
      {reviewBanner && (
        <ReviewBanner
          campaignId={campaign.id}
          reviewedId={reviewBanner.reviewedId}
          reviewedName={reviewBanner.reviewedName}
          hasReviewed={reviewBanner.hasReviewed}
        />
      )}
    </div>
  );
}

function InfosTab({ campaign, t }: { campaign: Campaign; t: ReturnType<typeof useTranslations> }) {
  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <InfoField label={t("statusLabel")} value={campaign.status} />
        <InfoField label={t("budgetLabel")} value={`${campaign.priceDinar.toLocaleString()} DZD`} />
        <InfoField
          label={t("platformsLabel")}
          value={campaign.objectivePlatforms || "—"}
        />
        <InfoField
          label={t("countryLabel")}
          value={campaign.country || "—"}
        />
        <InfoField
          label={t("minFollowersLabel")}
          value={campaign.minFollowers ? campaign.minFollowers.toLocaleString() : "—"}
        />
        <InfoField
          label={t("ageRangeLabel")}
          value={campaign.ageRange || "—"}
        />
        <InfoField
          label={t("createdAtLabel")}
          value={new Date(campaign.createdAt).toLocaleDateString("fr-FR")}
        />
        {campaign.scheduledStartDate && (
          <InfoField
            label={t("scheduledAtLabel")}
            value={new Date(campaign.scheduledStartDate).toLocaleDateString("fr-FR")}
          />
        )}
      </div>
      {campaign.description && (
        <div>
          <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
            {t("descriptionLabel")}
          </p>
          <p className="mt-1 text-[#E2E8F0]">{campaign.description}</p>
        </div>
      )}
    </div>
  );
}

function InfoField({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-widest text-[#475569]">
        {label}
      </p>
      <p className="mt-1 text-[#E2E8F0]">{value}</p>
    </div>
  );
}

function ApplicantsTab({ participations, t }: { participations: Participation[]; t: ReturnType<typeof useTranslations> }) {
  if (participations.length === 0) {
    return (
      <div className="glass rounded-xl p-8 text-center text-[#64748B]">
        {t("noApplicants")}
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {participations.map((p) => (
        <div
          key={p.id}
          className="glass rounded-xl p-4 flex items-center justify-between"
        >
          <div>
            <p className="font-medium text-[#E2E8F0]">
              {p.influencer.firstName} {p.influencer.lastName}
            </p>
            <p className="text-sm text-[#64748B]">{p.influencer.email}</p>
          </div>
          <StatusBadge status={p.status} t={t} />
        </div>
      ))}
    </div>
  );
}

function StatusBadge({ status, t }: { status: string; t: ReturnType<typeof useTranslations> }) {
  const colors: Record<string, string> = {
    UPCOMING: "bg-slate-500/20 text-slate-300",
    ONGOING: "bg-blue-500/20 text-blue-300",
    COMPLETED: "bg-violet-500/20 text-violet-300",
    CONFIRMED: "bg-emerald-500/20 text-emerald-300",
    PAID: "bg-amber-500/20 text-amber-300",
  };
  const label = ["UPCOMING", "ONGOING", "COMPLETED", "CONFIRMED", "PAID"].includes(status)
    ? t(`participation.${status}` as Parameters<typeof t>[0])
    : status;
  return (
    <span
      className={cn(
        "rounded-full px-3 py-1 text-xs font-medium",
        colors[status] ?? "bg-white/10 text-white/60",
      )}
    >
      {label}
    </span>
  );
}
