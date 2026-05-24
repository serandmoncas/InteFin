# Email System — InteFin
**Fecha:** 2026-05-24  
**Alcance:** Configuración Resend SMTP (fix OTP coach) + módulo transaccional con React Email  
**Estado:** Aprobado

---

## Problema

1. El coach no puede iniciar sesión: Supabase OTP retorna 500 porque no hay proveedor SMTP configurado en producción.
2. La pantalla de invitación de clientes muestra "Le enviamos un email a tu cliente" pero `inviteClient()` nunca envía ningún email — promesa rota.

---

## Solución

Dos capas independientes:

### Capa 1 — Auth emails (SMTP)

Configurar Resend como SMTP personalizado en Supabase Dashboard. Supabase sigue siendo la fuente de verdad para auth; Resend solo actúa como relay de entrega.

- **Host:** `smtp.resend.com`
- **Puerto:** 465 (SSL)
- **Usuario:** `resend`
- **Password:** `RESEND_API_KEY`
- **Sender:** `hola@intefin.app`

No requiere cambios de código. Solo configuración de dashboard + env var.

### Capa 2 — Emails transaccionales (SDK)

Módulo `src/lib/email/` con Resend SDK + React Email templates. Se integra en las server actions existentes como operación *fire-and-forget* (los errores se loggean pero no bloquean la acción principal).

---

## Estructura de archivos

```
src/lib/email/
├── client.ts              — Resend SDK singleton (lazy init)
├── send.ts                — sendEmail() wrapper: logging, error catch, no-throw
├── index.ts               — re-exports públicos de las funciones send*
└── templates/
    ├── ClientInvite.tsx   — email al cliente con su magic link de diagnóstico
    ├── CoachWelcome.tsx   — bienvenida al coach tras completar onboarding
    └── PlanUpgrade.tsx    — confirmación de activación del plan Pro
```

### `client.ts`
```ts
import { Resend } from "resend"

let _client: Resend | null = null

export function getResendClient(): Resend {
  if (!_client) _client = new Resend(process.env.RESEND_API_KEY)
  return _client
}
```

### `send.ts`
```ts
// Wrapper que nunca lanza — errores se loggean y retornan como { error }
export async function sendEmail(params: SendEmailParams): Promise<{ error?: string }>
```

### `index.ts` — exports públicos
```ts
export { sendClientInviteEmail }   // coach.ts
export { sendCoachWelcomeEmail }   // onboarding.ts
export { sendPlanUpgradeEmail }    // billing.ts
```

---

## Templates React Email

Todos los templates comparten:
- **Idioma:** español
- **Paleta:** fondo `#0a0f1e`, superficie `#0f172a`, acento indigo `#6366f1`, texto `#f1f5f9`
- **Logo:** texto "InteFin" con badge cuadrado indigo (sin imagen externa)
- **Responsive:** columna única, max-width 600px
- **Fallback texto plano:** incluido en cada envío

### ClientInvite.tsx
**Destinatario:** cliente invitado  
**Asunto:** `{coachName} te invitó a InteFin`  
**Contenido:**
- Saludo con nombre del cliente
- Nombre del coach que invita
- CTA principal: "Completar mi diagnóstico financiero" → `inviteLink`
- Nota: el link expira en 24 h (límite de Supabase magic links)
- Footer con nombre de la organización del coach

**Props:**
```ts
{ clientName: string; coachName: string; orgName: string; inviteLink: string }
```

### CoachWelcome.tsx
**Destinatario:** coach recién onboarded  
**Asunto:** `¡Bienvenido a InteFin, {coachName}!`  
**Contenido:**
- Bienvenida personalizada con nombre
- Tres pasos para empezar: invitar primer cliente → completar diagnóstico → ver dashboard
- CTA: "Ver mi dashboard" → `{siteUrl}/coach/overview`
- Nota sobre plan Free (hasta 3 clientes activos)

**Props:**
```ts
{ coachName: string; orgName: string; siteUrl: string }
```

