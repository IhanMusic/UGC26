import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-[var(--border)] bg-[var(--surface-mid)] text-[var(--foreground-muted)]",
        primary:
          "border-[var(--primary)] bg-[var(--primary-dim)] text-[var(--primary)]",
        secondary:
          "border-[var(--secondary)] bg-[var(--secondary-dim)] text-[var(--secondary)]",
        success:
          "border-[var(--accent)] bg-[var(--accent-dim)] text-[var(--accent)]",
        warning:
          "border-[var(--gold)] bg-[var(--gold-dim)] text-[var(--gold)]",
        danger:
          "border-[var(--danger)] bg-[rgba(255,59,92,0.1)] text-[var(--danger)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  }
);

export interface BadgeProps
  extends React.HTMLAttributes<HTMLDivElement>,
    VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return (
    <div className={cn(badgeVariants({ variant }), className)} {...props} />
  );
}
