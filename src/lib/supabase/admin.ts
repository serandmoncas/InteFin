import { createClient } from "@supabase/supabase-js"
import type { Database } from "./types"

/**
 * Admin client with service_role key — ONLY use in server actions / route handlers.
 * Never import this in client components or NEXT_PUBLIC_ contexts.
 */
export function createAdminClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY

  if (!url || !key) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY")
  }

  return createClient<Database>(url, key, {
    auth: { autoRefreshToken: false, persistSession: false },
  })
}
