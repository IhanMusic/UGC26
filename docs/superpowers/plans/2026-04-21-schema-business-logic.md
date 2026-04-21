# Schema & Business Logic Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Update Prisma schema for multi-influencer campaigns, 2-step application validation, and commission-based payments; add SATIM payment stub; fix transaction structure.

**Architecture:** Schema-first approach — migrate Prisma, then update API routes. `src/lib/commissions.ts` centralizes fee math. `src/lib/satim.ts` is a stub module with the same interface as the future real SATIM SDK. All existing routes that reference `amountDinar` must be updated.

**Tech Stack:** Prisma 6, PostgreSQL, Next.js App Router, TypeScript

---

## File Map

| Action | File |
|--------|------|
| Modify | `prisma/schema.prisma` |
| Create | `src/lib/commissions.ts` |
| Create | `src/lib/satim.ts` |
| Modify | `src/server/env.ts` |
| Create | `src/app/api/payments/satim/initiate/route.ts` |
| Create | `src/app/api/payments/satim/dev-callback/route.ts` |
| Create | `src/app/api/admin/applications/[id]/pre-validate/route.ts` |
| Modify | `src/app/api/company/confirm-completion/route.ts` |
| Modify | `src/app/api/admin/transactions/route.ts` |
| Modify | `src/app/api/influencer/apply/route.ts` (remove reject-all side-effect if present) |
| Find & fix | The endpoint that accepts a CampaignApplication and rejects all others |

---

### Task 1: Schema migration — socialNetworks, adminPreValidated, Transaction fields

**Files:**
- Modify: `prisma/schema.prisma`

- [ ] **Step 1: Update `InfluencerProfile.socialNetworks`**

In `prisma/schema.prisma`, change:
```prisma
socialNetworks            String? // comma separated for MVP
```
to:
```prisma
socialNetworks            String[]
```

- [ ] **Step 2: Add `adminPreValidated` to `CampaignApplication`**

In `prisma/schema.prisma`, in the `CampaignApplication` model, add after `status`:
```prisma
adminPreValidated Boolean @default(false)
```

- [ ] **Step 3: Add `SATIM` to `PaymentProvider` enum**

In `prisma/schema.prisma`, change:
```prisma
enum PaymentProvider {
  MANUAL
  STRIPE
}
```
to:
```prisma
enum PaymentProvider {
  MANUAL
  STRIPE
  SATIM
}
```

- [ ] **Step 4: Update `Transaction` model**

Replace the Transaction model's amount and provider fields. The full updated model:
```prisma
model Transaction {
  id       String @id @default(cuid())
  paidById String
  paidBy   User   @relation("TransactionPaidBy", fields: [paidById], references: [id], onDelete: Restrict)
  paidToId String
  paidTo   User   @relation("TransactionPaidTo", fields: [paidToId], references: [id], onDelete: Restrict)

  campaignId      String?
  campaign        Campaign? @relation(fields: [campaignId], references: [id], onDelete: SetNull)

  participationId String?
  participation   CampaignParticipation? @relation(fields: [participationId], references: [id], onDelete: SetNull)

  grossAmountDinar      Int
  platformFeeCompany    Int
  platformFeeInfluencer Int
  netAmountInfluencer   Int

  provider         PaymentProvider @default(MANUAL)
  currency         String          @default("DZD")
  providerIntentId String?
  providerChargeId String?
  rawPayload       Json?

  status    TransactionStatus @default(PENDING)
  createdAt DateTime          @default(now())
}
```

Also add the reverse relation to `CampaignParticipation`:
```prisma
model CampaignParticipation {
  // ... existing fields ...
  transactions Transaction[]
}
```

- [ ] **Step 5: Add `APPLICATION_PRE_VALIDATED` to `NotificationType` enum**

```prisma
enum NotificationType {
  APPLICATION_ACCEPTED
  APPLICATION_REJECTED
  APPLICATION_PRE_VALIDATED
  CAMPAIGN_PUBLISHED
  CAMPAIGN_COMPLETED
  CAMPAIGN_CONFIRMED
  PAYMENT_RECEIVED
  NEW_MESSAGE
  GENERAL
}
```

