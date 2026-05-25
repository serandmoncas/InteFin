# UX-01 + CLIENT-01 + COACH-03 Design
**Fecha:** 2026-05-25
**Alcance:** Error login en español + Gráfica histórica de cuentas + Registro de sesiones de coaching
**Estado:** Aprobado

---

## UX-01 — Error de login en español

**Archivo:** `src/app/auth/login/page.tsx`

Cambiar una línea:
```tsx
// Antes
setError(error.message)

// Después
setError("No pudimos enviar el link. Revisa el correo e intenta de nuevo.")
```

El mensaje crudo de Supabase (en inglés) se reemplaza con un texto genérico en español. No cambia ningún flujo ni estado.

---

## CLIENT-01 — Gráfica histórica de cuentas

### Ubicación
Sección al final de `/app/dashboard` (debajo de las 4 tarjetas de cuentas).

### Componente
`src/components/client/AccountHistoryChart.tsx` — client component con Recharts.

**Props:**
```ts
interface AccountHistoryChartProps {
  snapshots: AccountSnapshot[]
}
```

**Visualización:**
- `AreaChart` de Recharts con 4 `<Area>` stacked=false (líneas independientes)
- Eje X: meses (`snapshot_month` → "Ene 2026", "Feb 2026"…)
- Eje Y: montos en COP, abreviados ("$48M", "$2.5M")
- Colores fijos por cuenta:
  - `imprevisto`: `#f87171` (rojo)
  - `oxigeno`: `#fb923c` (naranja)
  - `retiro`: `#a78bfa` (violeta)
  - `inversiones`: `#34d399` (verde)
- Leyenda inferior con los 4 nombres en español
- Tooltip al hover: muestra los 4 montos del mes
- Fondo transparente (dark theme integrado)
- Responsivo: `<ResponsiveContainer width="100%" height={220}`

**Estado vacío:** si `snapshots.length === 0`, mostrar placeholder:
> "Aquí verás tu evolución una vez que registres tu primer saldo."

**Últimos 12 meses:** filtrar en el server component, no en el cliente.

### Data flow
`/app/dashboard` (server component) → query a `account_snapshots` filtrado por `organization_id` y los `account_id` del cliente → ordena por `snapshot_month` ASC → pasa como prop a `AccountHistoryChart`.

La query une `account_snapshots` con `financial_accounts` para obtener el `account_type` de cada snapshot.

### Formato del dato esperado por el componente
```ts
// Recharts necesita un array de objetos por mes
type ChartPoint = {
  month: string        // "Ene 2026"
  imprevisto: number
  oxigeno: number
  retiro: number
  inversiones: number
}
```
La transformación `AccountSnapshot[] → ChartPoint[]` se hace en el componente con una función `buildChartData()`.

---

## COACH-03 — Registro de sesiones

### Superficie A: Tab en `/coach/clients/[id]`

Nueva tab "Sesiones" en el perfil del cliente (junto a las tabs existentes).

**Lista de sesiones:**
- Orden cronológico inverso (más reciente primero)
- Columnas: Sesión #, Fecha, Resumen (truncado a 80 chars), Estado (badge)
- Botón "+ Nueva sesión" en el encabezado del tab → abre `SessionModal`

**`SessionModal`:**
- Modal con overlay, dark theme
- Formulario de 4 campos:
  1. `session_date` — date input, requerido
  2. `notes` — textarea (label: "Notas privadas"), opcional
  3. `summary` — textarea (label: "Resumen para el cliente"), opcional
  4. `deliverables` — lista dinámica de strings con "+ Agregar tarea" / botón X para eliminar
- Botón "Guardar sesión" → llama a `createSession` server action
- Botón "Cancelar" → cierra modal sin guardar

### Superficie B: `/coach/sessions`

Nueva página global de sesiones.

**Layout:** tabla con columnas: Cliente, Fecha, Sesión #, Resumen (truncado).

**Filtro:** dropdown "Filtrar por cliente" → filtra la tabla en cliente (sin re-fetch).

**Sin paginación** por ahora.

**Navbar:** agregar "Sesiones" al sidebar de `/coach/layout.tsx`.

### Server Action: `src/actions/sessions.ts`

```ts
export async function createSession(formData: FormData): Promise<{ error?: string }>
```

**Lógica:**
1. Verificar autenticación + obtener `organization_id` y `coach_id`
2. Calcular `session_number`: `SELECT MAX(session_number) FROM coaching_sessions WHERE client_id = ? → + 1`
3. Parsear `deliverables` del form como JSON array de strings
4. Insert en `coaching_sessions`
5. Retornar `{ error? }` — el componente decide si revalidar o mostrar error

**Revalidación:** `revalidatePath("/coach/clients/[id]")` + `revalidatePath("/coach/sessions")`

### Archivos nuevos/modificados

| Archivo | Acción |
|---------|--------|
| `src/actions/sessions.ts` | Crear — `createSession()` |
| `src/components/coach/SessionModal.tsx` | Crear — formulario en modal |
| `src/components/coach/SessionList.tsx` | Crear — lista de sesiones |
| `src/app/coach/clients/[id]/page.tsx` | Modificar — agregar tab Sesiones |
| `src/app/coach/sessions/page.tsx` | Crear — vista global |
| `src/app/coach/layout.tsx` | Modificar — agregar "Sesiones" al sidebar |

---

## Lo que NO incluye este spec

- Edición de sesiones existentes (YAGNI — crear es suficiente por ahora)
- Vista de sesiones para el cliente en `/app/sessions` (backlog separado)
- Paginación en `/coach/sessions`
- Notificación por email al cliente tras cada sesión
