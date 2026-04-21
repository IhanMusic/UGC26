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

  if (loading) return <div className="glass rounded-xl p-6 text-[#64748B]">{t("loading")}</div>;

  return (
    <div className="glass rounded-xl p-6 space-y-4">
      <h2 className="font-semibold text-[#E2E8F0]">{t("bankDetailsTitle")}</h2>
      <p className="text-sm text-[#64748B]">{t("bankDetailsDesc")}</p>

      <div className="space-y-3">
        {(
          [
            { key: "bankName", label: t("bankNameLabel"), placeholder: t("bankNamePlaceholder") },
            { key: "accountHolder", label: t("accountHolderLabel"), placeholder: t("accountHolderPlaceholder") },
            { key: "iban", label: t("ibanLabel"), placeholder: t("ibanPlaceholder") },
          ] as const
        ).map(({ key, label, placeholder }) => (
          <div key={key} className="space-y-1">
            <label className="text-xs font-semibold uppercase tracking-widest text-[#475569]">{label}</label>
            <input
              type="text"
              value={form[key]}
              onChange={(e) => setForm((f) => ({ ...f, [key]: e.target.value }))}
              placeholder={placeholder}
              className="w-full rounded-xl border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] placeholder-[#64748B] focus:border-violet-500/40 focus:outline-none"
            />
          </div>
        ))}
      </div>

      {error && <p className="text-xs text-[#F43F5E]">{error}</p>}
      {saved && <p className="text-xs text-emerald-400">{t("savedConfirm")}</p>}

      <button
        onClick={handleSave}
        disabled={saving}
        className="rounded-xl bg-gradient-to-r from-amber-600 to-yellow-500 px-4 py-2 text-sm font-semibold text-white hover:opacity-90 disabled:opacity-50"
      >
        {saving ? t("saving") : t("saveButton")}
      </button>
    </div>
  );
}
