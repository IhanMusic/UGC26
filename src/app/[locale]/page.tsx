import { Link } from "@/i18n/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";

function roleHome(role: string) {
  if (role === "ADMIN") return "/admin";
  if (role === "COMPANY") return "/company";
  if (role === "INFLUENCER") return "/influencer";
  return "/";
}

export default async function HomePage() {
  const t = await getTranslations();
  const session = await getServerSession(authOptions);
  const role = session?.user?.role ?? null;

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-mesh">
        <div className="mx-auto max-w-6xl px-4 py-20">
          {/* Hero Section */}
          <div className="flex flex-col gap-6 animate-fade-in-up">
            <div className="inline-flex w-fit items-center gap-2 rounded-full border border-violet-200/50 bg-white/70 px-4 py-1.5 text-xs font-medium text-violet-700 shadow-sm backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-violet-500 animate-pulse-dot" />
              {t("home.heroTag")}
            </div>
            <h1 className="text-balance text-5xl font-bold tracking-tight text-slate-900 md:text-6xl">
              <span className="gradient-text">{t("home.title")}</span>
            </h1>
            <p className="max-w-2xl text-pretty text-lg text-slate-500">
              {t("home.subtitle")}
            </p>

            <div className="flex flex-wrap items-center gap-4 pt-2">
              {session?.user ? (
                <Button asChild size="lg">
                  <Link href={role ? roleHome(role) : "/"}>{t("common.goToDashboard")} →</Link>
                </Button>
              ) : (
                <>
                  <Button asChild size="lg">
                    <Link href="/auth/login">{t("home.login")}</Link>
                  </Button>
                  <Button variant="outline" asChild size="lg">
                    <Link href="/public/campaigns">{t("home.browseCampaigns")}</Link>
                  </Button>
                </>
              )}
            </div>
          </div>

          {/* How it works */}
          <section className="mt-24">
            <h2 className="text-center text-3xl font-bold tracking-tight text-slate-900 mb-12">
              {t("home.howItWorks")}
            </h2>
            <div className="grid gap-8 md:grid-cols-3">
              {[
                { step: "01", title: t("home.step1Title"), desc: t("home.step1Desc"), color: "from-violet-500 to-indigo-500" },
                { step: "02", title: t("home.step2Title"), desc: t("home.step2Desc"), color: "from-emerald-500 to-teal-500" },
                { step: "03", title: t("home.step3Title"), desc: t("home.step3Desc"), color: "from-amber-500 to-orange-500" },
              ].map((item) => (
                <div key={item.step} className="relative flex flex-col items-center text-center p-6 animate-fade-in-up">
                  <div className={`mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br ${item.color} shadow-lg text-white text-xl font-bold`}>
                    {item.step}
                  </div>
                  <h3 className="text-lg font-semibold text-slate-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-slate-500 leading-relaxed">{item.desc}</p>
                </div>
              ))}
            </div>
          </section>

          {/* Bento Grid */}
          <section className="mt-24">
            <div className="grid gap-5 md:grid-cols-4 md:grid-rows-2">
              {/* Large card - Influencers */}
              <Card className="md:col-span-2 md:row-span-2 group overflow-hidden animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 to-indigo-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <CardHeader className="pb-4">
                  <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-500 shadow-lg shadow-violet-500/25">
                    <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 19.128a9.38 9.38 0 002.625.372 9.337 9.337 0 004.121-.952 4.125 4.125 0 00-7.533-2.493M15 19.128v-.003c0-1.113-.285-2.16-.786-3.07M15 19.128v.106A12.318 12.318 0 018.624 21c-2.331 0-4.512-.645-6.374-1.766l-.001-.109a6.375 6.375 0 0111.964-3.07M12 6.375a3.375 3.375 0 11-6.75 0 3.375 3.375 0 016.75 0zm8.25 2.25a2.625 2.625 0 11-5.25 0 2.625 2.625 0 015.25 0z" />
                    </svg>
                  </div>
                  <CardTitle className="text-2xl">{t("home.forInfluencers")}</CardTitle>
                  <CardDescription className="text-base">
                    {t("home.forInfluencersDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent className="mt-auto">
                  <Button variant="secondary" asChild className="w-full">
                    <Link href="/auth/register/influencer">{t("auth.registerInfluencer")}</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Medium card - Companies */}
              <Card className="md:col-span-2 group overflow-hidden animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/5 to-teal-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 shadow-lg shadow-emerald-500/25">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 21h19.5m-18-18v18m10.5-18v18m6-13.5V21M6.75 6.75h.75m-.75 3h.75m-.75 3h.75m3-6h.75m-.75 3h.75m-.75 3h.75M6.75 21v-3.375c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21M3 3h12m-.75 4.5H21m-3.75 0h.008v.008h-.008V7.5z" />
                    </svg>
                  </div>
                  <CardTitle>{t("home.forCompanies")}</CardTitle>
                  <CardDescription>
                    {t("home.forCompaniesDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" asChild className="w-full">
                    <Link href="/auth/register/company">{t("auth.registerCompany")}</Link>
                  </Button>
                </CardContent>
              </Card>

              {/* Small card - Admin */}
              <Card className="md:col-span-2 group overflow-hidden animate-fade-in-up">
                <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 to-orange-500/5 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
                <CardHeader>
                  <div className="mb-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 shadow-lg shadow-amber-500/25">
                    <svg className="h-5 w-5 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9.594 3.94c.09-.542.56-.94 1.11-.94h2.593c.55 0 1.02.398 1.11.94l.213 1.281c.063.374.313.686.645.87.074.04.147.083.22.127.324.196.72.257 1.075.124l1.217-.456a1.125 1.125 0 011.37.49l1.296 2.247a1.125 1.125 0 01-.26 1.431l-1.003.827c-.293.24-.438.613-.431.992a6.759 6.759 0 010 .255c-.007.378.138.75.43.99l1.005.828c.424.35.534.954.26 1.43l-1.298 2.247a1.125 1.125 0 01-1.369.491l-1.217-.456c-.355-.133-.75-.072-1.076.124a6.57 6.57 0 01-.22.128c-.331.183-.581.495-.644.869l-.213 1.28c-.09.543-.56.941-1.11.941h-2.594c-.55 0-1.02-.398-1.11-.94l-.213-1.281c-.062-.374-.312-.686-.644-.87a6.52 6.52 0 01-.22-.127c-.325-.196-.72-.257-1.076-.124l-1.217.456a1.125 1.125 0 01-1.369-.49l-1.297-2.247a1.125 1.125 0 01.26-1.431l1.004-.827c.292-.24.437-.613.43-.992a6.932 6.932 0 010-.255c.007-.378-.138-.75-.43-.99l-1.004-.828a1.125 1.125 0 01-.26-1.43l1.297-2.247a1.125 1.125 0 011.37-.491l1.216.456c.356.133.751.072 1.076-.124.072-.044.146-.087.22-.128.332-.183.582-.495.644-.869l.214-1.281z" />
                      <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    </svg>
                  </div>
                  <CardTitle>{t("home.forAdmin")}</CardTitle>
                  <CardDescription>
                    {t("home.forAdminDesc")}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button variant="secondary" asChild className="w-full">
                    <Link href="/admin">{t("nav.admin")}</Link>
                  </Button>
                </CardContent>
              </Card>
            </div>
          </section>

          {/* Trust banner */}
          <section className="mt-24 text-center animate-fade-in-up">
            <p className="text-sm font-medium text-slate-400 uppercase tracking-wider">
              {t("home.trustedBy")}
            </p>
          </section>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