- [ ] **Step 6: Generate and run migration**

```bash
cd /Users/macbook/Documents/Dev/UGC26/ugc26
npx prisma migrate dev --name "multi-influencer-commissions"
```

Expected: migration file created and applied, Prisma client regenerated.

- [ ] **Step 7: Verify Prisma client compiles**

```bash
npx prisma generate
```

Expected: "Generated Prisma Client"

- [ ] **Step 8: Commit**

```bash
git add prisma/schema.prisma prisma/migrations/
git commit -m "feat(schema): multi-influencer support, commission fields, adminPreValidated"
```

---

### Task 2: Commission calculation module

**Files:**
- Create: `src/lib/commissions.ts`

- [ ] **Step 1: Create the file**

```typescript
// src/lib/commissions.ts

export interface CommissionBreakdown {
  grossAmountDinar: number;      // what company actually pays
  platformFeeCompany: number;    // 10% added on top
  platformFeeInfluencer: number; // 5% deducted from influencer
  netAmountInfluencer: number;   // what influencer receives
}

export function calcCommissions(priceDinar: number): CommissionBreakdown {
  const platformFeeCompany = Math.round(priceDinar * 0.10);
  const platformFeeInfluencer = Math.round(priceDinar * 0.05);
  const grossAmountDinar = priceDinar + platformFeeCompany;
  const netAmountInfluencer = priceDinar - platformFeeInfluencer;
  return { grossAmountDinar, platformFeeCompany, platformFeeInfluencer, netAmountInfluencer };
}
```

- [ ] **Step 2: Verify math with a quick sanity check**

For `priceDinar = 10000`:
- `platformFeeCompany` = 1000
- `platformFeeInfluencer` = 500
- `grossAmountDinar` = 11000
- `netAmountInfluencer` = 9500
- Platform earns: 1500 DZD total

- [ ] **Step 3: Commit**

```bash
git add src/lib/commissions.ts
git commit -m "feat: commission calculation module (10% company, 5% influencer)"
```

---

### Task 3: SATIM stub module + env vars

**Files:**
- Create: `src/lib/satim.ts`
- Modify: `src/server/env.ts`

- [ ] **Step 1: Add SATIM env vars to `src/server/env.ts`**

Current file uses `z.object({...})`. Add:
```typescript
// Add to EnvSchema:
SATIM_TERMINAL_ID: z.string().optional(),
SATIM_MERCHANT_ID: z.string().optional(),
SATIM_PASSWORD: z.string().optional(),
SATIM_BASE_URL: z.string().optional(),
NEXT_PUBLIC_APP_URL: z.string().optional(),
```

Also add them to the `env` object at the bottom:
```typescript
export const env: AppEnv = EnvSchema.parse({
  // ...existing...
  SATIM_TERMINAL_ID: process.env.SATIM_TERMINAL_ID,
  SATIM_MERCHANT_ID: process.env.SATIM_MERCHANT_ID,
  SATIM_PASSWORD: process.env.SATIM_PASSWORD,
  SATIM_BASE_URL: process.env.SATIM_BASE_URL,
  NEXT_PUBLIC_APP_URL: process.env.NEXT_PUBLIC_APP_URL,
});
```

- [ ] **Step 2: Create `src/lib/satim.ts`**

```typescript
// src/lib/satim.ts
import { env } from "@/server/env";

export interface SatimPaymentParams {
  orderId: string;         // unique order ID (use participationId)
  grossAmountDinar: number;
  returnUrl: string;       // success redirect
  failUrl: string;         // failure redirect
}

export interface SatimInitResult {
  redirectUrl: string;
}

export interface SatimVerifyResult {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
}

export async function initiateSatimPayment(params: SatimPaymentParams): Promise<SatimInitResult> {
  // In production: POST to SATIM API to register order, get redirect URL
  // Stub: redirect to dev callback
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return {
    redirectUrl: `${base}/api/payments/satim/dev-callback?orderId=${params.orderId}&success=true`,
  };
}

export async function verifySatimPayment(orderId: string): Promise<SatimVerifyResult> {
  // In production: call SATIM getOrderStatus endpoint
  // Stub: always succeeds
  return { success: true, transactionId: `SATIM-DEV-${orderId}` };
}
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/satim.ts src/server/env.ts
git commit -m "feat: SATIM payment stub module + env vars"
```

