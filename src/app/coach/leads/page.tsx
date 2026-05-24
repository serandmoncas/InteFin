import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { MarkContactedButton } from "@/components/coach/MarkContactedButton"

function formatDate(iso: string): string {
  const d = new Date(iso)
  const diffH = (Date.now() - d.getTime()) / 3_600_000
  if (diffH < 1) return "hace minutos"
  if (diffH < 24) return `hace ${Math.floor(diffH)}h`
  if (diffH < 48) return "ayer"
  return d.toLocaleDateString("es-CO", { day: "numeric", month: "short" })
}

function scoreColor(score: number): string {
  if (score >= 70) return "text-emerald-400 bg-emerald-500/10 border-emerald-500/30"
  if (score >= 40) return "text-amber-400 bg-amber-500/10 border-amber-500/30"
  return "text-red-400 bg-red-500/10 border-red-500/30"
}

export default async function CoachLeadsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id")
    .eq("id", user.id)
    .single()

  const { data: leads } = await supabase
    .from("public_test_results")
    .select("id, score, visitor_name, visitor_email, visitor_whatsapp, contacted, created_at")
    .eq("organization_id", profile!.organization_id!)
    .order("created_at", { ascending: false })

  const pending = leads?.filter((l) => !l.contacted) ?? []
  const done    = leads?.filter((l) =>  l.contacted) ?? []

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Leads del test</h1>
        <p className="text-slate-400 text-sm mt-1">
          {pending.length} pendientes · {done.length} contactados
        </p>
      </div>

      {!leads || leads.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-12 text-center">
          <p className="text-4xl mb-3">🎯</p>
          <p className="text-slate-300 font-medium mb-1">Aún no tienes leads</p>
          <p className="text-slate-500 text-sm">
            Comparte tu link del test para que la gente lo haga y lleguen aquí.
          </p>
        </div>
      ) : (
        <>
          {/* Pending */}
          {pending.length > 0 && (
            <section className="mb-8">
              <h2 className="text-slate-300 text-xs font-bold uppercase tracking-widest mb-3">
                Pendientes ({pending.length})
              </h2>
              <ul className="space-y-2">
                {pending.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} />
                ))}
              </ul>
            </section>
          )}

          {/* Contacted */}
          {done.length > 0 && (
            <section>
              <h2 className="text-slate-500 text-xs font-bold uppercase tracking-widest mb-3">
                Contactados ({done.length})
              </h2>
              <ul className="space-y-2">
                {done.map((lead) => (
                  <LeadCard key={lead.id} lead={lead} compact />
                ))}
              </ul>
            </section>
          )}
        </>
      )}
    </div>
  )

  // Inline subcomponent — has access to scoreColor + formatDate
  function LeadCard({
    lead,
    compact = false,
  }: {
    lead: NonNullable<typeof leads>[number]
    compact?: boolean
  }) {
    return (
      <li className={`bg-[#0f172a] border border-slate-800 rounded-xl p-4 ${compact ? "opacity-60" : ""}`}>
        <div className="flex items-start justify-between gap-4">
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 mb-1">
              <span className={`text-xs font-bold px-2 py-0.5 rounded-full border ${scoreColor(lead.score)}`}>
                {lead.score}/100
              </span>
              <span className="text-slate-200 text-sm font-semibold truncate">
                {lead.visitor_name || "Anónimo"}
              </span>
              <span className="text-slate-600 text-xs">·</span>
              <span className="text-slate-500 text-xs">{formatDate(lead.created_at)}</span>
            </div>

            <div className="flex flex-wrap items-center gap-x-3 gap-y-1 text-xs">
              {lead.visitor_email && (
                <a
                  href={`mailto:${lead.visitor_email}`}
                  className="text-slate-400 hover:text-slate-200 transition-colors flex items-center gap-1"
                >
                  ✉️ {lead.visitor_email}
                </a>
              )}
              {lead.visitor_whatsapp && (
                <a
                  href={`https://wa.me/${lead.visitor_whatsapp.replace(/\D/g, "")}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-emerald-400 hover:text-emerald-300 transition-colors flex items-center gap-1"
                >
                  💬 {lead.visitor_whatsapp}
                </a>
              )}
              {!lead.visitor_email && !lead.visitor_whatsapp && (
                <span className="text-slate-600 italic">Sin datos de contacto</span>
              )}
            </div>
          </div>

          {!compact && <MarkContactedButton leadId={lead.id} />}
        </div>
      </li>
    )
  }
}
