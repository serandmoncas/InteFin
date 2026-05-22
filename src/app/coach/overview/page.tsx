import { createClient } from "@/lib/supabase/server"
import Link from "next/link"

export default async function CoachOverviewPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, full_name")
    .eq("id", user!.id)
    .single()

  const { data: clients } = await supabase
    .from("client_profiles")
    .select("id, status, user_id, profiles(full_name)")
    .eq("organization_id", profile!.organization_id!)

  const total     = clients?.length ?? 0
  const active    = clients?.filter((c) => c.status === "active").length ?? 0
  const leads     = clients?.filter((c) => c.status === "lead").length ?? 0

  return (
    <div>
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">
          Hola, {profile?.full_name?.split(" ")[0]} 👋
        </h1>
        <p className="text-slate-400 text-sm mt-1">
          Resumen de tu práctica de coaching
        </p>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 mb-8">
        {[
          { label: "Clientes totales",  value: total,  color: "text-slate-100" },
          { label: "Clientes activos",  value: active, color: "text-indigo-400" },
          { label: "Leads pendientes",  value: leads,  color: "text-amber-400"  },
        ].map(({ label, value, color }) => (
          <div key={label} className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
            <p className="text-slate-400 text-xs uppercase tracking-wider mb-2">{label}</p>
            <p className={`text-3xl font-bold ${color}`}>{value}</p>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="grid grid-cols-2 gap-4 mb-8">
        <Link
          href="/coach/invite"
          className="bg-indigo-600 hover:bg-indigo-500 transition-colors rounded-xl p-5 flex items-center gap-4 group"
        >
          <span className="text-2xl">✉️</span>
          <div>
            <p className="text-white font-semibold text-sm">Invitar cliente</p>
            <p className="text-indigo-200 text-xs">Envía un link de diagnóstico</p>
          </div>
        </Link>
        <Link
          href="/coach/clients"
          className="bg-[#0f172a] border border-slate-800 hover:border-slate-700 transition-colors rounded-xl p-5 flex items-center gap-4"
        >
          <span className="text-2xl">👥</span>
          <div>
            <p className="text-slate-200 font-semibold text-sm">Ver clientes</p>
            <p className="text-slate-400 text-xs">{total} en total</p>
          </div>
        </Link>
      </div>

      {/* Recent clients */}
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl">
        <div className="p-5 border-b border-slate-800 flex items-center justify-between">
          <h2 className="text-slate-100 font-semibold text-sm">Clientes recientes</h2>
          <Link href="/coach/clients" className="text-indigo-400 text-xs hover:text-indigo-300">
            Ver todos →
          </Link>
        </div>

        {total === 0 ? (
          <div className="p-10 text-center">
            <p className="text-3xl mb-3">🌱</p>
            <p className="text-slate-400 text-sm">Aún no tienes clientes.</p>
            <Link
              href="/coach/invite"
              className="inline-block mt-4 text-indigo-400 hover:text-indigo-300 text-sm transition-colors"
            >
              Invita a tu primer cliente →
            </Link>
          </div>
        ) : (
          <ul className="divide-y divide-slate-800">
            {clients!.slice(0, 5).map((c) => {
              const name = (c.profiles as unknown as { full_name: string | null } | null)?.full_name ?? "Cliente"
              const statusColor: Record<string, string> = {
                active: "bg-emerald-500/20 text-emerald-400",
                lead:   "bg-amber-500/20 text-amber-400",
                paused: "bg-slate-500/20 text-slate-400",
                completed: "bg-indigo-500/20 text-indigo-400",
              }
              return (
                <li key={c.id}>
                  <Link
                    href={`/coach/clients/${c.id}`}
                    className="flex items-center justify-between px-5 py-3.5 hover:bg-slate-800/50 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">
                        {name[0]?.toUpperCase()}
                      </div>
                      <span className="text-slate-200 text-sm">{name}</span>
                    </div>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${statusColor[c.status] ?? ""}`}>
                      {c.status}
                    </span>
                  </Link>
                </li>
              )
            })}
          </ul>
        )}
      </div>
    </div>
  )
}
