import { Link } from "@/i18n/navigation";
import { getTranslations } from "next-intl/server";

export async function SiteFooter() {
  const t = await getTranslations();

  return (
    <footer className="border-t border-slate-200/60 bg-white/50 backdrop-blur-sm">
      <div className="mx-auto max-w-6xl px-4 py-12">
        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
          {/* Brand */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-violet-600 to-indigo-600 shadow-md shadow-violet-500/25">
                <span className="text-xs font-bold text-white">U</span>
              </div>
              <span className="text-lg font-bold tracking-tight">UGC26</span>
            </div>
            <p className="text-sm text-slate-500 leading-relaxed">
              {t("footer.description")}
            </p>
          </div>

          {/* Platform */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">{t("footer.platform")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/public/campaigns" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                  {t("nav.campaigns")}
                </Link>
              </li>
              <li>
                <Link href="/auth/register/influencer" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                  {t("auth.registerInfluencer")}
                </Link>
              </li>
              <li>
                <Link href="/auth/register/company" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                  {t("auth.registerCompany")}
                </Link>
              </li>
              <li>
                <Link href="/about" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                  {t("nav.about")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">{t("footer.legal")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/privacy" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                  {t("nav.privacy")}
                </Link>
              </li>
              <li>
                <Link href="/terms" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                  {t("nav.terms")}
                </Link>
              </li>
              <li>
                <Link href="/faq" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                  {t("nav.faq")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="space-y-3">
            <h3 className="text-sm font-semibold text-slate-900">{t("footer.connect")}</h3>
            <ul className="space-y-2">
              <li>
                <Link href="/contact" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                  {t("nav.contact")}
                </Link>
              </li>
              <li>
                <a href="mailto:support@ugc26.com" className="text-sm text-slate-500 hover:text-violet-600 transition-colors">
                  support@ugc26.com
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="mt-10 flex flex-col items-center justify-between gap-4 border-t border-slate-200/60 pt-6 sm:flex-row">
          <p className="text-xs text-slate-400">
            © {new Date().getFullYear()} UGC26. {t("footer.allRightsReserved")}
          </p>
          <p className="text-xs text-slate-400">
            {t("footer.madeWith")} ❤️ in Algeria
          </p>
        </div>
      </div>
    </footer>
  );
}
