"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/utils";
import type { ReactNode } from "react";

interface NavLinkProps {
  href: string;
  icon?: ReactNode;
  label: string;
}

export function NavLink({ href, icon, label }: NavLinkProps) {
  const pathname = usePathname();
  // Match: pathname ends with href or is exactly href (handle locale prefix)
  const isActive = pathname === href || pathname.endsWith(href) || pathname.includes(href);

  return (
    <Link
      href={href}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-violet-500/15 text-violet-300"
          : "text-[#94A3B8] hover:bg-violet-500/10 hover:text-violet-300"
      )}
    >
      {icon ? (
        <span
          className={cn(
            "flex h-5 w-5 items-center justify-center transition-colors",
            isActive ? "text-violet-400" : "text-[#64748B] group-hover:text-violet-400"
          )}
        >
          {icon}
        </span>
      ) : (
        <div
          className={cn(
            "h-1.5 w-1.5 rounded-full transition-all duration-200",
            isActive
              ? "bg-violet-500 shadow-sm shadow-violet-500/50"
              : "bg-slate-600 group-hover:bg-violet-500 group-hover:shadow-sm group-hover:shadow-violet-500/50"
          )}
        />
      )}
      <span>{label}</span>
      {isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-violet-500 shadow-[0_0_6px_rgba(139,92,246,0.6)]" />
      )}
    </Link>
  );
}
