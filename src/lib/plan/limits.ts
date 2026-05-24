import type { OrgPlan } from "@/lib/supabase/types"

export interface PlanLimits {
  maxActiveClients: number     // Infinity = ilimitado
  monthlyPriceCOP:  number     // 0 = gratis
  features:         string[]
}

export const PLANS: Record<OrgPlan, PlanLimits> = {
  free: {
    maxActiveClients: 3,
    monthlyPriceCOP:  0,
    features: [
      "Hasta 3 clientes activos",
      "Diagnóstico financiero completo",
      "Dashboard con 4 cuentas",
      "Test gratuito público + leads",
      "Sesiones ilimitadas",
    ],
  },
  pro: {
    maxActiveClients: Number.POSITIVE_INFINITY,
    monthlyPriceCOP:  50_000,
    features: [
      "Clientes ilimitados",
      "Todo lo del plan Free",
      "Soporte prioritario",
      "Acceso anticipado a nuevas funciones",
    ],
  },
  enterprise: {
    maxActiveClients: Number.POSITIVE_INFINITY,
    monthlyPriceCOP:  0,        // custom — by agreement
    features: [
      "Todo lo del plan Pro",
      "Múltiples coaches por organización",
      "Branding completo (white-label)",
      "SLA + onboarding personalizado",
    ],
  },
}

export const PLAN_LABELS: Record<OrgPlan, string> = {
  free:       "Free",
  pro:        "Pro",
  enterprise: "Enterprise",
}

export function formatCOP(amount: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(amount)
}

/** Returns true if the org has room for one more active client. */
export function hasClientCapacity(plan: OrgPlan, currentActiveClients: number): boolean {
  return currentActiveClients < PLANS[plan].maxActiveClients
}
