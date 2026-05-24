"use server"

import { createClient } from "@/lib/supabase/server"
import { PLANS } from "@/lib/plan/limits"
import { buildCheckoutUrl, getWompiConfig } from "@/lib/wompi/checkout"

export interface StartCheckoutResult {
  success?:  boolean
  url?:      string
  reference?: string
  error?:    string
}

/**
 * Creates a pending payment record and returns the Wompi checkout URL.
 * The user is then redirected to Wompi to complete the payment.
 * Webhook handler (POST /api/wompi/webhook) updates the status afterwards.
 */
export async function startProCheckout(): Promise<StartCheckoutResult> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) return { error: "Perfil incompleto." }
  if (profile.role !== "coach")  return { error: "Solo coaches pueden activar el plan." }

  // Verify Wompi config exists before creating any DB rows
  let wompi
  try {
    wompi = getWompiConfig()
  } catch {
    return { error: "Wompi no está configurado. Contacta al administrador." }
  }

  const amountCOP   = PLANS.pro.monthlyPriceCOP
  const reference   = `intefin_${profile.organization_id.slice(0, 8)}_${Date.now()}`
  const siteUrl     = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intefin.vercel.app"
  const redirectUrl = `${siteUrl}/coach/settings?payment=${reference}`

  // Insert pending payment record
  const { error: insertError } = await supabase
    .from("subscription_payments")
    .insert({
      organization_id:  profile.organization_id,
      initiated_by:     user.id,
      amount_cop:       amountCOP,
      status:           "pending",
      wompi_reference:  reference,
      plan_to_activate: "pro",
      months:           1,
    })

  if (insertError) {
    return { error: `Error creando el pago: ${insertError.message}` }
  }

  // Build the signed checkout URL
  const { url } = buildCheckoutUrl(
    {
      reference,
      amountInCents: amountCOP * 100,
      currency:      "COP",
      redirectUrl,
      customerEmail: user.email,
    },
    { publicKey: wompi.publicKey, integritySecret: wompi.integritySecret },
  )

  return { success: true, url, reference }
}
