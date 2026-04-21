---
title: Plan 4 — Email & Infrastructure
date: 2026-04-21
status: approved
---

# Plan 4 — Email & Infrastructure

## Goal

Make emails work in production using Resend, create all transactional email templates (forgot password, email verification, notifications, contact form), and document all environment variables in a `.env.example` file for deployment.

## Architecture

The existing `src/lib/email.ts` (or `src/server/email.ts`) already has a `sendEmail()` function that uses `nodemailer` or a similar transport. We replace the transport with **Resend** (`resend` npm package). Email templates are React components using `@react-email/components`. The contact form sends a real email to the team inbox.

---

## 1. Resend Setup

### 1.1 Install Dependencies

```bash
npm install resend @react-email/components
```

### 1.2 Update Email Transport

**File:** `src/lib/email.ts` (update or create)

```ts
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

export async function sendEmail({
  to,
  subject,
  react,
}: {
  to: string;
  subject: string;
  react: React.ReactElement;
}) {
  const { error } = await resend.emails.send({
    from: process.env.EMAIL_FROM ?? "UGC26 <noreply@ugc26.dz>",
    to,
    subject,
    react,
  });
  if (error) console.error("Resend error:", error);
}
```

**Env vars:**
```
RESEND_API_KEY=re_...
EMAIL_FROM=UGC26 <noreply@ugc26.dz>
TEAM_EMAIL=contact@ugc26.dz
```

---

## 2. Email Templates

All templates in `src/emails/` as React components.

### 2.1 Email Verification

**File:** `src/emails/verify-email.tsx`

```tsx
import { Html, Head, Body, Container, Text, Button, Hr } from "@react-email/components";

export function VerifyEmailTemplate({ verifyUrl, firstName }: { verifyUrl: string; firstName: string }) {
  return (
    <Html>
      <Head />
      <Body style={{ fontFamily: "sans-serif", backgroundColor: "#f9fafb" }}>
        <Container style={{ maxWidth: 480, margin: "0 auto", padding: 32 }}>
          <Text style={{ fontSize: 24, fontWeight: "bold" }}>Bonjour {firstName},</Text>
          <Text>Veuillez confirmer votre adresse email pour activer votre compte UGC26.</Text>
          <Button href={verifyUrl} style={{ backgroundColor: "#7c3aed", color: "#fff", padding: "12px 24px", borderRadius: 8 }}>
            Vérifier mon email
          </Button>
          <Hr />
          <Text style={{ fontSize: 12, color: "#6b7280" }}>Si vous n'avez pas créé de compte, ignorez cet email.</Text>
        </Container>
      </Body>
    </Html>
  );
}
```

### 2.2 Forgot Password

**File:** `src/emails/forgot-password.tsx`

Same structure as verify-email. Props: `{ resetUrl: string; firstName: string }`. Button text: "Réinitialiser mon mot de passe".

### 2.3 New Application Notification (to Company)

**File:** `src/emails/new-application.tsx`

Props: `{ companyName: string; influencerName: string; campaignTitle: string; campaignUrl: string }`

Text: "Un nouveau créateur a postulé à votre campagne [campaignTitle]." + CTA button "Voir la candidature".

### 2.4 Application Pre-Validated (to Company)

**File:** `src/emails/application-prevalidated.tsx`

Props: `{ companyName: string; influencerName: string; campaignTitle: string; applicantsUrl: string }`

Text: "L'admin a pré-validé la candidature de [influencerName] pour votre campagne [campaignTitle]." + CTA "Voir les candidats validés".

### 2.5 Deliverable Submitted (to Company)

**File:** `src/emails/deliverable-submitted.tsx`

Props: `{ companyName: string; influencerName: string; campaignTitle: string; deliverablesUrl: string }`

Text: "[influencerName] a soumis un livrable pour la campagne [campaignTitle]." + CTA "Voir le livrable".

### 2.6 Campaign Confirmed (to Influencer)

**File:** `src/emails/campaign-confirmed.tsx`

Props: `{ influencerName: string; campaignTitle: string; netAmount: number; campaignUrl: string }`

Text: "Félicitations ! L'entreprise a confirmé la campagne [campaignTitle]. Vous recevrez [netAmount] DZD."

### 2.7 Contact Form (to Team)

**File:** `src/emails/contact-form.tsx`

Props: `{ senderName: string; senderEmail: string; message: string; subject: string }`

This email is sent to `process.env.TEAM_EMAIL`.

---

## 3. Wire Templates to Triggers

