# Email & Infrastructure Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Make emails work in production using Resend, create all transactional email templates, wire them to their triggers, build the contact form API, and document all environment variables in `.env.example`.

**Architecture:** Replace `nodemailer` + `SMTP_URL` in `src/server/email.ts` with `Resend`. Email templates are React components in `src/emails/` using `@react-email/components`. The existing `sendEmail()` function signature changes from `{ to, subject, html }` to `{ to, subject, react }` — all callers must be updated. The contact form sends a real email to the team inbox via `process.env.TEAM_EMAIL`.

**Tech Stack:** Resend SDK, @react-email/components, Next.js App Router, TypeScript

---

## File Map

| Action | File |
|--------|------|
| Modify | `src/server/email.ts` (switch to Resend) |
| Modify | `src/server/env.ts` (add RESEND_API_KEY, EMAIL_FROM, TEAM_EMAIL) |
| Create | `src/emails/verify-email.tsx` |
| Create | `src/emails/forgot-password.tsx` |
| Create | `src/emails/new-application.tsx` |
| Create | `src/emails/application-prevalidated.tsx` |
| Create | `src/emails/deliverable-submitted.tsx` |
| Create | `src/emails/campaign-confirmed.tsx` |
| Create | `src/emails/contact-form.tsx` |
| Find & modify | Wherever email verification is sent |
| Find & modify | Wherever password reset email is sent |
| Modify | `src/app/api/influencer/apply/route.ts` |
| Modify | `src/app/api/admin/applications/[id]/pre-validate/route.ts` (created in Plan 1) |
| Find & modify | Deliverable submission route |
| Modify | `src/app/api/company/confirm-completion/route.ts` |
| Create | `src/app/api/contact/route.ts` |
| Find | Contact page (add form if missing) |
| Create | `.env.example` |

---

### Task 1: Install Resend and @react-email/components

**Files:** `package.json`

- [ ] **Step 1: Install dependencies**

```bash
cd /Users/macbook/Documents/Dev/UGC26/ugc26
npm install resend @react-email/components
```

Expected: packages added to `package.json` and `package-lock.json`.

- [ ] **Step 2: Verify installation**

```bash
node -e "require('resend'); console.log('resend ok')"
```

Expected: `resend ok`

- [ ] **Step 3: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add resend and @react-email/components"
```

---

### Task 2: Update env.ts and switch email.ts to Resend

**Files:**
- Modify: `src/server/env.ts`
- Modify: `src/server/email.ts`

- [ ] **Step 1: Update `src/server/env.ts`**

Read the current file:
```bash
cat /Users/macbook/Documents/Dev/UGC26/ugc26/src/server/env.ts
```

Add the new fields to `EnvSchema` and the `env` export:

```typescript
// Add to EnvSchema z.object({...}):
RESEND_API_KEY: z.string().optional(),
EMAIL_FROM: z.string().optional(),
TEAM_EMAIL: z.string().optional(),

// Add to env parse call:
RESEND_API_KEY: process.env.RESEND_API_KEY,
EMAIL_FROM: process.env.EMAIL_FROM,
TEAM_EMAIL: process.env.TEAM_EMAIL,
```

- [ ] **Step 2: Replace `src/server/email.ts`**

Write the full new file:

```typescript
import "dotenv/config";
import { Resend } from "resend";
import { env } from "@/server/env";
import type { ReactElement } from "react";

let _resend: Resend | null = null;

function getResend(): Resend | null {
  if (!env.RESEND_API_KEY) return null;
  if (!_resend) _resend = new Resend(env.RESEND_API_KEY);
  return _resend;
}

