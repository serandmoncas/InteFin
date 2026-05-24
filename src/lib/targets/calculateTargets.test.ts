import { describe, it, expect } from "vitest"
import { calculateTargets, targetForAccount } from "./calculateTargets"

describe("calculateTargets", () => {
  it("computes 1× income for imprevisto, 6× for oxígeno", () => {
    const targets = calculateTargets(5_000_000)
    expect(targets.imprevisto).toBe(5_000_000)
    expect(targets.oxigeno).toBe(30_000_000)
  })

  it("retiro and inversiones default to 0 (not income-derived)", () => {
    const targets = calculateTargets(5_000_000)
    expect(targets.retiro).toBe(0)
    expect(targets.inversiones).toBe(0)
  })

  it("treats negative income as 0", () => {
    const targets = calculateTargets(-1_000)
    expect(targets.imprevisto).toBe(0)
    expect(targets.oxigeno).toBe(0)
  })

  it("works with zero income", () => {
    const targets = calculateTargets(0)
    expect(targets).toEqual({
      imprevisto:  0,
      oxigeno:     0,
      retiro:      0,
      inversiones: 0,
    })
  })

  it("scales linearly", () => {
    const small = calculateTargets(1_000_000)
    const big   = calculateTargets(10_000_000)
    expect(big.imprevisto).toBe(small.imprevisto * 10)
    expect(big.oxigeno).toBe(small.oxigeno * 10)
  })
})

describe("targetForAccount", () => {
  it("returns the same value as calculateTargets[type]", () => {
    const income = 4_500_000
    const all = calculateTargets(income)
    expect(targetForAccount("imprevisto", income)).toBe(all.imprevisto)
    expect(targetForAccount("oxigeno",    income)).toBe(all.oxigeno)
    expect(targetForAccount("retiro",     income)).toBe(all.retiro)
    expect(targetForAccount("inversiones",income)).toBe(all.inversiones)
  })
})
