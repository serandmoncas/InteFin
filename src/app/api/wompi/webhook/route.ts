import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { verifyEventSignature, type WompiEvent } from "@/lib/wompi/webhook"
import { extendExpiration } from "@/lib/plan/expiration"

/**
 * Wompi posts transaction events here. We:
 *  1. Verify the signature (HMAC of properties + timestamp + secret)
 *  2. Look up our payment record by the wompi_reference
 *  3. Update its status idempotently
 *  4. If APPROVED, extend organizations.plan_expires_at by N months
 *     and set plan='pro'
 *
 * Always return 200 OK to acknowledge — even on errors — so Wompi
 * doesn't retry indefinitely. Internal issues are logged server-side.
 */

export async function POST(request: NextRequest) {
  let event: WompiEvent
  try {
    event = (await request.json()) as WompiEvent
  } catch (err) {
    console.error("[wompi webhook] invalid JSON body", err)
    return NextResponse.json({ ok: false, error: "invalid_json" }, { status: 400 })
  }

  const eventsSecret = process.env.WOMPI_EVENTS_SECRET
  if (!eventsSecret) {
    console.error("[wompi webhook] WOMPI_EVENTS_SECRET not configured")
    // Acknowledge so Wompi doesn't retry, but flag clearly
    return NextResponse.json({ ok: false, error: "not_configured" })
  }

  if (!verifyEventSignature(event, eventsSecret)) {
    console.warn("[wompi webhook] invalid signature for event", { reference: event?.data?.transaction?.reference })
    return NextResponse.json({ ok: false, error: "invalid_signature" }, { status: 401 })
  }

  // Only care about transaction.updated for now
  if (event.event !== "transaction.updated") {
    return NextResponse.json({ ok: true, ignored: true })
  }

  const tx = event.data.transaction
  const admin = createAdminClient()

  // Find our payment record by wompi_reference (unique)
  const { data: payment, error: lookupError } = await admin
    .from("subscription_payments")
    .select("id, organization_id, status, months, plan_to_activate, amount_cop")
    .eq("wompi_reference", tx.reference)
    .maybeSingle()

  if (lookupError) {
    console.error("[wompi webhook] db lookup error", lookupError)
    return NextResponse.json({ ok: false, error: "db_lookup" })
  }

  if (!payment) {
    console.warn("[wompi webhook] no matching payment for reference", tx.reference)
    return NextResponse.json({ ok: true, ignored: "no_match" })
  }

  // Idempotency: if already in a terminal state matching the event, noop
  const newStatus = tx.status.toLowerCase() // approved | declined | voided | error | pending
  if (payment.status === newStatus) {
    return NextResponse.json({ ok: true, idempotent: true })
  }

  // Update the payment record
  const { error: updateError } = await admin
    .from("subscription_payments")
    .update({
      status:               newStatus,
      wompi_transaction_id: tx.id,
      wompi_payment_method: tx.payment_method_type ?? null,
    })
    .eq("id", payment.id)

  if (updateError) {
    console.error("[wompi webhook] failed updating payment", updateError)
    return NextResponse.json({ ok: false, error: "db_update" })
  }

  // If approved, activate the plan
  if (newStatus === "approved" && payment.plan_to_activate === "pro") {
    const { data: org } = await admin
      .from("organizations")
      .select("plan_expires_at")
      .eq("id", payment.organization_id)
      .single()

    const newExpiration = extendExpiration(
      org?.plan_expires_at ?? null,
      payment.months,
    )

    const { error: planError } = await admin
      .from("organizations")
      .update({
        plan:            "pro",
        plan_expires_at: newExpiration.toISOString(),
      })
      .eq("id", payment.organization_id)

    if (planError) {
      console.error("[wompi webhook] failed activating plan", planError)
      return NextResponse.json({ ok: false, error: "plan_activation" })
    }

    console.log("[wompi webhook] activated pro for org", payment.organization_id, "until", newExpiration.toISOString())
  }

  return NextResponse.json({ ok: true })
}

// Wompi's health checks: respond OK on GET to confirm endpoint exists
export async function GET() {
  return NextResponse.json({ ok: true, endpoint: "wompi-webhook" })
}
