"use client"

import { useState } from "react"
import Link from "next/link"

export interface SessionRow {
  id:            string
  clientId:      string
  clientName:    string
  sessionNumber: number
  sessionDate:   string
  summary:       string
  status:        string
}

interface SessionsTableProps {
  rows: SessionRow[]
}

function formatDate(iso: string): string {
  if (!iso) return "—"
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + "…" : text
}

export function SessionsTable({ rows }: SessionsTableProps) {
  const [filter, setFilter] = useState<string>("all")

  // Unique clients for the dropdown, sorted alphabetically
  const clients = Array.from(
    new Map(rows.map((r) => [r.clientId, r.clientName])).entries()
  ).sort((a, b) => a[1].localeCompare(b[1]))

  const filtered = filter === "all" ? rows : rows.filter((r) => r.clientId === filter)

  if (rows.length === 0) {
    return (
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-10 text-center">
        <p className="text-3xl mb-2">📋</p>
        <p className="text-slate-400 text-sm">Aún no hay sesiones registradas.</p>
      </div>
    )
  }

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl overflow-hidden">
      {/* Filter bar */}
      <div className="flex items-center gap-3 p-4 border-b border-slate-800">
        <label className="text-slate-400 text-sm">Filtrar por cliente:</label>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          className="bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-1.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
        >
          <option value="all">Todos los clientes</option>
          {clients.map(([id, name]) => (
            <option key={id} value={id}>{name}</option>
          ))}
        </select>
        <span className="text-slate-500 text-xs ml-auto">
          {filtered.length} sesión{filtered.length !== 1 ? "es" : ""}
        </span>
      </div>

      {/* Table */}
      <table className="w-full text-sm">
        <thead>
          <tr className="border-b border-slate-800">
            <th className="text-left text-slate-500 font-medium px-4 py-3">Cliente</th>
            <th className="text-left text-slate-500 font-medium px-4 py-3">Fecha</th>
            <th className="text-left text-slate-500 font-medium px-4 py-3">Sesión #</th>
            <th className="text-left text-slate-500 font-medium px-4 py-3">Resumen</th>
          </tr>
        </thead>
        <tbody>
          {filtered.map((row) => (
            <tr
              key={row.id}
              className="border-b border-slate-800/50 hover:bg-slate-800/30 transition-colors"
            >
              <td className="px-4 py-3">
                <Link
                  href={`/coach/clients/${row.clientId}`}
                  className="text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  {row.clientName}
                </Link>
              </td>
              <td className="px-4 py-3 text-slate-300">{formatDate(row.sessionDate)}</td>
              <td className="px-4 py-3 text-slate-400">#{row.sessionNumber}</td>
              <td className="px-4 py-3 text-slate-400">
                {row.summary
                  ? truncate(row.summary)
                  : <span className="italic text-slate-600">Sin resumen</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
