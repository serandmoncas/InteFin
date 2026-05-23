"use client"

import { useState, useTransition } from "react"
import { updateAccountTarget, toggleRetiroActive } from "@/actions/accounts"
import type { FinancialAccount, AccountType } from "@/lib/supabase/types"

const ACCOUNT_ORDER: AccountType[] = ["imprevisto", "oxigeno", "retiro", "inversiones"]
const META: Record<AccountType, { label: string; color: string; emoji: string }> = {
  imprevisto:  { label: "Imprevisto",  color: "#f87171", emoji: "🛡" },
  oxigeno:     { label: "Oxígeno",     color: "#fb923c", emoji: "💨" },
  retiro:      { label: "Retiro",      color: "#a78bfa", emoji: "🏦" },
  inversiones: { label: "Inversiones", color: "#34d399", emoji: "📈" },
}

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n)
}

interface Props {
  accounts: FinancialAccount[]
}

export function AccountTargetsEditor({ accounts }: Props) {
  const sorted = ACCOUNT_ORDER.map(
    (t) => accounts.find((a) => a.account_type === t)
  ).filter(Boolean) as FinancialAccount[]

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5 mb-5">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-slate-100 font-semibold text-sm">Las 4 Cuentas</h2>
        <span className="text-slate-500 text-xs">Toca el target para ajustarlo</span>
      </div>
      <div className="flex flex-col gap-3">
        {sorted.map((account) => (
          <AccountRow key={account.id} account={account} />
        ))}
      </div>
    </div>
  )
}

function AccountRow({ account }: { account: FinancialAccount }) {
  const meta     = META[account.account_type]
  const isRetiro = account.account_type === "retiro"
  const progress = !isRetiro && account.target_amount > 0
    ? Math.min(100, (account.current_amount / account.target_amount) * 100)
    : 0

  const [editing, setEditing] = useState(false)
  const [value, setValue]     = useState(String(account.target_amount))
  const [error, setError]     = useState("")
  const [isPending, startTransition] = useTransition()

  function saveTarget() {
    const target = parseFloat(value.replace(/[^0-9.]/g, ""))
    if (isNaN(target) || target < 0) { setError("Target inválido"); return }
    setError("")
    startTransition(async () => {
      const res = await updateAccountTarget(account.id, target)
      if (res.error) { setError(res.error); return }
      setEditing(false)
    })
  }

  function toggleActive() {
    startTransition(async () => {
      await toggleRetiroActive(account.id, !account.is_active)
    })
  }

  return (
    <div className="flex items-start gap-4">
      {/* Label */}
      <div className="w-28 shrink-0 pt-1">
        <span className="text-xs font-semibold" style={{ color: meta.color }}>
          {meta.emoji} {meta.label}
        </span>
      </div>

      {/* Body */}
      <div className="flex-1">
        {isRetiro ? (
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleActive}
              disabled={isPending}
              className="text-xs px-3 py-1 rounded-full border font-medium transition-colors disabled:opacity-50"
              style={account.is_active
                ? { color: meta.color, borderColor: meta.color, background: `${meta.color}18` }
                : { color: "#64748b", borderColor: "#334155" }
              }
            >
              {isPending ? "..." : account.is_active ? "✓ Activo" : "Activar"}
            </button>
            <span className="text-slate-500 text-xs">
              {account.is_active ? "Seguro de vida vigente" : "Sin seguro registrado"}
            </span>
          </div>
        ) : (
          <>
            <div className="flex justify-between items-center text-xs mb-1">
              <span className="text-slate-300">{formatCOP(account.current_amount)}</span>
              {editing ? (
                <div className="flex items-center gap-2">
                  <div className="relative">
                    <span className="absolute left-2 top-1/2 -translate-y-1/2 text-slate-400 text-xs">$</span>
                    <input
                      autoFocus
                      type="number"
                      min={0}
                      value={value}
                      onChange={(e) => setValue(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === "Enter") saveTarget()
                        if (e.key === "Escape") { setEditing(false); setValue(String(account.target_amount)) }
                      }}
                      className="bg-slate-900 border border-indigo-500 rounded-md pl-5 pr-2 py-1 text-slate-100 text-xs w-32 focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={saveTarget}
                    disabled={isPending}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs px-2 py-1 rounded-md disabled:opacity-50"
                  >
                    {isPending ? "..." : "✓"}
                  </button>
                  <button
                    onClick={() => { setEditing(false); setValue(String(account.target_amount)) }}
                    className="text-slate-500 hover:text-slate-300 text-xs px-1"
                  >
                    ✕
                  </button>
                </div>
              ) : (
                <button
                  type="button"
                  onClick={() => setEditing(true)}
                  className="text-slate-500 hover:text-slate-300 text-xs hover:bg-slate-800 px-2 py-0.5 rounded transition-colors"
                  title="Click para editar target"
                >
                  {formatCOP(account.target_amount)} ✎
                </button>
              )}
            </div>

            {error && <p className="text-red-400 text-xs mb-1">{error}</p>}

            <div className="bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{ width: `${progress}%`, background: meta.color }}
              />
            </div>
            <p className="text-right text-xs mt-0.5" style={{ color: meta.color }}>
              {progress.toFixed(0)}%
            </p>
          </>
        )}
      </div>
    </div>
  )
}
