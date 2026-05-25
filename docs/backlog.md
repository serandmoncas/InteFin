# InteliFin — Backlog

> Última actualización: 2026-05-25 (sesión 2)

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
- [x] Template `ProRenewalReminder` — recordatorio 7 días antes de vencer
- [x] Integración en `inviteClient()`, `completeCoachOnboarding()`, webhook Wompi
- [x] Dev mode: loggea a consola si no hay `RESEND_API_KEY`

**UX**
- [x] **UX-01** Traducir mensajes de error del login al español *(2026-05-25)*
- [x] **UX-02** Estado de éxito tras enviar magic link *(2026-05-25)*
- [x] **UX-03** Página 404 y error boundaries globales *(2026-05-25)*
- [x] **UX-04** Toast de éxito/error global con `sonner` *(2026-05-25)*
- [x] **UX-05** Indicador de página activa en sidebar y nav *(2026-05-25)*
- [x] **UX-06** Bottom nav móvil en `/app` *(2026-05-25)*
- [x] **UX-07** Skeletons de carga en rutas críticas *(2026-05-25)*

**Coach**
- [x] **COACH-01** Editar targets de las 4 cuentas inline *(2026-05-25)*
- [x] **COACH-02** Notas privadas por cliente *(2026-05-25)*
- [x] **COACH-03** `/coach/sessions` — historial global de sesiones *(2026-05-25)*

**Cliente**
- [x] **CLIENT-01** Gráfica histórica de evolución por cuenta *(2026-05-25)*
- [x] **CLIENT-02** `/app/goals` — metas financieras *(2026-05-25)*
- [x] **CLIENT-03** `/app/sessions` — historial de sesiones *(2026-05-25)*

**Billing**
- [x] **BILLING-01** Email recordatorio 7 días antes de vencer Pro *(2026-05-25)*

---

## 🚨 Bloqueante — resolver antes de usar con clientes reales

- [ ] **DOMAIN-01** Conectar `intelifin.online` en Vercel
  - Vercel Dashboard → Settings → Domains → Add `intelifin.online`

- [ ] **EMAIL-01** Verificar `intelifin.online` en Resend y re-activar SMTP en Supabase
  - Resend Dashboard → Domains → verificar → copiar nueva API key
  - Supabase Dashboard → Auth → SMTP → Enable Custom SMTP con `hola@intelifin.online`
  - Agregar redirect URL: `https://intelifin.online/auth/callback`

- [ ] **TEST-01** Smoke test completo en producción
  - Crear cuenta coach → invitar cliente → completar diagnóstico → ver dashboard
  - Verificar que los emails llegan (invitación + bienvenida)

---

## 🔥 Alta prioridad

### Coach — Features

- [ ] **COACH-04** Editar sesión ya registrada
  - Actualmente solo se puede crear, no modificar
  - Botón "Editar" en cada sesión → mismo formulario pre-llenado

- [ ] **COACH-05** Cambiar estado del cliente desde la lista
  - Activar / pausar / completar sin entrar al detalle
  - Dropdown de estado en cada fila de `/coach/clients`

- [ ] **COACH-06** Buscador en `/coach/clients`
  - Input de filtro por nombre cuando hay muchos clientes
  - Filtro client-side sobre la lista ya cargada

### Cliente — Features

- [ ] **CLIENT-04** Indicador de tendencia en patrimonio neto
  - Flecha ↑↓ y delta comparando con el snapshot del mes anterior
  - Visible en el hero del dashboard

- [ ] **CLIENT-05** Barra de progreso en metas con monto objetivo
  - Si `target_amount` está definido, mostrar `current / target` con barra
  - El cliente actualiza el avance en pesos desde `/app/goals`

---

## 📋 Backlog medio plazo

### Onboarding de nuevos coaches

- [ ] **SAAS-01** Self-service para coaches nuevos
  - Cualquier persona puede registrarse sin intervención manual
  - Email de bienvenida ya listo ✓

