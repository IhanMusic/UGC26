"use client";

import { PitchForm } from "@/components/pitch-form";

type Category = { id: string; name: string };

type PitchForEdit = {
  id: string;
  title: string;
  type: string;
  synopsis: string;
  visibility: string;
  platforms: string[];
  ageRange: string | null;
  country: string | null;
  targetAudience: string | null;
  timeline: unknown;
  teamDescription: string | null;
  references: string[];
  storyboardUrls: string[];
  pitchDocumentUrl: string | null;
  budgetTarget: number;
  maxSponsors: number;
  bonusSponsorSlots: number;
  coverImageUrl: string | null;
  pitchDeliverables: Array<{
    id: string;
    type: string;
    description: string;
    minSponsorshipDZD: number | null;
  }>;
  categories: Array<{ category: { id: string; name: string } }>;
};

interface CreatorPitchEditClientProps {
  pitch: PitchForEdit;
  categories: Category[];
}

export default function CreatorPitchEditClient({
  pitch,
  categories,
}: CreatorPitchEditClientProps) {
  return <PitchForm mode="edit" initialPitch={pitch} categories={categories} />;
}
