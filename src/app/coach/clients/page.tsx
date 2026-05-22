import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

const STATUS_LABEL: Record<string, string> = {
  lead: "Lead", active: "Activo", paused: "Pausado", completed: "Completado",
}
const STATUS_COLOR: Record<string, string> = {
  active:    "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
  lead:      "bg-amber-500/20 text-amber-400 border-amber-500/30",
  paused:    "bg-slate-500/20 text-slate-400 border-slate-500/30",
  completed: "bg-indigo-500/20 text-indigo-400 border-indigo-500/30",
}

export default async function CoachClientsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user!.id)
    .single()

  const { data: clients } = await supabase
    .from("client_profiles")
    .select(`
      id, status, occupation, created_at, monthly_income,
      profiles(full_name)
    `)
    .eq("organization_id", profile!.organization_id!)
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-slate-100">Clientes</h1>
          <p className="text-slate-400 text-sm mt-1">
            {clients?.length ?? 0} clientes en tu organización
          </p>
        </div>
        <Link
          href="/coach/invite"
          className="bg-indigo-600 hover:bg-indigo-500 transition-colors text-white text-sm font-medium px-4 py-2 rounded-lg"
        >
          + Invitar cliente
        </Link>
      </div>

      {!clients || clients.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-16 text-center">
          <p className="text-4xl mb-4">👥</p>
          <p className="text-slate-300 font-medium mb-1">No tienes clientes aún</p>
          <p className="text-slate-500 text-sm mb-6">
            Invita a tu primera persona y lleva su diagnóstico financiero aquí.
          </p>
          <Link
            href="/coach/invite"
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium px-5 py-2.5 rounded-lg transition-colors"
          >
            Invitar primer cliente
          </Link>
        </div>
      ) : (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
          {/* Table header */}
          <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 px-5 py-3 border-b border-slate-800 text-xs text-slate-500 uppercase tracking-wider">
            <span>Cliente</span>
            <span>Ocupación</span>
            <span>Estado</span>
            <span></span>
          </div>

          <ul className="divide-y divide-slate-800">
            {clients.map((c) => {
              const name = (c.profiles as unknown as { full_name: string | null } | null)?.full_name ?? "Sin nombre"
              return (
                <li key={c.id}>
                  <div className="grid grid-cols-[1fr_auto_auto_auto] gap-4 items-center px-5 py-4">
                    {/* Name + avatar */}
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-full bg-indigo-600 flex items-center justify-center text-white text-sm font-bold shrink-0">
                        {name[0]?.toUpperCase()}
                      </div>
                      <div>
                        <p className="text-slate-200 text-sm font-medium">{name}</p>
                        <p className="text-slate-500 text-xs">
                          Desde {new Date(c.created_at).toLocaleDateString("es-CO", { month: "short", year: "numeric" })}
                        </p>
                      </div>
                    </div>

                    {/* Occupation */}
                    <span className="text-slate-400 text-sm">{c.occupation ?? "—"}</span>

                    {/* Status badge */}
                    <span className={`text-xs px-2.5 py-1 rounded-full font-medium border ${STATUS_COLOR[c.status]}`}>
                      {STATUS_LABEL[c.status]}
                    </span>

                    {/* Action */}
                    <Link
                      href={`/coach/clients/${c.id}`}
                      className="text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
                    >
                      Ver →
                    </Link>
                  </div>
                </li>
              )
            })}
          </ul>
        </div>
      )}
    </div>
  )
}
