import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="flex flex-1 flex-col items-center justify-center bg-mesh px-4 py-20 text-center">
      <div className="animate-fade-in-up">
        <div className="mb-6 text-8xl font-bold gradient-text">404</div>
        <h1 className="mb-3 text-2xl font-bold text-slate-900 dark:text-slate-100">
          Page introuvable
        </h1>
        <p className="mb-8 max-w-md text-slate-500">
          Cette page n&apos;existe pas ou a été déplacée.
        </p>
        <Button asChild size="lg">
          <Link href="/">Retour à l&apos;accueil</Link>
        </Button>
      </div>
    </main>
  );
}
