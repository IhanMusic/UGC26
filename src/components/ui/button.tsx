import * as React from "react";
import { Slot } from "@radix-ui/react-slot";
import { cva, type VariantProps } from "class-variance-authority";
import { cn } from "./utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-xl text-sm font-medium transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 ring-offset-background cursor-pointer",
  {
    variants: {
      variant: {
        default:
          "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-md shadow-violet-500/25 hover:shadow-lg hover:shadow-violet-500/30 hover:brightness-110 active:scale-[0.98]",
        secondary:
          "bg-white/80 text-slate-900 border border-slate-200/60 shadow-sm backdrop-blur-sm hover:bg-violet-50 hover:border-violet-200 hover:text-violet-700",
        outline:
          "border border-slate-200/60 bg-white/50 text-slate-700 backdrop-blur-sm hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700",
        ghost:
          "text-slate-700 hover:bg-violet-50 hover:text-violet-700",
        destructive:
          "bg-gradient-to-r from-red-500 to-rose-500 text-white shadow-md shadow-red-500/25 hover:shadow-lg hover:shadow-red-500/30 hover:brightness-110 active:scale-[0.98]",
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
