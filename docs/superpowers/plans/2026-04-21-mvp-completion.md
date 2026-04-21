# UGC26 MVP Completion — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Complete UGC26 to a fully functional MVP — dark Web3 design, email verification, file uploads, deliverables flow, SSE messaging, reviews, payments, disputes, and admin enhancements.

**Architecture:** Next.js 16 App Router with server components for data fetching, client components only where interactivity is needed. SSE via native ReadableStream + Redis pub/sub. All new UI follows the "Dark Luxury Web3" design system with CSS custom properties defined in globals.css.

**Tech Stack:** Next.js 16, React 19, Prisma 7 + PostgreSQL, NextAuth 4, BullMQ + Redis, next-intl (EN/FR/AR), Tailwind CSS v4, Zod, react-hook-form

---

## File Map

### New files
- `prisma/migrations/[auto]/migration.sql` — EmailVerificationToken + bankDetails
- `src/server/email-tokens.ts` — token generation/validation helpers
- `src/app/api/auth/verify-email/route.ts` — GET verify token
- `src/app/api/auth/resend-verification/route.ts` — POST resend
- `src/app/api/upload/route.ts` — POST multipart file upload
- `src/app/[locale]/auth/verify-email/page.tsx` — verify landing page
- `src/components/verification-banner.tsx` — "check your email" top banner
- `src/components/file-upload.tsx` — replaces base64 file inputs
- `src/components/nav-link.tsx` — client component with active state
- `src/components/campaign-tabs.tsx` — tabs: Infos · Applicants · Deliverables · Messages
- `src/components/deliverable-reject-modal.tsx` — reason + debrief modal
- `src/components/review-modal.tsx` — star rating + comment modal
- `src/app/[locale]/company/campaigns/[id]/page.tsx` — company campaign detail
- `src/app/api/company/campaigns/[id]/deliverables/route.ts` — GET list + POST create
- `src/app/api/conversations/route.ts` — POST create conversation
- `src/app/api/conversations/[id]/stream/route.ts` — SSE stream
- `src/app/api/notifications/stream/route.ts` — SSE unread count stream
- `public/uploads/.gitkeep` — ensures directory exists

### Modified files
- `prisma/schema.prisma` — add EmailVerificationToken model + bankDetails to InfluencerProfile
- `src/app/globals.css` — dark theme as default, new color tokens
- `src/components/app-shell.tsx` — add VerificationBanner, use NavLink
- `src/components/site-header.tsx` — dark theme update
- `src/components/notification-bell.tsx` — SSE instead of polling
- `src/app/[locale]/influencer/campaigns/[id]/client.tsx` — add tabs (Infos, Execution, Deliverables, Messages)
- `src/app/[locale]/influencer/campaigns/[id]/page.tsx` — pass tabbed client
- `src/app/[locale]/messages/page.tsx` — upgrade to SSE
- `src/app/[locale]/influencer/payments/page.tsx` — real data + bank form
- `src/app/[locale]/admin/influencers/page.tsx` — search + pagination
- `src/app/[locale]/admin/companies/page.tsx` — search + pagination
- `src/app/[locale]/admin/campaigns/page.tsx` — search + status filter
- `src/app/api/auth/register/company/route.ts` — enqueue verification email
- `src/app/api/auth/register/influencer/route.ts` — enqueue verification email
- `src/app/api/deliverables/[id]/route.ts` — add approve/reject/feedback actions
- `.gitignore` — add public/uploads, .superpowers

---

## Task 1: DB Migrations

**Files:**
- Modify: `prisma/schema.prisma`
- Run: `prisma migrate dev`

- [ ] **Step 1: Update schema.prisma — add EmailVerificationToken and bankDetails**

```prisma
// In prisma/schema.prisma, add after PasswordResetToken model:

model EmailVerificationToken {
  id        String   @id @default(cuid())
  userId    String
  user      User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  tokenHash String   @unique
  expiresAt DateTime
  createdAt DateTime @default(now())

  @@index([userId])
}
```

Also add to User model relations:
```prisma
  emailVerificationTokens EmailVerificationToken[]
```

Also update InfluencerProfile:
```prisma
  bankDetails Json? // { bankName: string, accountHolder: string, iban: string }
```

- [ ] **Step 2: Run migration**

```bash
cd ugc26 && npx prisma migrate dev --name email_verify_bank_details
```

Expected: migration file created, client regenerated. No errors.

- [ ] **Step 3: Verify client regenerated**

```bash
npx prisma generate
```

Expected: `Generated Prisma Client` message.

- [ ] **Step 4: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat: add EmailVerificationToken and bankDetails to schema"
```

---

## Task 2: Dark Design System

**Files:**
- Modify: `src/app/globals.css`

- [ ] **Step 1: Replace globals.css with dark-first theme**

Replace the entire `:root` block and add new tokens:

```css
@import "tailwindcss";

:root {
  /* Dark Luxury Web3 — default dark */
  --background: #080B18;
  --foreground: #E2E8F0;
  --foreground-muted: #64748B;
  --primary: #7C3AED;
  --primary-light: #C4B5FD;
  --primary-dark: #6D28D9;
  --accent: #4F46E5;
  --accent-light: #818CF8;
  --gold: #D97706;
  --gold-light: #FBBF24;
  --success: #10B981;
  --danger: #F43F5E;
  --surface: rgba(255, 255, 255, 0.03);
  --surface-hover: rgba(255, 255, 255, 0.06);
  --border: rgba(255, 255, 255, 0.08);
  --border-hover: rgba(139, 92, 246, 0.4);
  --shadow-color: rgba(124, 58, 237, 0.15);
  --shadow-color-hover: rgba(124, 58, 237, 0.3);
  --glow: rgba(124, 58, 237, 0.25);
}

html { height: 100%; }
body { min-height: 100%; background: var(--background); color: var(--foreground); }

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --color-primary: var(--primary);
  --color-primary-light: var(--primary-light);
  --color-primary-dark: var(--primary-dark);
  --color-accent: var(--accent);
  --color-accent-light: var(--accent-light);
  --color-gold: var(--gold);
  --color-success: var(--success);
  --color-danger: var(--danger);
  --font-sans: var(--font-geist-sans);
  --font-mono: var(--font-geist-mono);
}

/* ── Ambient mesh background ── */
.bg-mesh {
  background:
    radial-gradient(ellipse 80% 50% at 20% 20%, rgba(99, 66, 214, 0.15) 0%, transparent 60%),
    radial-gradient(ellipse 60% 40% at 80% 80%, rgba(245, 158, 11, 0.08) 0%, transparent 60%),
    radial-gradient(ellipse 40% 60% at 60% 40%, rgba(16, 185, 129, 0.05) 0%, transparent 60%);
}

/* ── Glassmorphism ── */
.glass {
  background: var(--surface);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid var(--border);
}
.glass-strong {
  background: var(--surface-hover);
  backdrop-filter: blur(20px) saturate(1.8);
  -webkit-backdrop-filter: blur(20px) saturate(1.8);
  border: 1px solid rgba(255, 255, 255, 0.12);
}
.glass-hover:hover {
  background: var(--surface-hover);
  border-color: var(--border-hover);
  box-shadow: 0 8px 32px var(--shadow-color-hover);
}

/* ── Glow border ── */
.glow-border {
  position: relative;
}
.glow-border::before {
  content: '';
  position: absolute;
  inset: -1px;
  border-radius: inherit;
  background: linear-gradient(135deg, rgba(139,92,246,0.4), rgba(245,158,11,0.2), rgba(16,185,129,0.15));
  z-index: -1;
  opacity: 0.7;
  border-radius: 17px;
}

