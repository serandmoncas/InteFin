# InteliFin — Backlog

> Última actualización: 2026-05-25

---

## ✅ Completado

### Fase 1 — MVP Core

**Infraestructura**
- [x] Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
- [x] Supabase project (`cgeowklrdzhlwhllfopo`) + 10 tablas + RLS
- [x] Tipos TypeScript generados
- [x] Auth middleware con Edge Runtime safety

**Coach**
- [x] `/auth/login` — magic link OTP
- [x] `/auth/callback` — exchange + role-based redirect
- [x] `/onboarding` — coach crea organización
- [x] `/coach/overview` — stats + clientes recientes
- [x] `/coach/clients` — lista completa
- [x] `/coach/clients/[id]` — detalle: perfil + diagnóstico + 4 cuentas
- [x] `/coach/invite` — invita cliente por email
- [x] `/coach/leads` — lista de leads del quiz público
- [x] `/coach/settings` — configuración de org + plan card

**Cliente**
- [x] `/onboarding/client` — wizard de diagnóstico (4 secciones)
- [x] `/app/dashboard` — patrimonio neto + score + 4 cuentas
- [x] Actualización inline de saldos → crea `account_snapshot`
- [x] Inversiones bloqueada hasta que Imprevisto + Oxígeno ≥ 50%

**Público / Lead gen**
- [x] `/[slug]` — perfil público del coach
- [x] `/[slug]/test` — quiz gratuito de salud financiera (10 preguntas)
- [x] `/[slug]/test/result` — score + CTA agendar

**Funciones puras**
- [x] `calculateTargets()` + `calculateScore()` + `computeQuizResult()`
- [x] Tests unitarios (64 tests, Vitest)

**Despliegue**
- [x] Vercel project + auto-deploy
- [x] Producción: **https://intelifin.online**
- [x] Landing page (`/`) con hero + método + audiencias + CTA
- [x] Página de precios (`/pricing`) con Free + Pro + FAQ

### Fase 2 — SaaS Core (completado parcialmente)

**Billing — Wompi**
- [x] `startProCheckout()` — genera URL firmada de Wompi
- [x] `POST /api/wompi/webhook` — verifica HMAC, activa plan Pro
- [x] `effectivePlan()` — revierte a Free si expiró `plan_expires_at`
- [x] `hasClientCapacity()` — enforced en `inviteClient()`
- [x] Plan card en `/coach/settings` con botón "Activar Pro"

**Email — Resend + React Email**
- [x] `src/lib/email/` — módulo completo instalado y wired
- [x] Template `ClientInvite` — magic link al cliente invitado
- [x] Template `CoachWelcome` — bienvenida al coach tras onboarding
- [x] Template `PlanUpgrade` — confirmación activación Pro
- [x] Integración en `inviteClient()`, `completeCoachOnboarding()`, webhook Wompi
- [x] Dev mode: loggea a consola si no hay `RESEND_API_KEY`

---

## 🚨 Bloqueante — resolver antes de usar con clientes reales

- [ ] **DOMAIN-01** Registrar dominio `intelifin.online`
  - Verificar disponibilidad y comprar (Namecheap / Cloudflare)
  - Configurar en Vercel: Dashboard → Domains → Add → `intelifin.online`

- [ ] **EMAIL-01** Verificar `intelifin.online` en Resend y re-activar SMTP en Supabase
  - Resend Dashboard → Domains → Add `intelifin.online` → agregar registros DNS
  - Supabase Dashboard → Auth → SMTP → Enable Custom SMTP con `hola@intelifin.online`
  - Agregar redirect URL: `https://intelifin.online/auth/callback`
  - **Mientras tanto:** Custom SMTP deshabilitado — Supabase relay por defecto (~3 emails/hora)

- [ ] **TEST-01** Smoke test completo en producción
  - Crear cuenta coach → invitar cliente → completar diagnóstico → ver dashboard
  - Verificar que el email de invitación llega al cliente
  - Verificar que el email de bienvenida llega al coach

---

## 🔥 Próximos — alta prioridad

### UX / Pulido

- [x] **UX-01** Traducir mensajes de error del login al español *(2026-05-25)*
- [x] **UX-02** Estado de éxito tras enviar magic link *(ya estaba implementado)*

- [x] **UX-03** Página 404 y error boundaries globales *(2026-05-25)*
  - `src/app/not-found.tsx` con diseño dark theme
  - Error boundary en layouts `/coach` y `/app`

### Coach — Features pendientes

- [x] **COACH-01** `/coach/clients/[id]/edit` — ajustar target de Inversiones *(2026-05-25)*
- [x] **COACH-02** Notas privadas por cliente (textarea + guardar en sesión) *(2026-05-25)*
- [x] **COACH-03** `/coach/sessions` — registro + historial de sesiones *(2026-05-25)*

### Cliente — Features pendientes

- [x] **CLIENT-01** Gráfica histórica de evolución por cuenta (Recharts + `account_snapshots`) *(2026-05-25)*
- [x] **CLIENT-02** `/app/goals` — metas financieras con hitos (tabla `goals` ya existe) *(2026-05-25)*
- [x] **CLIENT-03** `/app/sessions` — historial de sesiones visible al cliente *(2026-05-25)*

---

## 📋 Backlog medio plazo

### Onboarding de nuevos coaches

- [ ] **SAAS-01** Self-service para coaches que no son Mabel (email de bienvenida ya listo ✓)
- [ ] **SAAS-02** Super admin `/admin` — lista de orgs, activación manual de Pro

### Billing

- [x] **BILLING-01** Email de recordatorio 7 días antes de que expire el plan Pro *(2026-05-25)*
- [ ] **BILLING-02** Historial de pagos en `/coach/settings`

### Técnico

- [ ] **TECH-01** Regenerar tipos Supabase
  - `npx supabase gen types typescript --project-id cgeowklrdzhlwhllfopo > src/lib/supabase/types.ts`

- [ ] **TECH-02** Actualizar `@react-email/components` (v1.0.12 deprecated)
  - Migrar a paquetes individuales `@react-email/html`, `@react-email/body`, etc.

- [ ] **TECH-03** Migrar Wompi a producción (cambiar test keys por keys reales en Vercel)

- [ ] **TECH-04** Observabilidad — logs estructurados + Sentry en producción

---

## 🔮 Fase 3 — Largo plazo

- [ ] AI insights financieros (Claude API analiza el diagnóstico)
- [ ] Exportación de reportes PDF
- [ ] i18n completo ES + EN con next-intl (instalado, no configurado)
- [ ] PWA / mobile optimization
- [ ] Marketplace de coaches públicos

---

## 📌 Decisiones arquitecturales

| Decisión | Justificación |
|----------|---------------|
| Admin client en `/onboarding` | RLS bloquea inserts sin `organization_id` aún |
| `vercel deploy --prod --yes` sin `--prebuilt` | `vercel pull` descarga vars encriptadas vacías, rompiendo `NEXT_PUBLIC_*` |
| Magic link sin contraseña | Clientes de Mabel no son tech-savvy |
| `financial_diagnostics` inmutable | Permite comparar "antes vs ahora" con datos reales |
| Email fire-and-forget con `.catch()` | Un email fallido no bloquea la invitación o el onboarding |
| Wompi en lugar de Stripe | Stripe no tiene presencia en Colombia |
| Supabase SMTP deshabilitado temporalmente | `intelifin.online` no verificado en Resend — re-habilitar cuando el dominio esté registrado |
