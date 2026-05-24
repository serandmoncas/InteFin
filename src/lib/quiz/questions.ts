export type AccountCategory = "imprevisto" | "oxigeno" | "retiro" | "inversiones" | "control" | "general"

export interface QuizOption {
  label: string
  value: string
  points: number
}

export interface QuizQuestion {
  id: string
  category: AccountCategory
  title: string
  subtitle?: string
  options: QuizOption[]
}

/**
 * 10-question financial health quiz. Pure data — no side effects.
 * Each question maps to a financial category and has weighted point options.
 */
export const QUESTIONS: QuizQuestion[] = [
  {
    id: "emergency_fund",
    category: "imprevisto",
    title: "¿Tienes un fondo de emergencia separado?",
    subtitle: "Dinero apartado solo para imprevistos (no es tu cuenta de ahorros general).",
    options: [
      { label: "Sí, equivalente a 1+ mes de mis gastos",  value: "yes",         points: 10 },
      { label: "En proceso, pero no suficiente",          value: "in_progress", points: 5  },
      { label: "No tengo",                                value: "no",          points: 0  },
    ],
  },
  {
    id: "months_sustain",
    category: "oxigeno",
    title: "Si pierdes tu ingreso hoy, ¿cuántos meses podrías sostener tu vida sin cambiar nada?",
    options: [
      { label: "6 meses o más",   value: "6plus",  points: 10 },
      { label: "Entre 3 y 6 meses", value: "3to6", points: 7  },
      { label: "1 o 2 meses",     value: "1to2",   points: 3  },
      { label: "Menos de 1 mes",  value: "0",      points: 0  },
    ],
  },
  {
    id: "health_pension",
    category: "retiro",
    title: "¿Cotizas salud y pensión actualmente?",
    options: [
      { label: "Sí, ambas",     value: "both",  points: 10 },
      { label: "Solo una",      value: "one",   points: 5  },
      { label: "Ninguna",       value: "none",  points: 0  },
    ],
  },
  {
    id: "life_insurance",
    category: "retiro",
    title: "¿Tienes un seguro de vida activo?",
    subtitle: "Una póliza que cubra a tu familia si te pasa algo.",
    options: [
      { label: "Sí",  value: "yes", points: 10 },
      { label: "No",  value: "no",  points: 0  },
    ],
  },
  {
    id: "investments",
    category: "inversiones",
    title: "¿Tienes inversiones activas además de tus ahorros?",
    options: [
      { label: "Sí, varias",         value: "yes",   points: 10 },
      { label: "Algo pequeño",       value: "small", points: 5  },
      { label: "No tengo",           value: "no",    points: 0  },
    ],
  },
  {
    id: "debts",
    category: "control",
    title: "¿Tienes deudas en bancos o tarjetas?",
    options: [
      { label: "No tengo deudas",        value: "none",        points: 10 },
      { label: "Sí, son manejables",     value: "manageable",  points: 5  },
      { label: "Sí, me sobrepasan",      value: "overwhelming",points: 0  },
    ],
  },
  {
    id: "monthly_tracking",
    category: "control",
    title: "¿Llevas un registro mensual de tus gastos?",
    options: [
      { label: "Siempre",   value: "always",    points: 10 },
      { label: "A veces",   value: "sometimes", points: 5  },
      { label: "Nunca",     value: "never",     points: 0  },
    ],
  },
  {
    id: "income_expense_awareness",
    category: "control",
    title: "¿Sabes exactamente cuánto gastas vs cuánto ganas al mes?",
    options: [
      { label: "Sí, lo sé al detalle", value: "exact",  points: 10 },
      { label: "Tengo una idea",       value: "approx", points: 5  },
      { label: "No tengo claridad",    value: "no",     points: 0  },
    ],
  },
  {
    id: "saved_last_year",
    category: "general",
    title: "¿Lograste ahorrar algo el último año?",
    options: [
      { label: "Sí, ahorré bastante", value: "lots",   points: 10 },
      { label: "Algo pequeño",        value: "little", points: 5  },
      { label: "Nada",                value: "none",   points: 0  },
    ],
  },
  {
    id: "peace_of_mind",
    category: "general",
    title: "¿Qué tan tranquilo te sientes con tu situación financiera?",
    subtitle: "Califica del 1 (muy ansioso) al 10 (totalmente tranquilo).",
    options: [
      { label: "1 — Muy ansioso",  value: "1", points: 0  },
      { label: "2",                value: "2", points: 2  },
      { label: "3",                value: "3", points: 3  },
      { label: "4",                value: "4", points: 4  },
      { label: "5 — Neutral",      value: "5", points: 5  },
      { label: "6",                value: "6", points: 6  },
      { label: "7",                value: "7", points: 7  },
      { label: "8",                value: "8", points: 8  },
      { label: "9",                value: "9", points: 9  },
      { label: "10 — Tranquilo",   value: "10", points: 10 },
    ],
  },
]
