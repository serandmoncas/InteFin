"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface OrgSettingsInput {
  tagline:       string
  bio:           string
  contact_email: string
  whatsapp:      string
  brand_color:   string
}

export async function updateOrgSettings(input: OrgSettingsInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, organization_id")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "coach" && profile?.role !== "super_admin") {
    return { error: "Solo coaches pueden editar la organización." }
  }

  if (!profile.organization_id) return { error: "Organización no encontrada." }

  const { error } = await supabase
    .from("organizations")
    .update({
      tagline:       input.tagline.trim()       || null,
      bio:           input.bio.trim()           || null,
      contact_email: input.contact_email.trim() || null,
      whatsapp:      input.whatsapp.trim()      || null,
      brand_color:   input.brand_color || "#6366f1",
    })
    .eq("id", profile.organization_id)

  if (error) return { error: `Error guardando: ${error.message}` }

  revalidatePath("/coach/settings")
  return { success: true }
}
