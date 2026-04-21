export const locales = ["fr", "en", "ar"] as const;
export type AppLocale = (typeof locales)[number];

export const defaultLocale: AppLocale = "fr";

export function isLocale(v: string): v is AppLocale {
  return (locales as readonly string[]).includes(v);
}
