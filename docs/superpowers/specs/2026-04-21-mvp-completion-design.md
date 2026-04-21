# UGC26 — MVP 100% Completion Design Spec
**Date:** 2026-04-21  
**Status:** Approved

---

## Scope

Completing all missing features to reach a fully functional MVP. The backend schema is complete; this spec covers UI, missing API routes, and infrastructure changes.

---

## 1. Email Verification

**Behavior:** Users can register and log in without verifying, but a persistent warning banner appears on all authenticated pages. Key actions are blocked until verified (apply to campaign, create campaign request, submit deliverable).

**Flow:**
1. On register (company or influencer) → generate a `PasswordResetToken`-style token (new `EmailVerificationToken` model or reuse existing pattern) → enqueue email via BullMQ with link `/auth/verify-email?token=xxx`
2. User clicks link → `GET /api/auth/verify-email?token=xxx` → validates token, sets `isVerified = true`, redirects to dashboard with success toast
3. Unverified users see a yellow banner at the top of AppShell: "📧 Vérifiez votre email. [Renvoyer l'email]"
4. Blocked actions show an inline message: "Vérifiez votre email pour effectuer cette action"
5. "Resend" button hits `POST /api/auth/resend-verification` — rate limited (1 per minute)

**DB change:** Add `EmailVerificationToken` model (same shape as `PasswordResetToken`: id, userId, tokenHash, expiresAt, createdAt). Expires in 24h.

---

## 2. File Upload — Local Filesystem

**Replace all base64 data URLs with server-side file storage.**

**Implementation:**
- New API route: `POST /api/upload` — accepts `multipart/form-data`, saves to `public/uploads/[year]/[month]/[uuid].[ext]`, returns `{ url: "/uploads/..." }`
- Max file size: 5MB. Allowed types: `image/jpeg`, `image/png`, `image/webp`
- All existing proof image inputs (`fileToDataUrl`) replaced with a `<FileUpload>` component that hits `/api/upload` and gets back a URL
- `public/uploads/` added to `.gitignore`
- Next.js serves files from `public/` statically — no extra config needed

**Affected locations:** Influencer campaign start/complete proof, deliverable file upload (optional), company campaign photo in request form.

---

## 3. Deliverables — Full Flow

### Layout
Both the company campaign page and the influencer campaign page use **tabs**: Infos · Applicants · Deliverables · Messages (company) / Infos · Execution · Deliverables · Messages (influencer).

### Company side (`/company/campaigns/[id]`)
- New page replacing the current campaigns list drill-down
- **Tab: Deliverables**
  - Form to create a deliverable: Type (select: Instagram Post, Story, Reel, Video, TikTok, YouTube, Other), Description/Brief (textarea), Assign to (All accepted influencers or a specific one)
  - List of existing deliverables grouped by influencer
  - Each deliverable card shows: type, brief, status badge, submission link (if submitted)
  - When status is SUBMITTED: **Approve** button + **Reject** button
  - Reject opens a modal with: reason (radio: Mauvaise qualité visuelle / Ne respecte pas le brief / Lien invalide / Autre) + mandatory debrief textarea + confirm button
  - On approve/reject: notification sent to influencer automatically

### Influencer side (`/influencer/campaigns/[id]`)
- **Tab: Deliverables**
  - List of deliverables assigned to this influencer
  - Each card shows: type, brief, status
  - When PENDING or REJECTED: input field "Lien de publication" + Submit button
  - When REJECTED: red card showing reason + debrief message from company + re-submit field
  - When SUBMITTED: "En attente de validation" state
  - When APPROVED: green card, locked
  - Progress bar: X/Y approuvés

### API routes needed
- `GET /api/company/campaigns/[id]/deliverables` — list deliverables for a campaign
- `POST /api/company/campaigns/[id]/deliverables` — create deliverable
- `PATCH /api/deliverables/[id]` — already exists, extend to handle: submit (influencer), approve (company), reject with feedback (company)

### DB fields used
`Deliverable`: type, description, fileUrl (optional), status (PENDING/SUBMITTED/APPROVED/REJECTED), feedback (rejection message). All already in schema.

---

## 4. Reviews — Banner + Modal

**Trigger:** When a `CampaignParticipation` reaches status CONFIRMED or PAID, and the current user hasn't yet reviewed the other party for this campaign.

**UI:** A yellow/amber banner appears at the bottom of the campaign page (company and influencer sides):
> "⭐ Campagne terminée ! Laissez un avis pour [Name] → [Bouton]"

**Modal:** Star rating (1–5, required) + optional comment textarea + Submit button.

