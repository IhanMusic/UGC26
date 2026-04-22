import { Link } from "@/i18n/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { SignOutButton } from "@/components/signout-button";
import { Badge } from "@/components/ui/badge";
import { MobileNav } from "@/components/mobile-nav";
import { LanguageSwitcher } from "@/components/language-switcher";
import { ThemeToggle } from "@/components/theme-toggle";
import { NotificationBell } from "@/components/notification-bell";
import { getTranslations } from "next-intl/server";
import { VerificationBanner } from "@/components/verification-banner";
import { NavLink } from "@/components/nav-link";

export async function AppShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: Array<{ href: string; label: string }>;
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const t = await getTranslations();

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-1 bg-mesh">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden w-72 flex-col border-r border-black/[0.08] bg-white/90 p-5 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#0D0F1C]/80 md:flex">
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25">
              <span className="text-xs font-bold text-white">U</span>
            </div>
            <span className="text-lg font-bold tracking-tight gradient-text">UGC26</span>
          </Link>
          {session?.user ? (
            <Badge variant="secondary">{session.user.role}</Badge>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex flex-col gap-1" aria-label="Dashboard navigation">
          {nav.map((item) => (
            <NavLink key={item.href} href={item.href} label={item.label} />
          ))}
        </nav>

        {/* User info */}
        <div className="mt-auto pt-6">
          {session?.user ? (
            <div className="space-y-3 rounded-xl border border-black/[0.08] bg-black/[0.03] p-4 backdrop-blur-sm dark:border-white/[0.08] dark:bg-white/[0.03]">
              <div className="flex items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-br from-violet-500 to-indigo-500 text-xs font-bold text-white shadow-md shadow-violet-500/25">
                  {session.user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-slate-800 dark:text-[#E2E8F0]">
                    {session.user.email}
                  </div>
                  <div className="text-[10px] text-[#64748B]">
                    {t("common.signedInAs")}
                  </div>
                </div>
              </div>
              <SignOutButton variant="outline" className="w-full" size="sm">
                {t("common.signOut")}
              </SignOutButton>
            </div>
          ) : null}
        </div>
      </aside>

      {/* ── Main content ── */}
      <div className="flex flex-1 flex-col">
        {/* Verification banner */}
        <VerificationBanner />

        {/* Header */}
        <header className="border-b border-black/[0.08] bg-white/80 px-4 py-4 backdrop-blur-2xl dark:border-white/[0.08] dark:bg-[#0D0F1C]/60">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-violet-600 dark:text-violet-500">
                {t("common.dashboard")}
              </div>
              <h1 className="text-xl font-bold tracking-tight text-slate-900 dark:text-[#E2E8F0]">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <NotificationBell />
              <ThemeToggle />
              <LanguageSwitcher />
              {session?.user ? (
                <Badge variant="secondary" className="hidden sm:inline-flex md:hidden">
                  {session.user.role}
                </Badge>
              ) : null}
              <MobileNav nav={nav} role={session?.user?.role} />
            </div>
          </div>
        </header>

        {/* Content */}
        <main id="main-content" className="flex-1">
          <div className="mx-auto max-w-6xl px-4 py-8">{children}</div>
        </main>
      </div>
    </div>
  );
}
