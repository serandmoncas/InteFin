# UX-01 + CLIENT-01 + COACH-03 Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Fix login error in Spanish, upgrade EvolutionChart from LineChart to AreaChart per spec, and add the global `/coach/sessions` page + Sidebar nav item (session components already exist).

**Architecture:** Three independent surgical changes. Most of COACH-03 was already implemented in earlier sessions (`SessionsPanel`, `SessionForm`, `createSession` action, and integration into `/coach/clients/[id]`). This plan only builds what's actually missing.

**Tech Stack:** Next.js 15 App Router, TypeScript, Recharts (AreaChart), Tailwind CSS dark theme, Supabase server client + RLS.

---

## File Map

| File | Action | Responsibility |
|------|--------|----------------|
| `src/app/auth/login/page.tsx` | Modify | UX-01: replace raw Supabase error with Spanish message |
| `src/components/dashboard/EvolutionChart.tsx` | Modify | CLIENT-01: LineChart → AreaChart (filled areas) |
| `src/components/coach/Sidebar.tsx` | Modify | COACH-03: add "Sesiones" nav item |
| `src/actions/sessions.ts` | Modify | COACH-03: add `revalidatePath("/coach/sessions")` |
| `src/app/coach/sessions/page.tsx` | Create | COACH-03: global sessions view with client filter |

---

## Task 1: UX-01 — Error de login en español

**Files:**
- Modify: `src/app/auth/login/page.tsx:26`

- [ ] **Step 1: Make the change**

In `src/app/auth/login/page.tsx`, replace line 26:

```tsx
// Antes (línea 26)
setError(error.message)

// Después
setError("No pudimos enviar el link. Revisa el correo e intenta de nuevo.")
```

The surrounding context for precise placement (lines 24-29):
```tsx
    if (error) {
      setError("No pudimos enviar el link. Revisa el correo e intenta de nuevo.")
    } else {
      setSent(true)
    }
```

- [ ] **Step 2: Verify locally**

Run dev server (`npm run dev`) and go to `http://localhost:3000/auth/login`. Enter an intentionally bad email domain (e.g. `test@`). Confirm the error shown is the Spanish message, not the raw Supabase English string.

- [ ] **Step 3: Commit**

```bash
git add src/app/auth/login/page.tsx
git commit -m "fix(UX-01): translate login error to Spanish"
```

---

## Task 2: CLIENT-01 — AreaChart upgrade (LineChart → AreaChart)

**Files:**
- Modify: `src/components/dashboard/EvolutionChart.tsx`

The existing chart is fully functional (data, colors, tooltip, legend, empty state all correct). Only the chart type changes: `LineChart`/`Line` → `AreaChart`/`Area` with `fillOpacity` for the filled areas under each line. No data or prop changes needed.

- [ ] **Step 1: Update imports and chart type**

Replace the Recharts import block (lines 1–12) and the component body in `src/components/dashboard/EvolutionChart.tsx`:

```tsx
"use client"

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid,
  Legend,
} from "recharts"
import type { AccountSnapshot, AccountType } from "@/lib/supabase/types"
```

- [ ] **Step 2: Replace LineChart + Line with AreaChart + Area**

In the JSX return (inside the `<div className="h-64 -ml-2">` block), replace:

```tsx
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
```

With:

```tsx
        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={data} margin={{ top: 5, right: 8, left: 8, bottom: 0 }}>
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
              <Area
                key={type}
                type="monotone"
                dataKey={type}
                stroke={META[type].color}
                strokeWidth={2}
                fill={META[type].color}
                fillOpacity={0.08}
                dot={{ r: 3, fill: META[type].color, strokeWidth: 0 }}
                activeDot={{ r: 5 }}
                connectNulls
              />
            ))}
          </AreaChart>
        </ResponsiveContainer>
```

- [ ] **Step 3: Verify in browser**

Navigate to `http://localhost:3000/app/dashboard` (as a client user) or check Storybook. Confirm:
- Each account line now has a subtle filled area below it (opacity 0.08 — translucent, not opaque)
- Colors match the spec: red/orange/violet/green
- Tooltip still shows formatted COP amounts
- Empty state still shows if no snapshots

