import * as React from "react";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const badgeVariants = cva(
  "inline-flex items-center gap-1.5 rounded-full border px-3 py-1 text-xs font-medium transition-colors",
  {
    variants: {
      variant: {
        default:
          "border-slate-200/60 bg-white/80 text-slate-700 backdrop-blur-sm",
        secondary:
          "border-violet-200/50 bg-violet-50/80 text-violet-700 backdrop-blur-sm",
        success:
          "border-emerald-200/50 bg-emerald-50/80 text-emerald-700 backdrop-blur-sm",
        warning:
          "border-amber-200/50 bg-amber-50/80 text-amber-700 backdrop-blur-sm",
        danger:
          "border-red-200/50 bg-red-50/80 text-red-700 backdrop-blur-sm",
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