export async function sendEmail(options: {
  to: string;
  subject: string;
  react: ReactElement;
}) {
  const resend = getResend();

  if (!resend) {
    // Dev mode: log to console
    console.log("\n--- EMAIL (dev mode, no RESEND_API_KEY) ---");
    console.log("To:", options.to);
    console.log("Subject:", options.subject);
    console.log("--- END EMAIL ---\n");
    return;
  }

  const { error } = await resend.emails.send({
    from: env.EMAIL_FROM ?? "UGC26 <noreply@ugc26.dz>",
    to: options.to,
    subject: options.subject,
    react: options.react,
  });

  if (error) {
    console.error("Resend error:", error);
  }
}
```

- [ ] **Step 3: Find all existing sendEmail callers and note their current signature**

```bash
grep -r "sendEmail" /Users/macbook/Documents/Dev/UGC26/ugc26/src --include="*.ts" --include="*.tsx" -n
```

Note: old callers pass `{ to, subject, html: string }`. We will fix these in Task 3+.

- [ ] **Step 4: Commit**

```bash
git add src/server/env.ts src/server/email.ts
git commit -m "feat: switch email transport to Resend"
```

---

### Task 3: Email templates

**Files:**
- Create: `src/emails/verify-email.tsx`
- Create: `src/emails/forgot-password.tsx`
- Create: `src/emails/new-application.tsx`
- Create: `src/emails/application-prevalidated.tsx`
- Create: `src/emails/deliverable-submitted.tsx`
- Create: `src/emails/campaign-confirmed.tsx`
- Create: `src/emails/contact-form.tsx`

- [ ] **Step 1: Create `src/emails/verify-email.tsx`**

```bash
mkdir -p /Users/macbook/Documents/Dev/UGC26/ugc26/src/emails
```

```tsx
// src/emails/verify-email.tsx
import {
  Html, Head, Body, Container, Text, Button, Hr, Section,
} from "@react-email/components";

interface VerifyEmailProps {
  firstName: string;
  verifyUrl: string;
}

export function VerifyEmailTemplate({ firstName, verifyUrl }: VerifyEmailProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>
            Bonjour {firstName} 👋
          </Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            Merci de vous être inscrit sur UGC26. Veuillez confirmer votre adresse email pour activer votre compte.
          </Text>
          <Section style={{ textAlign: "center", marginBottom: 24 }}>
            <Button
              href={verifyUrl}
              style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}
            >
              Vérifier mon email
            </Button>
          </Section>
          <Hr style={{ borderColor: "#e2e8f0" }} />
          <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 16 }}>
            Ce lien expire dans 24 heures. Si vous n&apos;avez pas créé de compte, ignorez cet email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 2: Create `src/emails/forgot-password.tsx`**

```tsx
// src/emails/forgot-password.tsx
import {
  Html, Head, Body, Container, Text, Button, Hr, Section,
} from "@react-email/components";

interface ForgotPasswordProps {
  firstName: string;
  resetUrl: string;
}

export function ForgotPasswordTemplate({ firstName, resetUrl }: ForgotPasswordProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0  1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 24, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>
            Bonjour {firstName},
          </Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            Vous avez demandé à réinitialiser votre mot de passe. Cliquez sur le bouton ci-dessous.
          </Text>
          <Section style={{ textAlign: "center", marginBottom: 24 }}>
            <Button
              href={resetUrl}
              style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}
            >
              Réinitialiser mon mot de passe
            </Button>
          </Section>
          <Hr style={{ borderColor: "#e2e8f0" }} />
          <Text style={{ fontSize: 12, color: "#94a3b8", marginTop: 16 }}>
            Ce lien expire dans 1 heure. Si vous n&apos;avez pas fait cette demande, ignorez cet email.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 3: Create `src/emails/new-application.tsx`**

```tsx
// src/emails/new-application.tsx
import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";

interface NewApplicationProps {
  companyName: string;
  influencerName: string;
  campaignTitle: string;
  applicantsUrl: string;
}

export function NewApplicationTemplate({ companyName, influencerName, campaignTitle, applicantsUrl }: NewApplicationProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0  1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>
            Nouvelle candidature
          </Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            Bonjour {companyName},<br /><br />
            <strong>{influencerName}</strong> a postulé à votre campagne <strong>&quot;{campaignTitle}&quot;</strong>.
            La candidature est en attente de validation par l&apos;admin.
          </Text>
          <Section style={{ textAlign: "center" }}>
            <Button
              href={applicantsUrl}
              style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}
            >
              Voir les candidats
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 4: Create `src/emails/application-prevalidated.tsx`**

