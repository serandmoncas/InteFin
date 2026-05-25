import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SessionsTable } from "@/components/coach/SessionsTable"

export default async function CoachSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "coach") redirect("/auth/login")

  // Fetch all sessions for this org
  const { data: sessions } = await supabase
    .from("coaching_sessions")
    .select("id, session_number, session_date, summary, status, client_id")
    .eq("organization_id", profile.organization_id!)
    .order("session_date", { ascending: false })

  // Fetch client names via client_profiles → profiles join
  const clientIds = [...new Set((sessions ?? []).map((s) => s.client_id))]
  const { data: clientRows } = clientIds.length > 0
    ? await supabase
        .from("client_profiles")
        .select("id, profiles(full_name)")
        .in("id", clientIds)
    : { data: [] }

  const nameById = new Map(
    (clientRows ?? []).map((c) => [
      c.id,
      (c.profiles as unknown as { full_name: string | null } | null)?.full_name ?? "—",
    ])
  )

  const rows = (sessions ?? []).map((s) => ({
    id:            s.id,
    clientId:      s.client_id,
    clientName:    nameById.get(s.client_id) ?? "—",
    sessionNumber: s.session_number,
    sessionDate:   s.session_date ?? "",
    summary:       s.summary ?? "",
    status:        s.status,
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Sesiones</h1>
        <p className="text-slate-400 text-sm mt-1">
          Historial de todas las sesiones de coaching
        </p>
      </div>
      <SessionsTable rows={rows} />
    </div>
  )
}
