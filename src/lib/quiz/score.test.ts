import { describe, it, expect } from "vitest"
import { computeQuizResult, type QuizAnswer } from "./score"
import { QUESTIONS } from "./questions"

function maxAnswerFor(questionId: string): QuizAnswer {
  const q = QUESTIONS.find((x) => x.id === questionId)!
  const max = Math.max(...q.options.map((o) => o.points))
  const opt = q.options.find((o) => o.points === max)!
  return { questionId, value: opt.value, points: opt.points }
}

function minAnswerFor(questionId: string): QuizAnswer {
  const q = QUESTIONS.find((x) => x.id === questionId)!
  const min = Math.min(...q.options.map((o) => o.points))
  const opt = q.options.find((o) => o.points === min)!
  return { questionId, value: opt.value, points: opt.points }
}

const allMax = () => QUESTIONS.map((q) => maxAnswerFor(q.id))
const allMin = () => QUESTIONS.map((q) => minAnswerFor(q.id))

describe("QUESTIONS data integrity", () => {
  it("has exactly 10 questions", () => {
    expect(QUESTIONS).toHaveLength(10)
  })

  it("every question has at least 2 options", () => {
    for (const q of QUESTIONS) {
      expect(q.options.length).toBeGreaterThanOrEqual(2)
    }
  })

  it("every question has unique ID", () => {
    const ids = QUESTIONS.map((q) => q.id)
    expect(new Set(ids).size).toBe(ids.length)
  })

  it("every option has non-negative points", () => {
    for (const q of QUESTIONS) {
      for (const opt of q.options) {
        expect(opt.points).toBeGreaterThanOrEqual(0)
      }
    }
  })

  it("every question has at least one max-points option (10) — keeps weighting balanced", () => {
    for (const q of QUESTIONS) {
      const max = Math.max(...q.options.map((o) => o.points))
      expect(max).toBe(10)
    }
  })
})

describe("computeQuizResult", () => {
  it("returns 100 when every answer is max", () => {
    const result = computeQuizResult(allMax())
    expect(result.total).toBe(100)
    expect(result.verdict).toBe("strong")
  })

  it("returns 0 when every answer is min", () => {
    const result = computeQuizResult(allMin())
    expect(result.total).toBe(0)
    expect(result.verdict).toBe("critical")
  })

  it("returns 0 with empty answers", () => {
    const result = computeQuizResult([])
    expect(result.total).toBe(0)
  })

  it("verdict thresholds match spec (>=80 strong, >=60 decent, >=35 needs_work, else critical)", () => {
    expect(computeQuizResult([{ questionId: "x", value: "x", points: 80 }]).verdict).toBe("strong")
    expect(computeQuizResult([{ questionId: "x", value: "x", points: 60 }]).verdict).toBe("decent")
    expect(computeQuizResult([{ questionId: "x", value: "x", points: 35 }]).verdict).toBe("needs_work")
    expect(computeQuizResult([{ questionId: "x", value: "x", points: 10 }]).verdict).toBe("critical")
  })

  it("breakdown rolls up per-category points correctly", () => {
    const result = computeQuizResult(allMax())
    // All categories should be at 100%
    for (const cat of result.byCategory) {
      expect(cat.pct).toBe(100)
      expect(cat.earned).toBe(cat.max)
    }
  })

  it("categories with no questions are filtered out", () => {
    const result = computeQuizResult(allMax())
    for (const cat of result.byCategory) {
      expect(cat.max).toBeGreaterThan(0)
    }
  })

  it("partial answers produce proportional category breakdown", () => {
    // Answer ONLY the imprevisto question with max
    const answer = maxAnswerFor("emergency_fund")
    const result = computeQuizResult([answer])

    const imprevisto = result.byCategory.find((c) => c.category === "imprevisto")
    expect(imprevisto?.pct).toBe(100)

    const oxigeno = result.byCategory.find((c) => c.category === "oxigeno")
    expect(oxigeno?.pct).toBe(0)
  })

  it("returns whole-number total (rounded)", () => {
    // pick answers that produce a non-integer raw score before rounding
    const result = computeQuizResult([
      { questionId: "emergency_fund", value: "in_progress", points: 5 },
    ])
    expect(Number.isInteger(result.total)).toBe(true)
  })
})
