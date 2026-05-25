"use client"

import { useState, useTransition } from "react"
import { createGoal } from "@/actions/goals"

interface GoalFormProps {
  clientId: string
  onSaved:  () => void
}

const inputClass =
  "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"

export function GoalForm({ clientId, onSaved }: GoalFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]             = useState("")
  const [title, setTitle]             = useState("")
  const [description, setDescription] = useState("")
  const [targetAmount, setTargetAmount] = useState("")
  const [targetDate, setTargetDate]   = useState("")

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await createGoal({ clientId, title, description, targetAmount, targetDate })
      if (res.error) { setError(res.error); return }
      setTitle("")
      setDescription("")
      setTargetAmount("")
      setTargetDate("")
      onSaved()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Título <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          required
          value={title}
          onChange={(e) => setTitle(e.target.value)}
          placeholder="Ej: Fondo de emergencia completo"
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Descripción <span className="text-slate-500">(opcional)</span>
        </label>
        <textarea
          rows={2}
          value={description}
          onChange={(e) => setDescription(e.target.value)}
          placeholder="Describe el objetivo con detalle..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            Monto objetivo COP <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            type="number"
            min="0"
            value={targetAmount}
            onChange={(e) => setTargetAmount(e.target.value)}
            placeholder="0"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-xs text-slate-400 mb-1.5">
            Fecha límite <span className="text-slate-500">(opcional)</span>
          </label>
          <input
            type="date"
            value={targetDate}
            onChange={(e) => setTargetDate(e.target.value)}
            className={inputClass}
          />
        </div>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending || !title.trim()}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        {isPending ? "Guardando..." : "Guardar meta"}
      </button>
    </form>
  )
}