- [ ] **Step 4: Commit**

```bash
git add src/components/dashboard/EvolutionChart.tsx
git commit -m "feat(CLIENT-01): upgrade EvolutionChart from LineChart to AreaChart"
```

---

## Task 3: COACH-03 — Sidebar nav item + revalidation

**Files:**
- Modify: `src/components/coach/Sidebar.tsx:8-14`
- Modify: `src/actions/sessions.ts:56`

- [ ] **Step 1: Add "Sesiones" to the NAV array**

In `src/components/coach/Sidebar.tsx`, the NAV array (lines 8–14) currently has 5 items with no sessions entry. Add it between "Clientes" and "Leads":

```ts
const NAV = [
  { href: "/coach/overview",  label: "Resumen",   icon: "🏠" },
  { href: "/coach/clients",   label: "Clientes",  icon: "👥" },
  { href: "/coach/sessions",  label: "Sesiones",  icon: "📋" },
  { href: "/coach/leads",     label: "Leads",     icon: "🎯" },
  { href: "/coach/invite",    label: "Invitar",   icon: "✉️" },
  { href: "/coach/settings",  label: "Ajustes",   icon: "⚙️" },
]
```

- [ ] **Step 2: Add revalidatePath for /coach/sessions**

In `src/actions/sessions.ts`, line 56 has `revalidatePath(\`/coach/clients/${input.clientId}\`)`. Add the global sessions path after it:

```ts
  revalidatePath(`/coach/clients/${input.clientId}`)
  revalidatePath("/coach/sessions")
  return { success: true }
```

- [ ] **Step 3: Commit**

```bash
git add src/components/coach/Sidebar.tsx src/actions/sessions.ts
git commit -m "feat(COACH-03): add Sesiones to sidebar + revalidate /coach/sessions on create"
```

---

## Task 4: COACH-03 — Global sessions page `/coach/sessions`

**Files:**
- Create: `src/app/coach/sessions/page.tsx`

This is a server component that fetches ALL sessions for the coach's organization, then renders a client component for the filterable table.

- [ ] **Step 1: Create the page**

Create `src/app/coach/sessions/page.tsx`:

```tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { SessionsTable } from "@/components/coach/SessionsTable"

export default async function CoachSessionsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (!profile || profile.role !== "coach") redirect("/auth/login")

  // Fetch all sessions for this org, joined with client name
  const { data: sessions } = await supabase
    .from("coaching_sessions")
    .select(`
      id,
      session_number,
      session_date,
      summary,
      status,
      client_id,
      client_profiles!coaching_sessions_client_id_fkey (
        full_name
      )
    `)
    .eq("organization_id", profile.organization_id!)
    .order("session_date", { ascending: false })

  // Flatten the join for easy consumption in the client component
  const rows = (sessions ?? []).map((s) => ({
    id:             s.id,
    clientId:       s.client_id,
    clientName:     (s.client_profiles as { full_name: string } | null)?.full_name ?? "—",
    sessionNumber:  s.session_number,
    sessionDate:    s.session_date,
    summary:        s.summary ?? "",
    status:         s.status,
  }))

  return (
    <div className="p-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Sesiones</h1>
        <p className="text-slate-400 text-sm mt-1">
          Historial de todas las sesiones de coaching
        </p>
      </div>
      <SessionsTable rows={rows} />
    </div>
  )
}
```

- [ ] **Step 2: Create the client component `SessionsTable`**

Create `src/components/coach/SessionsTable.tsx`:

```tsx
"use client"

import { useState } from "react"
import Link from "next/link"

interface SessionRow {
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
  return new Date(iso).toLocaleDateString("es-CO", {
    day: "2-digit", month: "short", year: "numeric",
  })
}

function truncate(text: string, max = 80): string {
  return text.length > max ? text.slice(0, max) + "…" : text
}

export function SessionsTable({ rows }: SessionsTableProps) {
  const [filter, setFilter] = useState<string>("all")

  // Unique clients for the dropdown
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
                {row.summary ? truncate(row.summary) : <span className="italic text-slate-600">Sin resumen</span>}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
```

- [ ] **Step 3: Verify the foreign key join name**

