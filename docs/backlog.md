# InteFin — Backlog

> Última actualización: 2026-05-23

---

## ✅ Completado

### Fase 1 — MVP Core (todo el flujo end-to-end)

**Infraestructura**
- [x] Next.js 15 App Router + TypeScript + Tailwind + shadcn/ui
- [x] Supabase project (`cgeowklrdzhlwhllfopo`) + 10 tablas + RLS
- [x] Tipos TypeScript generados
- [x] Auth middleware (`proxy.ts`) con Edge Runtime safety

**Coach**
- [x] `/auth/login` — magic link
- [x] `/auth/callback` — exchange + role-based redirect
- [x] `/onboarding` — coach crea organización (con admin client para bypass de RLS)
- [x] `/coach/overview` — stats + clientes recientes
- [x] `/coach/clients` — lista completa
- [x] `/coach/clients/[id]` — detalle: perfil + diagnóstico + 4 cuentas
- [x] `/coach/invite` — invita cliente por email

**Cliente**
- [x] `/onboarding/client` — wizard de diagnóstico (4 secciones)
- [x] `/app/dashboard` — patrimonio neto + score + 4 cuentas
- [x] Actualización inline de saldos → crea `account_snapshot`
- [x] Inversiones bloqueada hasta que Imprevisto + Oxígeno ≥ 50%

**Funciones puras**
- [x] `calculateTargets()` — targets de las 4 cuentas según ingreso
- [x] `calculateScore()` — health score 0–100 con la fórmula ponderada

**Despliegue**
- [x] GitHub repo: https://github.com/serandmoncas/InteFin
- [x] Vercel project linked + auto-deploy
- [x] Producción viva: **https://intefin.vercel.app**
- [x] Env vars en Vercel (`NEXT_PUBLIC_SUPABASE_URL`, `_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `NEXT_PUBLIC_SITE_URL`)
- [x] Landing page (`/`) con hero + método + audiencias + CTA

---

## 🔲 Pendiente

### 🔥 Próximos pasos críticos (antes de usar con cliente real)

- [ ] **CONFIG-01** Configurar URLs de redirect en Supabase para producción
  - Dashboard → Auth → URL Configuration → Redirect URLs
  - Agregar: `https://intefin.vercel.app/auth/callback`
- [ ] **CONFIG-02** Smoke test completo en producción
  - Crear cuenta coach → invitar cliente real → completar diagnóstico → ver dashboard
- [ ] **CONFIG-03** Configurar `NEXT_PUBLIC_SITE_URL` en Vercel con el dominio real (actualmente `http://localhost:3000`)

### Fase 2 — SaaS Core

**Email (Resend)**
- [ ] Cuenta en Resend + API key + verificar dominio
- [ ] Reemplazar `inviteUserByEmail` (email genérico de Supabase) por email branded con Resend
- [ ] Template HTML para invitación + recordatorio mensual

**Coach — Sesiones y notas**
- [ ] `/coach/clients/[id]/edit` — ajustar `target_amount` de cuentas
- [ ] Notas privadas del coach por cliente (campo + UI)
- [ ] `/coach/sessions` — agendar + registrar sesiones con notas + deliverables
- [ ] `/coach/settings` — logo, color de marca, slug público

**Cliente — Más features**
- [ ] `/app/goals` — metas con hitos
- [ ] `/app/sessions` — historial de sesiones con el coach
- [ ] Gráfica histórica de evolución por cuenta (Recharts)

**Público / Lead gen**
- [ ] `/[slug]` — perfil público del coach (Mabel comparte por WhatsApp)
- [ ] `/[slug]/test` — test gratuito de salud financiera (10 preguntas)
- [ ] `/[slug]/test/result` — score parcial con blur + CTA agendar

**Billing**
- [ ] Stripe integration
- [ ] Plan Free (3 clientes) vs Pro (~$30 USD/mes, ilimitado)
- [ ] Onboarding self-service de nuevos coaches

**Dominio**
- [ ] Comprar `intefin.app` y configurar en Vercel

### Fase 3 — Plataforma

- [ ] AI insights financieros (Claude API analiza el diagnóstico)
- [ ] Exportación de reportes PDF
- [ ] i18n completo ES + EN con next-intl
- [ ] PWA / mobile optimization
- [ ] Super admin panel (`/admin`)
- [ ] Marketplace de coaches

---

## 🔧 Deuda Técnica

- [ ] Regenerar tipos Supabase (la tabla `client_invitations` fue añadida manualmente al .ts)
- [ ] Tests unitarios para `calculateScore` y `calculateTargets`
- [ ] Error boundaries en layouts de coach y cliente
- [ ] Migrar de Edge proxy a Node proxy si crecen las queries (actualmente solo `getUser()`)
- [ ] `_drains` de logs en Vercel para observabilidad

---

## 📌 Decisiones tomadas

| Decisión | Justificación |
|----------|---------------|
| Admin client en `/onboarding` y `/onboarding/client` | El usuario aún no tiene `organization_id`, así que RLS bloquea el insert. El admin client se usa solo en bootstrap. |
| `vercel deploy --prod --yes` directo (NO `--prebuilt`) | `vercel pull` descarga vars encriptadas como string vacío, lo que rompe `NEXT_PUBLIC_*` en runtime. |
| `proxy.ts` con try/catch y null guard | Si las env vars faltan en Edge Runtime, devuelve 200 en lugar de 500 (evita white-screen). |
| `financial_diagnostics` inmutable | Permite comparar el "antes" vs "ahora" del cliente con datos reales. |
| Magic link sin contraseña | Clientes de Mabel no son tech-savvy. Email = único requisito. |
