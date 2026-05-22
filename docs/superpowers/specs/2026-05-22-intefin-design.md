# InteFin — Diseño de la Aplicación

**Fecha:** 2026-05-22  
**Producto:** InteFin — Plataforma de Inteligencia Financiera  
**Descripción:** SaaS multi-tenant para coaches financieros. MVP centrado en la práctica de coaching de Mabel Álvarez; arquitectura preparada para escalar a múltiples coaches.

---

## 1. Contexto del Producto

InteFin nace de la colaboración entre Sergio Monsalve (desarrollador / AI engineer) y Mabel Álvarez (coach financiera). El problema central: Mabel gestiona su proceso de coaching con Excel/Google Sheets aislados por cliente. Esto impide visualización de progreso, comparación entre clientes y una experiencia profesional para sus clientes.

La solución: una plataforma web donde coaches financieros pueden gestionar clientes, y los clientes pueden ver su salud financiera en tiempo real a través de las 4 cuentas del método de Mabel.

---

## 2. Stack Técnico

| Capa | Tecnología | Justificación |
|------|-----------|---------------|
| Frontend / Backend | Next.js 15 (App Router) | Server Components + Server Actions, ideal para SaaS |
| Base de datos + Auth | Supabase (PostgreSQL + RLS) | Multi-tenant via Row-Level Security, auth incluida |
| Hosting | Vercel | Deploy automático, Edge Functions, Analytics |
| Pagos | Stripe | Subscripciones de coaches, modelo freemium |
| Visualización | Recharts | Gráficas financieras: barras de progreso, líneas temporales |
| i18n | next-intl | Soporte bilingüe ES + EN desde el inicio |
| UI Components | shadcn/ui + Tailwind CSS | Sistema de diseño coherente, dark theme |
| Email | Resend | Invitaciones de clientes, notificaciones |

---

## 3. Roles de Usuario

| Rol | Descripción | Acceso |
|-----|------------|--------|
| `super_admin` | Gestiona la plataforma InteFin completa | `/admin/*` |
| `coach` | Gestiona su organización, clientes y sesiones | `/coach/*` |
| `client` | Ve su dashboard financiero personal | `/app/*` |
| `public` | Sin autenticación | `/`, `/[slug]`, `/[slug]/test` |

---

## 4. Arquitectura Multi-tenant

Cada coach crea una **organización** (`organizations`). Todos los datos de clientes, cuentas y sesiones pertenecen a una organización mediante `organization_id`. Supabase Row-Level Security (RLS) garantiza el aislamiento: un coach nunca puede acceder a datos de otro coach, independientemente del código de la aplicación.

```sql
-- Política base aplicada en todas las tablas de datos:
CREATE POLICY "org_isolation" ON <tabla>
  USING (organization_id = get_my_org_id());
```

Cada organización tiene un `slug` único (ej: `mabel-alvarez`) que determina su URL pública.

---

## 5. Modelo de Datos

### 5.1 Capa de Tenancy

**`organizations`**
```
id            uuid PK
name          text
slug          text UNIQUE          -- mabel-alvarez
logo_url      text
brand_color   text                 -- personalización visual
plan          enum(free|pro|enterprise)
stripe_customer_id  text
created_at    timestamptz
```

**`profiles`** (extiende `auth.users` de Supabase)
```
id                   uuid PK → auth.users
organization_id      uuid FK → organizations
role                 enum(super_admin|coach|client)
full_name            text
avatar_url           text
locale               enum(es|en)
onboarding_completed boolean
created_at           timestamptz
```

### 5.2 Capa de Clientes

**`client_profiles`**
```
id                uuid PK
user_id           uuid FK → profiles
organization_id   uuid FK → organizations
coach_id          uuid FK → profiles(coach)
occupation        text
birth_year        int
dependents_count  int
has_partner       boolean
monthly_income    numeric(15,2)
monthly_expenses  numeric(15,2)
status            enum(lead|active|paused|completed)
created_at        timestamptz
```

