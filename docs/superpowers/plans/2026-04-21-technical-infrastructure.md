# Technical & Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Harden the platform for production: dynamic SEO metadata on key pages, sitemap.xml, robots.txt, global error boundaries, Next.js Image optimization, admin CSV export, and pagination on long lists.

**Architecture:** All changes are additive or targeted in-place improvements. The Redis rate limiting is already correctly implemented via `src/server/redis.ts` + `src/server/rate-limit.ts` (uses `ioredis`) — no changes needed there. SEO uses Next.js App Router's `generateMetadata` convention. Error boundaries use the `error.tsx` file convention.

**Tech Stack:** Next.js 15 App Router, TypeScript, Prisma, Tailwind CSS

**Note on rate limiting:** The existing `src/server/rate-limit.ts` already uses Redis via `getRedis()` → `ioredis`. It is NOT in-memory — the only requirement is that `REDIS_URL` is set in production (documented in Plan 4).

---

## File Map

| Action | File |
|--------|------|
| Create | `src/app/sitemap.ts` |
| Create | `src/app/robots.ts` |
| Create | `src/app/[locale]/error.tsx` |
| Create | `src/app/[locale]/company/error.tsx` |
| Create | `src/app/[locale]/influencer/error.tsx` |
| Create | `src/app/[locale]/admin/error.tsx` |
| Create | `src/app/[locale]/not-found.tsx` |
| Modify | Campaign detail pages (add `generateMetadata`) |
| Modify | Influencer public profile page (add `generateMetadata`) |
| Modify | `src/app/[locale]/layout.tsx` (already has static metadata — verify) |
| Modify | `src/app/[locale]/company/completions/page.tsx` (replace `<img>` with `<Image>`) |
| Modify | `next.config.ts` (add image domains) |
| Create | `src/app/api/admin/transactions/export/route.ts` |
| Modify | `src/app/[locale]/admin/transactions/page.tsx` (add CSV export button + pagination) |
| Create | `src/components/ui/pagination.tsx` |
| Modify | `src/app/[locale]/company/campaigns/page.tsx` (add pagination) |

---

### Task 1: Sitemap and robots.txt

**Files:**
- Create: `src/app/sitemap.ts`
- Create: `src/app/robots.ts`

- [ ] **Step 1: Create `src/app/sitemap.ts`**

```typescript
// src/app/sitemap.ts
import { MetadataRoute } from "next";
import { prisma } from "@/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ugc26.dz";

  const campaigns = await prisma.campaign.findMany({
    where: { status: { in: ["UPCOMING", "ONGOING"] } },
    select: { id: true, updatedAt: true },
  });

  const profiles = await prisma.user.findMany({
    where: { role: "INFLUENCER", isVerified: true, isDeleted: false, isBlocked: false },
    select: { id: true, updatedAt: true },
  });

  return [
    { url: baseUrl, lastModified: new Date(), changeFrequency: "daily", priority: 1 },
    { url: `${baseUrl}/fr`, lastModified: new Date(), changeFrequency: "daily", priority: 0.9 },
    { url: `${baseUrl}/en`, lastModified: new Date() },
    { url: `${baseUrl}/ar`, lastModified: new Date() },
    ...campaigns.map((c) => ({
      url: `${baseUrl}/fr/campaigns/${c.id}`,
      lastModified: c.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.7,
    })),
    ...profiles.map((u) => ({
      url: `${baseUrl}/fr/influencer/${u.id}`,
      lastModified: u.updatedAt,
      changeFrequency: "weekly" as const,
      priority: 0.6,
    })),
  ];
}
```

- [ ] **Step 2: Create `src/app/robots.ts`**

```typescript
// src/app/robots.ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ugc26.dz";
  return {
    rules: [
      {
        userAgent: "*",
        allow: ["/", "/fr/", "/en/", "/ar/"],
        disallow: ["/api/", "/fr/admin/", "/en/admin/", "/ar/admin/", "/fr/company/", "/en/company/", "/ar/company/", "/fr/influencer/", "/en/influencer/", "/ar/influencer/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

- [ ] **Step 3: Test sitemap in dev**

Start the dev server and visit `http://localhost:3000/sitemap.xml`. Verify it returns valid XML with URLs.

- [ ] **Step 4: Commit**

```bash
git add src/app/sitemap.ts src/app/robots.ts
git commit -m "feat: sitemap.xml and robots.txt"
```

---

### Task 2: Dynamic metadata on campaign pages

**Files:**
- Modify: Company campaign detail page
- Modify: Influencer campaign detail page

- [ ] **Step 1: Find campaign detail pages**

```bash
find "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app/[locale]" -path "*/campaigns/*/page.tsx" | head -10
```

Read each to understand current structure.

- [ ] **Step 2: Add generateMetadata to company campaign detail page**

```typescript
// Add export at the top of the component file (outside the default export):
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({
    where: { id },
    select: { title: true, description: true },
  });
  if (!campaign) return { title: "Campagne introuvable" };
  return {
    title: campaign.title,
    description: campaign.description?.slice(0, 160),
    openGraph: {
      title: campaign.title,
      description: campaign.description?.slice(0, 160),
    },
  };
}
```

