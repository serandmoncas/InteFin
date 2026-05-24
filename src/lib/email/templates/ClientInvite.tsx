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

          <Text style={styles.footer}>{orgName} · Powered by InteFin</Text>
        </Container>
      </Body>
    </Html>
  )
}