### PlanUpgrade.tsx
**Destinatario:** coach que activó Pro  
**Asunto:** `Tu plan Pro está activo — InteFin`  
**Contenido:**
- Confirmación de activación
- Fecha de vencimiento del plan (si aplica)
- Lista de beneficios Pro: clientes ilimitados, soporte prioritario, acceso anticipado
- CTA: "Ver mi dashboard" → `{siteUrl}/coach/overview`

**Props:**
```ts
{ coachName: string; planExpiresAt: string | null; siteUrl: string }
```

---

## Puntos de integración

### 1. `src/actions/coach.ts` → `inviteClient()`

Después de `generateLink()` exitoso, antes del `return`:

```ts
// Fire-and-forget — no bloquea la respuesta
sendClientInviteEmail({
  clientEmail: email,
  clientName:  fullName,
  coachName:   coachProfile.full_name,
  orgName:     org.name,
  inviteLink:  linkData.properties.action_link,
}).catch(err => console.error("[email] invite failed:", err))
```

Requiere enriquecer la query existente para traer `org.name` y `coachProfile.full_name`.

### 2. `src/actions/onboarding.ts` → `completeCoachOnboarding()`

Después del update exitoso al profile:

```ts
sendCoachWelcomeEmail({
  coachEmail: user.email!,
  coachName:  formData.get("full_name") as string,
  orgName:    formData.get("org_name") as string,
  siteUrl:    process.env.NEXT_PUBLIC_SITE_URL ?? "https://intefin.vercel.app",
}).catch(err => console.error("[email] welcome failed:", err))
```

### 3. `src/actions/billing.ts` (o webhook Wompi)

Después de confirmar activación Pro:

```ts
sendPlanUpgradeEmail({
  coachEmail:     coach.email,
  coachName:      coach.full_name,
  planExpiresAt:  org.plan_expires_at,
  siteUrl:        process.env.NEXT_PUBLIC_SITE_URL ?? "https://intefin.vercel.app",
}).catch(err => console.error("[email] plan upgrade failed:", err))
```

---

## Variables de entorno

| Variable | Scope | Descripción |
|----------|-------|-------------|
| `RESEND_API_KEY` | Server only | API key de Resend (también usada como password SMTP) |
| `EMAIL_FROM` | Server only | `InteFin <hola@intefin.app>` |

Agregar a `.env.local` (local) y `vercel env add` (producción).

> ⚠️ `RESEND_API_KEY` **nunca** debe tener prefijo `NEXT_PUBLIC_`.

---

## Configuración Supabase Dashboard

Pasos manuales (no automatizables por código):

1. Supabase Dashboard → Auth → SMTP Settings → Enable Custom SMTP
2. Ingresar credenciales Resend:
   - Host: `smtp.resend.com`
   - Port: `465`
   - User: `resend`
   - Password: `<RESEND_API_KEY>`
   - Sender email: `hola@intefin.app`
   - Sender name: `InteFin`
3. Auth → URL Configuration → agregar a "Redirect URLs":
   - `https://intefin.vercel.app/auth/callback`
   - `https://intefin.app/auth/callback` (cuando el dominio esté activo)
4. Verificar dominio `intefin.app` en Resend Dashboard → Domains

---

## Nueva dependencia

```bash
npm install @react-email/components
```

`resend` ya está instalado (`^6.12.3`).

---

## Error handling

- `sendEmail()` nunca lanza — captura internamente y retorna `{ error?: string }`
- Las llamadas desde server actions usan `.catch()` para no bloquear el flujo principal
- En desarrollo local (`NODE_ENV === 'development'`) y si no hay `RESEND_API_KEY`, loggear el email a consola en lugar de enviarlo (facilita desarrollo sin credenciales)

---

## Lo que NO incluye este spec

- Templates para recuperación de contraseña (no aplica — solo magic links)
- Emails de marketing / newsletters
- Unsubscribe management
- Preview server de React Email en desarrollo (nice-to-have futuro)
- Personalización del template de magic link de Supabase (fuera de alcance — lo maneja Supabase)
