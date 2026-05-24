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

const BENEFITS = [
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

            {BENEFITS.map((benefit, i) => (
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
