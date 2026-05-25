"use client"

import { useState, useTransition } from "react"
import { updateGoalStatus } from "@/actions/goals"
import type { Goal } from "@/lib/supabase/types"

interface GoalBoardProps {
  goals: Goal[]
}

// Order for display
const STATUS_ORDER = ["in_progress", "pending", "completed"] as const

const SECTION_META: Record<string, { label: string; border: string; empty: string }> = {
  in_progress: { label: "En curso",    border: "border-l-indigo-500",  empty: "No hay metas en curso." },
  pending:     { label: "Pendientes",  border: "border-l-slate-500",   empty: "No hay metas pendientes." },
  completed:   { label: "Completadas", border: "border-l-emerald-500", empty: "" },
}

function formatCOP(n: number) {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n)
}

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric", month: "long", year: "numeric",
  })
}

function GoalCard({ goal }: { goal: Goal }) {
  const [isPending, startTransition] = useTransition()
  const [actionError, setActionError] = useState("")

  function advance() {
    const next = goal.status === "pending" ? "in_progress" : "completed"
    setActionError("")
    startTransition(async () => {
      const res = await updateGoalStatus(goal.id, next)
      if (res.error) setActionError(res.error)
    })
  }

  return (
    <div
      className={`bg-[#0f172a] border border-slate-800 border-l-4 ${SECTION_META[goal.status]?.border ?? ""} rounded-xl p-4`}
    >
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <p className="text-slate-100 font-medium text-sm">{goal.title}</p>
          {goal.description && (
            <p className="text-slate-400 text-xs mt-1">{goal.description}</p>
          )}
          <div className="flex items-center gap-3 mt-2 text-xs text-slate-500">
            {goal.target_amount != null && (
              <span>🎯 {formatCOP(goal.target_amount)}</span>
            )}
            {goal.target_date && (
              <span>📅 {formatDate(goal.target_date)}</span>
            )}
          </div>
        </div>

        {goal.status !== "completed" && (
          <button
            onClick={advance}
            disabled={isPending}
            className={`shrink-0 text-xs font-medium px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${
              goal.status === "pending"
                ? "border-indigo-500/50 text-indigo-400 hover:bg-indigo-500/10"
                : "border-emerald-500/50 text-emerald-400 hover:bg-emerald-500/10"
            }`}
          >
            {isPending
              ? "..."
              : goal.status === "pending"
              ? "▶ Iniciar"
              : "✓ Completar"}
          </button>
        )}

        {goal.status === "completed" && (
          <span className="shrink-0 text-xs text-emerald-400 font-medium">✓ Completada</span>
        )}
      </div>
      {actionError && (
        <p className="text-red-400 text-xs mt-2">{actionError}</p>
      )}
    </div>
  )
}

export function GoalBoard({ goals }: GoalBoardProps) {
  // Filter out cancelled goals (not shown to client)
  const visible = goals.filter((g) => g.status !== "cancelled")

  if (visible.length === 0) {
    return (
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-10 text-center">
        <p className="text-3xl mb-2">🎯</p>
        <p className="text-slate-400 text-sm">Tu coach aún no ha definido metas para ti.</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {STATUS_ORDER.map((status) => {
        const section = visible.filter((g) => g.status === status)
        if (section.length === 0 && status !== "in_progress" && status !== "pending") return null
        if (section.length === 0 && SECTION_META[status].empty === "") return null

        return (
          <div key={status}>
            <h2 className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-3">
              {SECTION_META[status].label}
              <span className="ml-2 text-slate-600">({section.length})</span>
            </h2>
            {section.length === 0 ? (
              <p className="text-slate-600 text-sm">{SECTION_META[status].empty}</p>
            ) : (
              <div className="space-y-3">
                {section.map((g) => (
                  <GoalCard key={g.id} goal={g} />
                ))}
              </div>
            )}
          </div>
        )
      })}
    </div>
  )
}
