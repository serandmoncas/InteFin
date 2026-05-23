import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { calculateScore } from "@/lib/score/calculateScore"
import { ScoreBadge } from "@/components/dashboard/ScoreBadge"
import { SessionsPanel } from "@/components/coach/SessionsPanel"
import { AccountTargetsEditor } from "@/components/coach/AccountTargetsEditor"
import { CoachNotes } from "@/components/coach/CoachNotes"
import type { AccountType } from "@/lib/supabase/types"

const ACCOUNT_ORDER: AccountType[] = ["imprevisto", "oxigeno", "retiro", "inversiones"]
const ACCOUNT_META: Record<AccountType, { label: string; color: string; emoji: string }> = {
  imprevisto:  { label: "Imprevisto",  color: "#f87171", emoji: "🛡" },
  oxigeno:     { label: "Oxígeno",     color: "#fb923c", emoji: "💨" },
  retiro:      { label: "Retiro",      color: "#a78bfa", emoji: "🏦" },
  inversiones: { label: "Inversiones", color: "#34d399", emoji: "📈" },
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n)
}

function InfoRow({ label, value }: { label: string; value: string | number | boolean | null }) {
  const display =
    value === null || value === undefined ? "—"
    : typeof value === "boolean" ? (value ? "✓ Sí" : "✗ No")
    : String(value)
  return (
    <div className="flex justify-between py-2 border-b border-slate-800 last:border-0">
      <span className="text-slate-500 text-sm">{label}</span>
      <span className="text-slate-200 text-sm font-medium">{display}</span>
    </div>
  )
}

export default async function ClientDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createClient()

  // Verify coach owns this client
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select(`
      id, occupation, birth_year, dependents_count, has_partner,
      monthly_income, monthly_expenses, status, created_at, coach_notes,
      profiles(full_name)
    `)
    .eq("id", id)
    .single()

  if (!clientProfile) notFound()

  const clientName = (clientProfile.profiles as unknown as { full_name: string | null } | null)
    ?.full_name ?? "Cliente"

  const { data: diagnostic } = await supabase
    .from("financial_diagnostics")
    .select("*")
    .eq("client_id", id)
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: accounts } = await supabase
    .from("financial_accounts")
    .select("*")
    .eq("client_id", id)
    .order("created_at")

  const { data: sessions } = await supabase
    .from("coaching_sessions")
    .select("*")
    .eq("client_id", id)
    .order("session_number", { ascending: false })

  const sortedAccounts = accounts
    ? ACCOUNT_ORDER.map((t) => accounts.find((a) => a.account_type === t)).filter(Boolean) as typeof accounts
    : []

  const score = accounts
    ? calculateScore({
        accounts,
        totalAssets: diagnostic?.total_assets ?? 0,
        totalDebts:  diagnostic?.total_debts  ?? 0,
      })
    : 0

  const STATUS_COLOR: Record<string, string> = {
    active:    "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
    lead:      "text-amber-400 bg-amber-500/10 border-amber-500/30",
    paused:    "text-slate-400 bg-slate-500/10 border-slate-500/30",
    completed: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  }
  const STATUS_LABEL: Record<string, string> = {
    active: "Activo", lead: "Lead", paused: "Pausado", completed: "Completado",
  }

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-start justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xl font-bold">
            {clientName[0]?.toUpperCase()}
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-100">{clientName}</h1>
            <div className="flex items-center gap-2 mt-1">
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${STATUS_COLOR[clientProfile.status]}`}>
                {STATUS_LABEL[clientProfile.status]}
              </span>
              <span className="text-slate-500 text-xs">
                Desde {new Date(clientProfile.created_at).toLocaleDateString("es-CO", { month: "long", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
        <ScoreBadge score={score} />
      </div>

      <CoachNotes clientId={id} initialNotes={clientProfile.coach_notes ?? null} />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
        {/* Personal info */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
          <h2 className="text-slate-100 font-semibold text-sm mb-3">Perfil personal</h2>
          <InfoRow label="Ocupación"     value={clientProfile.occupation} />
          <InfoRow label="Año nacimiento" value={clientProfile.birth_year} />
          <InfoRow label="Dependientes"  value={clientProfile.dependents_count} />
          <InfoRow label="Pareja"        value={clientProfile.has_partner} />
          <InfoRow label="Ingreso/mes"   value={clientProfile.monthly_income ? formatCOP(clientProfile.monthly_income) : null} />
          <InfoRow label="Gastos/mes"    value={clientProfile.monthly_expenses ? formatCOP(clientProfile.monthly_expenses) : null} />
        </div>

        {/* Diagnostic summary */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
          <h2 className="text-slate-100 font-semibold text-sm mb-3">Diagnóstico</h2>
          {diagnostic ? (
            <>
              <InfoRow label="Activos totales" value={formatCOP(diagnostic.total_assets)} />
              <InfoRow label="Deudas totales"  value={formatCOP(diagnostic.total_debts)} />
              <InfoRow label="Patrimonio neto" value={formatCOP(diagnostic.net_worth ?? 0)} />
              <InfoRow label="Salud"           value={diagnostic.has_health_insurance} />
              <InfoRow label="Pensión"         value={diagnostic.has_pension} />
              <InfoRow label="Seguro de vida"  value={diagnostic.has_life_insurance} />
              {diagnostic.primary_goal && (
                <div className="mt-3 bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-slate-400 text-xs mb-0.5">Meta principal</p>
                  <p className="text-slate-200 text-sm">{diagnostic.primary_goal}</p>
                </div>
              )}
              {diagnostic.biggest_fear && (
                <div className="mt-2 bg-slate-800 rounded-lg px-3 py-2">
                  <p className="text-slate-400 text-xs mb-0.5">Mayor angustia</p>
                  <p className="text-slate-200 text-sm">{diagnostic.biggest_fear}</p>
                </div>
              )}
            </>
          ) : (
            <p className="text-slate-500 text-sm">El cliente aún no completó el diagnóstico.</p>
          )}
        </div>
      </div>

      {/* 4 Accounts — editable by coach */}
      {sortedAccounts.length === 0 ? (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 mb-5">
          <h2 className="text-slate-100 font-semibold text-sm mb-2">Las 4 Cuentas</h2>
          <p className="text-slate-500 text-sm">Las cuentas se crean cuando el cliente completa el diagnóstico.</p>
        </div>
      ) : (
        <AccountTargetsEditor accounts={sortedAccounts} />
      )}

      {/* Sessions */}
      <SessionsPanel clientId={id} sessions={sessions ?? []} />
    </div>
  )
}
