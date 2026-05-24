"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"
import { PLANS, hasClientCapacity, PLAN_LABELS } from "@/lib/plan/limits"

export interface InviteResult {
  success?: boolean
  email?: string
  inviteLink?: string  // shareable URL for the coach to send via WhatsApp/etc
  error?: string
  planLimitReached?: boolean
}

export async function inviteClient(formData: FormData): Promise<InviteResult> {
  const email    = (formData.get("email") as string).trim().toLowerCase()
  const fullName = (formData.get("full_name") as string).trim()

  if (!email || !fullName) {
    return { error: "Email y nombre son requeridos." }
  }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) return { error: "Perfil de coach incompleto." }

  const orgId   = profile.organization_id
  const coachId = user.id

  // ── Plan limit enforcement ────────────────────────────────
  const { data: org } = await supabase
    .from("organizations")
    .select("plan, plan_expires_at")
    .eq("id", orgId)
    .single()

  const { count: activeClientsCount } = await supabase
    .from("client_profiles")
    .select("id", { count: "exact", head: true })
    .eq("organization_id", orgId)
    .in("status", ["lead", "active"])

  // Use effective plan (Pro reverts to Free if expired)
  const { effectivePlan } = await import("@/lib/plan/expiration")
  const currentPlan = effectivePlan(org?.plan ?? "free", org?.plan_expires_at ?? null)
  const current     = activeClientsCount ?? 0
  const limit       = PLANS[currentPlan].maxActiveClients

  if (!hasClientCapacity(currentPlan, current)) {
    return {
      error: `Alcanzaste el límite de ${limit} clientes del plan ${PLAN_LABELS[currentPlan]}. Actualiza a Pro para invitar clientes ilimitados.`,
      planLimitReached: true,
    }
  }

  // Save / refresh invitation record
  const { error: inviteRecordError } = await supabase
    .from("client_invitations")
    .upsert(
      { email, full_name: fullName, organization_id: orgId, coach_id: coachId, used: false },
      { onConflict: "email,organization_id" }
    )

  if (inviteRecordError) {
    return { error: "Error guardando la invitación." }
  }

  const admin = createAdminClient()
  const siteUrl  = process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"
  const redirectTo = `${siteUrl}/auth/callback?next=/onboarding/client`

  const metadata = {
    full_name:       fullName,
    organization_id: orgId,
    coach_id:        coachId,
    role:            "client",
  }

  // Try to create the user first (idempotent — ignore "already registered")
  const { error: createError } = await admin.auth.admin.createUser({
    email,
    email_confirm: true,        // skip the confirmation email
    user_metadata: metadata,
  })

  if (createError && !createError.message.toLowerCase().includes("already")) {
    return { error: `No se pudo crear la cuenta: ${createError.message}` }
  }

  // Generate a magic link (does NOT send email — we control distribution)
  const { data: linkData, error: linkError } = await admin.auth.admin.generateLink({
    type:    "magiclink",
    email,
    options: { redirectTo },
  })

  if (linkError || !linkData?.properties?.action_link) {
    return { error: `No se pudo generar el link: ${linkError?.message ?? "error desconocido"}` }
  }

  return {
    success:    true,
    email,
    inviteLink: linkData.properties.action_link,
  }
}
