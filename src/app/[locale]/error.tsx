"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-mesh px-4 py-20 text-center">
      <div className="animate-fade-in-up">
        <div className="mb-6 text-8xl font-bold text-[var(--danger)]">500</div>
        <h1 className="mb-3 text-2xl font-bold text-[var(--foreground)]">
          Une erreur s&apos;est produite
        </h1>
        <p className="mb-8 max-w-md text-[var(--foreground-muted)]">
          {process.env.NODE_ENV === "development"
            ? error.message
            : "Veuillez réessayer ou contacter le support."}
        </p>
        <Button size="lg" onClick={() => reset()}>
          Réessayer
        </Button>
      </div>
    </main>
  );
}
