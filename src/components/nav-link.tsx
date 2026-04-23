"use client";

import { usePathname, Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/utils";
import type { ReactNode } from "react";
import type { NavItem } from "@/app/[locale]/influencer/_nav";

interface NavLinkProps {
  item: NavItem;
  icon?: ReactNode;
  onClick?: () => void;
}

export function NavLink({ item, icon, onClick }: NavLinkProps) {
  const pathname = usePathname();

  if (item.type === "section") {
    return (
      <div className="px-3 pt-5 pb-1 text-[10px] font-bold uppercase tracking-widest text-[var(--foreground-muted)] select-none">
        {item.label}
      </div>
    );
  }

  const isActive = pathname === item.href || pathname.startsWith(item.href + "/");

  return (
    <Link
      href={item.href}
      onClick={onClick}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-all duration-200",
        isActive
          ? "bg-[var(--primary-dim)] text-[var(--primary)]"
          : "text-[var(--foreground-muted)] hover:bg-[var(--surface-mid)] hover:text-[var(--foreground)]"
      )}
    >
      {icon ? (
        <span className={cn(
          "flex h-4 w-4 items-center justify-center transition-colors",
          isActive ? "text-[var(--primary)]" : "text-[var(--foreground-muted)] group-hover:text-[var(--foreground)]"
        )}>
          {icon}
        </span>
      ) : (
        <div className={cn(
          "h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all duration-200",
          isActive
            ? "bg-[var(--primary)] shadow-[0_0_6px_var(--primary-glow)]"
            : "bg-[var(--border-hover)] group-hover:bg-[var(--primary)]"
        )} />
      )}
      <span>{item.label}</span>
      {isActive && (
        <span className="ml-auto h-1.5 w-1.5 rounded-full bg-[var(--primary)] shadow-[0_0_6px_var(--primary-glow)]" />
      )}
    </Link>
  );
}
