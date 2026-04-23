import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";

export const metadata: Metadata = { title: "FAQ" };

export default async function FaqPage() {
  const t = await getTranslations("faq");

  const faqs = [
    { q: t("q1"), a: t("a1"), tag: "01" },
    { q: t("q2"), a: t("a2"), tag: "02" },
    { q: t("q3"), a: t("a3"), tag: "03" },
    { q: t("q4"), a: t("a4"), tag: "04" },
    { q: t("q5"), a: t("a5"), tag: "05" },
    { q: t("q6"), a: t("a6"), tag: "06" },
    { q: t("q7"), a: t("a7"), tag: "07" },
    { q: t("q8"), a: t("a8"), tag: "08" },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative py-40 bg-mesh overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="orb-pink w-[600px] h-[400px] top-0 right-0 opacity-30" />

          <div className="relative z-10 mx-auto max-w-4xl px-4 text-center">
            <div className="animate-fade-in-up mb-6">
              <span className="tag-neon">// {t("title")}</span>
            </div>
            <h1
              className="animate-fade-in-up delay-100 font-display font-bold gradient-text text-balance leading-tight mb-6"
              style={{ fontSize: "clamp(2.5rem, 7vw, 5.5rem)" }}
            >
              {t("title")}
            </h1>
            <p className="animate-fade-in-up delay-200 text-[var(--foreground-muted)] text-lg max-w-xl mx-auto">
              {t("subtitle")}
            </p>
          </div>
        </section>

        {/* ── FAQ LIST ─────────────────────────────────── */}
        <section className="py-24 bg-mesh">
          <div className="mx-auto max-w-3xl px-4">
            <div className="space-y-3">
              {faqs.map((faq, i) => (
                <AnimateOnScroll key={i} delay={i * 60}>
                  <details className="faq-item group">
                    <summary className="flex cursor-pointer items-center gap-4 p-6 [&::-webkit-details-marker]:hidden select-none">
                      <span className="step-badge shrink-0">{faq.tag}</span>
                      <span className="flex-1 text-sm font-medium text-[var(--foreground)] leading-snug">
                        {faq.q}
                      </span>
                      <div
                        className="shrink-0 w-8 h-8 rounded-lg border border-[var(--border)] flex items-center justify-center text-[var(--primary)] transition-all duration-300 group-open:border-[var(--primary)] group-open:bg-[var(--primary-dim)] group-open:rotate-45"
                        style={{ fontSize: 20 }}
                      >
                        +
                      </div>
                    </summary>
                    <div className="px-6 pb-6">
                      <div className="pt-4 pl-16 border-t border-[var(--border)]">
                        <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
                          {faq.a}
                        </p>
                      </div>
                    </div>
                  </details>
                </AnimateOnScroll>
              ))}
            </div>

            {/* Bottom CTA */}
            <AnimateOnScroll delay={200}>
              <div className="mt-16 card-cyber p-8 text-center relative overflow-hidden">
                <div className="orb-cyan w-[300px] h-[200px] top-0 left-1/2 -translate-x-1/2 opacity-20" />
                <p className="text-[var(--foreground-muted)] text-sm mb-4 font-mono-accent uppercase tracking-widest">
                  Still have questions?
                </p>
                <a
                  href="/contact"
                  className="btn-solid-cyan inline-flex"
                >
                  Contact us →
                </a>
              </div>
            </AnimateOnScroll>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
