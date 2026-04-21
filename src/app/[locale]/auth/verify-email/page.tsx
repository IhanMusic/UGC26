interface Props {
  searchParams: Promise<{ error?: string; verified?: string }>;
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const params = await searchParams;
  const hasError = !!params.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-[#080B18] px-4">
      <div className="glass w-full max-w-md rounded-2xl p-8 text-center">
        <div className="mb-6 text-5xl">{hasError ? "X" : "Email"}</div>
        <h1 className="mb-3 text-2xl font-bold text-[#E2E8F0]">
          {hasError ? "Lien invalide ou expire" : "Verifiez votre email"}
        </h1>
        <p className="text-[#94A3B8]">
          {hasError
            ? "Ce lien de verification n'est plus valide. Connectez-vous et cliquez sur 'Renvoyer l'email'."
            : "Un email de verification a ete envoye a votre adresse. Cliquez sur le lien dans l'email pour activer votre compte."}
        </p>
        <a
          href="/en/auth/login"
          className="mt-6 inline-block rounded-xl bg-gradient-to-r from-violet-600 to-indigo-600 px-6 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90"
        >
          Retour a la connexion
        </a>
      </div>
    </div>
  );
}
