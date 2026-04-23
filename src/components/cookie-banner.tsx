"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";

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
    <div className="fixed bottom-0 left-0 right-0 z-50 border-t border-[var(--border)] bg-[var(--surface-high)] backdrop-blur-2xl px-4 py-3">
      <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
        <p className="text-sm text-[var(--foreground-muted)]">{t("banner")}</p>
        <Button onClick={accept} size="sm" className="shrink-0">
          {t("accept")}
        </Button>
      </div>
    </div>
  );
}
