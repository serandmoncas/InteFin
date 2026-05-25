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

export interface ProRenewalReminderProps {
  coachName: string
  planExpiresAt: string   // ISO date string
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
  warningBadge: {
    display: "inline-block",
    backgroundColor: "#431407",
    color: "#fb923c",
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
  expiryBox: {
    backgroundColor: "#1e293b",
    borderRadius: "8px",
    padding: "16px 20px",
    margin: "20px 0",
  },
  expiryLabel: {
    color: "#64748b",
    fontSize: "12px",
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: "0.05em",
    margin: "0 0 4px 0",
  },
  expiryDate: {
    color: "#fb923c",
    fontSize: "18px",
    fontWeight: "700" as const,
    margin: 0,
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
  note: {
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

function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString("es-CO", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

export function ProRenewalReminder({
  coachName,
  planExpiresAt,
  siteUrl,
}: ProRenewalReminderProps) {
  const settingsUrl = `${siteUrl}/coach/settings`

  return (
    <Html lang="es">
      <Head />
      <Body style={styles.body}>
        <Container style={styles.container}>
          {/* Logo */}
          <div style={styles.badge}>IF</div>
          <Text style={styles.brandName}>InteliFin</Text>

          {/* Card */}
          <Section style={styles.surface}>
            <div style={styles.warningBadge}>⚠️ Tu plan Pro vence pronto</div>

            <Heading style={styles.heading}>
              Renueva tu plan, {coachName}
            </Heading>

            <Text style={styles.text}>
              Tu plan Pro de InteliFin vence en <strong style={{ color: "#f1f5f9" }}>7 días</strong>.
              Renuévalo para mantener acceso ilimitado a todos tus clientes.
            </Text>

            <div style={styles.expiryBox}>
              <Text style={styles.expiryLabel}>Fecha de vencimiento</Text>
              <Text style={styles.expiryDate}>{formatDate(planExpiresAt)}</Text>
            </div>

            <Text style={styles.text}>
              Si no renuevas, tu cuenta pasará automáticamente al plan Free
              y solo podrás gestionar hasta 3 clientes activos.
            </Text>

            <Button href={settingsUrl} style={styles.button}>
              Renovar plan Pro →
            </Button>

            <Hr style={styles.hr} />

            <Text style={styles.note}>
              Para renovar: ve a{" "}
              <strong style={{ color: "#94a3b8" }}>Configuración → Plan</strong>{" "}
              y haz clic en "Activar Pro".
            </Text>
          </Section>

          <Text style={styles.footer}>
            InteliFin · Inteligencia Financiera para coaches
          </Text>
        </Container>
      </Body>
    </Html>
  )
}
