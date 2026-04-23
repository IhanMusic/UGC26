import type { Metadata } from "next";
import { Geist, Geist_Mono, Syne, Space_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import { AuthSessionProvider } from "@/components/session-provider";
import { ToastProvider } from "@/components/toast";
import { ConfirmProvider } from "@/components/confirm-modal";
import { CookieBanner } from "@/components/cookie-banner";
import { NextIntlClientProvider } from "next-intl";
import { setRequestLocale } from "next-intl/server";
import { getMessages } from "@/i18n/get-messages";
import { isLocale, type AppLocale } from "@/i18n/routing";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const syne = Syne({
  variable: "--font-syne",
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
});

const spaceMono = Space_Mono({
  variable: "--font-space-mono",
  subsets: ["latin"],
  weight: ["400", "700"],
});

export const metadata: Metadata = {
  title: {
    default: "Adwaa — Le contenu. La lumière.",
    template: "%s | Adwaa",
  },
  description: "Les marques qui gagnent en 2026 ne font plus de publicité. Elles financent du contenu. Adwaa est l'endroit où ça se passe.",
  keywords: ["contenu", "créateurs", "marques", "collaboration", "content creators", "Algeria", "Algérie", "أضواء"],
  authors: [{ name: "Adwaa" }],
  openGraph: {
    type: "website",
    siteName: "Adwaa",
    title: "Adwaa — Le contenu. La lumière.",
    description: "Les meilleures pubs ne ressemblent pas à des pubs.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Adwaa — Le contenu. La lumière.",
    description: "Les meilleures pubs ne ressemblent pas à des pubs.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default async function LocaleLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}>) {
  const { locale } = await params;
  if (!isLocale(locale)) {
    // Next will render the nearest not-found
    return children;
  }
  const l = locale as AppLocale;
  setRequestLocale(l);
  const messages = await getMessages(l);
  const dir = l === "ar" ? "rtl" : "ltr";

  return (
    <html
      lang={l}
      dir={dir}
      className={`${geistSans.variable} ${geistMono.variable} ${syne.variable} ${spaceMono.variable} h-full antialiased`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          <AuthSessionProvider>
            <NextIntlClientProvider locale={l} messages={messages}>
              <ToastProvider>
                <ConfirmProvider>
                  <a href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:z-[9999] focus:bg-[var(--primary)] focus:text-[var(--foreground)] focus:px-4 focus:py-2 focus:rounded-md focus:top-2 focus:left-2">
                    Skip to content
                  </a>
                  {children}
                  <CookieBanner />
                </ConfirmProvider>
              </ToastProvider>
            </NextIntlClientProvider>
          </AuthSessionProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
