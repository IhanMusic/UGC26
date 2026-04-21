---
title: Plan 3 — Technical & Infrastructure
date: 2026-04-21
status: approved
---

# Plan 3 — Technical & Infrastructure

## Goal

Harden the platform for production: Redis-backed rate limiting, dynamic SEO metadata, sitemap, robots.txt, global error boundaries, Next.js Image optimization, CSV export for admin, and pagination on long lists.

## Architecture

All changes are additive or in-place improvements to existing files. No new external services except Redis (already in `.env`). Rate limiting uses `@upstash/ratelimit` (edge-compatible) or falls back to the existing in-memory implementation based on env.

---

## 1. Redis Rate Limiting

### Problem

Current `src/lib/rate-limit.ts` uses an in-memory Map. This resets on every server restart and doesn't work across multiple instances.

### Fix

**File:** `src/lib/rate-limit.ts` (update)

Use `@upstash/ratelimit` when `REDIS_URL` is set, fall back to in-memory otherwise:

```ts
import { Ratelimit } from "@upstash/ratelimit";
import { Redis } from "@upstash/redis";

let ratelimit: Ratelimit | null = null;

if (process.env.UPSTASH_REDIS_REST_URL && process.env.UPSTASH_REDIS_REST_TOKEN) {
  ratelimit = new Ratelimit({
    redis: Redis.fromEnv(),
    limiter: Ratelimit.slidingWindow(10, "10 s"),
    analytics: false,
  });
}

export async function rateLimit(identifier: string): Promise<{ success: boolean }> {
  if (!ratelimit) {
    // in-memory fallback (existing logic)
    return inMemoryRateLimit(identifier);
  }
  return ratelimit.limit(identifier);
}
```

**New env vars:**
```
UPSTASH_REDIS_REST_URL=
UPSTASH_REDIS_REST_TOKEN=
```

---

## 2. Dynamic SEO Metadata

### 2.1 Campaign Detail Page

**File:** `src/app/[locale]/company/campaigns/[id]/page.tsx` and `src/app/[locale]/influencer/campaigns/[id]/page.tsx`

```ts
export async function generateMetadata({ params }: { params: Promise<{ id: string; locale: string }> }) {
  const { id } = await params;
  const campaign = await prisma.campaign.findUnique({ where: { id }, select: { title: true, description: true } });
  if (!campaign) return {};
  return {
    title: campaign.title,
    description: campaign.description?.slice(0, 160),
  };
}
```

### 2.2 Influencer Public Profile

**File:** `src/app/[locale]/influencer/[id]/page.tsx`

```ts
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: id },
    include: { user: { select: { firstName: true, lastName: true } } },
  });
  if (!profile) return {};
  return {
    title: `${profile.user.firstName} ${profile.user.lastName} — UGC26`,
    description: profile.bio?.slice(0, 160),
  };
}
```

### 2.3 Static Pages

Add `export const metadata` to: home page, login, register, contact. These already have basic metadata in layout but individual pages can override with page-specific titles.

---

## 3. Sitemap & robots.txt

### 3.1 Sitemap

**File:** `src/app/sitemap.ts`

```ts
import { MetadataRoute } from "next";
import { prisma } from "@/server/db";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ugc26.dz";
  
  const campaigns = await prisma.campaign.findMany({
    where: { status: "ACTIVE" },
    select: { id: true, updatedAt: true },
  });
  
  const profiles = await prisma.influencerProfile.findMany({
    where: { user: { emailVerified: { not: null } } },
    select: { userId: true, updatedAt: true },
  });
  
  return [
    { url: baseUrl, lastModified: new Date() },
    { url: `${baseUrl}/explore`, lastModified: new Date() },
    { url: `${baseUrl}/contact`, lastModified: new Date() },
    ...campaigns.map((c) => ({ url: `${baseUrl}/campaigns/${c.id}`, lastModified: c.updatedAt })),
    ...profiles.map((p) => ({ url: `${baseUrl}/influencer/${p.userId}`, lastModified: p.updatedAt })),
  ];
}
```

### 3.2 robots.txt

**File:** `src/app/robots.ts`

```ts
import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_APP_URL ?? "https://ugc26.dz";
  return {
    rules: [
      { userAgent: "*", allow: "/", disallow: ["/api/", "/admin/", "/company/", "/influencer/"] },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
```

---

## 4. Error Boundaries

### 4.1 Global Error Page

