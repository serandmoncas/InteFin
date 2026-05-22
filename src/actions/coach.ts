"use server"

import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

export async function inviteClient(formData: FormData) {
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

  // Upsert invitation record (idempotent — safe to re-invite)
  const { error: inviteRecordError } = await supabase
    .from("client_invitations")
    .upsert(
      { email, full_name: fullName, organization_id: orgId, coach_id: coachId, used: false },
      { onConflict: "email,organization_id" }
    )

  if (inviteRecordError) {
    return { error: "Error guardando la invitación. Intenta de nuevo." }
  }

  // Send invite email via Supabase admin (requires service_role key)
  const admin = createAdminClient()
  const redirectTo = `${process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000"}/auth/callback?next=/onboarding/client`

  const { error: inviteError } = await admin.auth.admin.inviteUserByEmail(email, {
    redirectTo,
    data: {
      full_name:       fullName,
      organization_id: orgId,
      coach_id:        coachId,
      role:            "client",
    },
  })

  if (inviteError) {
    // User might already exist — still OK, invitation record saved
    if (!inviteError.message.includes("already been registered")) {
      return { error: `Error enviando invitación: ${inviteError.message}` }
    }
  }

  return { success: true, email }
}
