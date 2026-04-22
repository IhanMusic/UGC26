"use client";

import { PitchForm } from "@/components/pitch-form";

type Category = { id: string; name: string };

interface CreatorPitchNewClientProps {
  categories: Category[];
}

export default function CreatorPitchNewClient({ categories }: CreatorPitchNewClientProps) {
  return <PitchForm mode="create" categories={categories} />;
}
