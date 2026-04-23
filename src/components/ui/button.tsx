import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--background)] disabled:pointer-events-none disabled:opacity-50 cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-[var(--primary)] text-[var(--background)] shadow-[0_0_16px_var(--primary-glow)] hover:brightness-110 hover:shadow-[0_0_24px_var(--primary-glow)] active:scale-[0.98]",
        secondary:
          "bg-[var(--secondary-dim)] text-[var(--secondary)] border border-[var(--secondary)] hover:bg-[var(--secondary)] hover:text-white active:scale-[0.98]",
        outline:
          "border border-[var(--border)] bg-transparent text-[var(--foreground-muted)] hover:border-[var(--border-hover)] hover:text-[var(--foreground)] hover:bg-[var(--surface)]",
        ghost:
          "text-[var(--foreground-muted)] hover:bg-[var(--surface-mid)] hover:text-[var(--foreground)]",
        destructive:
          "bg-[var(--danger)] text-white shadow-[0_0_12px_rgba(255,59,92,0.3)] hover:brightness-110 active:scale-[0.98]",
        neon:
          "border border-[var(--primary)] text-[var(--primary)] bg-[var(--primary-dim)] hover:bg-[var(--primary)] hover:text-[var(--background)] hover:shadow-[0_0_20px_var(--primary-glow)] active:scale-[0.98]",
      },
      size: {
        default: "h-10 px-5 py-2",
        sm: "h-9 rounded-lg px-3.5 text-xs",
        lg: "h-12 rounded-xl px-8 text-base",
        icon: "h-10 w-10",
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean;
}

export function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: ButtonProps) {
  const Comp = asChild ? Slot : "button";
  return (
    <Comp
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  );
}
