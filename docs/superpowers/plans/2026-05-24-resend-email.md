# Email System (Resend + React Email) Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Instalar el módulo de email con Resend SDK + React Email templates, e integrarlo en las server actions de invitación, onboarding y activación de plan Pro.

**Architecture:** `src/lib/email/` expone tres funciones tipadas (`sendClientInviteEmail`, `sendCoachWelcomeEmail`, `sendPlanUpgradeEmail`). Internamente usan `sendEmail()` — un wrapper fire-and-forget que nunca lanza excepciones. Los templates son componentes React Email con la paleta dark de InteFin. La configuración SMTP de Supabase se hace manualmente en el dashboard (ver Task 10).

**Tech Stack:** `resend` ^6.12.3 (ya instalado), `@react-email/components` (nuevo), Vitest para tests.

---

## Mapa de archivos

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `src/lib/email/client.ts` | Crear | Resend SDK singleton (lazy init) |
| `src/lib/email/send.ts` | Crear | Wrapper `sendEmail()` — no lanza, loggea en dev |
| `src/lib/email/send.test.tsx` | Crear | Tests del wrapper |
| `src/lib/email/templates/ClientInvite.tsx` | Crear | Template invitación cliente |
| `src/lib/email/templates/CoachWelcome.tsx` | Crear | Template bienvenida coach |
| `src/lib/email/templates/PlanUpgrade.tsx` | Crear | Template confirmación Pro |
| `src/lib/email/index.ts` | Crear | API pública: funciones tipadas + tests |
| `src/lib/email/index.test.tsx` | Crear | Tests de las funciones tipadas |
| `src/actions/coach.ts` | Modificar | Enriquecer query + disparar invite email |
| `src/actions/onboarding.ts` | Modificar | Disparar welcome email antes del redirect |
| `src/app/api/wompi/webhook/route.ts` | Modificar | Disparar plan upgrade email al aprobar |
| `.env.local` | Modificar | Agregar RESEND_API_KEY y EMAIL_FROM |

---

### Task 1: Instalar dependencia y agregar env vars

**Files:**
- Modify: `package.json` (via npm)
- Modify: `.env.local`

- [ ] **Step 1: Instalar @react-email/components**

```bash
npm install @react-email/components
```

Expected output: `added N packages` sin errores.

- [ ] **Step 2: Agregar env vars a .env.local**

Abrir `.env.local` y agregar al final:

```bash
RESEND_API_KEY=re_XXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXXX
EMAIL_FROM=InteFin <hola@intefin.app>
```

> ⚠️ Reemplaza `re_XXXXXXXXX` con la API key real de https://resend.com/api-keys  
> ⚠️ Nunca agregar prefijo `NEXT_PUBLIC_` a estas variables.

- [ ] **Step 3: Verificar que la instalación no rompe el build**

```bash
npm run build 2>&1 | tail -5
```

Expected: `✓ Compiled successfully` o similar sin errores de tipo.

- [ ] **Step 4: Commit**

```bash
git add package.json package-lock.json
git commit -m "deps: add @react-email/components"
```

---

### Task 2: Crear `src/lib/email/client.ts`

**Files:**
- Create: `src/lib/email/client.ts`

- [ ] **Step 1: Crear el archivo**

```typescript
// src/lib/email/client.ts
import { Resend } from "resend"

let _client: Resend | null = null

/**
 * Returns a shared Resend SDK instance.
 * Lazy-initialized so tests can set RESEND_API_KEY before first call.
 * Pass any string as key when no key is set — sendEmail() checks for
 * the key separately and skips the actual send in dev mode.
 */
export function getResendClient(): Resend {
  if (!_client) {
    _client = new Resend(process.env.RESEND_API_KEY ?? "dev-no-key")
  }
  return _client
}

/** Reset singleton — used in tests only */
export function _resetResendClient(): void {
  _client = null
}
```

- [ ] **Step 2: Commit**

```bash
git add src/lib/email/client.ts
git commit -m "feat(email): Resend SDK singleton"
```

---

### Task 3: Crear `src/lib/email/send.ts` con TDD

**Files:**
- Create: `src/lib/email/send.ts`
- Create: `src/lib/email/send.test.tsx`

- [ ] **Step 1: Escribir el test primero**