**`financial_diagnostics`** *(registro inmutable — no se edita, se crea uno nuevo)*
```
id                   uuid PK
client_id            uuid FK → client_profiles
organization_id      uuid FK
total_assets         numeric(15,2)
liquid_assets        numeric(15,2)
large_assets         numeric(15,2)    -- finca, carro, moto
total_debts          numeric(15,2)
net_worth            numeric(15,2)    -- calculado: assets - debts
monthly_income       numeric(15,2)
monthly_expenses     numeric(15,2)
has_health_insurance boolean
has_pension          boolean
has_life_insurance   boolean
primary_goal         text
biggest_fear         text
notes                text
recorded_at          timestamptz
```

### 5.3 Las 4 Cuentas

**`financial_accounts`**
```
id              uuid PK
client_id       uuid FK → client_profiles
organization_id uuid FK
account_type    enum(imprevisto|oxigeno|retiro|inversiones)
target_amount   numeric(15,2)    -- calculado: imprevisto=1×ingreso, oxigeno=6×ingreso, retiro=N/A, inversiones=definido por coach
current_amount  numeric(15,2)
institution     text             -- banco o entidad
is_active       boolean          -- retiro puede ser boolean (seguro vigente)
notes           text
created_at      timestamptz
updated_at      timestamptz
```

**`account_snapshots`** *(historial mensual — fuente de datos para gráficas)*
```
id              uuid PK
account_id      uuid FK → financial_accounts
organization_id uuid FK
amount          numeric(15,2)
progress_pct    numeric(5,2)
snapshot_month  date             -- siempre el día 1 del mes
notes           text
created_by      uuid FK → profiles
created_at      timestamptz
```

### 5.4 Metas y Sesiones

**`goals`**
```
id              uuid PK
client_id       uuid FK
organization_id uuid FK
title           text
description     text
target_amount   numeric(15,2)
target_date     date
status          enum(pending|in_progress|completed|cancelled)
created_at      timestamptz
```

**`coaching_sessions`**
```
id              uuid PK
client_id       uuid FK
organization_id uuid FK
coach_id        uuid FK → profiles
session_number  int
session_date    timestamptz
notes           text             -- privado: solo visible por el coach
summary         text             -- compartido con el cliente
deliverables    jsonb            -- lista de tareas para el cliente
status          enum(scheduled|completed|cancelled)
```

### 5.5 SaaS (Fase 2)

**`subscription_plans`** — planes disponibles en la plataforma  
**`subscriptions`** — subscripción activa de cada organización → Stripe  
**`public_test_results`** — resultados del test gratuito (lead capture antes de registro)

---

## 6. Rutas de la Aplicación

```
/                          Landing de InteFin (pública)
/[slug]                    Perfil público del coach (ej: /mabel-alvarez)
/[slug]/test               Test gratuito de salud financiera
/[slug]/test/result        Resultado parcial + CTA para agendar

/auth/login                Login con magic link (sin contraseña)
/auth/callback             Callback de Supabase Auth
/onboarding                Wizard inicial del cliente (diagnóstico)

/app/dashboard             Cliente: las 4 cuentas + patrimonio neto
/app/goals                 Cliente: metas financieras con hitos
/app/sessions              Cliente: historial de sesiones con el coach
/app/profile               Cliente: datos personales

/coach/overview            Coach: resumen general (clientes activos, próximas sesiones)
/coach/clients             Coach: lista de todos sus clientes
/coach/clients/[id]        Coach: detalle de un cliente (4 cuentas + notas)
/coach/clients/[id]/edit   Coach: editar plan financiero del cliente
/coach/sessions            Coach: gestión de sesiones
/coach/settings            Coach: configuración de la organización (marca, plan)
/coach/invite              Coach: invitar nuevo cliente

/admin                     Super admin: dashboard de la plataforma
/admin/organizations       Super admin: gestión de organizaciones/coaches
/admin/users               Super admin: gestión de usuarios
```

---

## 7. Flujos de Usuario Principales

### 7.1 Visitante Público → Cliente
1. Llega a `/[slug]` (perfil de Mabel compartido por WhatsApp o link directo)
2. Hace el test gratuito en `/[slug]/test` (~10 preguntas, 3 minutos)
3. Ve resultado parcial con score de salud financiera + secciones borrosas
4. CTA: "Ver análisis completo" → agenda sesión con Mabel
5. Mabel lo invita como cliente → recibe magic link por email
6. Completa onboarding (formulario de diagnóstico en 4 secciones)
7. Accede a `/app/dashboard` con su plan financiero completo