Make sure `prisma` is already imported in the file (it should be).

- [ ] **Step 3: Add generateMetadata to influencer campaign detail page**

Same pattern — find the influencer campaigns/[id]/page.tsx and add the same `generateMetadata` export.

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/company/campaigns/" "src/app/[locale]/influencer/campaigns/"
git commit -m "feat: dynamic generateMetadata on campaign detail pages"
```

---

### Task 3: Dynamic metadata on influencer public profile

**Files:**
- Modify: Influencer public profile page (found in Plan 2, Task 9, Step 1)

- [ ] **Step 1: Find the public profile page**

```bash
find "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app" -name "page.tsx" | xargs grep -l "influencerProfile\|InfluencerProfile" 2>/dev/null
```

- [ ] **Step 2: Add generateMetadata**

```typescript
export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const user = await prisma.user.findUnique({
    where: { id },
    select: { firstName: true, lastName: true },
  });
  if (!user) return { title: "Profil introuvable" };
  return {
    title: `${user.firstName} ${user.lastName} — UGC26`,
    description: `Découvrez le profil de ${user.firstName} ${user.lastName} sur UGC26.`,
  };
}
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/[locale]/"
git commit -m "feat: dynamic generateMetadata on influencer public profile"
```

---

### Task 4: Error boundaries

**Files:**
- Create: `src/app/[locale]/error.tsx`
- Create: `src/app/[locale]/company/error.tsx`
- Create: `src/app/[locale]/influencer/error.tsx`
- Create: `src/app/[locale]/admin/error.tsx`
- Create: `src/app/[locale]/not-found.tsx`

- [ ] **Step 1: Create the global error page**

```tsx
// src/app/[locale]/error.tsx
"use client";

import { useEffect } from "react";

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 dark:bg-red-900/30">
        <svg className="h-8 w-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
        </svg>
      </div>
      <div>
        <h1 className="text-xl font-bold text-slate-900 dark:text-slate-100">Une erreur s&apos;est produite</h1>
        <p className="mt-1 text-sm text-slate-500">
          {process.env.NODE_ENV === "development" ? error.message : "Veuillez réessayer ou contacter le support."}
        </p>
      </div>
      <div className="flex gap-3">
        <button
          onClick={reset}
          className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-medium text-white hover:bg-violet-700"
        >
          Réessayer
        </button>
        <a
          href="/"
          className="rounded-lg border border-slate-200 dark:border-slate-700 px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800"
        >
          Retour à l&apos;accueil
        </a>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Create segment error pages**

Create `src/app/[locale]/company/error.tsx` — same content as above but with a link to `/company` instead of `/`.

Create `src/app/[locale]/influencer/error.tsx` — same, link to `/influencer`.

Create `src/app/[locale]/admin/error.tsx` — same, link to `/admin`.

- [ ] **Step 3: Create not-found page**

```tsx
// src/app/[locale]/not-found.tsx
import Link from "next/link";

export default function NotFound() {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-6 p-8 text-center">
      <div>
        <p className="text-8xl font-black text-violet-600/20">404</p>
        <h1 className="mt-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Page introuvable</h1>
        <p className="mt-1 text-slate-500">Cette page n&apos;existe pas ou a été déplacée.</p>
      </div>
      <Link
        href="/"
        className="rounded-lg bg-violet-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-violet-700"
      >
        Retour à l&apos;accueil
      </Link>
    </div>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/[locale]/error.tsx" "src/app/[locale]/company/error.tsx" "src/app/[locale]/influencer/error.tsx" "src/app/[locale]/admin/error.tsx" "src/app/[locale]/not-found.tsx"
git commit -m "feat: error boundaries and 404 page"
```

---

### Task 5: Replace img tags with Next.js Image

**Files:**
- Modify: `src/app/[locale]/company/completions/page.tsx`
- Modify: `next.config.ts`

- [ ] **Step 1: Update next.config.ts**

Read the current file:
```bash
cat /Users/macbook/Documents/Dev/UGC26/ugc26/next.config.ts
```

Add image configuration:
```typescript
/** @type {import('next').NextConfig} */
const nextConfig = {
  // ...existing config...
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "**",
      },
    ],
  },
};

export default nextConfig;
```

- [ ] **Step 2: Update completions/page.tsx**

Replace:
```tsx
// eslint-disable-next-line @next/next/no-img-element
<img src={p.completionProofUrl} alt="completion proof" className="h-56 w-full rounded-md object-cover" />
```

With:
```tsx
import Image from "next/image";

<div className="relative h-56 w-full overflow-hidden rounded-md">
  <Image
    src={p.completionProofUrl}
    alt="completion proof"
    fill
    className="object-cover"
    sizes="(max-width: 768px) 100vw, 600px"
  />
</div>
```

- [ ] **Step 3: Find other img tags**

```bash
grep -r "<img " "/Users/macbook/Documents/Dev/UGC26/ugc26/src" --include="*.tsx" -l
```

