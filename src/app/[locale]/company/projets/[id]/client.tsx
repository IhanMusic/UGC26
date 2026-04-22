"use client";

import { PitchLandingPage, type PitchLandingData } from "@/components/pitch-landing-page";

type PitchInput = {
  id: string;
  title: string;
  type: string;
  status: string;
  synopsis: string;
  budgetTarget: number;
  maxSponsors: number;
  bonusSponsorSlots: number;
  coverImageUrl: string | null;
  platforms: string[];
  targetAudience: string | null;
  ageRange: string | null;
  country: string | null;
  timeline: unknown;
  teamDescription: string | null;
  references: string[];
  storyboardUrls: string[];
  pitchDeliverables: {
    id: string;
    description: string;
    type: string;
    minSponsorshipDZD: number | null;
  }[];
  creator: { id: string; firstName: string; lastName: string; imageUrl: string | null };
  sponsorships: { amountDZD: number; brandId: string; status: string }[];
};

export default function CompanyProjetDetailClient({
  pitch,
  alreadySponsored,
}: {
  pitch: PitchInput;
  alreadySponsored: boolean;
}) {
  const data: PitchLandingData = {
    ...pitch,
    sponsorships: pitch.sponsorships.map((s) => ({ amountDZD: s.amountDZD })),
    alreadySponsored,
    backHref: "/company/projets",
  };

  return <PitchLandingPage pitch={data} />;
}