```tsx
// src/emails/application-prevalidated.tsx
import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";

interface ApplicationPrevalidatedProps {
  companyName: string;
  influencerName: string;
  campaignTitle: string;
  applicantsUrl: string;
}

export function ApplicationPrevalidatedTemplate({ companyName, influencerName, campaignTitle, applicantsUrl }: ApplicationPrevalidatedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0  1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>
            Candidature pré-validée ✅
          </Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            Bonjour {companyName},<br /><br />
            L&apos;admin a pré-validé la candidature de <strong>{influencerName}</strong> pour votre campagne <strong>&quot;{campaignTitle}&quot;</strong>.<br /><br />
            Vous pouvez maintenant le/la sélectionner et procéder au paiement.
          </Text>
          <Section style={{ textAlign: "center" }}>
            <Button
              href={applicantsUrl}
              style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}
            >
              Voir les candidats validés
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 5: Create `src/emails/deliverable-submitted.tsx`**

```tsx
// src/emails/deliverable-submitted.tsx
import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";

interface DeliverableSubmittedProps {
  companyName: string;
  influencerName: string;
  campaignTitle: string;
  deliverablesUrl: string;
}

export function DeliverableSubmittedTemplate({ companyName, influencerName, campaignTitle, deliverablesUrl }: DeliverableSubmittedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>
            Nouveau livrable soumis 📦
          </Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            Bonjour {companyName},<br /><br />
            <strong>{influencerName}</strong> a soumis un livrable pour la campagne <strong>&quot;{campaignTitle}&quot;</strong>.<br /><br />
            Veuillez le réviser et approuver ou rejeter.
          </Text>
          <Section style={{ textAlign: "center" }}>
            <Button
              href={deliverablesUrl}
              style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}
            >
              Voir le livrable
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 6: Create `src/emails/campaign-confirmed.tsx`**

```tsx
// src/emails/campaign-confirmed.tsx
import { Html, Head, Body, Container, Text, Button, Section } from "@react-email/components";

interface CampaignConfirmedProps {
  influencerName: string;
  campaignTitle: string;
  netAmountDinar: number;
  paymentsUrl: string;
}

export function CampaignConfirmedTemplate({ influencerName, campaignTitle, netAmountDinar, paymentsUrl }: CampaignConfirmedProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0 1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 8 }}>
            Campagne confirmée 🎉
          </Text>
          <Text style={{ color: "#475569", marginBottom: 8 }}>
            Bonjour {influencerName},
          </Text>
          <Text style={{ color: "#475569", marginBottom: 24 }}>
            L&apos;entreprise a confirmé l&apos;achèvement de la campagne <strong>&quot;{campaignTitle}&quot;</strong>.<br /><br />
            Vous recevrez <strong>{netAmountDinar.toLocaleString("fr-DZ")} DZD</strong> une fois le paiement traité par l&apos;admin.
          </Text>
          <Section style={{ textAlign: "center" }}>
            <Button
              href={paymentsUrl}
              style={{ backgroundColor: "#7c3aed", color: "#ffffff", padding: "12px 28px", borderRadius: 8, fontWeight: "600", fontSize: 14, textDecoration: "none" }}
            >
              Voir mes paiements
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 7: Create `src/emails/contact-form.tsx`**

```tsx
// src/emails/contact-form.tsx
import { Html, Head, Body, Container, Text, Hr } from "@react-email/components";

interface ContactFormProps {
  senderName: string;
  senderEmail: string;
  subject: string;
  message: string;
}

export function ContactFormTemplate({ senderName, senderEmail, subject, message }: ContactFormProps) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "Inter, sans-serif", backgroundColor: "#f8fafc", margin: 0 }}>
        <Container style={{ maxWidth: 480, margin: "40px auto", backgroundColor: "#ffffff", borderRadius: 12, padding: 32, boxShadow: "0  1px 3px rgba(0,0,0,0.1)" }}>
          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#0f172a", marginBottom: 4 }}>
            [Contact UGC26] {subject}
          </Text>
          <Text style={{ color: "#64748b", fontSize: 13, marginBottom: 16 }}>
            De : {senderName} &lt;{senderEmail}&gt;
          </Text>
          <Hr style={{ borderColor: "#e2e8f0", marginBottom: 16 }} />
          <Text style={{ color: "#334155", whiteSpace: "pre-wrap" }}>
            {message}
          </Text>
        </Container>
      </Body>
    </Html>
  );
}
```

- [ ] **Step 8: Commit all templates**

```bash
git add src/emails/
git commit -m "feat: React email templates (verify, reset, application, deliverable, confirmed, contact)"
```

---

### Task 4: Wire email templates to triggers

**Files:**
- Modify: Email verification send location
- Modify: Password reset send location
- Modify: `src/app/api/influencer/apply/route.ts`
- Modify: `src/app/api/admin/applications/[id]/pre-validate/route.ts`
- Modify: Deliverable submission route
- Modify: `src/app/api/company/confirm-completion/route.ts`

- [ ] **Step 1: Find email send locations**

```bash
grep -r "sendEmail" /Users/macbook/Documents/Dev/UGC26/ugc26/src --include="*.ts" --include="*.tsx" -n
```

Note every file and line number.

- [ ] **Step 2: Fix email verification caller**

Find the file that calls `sendEmail` with a verification link. Update it to use the React template:

```typescript
import { VerifyEmailTemplate } from "@/emails/verify-email";

