import { cn } from "@/components/ui/utils";

interface FundingProgressProps {
  totalCommitted: number;
  budgetTarget: number;
  sponsorCount: number;
  maxSponsors: number;
  bonusSlotsRemaining: number;
  className?: string;
}

export function FundingProgress({
  totalCommitted,
  budgetTarget,
  sponsorCount,
  maxSponsors,
  bonusSlotsRemaining,
  className,
}: FundingProgressProps) {
  const pct =
    budgetTarget > 0 ? Math.min(100, Math.round((totalCommitted / budgetTarget) * 100)) : 0;
  const isFunded = pct >= 100;

  return (
    <div className={cn("space-y-3", className)}>
      <div className="flex items-end justify-between">
        <div>
          <div
            className="text-2xl font-bold font-mono"
            style={{ color: isFunded ? "var(--accent)" : "var(--primary)" }}
          >
            {totalCommitted.toLocaleString("fr-DZ")}
            <span className="ml-1 text-sm font-normal" style={{ color: "var(--foreground-muted)" }}>
              DZD
            </span>
          </div>
          <div className="text-xs mt-0.5" style={{ color: "var(--foreground-muted)" }}>
            sur {budgetTarget.toLocaleString("fr-DZ")} DZD objectif
          </div>
        </div>
        <div
          className="rounded-full px-3 py-1 text-sm font-bold font-mono"
          style={{
            color: isFunded ? "var(--accent)" : "var(--primary)",
            background: isFunded ? "var(--accent-dim)" : "var(--primary-dim)",
            border: `1px solid ${isFunded ? "rgba(0,255,136,0.3)" : "var(--border-hover)"}`,
          }}
        >
          {pct}%
        </div>
      </div>

      <div
        className="relative h-2 w-full overflow-hidden rounded-full"
        style={{ background: "var(--surface-mid)" }}
      >
        <div
          className="h-full rounded-full transition-all duration-700 ease-out"
          style={{
            width: `${pct}%`,
            background: isFunded
              ? "linear-gradient(90deg, var(--accent), #67FFB2)"
              : "linear-gradient(90deg, var(--primary), #67F0FF)",
            boxShadow: isFunded
              ? "0 0 10px var(--accent-glow)"
              : "0 0 10px var(--primary-glow)",
          }}
        />
      </div>

      <div className="flex items-center gap-4 text-xs" style={{ color: "var(--foreground-muted)" }}>
        <span>
          <span className="font-bold" style={{ color: "var(--foreground)" }}>
            {sponsorCount}
          </span>
          /{maxSponsors} sponsors
        </span>
        {bonusSlotsRemaining > 0 && (
          <span
            className="rounded-full px-2 py-0.5 font-semibold"
            style={{
              color: "var(--gold)",
              background: "var(--gold-dim)",
              border: "1px solid rgba(255,184,0,0.3)",
            }}
          >
            +{bonusSlotsRemaining} slots bonus
          </span>
        )}
      </div>
    </div>
  );
}
