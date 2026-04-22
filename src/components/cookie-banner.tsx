"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  const t = useTranslations("cookies");

  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) {
      setVisible(true);
    }
  }, []);

  const accept = () => {
    localStorage.setItem("cookie-consent", "true");
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-3 shadow-lg">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <p className="text-sm text-slate-600 dark:text-slate-400">{t("banner")}</p>
        <button
          onClick={accept}
          className="shrink-0 rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700 transition-colors"
        >
          {t("accept")}
        </button>
      </div>
    </div>
  );
}
