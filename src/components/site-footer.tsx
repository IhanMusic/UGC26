import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="relative border-t border-[var(--border)] bg-[var(--background)] overflow-hidden">
      {/* Ambient glow */}
      <div
        className="absolute bottom-0 left-1/2 -translate-x-1/2 w-[600px] h-[200px] rounded-full pointer-events-none"
        style={{ background: "radial-gradient(ellipse, rgba(0,229,255,0.04) 0%, transparent 70%)" }}
      />

      <div className="relative z-10 mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-10 sm:grid-cols-2 lg:grid-cols-4 mb-12">

          {/* Brand */}
          <div className="space-y-4">
            <div className="flex items-center gap-2.5">
              <div
                className="flex h-8 w-8 items-center justify-center rounded-lg font-display font-black text-sm text-black"
                style={{ background: "var(--primary)", boxShadow: "0 0 12px var(--primary-glow)" }}
              >
                U
              </div>
              <span className="font-display font-bold text-lg gradient-text-cyber">UGC26</span>
            </div>
            <p className="text-sm text-[var(--foreground-muted)] leading-relaxed">
              {t("footer.description")}
            </p>
            {/* Status dot */}
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-[var(--accent)] animate-pulse-dot" />
              <span className="font-mono-accent text-xs text-[var(--foreground-muted)] uppercase tracking-wider">
                All systems online
              </span>
            </div>
          </div>

          {/* Platform */}
          <div className="space-y-4">
            <h3 className="font-mono-accent text-xs uppercase tracking-widest text-[var(--primary)]">
              {t("footer.platform")}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/public/campaigns",          label: t("nav.campaigns") },
                { href: "/auth/register/influencer",  label: t("auth.registerInfluencer") },
                { href: "/auth/register/company",     label: t("auth.registerCompany") },
                { href: "/about",                     label: t("nav.about") },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--foreground-muted)] hover:text-[var(--primary)] transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-4">
            <h3 className="font-mono-accent text-xs uppercase tracking-widest text-[var(--secondary)]">
              {t("footer.legal")}
            </h3>
            <ul className="space-y-2.5">
              {[
                { href: "/privacy", label: t("nav.privacy") },
                { href: "/terms",   label: t("nav.terms") },
                { href: "/faq",     label: t("nav.faq") },
              ].map((l) => (
                <li key={l.href}>
                  <Link
                    href={l.href}
                    className="text-sm text-[var(--foreground-muted)] hover:text-[var(--secondary)] transition-colors duration-200"
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-4">
            <h3 className="font-mono-accent text-xs uppercase tracking-widest text-[var(--accent)]">
              {t("footer.connect")}
            </h3>
            <ul className="space-y-2.5">
              <li>
                <Link
                  href="/contact"
                  className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors duration-200"
                >
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <a
                  href="mailto:support@ugc26.com"
                  className="text-sm text-[var(--foreground-muted)] hover:text-[var(--accent)] transition-colors duration-200"
                >
                  support@ugc26.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="flex flex-col items-center justify-between gap-3 border-t border-[var(--border)] pt-6 sm:flex-row">
          <p className="font-mono-accent text-xs text-[var(--foreground-muted)]">
            © {new Date().getFullYear()} UGC26 · {t("footer.allRightsReserved")}
          </p>
          <p className="font-mono-accent text-xs text-[var(--foreground-muted)]">
            {t("footer.madeWith")} <span style={{ color: "var(--danger)" }}>♥</span> in Algeria
          </p>
        </div>
      </div>
    </footer>
  );
}