---

### Task 4: SATIM payment initiation endpoint

**Files:**
- Create: `src/app/api/payments/satim/initiate/route.ts`

This endpoint accepts an `applicationId` (CampaignApplication), creates the CampaignParticipation if it doesn't exist, then initiates the SATIM payment. This way the company applicants page passes `applicationId` directly.

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app/api/payments/satim/initiate"
```

- [ ] **Step 2: Write the route**

```typescript
// src/app/api/payments/satim/initiate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { calcCommissions } from "@/lib/commissions";
import { initiateSatimPayment } from "@/lib/satim";
import { env } from "@/server/env";

export async function POST(req: Request) {
  const user = await requireRole("COMPANY");
  const body = (await req.json().catch(() => null)) as { applicationId?: string } | null;

  const applicationId = body?.applicationId;
  if (!applicationId) {
    return NextResponse.json({ error: "Missing applicationId" }, { status: 400 });
  }

  const application = await prisma.campaignApplication.findUnique({
    where: { id: applicationId },
    include: { campaign: true },
  });

  if (!application || application.campaign.companyId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (!application.adminPreValidated) {
    return NextResponse.json({ error: "Application not pre-validated" }, { status: 403 });
  }

  // Create participation if it doesn't exist yet
  const participation = await prisma.campaignParticipation.upsert({
    where: {
      campaignId_influencerId: {
        campaignId: application.campaignId,
        influencerId: application.influencerId,
      },
    },
    update: {},
    create: {
      campaignId: application.campaignId,
      influencerId: application.influencerId,
      status: "UPCOMING",
    },
  });

  if (participation.status !== "UPCOMING") {
    return NextResponse.json({ error: "Payment already initiated for this influencer" }, { status: 409 });
  }

  const { grossAmountDinar } = calcCommissions(application.campaign.priceDinar);
  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";

  const result = await initiateSatimPayment({
    orderId: participation.id,
    grossAmountDinar,
    returnUrl: `${base}/company/campaigns/${application.campaignId}`,
    failUrl: `${base}/company/campaigns/${application.campaignId}?paymentFailed=true`,
  });

  return NextResponse.json({ redirectUrl: result.redirectUrl });
}
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/payments/satim/initiate/route.ts"
git commit -m "feat: SATIM payment initiation endpoint"
```

---

### Task 5: SATIM dev callback endpoint

**Files:**
- Create: `src/app/api/payments/satim/dev-callback/route.ts`

- [ ] **Step 1: Create directory and file**

```bash
mkdir -p "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app/api/payments/satim/dev-callback"
```

- [ ] **Step 2: Write the route**

```typescript
// src/app/api/payments/satim/dev-callback/route.ts
import { NextRequest, NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { calcCommissions } from "@/lib/commissions";
import { createNotification } from "@/server/notifications";
import { env } from "@/server/env";

export async function GET(req: NextRequest) {
  if (env.NODE_ENV === "production") {
    return NextResponse.json({ error: "Not available in production" }, { status: 404 });
  }

  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("orderId");     // this is participationId
  const success = searchParams.get("success") === "true";

  if (!orderId) {
    return NextResponse.json({ error: "Missing orderId" }, { status: 400 });
  }

  const participation = await prisma.campaignParticipation.findUnique({
    where: { id: orderId },
    include: { campaign: true },
  });

  if (!participation) {
    return NextResponse.json({ error: "Participation not found" }, { status: 404 });
  }

  if (!success) {
    const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
    return NextResponse.redirect(`${base}/company/campaigns/${participation.campaignId}?paymentFailed=true`);
  }

  const { grossAmountDinar, platformFeeCompany, platformFeeInfluencer, netAmountInfluencer } =
    calcCommissions(participation.campaign.priceDinar);

  await prisma.$transaction([
    prisma.transaction.create({
      data: {
        paidById: participation.campaign.companyId,
        paidToId: participation.influencerId,
        campaignId: participation.campaignId,
        participationId: orderId,
        grossAmountDinar,
        platformFeeCompany,
        platformFeeInfluencer,
        netAmountInfluencer,
        status: "PENDING",
        provider: "SATIM",
      },
    }),
    prisma.campaignParticipation.update({
      where: { id: orderId },
      data: { status: "ONGOING" },
    }),
  ]);

  await createNotification({
    userId: participation.influencerId,
    type: "APPLICATION_ACCEPTED",
    title: "Paiement reçu — campagne démarrée",
    message: `La campagne "${participation.campaign.title}" a démarré. Paiement de ${netAmountInfluencer.toLocaleString()} DZD en attente.`,
    link: "/influencer/campaigns",
  });

  const base = env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  return NextResponse.redirect(`${base}/company/campaigns/${participation.campaignId}`);
}
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/payments/satim/dev-callback/route.ts"
git commit -m "feat: SATIM dev callback — creates transaction, starts participation"
```

---

### Task 6: Admin pre-validation endpoint

**Files:**
- Create: `src/app/api/admin/applications/[id]/pre-validate/route.ts`

- [ ] **Step 1: Find the existing accept endpoint that rejects all others**

Search for the "reject all others" logic:
```bash
grep -r "REJECTED" /Users/macbook/Documents/Dev/UGC26/ugc26/src/app/api --include="*.ts" -l
```

Read each file found and identify which one does a bulk update to REJECTED status.

- [ ] **Step 2: Remove the "reject all others" bulk update**

In whichever file does this, remove the `prisma.campaignApplication.updateMany({ where: { campaignId, NOT: { id: appId } }, data: { status: "REJECTED" } })` call or equivalent. Keep only the update to the accepted application itself.

- [ ] **Step 3: Create directory and pre-validate route**

```bash
mkdir -p "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app/api/admin/applications/[id]/pre-validate"
```

```typescript
// src/app/api/admin/applications/[id]/pre-validate/route.ts
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";

export async function POST(
  _req: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  await requireRole("ADMIN");
  const { id } = await params;

  const application = await prisma.campaignApplication.findUnique({
    where: { id },
    include: {
      campaign: { include: { company: true } },
      influencer: true,
    },
  });

  if (!application) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  if (application.adminPreValidated) {
    return NextResponse.json({ ok: true }); // idempotent
  }

  await prisma.campaignApplication.update({
    where: { id },
    data: { adminPreValidated: true },
  });

  await createNotification({
    userId: application.campaign.companyId,
    type: "APPLICATION_PRE_VALIDATED",
    title: "Candidature pré-validée",
    message: `${application.influencer.firstName} ${application.influencer.lastName} a été pré-validé(e) pour votre campagne "${application.campaign.title}". Vous pouvez maintenant le/la sélectionner.`,
    link: `/company/campaigns/${application.campaignId}/applicants`,
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 4: Commit**

```bash
git add "src/app/api/admin/applications/"
git commit -m "feat: admin pre-validation endpoint + remove reject-all side-effect"
```

---

### Task 7: Update confirm-completion route to use commission fields

**Files:**
- Modify: `src/app/api/company/confirm-completion/route.ts`

- [ ] **Step 1: Read the current file**

```bash
cat "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app/api/company/confirm-completion/route.ts"
```

- [ ] **Step 2: Update the transaction creation**

Replace the `prisma.transaction.create` call inside `prisma.$transaction([...])`. The full updated route:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";
import { calcCommissions } from "@/lib/commissions";

export async function POST(req: Request) {
  const user = await requireRole("COMPANY");
  const body = (await req.json().catch(() => null)) as
    | { participationId?: string }
    | null;

  const participationId = body?.participationId;
  if (!participationId) {
    return NextResponse.json({ error: "Missing participationId" }, { status: 400 });
  }

  const participation = await prisma.campaignParticipation.findUnique({
    where: { id: participationId },
    include: { campaign: true },
  });
  if (!participation || participation.campaign.companyId !== user.id) {
    return NextResponse.json({ error: "Not found" }, { status: 404 });
  }

  const { grossAmountDinar, platformFeeCompany, platformFeeInfluencer, netAmountInfluencer } =
    calcCommissions(participation.campaign.priceDinar);

  await prisma.$transaction([
    prisma.campaignParticipation.update({
      where: { id: participationId },
      data: { status: "CONFIRMED" },
    }),
    prisma.campaign.update({
      where: { id: participation.campaignId },
      data: { status: "CONFIRMED" },
    }),
    prisma.transaction.create({
      data: {
        paidById: user.id,
        paidToId: participation.influencerId,
        campaignId: participation.campaignId,
        participationId,
        grossAmountDinar,
        platformFeeCompany,
        platformFeeInfluencer,
        netAmountInfluencer,
        status: "PENDING",
        provider: "MANUAL",
      },
    }),
  ]);

  await createNotification({
    userId: participation.influencerId,
    type: "CAMPAIGN_CONFIRMED",
    title: "Campagne confirmée",
    message: `L'entreprise a confirmé l'achèvement de la campagne "${participation.campaign.title}". Vous recevrez ${netAmountInfluencer.toLocaleString()} DZD.`,
    link: "/influencer/campaigns",
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/company/confirm-completion/route.ts"
git commit -m "feat: confirm-completion uses commission breakdown fields"
```

---

### Task 8: Update admin mark-paid endpoint to use commission fields

**Files:**
- Modify: `src/app/api/admin/transactions/route.ts`

- [ ] **Step 1: Read the current file**

```bash
cat "/Users/macbook/Documents/Dev/UGC26/ugc26/src/app/api/admin/transactions/route.ts"
```

- [ ] **Step 2: Update the route**

The current route creates a NEW transaction. Instead, it should update the EXISTING PENDING transaction to PAID. Updated route:

```typescript
import { NextResponse } from "next/server";
import { prisma } from "@/server/db";
import { requireRole } from "@/server/guards";
import { createNotification } from "@/server/notifications";

export async function POST(req: Request) {
  await requireRole("ADMIN");
  const body = (await req.json().catch(() => null)) as
    | { participationId?: string }
    | null;
  const participationId = body?.participationId;
  if (!participationId) {
    return NextResponse.json({ error: "Missing participationId" }, { status: 400 });
  }

  const participation = await prisma.campaignParticipation.findUnique({
    where: { id: participationId },
    include: {
      campaign: true,
      transactions: { where: { status: "PENDING" }, take: 1 },
    },
  });
  if (!participation) return NextResponse.json({ error: "Not found" }, { status: 404 });

  const pendingTx = participation.transactions[0];
  if (!pendingTx) {
    return NextResponse.json({ error: "No pending transaction found" }, { status: 404 });
  }

  await prisma.$transaction([
    prisma.transaction.update({
      where: { id: pendingTx.id },
      data: { status: "PAID" },
    }),
    prisma.campaignParticipation.update({
      where: { id: participationId },
      data: { status: "PAID" },
    }),
    prisma.campaign.update({
      where: { id: participation.campaignId },
      data: { status: "PAID" },
    }),
  ]);

  await createNotification({
    userId: participation.influencerId,
    type: "PAYMENT_RECEIVED",
    title: "Paiement reçu !",
    message: `Vous avez reçu ${pendingTx.netAmountInfluencer.toLocaleString()} DZD pour la campagne "${participation.campaign.title}".`,
    link: "/influencer/payments",
  });

  return NextResponse.json({ ok: true });
}
```

- [ ] **Step 3: Commit**

```bash
git add "src/app/api/admin/transactions/route.ts"
git commit -m "feat: admin mark-paid updates existing transaction instead of creating new one"
```

---

### Task 9: TypeScript compile check

- [ ] **Step 1: Run type check**

```bash
cd /Users/macbook/Documents/Dev/UGC26/ugc26 && npx tsc --noEmit
```

Expected: no errors. Fix any type errors related to `amountDinar` references — search for remaining usages:

```bash
grep -r "amountDinar" src/ --include="*.ts" --include="*.tsx"
```

For each hit, update to use `grossAmountDinar` (for company-facing) or `netAmountInfluencer` (for influencer-facing) as appropriate.

- [ ] **Step 2: Commit fixes if any**

```bash
git add -A
git commit -m "fix: remove remaining amountDinar references, use commission fields"
```
