---
title: Plan 2 — UI/Design
date: 2026-04-21
status: approved
---

# Plan 2 — UI/Design

## Goal

Complete the visual layer of the platform: restore dark/light mode with ThemeProvider, implement multi-platform chip selector, build company applicants view with pre-validation filter, admin pre-validation UI, company expenses page, cookie consent banner, conversation from profile, and translate all remaining hardcoded strings.

## Architecture

All UI changes follow the existing App Router + Tailwind + shadcn/ui pattern. The frontend-design skill drives visual polish for the theme system. No new external dependencies except `next-themes` (already installed but incorrectly removed).

---

## 1. Dark/Light Mode — ThemeProvider Restoration

### Problem

`ThemeProvider` from `next-themes` was removed during a previous fix attempt. It must be restored. The previous error (script-in-body warning) was caused by wrapping `<body>` instead of `<html>`.

### Fix

**File:** `src/app/[locale]/layout.tsx`

```tsx
import { ThemeProvider } from "next-themes";

// Wrap the entire <html> content:
return (
  <html lang={l} dir={dir} className={...} suppressHydrationWarning>
    <body className="min-h-full flex flex-col">
      <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
        <AuthSessionProvider>
          <NextIntlClientProvider locale={l} messages={messages}>
            <ToastProvider>
              <ConfirmProvider>
                {children}
              </ConfirmProvider>
            </ToastProvider>
          </NextIntlClientProvider>
        </AuthSessionProvider>
      </ThemeProvider>
    </body>
  </html>
);
```

`suppressHydrationWarning` on `<html>` prevents the hydration mismatch from next-themes' class injection.

### Theme Toggle Component

**File:** `src/components/theme-toggle.tsx`

```tsx
"use client";
import { useTheme } from "next-themes";
import { Sun, Moon } from "lucide-react";

export function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <button onClick={() => setTheme(theme === "dark" ? "light" : "dark")} aria-label="Toggle theme">
      {theme === "dark" ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
    </button>
  );
}
```

Add `<ThemeToggle />` to the navbar area in `AppShell` (or in each `_nav` sidebar).

### Tailwind Dark Mode

`tailwind.config.ts` must have `darkMode: "class"`. All components already use `dark:` variants where present; the frontend-design skill will audit and fill gaps.

### Light Theme Variables

**File:** `src/app/globals.css`

Add `:root` CSS variables for light mode that complement the existing dark theme. The `glass` utility class needs a light-mode variant (subtle border + background instead of white/10 opacity).

---

## 2. Multi-Platform Chip Selector

### Registration Form Update

**File:** `src/app/[locale]/influencer/profile/page.tsx` (or the onboarding form component)

Replace the current `socialNetworks` text input with a chip multi-select component.

**File to create:** `src/components/platform-chips.tsx`

```tsx
"use client";
const PLATFORMS = ["Instagram", "TikTok", "YouTube", "Facebook", "Snapchat", "Twitter"] as const;

export function PlatformChips({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const toggle = (p: string) =>
    onChange(value.includes(p) ? value.filter((x) => x !== p) : [...value, p]);
  return (
    <div className="flex flex-wrap gap-2">
      {PLATFORMS.map((p) => (
        <button
          key={p}
          type="button"
          onClick={() => toggle(p)}
          className={`rounded-full px-3 py-1 text-sm border transition-colors
            ${value.includes(p)
              ? "bg-violet-600 border-violet-600 text-white"
              : "border-slate-300 text-slate-600 hover:border-violet-400"}`}
        >
          {p}
        </button>
      ))}
    </div>
  );
}
```

The form submission sends `socialNetworks` as a JSON array. The API endpoint (`PUT /api/influencer/profile`) must accept `String[]` and pass it to Prisma (see Plan 1).

---

## 3. Company Applicants View (Pre-Validation Filter)

**File:** `src/app/[locale]/company/campaigns/[id]/applicants/page.tsx`

This page replaces/extends the existing applicants view. It fetches only `adminPreValidated: true` applications.

Display for each applicant:
- Name, avatar, bio
- Platforms (chips, read-only)
- Follower count
- "Select" button → triggers SATIM payment initiation (Plan 1)

If there are 0 pre-validated applicants, show: "Aucun candidat validé par l'admin pour l'instant."

For applicants already selected (`CampaignParticipation` exists), show a "Sélectionné" badge instead of the button.

---

## 4. Admin Pre-Validation UI

**File:** `src/app/[locale]/admin/applications/page.tsx` (new page)

Shows all pending applications with `adminPreValidated: false`.

Columns: Campaign title, Influencer name, platforms, applied at, action.

Action button: "Pré-valider" → calls `POST /api/admin/applications/[id]/pre-validate` (Plan 1) → reloads.

Add link to this page in `getAdminNav()` with i18n key `"preValidation"`.

---

## 5. Company Expenses Page

