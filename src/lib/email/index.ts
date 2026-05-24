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
