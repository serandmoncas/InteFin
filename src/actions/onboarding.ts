"use server"

import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

function slugify(text: string): string {
  return text
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "") // remove accents
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
}

export async function completeCoachOnboarding(formData: FormData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const fullName = formData.get("full_name") as string
  const orgName = formData.get("org_name") as string
  const baseSlug = slugify(orgName || fullName)

  // Ensure slug uniqueness by appending random suffix if needed
  let slug = baseSlug
  const { data: existing } = await supabase
    .from("organizations")
    .select("id")
    .eq("slug", slug)
    .maybeSingle()

  if (existing) {
    slug = `${baseSlug}-${Math.random().toString(36).slice(2, 6)}`
  }

  // Create organization
  const { data: org, error: orgError } = await supabase
    .from("organizations")
    .insert({ name: orgName || fullName, slug })
    .select("id")
    .single()

  if (orgError || !org) {
    return { error: "No se pudo crear la organización. Intenta de nuevo." }
  }

  // Update profile: set name, role=coach, org, onboarding_completed
  const { error: profileError } = await supabase
    .from("profiles")
    .update({
      full_name: fullName,
      role: "coach",
      organization_id: org.id,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  if (profileError) {
    return { error: "No se pudo guardar tu perfil. Intenta de nuevo." }
  }

  redirect("/coach/overview")
}