For each file found, replace `<img>` with `<Image>` from `next/image` using the same fill+relative-parent pattern for unknown dimensions, or explicit `width`/`height` props for known dimensions.

- [ ] **Step 4: Commit**

```bash
git add next.config.ts "src/app/[locale]/company/completions/page.tsx"
git commit -m "feat: replace img tags with Next.js Image component"
```

---

### Task 6: Admin CSV export

**Files:**
- Create: `src/app/api/admin/transactions/export/route.ts`
- Modify: `src/app/[locale]/admin/transactions/page.tsx`

- [ ] **Step 1: Create the export endpoint**

```bash
mkdir -p "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app/api/admin/transactions/export"
```

```typescript
// src/app/api/admin/transactions/export/route.ts
import { requireRole } from "@/server/guards";
import { prisma } from "@/server/db";

export async function GET() {
  await requireRole("ADMIN");

  const txs = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      paidBy: { select: { email: true, firstName: true, lastName: true } },
      paidTo: { select: { email: true, firstName: true, lastName: true } },
      campaign: { select: { title: true } },
    },
  });

  const header =
    "Date,Entreprise (email),Influenceur (email),Campagne,Montant base (DZD),Frais company (DZD),Frais influenceur (DZD),Net influenceur (DZD),Montant brut (DZD),Statut\n";

  const rows = txs
    .map((tx) => {
      const priceDinar = tx.grossAmountDinar - tx.platformFeeCompany;
      return [
        tx.createdAt.toISOString(),
        tx.paidBy.email,
        tx.paidTo.email,
        `"${(tx.campaign?.title ?? "").replace(/"/g, '""')}"`,
        priceDinar,
        tx.platformFeeCompany,
        tx.platformFeeInfluencer,
        tx.netAmountInfluencer,
        tx.grossAmountDinar,
        tx.status,
      ].join(",");
    })
    .join("\n");

  const csv = "\uFEFF" + header + rows; // BOM for Excel UTF-8 compatibility

  return new Response(csv, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${new Date().toISOString().slice(0, 10)}.csv"`,
    },
  });
}
```

- [ ] **Step 2: Add Export CSV button to admin transactions page**

In `src/app/[locale]/admin/transactions/page.tsx`, add a link above the filter form:

```tsx
<div className="mb-4 flex justify-end">
  <a
    href="/api/admin/transactions/export"
    className="rounded-xl border border-slate-200/60 bg-white/50 px-4 py-2 text-sm font-medium shadow-sm hover:bg-violet-50 hover:border-violet-300 hover:text-violet-700 transition-all"
  >
    Exporter CSV
  </a>
</div>
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/admin/transactions/export/" "src/app/[locale]/admin/transactions/page.tsx"
git commit -m "feat: admin CSV export for transactions"
```

---

### Task 7: Pagination component + admin transactions pagination

**Files:**
- Create: `src/components/ui/pagination.tsx`
- Modify: `src/app/[locale]/admin/transactions/page.tsx`

- [ ] **Step 1: Create `src/components/ui/pagination.tsx`**

```tsx
import Link from "next/link";

interface PaginationProps {
  page: number;
  total: number;
  limit: number;
  baseHref: string; // e.g. "/admin/transactions" — searchParams will be appended
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
```

- [ ] **Step 2: Update admin transactions page to use pagination**

In `src/app/[locale]/admin/transactions/page.tsx`:

```tsx
// Add to searchParams destructuring:
const pageStr = (sp.page as string | undefined) ?? "1";
const page = Math.max(1, parseInt(pageStr, 10));
const LIMIT = 50;

// Update the prisma query:
const [txs, totalCount] = await Promise.all([
  prisma.transaction.findMany({
    where: { /* existing where */ },
    orderBy: { createdAt: "desc" },
    skip: (page - 1) * LIMIT,
    take: LIMIT,
    include: { paidBy: true, paidTo: true, campaign: true },
  }),
  prisma.transaction.count({ where: { /* same where */ } }),
]);

// Add after the table:
import { Pagination } from "@/components/ui/pagination";

<Pagination
  page={page}
  total={totalCount}
  limit={LIMIT}
  baseHref="/admin/transactions"
  existingParams={{ ...(from ? { from } : {}), ...(to ? { to } : {}) }}
/>
```

- [ ] **Step 3: Commit**

```bash
git add src/components/ui/pagination.tsx "src/app/[locale]/admin/transactions/page.tsx"
git commit -m "feat: pagination component + admin transactions pagination"
```

---

### Task 8: TypeScript compile check

- [ ] **Step 1: Run type check**

```bash
cd /Users/macbook/Documents/Dev/UGC26/ugc26 && npx tsc --noEmit 2>&1 | head -50
```

Expected: no errors. Fix any issues found.

- [ ] **Step 2: Run build to verify no build errors**

```bash
npm run build 2>&1 | tail -30
```

Expected: successful build. Fix any errors.

- [ ] **Step 3: Commit any fixes**

```bash
git add -A
git commit -m "fix: TypeScript and build errors from technical infrastructure changes"
```
