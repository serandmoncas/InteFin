# CLIENT-02: Metas Financieras — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** El coach define metas financieras por cliente desde su perfil; el cliente las ve en `/app/goals` y puede cambiar su estado (pending → in_progress → completed).

**Architecture:** Server actions para mutaciones, server components para fetch de datos, client components mínimos para interactividad (useTransition). El patrón es idéntico al de SessionsPanel/SessionForm — GoalList contiene GoalForm inline, GoalBoard tiene botones de avance con useTransition.

**Tech Stack:** Next.js 15 App Router, TypeScript, Supabase server client + RLS, Tailwind CSS dark theme (`bg-[#0f172a]`, indigo `#6366f1`).

---

## File Map

| Archivo | Acción | Responsabilidad |
|---------|--------|-----------------|
| `src/actions/goals.ts` | Crear | `createGoal()` + `updateGoalStatus()` |
| `src/components/coach/GoalForm.tsx` | Crear | Formulario inline para crear meta (coach) |
| `src/components/coach/GoalList.tsx` | Crear | Panel de metas en perfil de cliente (coach) |
| `src/app/coach/clients/[id]/page.tsx` | Modificar | Query goals + render `<GoalList>` al final |
| `src/app/app/goals/page.tsx` | Crear | Server component: fetch goals del cliente |
| `src/components/client/GoalBoard.tsx` | Crear | Lista interactiva con botones de avance |

---

## Task 1: Server Actions

**Files:**
- Create: `src/actions/goals.ts`

- [ ] **Step 1: Crear el archivo**

```ts
"use server"

import { revalidatePath } from "next/cache"
import { createClient } from "@/lib/supabase/server"

export interface CreateGoalInput {
  clientId:     string
  title:        string
  description:  string
  targetAmount: string   // string vacío → null
  targetDate:   string   // string vacío → null
}

export async function createGoal(
  input: CreateGoalInput,
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  const { data: coachProfile } = await supabase
    .from("profiles")
    .select("organization_id, role")
    .eq("id", user.id)
    .single()

  if (!coachProfile || coachProfile.role !== "coach") {
    return { error: "Solo coaches pueden crear metas." }
  }

  // Verify the client belongs to this coach's org
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("organization_id")
    .eq("id", input.clientId)
    .single()

  if (!clientProfile || clientProfile.organization_id !== coachProfile.organization_id) {
    return { error: "Cliente no encontrado en tu organización." }
  }

  const { error } = await supabase
    .from("goals")
    .insert({
      client_id:       input.clientId,
      organization_id: coachProfile.organization_id!,
      title:           input.title.trim(),
      description:     input.description.trim() || null,
      target_amount:   input.targetAmount ? Number(input.targetAmount) : null,
      target_date:     input.targetDate || null,
      status:          "pending",
    })

  if (error) return { error: `Error guardando meta: ${error.message}` }

  revalidatePath(`/coach/clients/${input.clientId}`)
  return {}
}

export async function updateGoalStatus(
  goalId: string,
  status: "in_progress" | "completed",
): Promise<{ error?: string }> {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return { error: "No autenticado." }

  // Find the client_profile for this user
  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!clientProfile) return { error: "Perfil de cliente no encontrado." }

  // Update only if this goal belongs to this client
  const { error } = await supabase
    .from("goals")
    .update({ status })
    .eq("id", goalId)
    .eq("client_id", clientProfile.id)

  if (error) return { error: `Error actualizando meta: ${error.message}` }

  revalidatePath("/app/goals")
  return {}
}
```

- [ ] **Step 2: Verificar que TypeScript no se queja**

```bash
npx tsc --noEmit 2>&1 | grep goals
```
Esperado: sin salida (sin errores).

- [ ] **Step 3: Commit**

```bash
git add src/actions/goals.ts
git commit -m "feat(CLIENT-02): createGoal + updateGoalStatus server actions"
```

---

## Task 2: GoalForm (coach — formulario inline)

**Files:**
- Create: `src/components/coach/GoalForm.tsx`

Mismo patrón que `SessionForm`: `useTransition`, llama server action, `onSaved()` al éxito.

- [ ] **Step 1: Crear el archivo**

```tsx
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
```

- [ ] **Step 2: Verificar types**