The query uses `client_profiles!coaching_sessions_client_id_fkey`. Verify the actual foreign key name by checking the Supabase dashboard or running:
```sql
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'coaching_sessions'
  AND constraint_type = 'FOREIGN KEY';
```

If the FK name differs, update the join hint in `CoachSessionsPage` accordingly. Common alternatives: `coaching_sessions_client_id_fkey`, `coaching_sessions_client_id_client_profiles_id_fkey`. If Supabase can't resolve via FK hint, use a separate query:
```ts
// Alternative: two queries instead of join
const { data: sessions } = await supabase
  .from("coaching_sessions")
  .select("id, session_number, session_date, summary, status, client_id")
  .eq("organization_id", profile.organization_id!)
  .order("session_date", { ascending: false })

const clientIds = [...new Set((sessions ?? []).map((s) => s.client_id))]
const { data: clients } = await supabase
  .from("client_profiles")
  .select("id, full_name")
  .in("id", clientIds)

const nameById = new Map((clients ?? []).map((c) => [c.id, c.full_name]))
const rows = (sessions ?? []).map((s) => ({
  ...s,
  clientName: nameById.get(s.client_id) ?? "—",
  sessionNumber: s.session_number,
  sessionDate: s.session_date,
}))
```

- [ ] **Step 4: Verify in browser**

Navigate to `http://localhost:3000/coach/sessions` while logged in as a coach. Confirm:
- Page loads without errors
- "Sesiones" appears in the sidebar (highlighted active)
- Table shows all sessions across all clients
- Dropdown filters rows by client without page reload
- Client name is a clickable link to `/coach/clients/[id]`
- Empty state shows if no sessions exist

- [ ] **Step 5: Build check**

```bash
npm run build
```
Expected: no TypeScript errors, no ESLint errors.

- [ ] **Step 6: Commit**

```bash
git add src/app/coach/sessions/page.tsx src/components/coach/SessionsTable.tsx
git commit -m "feat(COACH-03): global sessions page with client filter"
```

---

## Task 5: Deploy

- [ ] **Step 1: Deploy to production**

```bash
vercel deploy --prod --yes
```

- [ ] **Step 2: Smoke test in production**

1. Go to `https://intefin.vercel.app/auth/login`, enter a bad email format → confirm Spanish error message shows
2. Log in as a coach → check sidebar has "Sesiones" entry
3. Navigate to `/coach/sessions` → confirm table loads
4. Navigate to a client detail page → confirm Sessions tab still works (click "+ Nueva sesión", save)
5. Reload `/coach/sessions` → confirm new session appears

---

## Self-Review

### Spec coverage

| Spec requirement | Task |
|---|---|
| UX-01: error en español | Task 1 ✅ |
| CLIENT-01: AreaChart con 4 áreas, colores, tooltip, empty state | Task 2 ✅ (upgrades existing LineChart) |
| CLIENT-01: filtrar 12 meses en server (ya implementado en dashboard/page.tsx) | Existing ✅ |
| COACH-03: "Sesiones" en sidebar | Task 3 ✅ |
| COACH-03: `/coach/sessions` global page | Task 4 ✅ |
| COACH-03: dropdown filtro por cliente | Task 4 ✅ |
| COACH-03: columnas Cliente / Fecha / Sesión # / Resumen truncado | Task 4 ✅ |
| COACH-03: `revalidatePath("/coach/sessions")` en createSession | Task 3 ✅ |
| COACH-03: Tab en `/coach/clients/[id]` (ya implementado) | Existing ✅ |
| COACH-03: `SessionModal` con 4 campos (ya implementado como `SessionForm`) | Existing ✅ |
| COACH-03: `createSession` server action (ya implementado) | Existing ✅ |

### Placeholder scan
No TBDs, no TODOs, no vague requirements. The FK hint in Task 4 Step 3 has a concrete fallback query if the join fails.

### Type consistency
- `SessionRow` interface defined in `SessionsTable.tsx` matches what `CoachSessionsPage` produces in the `rows.map()` call
- `AccountType` in `EvolutionChart` is unchanged (same keys: `imprevisto | oxigeno | retiro | inversiones`)
- `createSession` signature in `sessions.ts` is unchanged
