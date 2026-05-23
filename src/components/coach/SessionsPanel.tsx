"use client"

import { useState } from "react"
import { SessionForm } from "./SessionForm"
import type { CoachingSession } from "@/lib/supabase/types"

interface SessionsPanelProps {
  clientId: string
  sessions: CoachingSession[]
}

function formatDate(iso: string | null): string {
  if (!iso) return "Sin fecha"
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "numeric",
    month: "long",
    year: "numeric",
  })
}

export function SessionsPanel({ clientId, sessions }: SessionsPanelProps) {
  const [open, setOpen] = useState(false)
  const [expandedId, setExpandedId] = useState<string | null>(null)

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl">
      <div className="p-5 border-b border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-slate-100 font-semibold text-sm">Sesiones</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            {sessions.length} {sessions.length === 1 ? "sesión registrada" : "sesiones registradas"}
          </p>
        </div>
        <button
          onClick={() => setOpen((o) => !o)}
          className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium px-3 py-1.5 rounded-lg transition-colors"
        >
          {open ? "Cancelar" : "+ Nueva sesión"}
        </button>
      </div>

      {open && (
        <div className="p-5 border-b border-slate-800 bg-slate-900/40">
          <SessionForm clientId={clientId} onSaved={() => setOpen(false)} />
        </div>
      )}

      {sessions.length === 0 ? (
        <div className="p-8 text-center">
          <p className="text-3xl mb-2">📋</p>
          <p className="text-slate-400 text-sm">Aún no has registrado ninguna sesión</p>
          {!open && (
            <button
              onClick={() => setOpen(true)}
              className="mt-3 text-indigo-400 hover:text-indigo-300 text-xs transition-colors"
            >
              Registrar la primera →
            </button>
          )}
        </div>
      ) : (
        <ul className="divide-y divide-slate-800">
          {sessions.map((s) => {
            const expanded = expandedId === s.id
            const deliverables = Array.isArray(s.deliverables) ? s.deliverables as string[] : []
            return (
              <li key={s.id}>
                <button
                  onClick={() => setExpandedId(expanded ? null : s.id)}
                  className="w-full text-left px-5 py-3.5 hover:bg-slate-800/40 transition-colors flex items-center justify-between"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-full bg-indigo-600/20 border border-indigo-500/30 flex items-center justify-center text-indigo-300 text-xs font-bold">
                      {s.session_number}
                    </div>
                    <div>
                      <p className="text-slate-200 text-sm font-medium">Sesión #{s.session_number}</p>
                      <p className="text-slate-500 text-xs">{formatDate(s.session_date)}</p>
                    </div>
                  </div>
                  <span className="text-slate-500 text-xs">{expanded ? "▴" : "▾"}</span>
                </button>

                {expanded && (
                  <div className="px-5 pb-4 space-y-3">
                    {s.summary && (
                      <div className="bg-slate-800/60 rounded-lg p-3">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-1">
                          Resumen
                        </p>
                        <p className="text-slate-200 text-sm whitespace-pre-wrap">{s.summary}</p>
                      </div>
                    )}
                    {s.notes && (
                      <div className="bg-amber-950/30 border border-amber-900/40 rounded-lg p-3">
                        <p className="text-amber-400 text-xs font-semibold uppercase tracking-wider mb-1">
                          🔒 Notas privadas
                        </p>
                        <p className="text-slate-200 text-sm whitespace-pre-wrap">{s.notes}</p>
                      </div>
                    )}
                    {deliverables.length > 0 && (
                      <div className="bg-slate-800/60 rounded-lg p-3">
                        <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider mb-2">
                          Tareas
                        </p>
                        <ul className="space-y-1.5">
                          {deliverables.map((d, i) => (
                            <li key={i} className="flex items-start gap-2 text-slate-200 text-sm">
                              <span className="text-indigo-400 mt-0.5">○</span>
                              <span>{d}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </div>
                )}
              </li>
            )
          })}
        </ul>
      )}
    </div>
  )
}
