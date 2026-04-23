import { Link } from "@/i18n/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { prisma } from "@/server/db";

function roleHome(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "COMPANY") return "/company";
  if (role === "INFLUENCER") return "/influencer";
  return "/";
}

function formatStat(n: number): string {
  if (n >= 10_000) return `${Math.floor(n / 1_000)}K+`;
  if (n >= 1_000) return `${(n / 1_000).toFixed(1).replace(/\.0$/, "")}K+`;
  return `${n.toLocaleString()}+`;
}

export default async function HomePage() {
  const t = await getTranslations();
  const [session, influencerCount, companyCount, participationCount, sponsorshipCount] = await Promise.all([
    getServerSession(authOptions),
    prisma.user.count({ where: { role: "INFLUENCER", isDeleted: false, isBlocked: false } }),
    prisma.user.count({ where: { role: "COMPANY", isDeleted: false, isBlocked: false } }),
    prisma.campaignParticipation.count({ where: { status: { in: ["ONGOING", "COMPLETED", "CONFIRMED", "PAID"] } } }),
    prisma.pitchSponsorship.count({ where: { status: { in: ["COMMITTED", "PAID"] } } }),
  ]);
  const role = session?.user?.role ?? null;
  const contentCount = participationCount + sponsorshipCount;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">

        {/* ── HERO ─────────────────────────────────────────────── */}
        <section className="relative min-h-screen flex flex-col justify-center bg-mesh overflow-hidden">
          {/* Grid dot background */}
          <div className="absolute inset-0 bg-grid opacity-40 pointer-events-none" />

          {/* Ambient orbs */}
          <div className="orb-cyan w-[600px] h-[600px] -top-40 -left-40 opacity-60" />
          <div className="orb-pink w-[500px] h-[500px] -bottom-20 -right-20 opacity-50" />
          <div className="orb-green w-[300px] h-[300px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-30" />

          {/* Scanline */}
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-30 animate-scan pointer-events-none" />

          <div className="relative z-10 mx-auto max-w-6xl px-4 py-32">
            {/* Tag */}
            <div className="animate-fade-in-up mb-8">
              <span className="tag-neon animate-flicker">
                <span className="h-1.5 w-1.5 rounded-full bg-[var(--primary)] animate-pulse-dot" />
                {t("home.heroTag")}
              </span>
            </div>

            {/* Headline */}
            <h1 className="animate-fade-in-up delay-100 font-display font-bold text-balance leading-[0.95] tracking-tight mb-8">
              <span
                className="gradient-text-cyber block"
                style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}
              >
                {t("home.title").split(" ").slice(0, 3).join(" ")}
              </span>
              <span
                className="text-[var(--foreground)] block opacity-90"
                style={{ fontSize: "clamp(2rem, 5vw, 4.5rem)" }}
              >
                {t("home.title").split(" ").slice(3).join(" ")}
              </span>
            </h1>

            {/* Subtitle */}
            <p className="animate-fade-in-up delay-200 max-w-2xl text-[var(--foreground-muted)] leading-relaxed mb-10"
               style={{ fontSize: "clamp(1rem, 1.5vw, 1.2rem)" }}>
              {t("home.subtitle")}
            </p>

            {/* CTAs */}
            <div className="animate-fade-in-up delay-300 flex flex-wrap items-center gap-4 mb-20">
              {session?.user ? (
                <Link href={role ? roleHome(role) : "/"} className="btn-solid-cyan">
                  {t("common.goToDashboard")} →
                </Link>
              ) : (
                <>
                  <Link href="/auth/register/influencer" className="btn-solid-cyan">
                    {t("home.ctaCreator")}
                  </Link>
                  <Link href="/auth/register/company" className="btn-neon">
                    {t("home.ctaBrand")}
                  </Link>
                </>
              )}
            </div>

            {/* Stats bar */}
            <div className="animate-fade-in-up delay-400 grid grid-cols-3 gap-px rounded-xl overflow-hidden border border-[var(--border)]">
              {[
                { value: formatStat(influencerCount), label: t("home.statVoices") },
                { value: formatStat(companyCount),    label: t("home.statBrands") },
                { value: formatStat(contentCount),    label: t("home.statContent") },
              ].map((stat, i) => (
                <div
                  key={i}
                  className="flex flex-col items-center gap-1 px-6 py-5 bg-[var(--surface)] backdrop-blur-sm"
                >
                  <span className="stat-value animate-flicker" style={{ animationDelay: `${i * 0.3}s` }}>
                    {stat.value}
                  </span>
                  <span className="text-xs text-[var(--foreground-muted)] font-mono-accent uppercase tracking-widest">
                    {stat.label}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom gradient fade */}
          <div className="absolute bottom-0 inset-x-0 h-40 bg-gradient-to-t from-[var(--background)] to-transparent pointer-events-none" />
        </section>

        {/* ── HOW IT WORKS ─────────────────────────────────────── */}
        <section className="relative py-32 bg-mesh">
          <div className="mx-auto max-w-6xl px-4">
            <AnimateOnScroll>
              <div className="text-center mb-20">
                <span className="tag-neon mb-4 inline-flex">// {t("home.howItWorks")}</span>
                <h2 className="font-display font-bold text-[var(--foreground)] mt-4"
                    style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                  {t("home.howItWorks")}
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="relative grid gap-8 md:grid-cols-3">
              {/* Connector line on desktop */}
              <div className="hidden md:block absolute top-10 left-1/4 right-1/4 h-px bg-gradient-to-r from-[var(--primary)] via-[var(--secondary)] to-[var(--accent)] opacity-30" />

              {[
                {
                  step: "01",
                  title: t("home.step1Title"),
                  desc:  t("home.step1Desc"),
                  color: "var(--primary)",
                  glow:  "var(--primary-glow)",
                  delay: 0,
                },
                {
                  step: "02",
                  title: t("home.step2Title"),
                  desc:  t("home.step2Desc"),
                  color: "var(--secondary)",
                  glow:  "var(--secondary-glow)",
                  delay: 150,
                },
                {
                  step: "03",
                  title: t("home.step3Title"),
                  desc:  t("home.step3Desc"),
                  color: "var(--accent)",
                  glow:  "var(--accent-glow)",
                  delay: 300,
                },
              ].map((item) => (
                <AnimateOnScroll key={item.step} delay={item.delay}>
                  <div className="card-cyber p-8 text-center group">
                    <div
                      className="inline-flex items-center justify-center w-16 h-16 rounded-2xl mb-6 font-mono-accent font-bold text-xl transition-all duration-300"
                      style={{
                        background: `rgba(${item.color === "var(--primary)" ? "0,229,255" : item.color === "var(--secondary)" ? "255,45,120" : "0,255,136"}, 0.1)`,
                        border: `1px solid ${item.color}`,
                        color: item.color,
                        boxShadow: `0 0 20px ${item.glow}`,
                      }}
                    >
                      {item.step}
                    </div>
                    <h3
                      className="font-display font-bold text-[var(--foreground)] text-lg mb-3"
                      style={{ color: item.color }}
                    >
                      {item.title}
                    </h3>
                    <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                      {item.desc}
                    </p>
                  </div>
                </AnimateOnScroll>
              ))}
            </div>
          </div>
        </section>

        <div className="section-line mx-auto max-w-6xl px-4" />

        {/* ── ROLE CARDS ────────────────────────────────────────── */}
        <section className="relative py-32 bg-mesh">
          <div className="mx-auto max-w-6xl px-4">
            <AnimateOnScroll>
              <div className="text-center mb-20">
                <span className="tag-neon-pink mb-4 inline-flex">// protocol.roles</span>
                <h2 className="font-display font-bold text-[var(--foreground)] mt-4"
                    style={{ fontSize: "clamp(2rem, 4vw, 3rem)" }}>
                  {t("home.forInfluencers")} · {t("home.forCompanies")} · {t("home.forAdmin")}
                </h2>
              </div>
            </AnimateOnScroll>

            <div className="grid gap-5 md:grid-cols-2 lg:grid-cols-3">
              {/* Influencer — large */}
              <AnimateOnScroll delay={0} className="lg:col-span-2 lg:row-span-1">
                <div className="card-cyber h-full p-8 flex flex-col" style={{ minHeight: 280 }}>
                  <div className="flex items-start justify-between mb-6">
                    <span className="tag-neon">01 // {t("home.forInfluencers")}</span>
                    <svg className="w-8 h-8 opacity-20 text-[var(--primary)]" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <h3 className="font-display font-bold text-[var(--foreground)] text-2xl mb-3">
                    {t("home.forInfluencers")}
                  </h3>
                  <p className="text-[var(--foreground-muted)] text-sm leading-relaxed mb-8 flex-1">
                    {t("home.forInfluencersDesc")}
                  </p>
                  <Link href="/auth/register/influencer" className="btn-neon self-start">
                    {t("auth.registerInfluencer")} →
                  </Link>
                </div>
              </AnimateOnScroll>

              {/* Company */}
              <AnimateOnScroll delay={150}>
                <div className="card-cyber h-full p-8 flex flex-col" style={{ borderColor: "rgba(255,45,120,0.2)" }}>
                  <span className="tag-neon-pink mb-6 self-start">02 // {t("home.forCompanies")}</span>
                  <h3 className="font-display font-bold text-[var(--foreground)] text-xl mb-3">
                    {t("home.forCompanies")}
                  </h3>
                  <p className="text-[var(--foreground-muted)] text-sm leading-relaxed mb-8 flex-1">
                    {t("home.forCompaniesDesc")}
                  </p>
                  <Link
                    href="/auth/register/company"
                    className="btn-neon self-start"
                    style={{
                      borderColor: "var(--secondary)",
                      background: "var(--secondary-dim)",
                      color: "var(--secondary)",
                    }}
                  >
                    {t("auth.registerCompany")} →
                  </Link>
                </div>
              </AnimateOnScroll>

              {/* Admin */}
              <AnimateOnScroll delay={300} className="md:col-span-2 lg:col-span-3">
                <div
                  className="card-cyber p-8 flex flex-col md:flex-row items-start md:items-center gap-6"
                  style={{ borderColor: "rgba(0,255,136,0.15)" }}
                >
                  <span className="tag-neon-green shrink-0">03 // {t("home.forAdmin")}</span>
                  <div className="flex-1">
                    <h3 className="font-display font-bold text-[var(--foreground)] text-lg mb-1">
                      {t("home.forAdmin")}
                    </h3>
                    <p className="text-[var(--foreground-muted)] text-sm">{t("home.forAdminDesc")}</p>
                  </div>
                  <Link
                    href="/admin"
                    className="btn-neon shrink-0"
                    style={{
                      borderColor: "var(--accent)",
                      background: "var(--accent-dim)",
                      color: "var(--accent)",
                    }}
                  >
                    {t("nav.admin")} →
                  </Link>
                </div>
              </AnimateOnScroll>
            </div>
          </div>
        </section>

        {/* ── MANIFESTO ────────────────────────────────────────── */}
        <AnimateOnScroll>
          <section className="relative py-24 overflow-hidden">
            <div className="absolute inset-0 bg-mesh" />
            <div className="orb-pink w-[600px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-20" />
            <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
              <span className="tag-neon-pink mb-8 inline-flex">// manifeste</span>
              <blockquote
                className="font-display font-bold text-[var(--foreground)] leading-snug mb-8 whitespace-pre-line"
                style={{ fontSize: "clamp(1.25rem, 3vw, 2rem)" }}
              >
                {t("home.manifesto")}
              </blockquote>
              <p className="font-mono-accent text-sm text-[var(--primary)] uppercase tracking-widest animate-flicker">
                — {t("home.manifestoClosing")}
              </p>
            </div>
          </section>
        </AnimateOnScroll>

        {/* ── CTA SECTION ──────────────────────────────────────── */}
        <AnimateOnScroll>
          <section className="relative py-32 overflow-hidden">
            <div className="absolute inset-0 bg-mesh" />
            <div className="orb-cyan w-[800px] h-[400px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-40" />
            <div className="relative z-10 mx-auto max-w-3xl px-4 text-center">
              <span className="tag-neon mb-6 inline-flex">// {t("home.trustedBy")}</span>
              <h2 className="font-display font-bold text-[var(--foreground)] mt-6 mb-6"
                  style={{ fontSize: "clamp(1.5rem, 3vw, 2.25rem)" }}>
                {t("home.ctaFinal")}
              </h2>
              {!session?.user && (
                <div className="flex flex-wrap items-center justify-center gap-4 mt-10">
                  <Link href="/auth/register/influencer" className="btn-solid-cyan">
                    {t("home.ctaCreator")}
                  </Link>
                  <Link href="/auth/register/company" className="btn-neon">
                    {t("home.ctaBrand")}
                  </Link>
                </div>
              )}
            </div>
          </section>
        </AnimateOnScroll>

      </main>
      <SiteFooter />
    </>
  );
}
