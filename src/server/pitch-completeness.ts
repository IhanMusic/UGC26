// src/server/pitch-completeness.ts

export type PitchForScore = {
  synopsis?: string | null;
  coverImageUrl?: string | null;
  platforms: string[];
  targetAudience?: string | null;
  timeline?: Record<string, unknown> | null;
  teamDescription?: string | null;
  storyboardUrls: string[];
  pitchDocumentUrl?: string | null;
  pitchDeliverablesCount: number;
};

type ScoreBreakdown = {
  score: number;
  missing: string[];
};

export function computeCompletenessScore(pitch: PitchForScore): ScoreBreakdown {
  const missing: string[] = [];
  let score = 0;

  if (pitch.synopsis && pitch.synopsis.length > 20) score += 10;
  else missing.push("Synopsis (10 pts)");

  if (pitch.coverImageUrl) score += 5;
  else missing.push("Image de couverture (5 pts)");

  if (pitch.platforms.length > 0) score += 5;
  else missing.push("Plateformes de diffusion (5 pts)");

  if (pitch.targetAudience && pitch.targetAudience.length > 5) score += 5;
  else missing.push("Description de l'audience cible (5 pts)");

  const tl = pitch.timeline as Record<string, unknown> | null;
  if (tl?.shootingDate && tl?.postProdDate && tl?.releaseDate) score += 10;
  else missing.push("Calendrier complet (tournage + post-prod + publication) (10 pts)");

  if (pitch.teamDescription && pitch.teamDescription.length > 10) score += 15;
  else missing.push("Description de l'équipe (15 pts)");

  if (pitch.storyboardUrls.length > 0) score += 25;
  else missing.push("Storyboard (25 pts)");

  if (pitch.pitchDocumentUrl) score += 15;
  else missing.push("Dossier PDF de présentation (15 pts)");

  if (pitch.pitchDeliverablesCount >= 1) score += 10;
  else missing.push("Au moins 1 livrable sponsor (10 pts)");

  return { score, missing };
}