```bash
npx tsc --noEmit 2>&1 | grep GoalForm
```
Esperado: sin salida.

- [ ] **Step 3: Commit**

```bash
git add src/components/coach/GoalForm.tsx
git commit -m "feat(CLIENT-02): GoalForm component"
```

---

## Task 3: GoalList (coach — panel en perfil de cliente)

**Files:**
- Create: `src/components/coach/GoalList.tsx`

Mismo patrón que `SessionsPanel`: cliente component con estado `open`, renderiza `GoalForm` inline al expandir.

- [ ] **Step 1: Crear el archivo**

```tsx
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
```

- [ ] **Step 2: Verificar types**

```bash
npx tsc --noEmit 2>&1 | grep GoalList
```
Esperado: sin salida.

- [ ] **Step 3: Commit**

```bash
git add src/components/coach/GoalList.tsx
git commit -m "feat(CLIENT-02): GoalList panel component"
```

---

## Task 4: Integrar GoalList en la página del cliente (coach)

**Files:**
- Modify: `src/app/coach/clients/[id]/page.tsx`

- [ ] **Step 1: Agregar el import**

Al inicio del archivo, agregar la importación de `GoalList`:

```tsx
import { GoalList } from "@/components/coach/GoalList"
```

(junto a los otros imports de componentes, después de la línea de `SessionsPanel`)

- [ ] **Step 2: Agregar la query de goals**

Dentro del server component, después de la query de `sessions` (líneas 75-80 del archivo actual):

```tsx
  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("client_id", id)
    .order("created_at", { ascending: false })
```

- [ ] **Step 3: Agregar el componente en el JSX**

Después de `<SessionsPanel clientId={id} sessions={sessions ?? []} />` (última línea del return), agregar:

```tsx
      <GoalList clientId={id} goals={goals ?? []} />
```

El bloque final del return queda:
```tsx
      {/* Sessions */}
      <SessionsPanel clientId={id} sessions={sessions ?? []} />

      {/* Goals */}
      <GoalList clientId={id} goals={goals ?? []} />
    </div>
  )
```

- [ ] **Step 4: Build check**

```bash
npm run build 2>&1 | tail -20
```
Esperado: `✓ Compiled successfully`, sin errores TypeScript.

- [ ] **Step 5: Verificar en browser**

```bash
npm run dev
```
Ir a `http://localhost:3000/coach/clients/[id]` (cualquier cliente existente). Confirmar:
- Panel "Metas" aparece debajo del panel "Sesiones"
- Botón "+ Nueva meta" abre el formulario inline
- Se puede crear una meta con solo título (campos opcionales vacíos)
- La meta aparece en la lista con badge "Pendiente"

- [ ] **Step 6: Commit**

```bash
git add src/app/coach/clients/[id]/page.tsx
git commit -m "feat(CLIENT-02): add GoalList to client detail page"
```

---

## Task 5: GoalBoard (cliente — vista interactiva)

**Files:**
- Create: `src/components/client/GoalBoard.tsx`

Client component con un `useTransition` **por botón** para deshabilitar solo el que se está procesando (no toda la lista).

- [ ] **Step 1: Crear directorio si no existe**

```bash
ls src/components/client/ 2>/dev/null || mkdir -p src/components/client
```

- [ ] **Step 2: Crear el archivo**

```tsx
"use client"

import { useTransition } from "react"
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

  function advance() {
    const next = goal.status === "pending" ? "in_progress" : "completed"
    startTransition(() => updateGoalStatus(goal.id, next))
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
```

- [ ] **Step 3: Verificar types**

```bash
npx tsc --noEmit 2>&1 | grep GoalBoard
```
Esperado: sin salida.

- [ ] **Step 4: Commit**

```bash
git add src/components/client/GoalBoard.tsx
git commit -m "feat(CLIENT-02): GoalBoard client component"
```

---

## Task 6: Página /app/goals (cliente)

**Files:**
- Create: `src/app/app/goals/page.tsx`

- [ ] **Step 1: Crear el directorio**

```bash
mkdir -p src/app/app/goals
```

- [ ] **Step 2: Crear la página**