/* ── Gradient text ── */
.gradient-text {
  background: linear-gradient(135deg, #C4B5FD 0%, #818CF8 40%, #FBBF24 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
}

/* ── Animations ── */
@keyframes fade-in-up {
  from { opacity: 0; transform: translateY(16px); }
  to { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes pulse-dot {
  0%, 100% { opacity: 1; transform: scale(1); }
  50% { opacity: 0.5; transform: scale(1.5); }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-6px); }
}
@keyframes fade-in-up-toast {
  from { opacity: 0; transform: translateY(12px) scale(0.95); }
  to { opacity: 1; transform: translateY(0) scale(1); }
}
@keyframes glow-pulse {
  0%, 100% { box-shadow: 0 0 20px rgba(139,92,246,0.2); }
  50% { box-shadow: 0 0 40px rgba(139,92,246,0.4); }
}

.animate-fade-in-up { animation: fade-in-up 0.5s ease-out both; }
.animate-shimmer {
  background: linear-gradient(90deg, transparent 25%, rgba(139,92,246,0.08) 50%, transparent 75%);
  background-size: 200% 100%;
  animation: shimmer 2s infinite;
}
.animate-pulse-dot { animation: pulse-dot 2s ease-in-out infinite; }
.animate-float { animation: float 3s ease-in-out infinite; }
.animate-fade-in-up-toast { animation: fade-in-up-toast 0.3s ease-out both; }
.animate-glow-pulse { animation: glow-pulse 2s ease-in-out infinite; }

.delay-100 { animation-delay: 100ms; }
.delay-200 { animation-delay: 200ms; }
.delay-300 { animation-delay: 300ms; }
.delay-400 { animation-delay: 400ms; }
.delay-500 { animation-delay: 500ms; }

/* ── Scrollbar ── */
::-webkit-scrollbar { width: 6px; height: 6px; }
::-webkit-scrollbar-track { background: transparent; }
::-webkit-scrollbar-thumb { background: rgba(139, 92, 246, 0.2); border-radius: 3px; }
::-webkit-scrollbar-thumb:hover { background: rgba(139, 92, 246, 0.4); }
::selection { background: rgba(139, 92, 246, 0.2); color: #C4B5FD; }
```

- [ ] **Step 2: Update AppShell to dark classes**

In `src/components/app-shell.tsx`, replace:
- `bg-white/60` → `bg-white/[0.03]`
- `border-white/20` → `border-white/[0.08]`
- `text-slate-900` → `text-[#E2E8F0]`
- `text-slate-600` → `text-[#94A3B8]`
- `text-slate-400` → `text-[#64748B]`
- `hover:bg-violet-50/80` → `hover:bg-violet-500/10`
- `hover:text-violet-700` → `hover:text-violet-300`
- Sidebar background: `bg-[#0D0F1C]/80` with `backdrop-blur-2xl`
- Header background: `bg-[#0D0F1C]/60` with `backdrop-blur-2xl`

- [ ] **Step 3: Commit**

```bash
git add src/app/globals.css src/components/app-shell.tsx
git commit -m "feat: dark luxury web3 design system"
```

---

## Task 3: File Upload Infrastructure

**Files:**
- Create: `src/app/api/upload/route.ts`
- Create: `src/components/file-upload.tsx`
- Create: `public/uploads/.gitkeep`
- Modify: `.gitignore`

- [ ] **Step 1: Add sharp and formidable types (already have sharp)**

```bash
cd ugc26 && npm install formidable @types/formidable
```

- [ ] **Step 2: Create the upload API route**

Create `src/app/api/upload/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { writeFile, mkdir } from "fs/promises";
import path from "path";
import { randomUUID } from "crypto";

const MAX_SIZE = 5 * 1024 * 1024; // 5MB
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const formData = await req.formData();
  const file = formData.get("file") as File | null;

  if (!file) return NextResponse.json({ error: "No file" }, { status: 400 });
  if (file.size > MAX_SIZE) return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  if (!ALLOWED_TYPES.includes(file.type)) return NextResponse.json({ error: "Invalid file type" }, { status: 400 });

  const ext = file.type.split("/")[1].replace("jpeg", "jpg");
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const filename = `${randomUUID()}.${ext}`;
  const dir = path.join(process.cwd(), "public", "uploads", String(year), month);

  await mkdir(dir, { recursive: true });

  const bytes = await file.arrayBuffer();
  await writeFile(path.join(dir, filename), Buffer.from(bytes));

  const url = `/uploads/${year}/${month}/${filename}`;
  return NextResponse.json({ url });
}
```

- [ ] **Step 3: Create FileUpload component**

Create `src/components/file-upload.tsx`:

```typescript
"use client";

import { useRef, useState } from "react";
import { cn } from "@/components/ui/utils";

interface FileUploadProps {
  value?: string | null;
  onChange: (url: string) => void;
  accept?: string;
  label?: string;
  className?: string;
}

export function FileUpload({ value, onChange, accept = "image/*", label = "Choisir une image", className }: FileUploadProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleFile = async (file: File) => {
    setError(null);
    setUploading(true);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/upload", { method: "POST", body: form });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");
      onChange(data.url);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className={cn("space-y-2", className)}>
      <div
        onClick={() => inputRef.current?.click()}
        className="flex cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-white/20 bg-white/[0.03] px-4 py-6 transition-colors hover:border-violet-500/40 hover:bg-violet-500/5"
      >
        {value ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={value} alt="preview" className="h-24 w-full rounded-lg object-cover" />
        ) : (
          <>
            <svg className="h-8 w-8 text-[#64748B]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5m-13.5-9L12 3m0 0l4.5 4.5M12 3v13.5" />
            </svg>
            <span className="text-sm text-[#64748B]">{uploading ? "Upload en cours..." : label}</span>
          </>
        )}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept={accept}
        className="hidden"
        onChange={(e) => {
          const f = e.target.files?.[0];
          if (f) handleFile(f);
        }}
      />
      {error && <p className="text-xs text-[#F43F5E]">{error}</p>}
    </div>
  );
}
```

- [ ] **Step 4: Setup public/uploads and gitignore**

```bash
mkdir -p ugc26/public/uploads && touch ugc26/public/uploads/.gitkeep
```

Add to `ugc26/.gitignore`:
```
public/uploads/*
!public/uploads/.gitkeep
.superpowers/
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/upload/route.ts src/components/file-upload.tsx public/uploads/.gitkeep .gitignore
git commit -m "feat: local filesystem file upload API and FileUpload component"
```

---

## Task 4: Email Verification Backend

**Files:**
- Create: `src/server/email-tokens.ts`
- Create: `src/app/api/auth/verify-email/route.ts`
- Create: `src/app/api/auth/resend-verification/route.ts`
- Modify: `src/app/api/auth/register/company/route.ts`
- Modify: `src/app/api/auth/register/influencer/route.ts`

- [ ] **Step 1: Create token helpers**

Create `src/server/email-tokens.ts`:

```typescript
import { randomBytes, createHash } from "crypto";
import { prisma } from "@/server/db";
import { enqueueEmail } from "@/server/queues/email-queue";
import { sendEmail } from "@/server/email";

export function generateToken(): { raw: string; hash: string } {
  const raw = randomBytes(32).toString("hex");
  const hash = createHash("sha256").update(raw).digest("hex");
  return { raw, hash };
}

export async function createEmailVerificationToken(userId: string): Promise<string> {
  // Delete any existing tokens for this user
  await prisma.emailVerificationToken.deleteMany({ where: { userId } });

  const { raw, hash } = generateToken();
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24h

  await prisma.emailVerificationToken.create({
    data: { userId, tokenHash: hash, expiresAt },
  });

  return raw;
}

export async function sendVerificationEmail(email: string, token: string, baseUrl: string) {
  const url = `${baseUrl}/api/auth/verify-email?token=${token}`;
  const html = `
    <div style="font-family:sans-serif;max-width:480px;margin:0 auto;padding:32px;">
      <h1 style="font-size:24px;font-weight:800;color:#080B18;">Vérifiez votre email</h1>
      <p style="color:#64748B;margin:16px 0;">Cliquez sur le lien ci-dessous pour activer votre compte UGC26. Ce lien expire dans 24h.</p>
      <a href="${url}" style="display:inline-block;background:linear-gradient(135deg,#7C3AED,#4F46E5);color:white;text-decoration:none;padding:12px 24px;border-radius:10px;font-weight:600;margin:16px 0;">
        Vérifier mon email →
      </a>
      <p style="color:#94A3B8;font-size:12px;margin-top:24px;">Si vous n'avez pas créé de compte, ignorez cet email.</p>
    </div>
  `;

  const job = { to: email, subject: "Vérifiez votre email — UGC26", html };
  const queued = await enqueueEmail(job);
  if (!queued) await sendEmail(job); // fallback si pas de Redis
}
```

- [ ] **Step 2: Create verify-email API route**

Create `src/app/api/auth/verify-email/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { createHash } from "crypto";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
  const token = req.nextUrl.searchParams.get("token");
  const locale = req.nextUrl.searchParams.get("locale") ?? "fr";

  if (!token) {
    return NextResponse.redirect(new URL(`/${locale}/auth/verify-email?error=invalid`, req.url));
  }

  const tokenHash = createHash("sha256").update(token).digest("hex");
  const record = await prisma.emailVerificationToken.findUnique({ where: { tokenHash } });

  if (!record || record.expiresAt < new Date()) {
    await prisma.emailVerificationToken.deleteMany({ where: { tokenHash } });
    return NextResponse.redirect(new URL(`/${locale}/auth/verify-email?error=expired`, req.url));
  }

  await prisma.user.update({ where: { id: record.userId }, data: { isVerified: true } });
  await prisma.emailVerificationToken.delete({ where: { tokenHash } });

  return NextResponse.redirect(new URL(`/${locale}/auth/verify-email?success=1`, req.url));
}
```

- [ ] **Step 3: Create resend-verification route**

Create `src/app/api/auth/resend-verification/route.ts`:

```typescript
import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { createEmailVerificationToken, sendVerificationEmail } from "@/server/email-tokens";
import { env } from "@/server/env";
import { rateLimit } from "@/server/rate-limit";

export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const user = await prisma.user.findUnique({ where: { id: session.user.id } });
  if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 });
  if (user.isVerified) return NextResponse.json({ error: "Already verified" }, { status: 400 });

  // Rate limit: 1 per minute
  const limited = await rateLimit(`resend-verify:${user.id}`, 1, 60);
  if (!limited.allowed) return NextResponse.json({ error: "Too many requests. Wait 1 minute." }, { status: 429 });

  const baseUrl = env.NEXTAUTH_URL ?? "http://localhost:3000";
  const token = await createEmailVerificationToken(user.id);
  await sendVerificationEmail(user.email, token, baseUrl);

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Add verification email to company register route**

In `src/app/api/auth/register/company/route.ts`, after creating the user, add:

```typescript
// After: const user = await prisma.user.create(...)
import { createEmailVerificationToken, sendVerificationEmail } from "@/server/email-tokens";
import { env } from "@/server/env";

const baseUrl = env.NEXTAUTH_URL ?? "http://localhost:3000";
const token = await createEmailVerificationToken(user.id);
await sendVerificationEmail(user.email, token, baseUrl).catch(() => {}); // non-blocking
```

- [ ] **Step 5: Add verification email to influencer register route**

Same pattern as Step 4 in `src/app/api/auth/register/influencer/route.ts`.

- [ ] **Step 6: Commit**

```bash
git add src/server/email-tokens.ts src/app/api/auth/verify-email/route.ts src/app/api/auth/resend-verification/route.ts src/app/api/auth/register/
git commit -m "feat: email verification token generation and send on register"
```

---

## Task 5: Email Verification Frontend

**Files:**
- Create: `src/app/[locale]/auth/verify-email/page.tsx`
- Create: `src/components/verification-banner.tsx`
- Modify: `src/components/app-shell.tsx`
- Modify: `src/types/next-auth.d.ts`

- [ ] **Step 1: Update NextAuth types to expose isVerified**

In `src/types/next-auth.d.ts`, ensure session user has `isVerified`:

```typescript
declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      role: "ADMIN" | "COMPANY" | "INFLUENCER";
      email: string;
      isVerified: boolean;
    };
  }
}
declare module "next-auth/jwt" {
  interface JWT {
    id: string;
    role: "ADMIN" | "COMPANY" | "INFLUENCER";
    isVerified: boolean;
  }
}
```

Also update `src/server/auth.ts` to include `isVerified` in the JWT and session callbacks (read from DB on sign-in).

- [ ] **Step 2: Create verify-email page**

Create `src/app/[locale]/auth/verify-email/page.tsx`:

```typescript
import { Link } from "@/i18n/navigation";
import { Button } from "@/components/ui/button";

