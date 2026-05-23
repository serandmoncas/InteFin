import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"

function formatDate(iso: string | null): string {
  if (!iso) return "Sin fecha"
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export default async function ClientSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!clientProfile) redirect("/onboarding/client")

  // IMPORTANT: select only fields visible to the client — NEVER `notes`
  const { data: sessions } = await supabase
    .from("coaching_sessions")
    .select("id, session_number, session_date, summary, deliverables, status")
    .eq("client_id", clientProfile.id)
    .order("session_number", { ascending: false })

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Sesiones</h1>
        <p className="text-slate-400 text-sm mt-1">
          {sessions?.length ?? 0} sesiones con tu coach
        </p>
      </div>

      {!sessions || sessions.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">📋</p>
          <p className="text-slate-300 font-medium mb-1">Aún no tienes sesiones</p>
          <p className="text-slate-500 text-sm">
            Cuando tu coach registre una sesión, aparecerá aquí.
          </p>
        </div>
      ) : (
        <ul className="space-y-3">
          {sessions.map((s) => {
            const deliverables = Array.isArray(s.deliverables) ? s.deliverables as string[] : []
            return (
              <li
                key={s.id}
                className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden"
              >
                {/* Header */}
                <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-sm font-bold">
                      {s.session_number}
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm font-semibold">
                        Sesión #{s.session_number}
                      </p>
                      <p className="text-slate-500 text-xs">{formatDate(s.session_date)}</p>
                    </div>
                  </div>
                  {s.status === "scheduled" && (
                    <span className="text-xs px-2 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-medium">
                      Programada
                    </span>
                  )}
                </div>

                {/* Body */}
                <div className="px-5 py-4 space-y-3">
                  {s.summary ? (
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-1.5">
                        Resumen
                      </p>
                      <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">
                        {s.summary}
                      </p>
                    </div>
                  ) : (
                    <p className="text-slate-500 text-sm italic">
                      Tu coach aún no ha agregado el resumen de esta sesión.
                    </p>
                  )}

                  {deliverables.length > 0 && (
                    <div>
                      <p className="text-slate-500 text-xs font-semibold uppercase tracking-wider mb-2">
                        Tus tareas
                      </p>
                      <ul className="space-y-1.5">
                        {deliverables.map((d, i) => (
                          <li
                            key={i}
                            className="flex items-start gap-2.5 text-slate-200 text-sm bg-slate-800/50 rounded-lg px-3 py-2"
                          >
                            <span className="text-indigo-400 mt-0.5 shrink-0">○</span>
                            <span className="leading-relaxed">{d}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