```typescript
// src/lib/email/send.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"
import React from "react"

vi.mock("./client", () => ({
  getResendClient: vi.fn(),
  _resetResendClient: vi.fn(),
}))

import { sendEmail } from "./send"
import { getResendClient } from "./client"

const mockSend = vi.fn()

beforeEach(() => {
  vi.clearAllMocks()
  vi.mocked(getResendClient).mockReturnValue({ emails: { send: mockSend } } as never)
})

const baseParams = {
  to: "user@example.com",
  subject: "Test subject",
  react: React.createElement("div", null, "Hello"),
  text: "Hello",
}

describe("sendEmail", () => {
  describe("when RESEND_API_KEY is set", () => {
    beforeEach(() => {
      process.env.RESEND_API_KEY = "re_test_key"
    })
    afterEach(() => {
      delete process.env.RESEND_API_KEY
    })

    it("sends email and returns empty object on success", async () => {
      mockSend.mockResolvedValue({ data: { id: "msg_123" }, error: null })

      const result = await sendEmail(baseParams)

      expect(result).toEqual({})
      expect(mockSend).toHaveBeenCalledOnce()
      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({
          to: "user@example.com",
          subject: "Test subject",
        })
      )
    })

    it("returns { error } without throwing when Resend API returns an error", async () => {
      mockSend.mockResolvedValue({ data: null, error: { message: "Resend API error" } })

      const result = await sendEmail(baseParams)

      expect(result.error).toBe("Resend API error")
    })

    it("returns { error } without throwing when send() rejects", async () => {
      mockSend.mockRejectedValue(new Error("Network failure"))

      const result = await sendEmail(baseParams)

      expect(result.error).toBe("Network failure")
    })

    it("uses EMAIL_FROM env var as sender", async () => {
      process.env.EMAIL_FROM = "MiApp <hola@miapp.com>"
      mockSend.mockResolvedValue({ data: { id: "x" }, error: null })

      await sendEmail(baseParams)

      expect(mockSend).toHaveBeenCalledWith(
        expect.objectContaining({ from: "MiApp <hola@miapp.com>" })
      )
      delete process.env.EMAIL_FROM
    })
  })

  describe("when RESEND_API_KEY is not set", () => {
    beforeEach(() => {
      delete process.env.RESEND_API_KEY
    })

    it("skips the send and logs subject to console", async () => {
      const consoleSpy = vi.spyOn(console, "log").mockImplementation(() => {})

      const result = await sendEmail(baseParams)

      expect(result).toEqual({})
      expect(mockSend).not.toHaveBeenCalled()
      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("Test subject")
      )
      consoleSpy.mockRestore()
    })
  })
})
```

- [ ] **Step 2: Correr el test para confirmar que falla**

```bash
npx vitest run src/lib/email/send.test.tsx
```

Expected: error `Cannot find module './send'`.

- [ ] **Step 3: Implementar `send.ts`**

```typescript
// src/lib/email/send.ts
import type { ReactElement } from "react"
import { getResendClient } from "./client"

export interface SendEmailParams {
  to: string
  subject: string
  react: ReactElement
  text: string
}

/**
 * Fire-and-forget email wrapper.
 * - Never throws: catches all errors and returns { error? }.
 * - If RESEND_API_KEY is not set, logs to console (dev mode).
 * - Uses EMAIL_FROM env var as sender, falls back to hola@intefin.app.
 */
export async function sendEmail(
  params: SendEmailParams
): Promise<{ error?: string }> {
  if (!process.env.RESEND_API_KEY) {
    console.log(
      `[email] dev mode — skipping send to ${params.to}: "${params.subject}"`
    )
    return {}
  }

  try {
    const client = getResendClient()
    const from = process.env.EMAIL_FROM ?? "InteFin <hola@intefin.app>"

    const { error } = await client.emails.send({
      from,
      to: params.to,
      subject: params.subject,
      react: params.react,
      text: params.text,
    })

    if (error) {
      console.error("[email] send error:", error)
      return { error: (error as { message: string }).message }
    }

    return {}
  } catch (err) {
    const message = err instanceof Error ? err.message : "unknown error"
    console.error("[email] unexpected error:", message)
    return { error: message }
  }
}
```

- [ ] **Step 4: Correr el test para confirmar que pasa**

```bash
npx vitest run src/lib/email/send.test.tsx
```

Expected: `✓ 5 tests passed`.

- [ ] **Step 5: Commit**

```bash
git add src/lib/email/send.ts src/lib/email/send.test.tsx
git commit -m "feat(email): sendEmail wrapper with dev-mode fallback"
```

---

### Task 4: Template `ClientInvite.tsx`

**Files:**
- Create: `src/lib/email/templates/ClientInvite.tsx`

- [ ] **Step 1: Crear el template**

