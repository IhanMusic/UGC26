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
import { MessageSquare } from "lucide-react";
import type { NavItem } from "@/app/[locale]/influencer/_nav";

export async function AppShell({
  title,
  nav,
  children,
}: {
  title: string;
  nav: NavItem[];
  children: React.ReactNode;
}) {
  const session = await getServerSession(authOptions);
  const t = await getTranslations();

  return (
    <div className="flex min-h-[calc(100vh-0px)] flex-1 bg-mesh">
      {/* ── Sidebar (desktop) ── */}
      <aside className="hidden w-72 flex-col border-r border-[var(--border)] bg-[var(--surface-high)] backdrop-blur-2xl md:flex" style={{ padding: "20px" }}>
        {/* Logo */}
        <div className="flex items-center justify-between">
          <Link href="/" className="flex items-center gap-2">
            <div
              className="flex h-8 w-8 items-center justify-center rounded-lg font-bold text-sm text-black"
              style={{ background: "var(--primary)", boxShadow: "0 0 12px var(--primary-glow)" }}
            >
              A
            </div>
            <span className="text-lg font-bold gradient-text-cyber">ADWAA</span>
          </Link>
          {session?.user ? (
            <Badge variant="secondary">{session.user.role}</Badge>
          ) : null}
        </div>

        {/* Navigation */}
        <nav className="mt-8 flex flex-col gap-1" aria-label="Dashboard navigation">
          {nav.map((item, i) => (
            <NavLink key={item.type === "link" ? item.href : `section-${i}`} item={item} />
          ))}
        </nav>

        {/* User info */}
        <div className="mt-auto pt-6">
          {session?.user ? (
            <div className="space-y-3 rounded-xl border border-[var(--border)] bg-[var(--surface)] p-4">
              <div className="flex items-center gap-3">
                <div
                  className="flex h-9 w-9 items-center justify-center rounded-full text-xs font-bold text-black"
                  style={{ background: "var(--primary)", boxShadow: "0 0 10px var(--primary-glow)" }}
                >
                  {session.user.email?.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <div className="truncate text-xs font-medium text-[var(--foreground)]">
                    {session.user.email}
                  </div>
                  <div className="text-[10px] text-[var(--foreground-muted)]">
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
        <header className="border-b border-[var(--border)] bg-[var(--surface-high)] px-4 py-4 backdrop-blur-2xl">
          <div className="mx-auto flex max-w-6xl items-center justify-between">
            <div>
              <div className="text-[10px] font-medium uppercase tracking-widest text-[var(--primary)]">
                {t("common.dashboard")}
              </div>
              <h1 className="text-xl font-bold tracking-tight text-[var(--foreground)]">
                {title}
              </h1>
            </div>
            <div className="flex items-center gap-3">
              <Link
                href="/messages"
                className="flex h-9 w-9 items-center justify-center rounded-xl border border-[var(--border)] bg-[var(--surface)] text-[var(--foreground-muted)] transition-all duration-200 hover:border-[var(--border-hover)] hover:text-[var(--primary)]"
                aria-label={t("nav.messages")}
              >
                <MessageSquare className="h-4 w-4" />
              </Link>
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