**File:** `src/app/[locale]/company/expenses/page.tsx` (new page)

Shows all transactions where `paidById = user.id`, ordered by `createdAt desc`.

Columns:
- Date
- Campaign title
- Influencer name
- Montant de base (priceDinar)
- Frais de service (platformFeeCompany — 10%)
- Total payé (grossAmountDinar)
- Statut (badge: PENDING / PAID / FAILED)

Total row at the bottom: sum of all `grossAmountDinar` where status = PAID.

Add link to this page in `getCompanyNav()` with i18n key `"expenses"`.

---

## 6. Influencer Payments Page — Update

**File:** `src/app/[locale]/influencer/payments/page.tsx`

Update transaction display to show:
- `netAmountInfluencer` as the amount received (not the old `amountDinar`)
- Add a footnote: "Montant après déduction des frais de service (5%)"

---

## 7. Remaining Hardcoded Strings

### Admin Transactions Page

**File:** `src/app/[locale]/admin/transactions/page.tsx`

Replace English strings with `t("admin.*")` keys:
- "Filter" → `t("filter")`
- "From" → `t("from")`
- "To" → `t("to")`
- "Apply" → `t("apply")`
- "Ready to pay (manual)" → `t("readyToPay")`
- "Campaign" / "Influencer" / "Amount" / "Action" → `t("campaign")` etc.
- "Mark paid" → `t("markPaid")`
- "Nothing to pay." → `t("nothingToPay")`
- "No transactions." → `t("noTransactions")`
- "Transactions" → `t("transactions")`
- "Stripe payment UI..." note → removed (replaced by SATIM note)

### Company Completions Page

**File:** `src/app/[locale]/company/completions/page.tsx`

Replace English strings:
- "No proof uploaded." → `t("noProofUploaded")`
- "Confirm completion" → `t("confirmCompletion")`
- SATIM note → `t("satimNote")`

### Status Badges

All status badges (`PENDING`, `PAID`, `CONFIRMED`, `COMPLETED`, etc.) must use translated labels. Add keys to `messages/*.json` under `"status"` namespace:
```json
"status": {
  "PENDING": "En attente",
  "PAID": "Payé",
  "CONFIRMED": "Confirmé",
  "COMPLETED": "Terminé",
  "REJECTED": "Rejeté",
  "ACCEPTED": "Accepté",
  "IN_PROGRESS": "En cours"
}
```

---

## 8. Cookie Consent Banner

**File:** `src/components/cookie-banner.tsx`

```tsx
"use client";
import { useState, useEffect } from "react";

export function CookieBanner() {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    if (!localStorage.getItem("cookie-consent")) setVisible(true);
  }, []);
  const accept = () => { localStorage.setItem("cookie-consent", "true"); setVisible(false); };
  if (!visible) return null;
  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 p-4 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-700 flex items-center justify-between gap-4">
      <p className="text-sm text-slate-600 dark:text-slate-400">
        {/* i18n key: cookies.banner */}
        Ce site utilise des cookies pour améliorer votre expérience.
      </p>
      <button onClick={accept} className="rounded-lg bg-violet-600 px-4 py-2 text-sm text-white">
        Accepter
      </button>
    </div>
  );
}
```

Add `<CookieBanner />` at the end of `<body>` in `layout.tsx`.

---

## 9. Start Conversation from Influencer Profile

**File:** `src/app/[locale]/influencer/[id]/page.tsx` (public profile page)

Add a "Contacter" button visible to COMPANY users only (check session role client-side).

On click → calls `POST /api/conversations` with `{ participantId: influencerId }`.

The API endpoint checks if a conversation between the two users already exists; if yes, returns the existing one; if no, creates it. Then redirects to `/company/messages?conversationId=<id>`.

**File:** `src/app/api/conversations/route.ts` (new or update existing)

```ts
export async function POST(req: Request) {
  const user = await requireRole("COMPANY");
  const { participantId } = await req.json();
  
  const existing = await prisma.conversation.findFirst({
    where: {
      participants: { every: { userId: { in: [user.id, participantId] } } },
    },
  });
  
  if (existing) return NextResponse.json({ id: existing.id });
  
  const conv = await prisma.conversation.create({
    data: {
      participants: {
        createMany: { data: [{ userId: user.id }, { userId: participantId }] },
      },
    },
  });
  
  return NextResponse.json({ id: conv.id });
}
```

---

## 10. Cross-References

- `socialNetworks String[]` schema change from **Plan 1** required for chip selector
- `adminPreValidated` field from **Plan 1** required for applicants view and admin pre-validation UI
- Commission fields (`grossAmountDinar`, `netAmountInfluencer`) from **Plan 1** required for expenses + payments pages
- SATIM payment initiation from **Plan 1** triggered from company applicants "Select" button
- All new i18n keys must be added to `messages/en.json`, `messages/fr.json`, `messages/ar.json` (see **Plan 4** for email i18n)
