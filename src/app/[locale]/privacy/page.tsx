import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "Privacy Policy" };

export default async function PrivacyPage() {
  const t = await getTranslations("privacy");

  const sections = [
    { title: t("section1Title"), text: t("section1Text") },
    { title: t("section2Title"), text: t("section2Text") },
    { title: t("section3Title"), text: t("section3Text") },
    { title: t("section4Title"), text: t("section4Text") },
    { title: t("section5Title"), text: t("section5Text") },
    { title: t("section6Title"), text: t("section6Text") },
    { title: t("section7Title"), text: t("section7Text") },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-mesh">
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="mb-12 animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              <span className="gradient-text">{t("title")}</span>
            </h1>
            <p className="mt-3 text-sm text-slate-400">{t("lastUpdated")}</p>
            <p className="mt-6 text-lg text-slate-600 leading-relaxed">{t("intro")}</p>
          </div>

          <div className="space-y-10">
            {sections.map((s, i) => (
              <section key={i} className="animate-fade-in-up">
                <h2 className="text-xl font-semibold text-slate-900 mb-3">
                  {i + 1}. {s.title}
                </h2>
                <p className="text-slate-600 leading-relaxed">{s.text}</p>
              </section>
            ))}
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
