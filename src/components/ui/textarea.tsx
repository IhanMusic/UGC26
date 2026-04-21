import * as React from "react";
import { cn } from "./utils";

export type TextareaProps = React.TextareaHTMLAttributes<HTMLTextAreaElement>;

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
  ({ className, ...props }, ref) => {
    return (
      <textarea
        ref={ref}
        className={cn(
          "flex min-h-[120px] w-full rounded-xl border border-slate-200/60 bg-white/50 px-4 py-3 text-sm text-slate-900 shadow-sm backdrop-blur-sm placeholder:text-slate-400 transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-violet-400/50 focus-visible:border-violet-300 hover:border-slate-300 disabled:cursor-not-allowed disabled:opacity-50",
          className
        )}
        {...props}
      />
    );
  }
);
Textarea.displayName = "Textarea";
