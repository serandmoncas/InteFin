"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"

export default function LoginPage() {
  const [email, setEmail] = useState("")
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const supabase = createClient()
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: `${window.location.origin}/auth/callback`,
      },
    })

    if (error) {
      setError(error.message)
    } else {
      setSent(true)
    }
    setLoading(false)
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#0a0f1e]">
      <div className="w-full max-w-md px-6">
        {/* Logo */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-gradient-to-br from-indigo-500 to-purple-600 mb-4">
            <span className="text-white font-bold text-lg">IF</span>
          </div>
          <h1 className="text-2xl font-bold text-slate-100">InteFin</h1>
          <p className="text-slate-400 text-sm mt-1">Inteligencia Financiera</p>
        </div>

        {/* Card */}
        <div className="bg-[#0f172a] border border-slate-800 rounded-2xl p-8">
          {sent ? (
            <div className="text-center">
              <div className="text-4xl mb-4">📧</div>
              <h2 className="text-slate-100 text-lg font-semibold mb-2">
                Revisa tu correo
              </h2>
              <p className="text-slate-400 text-sm">
                Enviamos un link de acceso a{" "}
                <span className="text-indigo-400 font-medium">{email}</span>.
                <br />
                Haz clic en el link para ingresar.
              </p>
              <button
                onClick={() => { setSent(false); setEmail("") }}
                className="mt-6 text-sm text-slate-500 hover:text-slate-300 transition-colors"
              >
                Usar otro correo
              </button>
            </div>
          ) : (
            <>
              <h2 className="text-slate-100 text-lg font-semibold mb-1">
                Iniciar sesión
              </h2>
              <p className="text-slate-400 text-sm mb-6">
                Te enviamos un link directo — sin contraseñas.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label
                    htmlFor="email"
                    className="block text-sm text-slate-300 mb-1.5"
                  >
                    Correo electrónico
                  </label>
                  <input
                    id="email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="tu@correo.com"
                    className="w-full bg-slate-800 border border-slate-700 rounded-lg px-4 py-2.5 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  />
                </div>

                {error && (
                  <p className="text-red-400 text-sm">{error}</p>
                )}

                <button
                  type="submit"
                  disabled={loading || !email}
                  className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed text-white font-medium py-2.5 px-4 rounded-lg text-sm transition-colors"
                >
                  {loading ? "Enviando..." : "Enviar link de acceso"}
                </button>
              </form>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
