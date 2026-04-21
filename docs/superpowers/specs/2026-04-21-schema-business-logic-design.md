---
title: Plan 1 — Schema & Business Logic
date: 2026-04-21
status: approved
---

# Plan 1 — Schema & Business Logic

## Goal

Update the Prisma schema and server-side business logic to support: multi-influencer campaigns, 2-step application validation (admin pre-validates → company selects), SATIM payment stub with commission model (company +10%, influencer -5%), and correct transaction structure.

## Architecture

All changes are schema-first: migrate Prisma, update affected API routes, remove broken assumptions (single influencer per campaign, auto-reject on accept). The SATIM integration is implemented as a stub module (`src/lib/satim.ts`) with real credentials plugged in later without touching business logic.

---

## 1. Schema Changes

### 1.1 `InfluencerProfile.socialNetworks`

**Before:** `socialNetworks String?` (CSV string)

**After:** `socialNetworks String[]` (Postgres array)

Valid values (enforced in application layer): `Instagram`, `TikTok`, `YouTube`, `Facebook`, `Snapchat`, `Twitter`

Migration: parse existing CSV rows and convert to array.

### 1.2 `CampaignApplication`

Add field:
```prisma
adminPreValidated Boolean @default(false)
```

This enables the 2-step flow: admin toggles `adminPreValidated = true` → company can see and select the applicant.

### 1.3 `Transaction`

**Remove:** `amountDinar` (replaced by structured fields)

**Add:**
```prisma
grossAmountDinar     Int     // what company actually paid (priceDinar × 1.10)
platformFeeCompany   Int     // 10% of priceDinar
platformFeeInfluencer Int    // 5% of priceDinar
netAmountInfluencer  Int     // priceDinar × 0.95
participationId      String? // FK to CampaignParticipation
```

Keep: `paidById`, `paidToId`, `campaignId`, `status`, `provider`, `createdAt`

### 1.4 `CampaignParticipation` (clarification)

No new fields needed — the existing `status` enum already covers `PENDING | ACCEPTED | REJECTED | COMPLETED | CONFIRMED | PAID`. The multi-influencer support comes from removing the "reject all others" logic, not from schema changes.

---

## 2. Application Flow Changes

### 2.1 Remove "reject all others" logic

**File:** `src/app/api/company/campaigns/[id]/applications/[appId]/route.ts` (or similar accept endpoint)

Current broken behavior: when company accepts one applicant, all other applicants are set to `REJECTED`.

**Fix:** Remove that side-effect entirely. Multiple applicants can be in `ACCEPTED` state simultaneously.

### 2.2 2-Step Validation Flow

```
Influencer applies → CampaignApplication (adminPreValidated: false)
Admin reviews → sets adminPreValidated: true → notifies company
Company views applicants (only adminPreValidated: true shown) → selects influencer(s)
→ SATIM payment initiated
→ On payment success: CampaignParticipation created, status = IN_PROGRESS
```

**New API endpoints needed:**
- `POST /api/admin/applications/[id]/pre-validate` — sets `adminPreValidated = true`, sends notification to company
- `GET /api/company/campaigns/[id]/applicants` — returns only `adminPreValidated: true` applications

### 2.3 Commission Calculation

Centralized in `src/lib/commissions.ts`:

```ts
export function calcCommissions(priceDinar: number) {
  const platformFeeCompany = Math.round(priceDinar * 0.10);
  const platformFeeInfluencer = Math.round(priceDinar * 0.05);
  const grossAmountDinar = priceDinar + platformFeeCompany;
  const netAmountInfluencer = priceDinar - platformFeeInfluencer;
  return { grossAmountDinar, platformFeeCompany, platformFeeInfluencer, netAmountInfluencer };
}
```

Used in: SATIM callback handler, admin "mark paid" action.

---

## 3. SATIM Stub

**File:** `src/lib/satim.ts`

```ts
export interface SatimPaymentInit {
  orderId: string;
  amountDinar: number; // grossAmountDinar
  returnUrl: string;
  failUrl: string;
}

export interface SatimPaymentResult {
  success: boolean;
  transactionId?: string;
  errorCode?: string;
}

export async function initiateSatimPayment(params: SatimPaymentInit): Promise<{ redirectUrl: string }> {
  // STUB: In dev, return a fake redirect to /api/payments/satim/callback?orderId=...&success=true
  return { redirectUrl: `/api/payments/satim/dev-callback?orderId=${params.orderId}&success=true` };
}

export async function verifySatimPayment(orderId: string): Promise<SatimPaymentResult> {
  // STUB: Always succeeds in dev
  return { success: true, transactionId: `SATIM-DEV-${orderId}` };
}
```

**Env vars (not filled yet):**
```
SATIM_TERMINAL_ID=
SATIM_MERCHANT_ID=
SATIM_PASSWORD=
SATIM_BASE_URL=https://satim.dz/payment/rest
```

### 3.1 Payment Initiation Endpoint

`POST /api/payments/satim/initiate`
- Requires COMPANY role
- Body: `{ participationId }`
- Looks up participation → campaign price → calculates commissions
- Calls `initiateSatimPayment()`
- Returns `{ redirectUrl }`

### 3.2 Dev Callback Endpoint

`GET /api/payments/satim/dev-callback`
- Only active when `NODE_ENV !== "production"`
- Params: `orderId`, `success`
- Creates Transaction with commission fields
- Updates CampaignParticipation status to `IN_PROGRESS`
- Redirects to `/company/campaigns/[id]`

### 3.3 Production Webhook

`POST /api/payments/satim/callback`
- Validates SATIM signature
- Same logic as dev callback

---

## 4. Updated `confirm-completion` Route

**File:** `src/app/api/company/confirm-completion/route.ts`

Update the transaction creation to use the new commission fields:

```ts
const { grossAmountDinar, platformFeeCompany, platformFeeInfluencer, netAmountInfluencer } =
  calcCommissions(participation.campaign.priceDinar);

prisma.transaction.create({
  data: {
    paidById: user.id,
    paidToId: participation.influencerId,
    campaignId: participation.campaignId,
    participationId: participationId,
    grossAmountDinar,
    platformFeeCompany,
    platformFeeInfluencer,
    netAmountInfluencer,
    status: "PENDING",
    provider: "MANUAL",
  },
}),
```

---

## 5. Cross-References

- Commission amounts displayed in **Plan 2** (company expenses page, influencer payments page)
- `adminPreValidated` flag used in **Plan 2** (admin pre-validation UI, company applicants view)
- `socialNetworks String[]` used in **Plan 2** (multi-platform chip selector on registration form)
- SATIM env vars documented in **Plan 4** (`.env.example`)
