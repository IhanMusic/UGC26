"use client";

import * as React from "react";
import { cn } from "./utils";

export function Checkbox({
  className,
  ...props
}: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      type="checkbox"
      className={cn(
        "h-4 w-4 rounded-md border border-slate-300/60 text-violet-600 shadow-sm transition-all duration-200 focus:ring-2 focus:ring-violet-400/50 focus:ring-offset-1 checked:bg-violet-600 checked:border-violet-600",
        className
      )}
      {...props}
    />
  );
}
