import type { FinancialAccount } from "@/lib/supabase/types"

interface ScoreInput {
  accounts: Pick<FinancialAccount, "account_type" | "current_amount" | "target_amount" | "is_active">[]
  totalAssets: number
  totalDebts: number
}

/**
 * Calculates the financial health score (0–100).
 * Pure function — no side effects.
 *
 * Weights:
 *   imprevisto   25 pts  (progress toward 1× income)
 *   oxigeno      30 pts  (progress toward 6× income)
 *   retiro       20 pts  (binary: is_active?)
 *   inversiones  15 pts  (progress toward target)
 *   debt ratio   10 pts  (1 - debts/assets, clamped 0-1)
 */
export function calculateScore(input: ScoreInput): number {
  const { accounts, totalAssets, totalDebts } = input

  function progress(type: FinancialAccount["account_type"]): number {
    const acc = accounts.find((a) => a.account_type === type)
    if (!acc) return 0
    if (acc.target_amount <= 0) return 0
    return Math.min(1, acc.current_amount / acc.target_amount)
  }

  function isActive(type: FinancialAccount["account_type"]): number {
    const acc = accounts.find((a) => a.account_type === type)
    return acc?.is_active ? 1 : 0
  }

  const debtRatio = totalAssets > 0
    ? Math.max(0, 1 - totalDebts / totalAssets)
    : 0

  const raw =
    progress("imprevisto")  * 0.25 +
    progress("oxigeno")     * 0.30 +
    isActive("retiro")      * 0.20 +
    progress("inversiones") * 0.15 +
    debtRatio               * 0.10

  return Math.round(raw * 100)
}