**File:** `src/app/[locale]/error.tsx`

```tsx
"use client";
export default function GlobalError({ error, reset }: { error: Error; reset: () => void }) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center gap-4 p-8 text-center">
      <h1 className="text-2xl font-bold">Une erreur s'est produite</h1>
      <p className="text-slate-500">{error.message}</p>
      <button onClick={reset} className="rounded-lg bg-violet-600 px-4 py-2 text-white">
        Réessayer
      </button>
    </div>
  );
}
```

### 4.2 Segment Error Pages

Create `error.tsx` in: `src/app/[locale]/company/`, `src/app/[locale]/influencer/`, `src/app/[locale]/admin/`

Same structure as global, with segment-specific back navigation.

### 4.3 Not Found Page

**File:** `src/app/[locale]/not-found.tsx`

Styled 404 page with a link back to home. Uses existing AppShell or a standalone layout.

---

## 5. Next.js Image Optimization

Replace all `<img>` tags with `<Image>` from `next/image` in:
- `src/app/[locale]/company/completions/page.tsx` (completion proof image)
- `src/app/[locale]/influencer/[id]/page.tsx` (avatar)
- Any other `<img>` tags found in the codebase

For user-uploaded images from unknown domains, add domains to `next.config.ts`:

```ts
images: {
  remotePatterns: [
    { protocol: "https", hostname: "**" }, // tighten before prod
  ],
},
```

---

## 6. CSV Export (Admin Transactions)

**New file:** `src/app/api/admin/transactions/export/route.ts`

```ts
export async function GET(req: Request) {
  await requireRole("ADMIN");
  const txs = await prisma.transaction.findMany({
    orderBy: { createdAt: "desc" },
    include: { paidBy: true, paidTo: true, campaign: true },
  });
  
  const header = "Date,Payé par,Payé à,Campagne,Montant brut,Frais company,Frais influenceur,Net influenceur,Statut\n";
  const rows = txs.map((t) =>
    [
      t.createdAt.toISOString(),
      t.paidBy.email,
      t.paidTo.email,
      t.campaign.title,
      t.grossAmountDinar,
      t.platformFeeCompany,
      t.platformFeeInfluencer,
      t.netAmountInfluencer,
      t.status,
    ].join(",")
  ).join("\n");
  
  return new Response(header + rows, {
    headers: {
      "Content-Type": "text/csv; charset=utf-8",
      "Content-Disposition": `attachment; filename="transactions-${Date.now()}.csv"`,
    },
  });
}
```

Add an "Export CSV" button to `src/app/[locale]/admin/transactions/page.tsx` that links to this endpoint.

---

## 7. Pagination

### Strategy

URL-based pagination via `searchParams` (`page`, `limit`). No client-side state.

### Pages to paginate:

**Admin: Transactions** (`src/app/[locale]/admin/transactions/page.tsx`)
- Default: 50 per page
- Add `page` searchParam, compute `skip = (page - 1) * limit`
- Show "Précédent / Suivant" buttons at bottom

**Company: Campaigns list** (`src/app/[locale]/company/campaigns/page.tsx`)
- Default: 20 per page

**Admin: Users list** (if exists)
- Default: 50 per page

**Reusable pagination component:** `src/components/ui/pagination.tsx`

```tsx
export function Pagination({ page, total, limit, baseUrl }: {
  page: number; total: number; limit: number; baseUrl: string;
}) {
  const pages = Math.ceil(total / limit);
  return (
    <div className="flex items-center justify-between mt-4 text-sm">
      <span className="text-slate-500">{total} résultats</span>
      <div className="flex gap-2">
        {page > 1 && <a href={`${baseUrl}?page=${page - 1}`} className="px-3 py-1 rounded border">Précédent</a>}
        <span className="px-3 py-1 text-slate-500">{page} / {pages}</span>
        {page < pages && <a href={`${baseUrl}?page=${page + 1}`} className="px-3 py-1 rounded border">Suivant</a>}
      </div>
    </div>
  );
}
```

---

## 8. Cross-References

- Redis env vars (`UPSTASH_REDIS_REST_URL`, `UPSTASH_REDIS_REST_TOKEN`) documented in **Plan 4** (`.env.example`)
- `NEXT_PUBLIC_APP_URL` used in sitemap + robots.txt documented in **Plan 4**
- Transaction fields (`grossAmountDinar`, etc.) from **Plan 1** used in CSV export
