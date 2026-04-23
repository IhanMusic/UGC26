"use client";

import { usePathname } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";

const labels: Record<AppLocale, string> = { fr: "FR", en: "EN", ar: "AR" };

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  const switchLocale = (l: AppLocale) => {
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.href = `/${l}${pathname}`;
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-1">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 cursor-pointer ${
            l === locale
              ? "bg-[var(--primary)] text-[var(--background)] shadow-[0_0_8px_var(--primary-glow)]"
              : "text-[var(--foreground-muted)] hover:bg-[var(--surface-mid)] hover:text-[var(--foreground)]"
          }`}
          aria-label={`Switch to ${l}`}
          aria-current={l === locale ? "true" : undefined}
        >
          {labels[l]}
        </button>
      ))}
    </div>
  );
}