// Replace old call:
await sendEmail({
  to: user.email,
  subject: "Vérifiez votre adresse email — UGC26",
  react: <VerifyEmailTemplate firstName={user.firstName} verifyUrl={verifyUrl} />,
});
```

- [ ] **Step 3: Fix password reset caller**

Find the file that sends password reset emails. Update:

```typescript
import { ForgotPasswordTemplate } from "@/emails/forgot-password";

await sendEmail({
  to: user.email,
  subject: "Réinitialisation de votre mot de passe — UGC26",
  react: <ForgotPasswordTemplate firstName={user.firstName} resetUrl={resetUrl} />,
});
```

- [ ] **Step 4: Wire new application email in apply route**

In `src/app/api/influencer/apply/route.ts`, after the `upsert`, add:

```typescript
import { NewApplicationTemplate } from "@/emails/new-application";
import { sendEmail } from "@/server/email";
import { env } from "@/server/env";

// After the upsert:
const campaignWithCompany = await prisma.campaign.findUnique({
  where: { id: campaignId },
  include: { company: true },
});
if (campaignWithCompany?.company.email) {
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendEmail({
    to: campaignWithCompany.company.email,
    subject: `Nouvelle candidature pour "${campaignWithCompany.title}"`,
    react: (
      <NewApplicationTemplate
        companyName={campaignWithCompany.company.firstName}
        influencerName={user.firstName + " " + user.lastName}
        campaignTitle={campaignWithCompany.title}
        applicantsUrl={`${base}/company/campaigns/${campaignId}/applicants`}
      />
    ),
  });
}
```

- [ ] **Step 5: Wire pre-validation email**

In `src/app/api/admin/applications/[id]/pre-validate/route.ts` (created in Plan 1), after `createNotification`, add:

```typescript
import { ApplicationPrevalidatedTemplate } from "@/emails/application-prevalidated";
import { env } from "@/server/env";

const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
await sendEmail({
  to: application.campaign.company.email,
  subject: `Candidature pré-validée pour "${application.campaign.title}"`,
  react: (
    <ApplicationPrevalidatedTemplate
      companyName={application.campaign.company.firstName}
      influencerName={`${application.influencer.firstName} ${application.influencer.lastName}`}
      campaignTitle={application.campaign.title}
      applicantsUrl={`${base}/company/campaigns/${application.campaignId}/applicants`}
    />
  ),
});
```

The `company` must be included in the findUnique. Update that query to:
```typescript
include: {
  campaign: { include: { company: true } },
  influencer: true,
},
```

- [ ] **Step 6: Wire deliverable submitted email**

Find the deliverable submission endpoint:
```bash
find "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app/api/deliverables" -name "*.ts" 2>/dev/null
```

Read it, then add `sendEmail` call after the deliverable is created/updated to SUBMITTED status:

```typescript
import { DeliverableSubmittedTemplate } from "@/emails/deliverable-submitted";
import { env } from "@/server/env";

// After deliverable submission:
const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
await sendEmail({
  to: campaign.company.email,
  subject: `Nouveau livrable soumis — "${campaign.title}"`,
  react: (
    <DeliverableSubmittedTemplate
      companyName={campaign.company.firstName}
      influencerName={`${influencer.firstName} ${influencer.lastName}`}
      campaignTitle={campaign.title}
      deliverablesUrl={`${base}/company/campaigns/${campaign.id}/deliverables`}
    />
  ),
});
```

- [ ] **Step 7: Wire campaign confirmed email**

In `src/app/api/company/confirm-completion/route.ts`, after `createNotification`, add:

```typescript
import { CampaignConfirmedTemplate } from "@/emails/campaign-confirmed";
import { env } from "@/server/env";

