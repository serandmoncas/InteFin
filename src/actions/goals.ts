"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface CreateGoalInput {
  clientId:     string
  title:        string
  description:  string
  targetAmount: string   // string vacío → null
  targetDate:   string   // string vacío → null
}

export async function createGoal(
  input: CreateGoalInput,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const { data: coachProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (!coachProfile || coachProfile.role !== "coach") {
    return { error: "Solo coaches pueden crear metas." }
  }

  // Verify the client belongs to this coach's org
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("organization_id")
    .eq("id", input.clientId)
    .single()

  if (!clientProfile || clientProfile.organization_id !== coachProfile.organization_id) {
    return { error: "Cliente no encontrado en tu organización." }
  }

  const { error } = await supabase
    .from("goals")
    .insert({
      client_id:       input.clientId,
      organization_id: coachProfile.organization_id!,
      title:           input.title.trim(),
      description:     input.description.trim() || null,
      target_amount:   input.targetAmount ? Number(input.targetAmount) : null,
      target_date:     input.targetDate || null,
      status:          "pending",
    })

  if (error) return { error: `Error guardando meta: ${error.message}` }

  revalidatePath(`/coach/clients/${input.clientId}`)
  return {}
}

export async function updateGoalStatus(
  goalId: string,
  status: "in_progress" | "completed",
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  // Find the client_profile for this user
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!clientProfile) return { error: "Perfil de cliente no encontrado." }

  // Update only if this goal belongs to this client
  const { error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", goalId)
    .eq("client_id", clientProfile.id)

  if (error) return { error: `Error actualizando meta: ${error.message}` }

  revalidatePath("/app/goals")
  return {}
}
