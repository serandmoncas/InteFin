"use client"

import { useState, useTransition } from "react"
import { createSession } from "@/actions/sessions"

interface SessionFormProps {
  clientId: string
  onSaved?: () => void
}

const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"

export function SessionForm({ clientId, onSaved }: SessionFormProps) {
  const [isPending, startTransition] = useTransition()
  const [error, setError]   = useState("")
  const [date, setDate]     = useState(new Date().toISOString().split("T")[0])
  const [summary, setSummary] = useState("")
  const [notes, setNotes]     = useState("")
  const [deliverables, setDeliverables] = useState<string[]>([""])

  function setDeliverable(i: number, value: string) {
    setDeliverables((arr) => arr.map((d, idx) => (idx === i ? value : d)))
  }

  function addDeliverable() {
    setDeliverables((arr) => [...arr, ""])
  }

  function removeDeliverable(i: number) {
    setDeliverables((arr) => arr.filter((_, idx) => idx !== i))
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await createSession({
        clientId,
        sessionDate:  date,
        summary,
        notes,
        deliverables: deliverables.map((d) => d.trim()).filter(Boolean),
      })
      if (res.error) { setError(res.error); return }
      // Reset form
      setSummary("")
      setNotes("")
      setDeliverables([""])
      onSaved?.()
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <label className="block text-xs text-slate-400 mb-1.5">Fecha de la sesión</label>
        <input
          type="date"
          required
          value={date}
          onChange={(e) => setDate(e.target.value)}
          className={inputClass}
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Resumen <span className="text-slate-500">(visible para el cliente)</span>
        </label>
        <textarea
          rows={3}
          value={summary}
          onChange={(e) => setSummary(e.target.value)}
          placeholder="Ej: Hablamos del fondo de emergencia. Próximo objetivo: separar $200k del salario para Imprevisto."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Notas privadas <span className="text-slate-500">(solo tú las ves)</span>
        </label>
        <textarea
          rows={3}
          value={notes}
          onChange={(e) => setNotes(e.target.value)}
          placeholder="Observaciones, contexto personal, alertas..."
          className={`${inputClass} resize-none`}
        />
      </div>

      <div>
        <label className="block text-xs text-slate-400 mb-1.5">
          Tareas para el cliente <span className="text-slate-500">(opcional)</span>
        </label>
        <div className="space-y-2">
          {deliverables.map((d, i) => (
            <div key={i} className="flex items-center gap-2">
              <input
                type="text"
                value={d}
                onChange={(e) => setDeliverable(i, e.target.value)}
                placeholder={`Tarea ${i + 1}`}
                className={`${inputClass} flex-1`}
              />
              {deliverables.length > 1 && (
                <button
                  type="button"
                  onClick={() => removeDeliverable(i)}
                  className="text-slate-500 hover:text-red-400 text-sm px-2 transition-colors"
                  aria-label="Eliminar tarea"
                >
                  ✕
                </button>
              )}
            </div>
          ))}
          <button
            type="button"
            onClick={addDeliverable}
            className="text-indigo-400 hover:text-indigo-300 text-xs font-medium transition-colors"
          >
            + Agregar tarea
          </button>
        </div>
      </div>

      {error && (
        <div className="bg-red-950/50 border border-red-800 rounded-lg px-3 py-2">
          <p className="text-red-400 text-xs">{error}</p>
        </div>
      )}

      <button
        type="submit"
        disabled={isPending}
        className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-sm font-medium py-2 rounded-lg transition-colors"
      >
        {isPending ? "Guardando..." : "Registrar sesión"}
      </button>
    </form>
  )
}
