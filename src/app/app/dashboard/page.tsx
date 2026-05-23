import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { calculateScore } from "@/lib/score/calculateScore"
import { ScoreBadge } from "@/components/dashboard/ScoreBadge"
import { AccountCard } from "@/components/dashboard/AccountCard"
import { EvolutionChart } from "@/components/dashboard/EvolutionChart"
import type { AccountType } from "@/lib/supabase/types"

const ACCOUNT_ORDER: AccountType[] = ["imprevisto", "oxigeno", "retiro", "inversiones"]

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n)
}

export default async function DashboardPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name, organization_id")
    .eq("id", user.id)
    .single()

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("id, monthly_income, monthly_expenses")
    .eq("user_id", user.id)
    .single()

  // Latest diagnostic for net worth
  const { data: diagnostic } = await supabase
    .from("financial_diagnostics")
    .select("total_assets, total_debts, net_worth, monthly_income, monthly_expenses")
    .eq("client_id", clientProfile?.id ?? "")
    .order("recorded_at", { ascending: false })
    .limit(1)
    .maybeSingle()

  const { data: accounts } = await supabase
    .from("financial_accounts")
    .select("*")
    .eq("client_id", clientProfile?.id ?? "")
    .order("created_at")

  if (!clientProfile || !accounts) redirect("/onboarding/client")

  const accountIds = accounts.map((a) => a.id)
  const { data: snapshots } = await supabase
    .from("account_snapshots")
    .select("*")
    .in("account_id", accountIds.length > 0 ? accountIds : [""])
    .order("snapshot_month", { ascending: true })

  const sortedAccounts = ACCOUNT_ORDER.map(
    (type) => accounts.find((a) => a.account_type === type)
  ).filter(Boolean) as typeof accounts

  const score = calculateScore({
    accounts,
    totalAssets: diagnostic?.total_assets ?? 0,
    totalDebts:  diagnostic?.total_debts ?? 0,
  })

  const netWorth     = diagnostic?.net_worth ?? 0
  const totalAssets  = diagnostic?.total_assets ?? 0
  const totalDebts   = diagnostic?.total_debts ?? 0
  const monthlyExp   = diagnostic?.monthly_expenses ?? clientProfile.monthly_expenses ?? 0
  const firstName    = profile?.full_name?.split(" ")[0] ?? "tú"

  // Inversiones is locked until imprevisto AND oxígeno are ≥ 50%
  const imprevistoAcc  = accounts.find((a) => a.account_type === "imprevisto")
  const oxigenoAcc     = accounts.find((a) => a.account_type === "oxigeno")
  const imprevistoOk   = imprevistoAcc && imprevistoAcc.target_amount > 0
    ? (imprevistoAcc.current_amount / imprevistoAcc.target_amount) >= 0.5
    : false
  const oxigenoOk      = oxigenoAcc && oxigenoAcc.target_amount > 0
    ? (oxigenoAcc.current_amount / oxigenoAcc.target_amount) >= 0.5
    : false
  const inversionesLocked = !imprevistoOk || !oxigenoOk

  return (
    <div>
      {/* Hero: Net worth */}
      <div
        className="rounded-2xl p-6 mb-6 border border-slate-800"
        style={{ background: "linear-gradient(160deg,#1a1f3c 0%,#0f172a 60%)" }}
      >
        <div className="flex items-start justify-between">
          <div>
            <p className="text-slate-400 text-xs uppercase tracking-widest mb-2">Patrimonio Neto</p>
            <p className={`text-4xl font-black tracking-tight ${netWorth >= 0 ? "text-slate-100" : "text-red-400"}`}>
              {formatCOP(netWorth)}
            </p>
            <p className="text-slate-500 text-sm mt-1">
              Hola, {firstName} 👋 — sigue construyendo
            </p>
          </div>
          <ScoreBadge score={score} />
        </div>

        {/* Mini stats */}
        <div className="grid grid-cols-3 gap-3 mt-6">
          {[
            { label: "Activos",     value: formatCOP(totalAssets),  color: "text-emerald-400" },
            { label: "Deudas",      value: formatCOP(totalDebts),   color: "text-red-400" },
            { label: "Gasto/mes",   value: formatCOP(monthlyExp),   color: "text-slate-300" },
          ].map(({ label, value, color }) => (
            <div key={label} className="bg-[#1e293b] rounded-xl px-3 py-3">
              <p className="text-slate-500 text-xs mb-1">{label}</p>
              <p className={`text-sm font-bold ${color}`}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 4 Accounts */}
      <div className="mb-2 flex items-center justify-between">
        <h2 className="text-slate-100 font-semibold">Las 4 Cuentas</h2>
        <p className="text-slate-500 text-xs">Toca "Actualizar" para registrar tu saldo</p>
      </div>

      <div className="flex flex-col gap-3 mb-6">
        {sortedAccounts.map((account) => (
          <AccountCard
            key={account.id}
            account={account}
            locked={account.account_type === "inversiones" && inversionesLocked}
          />
        ))}
      </div>

      {/* Evolution chart */}
      <div className="mb-6">
        <EvolutionChart
          accounts={accounts.map((a) => ({ id: a.id, account_type: a.account_type }))}
          snapshots={snapshots ?? []}
        />
      </div>

      {/* Locked message */}
      {inversionesLocked && (
        <div className="bg-[#0f172a] border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-500 text-center">
          🔒 <strong className="text-slate-400">Inversiones</strong> se activa cuando Imprevisto y Oxígeno superen el 50%
        </div>
      )}
    </div>
  )
}
