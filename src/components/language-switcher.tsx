"use client";

import { usePathname } from "@/i18n/navigation";
import { locales, type AppLocale } from "@/i18n/routing";
import { useLocale } from "next-intl";

const labels: Record<AppLocale, string> = {
  fr: "FR",
  en: "EN",
  ar: "AR",
};

export function LanguageSwitcher() {
  const locale = useLocale() as AppLocale;
  const pathname = usePathname();

  const switchLocale = (l: AppLocale) => {
    document.cookie = `NEXT_LOCALE=${l}; path=/; max-age=31536000; SameSite=Lax`;
    window.location.href = `/${l}${pathname}`;
  };

  return (
    <div className="flex items-center gap-1 rounded-xl border border-slate-200/60 bg-white/50 p-1 backdrop-blur-sm">
      {locales.map((l) => (
        <button
          key={l}
          onClick={() => switchLocale(l)}
          className={`rounded-lg px-2.5 py-1 text-xs font-medium transition-all duration-200 ${
            l === locale
              ? "bg-gradient-to-r from-violet-600 to-indigo-600 text-white shadow-sm"
              : "text-slate-600 hover:bg-violet-50 hover:text-violet-700"
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
