"use client"

import { useState, useTransition } from "react"
import { inviteClient, type InviteResult } from "@/actions/coach"

export default function InvitePage() {
  const [isPending, startTransition] = useTransition()
  const [email, setEmail]       = useState("")
  const [fullName, setFullName] = useState("")
  const [result, setResult]     = useState<InviteResult | null>(null)
  const [copied, setCopied]     = useState(false)

  function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setResult(null)
    setCopied(false)
    const formData = new FormData(e.currentTarget)
    startTransition(async () => {
      const res = await inviteClient(formData)
      setResult(res)
      if (res.success) { setEmail(""); setFullName("") }
    })
  }

  function copyLink() {
    if (!result?.inviteLink) return
    navigator.clipboard.writeText(result.inviteLink)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  function shareWhatsApp() {
    if (!result?.inviteLink) return
    const text = encodeURIComponent(
      `¡Hola! Te invité a InteFin para hacer tu diagnóstico financiero. Entra aquí: ${result.inviteLink}`
    )
    window.open(`https://wa.me/?text=${text}`, "_blank")
  }

  return (
    <div className="max-w-lg">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-slate-100">Invitar cliente</h1>
        <p className="text-slate-400 text-sm mt-1">
          Le enviamos un email con su link de acceso. También puedes compartirlo tú directamente.
        </p>
      </div>

      <div className="bg-[#0f172a] border border-slate-800 rounded-xl p-6">
        {result?.success ? (
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="text-2xl">📨</span>
              <h2 className="text-slate-100 font-semibold">Invitación enviada</h2>
            </div>

            <div className="bg-emerald-950/30 border border-emerald-900/40 rounded-lg px-3 py-2.5 mb-4">
              <p className="text-emerald-300 text-sm">
                ✓ Email enviado a <span className="font-semibold">{result.email}</span>
              </p>
              <p className="text-emerald-400/70 text-xs mt-0.5">
                Revisa también la carpeta de spam por si acaso.
              </p>
            </div>

            <p className="text-slate-400 text-xs mb-2">
              ¿Prefieres compartirlo tú directamente? Usa este link:
            </p>

            {/* Link box */}
            <div className="bg-slate-900 border border-slate-700 rounded-lg p-3 mb-3">
              <p className="text-slate-300 text-xs font-mono break-all leading-relaxed">
                {result.inviteLink}
              </p>
            </div>

            {/* Share actions */}
            <div className="grid grid-cols-2 gap-2 mb-4">
              <button
                onClick={copyLink}
                className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                {copied ? "✓ Copiado" : "📋 Copiar link"}
              </button>
              <button
                onClick={shareWhatsApp}
                className="bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-medium px-4 py-2.5 rounded-lg transition-colors flex items-center justify-center gap-2"
              >
                💬 WhatsApp
              </button>
            </div>

            <div className="bg-amber-950/40 border border-amber-900/50 rounded-lg px-3 py-2.5 text-xs text-amber-300/80 mb-4">
              ⚠️ El link funciona <strong>una sola vez</strong> y expira en 1 hora. Si tu cliente no lo usa a tiempo, vuelve a invitarlo.
            </div>

            <button
              onClick={() => setResult(null)}
              className="w-full text-sm text-indigo-400 hover:text-indigo-300 transition-colors py-2"
            >
              Invitar a otra persona →
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
            "Le enviamos un email a tu cliente con su link de acceso",
            "Si prefieres, también puedes compartirlo por WhatsApp",
            "Tu cliente hace clic, entra automáticamente",
            "Completa el formulario de diagnóstico antes de la sesión",
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
