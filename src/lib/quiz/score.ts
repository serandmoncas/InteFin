import { QUESTIONS, type AccountCategory } from "./questions"

export interface QuizAnswer {
  questionId: string
  value: string
  points: number
}

export interface CategoryBreakdown {
  category: AccountCategory
  earned:   number
  max:      number
  pct:      number
}

export interface QuizResult {
  total:  number      // 0-100
  byCategory: CategoryBreakdown[]
  verdict: "critical" | "needs_work" | "decent" | "strong"
}

/**
 * Compute the quiz result from a set of answers.
 * Pure function — no side effects.
 */
export function computeQuizResult(answers: QuizAnswer[]): QuizResult {
  // Sum total points
  const totalEarned = answers.reduce((sum, a) => sum + a.points, 0)
  const totalMax    = QUESTIONS.reduce(
    (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
    0
  )
  const total = totalMax > 0 ? Math.round((totalEarned / totalMax) * 100) : 0

  // Per-category breakdown
  const categories: AccountCategory[] = ["imprevisto", "oxigeno", "retiro", "inversiones", "control", "general"]
  const byCategory: CategoryBreakdown[] = categories.map((category) => {
    const catQuestions = QUESTIONS.filter((q) => q.category === category)
    const max = catQuestions.reduce(
      (sum, q) => sum + Math.max(...q.options.map((o) => o.points)),
      0
    )
    const earned = answers
      .filter((a) => catQuestions.some((q) => q.id === a.questionId))
      .reduce((sum, a) => sum + a.points, 0)
    const pct = max > 0 ? Math.round((earned / max) * 100) : 0
    return { category, earned, max, pct }
  }).filter((c) => c.max > 0)

  const verdict: QuizResult["verdict"] =
    total >= 80 ? "strong" :
    total >= 60 ? "decent" :
    total >= 35 ? "needs_work" :
    "critical"

  return { total, byCategory, verdict }
}

export const VERDICT_COPY: Record<QuizResult["verdict"], { title: string; tone: string }> = {
  critical:   { title: "Tu salud financiera necesita atención urgente",  tone: "#f87171" },
  needs_work: { title: "Estás empezando — hay mucho por construir",       tone: "#fb923c" },
  decent:     { title: "Buen punto de partida, sigues construyendo",     tone: "#fbbf24" },
  strong:     { title: "Excelente — tienes una base sólida",              tone: "#34d399" },
}

export const CATEGORY_LABELS: Record<AccountCategory, string> = {
  imprevisto:  "Fondo de emergencia",
  oxigeno:     "Reserva de oxígeno",
  retiro:      "Protección y retiro",
  inversiones: "Inversiones",
  control:     "Control financiero",
  general:     "Salud general",
}