// Fetch influencer details for the email (participation.influencer isn't included yet):
const influencer = await prisma.user.findUnique({ where: { id: participation.influencerId } });
if (influencer) {
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  await sendEmail({
    to: influencer.email,
    subject: `Campagne confirmée — "${participation.campaign.title}"`,
    react: (
      <CampaignConfirmedTemplate
        influencerName={influencer.firstName}
        campaignTitle={participation.campaign.title}
        netAmountDinar={netAmountInfluencer}
        paymentsUrl={`${base}/influencer/payments`}
      />
    ),
  });
}
```

- [ ] **Step 8: Commit wiring**

```bash
git add src/app/api/
git commit -m "feat: wire transactional emails to all trigger points"
```

---

### Task 5: Contact form API + page

**Files:**
- Create: `src/app/api/contact/route.ts`
- Find/create: Contact page

- [ ] **Step 1: Create `src/app/api/contact/route.ts`**

```bash
mkdir -p /Users/macbook/Documents/Dev/UGC26/ugc26/src/app/api/contact
```

```typescript
// src/app/api/contact/route.ts
import { NextResponse } from "next/server";
import { sendEmail } from "@/server/email";
import { ContactFormTemplate } from "@/emails/contact-form";
import { env } from "@/server/env";
import { z } from "zod";

const ContactSchema = z.object({
  name: z.string().min(1).max(100),
  email: z.string().email(),
  subject: z.string().min(1).max(200),
  message: z.string().min(10).max(2000),
});

