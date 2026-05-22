# InteFin — Backlog

> Última actualización: 2026-05-22

---

## ✅ Completado

### Infraestructura
- [x] Next.js 15 App Router + TypeScript + Tailwind CSS
- [x] Supabase project creado (`cgeowklrdzhlwhllfopo`)
- [x] shadcn/ui inicializado (dark theme)
- [x] Dependencias: `@supabase/ssr`, `next-intl`, `recharts`, `resend`
- [x] `.env.local` con credenciales Supabase
- [x] `.gitignore` con `.env*` y `.superpowers/`

### Base de Datos
- [x] 9 tablas: `organizations`, `profiles`, `client_profiles`, `client_invitations`, `financial_diagnostics`, `financial_accounts`, `account_snapshots`, `goals`, `coaching_sessions`
- [x] RLS habilitado en todas las tablas
- [x] Políticas RLS con `get_my_org_id()` + `get_my_role()`
- [x] Trigger `on_auth_user_created` → auto-crea perfil en signup
- [x] Tipos TypeScript generados en `src/lib/supabase/types.ts`

### Autenticación
- [x] `/auth/login` — magic link (sin contraseña)
- [x] `/auth/callback` — intercambia code, detecta tipo de usuario, redirige por rol
- [x] Middleware de auth → protege `/app`, `/coach`, `/admin`, `/onboarding`
- [x] Clientes Supabase: browser (`client.ts`), server (`server.ts`), admin (`admin.ts`)

### Coach
- [x] `/onboarding` — coach crea organización + perfil (slug auto-generado)
- [x] `/coach/layout.tsx` — sidebar + auth guard + carga perfil/org server-side
- [x] `/coach/overview` — stats (total/activos/leads) + quick actions + clientes recientes
- [x] `/coach/clients` — lista completa con estado, ocupación, fecha
- [x] `/coach/invite` — formulario email+nombre, envía `inviteUserByEmail` via admin client
- [x] Server action `inviteClient` — upsert invitation + envío email

---

## 🔲 Pendiente — Fase 1 MVP

> **Objetivo:** Mabel puede hacer una sesión de diagnóstico completa con un cliente real.

### Cliente — Onboarding / Diagnóstico
- [ ] `/onboarding/client` — wizard de diagnóstico en 4 secciones:
  - Sección 1: Perfil (nombre, edad, ocupación, dependientes, pareja, salud/pensión)
  - Sección 2: Situación actual (ingreso, gastos, ahorros, seguro de vida)
  - Sección 3: Activos y deudas (lista activos con valor, lista deudas con tipo)
  - Sección 4: Metas (objetivo principal, mayor angustia, horizonte de tiempo)
- [ ] Server action `saveClientDiagnostic`:
  - Inserta `financial_diagnostics` (inmutable)
  - Crea las 4 `financial_accounts` con `target_amount` calculado:
    - imprevisto = 1 × monthly_income
    - oxígeno = 6 × monthly_income
    - retiro = 0 (is_active = has_life_insurance)
    - inversiones = 0 (desbloqueada después)
  - Actualiza `client_profiles` con datos del formulario
  - Marca `profiles.onboarding_completed = true`

### Cliente — Dashboard
- [ ] `/app/layout.tsx` — auth guard para clientes, carga perfil
- [ ] `/app/dashboard` — dashboard completo:
  - Hero: patrimonio neto (total_assets − total_debts) + score + mini-stats
  - 4 AccountCards: border-left color + barra de progreso + % + target
  - Inversiones visualmente bloqueada si imprevisto/oxígeno < 50%
  - Próximo hito (conectado a coaching_sessions)
- [ ] `src/lib/score/calculateScore.ts` — función pura del health score (0-100)
- [ ] `src/lib/targets/calculateTargets.ts` — función pura de targets por cuenta
- [ ] `src/components/dashboard/AccountCard.tsx` — card individual con inline edit
- [ ] `src/components/dashboard/HeroStats.tsx` — patrimonio neto + 3 mini-stats
- [ ] `src/components/dashboard/ScoreBadge.tsx` — badge circular 0-100
- [ ] Actualización de saldo inline: input en cada card → guarda + crea `account_snapshot`

### Coach — Detalle de Cliente
- [ ] `/coach/clients/[id]` — vista detallada:
  - 4 cuentas con progreso del cliente
  - Diagnóstico financiero (resumen del formulario)
  - Notas privadas del coach
  - Historial de sesiones
- [ ] `/coach/clients/[id]/edit` — el coach puede ajustar `target_amount` de cada cuenta

---

## 🔲 Pendiente — Fase 2 SaaS Core

### Público
- [ ] `/` — landing page de InteFin
- [ ] `/[slug]` — perfil público del coach con CTA
- [ ] `/[slug]/test` — test gratuito de salud financiera (10 preguntas)
- [ ] `/[slug]/test/result` — score parcial + blur + CTA agendar sesión

### Onboarding Self-Service
- [ ] Registro de nuevos coaches sin invitación
- [ ] Plan free: máximo 3 clientes activos
- [ ] `/coach/settings` — logo, color de marca, configuración de organización

### Sesiones
- [ ] `/coach/sessions` — lista de sesiones programadas
- [ ] Crear/editar sesión con notas privadas + resumen para el cliente
- [ ] `/app/sessions` — cliente ve su historial de sesiones