- [ ] **SAAS-02** Super admin `/admin`
  - Lista de organizaciones con métricas (clientes, plan, última actividad)
  - Activación manual de plan Pro
  - Solo accesible con `role='super_admin'`

- [ ] **SAAS-03** Email mensual de recordatorio al cliente
  - "Actualiza tus saldos este mes" — enviado el día 1 de cada mes
  - Nuevo template + nuevo cron en `vercel.json`

### Billing

- [ ] **BILLING-02** Historial de pagos en `/coach/settings`
  - Tabla con fecha, monto, estado, referencia Wompi
  - Query sobre `subscription_payments` filtrado por `organization_id`

- [ ] **BILLING-03** Plan anual con descuento
  - Opción de pagar 12 meses (ej: 10 meses al precio de 12)
  - Nueva opción en el checkout de Wompi

- [ ] **BILLING-04** Período de gracia al vencer
  - 7 días de gracia antes de regresar a Free tras el vencimiento
  - Ajustar `effectivePlan()` para incluir el grace period

### Coach — Analytics

- [ ] **COACH-07** Métricas ampliadas en `/coach/overview`
  - Score promedio de todos los clientes activos
  - Tasa de conversión de leads → clientes
  - Clientes activos vs pausados vs completados (donut chart)

- [ ] **COACH-08** Historial de diagnósticos del cliente
  - Los diagnósticos son inmutables — la tabla ya guarda múltiples snapshots
  - UI para comparar patrimonio neto entre diagnósticos en el detalle del cliente

### Técnico

- [ ] **TECH-01** Regenerar tipos Supabase
  - `npx supabase gen types typescript --project-id cgeowklrdzhlwhllfopo > src/lib/supabase/types.ts`

- [ ] **TECH-02** Actualizar `@react-email/components` (v1.0.12 deprecated)
  - Migrar a paquetes individuales `@react-email/html`, `@react-email/body`, etc.

- [ ] **TECH-03** Migrar Wompi a producción
  - Cambiar test keys por keys reales en Vercel env vars

- [ ] **TECH-04** Observabilidad — Sentry en producción
  - Instalar `@sentry/nextjs`, configurar DSN en Vercel
  - Capturar errores de server actions y API routes

- [ ] **TECH-05** PWA — instalable en móvil
  - Agregar `next-pwa` o `@ducanh2912/next-pwa`
  - `manifest.json` + service worker para instalación en iOS/Android

---

## 🔮 Fase 3 — Largo plazo

### IA

- [ ] **AI-01** Análisis automático del diagnóstico con Claude API
  - Insights financieros personalizados al completar el onboarding del cliente
  - Resumen ejecutivo visible en el detalle del cliente para el coach

- [ ] **AI-02** Sugerencia automática de metas basada en el diagnóstico
  - Claude sugiere 3-5 metas según el diagnóstico inicial
  - El coach aprueba o descarta antes de enviarlas al cliente

### Exportación

- [ ] **EXPORT-01** Reporte PDF del cliente
  - Patrimonio neto, score, 4 cuentas, metas, historial de sesiones
  - Generado con `@react-pdf/renderer` o similar

- [ ] **EXPORT-02** CSV de historial de snapshots
  - Exportar `account_snapshots` de un cliente para análisis externo

### Crecimiento

- [ ] **GROWTH-01** Compartir resultado del quiz como imagen
  - Card generada con el score para stories de Instagram
  - API route que genera imagen con `@vercel/og`

- [ ] **GROWTH-02** Analytics de leads para el coach
  - Cuántos hicieron el test, cuántos dejaron contacto, tasa de conversión
  - Gráfica en `/coach/leads`

- [ ] **GROWTH-03** i18n ES + EN
  - Completar configuración de `next-intl` (ya instalado, no configurado)

- [ ] **GROWTH-04** Marketplace de coaches públicos
  - Directorio `/coaches` con todos los perfiles públicos
  - Filtros por especialidad, ciudad, precio

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
| Supabase SMTP deshabilitado temporalmente | `intelifin.online` pendiente de verificar en Resend |
