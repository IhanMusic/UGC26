"use client";

import { useState } from "react";
import { ReviewModal } from "./review-modal";

interface Props {
  campaignId: string;
  reviewedId: string;
  reviewedName: string;
  hasReviewed: boolean;
}

export function ReviewBanner({ campaignId, reviewedId, reviewedName, hasReviewed }: Props) {
  const [showModal, setShowModal] = useState(false);
  const [submitted, setSubmitted] = useState(hasReviewed);

  if (submitted) return null;

  return (
    <>
      <div className="mt-6 flex items-center justify-between gap-4 rounded-xl border border-amber-500/20 bg-amber-500/10 px-4 py-3">
        <div>
          <p className="font-semibold text-amber-200">⭐ Campagne terminée !</p>
          <p className="text-sm text-amber-300/80">Laissez un avis pour {reviewedName}</p>
        </div>
        <button
          onClick={() => setShowModal(true)}
          className="shrink-0 rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90"
        >
          Laisser un avis →
        </button>
      </div>

      {showModal && (
        <ReviewModal
          reviewedId={reviewedId}
          reviewedName={reviewedName}
          campaignId={campaignId}
          onSuccess={() => {
            setShowModal(false);
            setSubmitted(true);
          }}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