**Rules:**
- One review per (reviewer, campaign) — enforced by DB unique constraint already in schema
- Entreprise reviews the influencer; influencer reviews the entreprise
- After submission: banner disappears, toast "Avis publié ✓"
- Reviews appear on public profiles (already rendered on `/public/influencers/[id]` and `/public/companies/[id]`)

**API:** `POST /api/reviews` — already exists.

---

## 5. Messaging — SSE Real-time

**Replace polling (5s interval) with Server-Sent Events.**

### SSE Architecture
- New route: `GET /api/conversations/[id]/stream` — returns `text/event-stream`, keeps connection open, pushes new messages as `data: {...}\n\n`
- Server stores pending events in Redis pub/sub: when a message is POSTed, publish to channel `conversation:{id}`
- The SSE route subscribes to Redis, forwards events to the client
- Client uses `EventSource` API, falls back gracefully if connection drops (reconnects automatically)

### Chat embedded in campaign tabs
- Both company and influencer campaign pages have a **Messages tab**
- Tab shows a full chat UI: message list + input — same design as `/messages` page
- Conversation is auto-created when a campaign is accepted (admin accepts an applicant → `POST /api/conversations` with campaignId + participants)
- If no conversation exists yet for this campaign+user pair, show "Démarrer la conversation" button
- `/messages` page remains the global hub for all conversations (sidebar + chat, also upgraded to SSE)

### Notification bell
- New SSE stream: `GET /api/notifications/stream` — pushes unread count updates
- Replaces the current polling mechanism in `NotificationBell` if any

### API routes needed
- `GET /api/conversations/[id]/stream` — SSE stream
- `GET /api/notifications/stream` — SSE stream for unread count
- `POST /api/conversations` — create conversation (called when admin accepts an applicant)

---

## 6. Company Campaign Detail Page

**New page:** `/company/campaigns/[id]`  
**Tabs:** Infos · Applicants · Deliverables · Messages

- **Infos tab:** Campaign details (title, description, price, status, photos, platforms, dates)
- **Applicants tab:** List of applicants with status badges. Note: acceptance is done by admin, so this tab is read-only for the company — shows who was accepted/rejected
- **Deliverables tab:** As described in section 3
- **Messages tab:** As described in section 5

The existing `/company/campaigns` list page gets a "Voir →" link on each campaign card.

---

## 7. Active Navigation State

**AppShell sidebar** — convert nav links to use `usePathname()` to detect current route.

Since AppShell is a server component, extract the nav links into a `NavLink` client component that uses `usePathname` for active highlighting:
- Active link: `bg-violet-100/80 text-violet-700 font-medium` + filled dot `bg-violet-500`
- Inactive link: current styles

---

## 8. Admin Search + Pagination

Add search inputs and cursor-based pagination (using existing `pagination.ts`) to:
- `/admin/influencers` — search by name/email
- `/admin/companies` — search by name/email/company name  
- `/admin/campaigns` — search by title, filter by status

Implementation: server-side filtering via searchParams, "Load more" button or page numbers using existing pagination utility.

---

## 9. Influencer Payments Page

Replace the current static placeholder with real data:
- Fetch actual transactions from DB (`paidToId = user.id`)
- Show: Total earned (PAID), Pending (PENDING), transaction history table
- Bank details form: fields for bank name, account holder, IBAN — saved to a new `BankDetails` field on `InfluencerProfile` (or a separate simple JSON field)

**DB change:** Add `bankDetails Json?` to `InfluencerProfile` — stores `{ bankName, accountHolder, iban }`. No migration complexity.

---

## 10. Influencer Disputes

Add a **"Ouvrir un dispute"** button on the influencer campaign detail page (visible when participation status is ONGOING or COMPLETED).

Opens a modal: reason textarea + submit → `POST /api/disputes`.

Dispute then appears in admin `/admin/disputes` for resolution.

---

## 11. Global Polish

- `.gitignore` — add `public/uploads/` and `.superpowers/`
- `next.config.ts` — ensure `public/uploads` is not cached aggressively
- All admin list pages — consistent empty states using `EmptyState` component
- Dark mode — audit all new components for `dark:` variants

---

## Architecture Summary

```
New DB models:    EmailVerificationToken
Modified models:  InfluencerProfile (+ bankDetails)
New API routes:   /api/upload, /api/auth/verify-email, /api/auth/resend-verification,
                  /api/conversations/[id]/stream, /api/notifications/stream,
                  /api/conversations (POST), /api/company/campaigns/[id]/deliverables (GET/POST)
New pages:        /company/campaigns/[id], /auth/verify-email
Modified pages:   /influencer/campaigns/[id], /messages, /influencer/payments,
                  AppShell (NavLink client component), /admin/influencers,
                  /admin/companies, /admin/campaigns
New components:   FileUpload, NavLink, ReviewModal, DeliverableRejectModal,
                  VerificationBanner, CampaignTabs
```

