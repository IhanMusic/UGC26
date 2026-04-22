import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "About" };

export default async function AboutPage() {
  const t = await getTranslations("about");

  const values = [
    { title: t("value1Title"), text: t("value1Text"), icon: "◈", index: "01", color: "var(--primary)",   glow: "var(--primary-glow)" },
    { title: t("value2Title"), text: t("value2Text"), icon: "✦", index: "02", color: "var(--secondary)", glow: "var(--secondary-glow)" },
    { title: t("value3Title"), text: t("value3Text"), icon: "◉", index: "03", color: "var(--accent)",    glow: "var(--accent-glow)" },
    { title: t("value4Title"), text: t("value4Text"), icon: "❋", index: "04", color: "var(--gold)",      glow: "rgba(255,184,0,0.3)" },
  ];

  const stats = [
    { value: "5,000+",  label: t("statCreators"),  color: "var(--primary)" },
    { value: "500+",    label: t("statBrands"),     color: "var(--secondary)" },
    { value: "10,000+", label: t("statCampaigns"),  color: "var(--accent)" },
    { value: "25+",     label: t("statCountries"),  color: "var(--gold)" },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">

        {/* ── HERO ────────────────────────────────────── */}
        <section className="relative py-40 bg-mesh overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="orb-cyan w-[500px] h-[500px] -top-40 -right-20 opacity-40" />

          <div className="relative z-10 mx-auto max-w-5xl px-4 text-center">
            <div className="animate-fade-in-up mb-6">
              <span className="tag-neon">// {t("title")}</span>
            </div>
            <h1
              className="animate-fade-in-up delay-100 font-display font-bold gradient-text text-balance leading-tight"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              {t("title")}
            </h1>
          </div>
        </section>

        {/* ── MISSION ─────────────────────────────────── */}
        <section className="py-24 bg-mesh">
          <div className="mx-auto max-w-5xl px-4">
            <AnimateOnScroll>
              <div className="card-cyber p-10 md:p-16 relative overflow-hidden">
                <div className="orb-cyan w-[300px] h-[300px] -top-20 -right-20 opacity-20" />
                <span className="tag-neon mb-6 inline-flex">// {t("mission")}</span>
                <h2
                  className="font-display font-bold text-[var(--foreground)] mb-6 relative z-10"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
                >
                  {t("missionTitle")}
                </h2>
                <p className="text-[var(--foreground-muted)] leading-relaxed text-lg relative z-10 max-w-3xl">
                  {t("missionText")}
                </p>
              </div>
            </AnimateOnScroll>

            <AnimateOnScroll delay={150} className="mt-8">
              <div className="card-cyber p-10 md:p-16 relative overflow-hidden" style={{ borderColor: "rgba(139,92,246,0.2)" }}>
                <div className="orb-purple w-[300px] h-[300px] -bottom-20 -left-20 opacity-20" />
                <span className="tag-neon-purple mb-6 inline-flex">// {t("whatWeDo")}</span>
                <h2
                  className="font-display font-bold text-[var(--foreground)] mb-6 relative z-10"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}
                >
                  {t("whatWeDo")}
                </h2>
                <p className="text-[var(--foreground-muted)] leading-relaxed text-lg relative z-10 max-w-3xl">
                  {t("whatWeDoText")}
                </p>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

        <div className="section-line mx-auto max-w-5xl px-4" />

        {/* ── STATS ───────────────────────────────────── */}
        <section className="py-24 bg-mesh">
          <div className="mx-auto max-w-5xl px-4">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <span className="tag-neon-green mb-4 inline-flex">// {t("stats")}</span>
                <h2
                  className="font-display font-bold text-[var(--foreground)] mt-4"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                >
                  {t("stats")}
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="grid grid-cols-2 md:grid-cols-4 gap-px rounded-xl overflow-hidden border border-[var(--border)]">
              {stats.map((stat, i) => (
                <AnimateOnScroll key={stat.label} delay={i * 100}>
                  <div className="flex flex-col items-center gap-2 p-8 bg-[var(--surface)] backdrop-blur-sm h-full">
                    <span className="stat-value" style={{ color: stat.color }}>
                      {stat.value}
                    </span>
                    <span className="text-xs text-[var(--foreground-muted)] font-mono-accent uppercase tracking-widest text-center">
                      {stat.label}
                    </span>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        <div className="section-line mx-auto max-w-5xl px-4" />

        {/* ── VALUES ──────────────────────────────────── */}
        <section className="py-24 bg-mesh">
          <div className="mx-auto max-w-5xl px-4">
            <AnimateOnScroll>
              <div className="text-center mb-16">
                <span className="tag-neon-purple mb-4 inline-flex">// {t("values")}</span>
                <h2
                  className="font-display font-bold text-[var(--foreground)] mt-4"
                  style={{ fontSize: "clamp(1.75rem, 3.5vw, 2.5rem)" }}
                >
                  {t("values")}
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="grid sm:grid-cols-2 gap-5">
              {values.map((v, i) => (
                <AnimateOnScroll key={v.index} delay={i * 100}>
                  <div
                    className="card-cyber p-8 group h-full"
                    style={{ borderColor: `${v.color}20` }}
                  >
                    <div className="flex items-start gap-5 mb-5">
                      <div
                        className="flex items-center justify-center w-12 h-12 rounded-xl text-xl font-bold shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: `${v.color}15`,
                          border: `1px solid ${v.color}`,
                          color: v.color,
                          boxShadow: `0 0 16px ${v.glow}`,
                        }}
                      >
                        {v.icon}
                      </div>
                      <div>
                        <span className="font-mono-accent text-xs tracking-widest opacity-40 block mb-1">
                          {v.index}
                        </span>
                        <h3 className="font-display font-bold text-[var(--foreground)] text-lg" style={{ color: v.color }}>
                          {v.title}
                        </h3>
                      </div>
                    </div>
                    <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                      {v.text}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
