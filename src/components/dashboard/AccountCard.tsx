"use client"

import { useState, useTransition } from "react"
import { updateBalance } from "@/actions/accounts"
import type { FinancialAccount, AccountType } from "@/lib/supabase/types"

const ACCOUNT_META: Record<AccountType, { label: string; emoji: string; color: string; bg: string; desc: string }> = {
  imprevisto:  { label: "Imprevisto",  emoji: "🛡",  color: "#f87171", bg: "#450a0a", desc: "1 mes de salario" },
  oxigeno:     { label: "Oxígeno",     emoji: "💨",  color: "#fb923c", bg: "#431407", desc: "6 meses de sustento" },
  retiro:      { label: "Retiro",      emoji: "🏦",  color: "#a78bfa", bg: "#2e1065", desc: "protección y seguro" },
  inversiones: { label: "Inversiones", emoji: "📈",  color: "#34d399", bg: "#052e16", desc: "activas cuando tengas base" },
}

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n)
}

interface AccountCardProps {
  account: FinancialAccount
  locked?: boolean
}

export function AccountCard({ account, locked = false }: AccountCardProps) {
  const meta      = ACCOUNT_META[account.account_type]
  const progress  = account.target_amount > 0
    ? Math.min(100, (account.current_amount / account.target_amount) * 100)
    : account.is_active ? 100 : 0
  const isBoolean = account.account_type === "retiro"

  const [editing, setEditing]   = useState(false)
  const [value, setValue]       = useState(String(account.current_amount))
  const [error, setError]       = useState("")
  const [isPending, startTransition] = useTransition()

  function handleSave() {
    const amount = parseFloat(value.replace(/[^0-9.]/g, ""))
    if (isNaN(amount) || amount < 0) { setError("Saldo inválido"); return }
    setError("")
    startTransition(async () => {
      const res = await updateBalance(account.id, amount)
      if (res?.error) { setError(res.error); return }
      setEditing(false)
    })
  }

  return (
    <div
      className={`bg-[#1e293b] rounded-xl p-4 border-l-4 transition-opacity ${locked ? "opacity-50" : ""}`}
      style={{ borderLeftColor: meta.color }}
    >
      {/* Header */}
      <div className="flex items-start justify-between mb-3">
        <div className="flex items-center gap-2">
          <span
            className="text-xs font-bold uppercase tracking-wider px-2 py-1 rounded-md"
            style={{ background: meta.bg, color: meta.color }}
          >
            {meta.emoji} {meta.label}
          </span>
          <span className="text-slate-500 text-xs hidden sm:block">{meta.desc}</span>
        </div>

        {locked ? (
          <span className="text-xs text-slate-600 border border-slate-700 rounded-md px-2 py-0.5">
            🔒 Bloqueado
          </span>
        ) : !isBoolean && !editing ? (
          <button
            onClick={() => setEditing(true)}
            className="text-xs text-indigo-400 hover:text-indigo-300 transition-colors"
          >
            Actualizar
          </button>
        ) : null}
      </div>

      {/* Amount */}
      {isBoolean ? (
        <div className="flex items-center gap-2 mb-3">
          <span
            className="text-sm font-semibold px-2.5 py-1 rounded-full border"
            style={account.is_active
              ? { color: meta.color, borderColor: meta.color, background: meta.bg }
              : { color: "#64748b", borderColor: "#334155", background: "#1e293b" }
            }
          >
            {account.is_active ? "✓ Activo" : "✗ Sin seguro"}
          </span>
        </div>
      ) : editing ? (
        <div className="flex items-center gap-2 mb-3">
          <div className="relative flex-1">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
            <input
              autoFocus
              type="number"
              min={0}
              value={value}
              onChange={(e) => setValue(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") handleSave(); if (e.key === "Escape") setEditing(false) }}
              className="w-full bg-slate-900 border border-indigo-500 rounded-lg pl-7 pr-3 py-1.5 text-slate-100 text-sm focus:outline-none"
            />
          </div>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
          >
            {isPending ? "..." : "Guardar"}
          </button>
          <button
            onClick={() => { setEditing(false); setValue(String(account.current_amount)) }}
            className="text-slate-500 hover:text-slate-300 text-xs px-2 py-1.5"
          >
            ✕
          </button>
        </div>
      ) : (
        <div className="flex items-baseline gap-2 mb-3">
          <span className="text-slate-100 text-xl font-bold">
            {formatCOP(account.current_amount)}
          </span>
          {account.target_amount > 0 && (
            <span className="text-slate-500 text-xs">
              / {formatCOP(account.target_amount)}
            </span>
          )}
        </div>
      )}

      {error && <p className="text-red-400 text-xs mb-2">{error}</p>}

      {/* Progress bar */}
      {!isBoolean && (
        <>
          <div className="bg-[#0f172a] rounded-full h-1.5 mb-1.5 overflow-hidden">
            <div
              className="h-full rounded-full transition-all duration-500"
              style={{ width: `${progress}%`, background: meta.color }}
            />
          </div>
          <div className="flex justify-between">
            <span className="text-xs font-semibold" style={{ color: meta.color }}>
              {progress.toFixed(0)}%
            </span>
            {account.target_amount > 0 && (
              <span className="text-slate-600 text-xs">
                faltan {formatCOP(Math.max(0, account.target_amount - account.current_amount))}
              </span>
            )}
          </div>
        </>
      )}
    </div>
  )
}