### 7.2 Sesión de Diagnóstico (Aula Invertida)
1. Mabel invita cliente desde `/coach/invite`
2. Cliente recibe email con magic link
3. Cliente crea cuenta y completa formulario de diagnóstico **antes** de la sesión
4. Mabel llega a la sesión en vivo con todos los datos ya cargados en `/coach/clients/[id]`
5. Post-sesión: Mabel registra notas, plan de las 4 cuentas y próximos hitos
6. Cliente ve su dashboard actualizado con metas y próximo paso

### 7.3 Seguimiento Mensual
1. Sistema envía recordatorio al cliente para actualizar saldos (email mensual)
2. Cliente actualiza `current_amount` en cada cuenta
3. Sistema crea `account_snapshot` automáticamente
4. Dashboard muestra evolución histórica en gráfica de línea

---

## 8. Diseño Visual

### Paleta de Colores
- **Background:** `#0a0f1e` (muy oscuro, casi negro-azul)
- **Surface:** `#0f172a` / `#1e293b`
- **Texto principal:** `#f1f5f9`
- **Texto secundario:** `#64748b`
- **Acento primario:** `#6366f1` (índigo)

### Colores por Cuenta
| Cuenta | Color | Justificación |
|--------|-------|---------------|
| Imprevisto | `#f87171` (rojo) | Urgencia — es la primera prioridad |
| Oxígeno | `#fb923c` (naranja) | Segunda prioridad en construir |
| Retiro | `#a78bfa` (violeta) | Protección a largo plazo |
| Inversiones | `#34d399` (verde) | Crecimiento — se activa al final |

### Componentes Clave del Dashboard Cliente
- **Hero:** Patrimonio neto como número grande + 3 mini-stats (activos / deudas / gastos/mes)
- **Score:** Badge circular con salud financiera (0-100)
- **4 cuentas:** Cards con border-left color-coded + barra de progreso horizontal + % completado
- **Inversiones bloqueada** visualmente hasta completar Imprevisto y Oxígeno
- **Próximo hito:** CTA al fondo conectado a la siguiente sesión con el coach

---

## 9. Componente: Score de Salud Financiera

El score (0–100) se calcula en el servidor con pesos por cuenta:

```
score = (
  imprevisto_progress * 0.25 +    -- 25 puntos máx
  oxigeno_progress * 0.30 +       -- 30 puntos máx
  retiro_active * 0.20 +          -- 20 puntos (binario)
  inversiones_progress * 0.15 +   -- 15 puntos máx
  debt_ratio_score * 0.10         -- 10 puntos (deudas/activos)
) * 100
```

El score se recalcula cada vez que se crea un `account_snapshot`.

---

## 10. Freemium y Monetización (Fase 2)

- **Free:** Test de salud financiera público + hasta 3 clientes activos para coaches
- **Pro (~$30 USD/mes/coach):** Clientes ilimitados + sesiones + exportación de reportes + snapshots históricos
- **Enterprise:** Multi-coach por organización + branding completo + white-label

*Nota: precio Pro a validar con Mabel antes de Fase 2.*

El test gratuito muestra el score pero con las secciones de detalle en blur. El CTA es siempre "Agenda tu sesión diagnóstico gratuita con [nombre del coach]".

---

## 11. Formulario de Diagnóstico (4 Secciones)

### Sección 1 — Tu Perfil
- Nombre, edad, ocupación
- ¿Con quién vives? (solo, pareja, familia)
- Número de dependientes
- ¿Cotizas salud y pensión?

### Sección 2 — Tu Situación Actual
- Ingreso mensual promedio (rango o exact)
- Gastos fijos mensuales
- ¿Tienes ahorros? ¿Cuánto?
- ¿Tienes seguro de vida?

### Sección 3 — Tus Activos y Deudas
- Lista de activos con valor aproximado (texto libre o ítems)
- Lista de deudas con monto y tipo (banco / familiar / tarjeta)
- ¿Tienes propiedades?

