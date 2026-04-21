import { getTranslations } from "next-intl/server";
import { Link } from "@/i18n/navigation";

interface Props {
  searchParams: Promise<{ error?: string; verified?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const t = await getTranslations("emailVerification");
  const hasError = !!params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080B18] px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <div className="mb-6 text-5xl">{hasError ? "❌" : "📧"}</div>
        <h1 className="mb-3 text-2xl font-bold text-[#E2E8F0]">
          {hasError ? t("invalidTitle") : t("verifyTitle")}
        </h1>
        <p className="text-[#94A3B8]">
          {hasError ? t("invalidDesc") : t("verifyDesc")}
        </p>
        <Link
          href="/auth/login"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          {t("backToLogin")}
        </Link>
      </div>
    </div>
  );
}