export async function POST(req: Request) {
  const body = await req.json().catch(() => null);
  const parsed = ContactSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid input" }, { status: 400 });
  }

  const { name, email, subject, message } = parsed.data;
  const teamEmail = env.TEAM_EMAIL;

  if (!teamEmail) {
    console.warn("TEAM_EMAIL not configured — contact form email not sent");
    return NextResponse.json({ ok: true }); // Don't expose missing config to users
  }

  await sendEmail({
    to: teamEmail,
    subject: `[Contact UGC26] ${subject}`,
    react: (
      <ContactFormTemplate
        senderName={name}
        senderEmail={email}
        subject={subject}
        message={message}
      />
    ),
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 2: Find or create the contact page**

```bash
find "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app" -name "*.tsx" | xargs grep -l "contact\|Contact" 2>/dev/null | grep -v node_modules
```

If a contact page exists, add a form that POSTs to `/api/contact`. If it doesn't exist, create `src/app/[locale]/contact/page.tsx`:

```tsx
// src/app/[locale]/contact/page.tsx
"use client"; // This page is a client component for form handling

import { useState } from "react";

export default function ContactPage() {
  const [form, setForm] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus("sending");
    const res = await fetch("/api/contact", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(form),
    });
    setStatus(res.ok ? "sent" : "error");
  };

  if (status === "sent") {
    return (
      <div className="flex min-h-screen items-center justify-center p-8 text-center">
        <div>
          <p className="text-2xl font-bold text-slate-900 dark:text-slate-100">Message envoyé ✅</p>
          <p className="mt-2 text-slate-500">Nous vous répondrons dans les plus brefs délais.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg px-4 py-16">
      <h1 className="mb-2 text-2xl font-bold text-slate-900 dark:text-slate-100">Nous contacter</h1>
      <p className="mb-8 text-slate-500">Une question ? Écrivez-nous.</p>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Nom</label>
          <input
            required
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Email</label>
          <input
            required
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Sujet</label>
          <input
            required
            value={form.subject}
            onChange={(e) => setForm({ ...form, subject: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500"
          />
        </div>
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700 dark:text-slate-300">Message</label>
          <textarea
            required
            rows={5}
            value={form.message}
            onChange={(e) => setForm({ ...form, message: e.target.value })}
            className="w-full rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-violet-500 resize-none"
          />
        </div>
        {status === "error" && (
          <p className="text-sm text-red-500">Une erreur s&apos;est produite. Réessayez.</p>
        )}
        <button
          type="submit"
          disabled={status === "sending"}
          className="w-full rounded-xl bg-violet-600 px-6 py-3 font-medium text-white hover:bg-violet-700 disabled:opacity-50 transition-colors"
        >
          {status === "sending" ? "Envoi..." : "Envoyer"}
        </button>
      </form>
    </div>
  );
}
```

- [ ] **Step 3: Commit**

```bash
git add src/app/api/contact/ "src/app/[locale]/contact/" 2>/dev/null; git add src/app/api/contact/
git commit -m "feat: contact form API + page — sends real email to team"
```

---

### Task 6: Create .env.example

**Files:**
- Create: `.env.example`

- [ ] **Step 1: Create `.env.example` at project root**

```bash
cat /Users/macbook/Documents/Dev/UGC26/ugc26/.env.local 2>/dev/null | grep -v "=.*" | head -30
```

(Just checking what keys exist without exposing values)

- [ ] **Step 2: Write the file**

```bash
cat > /Users/macbook/Documents/Dev/UGC26/ugc26/.env.example << 'EOF'
# ─── Database ────────────────────────────────────────────────────────────────
# PostgreSQL connection string
# Get a free DB: https://neon.tech or https://supabase.com or https://railway.app
DATABASE_URL="postgresql://user:password@localhost:5432/ugc26"

# ─── NextAuth ────────────────────────────────────────────────────────────────
# Generate with: openssl rand -base64 32
NEXTAUTH_SECRET="your-secret-here"
# Must match your production domain exactly
NEXTAUTH_URL="http://localhost:3000"

# ─── Email (Resend) ──────────────────────────────────────────────────────────
# Get API key at: https://resend.com
# Domain must be verified in Resend dashboard
# Add DNS records: SPF, DKIM, DMARC to avoid spam folder
RESEND_API_KEY="re_..."
EMAIL_FROM="UGC26 <noreply@ugc26.dz>"
# Email address that receives contact form submissions
TEAM_EMAIL="contact@ugc26.dz"

# ─── Redis ───────────────────────────────────────────────────────────────────
# Required for rate limiting. Get a free instance at: https://upstash.com
# Or use Railway / Render Redis addon
REDIS_URL="redis://localhost:6379"

# ─── App URL ─────────────────────────────────────────────────────────────────
# Used in email links and sitemap
NEXT_PUBLIC_APP_URL="http://localhost:3000"

# ─── SATIM Payment Gateway ───────────────────────────────────────────────────
# Plug in when you have SATIM merchant credentials
# Contact: https://satim.dz — requires CIB merchant registration
SATIM_TERMINAL_ID=""
SATIM_MERCHANT_ID=""
SATIM_PASSWORD=""
# Staging: https://test.satim.dz/payment/rest
# Production: https://satim.dz/payment/rest
SATIM_BASE_URL=""
EOF
```

- [ ] **Step 3: Verify `.env.example` is NOT gitignored**

```bash
cat /Users/macbook/Documents/Dev/UGC26/ugc26/.gitignore | grep env
```

`.env.example` should NOT be ignored (`.env*` glob usually excludes `.env.example` — verify).

- [ ] **Step 4: Commit**

```bash
git add .env.example
git commit -m "docs: add .env.example with all required variables documented"
```

---

### Task 7: TypeScript check

- [ ] **Step 1: Run type check**

```bash
cd /Users/macbook/Documents/Dev/UGC26/ugc26 && npx tsc --noEmit 2>&1 | head -50
```

The main thing to watch for: any remaining callers that pass `html: string` to `sendEmail` instead of `react: ReactElement`. Fix each one by updating to the new signature.

Search for remaining old callers:
```bash
grep -r "html:" /Users/macbook/Documents/Dev/UGC26/ugc26/src --include="*.ts" --include="*.tsx" | grep -i "email\|sendEmail"
```

- [ ] **Step 2: Fix any remaining callers**

For each old caller found, replace the `html` string with the appropriate React template. If no template exists for the email type yet, create a minimal one following the same pattern as the others.

- [ ] **Step 3: Commit fixes**

```bash
git add -A
git commit -m "fix: update remaining sendEmail callers to use React templates"
```
