"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface CreateSessionInput {
  clientId: string
  sessionDate: string   // ISO date (YYYY-MM-DD)
  summary: string       // shared with client
  notes: string         // private to coach
  deliverables: string[] // list of action items for the client
}

export async function createSession(input: CreateSessionInput) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const { data: coach } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (!coach || coach.role !== "coach") return { error: "Solo coaches pueden registrar sesiones." }

  // Determine the next session_number for this client
  const { data: lastSession } = await supabase
    .from("coaching_sessions")
    .select("session_number")
    .eq("client_id", input.clientId)
    .order("session_number", { ascending: false })
    .limit(1)
    .maybeSingle()

  const nextNumber = (lastSession?.session_number ?? 0) + 1

  const { error } = await supabase
    .from("coaching_sessions")
    .insert({
      client_id:       input.clientId,
      organization_id: coach.organization_id!,
      coach_id:        user.id,
      session_number:  nextNumber,
      session_date:    new Date(input.sessionDate).toISOString(),
      summary:         input.summary.trim() || null,
      notes:           input.notes.trim() || null,
      deliverables:    input.deliverables.filter((d) => d.trim()),
      status:          "completed",
    })

  if (error) {
    return { error: `Error guardando sesión: ${error.message}` }
  }

  revalidatePath(`/coach/clients/${input.clientId}`)
  return { success: true }
}
