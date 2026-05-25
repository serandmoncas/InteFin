# InteliFin — Runbook Operacional

> Guía para desplegar, configurar y mantener InteliFin en producción.

---

## Índice

- [Deploy](#deploy)
- [Variables de entorno](#variables-de-entorno)
- [Supabase](#supabase)
- [Resend (Email)](#resend-email)
- [Wompi (Pagos)](#wompi-pagos)
- [Vercel Cron Jobs](#vercel-cron-jobs)
- [Dominio y DNS](#dominio-y-dns)
- [Troubleshooting](#troubleshooting)

---

## Deploy

### Deploy a producción

```bash
vercel deploy --prod --yes
```

> ⚠️ **Nunca** usar `vercel build` + `--prebuilt`. El comando `vercel pull` descarga variables encriptadas como strings vacíos, rompiendo todas las `NEXT_PUBLIC_*` en runtime.

### Flujo de deploy

1. Vercel detecta el push en `main` (auto-deploy) o ejecutas `vercel deploy --prod --yes`
2. Build corre en la nube de Vercel con acceso a las env vars encriptadas
3. Next.js build genera las páginas estáticas y las rutas dinámicas
4. El deploy se aliasa automáticamente a `intelifin.online`

### Variables de entorno en Vercel

Para agregar o actualizar una variable:

```bash
# Via CLI
vercel env add NOMBRE_VARIABLE production

# Para eliminar una variable
vercel env rm NOMBRE_VARIABLE production
```

O desde el dashboard: **Vercel → proyecto → Settings → Environment Variables**.

Después de cambiar cualquier variable, hacer un nuevo deploy para que tome efecto.

---

## Variables de entorno

| Variable | Requerida | Descripción |
|----------|-----------|-------------|
| `NEXT_PUBLIC_SUPABASE_URL` | ✅ | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | ✅ | Anon key pública de Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | ✅ | Service role key (solo servidor) |
| `NEXT_PUBLIC_SITE_URL` | ✅ | URL base del sitio (`https://intelifin.online`) |
| `RESEND_API_KEY` | ✅ | API key de Resend para envío de emails |
| `EMAIL_FROM` | ✅ | Sender: `InteliFin <hola@intelifin.online>` |
| `WOMPI_PUBLIC_KEY` | ✅ | Llave pública de Wompi |
| `WOMPI_PRIVATE_KEY` | ✅ | Llave privada de Wompi |
| `WOMPI_INTEGRITY_SECRET` | ✅ | Secreto para firmar URLs de Wompi |
| `WOMPI_EVENTS_SECRET` | ✅ | Secreto para verificar webhooks de Wompi |
| `CRON_SECRET` | ✅ | Bearer token para proteger los endpoints de cron |

---

## Supabase

**Dashboard:** https://supabase.com/dashboard/project/cgeowklrdzhlwhllfopo

### Auth — Magic Link

Supabase envía los magic links de login. Requiere SMTP configurado.

**SMTP (Resend):**
- Host: `smtp.resend.com`
- Port: `465` (SSL) o `587` (STARTTLS)
- Username: `resend`
- Password: `RESEND_API_KEY`
- Sender name: `InteliFin`
- Sender email: `hola@intelifin.online`

**Redirect URLs permitidas** (Auth → URL Configuration):
```
https://intelifin.online/auth/callback
http://localhost:3000/auth/callback
```

> Si el SMTP custom falla, deshabilítalo temporalmente. Supabase usará su relay por defecto (~3 emails/hora). Re-habilitarlo una vez que el dominio esté verificado en Resend.

### Regenerar tipos TypeScript

Cuando cambies el schema de la base de datos:

```bash
npx supabase gen types typescript \
  --project-id cgeowklrdzhlwhllfopo \
  > src/lib/supabase/types.ts
```

### RLS (Row Level Security)

Todas las tablas tienen RLS habilitado. La función `get_my_org_id()` retorna el `organization_id` del usuario autenticado y se usa en todas las políticas.

El cliente admin (`createAdminClient()`) usa la service role key y **bypasea RLS** — solo usarlo en server actions y API routes del servidor, nunca en el cliente.

---

## Resend (Email)

**Dashboard:** https://resend.com

### Setup del dominio

Para enviar desde `hola@intelifin.online`:

1. Resend Dashboard → **Domains** → **Add Domain** → `intelifin.online`
2. Resend muestra los registros DNS a agregar:

| Tipo | Host | Valor |
|------|------|-------|
| `TXT` | `@` | `v=spf1 include:amazonses.com ~all` |
| `TXT` | `resend._domainkey` | `p=MIGf...` (DKIM public key) |
| `TXT` | `_dmarc` | `v=DMARC1; p=none;` |

3. Agregar esos registros en Namecheap (o el registrador del dominio)
4. En Resend → click **Verify** — puede tardar hasta 48h en propagar

### Verificar estado del DNS

```bash
# SPF
dig TXT intelifin.online +short @1.1.1.1

# DKIM
dig TXT resend._domainkey.intelifin.online +short @1.1.1.1

# DMARC
dig TXT _dmarc.intelifin.online +short @1.1.1.1
```

### Templates de email

Los templates están en `src/lib/email/templates/`:

| Template | Cuándo se envía |
|----------|----------------|
| `ClientInvite` | Coach invita a un cliente nuevo |
| `CoachWelcome` | Coach completa su onboarding |
| `PlanUpgrade` | Wompi confirma pago Pro aprobado |
| `ProRenewalReminder` | 7 días antes de que expire el plan Pro |

Todos usan paleta dark de InteliFin y están en español.

### Dev mode

Si `RESEND_API_KEY` no está definida, `sendEmail()` loggea a consola en lugar de enviar. Seguro para desarrollo local.

---

## Wompi (Pagos)

**Dashboard:** https://comercios.wompi.co

### Configuración

El coach inicia el pago desde `/coach/settings` → "Activar Pro" → `startProCheckout()` genera una URL firmada de Wompi → el coach paga en la UI de Wompi → Wompi llama al webhook.

### Webhook

**URL del webhook en producción:**
```
https://intelifin.online/api/wompi/webhook
```

Configurar en el dashboard de Wompi → Eventos → URL de notificación.

**El webhook:**
1. Verifica la firma HMAC con `WOMPI_EVENTS_SECRET`
2. Busca el payment record por `wompi_reference`
3. Si el pago es `approved`, activa `plan='pro'` y extiende `plan_expires_at`
4. Envía email de confirmación al coach

### Migrar de test a producción

1. En Wompi dashboard: obtener las llaves de **producción** (no sandbox)
2. En Vercel: actualizar `WOMPI_PUBLIC_KEY`, `WOMPI_PRIVATE_KEY`, `WOMPI_INTEGRITY_SECRET`, `WOMPI_EVENTS_SECRET`
3. Hacer nuevo deploy

---

## Vercel Cron Jobs

### Cron activo

| Ruta | Schedule | Descripción |
|------|----------|-------------|
| `/api/cron/pro-renewal-reminder` | `0 10 * * *` | Diario a las 10:00 UTC — recordatorio de renovación Pro |

El schedule está en `vercel.json`. Vercel invoca el endpoint con el header:
```
Authorization: Bearer {CRON_SECRET}
```

### Probar el cron manualmente

```bash
curl -X GET https://intelifin.online/api/cron/pro-renewal-reminder \
  -H "Authorization: Bearer <CRON_SECRET>"
```

Respuesta esperada:
```json
{ "ok": true, "sent": 0 }
```

(0 si no hay planes expirando en 7 días, N si se enviaron emails)

### Logs del cron

En Vercel Dashboard → proyecto → **Logs** → filtrar por `/api/cron/`.

---

## Dominio y DNS

**Dominio:** `intelifin.online` — registrado en Namecheap
**DNS:** Administrado en Namecheap Advanced DNS

### Registros actuales

| Tipo | Host | Valor | Propósito |
|------|------|-------|-----------|
| `A` o `CNAME` | `@` | Vercel | Apuntar dominio a Vercel |
| `CNAME` | `www` | Vercel | Subdominio www |
| `TXT` | `@` | `v=spf1 include:amazonses.com ~all` | SPF para Resend |
| `TXT` | `resend._domainkey` | DKIM key de Resend | DKIM para Resend |
| `TXT` | `_dmarc` | `v=DMARC1; p=none;` | DMARC |

### Conectar dominio en Vercel

1. Vercel Dashboard → proyecto `intefin` → **Settings → Domains**
2. Click **Add** → ingresar `intelifin.online`
3. Vercel muestra los registros DNS a agregar
4. Agregar en Namecheap → esperar propagación (~5-30 min)

---

## Troubleshooting

### Login falla con "No pudimos enviar el link"

Verificar en **Supabase → Authentication → Logs**:

| Error | Causa | Solución |
|-------|-------|----------|
| `535 Authentication credentials invalid` | API key de Resend incorrecta en SMTP | Actualizar password en Supabase SMTP |
| `Error sending magic link email` | SMTP no configurado o dominio no verificado | Deshabilitar Custom SMTP temporalmente |
| Rate limit | Demasiados intentos en poco tiempo | Esperar 1 hora |

### Email no llega al destinatario

1. Verificar **Resend Dashboard → Emails** — ver si el envío aparece
2. Si aparece con error: problema de dominio o credenciales
3. Si no aparece: el envío falló antes de llegar a Resend (revisar logs de Vercel)
4. Revisar carpeta de spam del destinatario

### Webhook de Wompi no activa el plan

En Vercel Dashboard → **Logs** → filtrar por `/api/wompi/webhook`:

| Log | Causa |
|-----|-------|
| `invalid_signature` | `WOMPI_EVENTS_SECRET` incorrecto |
| `no_match` | El `wompi_reference` no existe en `subscription_payments` |
| `plan_activation` error | Error de DB al actualizar el plan |

### Cron no envía emails

1. Verificar que `CRON_SECRET` está en las env vars de Vercel
2. Probar el endpoint manualmente con curl (ver sección de crons)
3. Verificar que hay orgs con `plan='pro'` y `plan_expires_at` en 7 días

### Build falla en Vercel

```bash
# Reproducir el build localmente
npm run build
```

Errores comunes:
- TypeScript errors: los genera `npm run build` — corregir antes de hacer deploy
- Variables `NEXT_PUBLIC_*` undefined: verificar que están en Vercel env vars
