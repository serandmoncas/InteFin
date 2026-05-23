"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateCoachNotes(clientId: string, notes: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single()

  if (profile?.role !== "coach" && profile?.role !== "super_admin") {
    return { error: "Solo coaches pueden editar las notas." }
  }

  const { error } = await supabase
    .from("client_profiles")
    .update({ coach_notes: notes })
    .eq("id", clientId)

  if (error) return { error: `Error guardando: ${error.message}` }

  revalidatePath(`/coach/clients/${clientId}`)
  return { success: true }
}
