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
        "h-4 w-4 rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-200 focus-visible:ring-2 focus-visible:ring-[var(--primary)] focus-visible:ring-offset-1 checked:bg-[var(--primary)] checked:border-[var(--primary)]",
        className
      )}
      {...props}
    />
  );
}
