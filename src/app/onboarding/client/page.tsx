"use client"

import { useState, useTransition } from "react"
import { saveClientDiagnostic, type DiagnosticData } from "@/actions/diagnostic"

const STEPS = ["Tu perfil", "Situación actual", "Activos y deudas", "Tus metas"]

const GOALS = [
  "Salir de deudas",
  "Empezar a ahorrar",
  "Comprar vivienda",
  "Invertir",
  "Jubilación anticipada",
  "Otro",
]

const HORIZONS = ["6 meses", "1 año", "3 años", "5+ años"]

const EMPTY: DiagnosticData = {
  full_name: "", birth_year: 1990, occupation: "",
  living_situation: "solo", dependents_count: 0,
  has_health_insurance: false, has_pension: false,
  monthly_income: 0, monthly_expenses: 0, current_savings: 0,
  has_life_insurance: false,
  liquid_assets: 0, large_assets: 0, total_debts: 0, debt_types: "",
  primary_goal: "", biggest_fear: "", goal_horizon: "1 año",
}

export default function ClientOnboardingPage() {
  const [step, setStep]   = useState(0)
  const [data, setData]   = useState<DiagnosticData>(EMPTY)
  const [error, setError] = useState("")
  const [isPending, startTransition] = useTransition()

  function set<K extends keyof DiagnosticData>(key: K, value: DiagnosticData[K]) {
    setData((d) => ({ ...d, [key]: value }))
  }

  function handleSubmit() {
    setError("")
    startTransition(async () => {
      const result = await saveClientDiagnostic(data)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen bg-[#0a0f1e] flex items-start justify-center pt-10 pb-16 px-4">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-3">
            <span className="text-white font-bold text-sm">IF</span>
          </div>
          <h1 className="text-xl font-bold text-slate-100">Tu diagnóstico financiero</h1>
          <p className="text-slate-400 text-sm mt-1">Complétalo antes de tu sesión con el coach</p>
        </div>

        {/* Step indicator */}
        <div className="flex items-center gap-1 mb-8">
          {STEPS.map((label, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div className={`h-1 w-full rounded-full transition-colors ${i <= step ? "bg-indigo-500" : "bg-slate-800"}`} />
              <span className={`text-xs hidden sm:block ${i === step ? "text-indigo-400" : "text-slate-600"}`}>
                {label}
              </span>
            </div>
          ))}
        </div>

        {/* Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-7">
          <h2 className="text-slate-100 font-semibold mb-5">
            {step + 1}. {STEPS[step]}
          </h2>

          {/* SECTION 1 */}
          {step === 0 && (
            <div className="space-y-4">
              <Field label="Nombre completo">
                <input className={input} value={data.full_name}
                  onChange={(e) => set("full_name", e.target.value)} placeholder="Tu nombre completo" />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Field label="Año de nacimiento">
                  <input className={input} type="number" value={data.birth_year}
                    onChange={(e) => set("birth_year", +e.target.value)} min={1940} max={2010} />
                </Field>
                <Field label="Ocupación">
                  <input className={input} value={data.occupation}
                    onChange={(e) => set("occupation", e.target.value)} placeholder="Ej: Emprendedor" />
                </Field>
              </div>
              <Field label="¿Con quién vives?">
                <div className="grid grid-cols-3 gap-2">
                  {(["solo", "pareja", "familia"] as const).map((v) => (
                    <button key={v} type="button" onClick={() => set("living_situation", v)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors capitalize ${
                        data.living_situation === v
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}>{v}</button>
                  ))}
                </div>
              </Field>
              <Field label="Número de dependientes">
                <input className={input} type="number" value={data.dependents_count}
                  onChange={(e) => set("dependents_count", +e.target.value)} min={0} max={20} />
              </Field>
              <div className="grid grid-cols-2 gap-4">
                <Toggle label="¿Cotizas salud?" value={data.has_health_insurance}
                  onChange={(v) => set("has_health_insurance", v)} />
                <Toggle label="¿Cotizas pensión?" value={data.has_pension}
                  onChange={(v) => set("has_pension", v)} />
              </div>
            </div>
          )}

          {/* SECTION 2 */}
          {step === 1 && (
            <div className="space-y-4">
              <Field label="Ingreso mensual promedio (COP)">
                <MoneyInput value={data.monthly_income} onChange={(v) => set("monthly_income", v)} />
              </Field>
              <Field label="Gastos fijos mensuales (COP)">
                <MoneyInput value={data.monthly_expenses} onChange={(v) => set("monthly_expenses", v)} />
              </Field>
              <Field label="Ahorros actuales (COP)">
                <MoneyInput value={data.current_savings} onChange={(v) => set("current_savings", v)} />
              </Field>
              <Toggle label="¿Tienes seguro de vida activo?" value={data.has_life_insurance}
                onChange={(v) => set("has_life_insurance", v)} />
              {data.monthly_income > 0 && (
                <div className="bg-indigo-950/40 border border-indigo-900 rounded-lg px-4 py-3 text-sm text-indigo-300">
                  💡 Tu fondo de emergencia ideal sería{" "}
                  <strong>{formatCOP(data.monthly_income)}</strong> y tu oxígeno{" "}
                  <strong>{formatCOP(data.monthly_income * 6)}</strong>.
                </div>
              )}
            </div>
          )}

          {/* SECTION 3 */}
          {step === 2 && (
            <div className="space-y-4">
              <Field label="Activos líquidos — efectivo, cuentas bancarias (COP)">
                <MoneyInput value={data.liquid_assets} onChange={(v) => set("liquid_assets", v)} />
              </Field>
              <Field label="Activos de valor alto — finca, carro, moto, equipo (COP)">
                <MoneyInput value={data.large_assets} onChange={(v) => set("large_assets", v)} />
              </Field>
              <Field label="Total deudas — bancos, familia, tarjetas (COP)">
                <MoneyInput value={data.total_debts} onChange={(v) => set("total_debts", v)} />
              </Field>
              <Field label="Tipo de deudas (opcional)">
                <input className={input} value={data.debt_types}
                  onChange={(e) => set("debt_types", e.target.value)}
                  placeholder="Ej: banco Davivienda, préstamo familiar" />
              </Field>
              {(data.liquid_assets + data.large_assets) > 0 && (
                <div className="bg-slate-800 rounded-lg px-4 py-3 text-sm text-slate-300">
                  Patrimonio neto estimado:{" "}
                  <strong className={data.liquid_assets + data.large_assets >= data.total_debts ? "text-emerald-400" : "text-red-400"}>
                    {formatCOP(data.liquid_assets + data.large_assets - data.total_debts)}
                  </strong>
                </div>
              )}
            </div>
          )}

          {/* SECTION 4 */}
          {step === 3 && (
            <div className="space-y-4">
              <Field label="¿Cuál es tu objetivo financiero principal?">
                <div className="grid grid-cols-2 gap-2">
                  {GOALS.map((g) => (
                    <button key={g} type="button" onClick={() => set("primary_goal", g)}
                      className={`py-2 px-3 rounded-lg text-sm text-left transition-colors ${
                        data.primary_goal === g
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}>{g}</button>
                  ))}
                </div>
              </Field>
              <Field label="¿Qué te genera más angustia financiera hoy?">
                <textarea className={`${input} resize-none`} rows={3} value={data.biggest_fear}
                  onChange={(e) => set("biggest_fear", e.target.value)}
                  placeholder="Cuéntanos con tus palabras..." />
              </Field>
              <Field label="¿En cuánto tiempo quieres lograrlo?">
                <div className="grid grid-cols-2 gap-2">
                  {HORIZONS.map((h) => (
                    <button key={h} type="button" onClick={() => set("goal_horizon", h)}
                      className={`py-2 rounded-lg text-sm font-medium transition-colors ${
                        data.goal_horizon === h
                          ? "bg-indigo-600 text-white"
                          : "bg-slate-800 text-slate-400 hover:text-slate-200"
                      }`}>{h}</button>
                  ))}
                </div>
              </Field>
            </div>
          )}

          {error && (
            <div className="mt-4 bg-red-950/50 border border-red-800 rounded-lg px-4 py-3">
              <p className="text-red-400 text-sm">{error}</p>
            </div>
          )}

          {/* Navigation */}
          <div className="flex items-center justify-between mt-7 pt-5 border-t border-slate-800">
            <button
              type="button"
              onClick={() => setStep((s) => s - 1)}
              disabled={step === 0}
              className="text-slate-400 hover:text-slate-200 text-sm disabled:opacity-0 transition-colors"
            >
              ← Atrás
            </button>

            {step < STEPS.length - 1 ? (
              <button
                type="button"
                onClick={() => setStep((s) => s + 1)}
                disabled={!canAdvance(step, data)}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
              >
                Continuar →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isPending || !canAdvance(step, data)}
                className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium px-6 py-2 rounded-lg text-sm transition-colors"
              >
                {isPending ? "Guardando..." : "Ver mi diagnóstico ✓"}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-slate-600 text-xs mt-4">
          Paso {step + 1} de {STEPS.length}
        </p>
      </div>
    </div>
  )
}

// ── Helpers ────────────────────────────────────────────────

const input = "w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div>
      <label className="block text-sm text-slate-300 mb-1.5">{label}</label>
      {children}
    </div>
  )
}

function Toggle({ label, value, onChange }: { label: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <button type="button" onClick={() => onChange(!value)}
      className={`w-full flex items-center justify-between px-4 py-2.5 rounded-lg border text-sm transition-colors ${
        value ? "bg-indigo-600/20 border-indigo-500 text-indigo-300" : "bg-slate-800 border-slate-700 text-slate-400"
      }`}>
      <span>{label}</span>
      <span className={`w-5 h-5 rounded-full border-2 flex items-center justify-center text-xs ${
        value ? "bg-indigo-500 border-indigo-400 text-white" : "border-slate-600"
      }`}>{value ? "✓" : ""}</span>
    </button>
  )
}

function MoneyInput({ value, onChange }: { value: number; onChange: (v: number) => void }) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 text-sm">$</span>
      <input type="number" min={0} value={value || ""}
        onChange={(e) => onChange(+e.target.value || 0)}
        placeholder="0"
        className="w-full bg-slate-800 border border-slate-700 rounded-lg pl-7 pr-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition" />
    </div>
  )
}

function formatCOP(n: number): string {
  return new Intl.NumberFormat("es-CO", { style: "currency", currency: "COP", maximumFractionDigits: 0 }).format(n)
}

function canAdvance(step: number, data: DiagnosticData): boolean {
  if (step === 0) return !!data.full_name && !!data.occupation
  if (step === 1) return data.monthly_income > 0
  if (step === 3) return !!data.primary_goal && !!data.biggest_fear
  return true
}
