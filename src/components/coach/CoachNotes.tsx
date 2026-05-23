"use client"

import { useState, useTransition } from "react"
import { updateCoachNotes } from "@/actions/client-notes"

interface CoachNotesProps {
  clientId: string
  initialNotes: string | null
}

export function CoachNotes({ clientId, initialNotes }: CoachNotesProps) {
  const [editing, setEditing] = useState(false)
  const [notes, setNotes]     = useState(initialNotes ?? "")
  const [saved, setSaved]     = useState(initialNotes ?? "")
  const [error, setError]     = useState("")
  const [isPending, startTransition] = useTransition()

  function save() {
    setError("")
    startTransition(async () => {
      const res = await updateCoachNotes(clientId, notes)
      if (res.error) { setError(res.error); return }
      setSaved(notes)
      setEditing(false)
    })
  }

  function cancel() {
    setNotes(saved)
    setEditing(false)
    setError("")
  }

  return (
    <div className="bg-amber-950/20 border border-amber-900/40 rounded-xl mb-5">
      <div className="px-5 py-3 border-b border-amber-900/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="text-base">🔒</span>
          <h2 className="text-amber-300 font-semibold text-sm">Notas privadas</h2>
          <span className="text-amber-500/60 text-xs">(solo tú las ves)</span>
        </div>
        {!editing && (
          <button
            onClick={() => setEditing(true)}
            className="text-amber-400 hover:text-amber-300 text-xs font-medium transition-colors"
          >
            {saved ? "Editar" : "+ Agregar"}
          </button>
        )}
      </div>

      <div className="p-5">
        {editing ? (
          <div className="space-y-3">
            <textarea
              autoFocus
              rows={5}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contexto general del cliente: su historia, observaciones que no van en una sesión específica, recordatorios..."
              className="w-full bg-slate-900 border border-amber-900/40 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500/40 resize-none"
            />
            {error && <p className="text-red-400 text-xs">{error}</p>}
            <div className="flex items-center gap-2">
              <button
                onClick={save}
                disabled={isPending}
                className="bg-amber-600 hover:bg-amber-500 text-white text-xs font-medium px-4 py-1.5 rounded-lg disabled:opacity-50 transition-colors"
              >
                {isPending ? "Guardando..." : "Guardar"}
              </button>
              <button
                onClick={cancel}
                className="text-slate-400 hover:text-slate-200 text-xs px-3 py-1.5 transition-colors"
              >
                Cancelar
              </button>
            </div>
          </div>
        ) : saved ? (
          <p className="text-slate-200 text-sm whitespace-pre-wrap leading-relaxed">{saved}</p>
        ) : (
          <p className="text-slate-500 text-sm italic">
            Sin notas todavía. Úsalo para guardar contexto general del cliente.
          </p>
        )}
      </div>
    </div>
  )
}
