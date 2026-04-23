"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";

interface BankDetails {
  bankName: string;
  accountHolder: string;
  iban: string;
}

export function BankDetailsForm() {
  const t = useTranslations("payments");
  const [form, setForm] = useState<BankDetails>({ bankName: "", accountHolder: "", iban: "" });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetch("/api/influencer/bank-details")
      .then((r) => r.json())
      .then((data) => {
        if (data) setForm(data as BankDetails);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    setError(null);
    try {
      const res = await fetch("/api/influencer/bank-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (!res.ok) {
        const data = await res.json() as { error?: string };
        throw new Error(data.error ?? "Erreur");
      }
      setSaved(true);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Erreur");
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="glass rounded-xl p-6 text-[var(--foreground-muted)]">{t("loading")}</div>;

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <h2 className="font-semibold text-[var(--foreground)]">{t("bankDetailsTitle")}</h2>
      <p className="text-sm text-[var(--foreground-muted)]">{t("bankDetailsDesc")}</p>

      <div className="space-y-3">
        {(
          [
            { key: "bankName", label: t("bankNameLabel"), placeholder: t("bankNamePlaceholder") },
            { key: "accountHolder", label: t("accountHolderLabel"), placeholder: t("accountHolderPlaceholder") },
            { key: "iban", label: t("ibanLabel"), placeholder: t("ibanPlaceholder") },
          ] as const
        ).map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-[var(--foreground-muted)]">{label}</label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[var(--foreground)] placeholder-[var(--foreground-muted)] focus-visible:border-[var(--primary)]/40 focus-visible:outline-none"
            />
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-[var(--danger)]">{error}</p>}
      {saved && <p className="text-xs text-[var(--success)]">{t("savedConfirm")}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl bg-gradient-to-r from-[var(--primary)] to-[var(--secondary)] px-4 py-2 text-sm font-semibold text-[var(--background)] hover:opacity-90 disabled:opacity-50"
      >
        {saving ? t("saving") : t("saveButton")}
      </button>
    </div>
  );
}
