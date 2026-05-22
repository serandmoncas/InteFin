import type { AccountType } from "@/lib/supabase/types"

export interface AccountTargets {
  imprevisto: number   // 1× monthly income
  oxigeno: number      // 6× monthly income
  retiro: number       // 0 — boolean (is_active)
  inversiones: number  // 0 — defined by coach later
}

/**
 * Calculates the target amount for each of the 4 accounts
 * based on the client's monthly income.
 * Pure function — no side effects.
 */
export function calculateTargets(monthlyIncome: number): AccountTargets {
  const income = Math.max(0, monthlyIncome)
  return {
    imprevisto:  income * 1,
    oxigeno:     income * 6,
    retiro:      0,
    inversiones: 0,
  }
}

export function targetForAccount(type: AccountType, monthlyIncome: number): number {
  return calculateTargets(monthlyIncome)[type]
}
