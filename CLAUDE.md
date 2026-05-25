# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

**InteFin** (Inteligencia Financiera) — SaaS multi-tenant para coaches financieros.
MVP centrado en la práctica de Mabel Álvarez; arquitectura lista para escalar a múltiples coaches.

**Design spec:** `docs/superpowers/specs/2026-05-22-intefin-design.md`
**Backlog:** `docs/backlog.md`

## Stack

| Layer | Tech |
|-------|------|
| Frontend/Backend | Next.js 15 App Router, TypeScript |
| Database + Auth | Supabase (PostgreSQL + RLS) |
| UI | shadcn/ui + Tailwind CSS (dark theme) |
| i18n | next-intl (ES + EN) — installed, not yet configured |
| Charts | Recharts |
| Email | Resend + React Email (wired — ver `src/lib/email/`) |
| Hosting | Vercel |

## Commands

```bash
npm run dev      # start dev server (localhost:3000)
npm run build    # production build + type check
npm run lint     # ESLint
```

## Deploy to Production

```bash
# Deploy directly — Vercel cloud build has access to encrypted env vars
# DO NOT use --prebuilt: vercel pull downloads empty strings for encrypted vars
vercel deploy --prod --yes
```

> ⚠️ Never use `vercel build` locally + `--prebuilt`: the `vercel pull` command
> downloads encrypted env vars as empty strings, breaking `NEXT_PUBLIC_*` at runtime.

## Environment Variables

```bash
# .env.local (required)
NEXT_PUBLIC_SUPABASE_URL=https://cgeowklrdzhlwhllfopo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...        # Dashboard → Settings → API → service_role
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (Resend) — server-only, never NEXT_PUBLIC_
RESEND_API_KEY=re_...                   # resend.com/api-keys
EMAIL_FROM=InteFin <hola@intefin.app>  # sender must match a verified Resend domain

# Billing (Wompi — Colombia)
WOMPI_PUBLIC_KEY=pub_...
WOMPI_PRIVATE_KEY=prv_...
WOMPI_INTEGRITY_SECRET=...
WOMPI_EVENTS_SECRET=...                 # webhook signature verification
```

## Supabase Project

- **Project ID:** `cgeowklrdzhlwhllfopo`
- **Dashboard:** https://supabase.com/dashboard/project/cgeowklrdzhlwhllfopo
- **Auth callback URL to add:** `http://localhost:3000/auth/callback`

## Architecture

### Multi-tenant Pattern
Every data table has `organization_id`. Supabase RLS policies use `get_my_org_id()` helper function to enforce tenant isolation — a coach never sees another coach's data regardless of app-level bugs.

### Auth Flow
1. Magic link (no passwords) via `supabase.auth.signInWithOtp`
2. `/auth/callback` exchanges code → detects user type (invited client vs new coach) → routes accordingly
3. DB trigger `on_auth_user_created` auto-creates a bare `profiles` row on signup

### Role Routing
- New user → `/onboarding` (coach creates org)
- Invited client → `/onboarding/client` (diagnostic form)
- Coach (onboarding complete) → `/coach/overview`
- Client (onboarding complete) → `/app/dashboard`

### Key Files
```
src/
├── app/
│   ├── auth/callback/route.ts        — magic link + invite flows
│   ├── auth/login/page.tsx           — OTP email input
│   ├── onboarding/page.tsx           — coach creates org + profile
│   ├── coach/
│   │   ├── layout.tsx                — auth guard + sidebar
│   │   ├── overview/page.tsx         — stats + recent clients
│   │   ├── clients/page.tsx          — full client list
│   │   ├── clients/[id]/page.tsx     — client detail: profile + 4 accounts
│   │   ├── invite/page.tsx           — invite client by email
│   │   ├── leads/page.tsx            — quiz leads capture
│   │   └── settings/page.tsx         — org settings + plan card
│   ├── api/
│   │   └── wompi/webhook/route.ts    — Wompi payment webhook → activates Pro plan
│   ├── [slug]/page.tsx               — public coach profile
│   └── [slug]/test/page.tsx          — public financial quiz (lead gen)
├── actions/
│   ├── onboarding.ts                 — completeCoachOnboarding (sends welcome email)
│   ├── coach.ts                      — inviteClient (sends invite email)
│   ├── billing.ts                    — startProCheckout → Wompi URL
│   ├── settings.ts                   — updateOrgSettings
│   └── quiz.ts                       — submitQuizLead
├── lib/
│   ├── supabase/
│   │   ├── client.ts                 — browser client
│   │   ├── server.ts                 — server client (SSR)
│   │   ├── admin.ts                  — service_role client (server actions only)
│   │   └── types.ts                  — generated + manual TypeScript types
│   ├── email/
│   │   ├── client.ts                 — Resend SDK singleton
│   │   ├── send.ts                   — sendEmail() wrapper (never throws)
│   │   ├── index.ts                  — public API: sendClientInviteEmail, sendCoachWelcomeEmail, sendPlanUpgradeEmail
│   │   └── templates/
│   │       ├── ClientInvite.tsx      — invite email with magic link
│   │       ├── CoachWelcome.tsx      — welcome email after onboarding
│   │       └── PlanUpgrade.tsx       — Pro plan activation confirmation
│   ├── plan/
│   │   ├── limits.ts                 — PLANS config, hasClientCapacity()
│   │   └── expiration.ts             — effectivePlan(), extendExpiration()
│   ├── wompi/
│   │   ├── checkout.ts               — buildCheckoutUrl(), signed URL generation
│   │   └── webhook.ts                — verifyEventSignature(), WompiEvent types
│   └── quiz/
│       └── score.ts                  — computeQuizResult()
└── middleware.ts                      — auth guard for /app, /coach, /admin, /onboarding
```

