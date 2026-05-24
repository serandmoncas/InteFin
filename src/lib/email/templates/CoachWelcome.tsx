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
    display: "inline" as const,
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

const STEPS = [
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

            {STEPS.map((step, i) => (
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
