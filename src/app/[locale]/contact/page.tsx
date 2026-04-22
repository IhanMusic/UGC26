import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { AnimateOnScroll } from "@/components/animate-on-scroll";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const t = await getTranslations("contact");

  const info = [
    {
      icon: "✉",
      label: "Email",
      value: t("emailInfo"),
      href: `mailto:${t("emailInfo")}`,
      color: "var(--primary)",
      glow: "var(--primary-glow)",
    },
    {
      icon: "☎",
      label: "Phone",
      value: t("phoneInfo"),
      href: null,
      color: "var(--secondary)",
      glow: "var(--secondary-glow)",
    },
    {
      icon: "⌖",
      label: "Address",
      value: t("addressInfo"),
      href: null,
      color: "var(--accent)",
      glow: "var(--accent-glow)",
    },
    {
      icon: "◷",
      label: "Hours",
      value: t("hoursInfo"),
      href: null,
      color: "var(--gold)",
      glow: "rgba(255,184,0,0.3)",
    },
  ];

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1">

        {/* ── HERO ─────────────────────────────────────── */}
        <section className="relative py-40 bg-mesh overflow-hidden">
          <div className="absolute inset-0 bg-grid opacity-30 pointer-events-none" />
          <div className="orb-green w-[500px] h-[400px] top-0 left-0 opacity-30" />

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

        {/* ── CONTENT ──────────────────────────────────── */}
        <section className="py-24 bg-mesh">
          <div className="mx-auto max-w-5xl px-4">
            <div className="grid md:grid-cols-2 gap-8">

              {/* Form */}
              <AnimateOnScroll direction="left">
                <ContactForm
                  labels={{
                    name:           t("nameLabel"),
                    email:          t("emailLabel"),
                    subject:        t("subjectLabel"),
                    message:        t("messageLabel"),
                    send:           t("send"),
                    successTitle:   t("successTitle"),
                    successMessage: t("successMessage"),
                  }}
                />
              </AnimateOnScroll>

              {/* Info cards */}
              <AnimateOnScroll direction="right">
                <div className="space-y-4">
                  <p className="font-mono-accent text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-6">
                    {t("info")}
                  </p>
                  {info.map((item) => (
                    <div
                      key={item.label}
                      className="card-cyber p-5 flex items-center gap-5 group"
                      style={{ borderColor: `${item.color}20` }}
                    >
                      <div
                        className="flex items-center justify-center w-11 h-11 rounded-xl text-lg shrink-0 transition-all duration-300 group-hover:scale-110"
                        style={{
                          background: `${item.color}15`,
                          border: `1px solid ${item.color}`,
                          color: item.color,
                          boxShadow: `0 0 12px ${item.glow}`,
                        }}
                      >
                        {item.icon}
                      </div>
                      <div>
                        <p className="font-mono-accent text-xs uppercase tracking-widest text-[var(--foreground-muted)] mb-0.5">
                          {item.label}
                        </p>
                        {item.href ? (
                          <a
                            href={item.href}
                            className="text-sm font-medium transition-colors"
                            style={{ color: item.color }}
                          >
                            {item.value}
                          </a>
                        ) : (
                          <p className="text-sm text-[var(--foreground)]">{item.value}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </AnimateOnScroll>

            </div>
          </div>
        </section>

      </main>
      <SiteFooter />
    </>
  );
}