---

## 12. Global Design System — Dark Luxury Web3

**Direction:** "Dark Luxury Web3" — premium, dark-first, Web3/crypto inspired with Algerian cultural accent.

### Color Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--color-bg` | `#080B18` | Page background (Obsidian) |
| `--color-surface` | `rgba(255,255,255,0.03)` | Glass cards |
| `--color-surface-strong` | `rgba(255,255,255,0.06)` | Elevated cards |
| `--color-border` | `rgba(255,255,255,0.08)` | Default borders |
| `--color-primary` | `#7C3AED` | Primary actions, active states |
| `--color-primary-light` | `#C4B5FD` | Gradient endpoint, text on dark |
| `--color-gold` | `#D97706` | Payments, approvals, CTAs (Saharan Gold) |
| `--color-gold-light` | `#FBBF24` | Gold text, amounts |
| `--color-success` | `#10B981` | Success states, earnings |
| `--color-danger` | `#F43F5E` | Rejections, alerts |
| `--color-text` | `#E2E8F0` | Primary text |
| `--color-muted` | `#64748B` | Secondary text |

### Background
```css
background: #080B18;
/* Animated ambient glow: */
radial-gradient(ellipse 80% 50% at 20% 20%, rgba(99,66,214,0.15) 0%, transparent 60%),
radial-gradient(ellipse 60% 40% at 80% 80%, rgba(245,158,11,0.08) 0%, transparent 60%)
```

### Component Tokens
- **Glass card:** `background: rgba(255,255,255,0.03); border: 1px solid rgba(255,255,255,0.08); backdrop-filter: blur(20px); border-radius: 16px`
- **Glow border (featured):** pseudo-element with `background: linear-gradient(135deg, rgba(139,92,246,0.5), rgba(245,158,11,0.3))`
- **Primary button:** `background: linear-gradient(135deg, #7C3AED, #4F46E5); box-shadow: 0 4px 15px rgba(124,58,237,0.3)`
- **Gold button:** `background: linear-gradient(135deg, #D97706, #F59E0B); box-shadow: 0 4px 15px rgba(245,158,11,0.25)`
- **Active nav dot:** `background: #8B5CF6; box-shadow: 0 0 6px rgba(139,92,246,0.6)`
- **Input default:** `background: rgba(255,255,255,0.04); border: 1px solid rgba(255,255,255,0.08)`
- **Input focused:** `background: rgba(139,92,246,0.05); border-color: rgba(139,92,246,0.4); box-shadow: 0 0 0 3px rgba(139,92,246,0.1)`

### Typography
- Font: `Inter` (already in project)
- Hero titles: `font-weight: 900; letter-spacing: -0.03em`
- Section titles: `font-size: 11px; font-weight: 600; letter-spacing: 0.12em; text-transform: uppercase; color: #475569`
- Gradient text: `background: linear-gradient(135deg, #C4B5FD 0%, #818CF8 40%, #FBBF24 100%); -webkit-background-clip: text; -webkit-text-fill-color: transparent`

### Migration from Current Light Theme
- Swap `bg-mesh` (light) → dark ambient gradient
- Swap `bg-white/60` → `rgba(255,255,255,0.03)`
- Swap `border-white/20` → `rgba(255,255,255,0.08)`
- Swap `text-slate-900` → `#E2E8F0`
- Swap `text-slate-500` → `#64748B`
- All Tailwind `bg-violet-*` classes replaced with CSS custom properties or inline styles using new palette
- Update `globals.css` with new CSS custom properties + background

---

## Implementation Order

1. DB migrations (EmailVerificationToken + bankDetails)
2. Global design system (globals.css, dark theme, CSS tokens)
3. File upload API + FileUpload component
4. Email verification (token, email, verify page, banner)
5. Active nav state (NavLink client component)
6. Company campaign detail page + tabs scaffold
7. Deliverables full flow (company create + influencer submit + approve/reject + feedback)
8. SSE messaging (stream routes + Redis pub/sub + embed in campaign tabs)
9. Reviews (banner + modal)
10. Influencer payments (real data + bank form)
11. Influencer disputes (modal)
12. Admin search + pagination
13. Global polish (empty states, gitignore, audit all pages for new design)
