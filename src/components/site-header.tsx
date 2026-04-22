import { Link } from "@/i18n/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { getTranslations } from "next-intl/server";
import { Button } from "@/components/ui/button";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";

function roleHome(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "COMPANY") return "/company";
  if (role === "INFLUENCER") return "/influencer";
  return "/";
}

export async function SiteHeader() {
  const session = await getServerSession(authOptions);
  const t = await getTranslations();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--background)]/80 backdrop-blur-2xl">
      {/* Top accent line */}
      <div className="h-px bg-gradient-to-r from-transparent via-[var(--primary)] to-transparent opacity-40" />

      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 group">
          <div
            className="flex h-8 w-8 items-center justify-center rounded-lg font-display font-black text-sm text-black transition-all duration-300 group-hover:scale-110"
            style={{
              background: "var(--primary)",
              boxShadow: "0 0 16px var(--primary-glow)",
            }}
          >
            U
          </div>
          <span className="font-display font-bold text-lg tracking-tight gradient-text-cyber">
            UGC26
          </span>
        </Link>

        {/* Desktop nav */}
        <div className="hidden items-center gap-1 md:flex">
          {[
            { href: "/public/campaigns", label: t("nav.campaigns") },
            { href: "/about",            label: t("nav.about") },
            { href: "/faq",              label: t("nav.faq") },
            { href: "/contact",          label: t("nav.contact") },
          ].map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="px-3 py-2 text-sm text-[var(--foreground-muted)] rounded-lg transition-all duration-200 hover:text-[var(--primary)] hover:bg-[var(--primary-dim)]"
            >
              {link.label}
            </Link>
          ))}
        </div>

        {/* Right side */}
        <div className="flex items-center gap-2">
          <ThemeToggle />
          <LanguageSwitcher />

          {session?.user ? (
            <Link
              href={roleHome(session.user.role ?? "")}
              className="btn-solid-cyan !py-2 !px-4 !text-xs"
            >
              {t("common.dashboard")}
            </Link>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link
                  href="/auth/login"
                  className="!text-[var(--foreground-muted)] hover:!text-[var(--foreground)]"
                >
                  {t("nav.login")}
                </Link>
              </Button>
              <Link
                href="/auth/register/influencer"
                className="btn-neon !py-2 !px-4 !text-xs"
              >
                {t("nav.register")}
              </Link>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
