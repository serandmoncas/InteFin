"use client"

import { useState } from "react"
import { GoalForm } from "./GoalForm"
import type { Goal } from "@/lib/supabase/types"

interface GoalListProps {
  clientId: string
  goals:    Goal[]
}

const STATUS_LABEL: Record<string, string> = {
  pending:     "Pendiente",
  in_progress: "En curso",
  completed:   "Completada",
  cancelled:   "Cancelada",
}

const STATUS_CLASS: Record<string, string> = {
  pending:     "text-slate-400 bg-slate-500/10 border-slate-500/30",
  in_progress: "text-indigo-400 bg-indigo-500/10 border-indigo-500/30",
  completed:   "text-emerald-400 bg-emerald-500/10 border-emerald-500/30",
  cancelled:   "text-red-400 bg-red-500/10 border-red-500/30",
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric", month: "short", year: "numeric",
  })
}

function truncate(text: string, max = 60) {
  return text.length > max ? text.slice(0, max) + "…" : text
}

export function GoalList({ clientId, goals }: GoalListProps) {
  const [open, setOpen] = useState(false)

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl mt-5">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-slate-100 font-semibold text-sm">Metas</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {goals.length} {goals.length === 1 ? "meta definida" : "metas definidas"}
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          {open ? "Cancelar" : "+ Nueva meta"}
        </button>
      </div>

      {open && (
        <div className="p-5 border-b border-slate-800 bg-slate-900/40">
          <GoalForm clientId={clientId} onSaved={() => setOpen(false)} />
        </div>
      )}

      {goals.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-3xl mb-2">🎯</p>
          <p className="text-slate-400 text-sm">No hay metas definidas para este cliente</p>
          {!open && (
            <button
              onClick={() => setOpen(true)}
              className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
            >
              Crear la primera →
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-slate-800">
          {goals.map((g) => (
            <li key={g.id} className="px-5 py-4 flex items-start justify-between gap-4">
              <div className="flex-1 min-w-0">
                <p className="text-slate-200 text-sm font-medium">{g.title}</p>
                {g.description && (
                  <p className="text-slate-500 text-xs mt-0.5">{truncate(g.description)}</p>
                )}
                <div className="flex items-center gap-3 mt-1.5 text-xs text-slate-500">
                  {g.target_amount != null && (
                    <span>{formatCOP(g.target_amount)}</span>
                  )}
                  {g.target_date && (
                    <span>📅 {formatDate(g.target_date)}</span>
                  )}
                </div>
              </div>
              <span className={`text-xs px-2.5 py-0.5 rounded-full border font-medium shrink-0 ${STATUS_CLASS[g.status]}`}>
                {STATUS_LABEL[g.status]}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
