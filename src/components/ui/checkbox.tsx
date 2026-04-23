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
        "h-4 w-4 rounded-md border border-[var(--border)] bg-[var(--surface)] shadow-sm transition-all duration-200 focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-1 checked:bg-[var(--primary)] checked:border-[var(--primary)] data-[state=checked]:bg-[var(--primary)] data-[state=checked]:border-[var(--primary)] data-[state=checked]:text-[var(--background)]",
        className
      )}
      {...props}
    />
  );
}