```tsx
// src/lib/email/templates/ClientInvite.tsx
import React from "react"
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components"

export interface ClientInviteProps {
  clientName: string
  coachName: string
  orgName: string
  inviteLink: string
}

const styles = {
  body: {
    backgroundColor: "#0a0f1e",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    fontWeight: "700" as const,
    fontSize: "18px",
    borderRadius: "10px",
    padding: "10px 18px",
    marginBottom: "12px",
  },
  brandName: {
    color: "#f1f5f9",
    fontSize: "22px",
    fontWeight: "700" as const,
    margin: "0 0 32px 0",
  },
  surface: {
    backgroundColor: "#0f172a",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #1e293b",
  },
  heading: {
    color: "#f1f5f9",
    fontSize: "22px",
    fontWeight: "700" as const,
    margin: "0 0 16px 0",
    lineHeight: "1.3",
  },
  text: {
    color: "#94a3b8",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
  },
  coachHighlight: {
    color: "#a5b4fc",
    fontWeight: "600" as const,
  },
  button: {
    backgroundColor: "#6366f1",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "600" as const,
    textDecoration: "none",
    display: "inline-block",
    margin: "8px 0 24px 0",
  },
  hr: {
    borderColor: "#1e293b",
    margin: "24px 0",
  },
  expiry: {
    color: "#64748b",
    fontSize: "13px",
    margin: "0 0 8px 0",
  },
  footer: {
    color: "#475569",
    fontSize: "12px",
    margin: "24px 0 0 0",
    textAlign: "center" as const,
  },
}

export function ClientInvite({
  clientName,
  coachName,
  orgName,
  inviteLink,
}: ClientInviteProps) {
  return (
    <Html lang="es">
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Logo */}
          <div style={styles.badge}>IF</div>
          <Text style={styles.brandName}>InteFin</Text>

          {/* Card */}
          <Section style={styles.surface}>
            <Heading style={styles.heading}>
              Tu coach te invitó a InteFin
            </Heading>

            <Text style={styles.text}>
              Hola <strong style={{ color: "#f1f5f9" }}>{clientName}</strong>,
            </Text>

            <Text style={styles.text}>
              <span style={styles.coachHighlight}>{coachName}</span> te invitó a
              completar tu diagnóstico financiero en InteFin — la plataforma para
              coaches financieros y sus clientes.
            </Text>

            <Text style={styles.text}>
              Haz clic en el botón para acceder a tu cuenta y completar el
              diagnóstico:
            </Text>

            <Button href={inviteLink} style={styles.button}>
              Completar mi diagnóstico financiero →
            </Button>

            <Hr style={styles.hr} />

            <Text style={styles.expiry}>
              ⏱ Este link expira en 24 horas.
            </Text>
            <Text style={styles.expiry}>
              Si no esperabas este email, puedes ignorarlo.
            </Text>
          </Section>

          <Text style={styles.footer}>
            {orgName} · Powered by InteFin
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 2: Verificar que el template compila sin errores de tipo**

```bash
npx tsc --noEmit 2>&1 | grep "ClientInvite" || echo "✓ sin errores de tipo"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/templates/ClientInvite.tsx
git commit -m "feat(email): ClientInvite React Email template"
```

---

### Task 5: Template `CoachWelcome.tsx`

**Files:**
- Create: `src/lib/email/templates/CoachWelcome.tsx`

- [ ] **Step 1: Crear el template**

```tsx
// src/lib/email/templates/CoachWelcome.tsx
import React from "react"
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components"

export interface CoachWelcomeProps {
  coachName: string
  orgName: string
  siteUrl: string
}

const styles = {
  body: {
    backgroundColor: "#0a0f1e",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    fontWeight: "700" as const,
    fontSize: "18px",
    borderRadius: "10px",
    padding: "10px 18px",
    marginBottom: "12px",
  },
  brandName: {
    color: "#f1f5f9",
    fontSize: "22px",
    fontWeight: "700" as const,
    margin: "0 0 32px 0",
  },
  surface: {
    backgroundColor: "#0f172a",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #1e293b",
  },
  heading: {
    color: "#f1f5f9",
    fontSize: "24px",
    fontWeight: "700" as const,
    margin: "0 0 8px 0",
    lineHeight: "1.3",
  },
  subheading: {
    color: "#94a3b8",
    fontSize: "15px",
    margin: "0 0 28px 0",
  },
  stepRow: {
    marginBottom: "20px",
  },
  stepNumber: {
    display: "inline-block",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    borderRadius: "50%",
    width: "28px",
    height: "28px",
    textAlign: "center" as const,
    lineHeight: "28px",
    fontSize: "13px",
    fontWeight: "700" as const,
    marginRight: "12px",
    verticalAlign: "middle",
  },
  stepText: {
    color: "#cbd5e1",
    fontSize: "15px",
    display: "inline",
    verticalAlign: "middle",
  },
  button: {
    backgroundColor: "#6366f1",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "600" as const,
    textDecoration: "none",
    display: "inline-block",
    margin: "24px 0 0 0",
  },
  hr: {
    borderColor: "#1e293b",
    margin: "28px 0",
  },
  planNote: {
    backgroundColor: "#0a0f1e",
    borderRadius: "8px",
    padding: "16px",
    border: "1px solid #1e293b",
  },
  planNoteText: {
    color: "#64748b",
    fontSize: "13px",
    margin: 0,
  },
  footer: {
    color: "#475569",
    fontSize: "12px",
    margin: "24px 0 0 0",
    textAlign: "center" as const,
  },
}

