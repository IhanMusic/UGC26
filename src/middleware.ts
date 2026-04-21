import { NextResponse, type NextFetchEvent, type NextRequest } from "next/server";
import createMiddleware from "next-intl/middleware";
import { withAuth } from "next-auth/middleware";
import type { JWT } from "next-auth/jwt";
import { locales, defaultLocale, isLocale } from "@/i18n/routing";
import { detectLocale } from "@/i18n/request-locale";

// 1) Locale routing
const intlMiddleware = createMiddleware({
  locales: [...locales],
  defaultLocale,
  localePrefix: "always",
  localeDetection: false,
});

// 2) Role guards (under locale prefix)
const authMiddleware = withAuth({
  callbacks: {
    authorized: ({ token, req }) => {
      const pathname = req.nextUrl.pathname;
      if (!token) return false;
      const role = (token as JWT).role;

      // pathname is like /fr/admin/...
      const parts = pathname.split("/").filter(Boolean);
      const maybeLocale = parts[0] ?? "";
      const rest = "/" + parts.slice(1).join("/");

      if (!isLocale(maybeLocale)) return true;

      if (rest.startsWith("/admin")) return role === "ADMIN";
      if (rest.startsWith("/company")) return role === "COMPANY";
      if (rest.startsWith("/influencer")) return role === "INFLUENCER";
      return true;
    },
  },
});

export default function middleware(req: NextRequest, event: NextFetchEvent) {
  const pathname = req.nextUrl.pathname;

  // Skip next internals and API
  if (pathname.startsWith("/api") || pathname.startsWith("/_next") || pathname.includes(".")) {
    return NextResponse.next();
  }

  // Force locale prefix always (/fr, /en, /ar)
  const parts = pathname.split("/").filter(Boolean);
  const first = parts[0] ?? "";
  const hasLocale = isLocale(first);
  if (!hasLocale) {
    const locale = detectLocale(req);
    const url = req.nextUrl.clone();
    url.pathname = `/${locale}${pathname === "/" ? "" : pathname}`;
    return NextResponse.redirect(url);
  }

  // Apply intl middleware (sets locale for next-intl)
  const intlRes = intlMiddleware(req);

  // Role guards for restricted areas
  const rest = "/" + parts.slice(1).join("/");
  if (rest.startsWith("/admin") || rest.startsWith("/company") || rest.startsWith("/influencer")) {
    const res = (
      authMiddleware as unknown as (req: NextRequest, event: NextFetchEvent) => Response | undefined
    )(req, event);
    return res ?? intlRes;
  }

  return intlRes;
}

export const config = {
  matcher: ["/((?!api|_next|.*\\..*).*)"],
};
