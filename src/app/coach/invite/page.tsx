"use client"

import { useState, useTransition } from "react"
import { inviteClient } from "@/actions/coach"

export default function InvitePage() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail]         = useState("")
  const [fullName, setFullName]   = useState("")
  const [result, setResult]       = useState<{ success?: boolean; email?: string; error?: string } | null>(null)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await inviteClient(formData)
      setResult(res)
      if (res.success) { setEmail(""); setFullName("") }
    })
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Invitar cliente</h1>
        <p className="text-slate-400 text-sm mt-1">
          El cliente recibirá un email con acceso a su diagnóstico financiero.
        </p>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
        {result?.success ? (
          <div className="text-center py-4">
            <div className="text-4xl mb-3">✅</div>
            <h2 className="text-slate-100 font-semibold mb-1">Invitación enviada</h2>
            <p className="text-slate-400 text-sm">
              Se envió un link de acceso a{" "}
              <span className="text-indigo-400 font-medium">{result.email}</span>.
            </p>
            <button
              onClick={() => setResult(null)}
              className="mt-5 text-sm text-indigo-400 hover:text-indigo-300 transition-colors"
            >
              Invitar otra persona
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="full_name" className="block text-sm text-slate-300 mb-1.5">
                Nombre completo del cliente
              </label>
              <input
                id="full_name"
                name="full_name"
                type="text"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="Ej: María García"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            <div>
              <label htmlFor="email" className="block text-sm text-slate-300 mb-1.5">
                Correo electrónico
              </label>
              <input
                id="email"
                name="email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="cliente@correo.com"
                className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"
              />
            </div>

            {result?.error && (
              <div className="bg-red-950/50 border border-red-800 rounded-lg px-4 py-3">
                <p className="text-red-400 text-sm">{result.error}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isPending || !email || !fullName}
              className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
            >
              {isPending ? "Enviando invitación..." : "Enviar invitación ✉️"}
            </button>
          </form>
        )}
      </div>

      {/* How it works */}
      <div className="mt-6 bg-[#0f172a] border border-slate-800 rounded-xl p-5">
        <h3 className="text-slate-300 text-sm font-semibold mb-3">¿Cómo funciona?</h3>
        <ol className="space-y-2">
          {[
            "Tu cliente recibe un email con un link de acceso",
            "Hace clic y se registra con su correo (sin contraseña)",
            "Completa el formulario de diagnóstico financiero",
            "Tú ves sus datos aquí antes de la sesión",
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-3 text-sm text-slate-400">
              <span className="text-indigo-400 font-bold shrink-0">{i + 1}.</span>
              {step}
            </li>
          ))}
        </ol>
      </div>
    </div>
  )
}
