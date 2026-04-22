import { prisma } from "@/server/db";
import { notFound } from "next/navigation";
import { PitchLandingPage, type PitchLandingData } from "@/components/pitch-landing-page";

export default async function PublicPitchPage({
  params,
}: {
  params: Promise<{ secretToken: string; locale: string }>;
}) {
  const { secretToken } = await params;

  const pitch = await prisma.creatorPitch.findUnique({
    where: { secretToken },
    include: {
      creator: { select: { id: true, firstName: true, lastName: true, imageUrl: true } },
      sponsorships: { select: { amountDZD: true } },
      pitchDeliverables: true,
    },
  });

  if (!pitch) notFound();

  const data: PitchLandingData = {
    id: pitch.id,
    title: pitch.title,
    type: pitch.type,
    status: pitch.status,
    synopsis: pitch.synopsis,
    budgetTarget: pitch.budgetTarget,
    maxSponsors: pitch.maxSponsors,
    bonusSponsorSlots: pitch.bonusSponsorSlots,
    coverImageUrl: pitch.coverImageUrl,
    platforms: pitch.platforms,
    targetAudience: pitch.targetAudience,
    ageRange: pitch.ageRange,
    country: pitch.country,
    timeline: pitch.timeline,
    teamDescription: pitch.teamDescription,
    references: pitch.references,
    storyboardUrls: pitch.storyboardUrls,
    pitchDeliverables: pitch.pitchDeliverables,
    creator: pitch.creator,
    sponsorships: pitch.sponsorships,
    alreadySponsored: false,
    readOnly: true,
    backHref: "/",
  };

  return (
    <div
      className="min-h-screen px-4 py-8 sm:px-6 lg:px-8"
      style={{ background: "var(--background)", maxWidth: "900px", margin: "0 auto" }}
    >
      {/* Private preview banner */}
      <div
        className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3"
        style={{
          background: "var(--gold-dim)",
          border: "1px solid rgba(255,184,0,0.3)",
        }}
      >
        <span className="text-lg">🔒</span>
        <div>
          <p className="text-sm font-semibold" style={{ color: "var(--gold)" }}>
            Aperçu privé
          </p>
          <p className="text-xs" style={{ color: "var(--foreground-muted)" }}>
            Vous avez reçu un lien privé pour visualiser ce projet. Il n&apos;est pas encore public.
          </p>
        </div>
      </div>

      <PitchLandingPage pitch={data} />
    </div>
  );
}