## Database Tables

| Table | Purpose |
|-------|---------|
| `organizations` | One per coach/tenant — has `slug` for public URL |
| `profiles` | Extends `auth.users` — has `role`, `organization_id` |
| `client_profiles` | Client data linked to a coach + org |
| `client_invitations` | Pending invites — keyed by email+org |
| `financial_diagnostics` | Immutable snapshot of client's financial situation |
| `financial_accounts` | The 4 buckets (imprevisto/oxígeno/retiro/inversiones) |
| `account_snapshots` | Monthly balance history — drives charts |
| `goals` | Client financial goals |
| `coaching_sessions` | Session records with notes and deliverables |

## The 4-Account System (Mabel's Method)

| Account | Color | Target | Purpose |
|---------|-------|--------|---------|
| `imprevisto` | red `#f87171` | 1× monthly income | Emergency fund |
| `oxigeno` | orange `#fb923c` | 6× monthly income | 6-month safety net |
| `retiro` | violet `#a78bfa` | boolean (active?) | Life insurance / pension |
| `inversiones` | green `#34d399` | coach-defined | Investments — unlocks last |

**Inversiones is visually locked** until imprevisto + oxígeno each exceed 50%.

## Health Score Formula

```
score = (
  imprevisto_progress * 0.25 +   // max 25 pts
  oxigeno_progress    * 0.30 +   // max 30 pts
  retiro_active       * 0.20 +   // 20 pts (binary)
  inversiones_progress* 0.15 +   // max 15 pts
  debt_ratio_score    * 0.10     // max 10 pts
) * 100
```

## Billing — Wompi (Colombia)

- Coach inicia pago desde `/coach/settings` → `startProCheckout()` → redirect a Wompi
- Wompi llama a `POST /api/wompi/webhook` al completar el pago
- Webhook verifica HMAC, actualiza `subscription_payments`, activa `organizations.plan = 'pro'`
- Plan Pro expira en `plan_expires_at`; `effectivePlan()` revierte a Free si expiró
- Test keys en `.env.local`; producción usa keys reales en Vercel

## Email — Resend + React Email

- `src/lib/email/` — módulo completo con 3 templates en español, paleta dark de InteFin
- `sendEmail()` es fire-and-forget: nunca lanza, loggea en consola si no hay `RESEND_API_KEY`
- Disparado desde: `inviteClient()`, `completeCoachOnboarding()`, webhook Wompi
- **Pendiente:** dominio `intefin.app` debe estar verificado en Resend para que el SMTP funcione
- Mientras tanto: deshabilitar Custom SMTP en Supabase Dashboard y usar el relay por defecto

## Plan System

| Plan | Límite | Precio |
|------|--------|--------|
| Free | 3 clientes activos | $0 |
| Pro | Ilimitado | $50.000 COP/mes |

- `PLANS` en `src/lib/plan/limits.ts`
- `hasClientCapacity()` se evalúa en `inviteClient()` antes de crear la invitación
- `effectivePlan()` usa `plan_expires_at` para revertir Pro → Free si expiró

## Visual Design

- **Background:** `#0a0f1e` / Surface: `#0f172a` / `#1e293b`
- **Primary accent:** `#6366f1` (indigo)
- **Text:** `#f1f5f9` (primary) / `#64748b` (secondary)
- Dashboard: dark theme + hero patrimonio neto + 4 account cards with left-border color + horizontal progress bars
