import type { AppLocale } from "@/i18n/routing";

export async function getMessages(locale: AppLocale) {
  switch (locale) {
    case "fr":
      return (await import("../../messages/fr.json")).default;
    case "en":
      return (await import("../../messages/en.json")).default;
    case "ar":
      return (await import("../../messages/ar.json")).default;
  }
}