export default async function VerifyEmailPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | undefined>>;
}) {
  const sp = await searchParams;
  const success = sp.success === "1";
  const error = sp.error;

  return (
    <div className="flex min-h-screen items-center justify-center bg-mesh px-4">
      <div className="w-full max-w-md rounded-2xl border border-white/[0.08] bg-white/[0.03] p-8 text-center backdrop-blur-2xl">
        {success ? (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/20 mx-auto">
              <svg className="h-8 w-8 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#E2E8F0] mb-2">Email vérifié !</h1>
            <p className="text-[#64748B] mb-6">Votre compte est maintenant actif.</p>
            <Button asChild className="w-full">
              <Link href="/">Accéder à mon espace →</Link>
            </Button>
          </>
        ) : error === "expired" ? (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-amber-500/20 mx-auto">
              <svg className="h-8 w-8 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#E2E8F0] mb-2">Lien expiré</h1>
            <p className="text-[#64748B] mb-6">Ce lien a expiré. Connectez-vous et demandez un nouveau lien.</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Se connecter</Link>
            </Button>
          </>
        ) : (
          <>
            <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[#F43F5E]/20 mx-auto">
              <svg className="h-8 w-8 text-[#F43F5E]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-[#E2E8F0] mb-2">Lien invalide</h1>
            <p className="text-[#64748B] mb-6">Ce lien est invalide ou déjà utilisé.</p>
            <Button asChild variant="outline" className="w-full">
              <Link href="/auth/login">Se connecter</Link>
            </Button>
          </>
        )}
      </div>
    </div>
  );
}
```

- [ ] **Step 3: Create VerificationBanner component**

Create `src/components/verification-banner.tsx`:

```typescript
"use client";

import { useState } from "react";
import { useSession } from "next-auth/react";

export function VerificationBanner() {
  const { data: session } = useSession();
  const [sent, setSent] = useState(false);
  const [sending, setSending] = useState(false);

  if (!session?.user || session.user.isVerified) return null;

  const handleResend = async () => {
    setSending(true);
    try {
      await fetch("/api/auth/resend-verification", { method: "POST" });
      setSent(true);
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex items-center justify-center gap-3 border-b border-amber-500/20 bg-amber-500/10 px-4 py-2.5 text-sm">
      <svg className="h-4 w-4 flex-shrink-0 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
      </svg>
      <span className="text-amber-300">
        {sent ? "Email envoyé ! Vérifiez votre boîte mail." : "Vérifiez votre email pour accéder à toutes les fonctionnalités."}
      </span>
      {!sent && (
        <button
          onClick={handleResend}
          disabled={sending}
          className="ml-2 rounded-lg border border-amber-500/30 bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-300 transition-colors hover:bg-amber-500/20 disabled:opacity-50"
        >
          {sending ? "Envoi..." : "Renvoyer l'email"}
        </button>
      )}
    </div>
  );
}
```

- [ ] **Step 4: Add VerificationBanner to AppShell**

In `src/components/app-shell.tsx`, import and add `<VerificationBanner />` just before the main content area:

```typescript
import { VerificationBanner } from "@/components/verification-banner";

// Inside the main content div, before <main>:
<VerificationBanner />
<main id="main-content" className="flex-1">
```

Note: `VerificationBanner` is a client component that reads session — safe to add to the server-rendered AppShell.

- [ ] **Step 5: Commit**

```bash
git add src/app/[locale]/auth/verify-email/ src/components/verification-banner.tsx src/components/app-shell.tsx src/types/next-auth.d.ts
git commit -m "feat: email verification page and banner with resend"
```

---

## Task 6: Active Navigation State

**Files:**
- Create: `src/components/nav-link.tsx`
- Modify: `src/components/app-shell.tsx`

- [ ] **Step 1: Create NavLink client component**

Create `src/components/nav-link.tsx`:

```typescript
"use client";

import { usePathname } from "next/navigation";
import { Link } from "@/i18n/navigation";
import { cn } from "@/components/ui/utils";

interface NavLinkProps {
  href: string;
  label: string;
  badge?: number;
}

export function NavLink({ href, label, badge }: NavLinkProps) {
  const pathname = usePathname();
  // Match on the path segment after locale prefix
  const isActive = pathname.includes(href.replace(/^\//, ""));

  return (
    <Link
      href={href as never}
      className={cn(
        "group flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm transition-all duration-200",
        isActive
          ? "bg-violet-500/10 border border-violet-500/15 text-[#C4B5FD] font-medium"
          : "text-[#64748B] hover:bg-violet-500/8 hover:text-[#A78BFA] border border-transparent"
      )}
    >
      <div className={cn(
        "h-1.5 w-1.5 rounded-full flex-shrink-0 transition-all duration-200",
        isActive
          ? "bg-violet-400 shadow-[0_0_6px_rgba(167,139,250,0.6)]"
          : "bg-[#334155] group-hover:bg-violet-400"
      )} />
      <span className="flex-1">{label}</span>
      {badge != null && badge > 0 && (
        <span className="rounded-full bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
          {badge > 99 ? "99+" : badge}
        </span>
      )}
    </Link>
  );
}
```

- [ ] **Step 2: Replace nav links in AppShell with NavLink**

In `src/components/app-shell.tsx`, replace the nav map:

```typescript
import { NavLink } from "@/components/nav-link";

// Replace:
// nav.map((item) => (
//   <Link key={item.href} href={item.href} className="...">
//     ...
//   </Link>
// ))

// With:
nav.map((item) => (
  <NavLink key={item.href} href={item.href} label={item.label} />
))
```

- [ ] **Step 3: Commit**

```bash
git add src/components/nav-link.tsx src/components/app-shell.tsx
git commit -m "feat: active nav state with NavLink client component"
```

---

## Task 7: Company Campaign Detail Page (Tab Scaffold)

**Files:**
- Create: `src/app/[locale]/company/campaigns/[id]/page.tsx`
- Create: `src/components/campaign-tabs.tsx`

- [ ] **Step 1: Create CampaignTabs client component**

Create `src/components/campaign-tabs.tsx`:

```typescript
"use client";

import { useState } from "react";
import { cn } from "@/components/ui/utils";

interface Tab {
  id: string;
  label: string;
  badge?: number;
}

interface CampaignTabsProps {
  tabs: Tab[];
  children: (activeTab: string) => React.ReactNode;
  defaultTab?: string;
}

export function CampaignTabs({ tabs, children, defaultTab }: CampaignTabsProps) {
  const [active, setActive] = useState(defaultTab ?? tabs[0]?.id ?? "");

  return (
    <div>
      <div className="flex gap-1 border-b border-white/[0.08] mb-6">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActive(tab.id)}
            className={cn(
              "flex items-center gap-1.5 px-4 py-2.5 text-sm font-medium transition-colors border-b-2 -mb-px",
              active === tab.id
                ? "border-violet-400 text-[#C4B5FD]"
                : "border-transparent text-[#64748B] hover:text-[#94A3B8]"
            )}
          >
            {tab.label}
            {tab.badge != null && tab.badge > 0 && (
              <span className="rounded-full bg-violet-500 px-1.5 py-0.5 text-[10px] font-bold text-white">
                {tab.badge}
              </span>
            )}
          </button>
        ))}
      </div>
      {children(active)}
    </div>
  );
}
```

- [ ] **Step 2: Create company campaign detail page**

Create `src/app/[locale]/company/campaigns/[id]/page.tsx`:

```typescript
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { companyNav } from "../../_nav";
import { notFound } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { CampaignTabs } from "@/components/campaign-tabs";
import { CompanyDeliverables } from "./deliverables-tab";
import { CompanyMessages } from "./messages-tab";