### Progreso Histórico
- [ ] Snapshots mensuales automáticos (cron job o trigger en update)
- [ ] Gráfica de línea en `/app/dashboard` con evolución por cuenta (Recharts)
- [ ] Metas con hitos en `/app/goals`

### Email
- [ ] Integrar Resend para emails transaccionales
- [ ] Email de bienvenida al cliente
- [ ] Recordatorio mensual para actualizar saldos

### Billing
- [ ] Stripe — suscripción mensual para coaches (~$30 USD/mes)
- [ ] Plan free (3 clientes) vs Pro (ilimitado)

---

---

## 🚀 Despliegue

> Tickets de infraestructura para llevar el MVP a producción. Pueden hacerse en paralelo con Fase 1.

### Vercel
- [ ] **DEPLOY-01** Crear proyecto en Vercel y conectar repositorio GitHub
  - `vercel link` o desde dashboard.vercel.com → New Project
- [ ] **DEPLOY-02** Configurar variables de entorno en Vercel (Production + Preview):
  ```
  NEXT_PUBLIC_SUPABASE_URL
  NEXT_PUBLIC_SUPABASE_ANON_KEY
  SUPABASE_SERVICE_ROLE_KEY
  NEXT_PUBLIC_SITE_URL=https://<tu-dominio>.vercel.app
  ```
- [ ] **DEPLOY-03** Verificar build exitoso en Vercel (preview deployment)
- [ ] **DEPLOY-04** Configurar dominio personalizado (ej: `intefin.app` o `app.mabelcoach.com`)

### Supabase — Configuración para Producción
- [ ] **DEPLOY-05** Agregar URL de producción en Supabase Auth → URL Configuration → Redirect URLs:
  ```
  https://<dominio-produccion>/auth/callback
  https://<preview>.vercel.app/auth/callback
  ```
- [ ] **DEPLOY-06** Configurar `Site URL` en Supabase Auth Settings con el dominio de producción
- [ ] **DEPLOY-07** Revisar límites del plan Free de Supabase (500 MB DB, 50k MAU) — subir a Pro si se supera

### Email (Resend)
- [ ] **DEPLOY-08** Crear cuenta en [resend.com](https://resend.com) y obtener API key
- [ ] **DEPLOY-09** Agregar `RESEND_API_KEY` a `.env.local` y a Vercel env vars
- [ ] **DEPLOY-10** Verificar dominio de envío en Resend (para que los emails lleguen desde `hola@intefin.app` en vez de `onboarding@resend.dev`)
- [ ] **DEPLOY-11** Reemplazar `inviteUserByEmail` (email de Supabase) por email personalizado con Resend + template con branding de InteFin

### GitHub
- [ ] **DEPLOY-12** Crear repositorio en GitHub y hacer push del branch `main`
  ```bash
  git remote add origin https://github.com/<usuario>/intefin.git
  git push -u origin main
  ```
- [ ] **DEPLOY-13** Configurar protección de branch `main` (require PR, no force push)

### Pre-lanzamiento MVP
- [ ] **DEPLOY-14** Smoke test en producción:
  - Coach puede registrarse y crear organización
  - Coach puede invitar cliente
  - Cliente puede completar diagnóstico
  - Dashboard del cliente muestra las 4 cuentas
- [ ] **DEPLOY-15** Configurar Vercel Analytics (gratuito) para monitorear uso
- [ ] **DEPLOY-16** Probar magic link desde dominio de producción (email llega, link funciona)

---

## 🔲 Pendiente — Fase 3 Plataforma

- [ ] Marketplace de coaches en intelfin.app
- [ ] AI insights financieros (análisis automático del diagnóstico con Claude API)
- [ ] Exportación de reportes PDF
- [ ] i18n completo ES + EN con next-intl
- [ ] PWA / mobile optimization
- [ ] Super admin panel (`/admin`)

---

## 🔧 Deuda Técnica

- [ ] Regenerar tipos Supabase completos (la tabla `client_invitations` fue añadida manualmente)
- [ ] Agregar `SUPABASE_SERVICE_ROLE_KEY` y `NEXT_PUBLIC_SITE_URL` al `.env.local`
- [ ] Configurar URL de callback en Supabase Dashboard: `http://localhost:3000/auth/callback`
- [ ] Configurar `NEXT_PUBLIC_SITE_URL` en Vercel cuando se depliegue
- [ ] Añadir `next-intl` middleware y routing (instalado pero no configurado)
- [ ] Tests unitarios para `calculateScore` y `calculateTargets`
- [ ] Error boundaries en layouts de coach y cliente

---

## 📌 Próxima Sesión — Por Dónde Empezar

1. **Agregar al `.env.local`:**
   ```
   SUPABASE_SERVICE_ROLE_KEY=eyJ...   ← Supabase Dashboard → Settings → API
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   ```

2. **Configurar en Supabase Dashboard:**
   - Authentication → URL Configuration → Redirect URLs → agregar `http://localhost:3000/auth/callback`

3. **Primera tarea a implementar:** `/onboarding/client` (diagnóstico del cliente en 4 secciones)
   - Es el corazón del producto — sin esto Mabel no puede hacer la sesión diagnóstico
   - Archivos a crear:
     - `src/app/onboarding/client/page.tsx` — wizard multi-step
     - `src/actions/diagnostic.ts` — `saveClientDiagnostic` server action
     - `src/lib/targets/calculateTargets.ts` — pura, testeable

4. **Segunda tarea:** `/app/dashboard` con las 4 cuentas