### 3.1 Email Verification

**File:** `src/app/api/auth/[...nextauth]/route.ts` (or wherever verification emails are sent)

Update `sendEmail` call to pass the `<VerifyEmailTemplate />` component.

### 3.2 Forgot Password

**File:** wherever `sendPasswordResetEmail` is called.

### 3.3 New Application → Company

**File:** `src/app/api/influencer/campaigns/[id]/apply/route.ts`

After creating the application, call `sendEmail` with `<NewApplicationTemplate />` to the campaign's company email.

### 3.4 Pre-Validation → Company

**File:** `src/app/api/admin/applications/[id]/pre-validate/route.ts` (Plan 1)

After setting `adminPreValidated = true`, send `<ApplicationPrevalidatedTemplate />` to the company.

### 3.5 Deliverable Submitted → Company

**File:** wherever deliverable submission is handled.

### 3.6 Campaign Confirmed → Influencer

**File:** `src/app/api/company/confirm-completion/route.ts`

The `createNotification` call already exists. Add `sendEmail` call alongside it with `<CampaignConfirmedTemplate />`.

### 3.7 Contact Form

**File:** `src/app/api/contact/route.ts` (create if doesn't exist)

```ts
export async function POST(req: Request) {
  const { name, email, subject, message } = await req.json();
  await sendEmail({
    to: process.env.TEAM_EMAIL!,
    subject: `[Contact UGC26] ${subject}`,
    react: <ContactFormTemplate senderName={name} senderEmail={email} message={message} subject={subject} />,
  });
  return NextResponse.json({ ok: true });
}
```

The contact page form already exists (or if not, it's a simple form with name/email/subject/message fields).

---

## 4. `.env.example` — Complete Documentation

**File:** `.env.example` (create at project root)

```env
# ─── Database ────────────────────────────────────────────────
DATABASE_URL="postgresql://user:password@localhost:5432/ugc26"

# ─── NextAuth ────────────────────────────────────────────────
NEXTAUTH_SECRET="generate-with: openssl rand -base64 32"
NEXTAUTH_URL="http://localhost:3000"
# Production: NEXTAUTH_URL="https://ugc26.dz"

# ─── Email (Resend) ──────────────────────────────────────────
RESEND_API_KEY="re_..."
EMAIL_FROM="UGC26 <noreply@ugc26.dz>"
TEAM_EMAIL="contact@ugc26.dz"

# ─── Redis (Upstash — for rate limiting) ─────────────────────
UPSTASH_REDIS_REST_URL="https://..."
UPSTASH_REDIS_REST_TOKEN="..."

# ─── App ─────────────────────────────────────────────────────
NEXT_PUBLIC_APP_URL="http://localhost:3000"
# Production: NEXT_PUBLIC_APP_URL="https://ugc26.dz"

# ─── SATIM Payment Gateway (plug in when ready) ──────────────
SATIM_TERMINAL_ID=""
SATIM_MERCHANT_ID=""
SATIM_PASSWORD=""
SATIM_BASE_URL="https://satim.dz/payment/rest"
# Staging: SATIM_BASE_URL="https://test.satim.dz/payment/rest"

# ─── File Uploads (if using cloud storage) ───────────────────
# NEXT_PUBLIC_UPLOAD_URL=""
# UPLOAD_SECRET=""
```

### Notes on Production Setup

1. **Domain for email**: Purchase domain from GoDaddy or Google Workspace. Add DNS records for Resend (SPF, DKIM, DMARC) to avoid spam folder.
2. **NEXTAUTH_URL**: Must match your production domain exactly, including protocol.
3. **NEXTAUTH_SECRET**: Generate a new random secret for production — never reuse the dev secret.
4. **DATABASE_URL**: Use a managed Postgres instance (Supabase, Neon, Railway, or PlanetScale-compatible).
5. **Redis**: Upstash has a free tier that works well for rate limiting. Alternatively use Railway's Redis addon.
6. **SATIM**: Credentials provided by CIB (Centre Interbancaire de la Monétique). Contact SATIM directly for merchant registration.

---

## 5. Cross-References

- All email trigger points wired in **Plan 1** (pre-validation, payment confirmation) and **Plan 2** (deliverables)
- `NEXT_PUBLIC_APP_URL` used in **Plan 3** (sitemap, robots.txt)
- `UPSTASH_REDIS_REST_URL/TOKEN` used in **Plan 3** (rate limiting)
- `SATIM_*` vars wired in **Plan 1** (SATIM stub module)
