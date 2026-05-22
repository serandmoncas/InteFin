"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export async function updateBalance(accountId: string, newAmount: number) {
  if (newAmount < 0) return { error: "El saldo no puede ser negativo." }

  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  // Fetch account to verify ownership + get org
  const { data: account } = await supabase
    .from("financial_accounts")
    .select("id, organization_id, target_amount")
    .eq("id", accountId)
    .single()

  if (!account) return { error: "Cuenta no encontrada." }

  // Update current_amount
  const { error: updateError } = await supabase
    .from("financial_accounts")
    .update({ current_amount: newAmount })
    .eq("id", accountId)

  if (updateError) return { error: "Error actualizando el saldo." }

  // Upsert monthly snapshot (day 1 of current month)
  const now        = new Date()
  const month      = new Date(now.getFullYear(), now.getMonth(), 1)
    .toISOString()
    .split("T")[0]

  const progressPct = account.target_amount > 0
    ? Math.min(100, (newAmount / account.target_amount) * 100)
    : 0

  await supabase
    .from("account_snapshots")
    .upsert(
      {
        account_id:      accountId,
        organization_id: account.organization_id,
        amount:          newAmount,
        progress_pct:    progressPct,
        snapshot_month:  month,
        created_by:      user.id,
      },
      { onConflict: "account_id,snapshot_month" }
    )

  revalidatePath("/app/dashboard")
  return { success: true }
}
