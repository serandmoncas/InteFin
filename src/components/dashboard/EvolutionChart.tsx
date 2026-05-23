"use client"

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts"
import type { AccountSnapshot, AccountType } from "@/lib/supabase/types"

const META: Record<AccountType, { label: string; color: string }> = {
  imprevisto:  { label: "Imprevisto",  color: "#f87171" },
  oxigeno:     { label: "Oxígeno",     color: "#fb923c" },
  retiro:      { label: "Retiro",      color: "#a78bfa" },
  inversiones: { label: "Inversiones", color: "#34d399" },
}

interface AccountWithType {
  id: string
  account_type: AccountType
}

interface EvolutionChartProps {
  accounts:  AccountWithType[]
  snapshots: AccountSnapshot[]
}

interface ChartPoint {
  month: string
  monthLabel: string
  imprevisto?: number
  oxigeno?: number
  retiro?: number
  inversiones?: number
}

function formatCOPshort(n: number): string {
  if (n === 0) return "$0"
  if (n >= 1_000_000) return `$${(n / 1_000_000).toFixed(1)}M`
  if (n >= 1_000) return `$${(n / 1_000).toFixed(0)}k`
  return `$${n}`
}

function formatCOPfull(n: number): string {
  return new Intl.NumberFormat("es-CO", {
    style: "currency", currency: "COP", maximumFractionDigits: 0,
  }).format(n)
}

function monthLabel(iso: string): string {
  const d = new Date(iso)
  return d.toLocaleDateString("es-CO", { month: "short", year: "2-digit" })
}

export function EvolutionChart({ accounts, snapshots }: EvolutionChartProps) {
  // Map account_id → account_type
  const accountTypeById = new Map<string, AccountType>()
  for (const a of accounts) accountTypeById.set(a.id, a.account_type)

  // Build pivoted data: one row per month with all account amounts
  const byMonth = new Map<string, ChartPoint>()
  for (const s of snapshots) {
    const type = accountTypeById.get(s.account_id)
    if (!type) continue
    const month = s.snapshot_month
    if (!byMonth.has(month)) {
      byMonth.set(month, { month, monthLabel: monthLabel(month) })
    }
    byMonth.get(month)![type] = Number(s.amount)
  }

  const data = Array.from(byMonth.values()).sort((a, b) => a.month.localeCompare(b.month))

  if (data.length === 0) {
    return (
      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-8 text-center">
        <p className="text-3xl mb-2">📈</p>
        <p className="text-slate-400 text-sm">Aún no hay historial.</p>
        <p className="text-slate-500 text-xs mt-1">
          Cuando actualices tus saldos cada mes, verás tu evolución aquí.
        </p>
      </div>
    )
  }

  // Determine which account types appear in the data (don't render empty lines)
  const visibleTypes = (Object.keys(META) as AccountType[]).filter((t) =>
    data.some((d) => d[t] !== undefined)
  )

  return (
    <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-5">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h2 className="text-slate-100 font-semibold text-sm">Tu evolución</h2>
          <p className="text-slate-500 text-xs mt-0.5">
            Saldo de cada cuenta por mes
          </p>
        </div>
      </div>

      <div className="h-64 -ml-2">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
            <CartesianGrid stroke="#1e293b" strokeDasharray="3 3" vertical={false} />
            <XAxis
              dataKey="monthLabel"
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
            />
            <YAxis
              stroke="#64748b"
              fontSize={11}
              tickLine={false}
              axisLine={false}
              tickFormatter={formatCOPshort}
              width={50}
            />
            <Tooltip
              contentStyle={{
                background: "#0f172a",
                border: "1px solid #334155",
                borderRadius: "8px",
                fontSize: "12px",
              }}
              labelStyle={{ color: "#cbd5e1", fontWeight: 600 }}
              formatter={(value, name) => [
                formatCOPfull(Number(value)),
                META[name as AccountType]?.label ?? String(name),
              ]}
            />
            <Legend
              iconSize={8}
              wrapperStyle={{ fontSize: "11px", color: "#94a3b8", paddingTop: "8px" }}
              formatter={(value: string) => META[value as AccountType]?.label ?? value}
            />
            {visibleTypes.map((type) => (
              <Line
                key={type}
                type="monotone"
                dataKey={type}
                stroke={META[type].color}
                strokeWidth={2}
                dot={{ r: 3, fill: META[type].color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
