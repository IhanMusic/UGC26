import Link from "next/link";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  baseHref: string;
  existingParams?: Record<string, string>;
}

function buildHref(baseHref: string, page: number, existingParams: Record<string, string>) {
  const params = new URLSearchParams({ ...existingParams, page: String(page) });
  return `${baseHref}?${params.toString()}`;
}

export function Pagination({ page, total, limit, baseHref, existingParams = {} }: PaginationProps) {
  const totalPages = Math.ceil(total / limit);
  if (totalPages <= 1) return null;

  return (
    <div className="mt-4 flex items-center justify-between text-sm text-slate-500">
      <span>{total} résultats</span>
      <div className="flex items-center gap-1">
        {page > 1 && (
          <Link
            href={buildHref(baseHref, page - 1, existingParams)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            ← Précédent
          </Link>
        )}
        <span className="px-3 py-1.5">
          {page} / {totalPages}
        </span>
        {page < totalPages && (
          <Link
            href={buildHref(baseHref, page + 1, existingParams)}
            className="rounded-lg border border-slate-200 dark:border-slate-700 px-3 py-1.5 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
          >
            Suivant →
          </Link>
        )}
      </div>
    </div>
  );
}
