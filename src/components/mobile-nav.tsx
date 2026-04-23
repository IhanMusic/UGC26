"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";
import { NavLink } from "@/components/nav-link";
import type { NavItem } from "@/app/[locale]/influencer/_nav";

export function MobileNav({
  nav,
  role,
}: {
  nav: NavItem[];
  role?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] transition-all duration-200 hover:border-[var(--border-hover)] hover:text-[var(--primary)]"
        aria-label="Toggle navigation menu"
        aria-expanded={open}
      >
        {open ? (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-[var(--background)]/60 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav
            className="fixed inset-y-0 left-0 z-50 w-72 border-r border-[var(--border)] bg-[var(--surface-high)] backdrop-blur-2xl p-5 shadow-2xl overflow-y-auto"
            role="navigation"
            aria-label="Mobile navigation"
          >
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2.5" onClick={() => setOpen(false)}>
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm text-black"
                  style={{ background: "var(--primary)", boxShadow: "0 0 12px var(--primary-glow)" }}
                >
                  A
                </div>
                <span className="font-bold text-lg gradient-text-cyber">ADWAA</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--foreground-muted)] hover:bg-[var(--surface-mid)] transition-colors"
                aria-label="Close menu"
              >
                <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {role && (
              <div className="mb-4 inline-flex items-center rounded-full border border-[var(--primary)] bg-[var(--primary-dim)] px-3 py-1 text-xs font-medium text-[var(--primary)]">
                {role}
              </div>
            )}

            <div className="flex flex-col">
              {nav.map((item, i) => (
                <NavLink
                  key={item.type === "link" ? item.href : `section-${i}`}
                  item={item}
                  onClick={item.type === "link" ? () => setOpen(false) : undefined}
                />
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
