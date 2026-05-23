"use client"

import { useState, useTransition } from "react"
import { updateOrgSettings, type OrgSettingsInput } from "@/actions/settings"

const COLORS = [
  "#6366f1", // indigo (default)
  "#8b5cf6", // violet
  "#ec4899", // pink
  "#f43f5e", // rose
  "#f59e0b", // amber
  "#10b981", // emerald
  "#06b6d4", // cyan
  "#3b82f6", // blue
]

const inputClass = "w-full bg-slate-800 border border-slate-700 rounded-lg px-3 py-2 text-slate-100 placeholder-slate-500 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 transition"

interface SettingsFormProps {
  initialValues: OrgSettingsInput
}

export function SettingsForm({ initialValues }: SettingsFormProps) {
  const [values, setValues] = useState<OrgSettingsInput>(initialValues)
  const [error, setError]   = useState("")
  const [saved, setSaved]   = useState(false)
  const [isPending, startTransition] = useTransition()

  function set<K extends keyof OrgSettingsInput>(key: K, val: OrgSettingsInput[K]) {
    setValues((v) => ({ ...v, [key]: val }))
    setSaved(false)
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError("")
    startTransition(async () => {
      const res = await updateOrgSettings(values)
      if (res.error) { setError(res.error); return }
      setSaved(true)
      setTimeout(() => setSaved(false), 3000)
    })
  }

  return (
    <form onSubmit={handleSubmit} className="bg-[#0f172a] border border-slate-800 rounded-xl p-6 space-y-5">
      {/* Tagline */}
      <div>
        <label className="block text-sm text-slate-300 mb-1.5">
          Tagline <span className="text-slate-500">(frase corta debajo de tu nombre)</span>
        </label>
        <input
          type="text"
          value={values.tagline}
          onChange={(e) => set("tagline", e.target.value)}
          maxLength={80}
          placeholder="Ej: Te ayudo a transformar tu relación con el dinero"
          className={inputClass}
        />
        <p className="text-slate-500 text-xs mt-1">{values.tagline.length}/80</p>
      </div>

      {/* Bio */}
      <div>
        <label className="block text-sm text-slate-300 mb-1.5">
          Sobre ti <span className="text-slate-500">(quién eres, tu historia)</span>
        </label>
        <textarea
          rows={5}
          value={values.bio}
          onChange={(e) => set("bio", e.target.value)}
          maxLength={500}
          placeholder="Cuenta tu historia, tu método, por qué haces lo que haces..."
          className={`${inputClass} resize-none`}
        />
        <p className="text-slate-500 text-xs mt-1">{values.bio.length}/500</p>
      </div>

      {/* Contact */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">Email de contacto</label>
          <input
            type="email"
            value={values.contact_email}
            onChange={(e) => set("contact_email", e.target.value)}
            placeholder="hola@tudominio.com"
            className={inputClass}
          />
        </div>
        <div>
          <label className="block text-sm text-slate-300 mb-1.5">
            WhatsApp <span className="text-slate-500">(con código país)</span>
          </label>
          <input
            type="tel"
            value={values.whatsapp}
            onChange={(e) => set("whatsapp", e.target.value)}
            placeholder="+57 300 123 4567"
            className={inputClass}
          />
        </div>
      </div>

      {/* Brand color */}
      <div>
        <label className="block text-sm text-slate-300 mb-2">Color de marca</label>
        <div className="flex items-center gap-2">
          {COLORS.map((c) => (
            <button
              key={c}
              type="button"
              onClick={() => set("brand_color", c)}
              className={`w-8 h-8 rounded-lg transition-transform hover:scale-110 ${
                values.brand_color === c ? "ring-2 ring-white ring-offset-2 ring-offset-[#0f172a]" : ""
              }`}
              style={{ background: c }}
              aria-label={`Color ${c}`}
            />
          ))}
        </div>
      </div>

      {/* Status + submit */}
      <div className="flex items-center justify-between pt-2 border-t border-slate-800">
        <div>
          {error && <p className="text-red-400 text-sm">{error}</p>}
          {saved && <p className="text-emerald-400 text-sm">✓ Guardado</p>}
        </div>
        <button
          type="submit"
          disabled={isPending}
          className="bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-sm font-medium px-5 py-2 rounded-lg transition-colors"
        >
          {isPending ? "Guardando..." : "Guardar cambios"}
        </button>
      </div>
    </form>
  )
}
