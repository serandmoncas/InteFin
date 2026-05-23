"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export interface InviteResult {
  success?: boolean
  email?: string
  inviteLink?: string  // shareable URL for the coach to send via WhatsApp/etc
  error?: string
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
