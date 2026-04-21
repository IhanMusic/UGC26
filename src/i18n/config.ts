import { getRequestConfig } from "next-intl/server";
import { defaultLocale, isLocale } from "@/i18n/routing";
import { getMessages } from "@/i18n/get-messages";

export default getRequestConfig(async ({ requestLocale }) => {
  const requested = (await requestLocale) ?? defaultLocale;
  const l = requested.toLowerCase();
  if (!isLocale(l)) {
    // next-intl expects an error for unknown locale
    throw new Error(`Unsupported locale: ${requested}`);
  }

  return {
    locale: l,
    messages: await getMessages(l),
  };
});
