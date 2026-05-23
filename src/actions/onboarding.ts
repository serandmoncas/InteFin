"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { createAdminClient } from "@/lib/supabase/admin"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // strip accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function completeCoachOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const fullName = (formData.get("full_name") as string)?.trim()
  const orgName  = (formData.get("org_name") as string)?.trim()
  if (!fullName || !orgName) {
    return { error: "Nombre y organización son requeridos." }
  }

  // Use the admin client to bypass RLS during the bootstrap
  // (the user has no organization_id yet, so RLS would block normal access)
  const admin = createAdminClient()

  // Find a unique slug
  const base = slugify(orgName) || slugify(fullName) || "coach"
  let slug = base
  const { data: existing } = await admin
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  if (existing) {
    slug = `${base}-${Math.random().toString(36).slice(2, 6)}`
  }

  // Create organization (admin client → no RLS check)
  const { data: org, error: orgError } = await admin
    .from("organizations")
    .insert({ name: orgName, slug })
    .select("id")
    .single()

  if (orgError || !org) {
    console.error("[onboarding] organization insert failed:", orgError)
    return { error: `No se pudo crear la organización: ${orgError?.message ?? "error desconocido"}` }
  }

  // Update profile: name, role=coach, org_id, onboarding_completed
  const { error: profileError } = await admin
    .from("profiles")
    .update({
      full_name: fullName,
      role: "coach",
      organization_id: org.id,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (profileError) {
    console.error("[onboarding] profile update failed:", profileError)
    return { error: `No se pudo guardar tu perfil: ${profileError.message}` }
  }

  redirect("/coach/overview")
}
