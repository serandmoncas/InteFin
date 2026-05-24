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
