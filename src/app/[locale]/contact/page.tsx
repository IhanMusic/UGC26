import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Card, CardContent } from "@/components/ui/card";
import { getTranslations } from "next-intl/server";
import type { Metadata } from "next";
import { ContactForm } from "./contact-form";

export const metadata: Metadata = { title: "Contact" };

export default async function ContactPage() {
  const t = await getTranslations("contact");

  return (
    <>
      <SiteHeader />
      <main id="main-content" className="flex-1 bg-mesh">
        <div className="mx-auto max-w-4xl px-4 py-20">
          <div className="text-center mb-16 animate-fade-in-up">
            <h1 className="text-4xl font-bold tracking-tight text-slate-900 md:text-5xl">
              <span className="gradient-text">{t("title")}</span>
            </h1>
            <p className="mt-4 text-lg text-slate-500">{t("subtitle")}</p>
          </div>

          <div className="grid gap-8 md:grid-cols-2">
            {/* Contact Form */}
            <ContactForm
              labels={{
                name: t("nameLabel"),
                email: t("emailLabel"),
                subject: t("subjectLabel"),
                message: t("messageLabel"),
                send: t("send"),
              }}
            />

            {/* Contact Info */}
            <div className="space-y-6 animate-fade-in-up">
              <Card>
                <CardContent className="p-6">
                  <h2 className="text-lg font-semibold text-slate-900 mb-4">{t("info")}</h2>
                  <div className="space-y-4">
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-violet-500 to-indigo-500 text-white shadow-lg">
                        ✉
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Email</p>
                        <a href="mailto:support@ugc26.com" className="text-sm text-violet-600 hover:underline">{t("emailInfo")}</a>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-emerald-500 to-teal-500 text-white shadow-lg">
                        ☎
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Phone</p>
                        <p className="text-sm text-slate-500">{t("phoneInfo")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-amber-500 to-orange-500 text-white shadow-lg">
                        ⌂
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Address</p>
                        <p className="text-sm text-slate-500">{t("addressInfo")}</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-3">
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-rose-500 to-pink-500 text-white shadow-lg">
                        ⏰
                      </div>
                      <div>
                        <p className="text-sm font-medium text-slate-900">Hours</p>
                        <p className="text-sm text-slate-500">{t("hoursInfo")}</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </main>
      <SiteFooter />
    </>
  );
}
