import { NextResponse, type NextRequest } from "next/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { sendProRenewalReminderEmail } from "@/lib/email"

/**
 * Daily cron: send renewal reminder emails to coaches whose Pro plan
 * expires in exactly 7 days (±12h window).
 *
 * Vercel invokes this with: Authorization: Bearer {CRON_SECRET}
 * Schedule defined in vercel.json.
 */
export async function GET(request: NextRequest) {
  // ── Auth ──────────────────────────────────────────────────────────────────
  const cronSecret = process.env.CRON_SECRET
  if (!cronSecret) {
    console.error("[cron/pro-renewal] CRON_SECRET not configured")
    return NextResponse.json({ ok: false, error: "not_configured" }, { status: 500 })
  }

  const authHeader = request.headers.get("authorization")
  if (authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ ok: false, error: "unauthorized" }, { status: 401 })
  }

  // ── Find orgs expiring in ~7 days ─────────────────────────────────────────
  const now        = new Date()
  const windowFrom = new Date(now.getTime() + 6.5 * 24 * 60 * 60 * 1000)  // +6.5d
  const windowTo   = new Date(now.getTime() + 7.5 * 24 * 60 * 60 * 1000)  // +7.5d

  const admin = createAdminClient()

  const { data: orgs, error: orgsError } = await admin
    .from("organizations")
    .select("id, name, plan_expires_at")
    .eq("plan", "pro")
    .gte("plan_expires_at", windowFrom.toISOString())
    .lte("plan_expires_at", windowTo.toISOString())

  if (orgsError) {
    console.error("[cron/pro-renewal] db error", orgsError)
    return NextResponse.json({ ok: false, error: "db_error" }, { status: 500 })
  }

  if (!orgs || orgs.length === 0) {
    console.log("[cron/pro-renewal] no orgs expiring in 7 days")
    return NextResponse.json({ ok: true, sent: 0 })
  }

  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://intelifin.online"
  let sent = 0

  for (const org of orgs) {
    // Get the coach profile for this org
    const { data: coachProfile } = await admin
      .from("profiles")
      .select("id, full_name")
      .eq("organization_id", org.id)
      .eq("role", "coach")
      .maybeSingle()

    if (!coachProfile) {
      console.warn("[cron/pro-renewal] no coach found for org", org.id)
      continue
    }

    // Get coach email from auth
    const { data: authData } = await admin.auth.admin.getUserById(coachProfile.id)
    const coachEmail = authData?.user?.email
    if (!coachEmail) {
      console.warn("[cron/pro-renewal] no email for coach", coachProfile.id)
      continue
    }

    await sendProRenewalReminderEmail({
      coachEmail,
      coachName:     coachProfile.full_name ?? "Coach",
      planExpiresAt: org.plan_expires_at!,
      siteUrl,
    })

    console.log("[cron/pro-renewal] reminder sent to", coachEmail, "for org", org.id)
    sent++
  }

  return NextResponse.json({ ok: true, sent })
}
