# CLIENT-02 Design
**Fecha:** 2026-05-25
**Alcance:** Metas financieras — coach crea, cliente ve y marca avance
**Estado:** Aprobado

---

## Resumen

El coach define metas financieras para cada cliente desde el perfil del cliente (`/coach/clients/[id]`). El cliente las ve en `/app/goals` y puede actualizar su estado (`pending → in_progress → completed`).

---

## Tabla `goals` (existente)

```ts
{
  id:             string
  client_id:      string          // FK → client_profiles.id
  organization_id: string
  title:          string          // requerido
  description:    string | null   // opcional
  target_amount:  number | null   // COP, opcional
  target_date:    string | null   // ISO date, opcional
  status:         "pending" | "in_progress" | "completed" | "cancelled"
  created_at:     string
}
```

---

## Server Actions: `src/actions/goals.ts`

### `createGoal(input: CreateGoalInput)`

```ts
interface CreateGoalInput {
  clientId:     string
  title:        string
  description:  string
  targetAmount: string   // string vacío si no aplica
  targetDate:   string   // string vacío si no aplica
}
```

**Lógica:**
1. Verificar auth + obtener `organization_id` y `role === "coach"`
2. Obtener `organization_id` del client_profile para validar que el cliente pertenece a la org del coach
3. INSERT en `goals` con `status: "pending"`
4. `revalidatePath(\`/coach/clients/${input.clientId}\`)`
5. Retornar `{ error? }`

### `updateGoalStatus(goalId: string, status: "in_progress" | "completed")`

**Lógica:**
1. Verificar auth + obtener `client_profiles.id` del cliente (via `user_id`)
2. UPDATE `goals` WHERE `id = goalId AND client_id = clientProfile.id` (RLS extra: solo sus propias metas)
3. `revalidatePath("/app/goals")`
4. Retornar `{ error? }`

---

## Surface A — Coach: tab "Metas" en `/coach/clients/[id]`

### Componente `GoalList`

**Archivo:** `src/components/coach/GoalList.tsx`

**Props:**
```ts
interface GoalListProps {
  clientId: string
  goals:    Goal[]
}
```

**UI:**
- Encabezado con botón "+ Nueva meta" → abre `GoalForm` (modal)
- Lista ordenada por `created_at DESC`
- Por fila: título, descripción truncada a 60 chars, monto objetivo formateado en COP (si tiene), fecha límite (si tiene), badge de estado
- Empty state: "No hay metas definidas para este cliente."

**Badges de estado:**
- `pending`: gris — "Pendiente"
- `in_progress`: indigo — "En curso"
- `completed`: verde — "Completada"
- `cancelled`: rojo — "Cancelada"

### Componente `GoalForm`

**Archivo:** `src/components/coach/GoalForm.tsx`

**Props:**
```ts
interface GoalFormProps {
  clientId:  string
  onClose:   () => void
}
```

**Formulario (modal oscuro):**
1. `title` — input texto, requerido, placeholder "Ej: Fondo de emergencia"
2. `description` — textarea, opcional, placeholder "Describe el objetivo…"
3. `target_amount` — input número, opcional, placeholder "0" (COP)
4. `target_date` — date input, opcional

**Comportamiento:**
- `useTransition` + llama `createGoal()`
- Al éxito: cierra el modal (llama `onClose`)
- Al error: muestra mensaje en rojo dentro del modal
- Botón "Guardar" deshabilitado mientras `isPending`

### Modificación de `/coach/clients/[id]/page.tsx`

Agregar tab "Metas" junto al tab existente "Sesiones". El server component consulta `goals` del cliente y los pasa como prop a `GoalList`.

```ts
const { data: goals } = await supabase
  .from("goals")
  .select("*")
  .eq("client_id", id)
  .order("created_at", { ascending: false })
```

---

## Surface B — Cliente: `/app/goals`

**Archivo:** `src/app/app/goals/page.tsx` — server component

**Data fetch:**
1. Obtener `user` → `profile` → `client_profiles.id`
2. Query `goals` WHERE `client_id = clientProfile.id` ORDER BY `created_at DESC`
3. Renderiza `GoalBoard` con los goals

**Componente `GoalBoard`:**

**Archivo:** `src/components/client/GoalBoard.tsx` — client component

**Props:**
```ts
interface GoalBoardProps {
  goals: Goal[]
}
```

**Agrupación por estado (orden de visualización):**
1. `in_progress` — borde izquierdo indigo `#6366f1`
2. `pending` — borde izquierdo slate `#475569`
3. `completed` — borde izquierdo verde `#34d399`
4. `cancelled` — no se muestra (oculto para el cliente)

**Por cada meta:**
- Título (slate-100)
- Descripción si existe (slate-400, text-sm)
- Monto objetivo formateado en COP si existe (slate-300)
- Fecha límite si existe ("Meta: dd mmm yyyy")
- Botón de acción:
  - `pending` → "▶ Iniciar" (outline indigo) → llama `updateGoalStatus(id, "in_progress")`
  - `in_progress` → "✓ Marcar como completada" (outline verde) → llama `updateGoalStatus(id, "completed")`
  - `completed` → sin botón

**Estado vacío (sin metas):**
> "Tu coach aún no ha definido metas para ti."

**useTransition** por botón para deshabilitar mientras se procesa.

---

## Archivos nuevos/modificados

| Archivo | Acción |
|---------|--------|
| `src/actions/goals.ts` | Crear — `createGoal()` + `updateGoalStatus()` |
| `src/components/coach/GoalForm.tsx` | Crear — modal formulario para el coach |
| `src/components/coach/GoalList.tsx` | Crear — lista de metas en tab del coach |
| `src/app/coach/clients/[id]/page.tsx` | Modificar — agregar tab "Metas" + query goals |
| `src/app/app/goals/page.tsx` | Crear — page server component del cliente |
| `src/components/client/GoalBoard.tsx` | Crear — lista interactiva para el cliente |

---

## Lo que NO incluye este spec

- Edición de metas existentes (YAGNI)
- Eliminación de metas (YAGNI)
- `cancelled` visible para el cliente
- Porcentaje de progreso numérico (no está en el schema)
- Notificación al coach cuando el cliente completa una meta
