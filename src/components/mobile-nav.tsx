"use client";

import { useState } from "react";
import { Link } from "@/i18n/navigation";

export function MobileNav({
  nav,
  role,
}: {
  nav: Array<{ href: string; label: string }>;
  role?: string;
}) {
  const [open, setOpen] = useState(false);

  return (
    <div className="md:hidden">
      {/* Hamburger button */}
      <button
        onClick={() => setOpen(!open)}
        className="flex h-10 w-10 items-center justify-center rounded-xl border border-white/20 bg-white/60 backdrop-blur-sm transition-colors hover:bg-violet-50"
        aria-label="Toggle navigation menu"
        aria-expanded={open}
      >
        {open ? (
          <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5 text-slate-700" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </button>

      {/* Mobile menu overlay */}
      {open && (
        <>
          <div
            className="fixed inset-0 z-40 bg-black/30 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <nav
            className="fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-2xl border-r border-white/20 p-5 shadow-2xl overflow-y-auto"
            role="navigation"
            aria-label="Mobile navigation"
          >
            {/* Logo */}
            <div className="flex items-center justify-between mb-6">
              <Link href="/" className="flex items-center gap-2" onClick={() => setOpen(false)}>
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25">
                  <span className="text-xs font-bold text-white">U</span>
                </div>
                <span className="text-lg font-bold tracking-tight gradient-text">UGC26</span>
              </Link>
              <button
                onClick={() => setOpen(false)}
                className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-slate-100 transition-colors"
                aria-label="Close menu"
              >
                <svg className="h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {role && (
              <div className="mb-4 inline-flex items-center rounded-full bg-violet-100 px-3 py-1 text-xs font-medium text-violet-700">
                {role}
              </div>
            )}

            {/* Nav links */}
            <div className="flex flex-col gap-1">
              {nav.map((item) => (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setOpen(false)}
                  className="group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-slate-600 transition-all duration-200 hover:bg-violet-50/80 hover:text-violet-700"
                >
                  <div className="h-1.5 w-1.5 rounded-full bg-slate-300 transition-all duration-200 group-hover:bg-violet-500" />
                  {item.label}
                </Link>
              ))}
            </div>
          </nav>
        </>
      )}
    </div>
  );
}
