# InteliFin

**Inteligencia Financiera** — SaaS multi-tenant para coaches financieros.

Plataforma que permite a coaches como Mabel Álvarez gestionar clientes, registrar sesiones, hacer seguimiento al progreso financiero con las 4 cuentas, y generar leads a través de un test público gratuito.

**URL producción:** [https://intelifin.online](https://intelifin.online)

---

## Stack

| Capa | Tecnología |
|------|-----------|
| Frontend/Backend | Next.js 15 App Router + TypeScript |
| Base de datos + Auth | Supabase (PostgreSQL + RLS) |
| UI | shadcn/ui + Tailwind CSS (dark theme) |
| Email | Resend + React Email |
| Pagos | Wompi (Colombia) |
| Charts | Recharts |
| Hosting | Vercel |

---

## Desarrollo local

### Requisitos
- Node.js 18+
- npm

### Setup

```bash
# 1. Instalar dependencias
npm install

# 2. Configurar variables de entorno
cp .env.example .env.local
# Edita .env.local con tus valores (ver sección abajo)

# 3. Iniciar servidor de desarrollo
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

### Comandos

```bash
npm run dev      # servidor de desarrollo (localhost:3000)
npm run build    # build de producción + type check
npm run lint     # ESLint
npm test         # tests unitarios (Vitest)
```

---

## Variables de entorno

Crea `.env.local` en la raíz:

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://cgeowklrdzhlwhllfopo.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# URL del sitio
NEXT_PUBLIC_SITE_URL=http://localhost:3000

# Email (Resend) — nunca NEXT_PUBLIC_
RESEND_API_KEY=re_...
EMAIL_FROM=InteliFin <hola@intelifin.online>

# Pagos (Wompi — Colombia)
WOMPI_PUBLIC_KEY=pub_...
WOMPI_PRIVATE_KEY=prv_...
WOMPI_INTEGRITY_SECRET=...
WOMPI_EVENTS_SECRET=...

# Cron jobs
CRON_SECRET=...   # openssl rand -hex 32
```

---

## Arquitectura

### Multi-tenant
Cada tabla tiene `organization_id`. Supabase RLS usa `get_my_org_id()` para aislar datos entre coaches — un coach nunca ve datos de otro.

### Auth flow
1. Magic link via `supabase.auth.signInWithOtp` (sin contraseñas)
2. `/auth/callback` detecta tipo de usuario → redirige según rol
3. Trigger `on_auth_user_created` crea fila en `profiles` automáticamente

### Las 4 cuentas (método Mabel)

| Cuenta | Color | Target | Propósito |
|--------|-------|--------|-----------|
| Imprevisto | `#f87171` | 1× ingreso/mes | Fondo emergencias |
| Oxígeno | `#fb923c` | 6× ingreso/mes | 6 meses sin trabajo |
| Retiro | `#a78bfa` | Booleano | Seguro de vida / pensión |
| Inversiones | `#34d399` | Definido por coach | Crecimiento — se desbloquea al 50% en Imprevisto + Oxígeno |

### Rutas principales

```
/                               Landing pública
/[slug]                         Perfil público del coach
/[slug]/test                    Test gratuito de salud financiera
/auth/login                     Login magic link
/auth/callback                  Callback OAuth/magic link
/onboarding                     Coach crea organización
/onboarding/client              Cliente completa diagnóstico
/coach/overview                 Panel del coach
/coach/clients                  Lista de clientes
/coach/clients/[id]             Detalle del cliente
/coach/sessions                 Historial global de sesiones
/coach/invite                   Invitar cliente
/coach/leads                    Leads del test público
/coach/settings                 Configuración + plan
/app/dashboard                  Dashboard del cliente
/app/goals                      Metas financieras
/app/sessions                   Historial de sesiones
/pricing                        Página de precios
/api/wompi/webhook              Webhook de pagos Wompi
/api/cron/pro-renewal-reminder  Cron recordatorio renovación Pro
```

---

## Planes

| Plan | Límite | Precio |
|------|--------|--------|
| Free | 3 clientes activos | $0 |
| Pro | Ilimitado | $50.000 COP/mes |

`effectivePlan()` en `src/lib/plan/expiration.ts` revierte a Free si `plan_expires_at` expiró.

---

## Deploy

```bash
# Deploy a producción — build en Vercel cloud
vercel deploy --prod --yes
```

> ⚠️ No usar `vercel build` local + `--prebuilt`: las vars encriptadas quedan vacías en `vercel pull`.

---

## Tests

```bash
npm test
```

64 tests unitarios con Vitest cubriendo `calculateTargets`, `calculateScore`, `computeQuizResult`.

---

## Documentación

- [`CLAUDE.md`](./CLAUDE.md) — Guía técnica para Claude Code
- [`docs/manual.md`](./docs/manual.md) — Manual de usuario (coaches, clientes, visitantes)
- [`docs/runbook.md`](./docs/runbook.md) — Guía operacional (deploy, servicios, crons)
- [`docs/backlog.md`](./docs/backlog.md) — Backlog de features
