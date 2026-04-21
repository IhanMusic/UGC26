import type { NextRequest } from "next/server";
import { defaultLocale, isLocale, type AppLocale } from "@/i18n/routing";

export function detectLocale(req: NextRequest): AppLocale {
  // Only respect explicit user selection via cookie — ignore browser language
  const cookieLocale = req.cookies.get("NEXT_LOCALE")?.value;
  if (cookieLocale && isLocale(cookieLocale)) return cookieLocale;
  return defaultLocale;
}
