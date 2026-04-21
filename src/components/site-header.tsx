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
    <header className="sticky top-0 z-50 border-b border-white/20 bg-white/70 backdrop-blur-2xl">
      <nav className="mx-auto flex h-16 max-w-6xl items-center justify-between px-4" aria-label="Main navigation">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25">
            <span className="text-xs font-bold text-white">U</span>
          </div>
          <span className="text-lg font-bold tracking-tight gradient-text">UGC26</span>
        </Link>

        {/* Desktop nav links */}
        <div className="hidden items-center gap-1 md:flex">
          <Link href="/public/campaigns" className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700">
            {t("nav.campaigns")}
          </Link>
          <Link href="/about" className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700">
            {t("nav.about")}
          </Link>
          <Link href="/faq" className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700">
            {t("nav.faq")}
          </Link>
          <Link href="/contact" className="rounded-lg px-3 py-2 text-sm text-slate-600 transition-colors hover:bg-violet-50 hover:text-violet-700">
            {t("nav.contact")}
          </Link>
        </div>

        {/* Right side */}
        <div className="flex items-center gap-3">
          <ThemeToggle />
          <LanguageSwitcher />
          {session?.user ? (
            <Button asChild size="sm">
              <Link href={roleHome(session.user.role ?? "")}>
                {t("common.dashboard")}
              </Link>
            </Button>
          ) : (
            <div className="flex items-center gap-2">
              <Button variant="ghost" size="sm" asChild>
                <Link href="/auth/login">{t("nav.login")}</Link>
              </Button>
              <Button size="sm" asChild>
                <Link href="/auth/register/influencer">{t("nav.register")}</Link>
              </Button>
            </div>
          )}
        </div>
      </nav>
    </header>
  );
}
