"use server"

import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { calculateTargets } from "@/lib/targets/calculateTargets"

export interface DiagnosticData {
  // Section 1 — Profile
  full_name: string
  birth_year: number
  occupation: string
  living_situation: "solo" | "pareja" | "familia"
  dependents_count: number
  has_health_insurance: boolean
  has_pension: boolean

  // Section 2 — Current situation
  monthly_income: number
  monthly_expenses: number
  current_savings: number
  has_life_insurance: boolean

  // Section 3 — Assets & debts
  liquid_assets: number
  large_assets: number
  total_debts: number
  debt_types: string   // free text: "banco, familiar"

  // Section 4 — Goals
  primary_goal: string
  biggest_fear: string
  goal_horizon: string  // "6 meses" | "1 año" | "3 años" | "5+ años"
}

export async function saveClientDiagnostic(data: DiagnosticData) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  // Get client's profile + org + coach
  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  if (!profile?.organization_id) return { error: "Perfil incompleto." }

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("id, coach_id")
    .eq("user_id", user.id)
    .single()

  if (!clientProfile) return { error: "Perfil de cliente no encontrado." }

  const orgId     = profile.organization_id
  const clientId  = clientProfile.id
  const total_assets = data.liquid_assets + data.large_assets + data.current_savings

  // 1. Update client_profile with demographic data
  await supabase
    .from("client_profiles")
    .update({
      occupation:       data.occupation,
      birth_year:       data.birth_year,
      dependents_count: data.dependents_count,
      has_partner:      data.living_situation === "pareja",
      monthly_income:   data.monthly_income,
      monthly_expenses: data.monthly_expenses,
      status:           "active",
    })
    .eq("id", clientId)

  // 2. Insert immutable financial diagnostic
  const { error: diagError } = await supabase
    .from("financial_diagnostics")
    .insert({
      client_id:           clientId,
      organization_id:     orgId,
      total_assets,
      liquid_assets:       data.liquid_assets + data.current_savings,
      large_assets:        data.large_assets,
      total_debts:         data.total_debts,
      monthly_income:      data.monthly_income,
      monthly_expenses:    data.monthly_expenses,
      has_health_insurance: data.has_health_insurance,
      has_pension:         data.has_pension,
      has_life_insurance:  data.has_life_insurance,
      primary_goal:        data.primary_goal,
      biggest_fear:        data.biggest_fear,
      notes:               data.debt_types ? `Tipos de deuda: ${data.debt_types}` : null,
    })

  if (diagError) return { error: "Error guardando diagnóstico." }

  // 3. Create the 4 financial accounts
  const targets = calculateTargets(data.monthly_income)
  const accounts = [
    { account_type: "imprevisto"  as const, target_amount: targets.imprevisto,   is_active: true },
    { account_type: "oxigeno"     as const, target_amount: targets.oxigeno,      is_active: true },
    { account_type: "retiro"      as const, target_amount: 0,                    is_active: data.has_life_insurance },
    { account_type: "inversiones" as const, target_amount: 0,                    is_active: false },
  ]

  const { error: accError } = await supabase
    .from("financial_accounts")
    .upsert(
      accounts.map((a) => ({
        ...a,
        client_id:       clientId,
        organization_id: orgId,
        current_amount:  0,
      })),
      { onConflict: "client_id,account_type" }
    )

  if (accError) return { error: "Error creando cuentas financieras." }

  // 4. Mark onboarding as complete
  await supabase
    .from("profiles")
    .update({
      full_name:            data.full_name,
      onboarding_completed: true,
    })
    .eq("id", user.id)

  redirect("/app/dashboard")
}
