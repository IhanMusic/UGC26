import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const t = await getTranslations("faq");

  const faqs = [
    { q: t("q1"), a: t("a1") },
    { q: t("q2"), a: t("a2") },
    { q: t("q3"), a: t("a3") },
    { q: t("q4"), a: t("a4") },
    { q: t("q5"), a: t("a5") },
    { q: t("q6"), a: t("a6") },
    { q: t("q7"), a: t("a7") },
    { q: t("q8"), a: t("a8") },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-mesh">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              <span className="gradient-text">{t("title")}</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500">{t("subtitle")}</p>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, i) => (
              <details
                key={i}
                className="group rounded-2xl border border-slate-200/60 bg-white/60 backdrop-blur-sm overflow-hidden animate-fade-in-up"
              >
                <summary className="flex cursor-pointer items-center justify-between gap-4 p-5 text-left font-medium text-slate-900 hover:bg-violet-50/50 transition-colors [&::-webkit-details-marker]:hidden">
                  <span className="text-sm">{faq.q}</span>
                  <span className="shrink-0 text-violet-500 transition-transform duration-200 group-open:rotate-45 text-lg">+</span>
                </summary>
                <div className="px-5 pb-5 text-sm text-slate-600 leading-relaxed border-t border-slate-100">
                  <p className="pt-4">{faq.a}</p>
                </div>
              </details>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
