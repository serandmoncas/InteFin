"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function markLeadContacted(leadId: string) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const { error } = await supabase
    .from("public_test_results")
    .update({ contacted: true })
    .eq("id", leadId)

  if (error) return { error: error.message }

  revalidatePath("/coach/leads")
  return { success: true }
}
