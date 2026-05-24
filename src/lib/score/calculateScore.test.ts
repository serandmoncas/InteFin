import { describe, it, expect } from "vitest"
import { calculateScore } from "./calculateScore"
import type { FinancialAccount } from "@/lib/supabase/types"

type AccountInput = Pick<
  FinancialAccount,
  "account_type" | "current_amount" | "target_amount" | "is_active"
>

function acc(
  account_type: AccountInput["account_type"],
  current: number,
  target: number,
  is_active = true,
): AccountInput {
  return { account_type, current_amount: current, target_amount: target, is_active }
}

describe("calculateScore", () => {
  it("returns 0 when nothing exists", () => {
    expect(
      calculateScore({ accounts: [], totalAssets: 0, totalDebts: 0 })
    ).toBe(0)
  })

  it("returns 100 when everything is fully funded + retiro active + no debts", () => {
    const result = calculateScore({
      accounts: [
        acc("imprevisto",  5_000_000, 5_000_000),
        acc("oxigeno",    30_000_000, 30_000_000),
        acc("retiro",              0,           0, true),
        acc("inversiones", 1_000_000, 1_000_000),
      ],
      totalAssets: 36_000_000,
      totalDebts:  0,
    })
    expect(result).toBe(100)
  })

  it("respects per-account weights (imprevisto = 25 pts, oxígeno = 30 pts, retiro = 20 pts, inversiones = 15 pts, deuda = 10 pts)", () => {
    // Only imprevisto at 100% → 25 pts. Debt ratio bonus = 10 (no debts).
    const onlyImprevisto = calculateScore({
      accounts: [
        acc("imprevisto", 5_000_000, 5_000_000),
        acc("oxigeno",            0, 30_000_000),
        acc("retiro",             0,           0, false),
        acc("inversiones",        0,  1_000_000),
      ],
      totalAssets: 5_000_000,
      totalDebts:  0,
    })
    expect(onlyImprevisto).toBe(35) // 25 + 10

    // Only oxígeno at 100% → 30 pts + 10 debt ratio
    const onlyOxigeno = calculateScore({
      accounts: [
        acc("imprevisto",         0, 5_000_000),
        acc("oxigeno",   30_000_000, 30_000_000),
        acc("retiro",             0,           0, false),
        acc("inversiones",        0,  1_000_000),
      ],
      totalAssets: 30_000_000,
      totalDebts:  0,
    })
    expect(onlyOxigeno).toBe(40) // 30 + 10

    // Only retiro active + no assets at all → 20 pts (no debt ratio bonus
    // because totalAssets=0 → debt ratio is 0 by definition).
    const onlyRetiro = calculateScore({
      accounts: [
        acc("imprevisto", 0, 5_000_000),
        acc("oxigeno",    0, 30_000_000),
        acc("retiro",     0, 0, true),
        acc("inversiones",0, 1_000_000),
      ],
      totalAssets: 0,
      totalDebts:  0,
    })
    expect(onlyRetiro).toBe(20) // 20 only — debt ratio = 0 when assets = 0

    // Only inversiones at 100% → 15 pts + 10 debt ratio
    const onlyInv = calculateScore({
      accounts: [
        acc("imprevisto", 0, 5_000_000),
        acc("oxigeno",    0, 30_000_000),
        acc("retiro",     0, 0, false),
        acc("inversiones",1_000_000, 1_000_000),
      ],
      totalAssets: 1_000_000,
      totalDebts:  0,
    })
    expect(onlyInv).toBe(25) // 15 + 10
  })

  it("clamps account progress to 100% (can't exceed target)", () => {
    const result = calculateScore({
      accounts: [
        acc("imprevisto", 50_000_000, 5_000_000), // 1000% — clamped to 100%
        acc("oxigeno",            0, 30_000_000),
        acc("retiro",             0,           0, false),
        acc("inversiones",        0,  1_000_000),
      ],
      totalAssets: 50_000_000,
      totalDebts:  0,
    })
    // Should be 25 (imprevisto clamped) + 10 (no debts) = 35
    expect(result).toBe(35)
  })

  it("treats target_amount=0 as 0 progress (avoid divide-by-zero)", () => {
    const result = calculateScore({
      accounts: [
        acc("imprevisto", 5_000_000, 0),
        acc("oxigeno",            0, 0),
        acc("retiro",             0, 0, false),
        acc("inversiones", 1_000_000, 0),
      ],
      totalAssets: 6_000_000,
      totalDebts:  0,
    })
    // No targets set → only debt ratio counts = 10
    expect(result).toBe(10)
  })

  it("penalizes high debt ratio", () => {
    const baseAccounts = [
      acc("imprevisto", 5_000_000, 5_000_000),
      acc("oxigeno",            0, 30_000_000),
      acc("retiro",             0,           0, false),
      acc("inversiones",        0,  1_000_000),
    ]

    const noDebt = calculateScore({
      accounts: baseAccounts,
      totalAssets: 5_000_000,
      totalDebts:  0,
    })
    const fullyIndebted = calculateScore({
      accounts: baseAccounts,
      totalAssets: 5_000_000,
      totalDebts:  5_000_000,
    })

    expect(noDebt).toBe(35)         // 25 (imprevisto) + 10 (no debt)
    expect(fullyIndebted).toBe(25)  // 25 (imprevisto) + 0 (full debt)
  })

  it("gives 0 to debt ratio when assets are 0", () => {
    const result = calculateScore({
      accounts: [
        acc("imprevisto", 0, 5_000_000),
        acc("oxigeno",    0, 30_000_000),
        acc("retiro",     0, 0, false),
        acc("inversiones",0, 1_000_000),
      ],
      totalAssets: 0,
      totalDebts:  10_000_000,
    })
    expect(result).toBe(0)
  })

  it("returns a whole number (rounded)", () => {
    const result = calculateScore({
      accounts: [
        acc("imprevisto", 1_234_567, 5_000_000),  // ~24.7%
        acc("oxigeno",            0, 30_000_000),
        acc("retiro",             0,           0, false),
        acc("inversiones",        0,  1_000_000),
      ],
      totalAssets: 1_234_567,
      totalDebts:  0,
    })
    expect(Number.isInteger(result)).toBe(true)
  })
})
