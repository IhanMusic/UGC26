"use client";

import { Button } from "@/components/ui/button";

export default function ErrorPage({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-mesh px-4 py-20 text-center">
      <div className="animate-fade-in-up">
        <div className="mb-6 text-8xl font-bold text-red-400">500</div>
        <h1 className="mb-3 text-2xl font-bold text-slate-900">Something went wrong</h1>
        <p className="mb-8 max-w-md text-slate-500">
          An unexpected error occurred. Please try again.
        </p>
        <Button size="lg" onClick={() => reset()}>
          Try again
        </Button>
      </div>
    </main>
  );
}