```tsx
import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { GoalBoard } from "@/components/client/GoalBoard"

export default async function GoalsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) redirect("/auth/login")

  const { data: clientProfile } = await supabase
    .from("client_profiles")
    .select("id")
    .eq("user_id", user.id)
    .single()

  if (!clientProfile) redirect("/onboarding/client")

  const { data: goals } = await supabase
    .from("goals")
    .select("*")
    .eq("client_id", clientProfile.id)
    .order("created_at", { ascending: false })

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-slate-100">Mis Metas</h1>
        <p className="text-slate-400 text-sm mt-1">
          Objetivos financieros definidos con tu coach
        </p>
      </div>
      <GoalBoard goals={goals ?? []} />
    </div>
  )
}
```

- [ ] **Step 3: Build check completo**

```bash
npm run build 2>&1 | tail -25
```
Esperado: `✓ Compiled successfully`. La ruta `/app/goals` debe aparecer en el listado de rutas dinámicas.

- [ ] **Step 4: Verificar flujo completo en browser**

```bash
npm run dev
```

**Flujo coach:**
1. Ir a `http://localhost:3000/coach/clients/[id]` con cualquier cliente
2. Scroll abajo → ver panel "Metas"
3. Click "+ Nueva meta" → formulario aparece inline
4. Llenar solo el título → "Guardar meta"
5. Meta aparece con badge "Pendiente"
6. Click "+ Nueva meta" de nuevo → llenar todos los campos (incluir monto y fecha) → guardar
7. Lista muestra 2 metas

**Flujo cliente:**
1. Ir a `http://localhost:3000/app/goals` (logueado como cliente)
2. Ver las 2 metas creadas por el coach agrupadas en "Pendientes"
3. Click "▶ Iniciar" en la primera → badge cambia a "En curso", tarjeta se mueve a la sección "En curso"
4. Click "✓ Completar" en esa meta → se mueve a "Completadas", sin botón de acción
5. Volver al coach → badge refleja el nuevo estado

- [ ] **Step 5: Commit**

```bash
git add src/app/app/goals/page.tsx
git commit -m "feat(CLIENT-02): /app/goals page"
```

---

## Task 7: Deploy

- [ ] **Step 1: Deploy a producción**

```bash
vercel deploy --prod --yes
```

- [ ] **Step 2: Smoke test en producción**

1. Coach: crear 2 metas para un cliente (una con monto + fecha, una solo título)
2. Cliente: navegar a `https://intefin.vercel.app/app/goals` → confirmar que aparecen
3. Cliente: avanzar estado de una meta → confirmar que el cambio persiste al recargar la página
4. Coach: volver a `/coach/clients/[id]` → badge de estado refleja el cambio hecho por el cliente

---

## Self-Review

### Spec coverage

| Requisito spec | Task |
|---|---|
| `createGoal()` server action con validación de org | Task 1 ✅ |
| `updateGoalStatus()` server action con validación de client_id | Task 1 ✅ |
| `GoalForm` — 4 campos, useTransition, onSaved callback | Task 2 ✅ |
| `GoalList` — encabezado con contador, inline form, lista con badges | Task 3 ✅ |
| Tab "Metas" en `/coach/clients/[id]` | Task 4 ✅ (panel al final, mismo patrón que Sesiones) |
| `/app/goals` — server component | Task 6 ✅ |
| `GoalBoard` — agrupación por estado, `cancelled` oculto | Task 5 ✅ |
| Botones "Iniciar" / "Completar" con useTransition | Task 5 ✅ |
| Empty state cliente | Task 5 ✅ |
| Empty state coach | Task 3 ✅ |
| `revalidatePath` en ambas actions | Task 1 ✅ |

### Placeholder scan
Sin TBDs, sin TODOs, sin secciones vacías.

### Type consistency
- `Goal` importado de `@/lib/supabase/types` en `GoalList`, `GoalBoard`, y `GoalCard` — mismo tipo en todos.
- `CreateGoalInput` definido en Task 1, usado en Task 2 (`GoalForm` llama `createGoal(input: CreateGoalInput)`).
- `updateGoalStatus(goalId: string, status: "in_progress" | "completed")` — firma consistente entre Task 1 y Task 5.
- `onSaved: () => void` en `GoalForm` — coincide con el callback en `GoalList` (`onSaved={() => setOpen(false)}`).