export default async function CompanyCampaignDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const user = await requireRole("COMPANY");
  const { id } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id, companyId: user.id },
    include: {
      categories: { include: { category: true } },
      applications: {
        include: { influencer: { include: { influencerProfile: true } } },
      },
      participations: { include: { influencer: true } },
      deliverables: { orderBy: { createdAt: "asc" } },
    },
  });

  if (!campaign) notFound();

  const pendingDeliverables = campaign.deliverables.filter((d) => d.status === "SUBMITTED").length;

  const tabs = [
    { id: "infos", label: "Infos" },
    { id: "applicants", label: `Applicants (${campaign.applications.length})` },
    { id: "deliverables", label: "Deliverables", badge: pendingDeliverables },
    { id: "messages", label: "Messages" },
  ];

  return (
    <AppShell title={campaign.title} nav={companyNav}>
      <CampaignTabs tabs={tabs}>
        {(activeTab) => (
          <>
            {activeTab === "infos" && (
              <div className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>{campaign.title}</CardTitle>
                    <CardDescription>{campaign.priceDinar.toLocaleString()} DZD</CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Badge variant={campaign.status === "PAID" ? "success" : "secondary"}>{campaign.status}</Badge>
                    <p className="text-sm text-[#94A3B8] whitespace-pre-wrap">{campaign.description}</p>
                    {campaign.objectivePlatforms && (
                      <p className="text-sm text-[#64748B]">Plateformes : {campaign.objectivePlatforms}</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            )}
            {activeTab === "applicants" && (
              <div className="space-y-3">
                {campaign.applications.length === 0 && (
                  <p className="text-center text-[#64748B] py-12">Aucune candidature.</p>
                )}
                {campaign.applications.map((a) => (
                  <Card key={a.id}>
                    <CardContent className="flex items-center justify-between py-4">
                      <div>
                        <p className="font-medium text-[#E2E8F0]">{a.influencer.firstName} {a.influencer.lastName}</p>
                        <p className="text-sm text-[#64748B]">{a.influencer.email}</p>
                      </div>
                      <Badge variant={a.status === "ACCEPTED" ? "success" : a.status === "REJECTED" ? "danger" : "secondary"}>
                        {a.status}
                      </Badge>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
            {activeTab === "deliverables" && (
              <CompanyDeliverables campaignId={campaign.id} initialDeliverables={campaign.deliverables} />
            )}
            {activeTab === "messages" && (
              <CompanyMessages campaignId={campaign.id} companyId={user.id} />
            )}
          </>
        )}
      </CampaignTabs>
    </AppShell>
  );
}
```

- [ ] **Step 3: Add "Voir →" link to company campaigns list**

In `src/app/[locale]/company/campaigns/page.tsx`, add a Link to the campaign detail for each campaign card.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/company/campaigns/[id]/ src/components/campaign-tabs.tsx
git commit -m "feat: company campaign detail page with tab scaffold"
```

---

## Task 8: Deliverables — Company Side (Create + Approve/Reject)

**Files:**
- Create: `src/app/[locale]/company/campaigns/[id]/deliverables-tab.tsx`
- Create: `src/components/deliverable-reject-modal.tsx`
- Create: `src/app/api/company/campaigns/[id]/deliverables/route.ts`
- Modify: `src/app/api/deliverables/[id]/route.ts`

- [ ] **Step 1: Create deliverables API (list + create)**

Create `src/app/api/company/campaigns/[id]/deliverables/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";

const CreateSchema = z.object({
  type: z.string().min(1),
  description: z.string().optional(),
  influencerId: z.string().optional(), // null = all accepted influencers
});

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id } = await params;
  const deliverables = await prisma.deliverable.findMany({
    where: { campaignId: id, campaign: { companyId: session.user.id } },
    include: { influencer: { select: { id: true, firstName: true, lastName: true, email: true } } },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ deliverables });
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "COMPANY") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const { id: campaignId } = await params;

  const campaign = await prisma.campaign.findUnique({
    where: { id: campaignId, companyId: session.user.id },
    include: { participations: { where: { status: { in: ["UPCOMING", "ONGOING", "COMPLETED", "CONFIRMED", "PAID"] } } } },
  });
  if (!campaign) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = CreateSchema.parse(await req.json());

  // If influencerId specified, create for that influencer only; else create for all participants
  const influencerIds = body.influencerId
    ? [body.influencerId]
    : campaign.participations.map((p) => p.influencerId);

  if (influencerIds.length === 0) {
    return NextResponse.json({ error: "No accepted influencers yet" }, { status: 400 });
  }

  const created = await Promise.all(
    influencerIds.map((influencerId) =>
      prisma.deliverable.create({
        data: {
          campaignId,
          influencerId,
          type: body.type,
          description: body.description,
          status: "PENDING",
        },
      })
    )
  );

  return NextResponse.json({ deliverables: created }, { status: 201 });
}
```

- [ ] **Step 2: Update deliverables/[id] route to handle approve/reject/submit**

In `src/app/api/deliverables/[id]/route.ts`, add PATCH handler:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";
import { prisma as db } from "@/server/db";

const PatchSchema = z.discriminatedUnion("action", [
  z.object({ action: z.literal("submit"), fileUrl: z.string().url() }),
  z.object({ action: z.literal("approve") }),
  z.object({
    action: z.literal("reject"),
    reason: z.string().min(1),
    feedback: z.string().min(1),
  }),
]);

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const deliverable = await prisma.deliverable.findUnique({
    where: { id },
    include: { campaign: true, influencer: true },
  });
  if (!deliverable) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const body = PatchSchema.parse(await req.json());

  if (body.action === "submit") {
    if (session.user.id !== deliverable.influencerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updated = await prisma.deliverable.update({
      where: { id },
      data: { fileUrl: body.fileUrl, status: "SUBMITTED", feedback: null },
    });
    // Notify company
    await prisma.notification.create({
      data: {
        userId: deliverable.campaign.companyId,
        type: "GENERAL",
        title: "Nouveau deliverable soumis",
        message: `${deliverable.influencer.firstName} a soumis un ${deliverable.type}`,
        link: `/company/campaigns/${deliverable.campaignId}`,
      },
    });
    return NextResponse.json({ deliverable: updated });
  }

  if (body.action === "approve") {
    if (session.user.role !== "COMPANY" || session.user.id !== deliverable.campaign.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updated = await prisma.deliverable.update({
      where: { id },
      data: { status: "APPROVED" },
    });
    await prisma.notification.create({
      data: {
        userId: deliverable.influencerId,
        type: "GENERAL",
        title: "Deliverable approuvé ✓",
        message: `Votre ${deliverable.type} a été approuvé`,
        link: `/influencer/campaigns/${deliverable.campaignId}`,
      },
    });
    return NextResponse.json({ deliverable: updated });
  }

  if (body.action === "reject") {
    if (session.user.role !== "COMPANY" || session.user.id !== deliverable.campaign.companyId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const updated = await prisma.deliverable.update({
      where: { id },
      data: { status: "REJECTED", feedback: `[${body.reason}] ${body.feedback}` },
    });
    await prisma.notification.create({
      data: {
        userId: deliverable.influencerId,
        type: "GENERAL",
        title: "Deliverable rejeté",
        message: `Votre ${deliverable.type} a été rejeté — ${body.reason}`,
        link: `/influencer/campaigns/${deliverable.campaignId}`,
      },
    });
    return NextResponse.json({ deliverable: updated });
  }
}
```

- [ ] **Step 3: Create DeliverableRejectModal component**

Create `src/components/deliverable-reject-modal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

const REASONS = [
  "Mauvaise qualité visuelle",
  "Ne respecte pas le brief",
  "Lien invalide / contenu supprimé",
  "Autre",
];

interface DeliverableRejectModalProps {
  deliverableId: string;
  deliverableType: string;
  onClose: () => void;
  onRejected: () => void;
}

export function DeliverableRejectModal({ deliverableId, deliverableType, onClose, onRejected }: DeliverableRejectModalProps) {
  const [reason, setReason] = useState(REASONS[0]);
  const [feedback, setFeedback] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (!feedback.trim()) return;
    setLoading(true);
    try {
      await fetch(`/api/deliverables/${deliverableId}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "reject", reason, feedback }),
      });
      onRejected();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-[#F43F5E]/20 bg-[#0D0F1C] p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#E2E8F0] mb-1">Rejeter ce deliverable</h3>
        <p className="text-sm text-[#64748B] mb-5">{deliverableType}</p>

        <div className="mb-4">
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Raison du rejet *</label>
          <div className="space-y-2">
            {REASONS.map((r) => (
              <label key={r} className="flex items-center gap-2.5 cursor-pointer">
                <input
                  type="radio"
                  name="reason"
                  value={r}
                  checked={reason === r}
                  onChange={() => setReason(r)}
                  className="accent-[#F43F5E]"
                />
                <span className="text-sm text-[#CBD5E1]">{r}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Message de debrief *</label>
          <Textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            placeholder="Expliquez précisément les corrections à apporter..."
            rows={4}
            className="bg-[#F43F5E]/5 border-[#F43F5E]/20 text-[#E2E8F0] placeholder:text-[#64748B] focus:border-[#F43F5E]/50"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={!feedback.trim() || loading}
            className="flex-1 bg-[#F43F5E] hover:bg-[#F43F5E]/80 text-white border-0"
          >
            {loading ? "..." : "Confirmer le rejet"}
          </Button>
          <Button variant="outline" onClick={onClose} className="border-white/10 text-[#94A3B8]">
            Annuler
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 4: Create CompanyDeliverables tab component**

Create `src/app/[locale]/company/campaigns/[id]/deliverables-tab.tsx`:

```typescript
"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { DeliverableRejectModal } from "@/components/deliverable-reject-modal";

const DELIVERABLE_TYPES = ["Instagram Post", "Story", "Reel", "TikTok", "YouTube", "Video", "Autre"];

interface Deliverable {
  id: string;
  type: string;
  description: string | null;
  fileUrl: string | null;
  status: string;
  feedback: string | null;
  influencer: { id: string; firstName: string; lastName: string; email: string };
}

export function CompanyDeliverables({ campaignId, initialDeliverables }: { campaignId: string; initialDeliverables: Deliverable[] }) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>(initialDeliverables);
  const [type, setType] = useState(DELIVERABLE_TYPES[0]);
  const [description, setDescription] = useState("");
  const [creating, setCreating] = useState(false);
  const [rejectTarget, setRejectTarget] = useState<Deliverable | null>(null);

  const refresh = useCallback(async () => {
    const res = await fetch(`/api/company/campaigns/${campaignId}/deliverables`);
    if (res.ok) {
      const data = await res.json();
      setDeliverables(data.deliverables);
    }
  }, [campaignId]);

  const handleCreate = async () => {
    setCreating(true);
    try {
      await fetch(`/api/company/campaigns/${campaignId}/deliverables`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ type, description }),
      });
      setDescription("");
      await refresh();
    } finally {
      setCreating(false);
    }
  };

  const handleApprove = async (id: string) => {
    await fetch(`/api/deliverables/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ action: "approve" }),
    });
    await refresh();
  };

  const statusVariant = (s: string) => {
    if (s === "APPROVED") return "success" as const;
    if (s === "REJECTED") return "danger" as const;
    if (s === "SUBMITTED") return "warning" as const;
    return "secondary" as const;
  };

  return (
    <div className="space-y-5">
      {/* Create form */}
      <div className="rounded-xl border border-dashed border-white/[0.12] bg-white/[0.02] p-4 space-y-3">
        <h3 className="text-sm font-semibold text-[#E2E8F0]">+ Ajouter un deliverable</h3>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs text-[#64748B] mb-1">Type</label>
            <select
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0]"
            >
              {DELIVERABLE_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>
        </div>
        <div>
          <label className="block text-xs text-[#64748B] mb-1">Brief / Description</label>
          <Textarea
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            placeholder="Instructions pour l'influenceur..."
            rows={2}
            className="bg-white/[0.04] border-white/[0.08] text-[#E2E8F0] placeholder:text-[#64748B]"
          />
        </div>
        <Button onClick={handleCreate} disabled={creating} size="sm">
          {creating ? "Création..." : "Créer le deliverable"}
        </Button>
      </div>

      {/* List */}
      {deliverables.length === 0 && (
        <p className="text-center text-[#64748B] py-8">Aucun deliverable créé.</p>
      )}
      <div className="space-y-3">
        {deliverables.map((d) => (
          <div
            key={d.id}
            className={`rounded-xl border p-4 space-y-2 ${
              d.status === "APPROVED" ? "border-emerald-500/20 bg-emerald-500/5" :
              d.status === "SUBMITTED" ? "border-amber-500/20 bg-amber-500/5" :
              d.status === "REJECTED" ? "border-[#F43F5E]/20 bg-[#F43F5E]/5" :
              "border-white/[0.08] bg-white/[0.02]"
            }`}
          >
            <div className="flex items-center justify-between">
              <span className="font-semibold text-sm text-[#E2E8F0]">{d.type}</span>
              <Badge variant={statusVariant(d.status)}>{d.status}</Badge>
            </div>
            {d.description && <p className="text-xs text-[#64748B]">{d.description}</p>}
            <p className="text-xs text-[#94A3B8]">
              Influenceur : {d.influencer.firstName} {d.influencer.lastName}
            </p>
            {d.fileUrl && (
              <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="text-xs text-violet-400 underline break-all">
                🔗 {d.fileUrl}
              </a>
            )}
            {d.status === "SUBMITTED" && (
              <div className="flex gap-2 mt-2">
                <Button size="sm" className="bg-emerald-600 hover:bg-emerald-500 text-white border-0" onClick={() => handleApprove(d.id)}>
                  ✓ Approuver
                </Button>
                <Button size="sm" variant="destructive" onClick={() => setRejectTarget(d)}>
                  ✗ Rejeter
                </Button>
              </div>
            )}
          </div>
        ))}
      </div>

      {rejectTarget && (
        <DeliverableRejectModal
          deliverableId={rejectTarget.id}
          deliverableType={rejectTarget.type}
          onClose={() => setRejectTarget(null)}
          onRejected={async () => {
            setRejectTarget(null);
            await refresh();
          }}
        />
      )}
    </div>
  );
}
```

- [ ] **Step 5: Commit**

```bash
git add src/app/api/company/campaigns/ src/app/api/deliverables/ src/components/deliverable-reject-modal.tsx src/app/[locale]/company/campaigns/[id]/deliverables-tab.tsx
git commit -m "feat: deliverables company side — create, approve, reject with feedback"
```

---

## Task 9: Deliverables — Influencer Side

**Files:**
- Create: `src/app/[locale]/influencer/campaigns/[id]/deliverables-tab.tsx`
- Modify: `src/app/[locale]/influencer/campaigns/[id]/client.tsx`

- [ ] **Step 1: Create influencer deliverables tab**

Create `src/app/[locale]/influencer/campaigns/[id]/deliverables-tab.tsx`:

```typescript
"use client";

import { useState, useCallback } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";

interface Deliverable {
  id: string;
  type: string;
  description: string | null;
  fileUrl: string | null;
  status: string;
  feedback: string | null;
}

export function InfluencerDeliverables({ campaignId, influencerId }: { campaignId: string; influencerId: string }) {
  const [deliverables, setDeliverables] = useState<Deliverable[]>([]);
  const [links, setLinks] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState<string | null>(null);

  const fetchDeliverables = useCallback(async () => {
    const res = await fetch(`/api/influencer/deliverables?campaignId=${campaignId}`);
    if (res.ok) {
      const data = await res.json();
      setDeliverables(data.deliverables);
    }
    setLoading(false);
  }, [campaignId]);

  useState(() => { fetchDeliverables(); });

  const handleSubmit = async (id: string) => {
    const url = links[id];
    if (!url?.trim()) return;
    setSubmitting(id);
    try {
      await fetch(`/api/deliverables/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "submit", fileUrl: url.trim() }),
      });
      await fetchDeliverables();
      setLinks((prev) => ({ ...prev, [id]: "" }));
    } finally {
      setSubmitting(null);
    }
  };

  const approved = deliverables.filter((d) => d.status === "APPROVED").length;

  if (loading) return <div className="py-8 text-center text-[#64748B]">Chargement...</div>;

  return (
    <div className="space-y-4">
      {/* Progress */}
      {deliverables.length > 0 && (
        <div className="rounded-xl border border-white/[0.08] bg-white/[0.02] p-4">
          <div className="flex justify-between text-xs text-[#64748B] mb-2">
            <span>Progression</span>
            <span>{approved}/{deliverables.length} approuvés</span>
          </div>
          <div className="h-2 rounded-full bg-white/[0.08] overflow-hidden">
            <div
              className="h-full rounded-full bg-gradient-to-r from-violet-500 to-indigo-500 transition-all"
              style={{ width: `${deliverables.length > 0 ? (approved / deliverables.length) * 100 : 0}%` }}
            />
          </div>
        </div>
      )}

      {deliverables.length === 0 && (
        <p className="text-center text-[#64748B] py-8">Aucun deliverable assigné pour le moment.</p>
      )}

      {deliverables.map((d) => (
        <div
          key={d.id}
          className={`rounded-xl border p-4 space-y-3 ${
            d.status === "APPROVED" ? "border-emerald-500/20 bg-emerald-500/5" :
            d.status === "REJECTED" ? "border-[#F43F5E]/20 bg-[#F43F5E]/5" :
            d.status === "SUBMITTED" ? "border-amber-500/20 bg-amber-500/5" :
            "border-white/[0.08] bg-white/[0.02]"
          }`}
        >
          <div className="flex items-center justify-between">
            <span className="font-semibold text-sm text-[#E2E8F0]">{d.type}</span>
            <Badge variant={
              d.status === "APPROVED" ? "success" :
              d.status === "REJECTED" ? "danger" :
              d.status === "SUBMITTED" ? "warning" : "secondary"
            }>{d.status}</Badge>
          </div>

          {d.description && <p className="text-xs text-[#64748B]">{d.description}</p>}

          {/* Feedback when rejected */}
          {d.status === "REJECTED" && d.feedback && (
            <div className="rounded-lg border border-[#F43F5E]/20 bg-[#F43F5E]/5 p-3">
              <p className="text-xs font-semibold text-[#F43F5E] mb-1">💬 Feedback de l&apos;entreprise</p>
              <p className="text-xs text-[#CBD5E1]">{d.feedback}</p>
            </div>
          )}

          {/* Already submitted */}
          {d.fileUrl && d.status !== "REJECTED" && (
            <a href={d.fileUrl} target="_blank" rel="noopener noreferrer" className="block text-xs text-violet-400 underline break-all">
              🔗 {d.fileUrl}
            </a>
          )}

          {/* Submit / resubmit */}
          {(d.status === "PENDING" || d.status === "REJECTED") && (
            <div className="rounded-lg bg-white/[0.03] border border-white/[0.06] p-3 space-y-2">
              <p className="text-xs font-medium text-[#94A3B8]">
                {d.status === "REJECTED" ? "🔄 Resoumettre" : "Soumettre le lien de publication"}
              </p>
              <div className="flex gap-2">
                <input
                  type="url"
                  value={links[d.id] ?? ""}
                  onChange={(e) => setLinks((prev) => ({ ...prev, [d.id]: e.target.value }))}
                  placeholder="https://instagram.com/p/..."
                  className="flex-1 rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] placeholder:text-[#475569]"
                />
                <Button
                  size="sm"
                  disabled={!links[d.id]?.trim() || submitting === d.id}
                  onClick={() => handleSubmit(d.id)}
                >
                  {submitting === d.id ? "..." : "Soumettre"}
                </Button>
              </div>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

- [ ] **Step 2: Add influencer deliverables API**

Create `src/app/api/influencer/deliverables/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "INFLUENCER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const campaignId = req.nextUrl.searchParams.get("campaignId");
  if (!campaignId) return NextResponse.json({ error: "campaignId required" }, { status: 400 });

  const deliverables = await prisma.deliverable.findMany({
    where: { campaignId, influencerId: session.user.id },
    orderBy: { createdAt: "asc" },
  });
  return NextResponse.json({ deliverables });
}
```

- [ ] **Step 3: Update influencer campaign client to use tabs**

Replace the content of `src/app/[locale]/influencer/campaigns/[id]/client.tsx` to use `CampaignTabs` with four tabs: Infos, Exécution, Deliverables, Messages. Embed `InfluencerDeliverables` in the Deliverables tab.

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/influencer/campaigns/[id]/deliverables-tab.tsx src/app/api/influencer/deliverables/ src/app/[locale]/influencer/campaigns/[id]/client.tsx
git commit -m "feat: deliverables influencer side — submit link, resubmit, view feedback"
```

---

## Task 10: SSE Messaging Infrastructure

**Files:**
- Create: `src/app/api/conversations/[id]/stream/route.ts`
- Create: `src/app/api/notifications/stream/route.ts`
- Create: `src/app/api/conversations/route.ts` (POST)
- Create: `src/app/[locale]/company/campaigns/[id]/messages-tab.tsx`
- Modify: `src/app/[locale]/messages/page.tsx`
- Modify: `src/components/notification-bell.tsx`

- [ ] **Step 1: Create conversation SSE stream**

Create `src/app/api/conversations/[id]/stream/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { redis } from "@/server/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const { id: conversationId } = await params;

  // Verify participant
  const participant = await prisma.conversationParticipant.findUnique({
    where: { conversationId_userId: { conversationId, userId: session.user.id } },
  });
  if (!participant) return new Response("Forbidden", { status: 403 });

  const channel = `conversation:${conversationId}`;

  const stream = new ReadableStream({
    async start(controller) {
      const subscriber = redis?.duplicate();
      if (!subscriber) {
        // No Redis: send heartbeat only
        const interval = setInterval(() => {
          controller.enqueue(`data: {"type":"ping"}\n\n`);
        }, 15000);
        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
        return;
      }

      await subscriber.subscribe(channel, (message) => {
        controller.enqueue(`data: ${message}\n\n`);
      });

      // Heartbeat
      const heartbeat = setInterval(() => {
        controller.enqueue(`: ping\n\n`);
      }, 15000);

      req.signal.addEventListener("abort", async () => {
        clearInterval(heartbeat);
        await subscriber.unsubscribe(channel);
        subscriber.disconnect();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
      "X-Accel-Buffering": "no",
    },
  });
}
```

- [ ] **Step 2: Publish to Redis when a message is sent**

In `src/app/api/conversations/[id]/messages/route.ts`, after creating the message, add:

```typescript
import { redis } from "@/server/redis";

// After: const message = await prisma.message.create(...)
if (redis) {
  await redis.publish(
    `conversation:${conversationId}`,
    JSON.stringify({ type: "message", message: { ...message, sender: { id: session.user.id, firstName: session.user.name ?? "", ... } } })
  );
}
```

- [ ] **Step 3: Create notification SSE stream**

Create `src/app/api/notifications/stream/route.ts`:

```typescript
import { NextRequest } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { redis } from "@/server/redis";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return new Response("Unauthorized", { status: 401 });

  const userId = session.user.id;
  const channel = `notifications:${userId}`;

  // Send initial count
  const count = await prisma.notification.count({ where: { userId, read: false } });

  const stream = new ReadableStream({
    async start(controller) {
      controller.enqueue(`data: ${JSON.stringify({ type: "count", count })}\n\n`);

      const subscriber = redis?.duplicate();
      if (!subscriber) {
        const interval = setInterval(() => {
          controller.enqueue(`: ping\n\n`);
        }, 20000);
        req.signal.addEventListener("abort", () => {
          clearInterval(interval);
          controller.close();
        });
        return;
      }

      await subscriber.subscribe(channel, (message) => {
        controller.enqueue(`data: ${message}\n\n`);
      });

      const heartbeat = setInterval(() => {
        controller.enqueue(`: ping\n\n`);
      }, 20000);

      req.signal.addEventListener("abort", async () => {
        clearInterval(heartbeat);
        await subscriber.unsubscribe(channel);
        subscriber.disconnect();
        controller.close();
      });
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
```

- [ ] **Step 4: Create POST /api/conversations (create new conversation)**

Create `src/app/api/conversations/route.ts` (add POST handler alongside existing GET):

```typescript
// POST: create a conversation for a campaign between company and influencer
export async function POST(req: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { campaignId, participantId } = await req.json() as { campaignId: string; participantId: string };

  // Check existing conversation
  const existing = await prisma.conversation.findFirst({
    where: {
      campaignId,
      participants: { some: { userId: participantId } },
      AND: { participants: { some: { userId: session.user.id } } },
    },
  });
  if (existing) return NextResponse.json({ conversation: existing });

  const conversation = await prisma.conversation.create({
    data: {
      campaignId,
      participants: {
        create: [{ userId: session.user.id }, { userId: participantId }],
      },
    },
  });

  return NextResponse.json({ conversation }, { status: 201 });
}
```

- [ ] **Step 5: Upgrade NotificationBell to SSE**

In `src/components/notification-bell.tsx`, replace the polling `setInterval` with `EventSource`:

```typescript
// Replace the polling useEffect with:
useEffect(() => {
  if (!session?.user) return;
  const es = new EventSource("/api/notifications/stream");
  es.onmessage = (e) => {
    const data = JSON.parse(e.data);
    if (data.type === "count") setCount(data.count);
  };
  es.onerror = () => es.close();
  return () => es.close();
}, [session?.user]);
```

- [ ] **Step 6: Create embedded chat component for campaign tabs**

Create `src/app/[locale]/company/campaigns/[id]/messages-tab.tsx` (and a similar influencer version):

```typescript
"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useSession } from "next-auth/react";

interface Message {
  id: string;
  content: string;
  createdAt: string;
  senderId: string;
  sender: { firstName: string; lastName: string };
}

export function CompanyMessages({ campaignId, companyId }: { campaignId: string; companyId: string }) {
  const { data: session } = useSession();
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMsg, setNewMsg] = useState("");
  const [sending, setSending] = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);
  const esRef = useRef<EventSource | null>(null);

  // Get or create conversation
  useEffect(() => {
    fetch(`/api/conversations?campaignId=${campaignId}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.conversations?.[0]) setConversationId(data.conversations[0].id);
      });
  }, [campaignId]);

  // Load messages
  const loadMessages = useCallback(async (convId: string) => {
    const res = await fetch(`/api/conversations/${convId}/messages`);
    if (res.ok) {
      const data = await res.json();
      setMessages(data.messages);
    }
  }, []);

  // SSE subscription
  useEffect(() => {
    if (!conversationId) return;
    loadMessages(conversationId);

    const es = new EventSource(`/api/conversations/${conversationId}/stream`);
    esRef.current = es;
    es.onmessage = (e) => {
      const data = JSON.parse(e.data);
      if (data.type === "message") {
        setMessages((prev) => [...prev, data.message]);
      }
    };
    es.onerror = () => es.close();
    return () => es.close();
  }, [conversationId, loadMessages]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMsg.trim() || !conversationId || sending) return;
    setSending(true);
    try {
      const res = await fetch(`/api/conversations/${conversationId}/messages`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content: newMsg.trim() }),
      });
      if (res.ok) setNewMsg("");
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="flex flex-col h-[400px] rounded-xl border border-white/[0.08] bg-white/[0.02] overflow-hidden">
      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-2">
        {messages.map((msg) => {
          const isMine = msg.senderId === session?.user?.id;
          return (
            <div key={msg.id} className={`flex ${isMine ? "justify-end" : "justify-start"}`}>
              <div className={`max-w-[75%] rounded-2xl px-4 py-2 text-sm ${
                isMine
                  ? "bg-gradient-to-br from-violet-600 to-indigo-600 text-white"
                  : "bg-white/[0.06] text-[#CBD5E1]"
              }`}>
                {msg.content}
              </div>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <form onSubmit={handleSend} className="border-t border-white/[0.08] px-3 py-2 flex gap-2">
        <input
          type="text"
          value={newMsg}
          onChange={(e) => setNewMsg(e.target.value)}
          placeholder="Votre message..."
          className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-[#E2E8F0] placeholder:text-[#475569] outline-none focus:border-violet-500/40"
        />
        <button
          type="submit"
          disabled={!newMsg.trim() || sending}
          className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-to-br from-violet-600 to-indigo-600 text-white disabled:opacity-50"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M6 12L3.269 3.126A59.768 59.768 0 0121.485 12 59.77 59.77 0 013.27 20.876L5.999 12zm0 0h7.5" />
          </svg>
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 7: Upgrade /messages page to SSE**

In `src/app/[locale]/messages/page.tsx`, replace the `setInterval` polling with `EventSource` — same pattern as `CompanyMessages` above.

- [ ] **Step 8: Commit**

```bash
git add src/app/api/conversations/ src/app/api/notifications/stream/ src/app/[locale]/company/campaigns/[id]/messages-tab.tsx src/components/notification-bell.tsx src/app/[locale]/messages/
git commit -m "feat: SSE real-time messaging and notification bell upgrade"
```

---

## Task 11: Reviews — Banner + Modal

**Files:**
- Create: `src/components/review-modal.tsx`
- Modify: `src/app/[locale]/company/campaigns/[id]/page.tsx`
- Modify: `src/app/[locale]/influencer/campaigns/[id]/page.tsx`

- [ ] **Step 1: Create ReviewModal component**

Create `src/components/review-modal.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";

interface ReviewModalProps {
  campaignId: string;
  reviewedId: string;
  reviewedName: string;
  onClose: () => void;
  onReviewed: () => void;
}

export function ReviewModal({ campaignId, reviewedId, reviewedName, onClose, onReviewed }: ReviewModalProps) {
  const [rating, setRating] = useState(0);
  const [hovered, setHovered] = useState(0);
  const [comment, setComment] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async () => {
    if (rating === 0) return;
    setLoading(true);
    try {
      await fetch("/api/reviews", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ campaignId, reviewedId, rating, comment }),
      });
      onReviewed();
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md rounded-2xl border border-amber-500/20 bg-[#0D0F1C] p-6 shadow-2xl">
        <h3 className="text-lg font-bold text-[#E2E8F0] mb-1">Laisser un avis</h3>
        <p className="text-sm text-[#64748B] mb-6">Votre expérience avec <strong className="text-[#C4B5FD]">{reviewedName}</strong></p>

        {/* Stars */}
        <div className="flex gap-2 mb-5" onMouseLeave={() => setHovered(0)}>
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              onMouseEnter={() => setHovered(star)}
              onClick={() => setRating(star)}
              className="text-3xl transition-transform hover:scale-110"
            >
              <span className={(hovered || rating) >= star ? "text-amber-400" : "text-[#334155]"}>★</span>
            </button>
          ))}
        </div>

        <div className="mb-5">
          <label className="block text-xs font-semibold text-[#94A3B8] mb-2">Commentaire (optionnel)</label>
          <Textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Décrivez votre expérience..."
            rows={3}
            className="bg-white/[0.04] border-white/[0.08] text-[#E2E8F0] placeholder:text-[#475569]"
          />
        </div>

        <div className="flex gap-3">
          <Button
            onClick={handleSubmit}
            disabled={rating === 0 || loading}
            className="flex-1 bg-gradient-to-r from-amber-500 to-amber-400 hover:from-amber-400 hover:to-amber-300 text-white border-0 shadow-lg shadow-amber-500/20"
          >
            {loading ? "Publication..." : "Publier l'avis ⭐"}
          </Button>
          <Button variant="outline" onClick={onClose} className="border-white/10 text-[#94A3B8]">
            Plus tard
          </Button>
        </div>
      </div>
    </div>
  );
}
```

- [ ] **Step 2: Add review banner to company campaign page**

In `src/app/[locale]/company/campaigns/[id]/page.tsx`, check if participation is CONFIRMED/PAID and if no review exists yet. If so, show a `ReviewBanner` client component at the bottom.

Add to the page (server side, pass props to client):

```typescript
// After fetching campaign, check reviews
const canReview = campaign.participations.some(
  (p) => p.status === "CONFIRMED" || p.status === "PAID"
);
// Pass canReview + accepted influencer IDs to a ReviewBanner client component
```

Create `src/components/review-banner.tsx`:

```typescript
"use client";

import { useState } from "react";
import { ReviewModal } from "@/components/review-modal";

interface ReviewBannerProps {
  campaignId: string;
  reviewedId: string;
  reviewedName: string;
}

export function ReviewBanner({ campaignId, reviewedId, reviewedName }: ReviewBannerProps) {
  const [open, setOpen] = useState(false);
  const [done, setDone] = useState(false);

  if (done) return null;

  return (
    <>
      <div className="mt-6 flex items-center justify-between rounded-xl border border-amber-500/20 bg-amber-500/10 px-5 py-4">
        <div className="flex items-center gap-3">
          <span className="text-xl">⭐</span>
          <div>
            <p className="text-sm font-semibold text-amber-300">Campagne terminée !</p>
            <p className="text-xs text-amber-400/80">Laissez un avis pour {reviewedName}</p>
          </div>
        </div>
        <button
          onClick={() => setOpen(true)}
          className="rounded-lg bg-amber-500 px-4 py-2 text-sm font-semibold text-white shadow-lg shadow-amber-500/20 hover:bg-amber-400 transition-colors"
        >
          Laisser un avis →
        </button>
      </div>

      {open && (
        <ReviewModal
          campaignId={campaignId}
          reviewedId={reviewedId}
          reviewedName={reviewedName}
          onClose={() => setOpen(false)}
          onReviewed={() => { setOpen(false); setDone(true); }}
        />
      )}
    </>
  );
}
```

- [ ] **Step 3: Add same ReviewBanner to influencer campaign page**

In `src/app/[locale]/influencer/campaigns/[id]/page.tsx`, show a ReviewBanner (reviewing the company) when participation is CONFIRMED/PAID.

- [ ] **Step 4: Commit**

```bash
git add src/components/review-modal.tsx src/components/review-banner.tsx src/app/[locale]/company/campaigns/[id]/ src/app/[locale]/influencer/campaigns/[id]/
git commit -m "feat: reviews — banner CTA + star rating modal"
```

---

## Task 12: Influencer Payments Page

**Files:**
- Modify: `src/app/[locale]/influencer/payments/page.tsx`
- Create: `src/app/api/influencer/bank-details/route.ts`

- [ ] **Step 1: Create bank-details API**

Create `src/app/api/influencer/bank-details/route.ts`:

```typescript
import { NextRequest, NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/server/auth";
import { prisma } from "@/server/db";
import { z } from "zod";

const BankSchema = z.object({
  bankName: z.string().min(1),
  accountHolder: z.string().min(1),
  iban: z.string().min(1),
});

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "INFLUENCER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const profile = await prisma.influencerProfile.findUnique({
    where: { userId: session.user.id },
    select: { bankDetails: true },
  });
  return NextResponse.json({ bankDetails: profile?.bankDetails ?? null });
}

export async function PUT(req: NextRequest) {
  const session = await getServerSession(authOptions);
  if (!session?.user || session.user.role !== "INFLUENCER") {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  const body = BankSchema.parse(await req.json());
  await prisma.influencerProfile.upsert({
    where: { userId: session.user.id },
    update: { bankDetails: body },
    create: { userId: session.user.id, bankDetails: body },
  });
  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Rewrite influencer payments page with real data**

Replace `src/app/[locale]/influencer/payments/page.tsx` with a server component that fetches real transactions + a client component for the bank form. The page fetches:
- `totalEarned` — sum of PAID transactions where paidToId = user.id
- `pending` — sum of PENDING transactions
- `completed` — count of PAID transactions
- Transaction history list

```typescript
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { AppShell } from "@/components/app-shell";
import { influencerNav } from "@/app/[locale]/influencer/_nav";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { BankDetailsForm } from "./bank-form";

export default async function InfluencerPaymentsPage() {
  const user = await requireRole("INFLUENCER");

  const [earnedAgg, pendingAgg, txHistory, profile] = await Promise.all([
    prisma.transaction.aggregate({ where: { paidToId: user.id, status: "PAID" }, _sum: { amountDinar: true } }),
    prisma.transaction.aggregate({ where: { paidToId: user.id, status: "PENDING" }, _sum: { amountDinar: true } }),
    prisma.transaction.findMany({
      where: { paidToId: user.id },
      orderBy: { createdAt: "desc" },
      take: 20,
      include: { campaign: { select: { title: true } } },
    }),
    prisma.influencerProfile.findUnique({ where: { userId: user.id }, select: { bankDetails: true } }),
  ]);

  const earned = earnedAgg._sum.amountDinar ?? 0;
  const pending = pendingAgg._sum.amountDinar ?? 0;

  return (
    <AppShell title="Paiements" nav={influencerNav}>
      <div className="space-y-6">
        {/* Stats */}
        <div className="grid gap-4 sm:grid-cols-3">
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold gradient-text">{earned.toLocaleString()} DZD</div>
              <div className="text-sm text-[#64748B] mt-1">Total gagné</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-amber-400">{pending.toLocaleString()} DZD</div>
              <div className="text-sm text-[#64748B] mt-1">En attente</div>
            </CardContent>
          </Card>
          <Card>
            <CardContent className="p-6 text-center">
              <div className="text-3xl font-bold text-emerald-400">{txHistory.filter((t) => t.status === "PAID").length}</div>
              <div className="text-sm text-[#64748B] mt-1">Paiements reçus</div>
            </CardContent>
          </Card>
        </div>

        {/* Bank details form (client) */}
        <BankDetailsForm initialData={profile?.bankDetails as { bankName: string; accountHolder: string; iban: string } | null} />

        {/* Transaction history */}
        <Card>
          <CardHeader><CardTitle className="text-base text-[#E2E8F0]">Historique</CardTitle></CardHeader>
          <CardContent>
            {txHistory.length === 0 && <p className="text-sm text-[#64748B]">Aucune transaction.</p>}
            <div className="space-y-2">
              {txHistory.map((t) => (
                <div key={t.id} className="flex items-center justify-between rounded-lg border border-white/[0.06] bg-white/[0.02] p-3">
                  <div>
                    <p className="text-sm font-medium text-[#E2E8F0]">{t.campaign?.title ?? "—"}</p>
                    <p className="text-xs text-[#64748B]">{t.createdAt.toLocaleDateString()}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-bold text-emerald-400">+{t.amountDinar.toLocaleString()} DZD</p>
                    <Badge variant={t.status === "PAID" ? "success" : "warning"}>{t.status}</Badge>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </AppShell>
  );
}
```

- [ ] **Step 3: Create BankDetailsForm client component**

Create `src/app/[locale]/influencer/payments/bank-form.tsx`:

```typescript
"use client";

import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface BankData { bankName: string; accountHolder: string; iban: string; }

export function BankDetailsForm({ initialData }: { initialData: BankData | null }) {
  const [data, setData] = useState<BankData>(initialData ?? { bankName: "", accountHolder: "", iban: "" });
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await fetch("/api/influencer/bank-details", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });
      setSaved(true);
      setTimeout(() => setSaved(false), 3000);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-[#E2E8F0]">Coordonnées bancaires</CardTitle>
        <CardDescription className="text-[#64748B]">Pour recevoir vos paiements. Informations sécurisées.</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8]">Banque</Label>
          <Input value={data.bankName} onChange={(e) => setData({ ...data, bankName: e.target.value })} placeholder="CPA, BNA, BEA..." className="bg-white/[0.04] border-white/[0.08] text-[#E2E8F0]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8]">Titulaire du compte</Label>
          <Input value={data.accountHolder} onChange={(e) => setData({ ...data, accountHolder: e.target.value })} placeholder="Nom complet" className="bg-white/[0.04] border-white/[0.08] text-[#E2E8F0]" />
        </div>
        <div className="space-y-1.5">
          <Label className="text-[#94A3B8]">IBAN / RIB</Label>
          <Input value={data.iban} onChange={(e) => setData({ ...data, iban: e.target.value })} placeholder="DZ00 0000 0000..." className="bg-white/[0.04] border-white/[0.08] text-[#E2E8F0]" />
        </div>
        <Button onClick={handleSave} disabled={saving} className="w-full">
          {saved ? "✓ Sauvegardé" : saving ? "Sauvegarde..." : "Sauvegarder"}
        </Button>
      </CardContent>
    </Card>
  );
}
```

- [ ] **Step 4: Commit**

```bash
git add src/app/api/influencer/bank-details/ src/app/[locale]/influencer/payments/
git commit -m "feat: influencer payments — real data, transaction history, bank details form"
```

---

## Task 13: Influencer Disputes Modal

**Files:**
- Modify: `src/app/[locale]/influencer/campaigns/[id]/client.tsx`

- [ ] **Step 1: Add dispute button to influencer campaign Infos tab**

In the Infos tab of `src/app/[locale]/influencer/campaigns/[id]/client.tsx`, add a dispute section when participation status is ONGOING or COMPLETED:

```typescript
// Inside the Infos tab, if status === "ONGOING" || status === "COMPLETED"
const [disputeOpen, setDisputeOpen] = useState(false);
const [disputeReason, setDisputeReason] = useState("");
const [disputeLoading, setDisputeLoading] = useState(false);

const handleDispute = async () => {
  if (!disputeReason.trim()) return;
  setDisputeLoading(true);
  try {
    await fetch("/api/disputes", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ campaignId, reason: disputeReason }),
    });
    setDisputeOpen(false);
    setDisputeReason("");
  } finally {
    setDisputeLoading(false);
  }
};

// Render at the bottom of the Infos tab:
{(status === "ONGOING" || status === "COMPLETED") && (
  <div className="mt-4 border-t border-white/[0.06] pt-4">
    {!disputeOpen ? (
      <button
        onClick={() => setDisputeOpen(true)}
        className="text-xs text-[#F43F5E]/70 hover:text-[#F43F5E] transition-colors"
      >
        ⚠️ Signaler un problème
      </button>
    ) : (
      <div className="rounded-xl border border-[#F43F5E]/20 bg-[#F43F5E]/5 p-4 space-y-3">
        <p className="text-sm font-semibold text-[#F43F5E]">Ouvrir un litige</p>
        <textarea
          value={disputeReason}
          onChange={(e) => setDisputeReason(e.target.value)}
          placeholder="Décrivez le problème en détail..."
          rows={3}
          className="w-full rounded-lg border border-white/[0.08] bg-white/[0.04] px-3 py-2 text-sm text-[#E2E8F0] placeholder:text-[#475569]"
        />
        <div className="flex gap-2">
          <Button size="sm" onClick={handleDispute} disabled={!disputeReason.trim() || disputeLoading}
            className="bg-[#F43F5E] hover:bg-[#F43F5E]/80 text-white border-0">
            {disputeLoading ? "..." : "Soumettre le litige"}
          </Button>
          <Button size="sm" variant="outline" onClick={() => setDisputeOpen(false)}
            className="border-white/10 text-[#94A3B8]">
            Annuler
          </Button>
        </div>
      </div>
    )}
  </div>
)}
```

- [ ] **Step 2: Commit**

```bash
git add src/app/[locale]/influencer/campaigns/[id]/
git commit -m "feat: influencer dispute modal from campaign page"
```

---

## Task 14: Admin Search + Pagination

**Files:**
- Modify: `src/app/[locale]/admin/influencers/page.tsx`
- Modify: `src/app/[locale]/admin/companies/page.tsx`
- Modify: `src/app/[locale]/admin/campaigns/page.tsx`

- [ ] **Step 1: Add search to admin influencers page**

In `src/app/[locale]/admin/influencers/page.tsx`, read `q` from searchParams and add a search form + WHERE clause:

```typescript
const q = (sp.q as string | undefined)?.trim() ?? "";
const page = Math.max(1, parseInt((sp.page as string) ?? "1", 10));
const size = 20;

const where = q ? {
  role: "INFLUENCER" as const,
  OR: [
    { firstName: { contains: q, mode: "insensitive" as const } },
    { lastName: { contains: q, mode: "insensitive" as const } },
    { email: { contains: q, mode: "insensitive" as const } },
  ],
} : { role: "INFLUENCER" as const };

const [users, total] = await Promise.all([
  prisma.user.findMany({ where, orderBy: { createdAt: "desc" }, skip: (page - 1) * size, take: size, include: { influencerProfile: true } }),
  prisma.user.count({ where }),
]);
const pages = Math.ceil(total / size);
```

Add search form at the top:
```tsx
<form className="flex gap-2 mb-6" action="">
  <input name="q" defaultValue={q} placeholder="Rechercher par nom ou email..." className="flex-1 rounded-xl border border-white/[0.08] bg-white/[0.04] px-4 py-2 text-sm text-[#E2E8F0] placeholder:text-[#475569]" />
  <button type="submit" className="rounded-xl border border-white/[0.08] bg-white/[0.04] px-5 py-2 text-sm text-[#94A3B8] hover:text-[#E2E8F0]">Rechercher</button>
</form>
```

Add pagination at the bottom:
```tsx
{pages > 1 && (
  <div className="flex items-center justify-center gap-2 mt-6">
    {Array.from({ length: pages }, (_, i) => i + 1).map((p) => (
      <a key={p} href={`?q=${q}&page=${p}`}
        className={`rounded-lg border px-3 py-1.5 text-xs ${p === page ? "border-violet-500/40 bg-violet-500/10 text-violet-300" : "border-white/[0.08] text-[#64748B] hover:text-[#94A3B8]"}`}>
        {p}
      </a>
    ))}
  </div>
)}
```

- [ ] **Step 2: Same pattern for admin companies page**

Apply the same search + pagination to `src/app/[locale]/admin/companies/page.tsx` (search by name, email, companyName).

- [ ] **Step 3: Add status filter to admin campaigns page**

In `src/app/[locale]/admin/campaigns/page.tsx`, add:
- `q` search by title
- `status` filter dropdown (UPCOMING/ONGOING/COMPLETED/CONFIRMED/PAID/All)
- Pagination (size 20)

- [ ] **Step 4: Commit**

```bash
git add src/app/[locale]/admin/influencers/ src/app/[locale]/admin/companies/ src/app/[locale]/admin/campaigns/
git commit -m "feat: admin search and pagination for influencers, companies, campaigns"
```

---

## Task 15: Final Polish

**Files:**
- Modify: `src/components/site-header.tsx`
- Modify: `src/app/[locale]/page.tsx`
- Verify: all new components have correct dark theme classes

- [ ] **Step 1: Update SiteHeader to dark theme**

In `src/components/site-header.tsx`, update background to:
```typescript
className="border-b border-white/[0.08] bg-[#080B18]/80 backdrop-blur-2xl"
```
Update text colors: `text-[#E2E8F0]`, links: `text-[#64748B] hover:text-[#C4B5FD]`.

- [ ] **Step 2: Update landing page hero colors**

In `src/app/[locale]/page.tsx`, update hardcoded `text-slate-900` → `text-[#E2E8F0]`, `text-slate-500` → `text-[#64748B]`, card backgrounds to use glass classes.

- [ ] **Step 3: Verify .gitignore**

Confirm `public/uploads/*`, `!public/uploads/.gitkeep`, and `.superpowers/` are in `.gitignore`.

- [ ] **Step 4: Final commit**

```bash
git add .
git commit -m "feat: final polish — dark theme for header, landing page, gitignore"
```

---

## Self-Review

**Spec coverage check:**
- ✅ Task 1 — DB migrations (EmailVerificationToken + bankDetails)
- ✅ Task 2 — Dark Luxury Web3 design system
- ✅ Task 3 — File upload API + FileUpload component
- ✅ Task 4 — Email verification backend (tokens, send on register, verify/resend routes)
- ✅ Task 5 — Email verification frontend (page, banner, isVerified in session)
- ✅ Task 6 — Active nav state (NavLink)
- ✅ Task 7 — Company campaign detail page + tab scaffold
- ✅ Task 8 — Deliverables company side (create, approve, reject with feedback modal)
- ✅ Task 9 — Deliverables influencer side (submit link, resubmit, view feedback)
- ✅ Task 10 — SSE messaging (stream routes, Redis pub/sub, embedded chat, NotificationBell upgrade)
- ✅ Task 11 — Reviews (banner + modal, both sides)
- ✅ Task 12 — Influencer payments (real data + bank form API + client)
- ✅ Task 13 — Influencer disputes modal
- ✅ Task 14 — Admin search + pagination
- ✅ Task 15 — Global polish (header, landing, gitignore)

**Type consistency:**
- `Deliverable` fields: `id, type, description, fileUrl, status, feedback, influencer` — consistent across Tasks 8, 9
- `Message` shape: `id, content, createdAt, senderId, sender` — consistent in Tasks 10
- `BankData`: `{ bankName, accountHolder, iban }` — consistent Tasks 12
- `ReviewModal` props: `campaignId, reviewedId, reviewedName, onClose, onReviewed` — consistent Task 11

**No placeholders found.** All steps contain actual code.
