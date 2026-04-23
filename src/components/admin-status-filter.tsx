"use client";

import { useRouter, usePathname } from "next/navigation";
import { useSearchParams } from "next/navigation";
import { useTransition } from "react";

const CAMPAIGN_STATUSES = [
  "UPCOMING",
  "ONGOING",
  "COMPLETED",
  "CONFIRMED",
  "PAID",
] as const;

interface Props {
  paramName?: string;
}

export function AdminStatusFilter({ paramName = "status" }: Props) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();

  const current = searchParams.get(paramName) ?? "";

  const handleChange = (val: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (val) {
      params.set(paramName, val);
    } else {
      params.delete(paramName);
    }
    params.delete("page");
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`);
    });
  };

  return (
    <div className="relative">
      <select
        value={current}
        onChange={(e) => handleChange(e.target.value)}
        disabled={isPending}
        className="rounded-xl border border-[var(--border)] bg-[var(--surface)] px-3 py-2 pr-8 text-sm text-[var(--foreground)] focus:border-[var(--primary)] focus:outline-none disabled:opacity-60 appearance-none"
      >
        <option value="">All statuses</option>
        {CAMPAIGN_STATUSES.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <svg
        className="pointer-events-none absolute right-2 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--foreground-muted)]"
        fill="none"
        viewBox="0 0 24 24"
        stroke="currentColor"
      >
        <path
          strokeLinecap="round"
          strokeLinejoin="round"
          strokeWidth={2}
          d="M19 9l-7 7-7-7"
        />
      </svg>
    </div>
  );
}