const steps = [
  "Invita a tu primer cliente desde el dashboard",
  "El cliente completa el diagnóstico financiero",
  "Analiza el progreso en tiempo real con las 4 cuentas",
]

export function CoachWelcome({ coachName, orgName, siteUrl }: CoachWelcomeProps) {
  const dashboardUrl = `${siteUrl}/coach/overview`

  return (
    <Html lang="es">
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Logo */}
          <div style={styles.badge}>IF</div>
          <Text style={styles.brandName}>InteFin</Text>

          {/* Card */}
          <Section style={styles.surface}>
            <Heading style={styles.heading}>
              ¡Bienvenido a InteFin, {coachName}!
            </Heading>
            <Text style={styles.subheading}>
              Tu práctica <strong>{orgName}</strong> ya está lista.
            </Text>

            <Text style={{ color: "#94a3b8", fontSize: "15px", margin: "0 0 24px 0" }}>
              Para empezar:
            </Text>

            {steps.map((step, i) => (
              <div key={i} style={styles.stepRow}>
                <span style={styles.stepNumber}>{i + 1}</span>
                <span style={styles.stepText}>{step}</span>
              </div>
            ))}

            <Button href={dashboardUrl} style={styles.button}>
              Ver mi dashboard →
            </Button>

            <Hr style={styles.hr} />

            <div style={styles.planNote}>
              <Text style={styles.planNoteText}>
                📋 <strong style={{ color: "#94a3b8" }}>Plan Free:</strong>{" "}
                hasta 3 clientes activos. Cuando estés listo, actualiza a Pro
                desde Configuración → Plan.
              </Text>
            </div>
          </Section>

          <Text style={styles.footer}>
            InteFin · Inteligencia Financiera para coaches
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | grep "CoachWelcome" || echo "✓ sin errores de tipo"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/templates/CoachWelcome.tsx
git commit -m "feat(email): CoachWelcome React Email template"
```

---

### Task 6: Template `PlanUpgrade.tsx`

**Files:**
- Create: `src/lib/email/templates/PlanUpgrade.tsx`

- [ ] **Step 1: Crear el template**

```tsx
// src/lib/email/templates/PlanUpgrade.tsx
import React from "react"
import {
  Html,
  Head,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
} from "@react-email/components"

export interface PlanUpgradeProps {
  coachName: string
  planExpiresAt: string | null  // ISO date string or null
  siteUrl: string
}

const styles = {
  body: {
    backgroundColor: "#0a0f1e",
    fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
    margin: 0,
    padding: 0,
  },
  container: {
    maxWidth: "600px",
    margin: "0 auto",
    padding: "40px 20px",
  },
  badge: {
    display: "inline-block",
    backgroundColor: "#6366f1",
    color: "#ffffff",
    fontWeight: "700" as const,
    fontSize: "18px",
    borderRadius: "10px",
    padding: "10px 18px",
    marginBottom: "12px",
  },
  brandName: {
    color: "#f1f5f9",
    fontSize: "22px",
    fontWeight: "700" as const,
    margin: "0 0 32px 0",
  },
  surface: {
    backgroundColor: "#0f172a",
    borderRadius: "12px",
    padding: "32px",
    border: "1px solid #1e293b",
  },
  successBadge: {
    display: "inline-block",
    backgroundColor: "#052e16",
    color: "#4ade80",
    borderRadius: "6px",
    padding: "6px 14px",
    fontSize: "13px",
    fontWeight: "600" as const,
    marginBottom: "20px",
  },
  heading: {
    color: "#f1f5f9",
    fontSize: "24px",
    fontWeight: "700" as const,
    margin: "0 0 16px 0",
    lineHeight: "1.3",
  },
  text: {
    color: "#94a3b8",
    fontSize: "15px",
    lineHeight: "1.6",
    margin: "0 0 16px 0",
  },
  benefitRow: {
    color: "#cbd5e1",
    fontSize: "15px",
    margin: "0 0 10px 0",
  },
  button: {
    backgroundColor: "#6366f1",
    color: "#ffffff",
    borderRadius: "8px",
    padding: "14px 28px",
    fontSize: "15px",
    fontWeight: "600" as const,
    textDecoration: "none",
    display: "inline-block",
    margin: "24px 0 0 0",
  },
  hr: {
    borderColor: "#1e293b",
    margin: "28px 0",
  },
  expiryNote: {
    color: "#64748b",
    fontSize: "13px",
    margin: 0,
  },
  footer: {
    color: "#475569",
    fontSize: "12px",
    margin: "24px 0 0 0",
    textAlign: "center" as const,
  },
}

const benefits = [
  "✓ Clientes ilimitados",
  "✓ Todo lo del plan Free",
  "✓ Soporte prioritario",
  "✓ Acceso anticipado a nuevas funciones",
]

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function PlanUpgrade({ coachName, planExpiresAt, siteUrl }: PlanUpgradeProps) {
  const dashboardUrl = `${siteUrl}/coach/overview`

  return (
    <Html lang="es">
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Logo */}
          <div style={styles.badge}>IF</div>
          <Text style={styles.brandName}>InteFin</Text>

          {/* Card */}
          <Section style={styles.surface}>
            <div style={styles.successBadge}>✓ Plan activado</div>

            <Heading style={styles.heading}>
              Tu plan Pro está activo, {coachName}
            </Heading>

            <Text style={styles.text}>
              Tu pago fue procesado exitosamente. A partir de ahora tienes acceso
              a todas las funciones Pro:
            </Text>

            {benefits.map((benefit, i) => (
              <Text key={i} style={styles.benefitRow}>
                {benefit}
              </Text>
            ))}

            <Button href={dashboardUrl} style={styles.button}>
              Ver mi dashboard →
            </Button>

            {planExpiresAt && (
              <>
                <Hr style={styles.hr} />
                <Text style={styles.expiryNote}>
                  📅 Tu plan Pro está activo hasta el{" "}
                  <strong style={{ color: "#94a3b8" }}>
                    {formatDate(planExpiresAt)}
                  </strong>
                  . Puedes renovarlo desde Configuración → Plan.
                </Text>
              </>
            )}
          </Section>

          <Text style={styles.footer}>
            InteFin · Inteligencia Financiera para coaches
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
```

- [ ] **Step 2: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | grep "PlanUpgrade" || echo "✓ sin errores de tipo"
```

- [ ] **Step 3: Commit**

```bash
git add src/lib/email/templates/PlanUpgrade.tsx
git commit -m "feat(email): PlanUpgrade React Email template"
```

---

### Task 7: Crear `src/lib/email/index.ts` con TDD

**Files:**
- Create: `src/lib/email/index.ts`
- Create: `src/lib/email/index.test.tsx`

- [ ] **Step 1: Escribir los tests**

```tsx
// src/lib/email/index.test.tsx
import { describe, it, expect, vi, beforeEach, afterEach } from "vitest"

vi.mock("./send", () => ({
  sendEmail: vi.fn().mockResolvedValue({}),
}))

import {
  sendClientInviteEmail,
  sendCoachWelcomeEmail,
  sendPlanUpgradeEmail,
} from "./index"
import { sendEmail } from "./send"

const mockSendEmail = vi.mocked(sendEmail)

beforeEach(() => {
  vi.clearAllMocks()
})

describe("sendClientInviteEmail", () => {
  it("calls sendEmail with correct subject and recipient", async () => {
    await sendClientInviteEmail({
      clientEmail: "client@example.com",
      clientName: "Ana García",
      coachName: "Mabel Álvarez",
      orgName: "Finanzas con Mabel",
      inviteLink: "https://intefin.app/invite/abc",
    })

    expect(mockSendEmail).toHaveBeenCalledOnce()
    const call = mockSendEmail.mock.calls[0][0]
    expect(call.to).toBe("client@example.com")
    expect(call.subject).toContain("Mabel Álvarez")
    expect(call.text).toContain("Ana García")
    expect(call.text).toContain("https://intefin.app/invite/abc")
  })
})

describe("sendCoachWelcomeEmail", () => {
  it("calls sendEmail with correct subject and recipient", async () => {
    await sendCoachWelcomeEmail({
      coachEmail: "coach@example.com",
      coachName: "Mabel Álvarez",
      orgName: "Finanzas con Mabel",
      siteUrl: "https://intefin.vercel.app",
    })

    expect(mockSendEmail).toHaveBeenCalledOnce()
    const call = mockSendEmail.mock.calls[0][0]
    expect(call.to).toBe("coach@example.com")
    expect(call.subject).toContain("Mabel Álvarez")
    expect(call.text).toContain("Finanzas con Mabel")
  })
})

describe("sendPlanUpgradeEmail", () => {
  it("calls sendEmail with correct subject and recipient", async () => {
    await sendPlanUpgradeEmail({
      coachEmail: "coach@example.com",
      coachName: "Mabel Álvarez",
      planExpiresAt: "2026-06-24T00:00:00Z",
      siteUrl: "https://intefin.vercel.app",
    })

    expect(mockSendEmail).toHaveBeenCalledOnce()
    const call = mockSendEmail.mock.calls[0][0]
    expect(call.to).toBe("coach@example.com")
    expect(call.subject).toContain("Pro")
    expect(call.text).toContain("Mabel Álvarez")
  })

  it("handles null planExpiresAt without throwing", async () => {
    await expect(
      sendPlanUpgradeEmail({
        coachEmail: "coach@example.com",
        coachName: "Mabel",
        planExpiresAt: null,
        siteUrl: "https://intefin.vercel.app",
      })
    ).resolves.toBeUndefined()
  })
})
```

- [ ] **Step 2: Correr para confirmar que falla**

```bash
npx vitest run src/lib/email/index.test.tsx
```

Expected: error `Cannot find module './index'`.

- [ ] **Step 3: Implementar `index.ts`**

```typescript
// src/lib/email/index.ts
import React from "react"
import { sendEmail } from "./send"
import { ClientInvite } from "./templates/ClientInvite"
import { CoachWelcome } from "./templates/CoachWelcome"
import { PlanUpgrade } from "./templates/PlanUpgrade"

// ── Types ──────────────────────────────────────────────────────────────────

export interface ClientInviteEmailParams {
  clientEmail: string
  clientName: string
  coachName: string
  orgName: string
  inviteLink: string
}

export interface CoachWelcomeEmailParams {
  coachEmail: string
  coachName: string
  orgName: string
  siteUrl: string
}

export interface PlanUpgradeEmailParams {
  coachEmail: string
  coachName: string
  planExpiresAt: string | null
  siteUrl: string
}

// ── Public API ─────────────────────────────────────────────────────────────

export async function sendClientInviteEmail(
  params: ClientInviteEmailParams
): Promise<void> {
  await sendEmail({
    to: params.clientEmail,
    subject: `${params.coachName} te invitó a InteFin`,
    react: React.createElement(ClientInvite, {
      clientName: params.clientName,
      coachName: params.coachName,
      orgName: params.orgName,
      inviteLink: params.inviteLink,
    }),
    text: [
      `Hola ${params.clientName},`,
      "",
      `${params.coachName} te invitó a completar tu diagnóstico financiero en InteFin.`,
      "",
      `Entra aquí: ${params.inviteLink}`,
      "",
      "El link expira en 24 horas.",
      "",
      `— ${params.orgName}`,
    ].join("\n"),
  })
}

export async function sendCoachWelcomeEmail(
  params: CoachWelcomeEmailParams
): Promise<void> {
  await sendEmail({
    to: params.coachEmail,
    subject: `¡Bienvenido a InteFin, ${params.coachName}!`,
    react: React.createElement(CoachWelcome, {
      coachName: params.coachName,
      orgName: params.orgName,
      siteUrl: params.siteUrl,
    }),
    text: [
      `¡Bienvenido a InteFin, ${params.coachName}!`,
      "",
      `Tu práctica "${params.orgName}" ya está lista.`,
      "",
      "Para empezar:",
      "1. Invita a tu primer cliente desde el dashboard",
      "2. El cliente completa el diagnóstico financiero",
      "3. Analiza el progreso en tiempo real con las 4 cuentas",
      "",
      `Ver mi dashboard: ${params.siteUrl}/coach/overview`,
      "",
      "Plan Free: hasta 3 clientes activos.",
    ].join("\n"),
  })
}

export async function sendPlanUpgradeEmail(
  params: PlanUpgradeEmailParams
): Promise<void> {
  await sendEmail({
    to: params.coachEmail,
    subject: "Tu plan Pro está activo — InteFin",
    react: React.createElement(PlanUpgrade, {
      coachName: params.coachName,
      planExpiresAt: params.planExpiresAt,
      siteUrl: params.siteUrl,
    }),
    text: [
      `Hola ${params.coachName},`,
      "",
      "Tu plan Pro está activo. Tu pago fue procesado exitosamente.",
      "",
      "Beneficios Pro:",
      "- Clientes ilimitados",
      "- Soporte prioritario",
      "- Acceso anticipado a nuevas funciones",
      "",
      params.planExpiresAt
        ? `Tu plan es válido hasta: ${new Date(params.planExpiresAt).toLocaleDateString("es-CO")}`
        : "",
      "",
      `Ver mi dashboard: ${params.siteUrl}/coach/overview`,
    ]
      .filter((line) => line !== null)
      .join("\n"),
  })
}
```

- [ ] **Step 4: Correr los tests para confirmar que pasan**

```bash
npx vitest run src/lib/email/index.test.tsx
```

Expected: `✓ 4 tests passed`.

- [ ] **Step 5: Correr todos los tests del proyecto**

```bash
npm test
```

Expected: todos los tests pasan.

- [ ] **Step 6: Commit**

```bash
git add src/lib/email/index.ts src/lib/email/index.test.tsx
git commit -m "feat(email): public API — sendClientInviteEmail, sendCoachWelcomeEmail, sendPlanUpgradeEmail"
```

---

### Task 8: Integrar invite email en `src/actions/coach.ts`

**Files:**
- Modify: `src/actions/coach.ts`

- [ ] **Step 1: Enriquecer la query del profile para traer `full_name`**

Cambiar la línea:
```typescript
    .select("organization_id")
```
Por:
```typescript
    .select("organization_id, full_name")
```

- [ ] **Step 2: Enriquecer la query de org para traer `name`**

Cambiar la línea:
```typescript
    .select("plan, plan_expires_at")
```
Por:
```typescript
    .select("plan, plan_expires_at, name")
```

- [ ] **Step 3: Agregar el import y el call fire-and-forget**

Agregar el import al inicio del archivo (después de los imports existentes):
```typescript
import { sendClientInviteEmail } from "@/lib/email"
```

Agregar el call de email justo antes del `return { success: true, ... }` final (línea 109):
```typescript
  // Fire-and-forget — no bloquea la respuesta al coach
  const siteUrlForEmail = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intefin.vercel.app"
  void sendClientInviteEmail({
    clientEmail:  email,
    clientName:   fullName,
    coachName:    profile.full_name ?? "Tu coach",
    orgName:      org?.name ?? "InteFin",
    inviteLink:   linkData.properties.action_link,
  }).catch((err: unknown) => console.error("[email] invite failed:", err))
```

- [ ] **Step 4: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | grep "coach.ts" || echo "✓ sin errores de tipo en coach.ts"
```

- [ ] **Step 5: Commit**

```bash
git add src/actions/coach.ts
git commit -m "feat(email): send invite email to client on inviteClient()"
```

---

### Task 9: Integrar welcome email en `src/actions/onboarding.ts`

**Files:**
- Modify: `src/actions/onboarding.ts`

- [ ] **Step 1: Agregar el import**

Agregar al inicio del archivo (después de los imports existentes):
```typescript
import { sendCoachWelcomeEmail } from "@/lib/email"
```

- [ ] **Step 2: Agregar el call de email antes del `redirect`**

Localizar el bloque al final de `completeCoachOnboarding` (antes de `redirect("/coach/overview")`):

```typescript
  if (profileError) {
    console.error("[onboarding] profile update failed:", profileError)
    return { error: `No se pudo guardar tu perfil: ${profileError.message}` }
  }

  redirect("/coach/overview")
```

Reemplazarlo por:
```typescript
  if (profileError) {
    console.error("[onboarding] profile update failed:", profileError)
    return { error: `No se pudo guardar tu perfil: ${profileError.message}` }
  }

  // Fire-and-forget — redirect no puede lanzar después del await
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intefin.vercel.app"
  void sendCoachWelcomeEmail({
    coachEmail: user.email!,
    coachName:  fullName,
    orgName,
    siteUrl,
  }).catch((err: unknown) => console.error("[email] welcome failed:", err))

  redirect("/coach/overview")
```

> ℹ️ `redirect()` en Next.js lanza internamente una excepción especial. El `sendCoachWelcomeEmail` es fire-and-forget (no await), así que `redirect` se ejecuta inmediatamente después de disparar el email sin bloquear.

- [ ] **Step 3: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | grep "onboarding.ts" || echo "✓ sin errores de tipo en onboarding.ts"
```

- [ ] **Step 4: Commit**

```bash
git add src/actions/onboarding.ts
git commit -m "feat(email): send welcome email to coach on onboarding complete"
```

---

### Task 10: Integrar plan upgrade email en el webhook de Wompi

**Files:**
- Modify: `src/app/api/wompi/webhook/route.ts`

- [ ] **Step 1: Agregar el import**

Agregar al inicio del archivo (después de los imports existentes):
```typescript
import { sendPlanUpgradeEmail } from "@/lib/email"
```

- [ ] **Step 2: Agregar el call de email dentro del bloque `if (newStatus === "approved")`**

Localizar el bloque (hacia el final del handler):
```typescript
    console.log("[wompi webhook] activated pro for org", payment.organization_id, "until", newExpiration.toISOString())
  }

  return NextResponse.json({ ok: true })
```

Reemplazarlo por:
```typescript
    console.log("[wompi webhook] activated pro for org", payment.organization_id, "until", newExpiration.toISOString())

    // Get coach email to send confirmation — fire-and-forget
    const { data: coachProfile } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("organization_id", payment.organization_id)
      .eq("role", "coach")
      .maybeSingle()

    if (coachProfile) {
      const { data: authData } = await admin.auth.admin.getUserById(coachProfile.id)
      const coachEmail = authData?.user?.email

      if (coachEmail) {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intefin.vercel.app"
        void sendPlanUpgradeEmail({
          coachEmail,
          coachName:     coachProfile.full_name ?? "Coach",
          planExpiresAt: newExpiration.toISOString(),
          siteUrl,
        }).catch((err: unknown) => console.error("[email] plan upgrade failed:", err))
      }
    }
  }

  return NextResponse.json({ ok: true })
```

- [ ] **Step 3: Verificar tipos**

```bash
npx tsc --noEmit 2>&1 | grep "webhook" || echo "✓ sin errores de tipo en webhook"
```

- [ ] **Step 4: Correr todos los tests**

```bash
npm test
```

Expected: todos los tests existentes pasan (los tests del webhook no prueban el email — es fire-and-forget).

- [ ] **Step 5: Commit**

```bash
git add src/app/api/wompi/webhook/route.ts
git commit -m "feat(email): send plan upgrade email on Wompi webhook approval"
```

---

### Task 11: Configuración manual — Supabase SMTP + Resend domain

> ⚠️ Estos pasos son manuales en el dashboard, no en código.

**Files:**
- Ninguno (configuración de dashboard)

- [ ] **Step 1: Verificar dominio en Resend**

1. Ir a https://resend.com/domains
2. Agregar `intefin.app` (o usar `intefin.vercel.app` si el dominio aún no está registrado)
3. Seguir los pasos de verificación DNS (agregar registros MX, SPF, DKIM al DNS del dominio)
4. Esperar a que el dominio quede en estado **Verified** ✓

> Si `intefin.app` no está registrado aún, usar `intefin.vercel.app` como sender temporalmente.
> Resend permite usar `@intefin.vercel.app` sin verificación adicional para proyectos Vercel.

- [ ] **Step 2: Obtener API Key de Resend**

1. Ir a https://resend.com/api-keys
2. Crear una nueva API key con permiso **Sending access** para el dominio verificado
3. Copiar la key (formato `re_XXXXXXXXX`)

- [ ] **Step 3: Agregar RESEND_API_KEY a Vercel**

```bash
vercel env add RESEND_API_KEY production
# Pegar la key cuando lo solicite

vercel env add EMAIL_FROM production
# Ingresar: InteFin <hola@intefin.app>
```

- [ ] **Step 4: Configurar SMTP en Supabase Dashboard**

1. Ir a https://supabase.com/dashboard/project/cgeowklrdzhlwhllfopo/auth/smtp
2. Habilitar **Custom SMTP**
3. Completar:
   - **Sender name:** `InteFin`
   - **Sender email:** `hola@intefin.app`
   - **Host:** `smtp.resend.com`
   - **Port:** `465`
   - **Username:** `resend`
   - **Password:** `<tu RESEND_API_KEY>`
4. Guardar

- [ ] **Step 5: Agregar Redirect URLs en Supabase**

1. Ir a https://supabase.com/dashboard/project/cgeowklrdzhlwhllfopo/auth/url-configuration
2. Bajo **Redirect URLs**, agregar:
   - `https://intefin.vercel.app/auth/callback`
   - `https://intefin.app/auth/callback` (cuando el dominio esté activo)
3. Guardar

- [ ] **Step 6: Verificar el OTP en producción**

1. Ir a https://intefin.vercel.app/auth/login
2. Ingresar `smonsalve@gmail.com`
3. Hacer click en "Enviar link de acceso"
4. Confirmar que el email llega y el magic link funciona

---

### Task 12: Deploy y verificación final

**Files:**
- Ninguno

- [ ] **Step 1: Build limpio local**

```bash
npm run build
```

Expected: `✓ Compiled successfully` sin errores.

- [ ] **Step 2: Deploy a producción**

```bash
vercel deploy --prod --yes
```

- [ ] **Step 3: Smoke test del flujo de invitación**

Con un usuario coach autenticado:
1. Ir a `/coach/invite`
2. Invitar un email de prueba
3. Confirmar que el email de invitación llega al cliente

- [ ] **Step 4: Commit final si hay cambios pendientes**

```bash
git status
# Si hay archivos sin commitear:
git add -A
git commit -m "feat(W3): Resend email system — OTP fix + invite + welcome + plan upgrade"
```

---

## Self-Review

**Cobertura del spec:**
- ✅ Capa 1 (SMTP Supabase): Task 11 pasos 1-5
- ✅ Capa 2 (módulo email): Tasks 2-7
- ✅ ClientInvite template: Task 4
- ✅ CoachWelcome template: Task 5
- ✅ PlanUpgrade template: Task 6
- ✅ Integración coach.ts: Task 8
- ✅ Integración onboarding.ts: Task 9
- ✅ Integración webhook: Task 10
- ✅ Dev mode sin API key: `send.ts` implementación + test
- ✅ Fire-and-forget con `.catch()`: Tasks 8, 9, 10
- ✅ RESEND_API_KEY sin NEXT_PUBLIC_: Task 11 paso 3

**Consistencia de tipos:**
- `ClientInviteProps` definido en `ClientInvite.tsx` → matches `React.createElement(ClientInvite, {...})` en `index.ts`
- `CoachWelcomeProps` definido en `CoachWelcome.tsx` → matches call en `index.ts`
- `PlanUpgradeProps` definido en `PlanUpgrade.tsx` → matches call en `index.ts`
- `ClientInviteEmailParams`, `CoachWelcomeEmailParams`, `PlanUpgradeEmailParams` en `index.ts` → matches calls en `coach.ts`, `onboarding.ts`, `webhook/route.ts`