### Sección 4 — Tus Metas
- Objetivo principal (salir de deudas / ahorrar / invertir / comprar vivienda / otro)
- ¿Qué te genera más angustia financiera hoy?
- Horizonte de tiempo para tu meta principal

---

## 12. Fases de Entrega

### Fase 1 — MVP (≈2 semanas)
**Objetivo:** Mabel puede usar la app con su primera cliente.

- [ ] Auth con magic link (Supabase)
- [ ] Schema de base de datos + RLS
- [ ] Onboarding de organización (Mabel crea su cuenta de coach)
- [ ] Formulario de diagnóstico (4 secciones)
- [ ] Dashboard del cliente (4 cuentas + patrimonio neto + score)
- [ ] Vista coach: lista de clientes + detalle de cliente
- [ ] Invitar cliente por email
- [ ] Actualización manual de saldos (cliente edita `current_amount` en cada card del dashboard con un input inline + botón guardar; esto crea un `account_snapshot` automáticamente)

### Fase 2 — SaaS Core (≈3-4 semanas)
- [ ] Perfil público del coach (`/[slug]`)
- [ ] Test gratuito de salud financiera (`/[slug]/test`)
- [ ] Stripe billing (plan free/pro)
- [ ] Onboarding de nuevos coaches (registro self-service)
- [ ] Sesiones de coaching con notas y entregables
- [ ] Snapshots mensuales automáticos + gráfica histórica
- [ ] Notificaciones por email (Resend)
- [ ] Metas con hitos

### Fase 3 — Plataforma (Futuro)
- [ ] Marketplace de coaches en intelfin.app
- [ ] AI insights financieros (análisis automático del diagnóstico)
- [ ] Exportación de reportes PDF
- [ ] Mobile app (React Native o PWA)
- [ ] Integración con bancos (open banking)

---

## 13. Estructura de Archivos (Next.js)

```
src/
├── app/
│   ├── [locale]/               -- next-intl routing
│   │   ├── (public)/
│   │   │   ├── page.tsx        -- landing
│   │   │   └── [slug]/         -- perfil coach + test
│   │   ├── (auth)/
│   │   │   └── auth/
│   │   ├── (client)/
│   │   │   └── app/            -- portal del cliente
│   │   ├── (coach)/
│   │   │   └── coach/          -- portal del coach
│   │   └── (admin)/
│   │       └── admin/
├── components/
│   ├── ui/                     -- shadcn components
│   ├── dashboard/              -- AccountCard, ScoreBadge, HeroStats
│   ├── diagnostic/             -- DiagnosticForm, FormSection
│   └── coach/                  -- ClientList, ClientDetail
├── lib/
│   ├── supabase/               -- client, server, middleware
│   ├── score/                  -- cálculo de salud financiera
│   └── targets/                -- cálculo de metas por cuenta
├── messages/
│   ├── es.json
│   └── en.json
└── middleware.ts               -- next-intl + auth guard
```

---

## 14. Decisiones de Diseño No Obvias

1. **`financial_diagnostics` es inmutable:** Cada sesión de diagnóstico crea un registro nuevo, nunca se edita el anterior. Esto permite comparar "Sergio en mayo 2026" vs "Sergio en noviembre 2026" con datos reales.

2. **Magic link, no contraseña:** Reduce fricción en el onboarding del cliente. La mayoría de los clientes de Mabel no son tech-savvy — un link por email es más simple que recordar contraseñas.

3. **Inversiones visualmente bloqueada:** La cuenta de inversiones se muestra con `opacity: 0.6` y un badge "🔒 Bloqueado" hasta que Imprevisto y Oxígeno superen el 50%. Refuerza la pedagogía del método de Mabel.

4. **`organization_id` en todas las tablas:** Aunque sea redundante (se podría obtener via JOIN desde `client_profiles`), tenerlo directo en cada tabla hace las políticas RLS más simples y las queries más rápidas.

5. **`snapshot_month` siempre día 1:** Normalizar al primer día del mes evita duplicados y hace los queries de rango temporal triviales.

6. **Slug del coach en la URL raíz:** `/mabel-alvarez` en vez de `/coaches/mabel-alvarez` se ve más profesional cuando Mabel comparte su link por WhatsApp.
