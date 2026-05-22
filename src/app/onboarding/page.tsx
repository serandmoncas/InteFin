"use client"

import { useState, useTransition } from "react"
import { completeCoachOnboarding } from "@/actions/onboarding"

export default function OnboardingPage() {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState("")
  const [fullName, setFullName] = useState("")
  const [orgName, setOrgName] = useState("")

  // Auto-suggest org name from full name
  function handleNameChange(e: React.ChangeEvent<HTMLInputElement>) {
    setFullName(e.target.value)
    if (!orgName) setOrgName(e.target.value)
  }

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setError("")
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const result = await completeCoachOnboarding(formData)
      if (result?.error) setError(result.error)
    })
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <div className="w-full max-w-lg px-6">
        {/* Header */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <span className="text-white font-bold text-lg">IF</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">Bienvenido a InteFin</h1>
          <p className="text-slate-400 text-sm mt-1">Configura tu espacio de coaching en 1 minuto</p>
        </div>

        {/* Steps indicator */}
        <div className="flex items-center justify-center gap-2 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-indigo-600 flex items-center justify-center text-white text-xs font-bold">1</div>
            <span className="text-slate-300 text-sm">Tu perfil</span>
          </div>
          <div className="h-px w-8 bg-slate-700" />
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 rounded-full bg-slate-700 flex items-center justify-center text-slate-400 text-xs font-bold">2</div>
            <span className="text-slate-500 text-sm">Tus clientes</span>
          </div>
        </div>

        {/* Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8">
          <h2 className="text-slate-100 font-semibold text-base mb-1">Cuéntanos sobre ti</h2>
          <p className="text-slate-400 text-sm mb-6">
            Esta información aparecerá en tu perfil público como coach.
          </p>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label htmlFor="full_name" className="block text-sm text-slate-300 mb-1.5">
                Tu nombre completo
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={fullName}
                onChange={handleNameChange}
                placeholder="Ej: Mabel Álvarez"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
            </div>

            <div>
              <label htmlFor="org_name" className="block text-sm text-slate-300 mb-1.5">
                Nombre de tu práctica / organización
              </label>
              <input
                id="org_name"
                name="org_name"
                type="text"
                required
                value={orgName}
                onChange={(e) => setOrgName(e.target.value)}
                placeholder="Ej: Mabel Álvarez Coaching"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
              />
              <p className="text-slate-500 text-xs mt-1.5">
                Puedes usar tu nombre. Se usará para tu URL pública.
              </p>
            </div>

            {error && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !fullName || !orgName}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
            >
              {isPending ? "Creando tu espacio..." : "Continuar →"}
            </button>
          </form>
        </div>

        <p className="text-center text-slate-600 text-xs mt-6">
          ¿Eres cliente? Pídele a tu coach que te invite.
        </p>
      </div>
    </div>
  )
}
