import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const t = await getTranslations("about");

  const values = [
    { title: t("value1Title"), text: t("value1Text"), icon: "✦", color: "from-violet-500 to-indigo-500" },
    { title: t("value2Title"), text: t("value2Text"), icon: "◈", color: "from-emerald-500 to-teal-500" },
    { title: t("value3Title"), text: t("value3Text"), icon: "◉", color: "from-amber-500 to-orange-500" },
    { title: t("value4Title"), text: t("value4Text"), icon: "❋", color: "from-rose-500 to-pink-500" },
  ];

  const stats = [
    { value: "5,000+", label: t("statCreators") },
    { value: "500+", label: t("statBrands") },
    { value: "10,000+", label: t("statCampaigns") },
    { value: "25+", label: t("statCountries") },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-mesh">
        <div className="mx-auto max-w-4xl px-4 py-20">
          {/* Title */}
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              <span className="gradient-text">{t("title")}</span>
            </h1>
          </div>

          {/* Mission */}
          <section className="mb-16 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("mission")}</h2>
            <p className="text-lg text-slate-600 leading-relaxed">{t("missionText")}</p>
          </section>

          {/* What we do */}
          <section className="mb-16 animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-4">{t("whatWeDo")}</h2>
            <p className="text-lg text-slate-600 leading-relaxed">{t("whatWeDoText")}</p>
          </section>

          {/* Values */}
          <section className="mb-16">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">{t("values")}</h2>
            <div className="grid gap-6 sm:grid-cols-2">
              {values.map((v) => (
                <Card key={v.title} className="group overflow-hidden animate-fade-in-up">
                  <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                  <CardContent className="p-6">
                    <div className={`mb-3 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${v.color} text-white text-lg shadow-lg`}>
                      {v.icon}
                    </div>
                    <h3 className="text-lg font-semibold text-slate-900 mb-2">{v.title}</h3>
                    <p className="text-sm text-slate-500 leading-relaxed">{v.text}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </section>

          {/* Stats */}
          <section className="animate-fade-in-up">
            <h2 className="text-2xl font-bold text-slate-900 mb-8 text-center">{t("stats")}</h2>
            <div className="grid grid-cols-2 gap-6 md:grid-cols-4">
              {stats.map((s) => (
                <div key={s.label} className="text-center p-6 rounded-2xl bg-white/60 border border-slate-200/60 backdrop-blur-sm">
                  <div className="text-3xl font-bold gradient-text mb-1">{s.value}</div>
                  <div className="text-sm text-slate-500">{s.label}</div>
                </div>
              ))}
            </div>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
