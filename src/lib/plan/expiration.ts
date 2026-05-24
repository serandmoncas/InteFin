import type { OrgPlan } from "@/lib/supabase/types"

/**
 * Pro plans require a non-null plan_expires_at in the future.
 * If expired, the org effectively reverts to Free.
 *
 * Pure function — no side effects. Pass `now` for testability.
 */
export function effectivePlan(
  dbPlan: OrgPlan,
  planExpiresAt: string | null,
  now: Date = new Date(),
): OrgPlan {
  if (dbPlan === "free")       return "free"
  if (dbPlan === "enterprise") return "enterprise"   // never expires (managed manually)
  // Pro: must have a non-past expiration
  if (!planExpiresAt)                       return "free"
  if (new Date(planExpiresAt) <= now)       return "free"
  return "pro"
}

/**
 * Extends the current expiration by N months. If currently expired or null,
 * starts from `now`. If currently active, extends from existing expiration
 * so the user doesn't lose unused days when paying early.
 */
export function extendExpiration(
  currentExpiration: string | null,
  monthsToAdd: number,
  now: Date = new Date(),
): Date {
  const start = currentExpiration && new Date(currentExpiration) > now
    ? new Date(currentExpiration)
    : now

  // Use UTC arithmetic so the result is timezone-stable
  const result = new Date(start)
  result.setUTCMonth(result.getUTCMonth() + monthsToAdd)
  return result
}
